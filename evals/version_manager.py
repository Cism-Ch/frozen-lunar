#!/usr/bin/env python3
"""
Universal SemVer Versioning Manager
Manages release version life cycles:
- SemVer bumping (Major, Minor, Patch, pre-release tags)
- VERSION file updating (protocol specification baseline)
- package.json version updating (optional, when application is present)
- Sealing the [Unreleased] section in CHANGELOG.md with current date
- Automatic Git tagging preparation
"""

import sys
import os
import re
import json
import shutil
import argparse
import subprocess
from pathlib import Path
from datetime import datetime, timezone

# UTF-8 for Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent.parent
PACKAGE_JSON_PATH = ROOT_DIR / "package.json"
VERSION_PATH = ROOT_DIR / "VERSION"
CHANGELOG_PATH = ROOT_DIR / "CHANGELOG.md"
SYNC_TARGETS_PATH = ROOT_DIR / ".agents" / "telemetry" / "sync_targets.json"

CORE_ENGINE_DIRS = [
    "evals",
    ".agents/workflows",
    ".agents/prompts"
]

CORE_ENGINE_FILES = [
    "AGENTS.md",
    "VERSION"
]

ALLOWED_SYNC_EVAL_FILES = {
    "memory_engine.py", "reset_rsi.py", "rsi_orchestrator.py",
    "run_fullstack_eval.py", "security_audit.py", "stack_inspector.py",
    "telemetry_hook.py", "version_manager.py", "tests/test_evals.py"
}

FORBIDDEN_SYSTEM_DIR_NAMES = {
    "windows", "system32", "program files", "program files (x86)",
    "etc", "bin", "sbin", "usr", "var", ".ssh", ".gnupg", ".aws", ".gemini"
}

PROJECT_MARKERS = {
    ".git", "package.json", "pyproject.toml", "requirements.txt",
    "Cargo.toml", "go.mod", "docs/TASKS.md", "AGENTS.md"
}

EPHEMERAL_GITIGNORE_ENTRIES = [
    "evals/logs/",
    "evals/backups/",
    "backups/skills/",
    ".agents/telemetry/*.tmp",
    ".agents/telemetry/active_session.json",
    ".agents/telemetry/cognitive_state.json",
    ".agents/telemetry/sync_targets.json",
    "__pycache__/",
    "*.pyc",
]

def ensure_target_gitignore_hygiene(target_dir: Path) -> list[str]:
    """Ensures ephemeral RSI telemetry and log paths are ignored in the target project's .gitignore."""
    gitignore_path = target_dir / ".gitignore"
    if not gitignore_path.exists() or gitignore_path.is_symlink():
        return []
    try:
        content = gitignore_path.read_text(encoding="utf-8", errors="ignore")
        existing_lines = {line.strip() for line in content.splitlines()}
        missing = [entry for entry in EPHEMERAL_GITIGNORE_ENTRIES if entry not in existing_lines]
        if missing:
            prefix = "" if (not content or content.endswith("\n")) else "\n"
            block = prefix + "\n# RSI Protocol Ephemeral Telemetry & Logs\n" + "\n".join(missing) + "\n"
            gitignore_path.write_text(content + block, encoding="utf-8")
        return missing
    except Exception:
        return []

def parse_semver(version_str: str) -> tuple[int, int, int, str | None]:
    clean = version_str.lstrip("v").strip()
    match = re.match(r"^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9._-]+))?$", clean)
    if not match:
        raise ValueError(f"Invalid SemVer format: '{version_str}'")
    return int(match.group(1)), int(match.group(2)), int(match.group(3)), match.group(4)

