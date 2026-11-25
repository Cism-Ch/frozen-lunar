<!-- RSI-PROTOCOL:START -->
# AGENTS.md - AI Agent Reference & RSI Protocol

This document governs engineering guidelines, codebase governance, and the Recursive Self-Improvement (RSI) protocol.

---

### Inviolable Rules Summary

1. **Architecture, Strict Typing & Anti-AI-Slop Integrity:**
   - Zero type errors, strong inference, and systematic runtime validation.
   - **UI & Structural Fidelity:** Every page must inherit the project's canonical layout (`Header`/`Footer`), use design-system tokens and existing UI primitives (no ad-hoc styles or off-brand components), and remove orphaned components (0 incoming imports) when replacing/refactoring UI.
   - **Secure-by-Default Endpoints:** Exposed public routes/actions (contact, quote/devis, auth, upload) must enforce input schema validation and project rate-limiting; uploads and presigned URLs must enforce allowed MIME types, max file size, and auth/ownership checks.
2. **Task Tracking (Inviolable SSOT - `docs/TASKS.md`):**
   - **No Unregistered Coding:** All work MUST be attached to a formalized task in `docs/TASKS.md` (`TASK-DOMAIN-XX`) with a description and checkable acceptance criteria.
   - **Real-Time Updates:** Mark `[-]` at start, `[!]` (`BLOCKED`) on unresolvable impasse with diagnostic report, `[x]` upon completion.
   - **Validation Before Closure:** Never mark a task completed without validating with the deterministic judge (`python evals/run_fullstack_eval.py`). Never weaken tests or validators to bypass a failure without explicit user approval.
   - **Strict Ceiling:** `docs/TASKS.md` must never exceed **250 lines** (Rollover to `docs/archive/tasks/`).
3. **RSI Protocol (Recursive Self-Improvement):**
   - **Modular Procedural Memory:** Consult `.agents/rules/modules/` for specialized rules (< 80 lines per file).
   - **Adaptive Deterministic Judge:** Validate progress with `python evals/run_fullstack_eval.py --quick`.
   - **Meta-Cognitive Loop:** Adopt `.agents/prompts/meta_optimizer.md` to extract lessons and enrich sub-playbooks when fixing bugs or after security audits.
   - **Dedicated Workflow:** Use the `/rsi-feature` command.
   - **Post-Commit Target Sync:** On the source protocol repository, after work & commit, always ask the user before running `--sync-all` / `--sync-to <dir>` on registered targets and ask for the disk path of any other unsynchronized project. If `--sync-to` backs up a pre-existing `AGENTS.md`, evaluate its rules against `system_core.md` / `.agents/rules/modules/` and ask the user how to merge uncovered or conflicting rules.
4. **Anti-Saturation Test Cadence:**
   - Micro-edits without global test suite -> Milestone checkpoint with compact `--quick` -> Task closure with full validation.
5. **Memory Duality:**
   - IDE Artifacts for episodic session tracking; `.agents/rules/modules/` files for durable procedural memory.
<!-- RSI-PROTOCOL:END -->

## Project-Specific Rules

<!-- Preserved automatically across --sync-to / --sync-all updates. Add project-specific invariants or overrides below. -->

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
