#!/usr/bin/env python3
"""
Static Security Audit & Secret Leak Detector
- Checks for hardcoded API keys, tokens, private certificates, and secrets
- Validates .gitignore airtightness (.env*, private keys, caches)
- Enforces strict ASCII & Emoji Hygiene to prevent terminal/encoding crashes
- Inspects permissions and conformance to RSI security guardrails
"""

import sys
import re
import os
import json
import subprocess
from pathlib import Path

# Fix Windows console UTF-8 encoding
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent.parent

SECRET_PATTERNS = [
    (re.compile(r'-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----'), "Private Key (RSA/EC/SSH)"),
    (re.compile(r'sk-[a-zA-Z0-9]{20,}'), "Secret Key (OpenAI/Stripe style)"),
    (re.compile(r'AKIA[0-9A-Z]{16}'), "AWS Access Key ID"),
    (re.compile(r'ghp_[a-zA-Z0-9]{36}'), "GitHub Personal Access Token"),
    (re.compile(r'xox[baprs]-[0-9a-zA-Z]{10,48}'), "Slack API Token"),
    (re.compile(r'(?:postgres|postgresql|mysql|mongodb\+srv):\/\/[^\s:]+:[^\s@]+@[^\s\/]+'), "Database URI with hardcoded password"),
    (re.compile(r'(?i:(?:api_key|secret_key|private_key|auth_token)\s*=\s*["\'][a-zA-Z0-9_\-\.]{16,}["\'])'), "Hardcoded Auth Secret")
]
COMBINED_SECRET_RE = re.compile("|".join(f"(?:{p.pattern})" for p, _ in SECRET_PATTERNS))

IGNORE_DIRS = {
    '.git', 'node_modules', '__pycache__', '.venv', 'venv', 'dist', 'build',
    '.next', 'playwright-report', 'test-results', '.turbo', '.cache',
    'logs', 'backups', 'coverage', '.vercel', '.mypy_cache', '.pytest_cache', 'out'
}

SECRET_SKIP_FILENAMES = {
    "security_audit.py", "trajectory_latest.json",
    "cognitive_state.json", "active_session.json", "sync_targets.json",
    "pnpm-lock.yaml", "package-lock.json", "yarn.lock",
    "bun.lock", "bun.lockb", "poetry.lock", "Cargo.lock"
}
BINARY_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico",
    ".woff", ".woff2", ".ttf", ".eot", ".otf",
    ".pdf", ".zip", ".gz", ".tar", ".exe", ".dll", ".so", ".dylib",
    ".pyc", ".sqlite", ".db", ".mp4", ".mp3"
}
MAX_SECRET_SCAN_BYTES = 1_048_576

def audit_gitignore() -> list[str]:
    issues = []
    gitignore = ROOT_DIR / ".gitignore"
    if not gitignore.exists():
        issues.append("Missing .gitignore file!")
        return issues

    content = gitignore.read_text(encoding="utf-8", errors="replace")
    essential_rules = [".env", "*.pem", "*.key", "node_modules"]
    for rule in essential_rules:
        if rule not in content:
            issues.append(f"Missing essential security rule in .gitignore: '{rule}'")
    return issues

def is_gitignored(rel_path_str: str) -> bool:
    """Checks if a file is ignored by git using git check-ignore."""
    try:
        res = subprocess.run(
            ["git", "check-ignore", "-q", rel_path_str],
            cwd=str(ROOT_DIR),
            capture_output=True,
            check=False
        )
        return res.returncode == 0
    except Exception:
        return False

DUMMY_SECRET_INDICATORS = (
    "<username>", "<password>", "<token>", "<key>",
    "user:pass", "username:password", "%s:%s",
    "YOUR_PASSWORD", "YOUR_KEY", "YOUR_API_KEY", "your-key-here",
    "sk-or-v1-your-key-here", "example.com", "dummy", "placeholder",
    "CHANGE_ME", "REPLACE_ME", "MY_SECRET", "[VOTRE-", "[YOUR-"
)
DUMMY_SECRET_LOWER = tuple(d.lower() for d in DUMMY_SECRET_INDICATORS)

