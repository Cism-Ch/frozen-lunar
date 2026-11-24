# [SSOT] TASKS.md - Central Registry & Task Tracker

> Single Source of Truth (SSOT) for orchestrating technical and functional tasks.
> Strict ceiling: 250 lines. Archives: `SPRINT_01_05_ARCHIVE.md`, `SPRINT_06_11_ARCHIVE.md`, `SPRINT_12_23_ARCHIVE.md`.

---

## Synthetic Kanban View

```
+-------------------------+  +-------------------------+  +-------------------------+
| [>] IN PROGRESS         |  |  [?] ROADMAP            |  |       [X] ARCHIVES      |
+-------------------------+  +-------------------------+  +-------------------------+
| (None)                  |  | (None)                  |  | [x] SP 01..11 (Archived)|
|                         |  |                         |  | [x] SP 12..23 (Archived)|
|                         |  |                         |  | [x] TASK-SEC-01..03     |
|                         |  |                         |  | [x] TASK-BUG-01..03     |
|                         |  |                         |  | [x] TASK-CLN-01..02     |
|                         |  |                         |  | [x] TASK-RSI-01         |
+-------------------------+  +-------------------------+  +-------------------------+
```

---

## Completed Sprint 27: RSI Procedural Memory Enrichment

- [x] **`TASK-RSI-01` - Integrate Sprint 24-26 Lessons into RSI Rule Modules**
  - **Target files:** `.agents/rules/modules/security_auth.md`, `.agents/rules/modules/api_backend.md`, `.agents/rules/modules/ui_frontend.md`, `.agents/rules/modules/pattern_recognition.md`
  - **Criteria:** [x] Added `[R-SEC-05..06]`, `[R-API-05..06]`, `[R-UI-05..06]`, and `[R-PAT-07]` keeping every module strictly under 80 lines; validated via `python evals/run_fullstack_eval.py --quick` (`100/100` PASS).

---

## Completed Sprint 24: Defensive Security Hardening, Anti-Spoofing & Rate Limiting

- [x] **`TASK-SEC-01` - Binary Magic-Byte Upload Verification & Fleet Proxy Hardening**
  - **Target files:** `src/lib/file-signature.ts`, `src/app/api/upload/route.ts`, `src/app/api/fleet-image/[...key]/route.ts`, `src/app/actions/upload-management.ts`
  - **Criteria:** [x] Reject spoofed MIME types via binary magic-byte inspection; enforce `requireAdmin()` on `fleet-images` in `getPresignedUploadUrlAction`; enforce strict image MIME allowlist + `X-Content-Type-Options: nosniff` on fleet proxy.

- [x] **`TASK-SEC-02` - Upstash Redis Rate Limiting on Public Abuse Vectors & CSP Hardening**
  - **Target files:** `src/lib/rate-limit.ts`, `src/app/api/upload/route.ts`, `src/app/actions/contact.ts`, `src/app/api/admin/init/route.ts`, `next.config.ts`
  - **Criteria:** [x] Applied rate limiting to upload, contact form, and admin init; updated CSP `connect-src` (`openrouter.ai`) and `upgrade-insecure-requests` in prod.

- [x] **`TASK-SEC-03` - Defensive Security Regression Test Suite**
  - **Target files:** `tests/unit/security-hardening.test.ts`
  - **Criteria:** [x] Verified magic-byte spoofing rejection, unauthenticated `fleet-images` presign rejection, and path traversal defenses (`100/100` RSI PASS).

---

## Completed Sprint 25: Critical Action & Data Consistency Fixes

- [x] **`TASK-BUG-01` (SP 25)** - Preserved uploaded `attachments` in `createQuoteAction` (`supplementaryInfoSchema`) + added rate limiting.
- [x] **`TASK-BUG-02` (SP 25)** - Fixed `searchAdminAction` (`trackingCode` search, `QuoteStatus.CANCELLED` mapping, missing admin navigation routes).
- [x] **`TASK-BUG-03` (SP 25)** - Replaced legacy `#id.slice(0,8)` with `HBC-YYYY-XXXX` in `thread-actions.ts` welcome message (`100/100` RSI PASS).

---

## Completed Sprint 26: Admin UI Consistency & Dead Code Removal

- [x] **`TASK-CLN-01` (SP 26)** - Upgraded `src/app/admin/dashboard/page.tsx` from legacy `QuoteDetailsSheet` to responsive centered `QuoteDetailsModal` (live ID sync).
- [x] **`TASK-CLN-02` (SP 26)** - Removed dead legacy `src/components/features/QuoteDetailsSheet.tsx` & verified full build/tests/RSI (`133/133` tests PASS, `pnpm next build` 35/35 routes PASS, `100/100` RSI PASS).