def get_current_version() -> str:
    if VERSION_PATH.exists():
        return VERSION_PATH.read_text(encoding="utf-8").strip()
    if PACKAGE_JSON_PATH.exists():
        with open(PACKAGE_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data.get("version", "0.1.0")
    return "0.1.0"

def bump_semver(current_ver: str, bump_type: str, mention: str | None = None) -> str:
    major, minor, patch, _ = parse_semver(current_ver)
    bump_lower = bump_type.lower()

    if bump_lower == "major":
        major += 1
        minor = 0
        patch = 0
    elif bump_lower == "minor":
        minor += 1
        patch = 0
    elif bump_lower == "patch":
        patch += 1
    else:
        raise ValueError(f"Invalid bump type: '{bump_type}'")

    new_ver = f"{major}.{minor}.{patch}"
    if mention:
        clean_mention = re.sub(r"[^a-zA-Z0-9._-]", "-", mention.strip())
        new_ver = f"{new_ver}-{clean_mention}"
    return new_ver

def update_version_files(new_ver: str) -> None:
    if VERSION_PATH.exists():
        VERSION_PATH.write_text(f"{new_ver}\n", encoding="utf-8")

    if PACKAGE_JSON_PATH.exists():
        with open(PACKAGE_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        data["version"] = new_ver
        with open(PACKAGE_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write("\n")

def update_changelog(new_ver: str) -> None:
    if not CHANGELOG_PATH.exists():
        return
    content = CHANGELOG_PATH.read_text(encoding="utf-8")
    today = datetime.now().strftime("%Y-%m-%d")
    replacement = f"## [Unreleased]\n\n## [{new_ver}] - {today}"
    if re.search(r"##\s+\[Unreleased\]", content, re.IGNORECASE):
        updated = re.sub(r"##\s+\[Unreleased\]", replacement, content, count=1, flags=re.IGNORECASE)
        CHANGELOG_PATH.write_text(updated, encoding="utf-8")

def load_sync_targets() -> list[dict]:
    """Loads locally registered consumer project targets from .agents/telemetry/sync_targets.json."""
    if not SYNC_TARGETS_PATH.exists():
        return []
    try:
        data = json.loads(SYNC_TARGETS_PATH.read_text(encoding="utf-8", errors="ignore"))
        if isinstance(data, dict) and isinstance(data.get("targets"), list):
            return [t for t in data["targets"] if isinstance(t, dict) and t.get("path")]
    except Exception:
        pass
    return []

def register_sync_target(target_dir: Path, protocol_version: str) -> None:
    """Registers or updates a target consumer project path locally (git-ignored)."""
    resolved = str(target_dir.resolve())
    targets = load_sync_targets()
    now_iso = datetime.now(timezone.utc).isoformat()
    updated = False
    for t in targets:
        if os.path.normcase(t.get("path", "")) == os.path.normcase(resolved):
            t["name"] = target_dir.name
            t["last_synced_at"] = now_iso
            t["protocol_version"] = protocol_version
            updated = True
            break
    if not updated:
        targets.append({
            "name": target_dir.name,
            "path": resolved,
            "last_synced_at": now_iso,
            "protocol_version": protocol_version,
        })
    SYNC_TARGETS_PATH.parent.mkdir(parents=True, exist_ok=True)
    SYNC_TARGETS_PATH.write_text(json.dumps({"targets": targets}, indent=2) + "\n", encoding="utf-8")

def list_sync_targets(print_report: bool = True) -> list[dict]:
    """Lists locally registered sync target workspaces and checks disk availability."""
    targets = load_sync_targets()
    if print_report:
        print("=== [RSI SYNC TARGETS REGISTRY] ===")
        if not targets:
            print("[INFO] No local sync targets registered yet.")
            print("       Ask the user for the workspace path of each project to sync, then run:")
            print("       python evals/rsi_orchestrator.py --sync-to <TARGET_DIR>")
        else:
            for t in targets:
                p = Path(t["path"])
                exists = p.exists()
                ver_file = p / "VERSION"
                target_ver = ver_file.read_text(encoding="utf-8").strip() if ver_file.exists() else "UNKNOWN"
                state = "OK" if exists else "MISSING_ON_DISK"
                print(f"  - [{state}] {t.get('name', p.name)}: {t['path']} (Target VERSION: v{target_ver}, Last synced: {t.get('last_synced_at', 'never')})")
        print("-" * 50)
    return targets

def sync_all_targets() -> bool:
    """Synchronizes protocol updates to all existing registered consumer targets."""
    targets = load_sync_targets()
    if not targets:
        print("[INFO] No local sync targets registered. Run --sync-to <TARGET_DIR> first.")
        return False
    all_ok = True
    for t in targets:
        p = Path(t["path"])
        if not p.exists():
            print(f"[WARN] Skipping missing target directory: {p}")
            all_ok = False
            continue
        sync_protocol_to_target(str(p), init_mode=False)
    return all_ok

def validate_safe_target_dir(target_dir: Path, init_mode: bool = False) -> tuple[bool, str]:
    """Verifies that target_dir is a safe project directory (anti-overwrite & anti-symlink guard)."""
    if target_dir.is_symlink():
        return False, f"Refusing symlink target directory: {target_dir}"
    resolved = target_dir.resolve()
    if resolved == ROOT_DIR.resolve():
        return False, "Cannot sync protocol onto the source protocol repository itself."
    if resolved.parent == resolved or resolved == Path.home().resolve():
        return False, f"Refusing filesystem root or home directory as sync target: {resolved}"
    for part in resolved.parts:
        if part.lower() in FORBIDDEN_SYSTEM_DIR_NAMES:
            return False, f"Refusing protected system or credential directory segment '{part}' in path: {resolved}"
    if not init_mode:
        if not resolved.exists():
            return False, f"Target directory does not exist: {resolved}"
        if not any((resolved / marker).exists() for marker in PROJECT_MARKERS):
            return False, (
                f"Target directory has no project markers ({', '.join(sorted(PROJECT_MARKERS))}). "
                "Use --init-target for new projects."
            )
    return True, ""

def sync_protocol_to_target(target_path_str: str, init_mode: bool = False) -> None:
    raw_target = Path(target_path_str)
    safe, reason = validate_safe_target_dir(raw_target, init_mode=init_mode)
    if not safe:
        print(f"[Error] {reason}")
        sys.exit(1)
    target_dir = raw_target.resolve()
    if not target_dir.exists() and init_mode:
        target_dir.mkdir(parents=True, exist_ok=True)
        print(f"[Init] Created target project root: {target_dir}")

    print(f"=== [RSI PROTOCOL SYNC] ===")
    print(f"Source Protocol : {ROOT_DIR} (v{get_current_version()})")
    print(f"Target Project  : {target_dir}")
    print(f"Mode            : {'INITIALIZE + SYNC' if init_mode else 'UPDATE / SYNC'}")
    print("-" * 50)

    # 1. Sync Core Engine Directories
    for rel_dir in CORE_ENGINE_DIRS:
        src = ROOT_DIR / rel_dir
        dst = target_dir / rel_dir
        if not src.exists():
            continue
        dst.mkdir(parents=True, exist_ok=True)

        for root, dirs, files in os.walk(src):
            dirs[:] = [d for d in dirs if d not in ("__pycache__", ".pytest_cache") and not (Path(root) / d).is_symlink()]
            rel_root = Path(root).relative_to(src)
            target_subdir = dst / rel_root
            target_subdir.mkdir(parents=True, exist_ok=True)

            for f in files:
                if f.endswith((".tmp", ".pyc")) or f in ("active_session.json", "cognitive_state.json", "sync_targets.json"):
                    continue
                src_file = Path(root) / f
                if src_file.is_symlink():
                    continue
                if rel_dir == "evals":
                    rel_file_posix = str(src_file.relative_to(src)).replace("\\", "/")
                    if rel_file_posix not in ALLOWED_SYNC_EVAL_FILES:
                        continue
                dst_file = target_subdir / f
                if dst_file.is_symlink():
                    continue
                shutil.copy2(src_file, dst_file)
        print(f"[OK] Synced engine directory: {rel_dir}/")

    # 2. Sync Core Engine Files
    for rel_file in CORE_ENGINE_FILES:
        src = ROOT_DIR / rel_file
        dst = target_dir / rel_file
        if src.exists():
            shutil.copy2(src, dst)
            print(f"[OK] Synced core contract file: {rel_file}")

    # 3. Base Rules (system_core.md and fullstack_playbook.md) - only if missing or update
    target_rules_dir = target_dir / ".agents" / "rules"
    target_rules_dir.mkdir(parents=True, exist_ok=True)
    for rule_file in ["system_core.md", "fullstack_playbook.md"]:
        src = ROOT_DIR / ".agents" / "rules" / rule_file
        dst = target_rules_dir / rule_file
        if src.exists():
            shutil.copy2(src, dst)
            print(f"[OK] Synced base rule playbook: .agents/rules/{rule_file}")

    # 4. Target Specific Structures (Never overwritten if they exist)
    target_modules_dir = target_rules_dir / "modules"
    target_modules_dir.mkdir(parents=True, exist_ok=True)

    # If target has no modules yet, seed base modules from protocol
    src_modules_dir = ROOT_DIR / ".agents" / "rules" / "modules"
    if src_modules_dir.exists():
        for mod in src_modules_dir.glob("*.md"):
            dst_mod = target_modules_dir / mod.name
            if not dst_mod.exists():
                shutil.copy2(mod, dst_mod)
                print(f"[Init] Seeded procedural rule module: {mod.name}")

    target_telemetry_dir = target_dir / ".agents" / "telemetry"
    target_telemetry_dir.mkdir(parents=True, exist_ok=True)

    target_archive_dir = target_dir / "docs" / "archive" / "tasks"
    target_archive_dir.mkdir(parents=True, exist_ok=True)

    target_tasks = target_dir / "docs" / "TASKS.md"
    if not target_tasks.exists():
        # Create minimal initial SSOT TASKS.md for target project
        initial_tasks_content = (
            "# [SSOT] TASKS.md - Central Registry & Task Tracker\n\n"
            "> Single Source of Truth (SSOT) for orchestrating technical and functional tasks.\n"
            "> Absolute rule for AI Agents: Consult before every task, update immediately on completion.\n"
            "> Strict ceiling: 250 lines.\n\n"
            "---\n\n"
            "## Synthetic Kanban View\n\n"
            "```\n"
            "+-------------------------+  +-------------------------+  +-------------------------+\n"
            "| [>] IN PROGRESS (SP 01) |  |   [?] FUTURE BACKLOG    |  |       [X] ARCHIVES      |\n"
            "+-------------------------+  +-------------------------+  +-------------------------+\n"
            "| [ ] TASK-INIT-01        |  | [ ] Future task 1       |  |                         |\n"
            "+-------------------------+  +-------------------------+  +-------------------------+\n"
            "```\n\n"
            "---\n\n"
            "## Active Sprint 01: Project Setup & Initialization\n\n"
            "- [ ] **`TASK-INIT-01` - Initial Project Scaffolding & Setup**\n"
            "  - **Priority:** HIGH\n"
            "  - **Target files:** `README.md`, `docs/TASKS.md`\n"
            "  - **Acceptance criteria:**\n"
            "    - [ ] `TASK-INIT-01.01`: Project requirements and core architecture definition.\n"
            "    - [ ] `TASK-INIT-01.02`: Validate deterministic baseline with `python evals/run_fullstack_eval.py --quick`.\n\n"
            "---\n\n"
            "## Completed Tasks History\n\n"
            "| Date | Task ID | Title & Description | Created / Modified Files |\n"
            "| :--- | :--- | :--- | :--- |\n"
        )
        target_tasks.write_text(initial_tasks_content, encoding="utf-8")
        print(f"[Init] Created target SSOT: docs/TASKS.md")
    else:
        print(f"[Preserve] Kept existing target backlog: docs/TASKS.md (SSOT intact)")

    # 5. Automatically register standard RSI scripts in target package.json if present
    target_pkg = target_dir / "package.json"
    if target_pkg.exists():
        try:
            with open(target_pkg, "r", encoding="utf-8") as f:
                pkg_data = json.load(f)
            scripts = pkg_data.setdefault("scripts", {})
            standard_rsi_scripts = {
                "rsi:pulse": "python evals/rsi_orchestrator.py --pulse",
                "rsi:eval": "python evals/run_fullstack_eval.py --quick",
                "rsi:eval:full": "python evals/run_fullstack_eval.py",
                "rsi:scope": "python evals/rsi_orchestrator.py --scope",
                "rsi:guardrail": "python evals/rsi_orchestrator.py --guardrail",
                "rsi:map": "python evals/stack_inspector.py --map",
                "rsi:memory": "python evals/memory_engine.py --audit",
                "rsi:security": "python evals/security_audit.py",
                "rsi:verify": "python evals/telemetry_hook.py --verify-contract",
            }
            added_scripts = []
            for sc_name, sc_cmd in standard_rsi_scripts.items():
                if sc_name not in scripts:
                    scripts[sc_name] = sc_cmd
                    added_scripts.append(sc_name)
            if added_scripts:
                with open(target_pkg, "w", encoding="utf-8") as f:
                    json.dump(pkg_data, f, indent=2, ensure_ascii=False)
                    f.write("\n")
                print(f"[OK] Injected {len(added_scripts)} standard RSI script(s) into package.json: {', '.join(added_scripts)}")
            else:
                print(f"[OK] Standard RSI scripts already present in package.json")
        except Exception as e:
            print(f"[WARN] Could not update target package.json: {e}")

    # 6. Ensure ephemeral RSI logs/telemetry are ignored in target .gitignore
    added_ignores = ensure_target_gitignore_hygiene(target_dir)
    if added_ignores:
        print(f"[OK] Added {len(added_ignores)} ephemeral RSI rule(s) to target .gitignore: {', '.join(added_ignores)}")

    register_sync_target(target_dir, get_current_version())

    print("-" * 50)
    print(f"[SUCCESS] Agentic-RSI-Protocol engine synchronized successfully to:")
    print(f"          {target_dir}")
    print(f"Next steps in target workspace:")
    print(f"  1. cd {target_dir}")
    print(f"  2. python evals/rsi_orchestrator.py --pulse")
    print(f"  3. python evals/run_fullstack_eval.py --quick")

def main():
    parser = argparse.ArgumentParser(description="Universal SemVer & Protocol Target Sync Manager")
    parser.add_argument("--bump", choices=["major", "minor", "patch"], help="SemVer bump increment level")
    parser.add_argument("--mention", help="Optional pre-release tag (e.g. beta, hotfix)")
    parser.add_argument("--sync-to", metavar="TARGET_DIR", help="Synchronize or update protocol engine into a target project")
    parser.add_argument("--init-target", metavar="TARGET_DIR", help="Initialize protocol structure and sync into a new target project")
    parser.add_argument("--sync-targets", action="store_true", help="List locally registered consumer target projects")
    parser.add_argument("--sync-all", action="store_true", help="Synchronize protocol to all locally registered target projects")
    args = parser.parse_args()

    if args.sync_targets:
        list_sync_targets(print_report=True)
        return

    if args.sync_all:
        ok = sync_all_targets()
        sys.exit(0 if ok else 1)

    if args.sync_to:
        sync_protocol_to_target(args.sync_to, init_mode=False)
        return

    if args.init_target:
        sync_protocol_to_target(args.init_target, init_mode=True)
        return

    if args.bump:
        curr = get_current_version()
        next_ver = bump_semver(curr, args.bump, args.mention)
        print(f"[SemVer Bump] {curr} -> {next_ver}")
        update_version_files(next_ver)
        update_changelog(next_ver)
        print("[OK] Version and CHANGELOG updated successfully.")
        return

    parser.print_help()

if __name__ == "__main__":
    main()