def _read_text_if_scannable(path: Path, max_bytes: int | None = None) -> tuple[str | None, str | None]:
    """Reads UTF-8 text from non-binary, size-bounded files without raising."""
    try:
        size = path.stat().st_size
        if size == 0 or (max_bytes is not None and size > max_bytes):
            return None, None
        raw = path.read_bytes()
        if b"\x00" in raw[:1024]:
            return None, None
        return raw.decode("utf-8", errors="ignore"), None
    except Exception as e:
        return None, str(e)

def audit_secrets() -> list[dict]:
    findings = []
    for root, dirs, files in os.walk(ROOT_DIR):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith('.git')]
        root_path = Path(root)
        # Exclude third-party vendor skills from secret leak scans
        if "skills" in root_path.parts:
            continue
        for f in files:
            if f in SECRET_SKIP_FILENAMES:
                continue
            path = root_path / f
            if path.suffix.lower() in BINARY_EXTENSIONS:
                continue
            # Legitimate local environment files ignored by git or template files are not leaks
            if f in (".env.example", ".env.sample", ".env.template"):
                continue
            rel_str = str(path.relative_to(ROOT_DIR)).replace("\\", "/")
            if f.startswith(".env") and is_gitignored(rel_str):
                continue

            content, read_err = _read_text_if_scannable(path, max_bytes=MAX_SECRET_SCAN_BYTES)
            if read_err:
                findings.append({"file": rel_str, "line": 0, "type": "Read Error", "sample": read_err})
                continue
            # Fast C-engine whole-file pre-filter before slow per-line splitting
            if not content or not COMBINED_SECRET_RE.search(content):
                continue

            for idx, line in enumerate(content.splitlines(), start=1):
                line_low = line.lower()
                if any(dummy in line_low for dummy in DUMMY_SECRET_LOWER):
                    continue
                for pattern, label in SECRET_PATTERNS:
                    if pattern.search(line):
                        findings.append({
                            "file": rel_str,
                            "line": idx,
                            "type": label,
                            "sample": line.strip()[:60]
                        })
    return findings

def audit_ascii_hygiene() -> list[dict]:
    """Ensures that executable Python scripts are 100% pure ASCII to prevent terminal/CI encoding crashes."""
    violations = []
    check_patterns = ["evals/**/*.py"]
    scanned_files = set()

    for pat in check_patterns:
        for path in ROOT_DIR.glob(pat):
            if path.is_file() and path not in scanned_files:
                if any(part in IGNORE_DIRS for part in path.parts):
                    continue
                scanned_files.add(path)
                try:
                    content = path.read_text(encoding="utf-8", errors="ignore")
                    for idx, line in enumerate(content.splitlines(), start=1):
                        non_ascii_chars = [ch for ch in line if ord(ch) > 127]
                        if non_ascii_chars:
                            violations.append({
                                "file": str(path.relative_to(ROOT_DIR)).replace("\\", "/"),
                                "line": idx,
                                "type": "Non-ASCII Character in Python Script",
                                "sample": line.strip()[:60]
                            })
                except Exception as e:
                    violations.append({
                        "file": str(path.relative_to(ROOT_DIR)).replace("\\", "/"),
                        "line": 0,
                        "type": "Read Error",
                        "sample": str(e)
                    })
    return violations

OPERATIONAL_ANTI_PATTERNS = [
    (
        re.compile(r'(?:NEXT_PUBLIC_|VITE_|PUBLIC_|REACT_APP_)[A-Z0-9_]*(?:SECRET|PRIVATE_KEY|SERVICE_ROLE|DATABASE_URL)'),
        "Public Frontend Secret Exposure ([R-PAT-04])"
    ),
    (
        re.compile(r'new\s+PrismaClient\s*\('),
        "Non-Singleton PrismaClient Instantiation ([R-DB-02] / [R-PAT-04])"
    ),
    (
        re.compile(r'\b(?:eval|new\s+Function)\s*\('),
        "Unsafe Dynamic Code Execution ([R-PAT-04])"
    )
]
COMBINED_OPERATIONAL_RE = re.compile("|".join(f"(?:{p.pattern})" for p, _ in OPERATIONAL_ANTI_PATTERNS))

SINGLETON_ALLOWED_FILES = {"db.ts", "db.js", "prisma.ts", "prisma.js", "client.ts", "client.js"}
APP_CODE_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py"}

def audit_operational_patterns() -> list[dict]:
    """Detects operational security anti-patterns (public secret vars, non-singleton DB clients, dynamic eval)."""
    violations = []
    for root, dirs, files in os.walk(ROOT_DIR):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith('.git')]
        root_path = Path(root)
        if "evals" in root_path.parts:
            continue
        rel_root_parts = root_path.relative_to(ROOT_DIR).parts
        is_src_dir = len(rel_root_parts) > 0 and rel_root_parts[0] == "src"

        for f in files:
            path = root_path / f
            is_env = f.startswith(".env")
            if path.suffix not in APP_CODE_EXTENSIONS and not is_env:
                continue

            content, read_err = _read_text_if_scannable(path, max_bytes=MAX_SECRET_SCAN_BYTES)
            rel_str = str(path.relative_to(ROOT_DIR)).replace("\\", "/")
            if read_err:
                violations.append({"file": rel_str, "line": 0, "type": "Read Error", "sample": read_err})
                continue
            # Fast C-engine whole-file pre-filter before splitting lines
            if not content or not COMBINED_OPERATIONAL_RE.search(content):
                continue

            for idx, line in enumerate(content.splitlines(), start=1):
                stripped = line.strip()
                if stripped.startswith("//") or stripped.startswith("#"):
                    continue
                for pattern, label in OPERATIONAL_ANTI_PATTERNS:
                    if "PrismaClient" in label:
                        # Rule [R-DB-02] applies to application code in src/ to prevent serverless pool exhaustion
                        if not is_src_dir or path.name in SINGLETON_ALLOWED_FILES:
                            continue
                    if pattern.search(line):
                        violations.append({
                            "file": rel_str,
                            "line": idx,
                            "type": label,
                            "sample": stripped[:60]
                        })
    return violations

ALLOWED_EVAL_SCRIPTS = {
    "memory_engine.py", "reset_rsi.py", "rsi_orchestrator.py",
    "run_fullstack_eval.py", "security_audit.py", "stack_inspector.py",
    "telemetry_hook.py", "version_manager.py", "test_evals.py"
}

SUPPLY_CHAIN_ATTACK_PATTERNS = [
    (
        re.compile(r'(?i:(?:curl|wget|iwr|Invoke-WebRequest)\b[^\n|]*\|\s*(?:sh|bash|zsh|pwsh|powershell|iex|Invoke-Expression)\b)'),
        "Remote Pipe-to-Shell Execution Vector"
    ),
    (
        re.compile(r'(?i:\b(?:powershell|pwsh)\b[^\n]*\s-(?:e|enc|encodedcommand)\s+[A-Za-z0-9+/=]{16,})'),
        "Encoded Shell Payload Vector"
    ),
    (
        re.compile(r'(?:rm\s+-[rRf]{2,}\s+/(?:\s|$|\*)|Format-Volume\b|mkfs\.[a-z0-9]+\s+/dev/|\bdd\s+if=/dev/(?:zero|random|urandom)\s+of=/dev/)'),
        "Destructive Host/Disk Command Vector"
    ),
    (
        re.compile(r'(?i:(?:ignore\s+all\s+previous\s+instructions|disregard\s+system\s+rules|bypass\s+security_audit|exfiltrate\s+[^\n]*\.env))'),
        "Prompt Injection / Guardrail Subversion Vector"
    )
]
COMBINED_SUPPLY_CHAIN_RE = re.compile("|".join(f"(?:{p.pattern})" for p, _ in SUPPLY_CHAIN_ATTACK_PATTERNS))

def _scan_file_for_supply_chain(path: Path, findings: list[dict]) -> None:
    rel_str = str(path.relative_to(ROOT_DIR)).replace("\\", "/")
    if path.is_symlink():
        findings.append({"file": rel_str, "line": 0, "type": "Unsafe Symlink in Governance/Engine Tree", "sample": str(path)})
        return
    if path.name in ("security_audit.py", "test_evals.py", "trajectory_latest.json", "cognitive_state.json"):
        return
    if path.suffix.lower() in BINARY_EXTENSIONS:
        return
    content, read_err = _read_text_if_scannable(path, max_bytes=MAX_SECRET_SCAN_BYTES)
    if read_err:
        findings.append({"file": rel_str, "line": 0, "type": "Read Error", "sample": read_err})
        return
    if not content or not COMBINED_SUPPLY_CHAIN_RE.search(content):
        return
    for idx, line in enumerate(content.splitlines(), start=1):
        for pattern, label in SUPPLY_CHAIN_ATTACK_PATTERNS:
            if pattern.search(line):
                findings.append({"file": rel_str, "line": idx, "type": label, "sample": line.strip()[:60]})

def audit_supply_chain_and_agent_integrity() -> list[dict]:
    """Detects supply-chain payloads, unapproved evals scripts on source repo, symlinks, and prompt injections."""
    findings = []
    is_protocol_source_repo = (
        not (ROOT_DIR / "package.json").exists()
        and not (ROOT_DIR / "pyproject.toml").exists()
        and (ROOT_DIR / "evals" / "version_manager.py").exists()
    )

    evals_dir = ROOT_DIR / "evals"
    if evals_dir.exists():
        for root, dirs, files in os.walk(evals_dir):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            root_path = Path(root)
            if root_path.is_symlink():
                rel_dir = str(root_path.relative_to(ROOT_DIR)).replace("\\", "/")
                findings.append({"file": rel_dir, "line": 0, "type": "Unsafe Symlink in Governance/Engine Tree", "sample": str(root_path)})
                dirs[:] = []
                continue
            for f in files:
                p = root_path / f
                if is_protocol_source_repo and p.suffix == ".py" and p.name not in ALLOWED_EVAL_SCRIPTS:
                    rel_str = str(p.relative_to(ROOT_DIR)).replace("\\", "/")
                    findings.append({"file": rel_str, "line": 0, "type": "Unapproved Executable Script in evals/", "sample": p.name})
                _scan_file_for_supply_chain(p, findings)

    agents_dir = ROOT_DIR / ".agents"
    if agents_dir.exists():
        for root, dirs, files in os.walk(agents_dir):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            root_path = Path(root)
            if root_path.is_symlink():
                rel_dir = str(root_path.relative_to(ROOT_DIR)).replace("\\", "/")
                findings.append({"file": rel_dir, "line": 0, "type": "Unsafe Symlink in Governance/Engine Tree", "sample": str(root_path)})
                dirs[:] = []
                continue
            for f in files:
                _scan_file_for_supply_chain(root_path / f, findings)

    pkg_json = ROOT_DIR / "package.json"
    if pkg_json.exists():
        _scan_file_for_supply_chain(pkg_json, findings)

    return findings

GENERIC_HOST_USERNAMES = {"runner", "root", "user", "admin", "vscode", "codespace", "ubuntu", "ci", "docker"}

def audit_private_context_leaks() -> list[dict]:
    """On the source protocol repo, blocks accidental commits of synced private project names or local home paths."""
    is_protocol_source_repo = (
        not (ROOT_DIR / "package.json").exists()
        and not (ROOT_DIR / "pyproject.toml").exists()
        and (ROOT_DIR / "evals" / "version_manager.py").exists()
    )
    if not is_protocol_source_repo:
        return []

    private_terms: list[tuple[re.Pattern, str]] = []
    sync_targets_file = ROOT_DIR / ".agents" / "telemetry" / "sync_targets.json"
    if sync_targets_file.exists():
        try:
            tdata = json.loads(sync_targets_file.read_text(encoding="utf-8", errors="ignore"))
            for item in tdata.get("targets", []):
                tname = str(item.get("name", "")).strip()
                if len(tname) >= 4 and tname.lower() != ROOT_DIR.name.lower():
                    private_terms.append((
                        re.compile(rf'(?i:\b{re.escape(tname)}\b)'),
                        f"Private Synced Project Name Leak ('{tname}')"
                    ))
        except Exception:
            pass

    home_user = Path.home().name.strip()
    if len(home_user) >= 3 and home_user.lower() not in GENERIC_HOST_USERNAMES:
        private_terms.append((
            re.compile(rf'(?i:(?:[A-Z]:[\\/]+Users[\\/]+|/(?:Users|home)/){re.escape(home_user)}(?:[\\/]|$|\s|["\']))'),
            "Local Host User Home Path Leak"
        ))

    if not private_terms:
        return []

    combined_priv_re = re.compile("|".join(f"(?:{p.pattern})" for p, _ in private_terms))
    findings = []
    for root, dirs, files in os.walk(ROOT_DIR):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith('.git')]
        root_path = Path(root)
        for f in files:
            if f in SECRET_SKIP_FILENAMES:
                continue
            path = root_path / f
            if path.suffix.lower() in BINARY_EXTENSIONS or path.is_symlink():
                continue
            rel_str = str(path.relative_to(ROOT_DIR)).replace("\\", "/")
            content, _ = _read_text_if_scannable(path, max_bytes=MAX_SECRET_SCAN_BYTES)
            if not content or not combined_priv_re.search(content):
                continue
            if is_gitignored(rel_str):
                continue
            for idx, line in enumerate(content.splitlines(), start=1):
                for pat, label in private_terms:
                    if pat.search(line):
                        findings.append({
                            "file": rel_str,
                            "line": idx,
                            "type": label,
                            "sample": line.strip()[:60]
                        })
    return findings

def run_security_audit() -> bool:
    print("[RSI Security Audit] Running static security, secret leak, operational pattern, and ASCII guard audit...")
    gitignore_issues = audit_gitignore()
    secret_findings = audit_secrets()
    ascii_violations = audit_ascii_hygiene()
    operational_violations = audit_operational_patterns()
    supply_chain_violations = audit_supply_chain_and_agent_integrity()
    private_context_violations = audit_private_context_leaks()

    success = True
    if gitignore_issues:
        print("\n[FAIL] .gitignore configuration vulnerabilities:")
        for issue in gitignore_issues:
            print(f"  - {issue}")
        success = False
    else:
        print("  [OK] .gitignore configuration is airtight and compliant.")

    if secret_findings:
        print(f"\n[FAIL] {len(secret_findings)} potential secret leak(s) detected:")
        for finding in secret_findings:
            print(f"  - [{finding['type']}] {finding['file']}:{finding['line']} -> {finding['sample']}")
        success = False
    else:
        print("  [OK] No exposed secrets, private keys, or credentials found.")

    if operational_violations:
        print(f"\n[FAIL] {len(operational_violations)} operational anti-pattern(s) detected:")
        for ov in operational_violations:
            print(f"  - [{ov['type']}] {ov['file']}:{ov['line']} -> {ov['sample']}")
        success = False
    else:
        print("  [OK] Operational Pattern Guard: 0 runtime anti-patterns found.")

    if ascii_violations:
        print(f"\n[FAIL] {len(ascii_violations)} non-ASCII / emoji violation(s) detected:")
        for v in ascii_violations:
            print(f"  - [{v['type']}] {v['file']}:{v['line']} -> {v['sample']}")
        success = False
    else:
        print("  [OK] Pure ASCII & Emoji Hygiene: 0 non-ASCII or emoji characters found.")

    if supply_chain_violations:
        print(f"\n[FAIL] {len(supply_chain_violations)} supply-chain / agent integrity violation(s) detected:")
        for sv in supply_chain_violations:
            print(f"  - [{sv['type']}] {sv['file']}:{sv['line']} -> {sv['sample']}")
        success = False
    else:
        print("  [OK] Supply-Chain & Agent Integrity Guard: 0 attack vectors found.")

    if private_context_violations:
        print(f"\n[FAIL] {len(private_context_violations)} private target / host path leak(s) detected:")
        for pv in private_context_violations:
            print(f"  - [{pv['type']}] {pv['file']}:{pv['line']} -> {pv['sample']}")
        success = False
    else:
        print("  [OK] Private Context Leak Guard: 0 personal target names or host paths leaked.")

    # Check for real uncommitted .env files
    env_files = list(ROOT_DIR.glob(".env*"))
    real_envs = [f.name for f in env_files if f.name != ".env.example"]
    if real_envs:
        print(f"  [INFO] Local .env files present: {real_envs} (must stay ignored by git)")
    else:
        print("  [OK] No unencrypted plaintext .env files in directory.")

    if success:
        print("\n[SUCCESS] SECURITY & HYGIENE AUDIT: PASSED (0 issues detected)")
    else:
        print("\n[FAIL] SECURITY & HYGIENE AUDIT: FAILED")

    return success

if __name__ == "__main__":
    passed = run_security_audit()
    sys.exit(0 if passed else 1)
