# [SSOT] TASKS.md - Central Registry & Task Tracker

> Single Source of Truth (SSOT) for orchestrating technical and functional tasks.
> Strict ceiling: 250 lines. Archives: `SPRINT_01_05_ARCHIVE.md`, `SPRINT_06_11_ARCHIVE.md`, `SPRINT_12_23_ARCHIVE.md`, `SPRINT_24_31_ARCHIVE.md`.

---

## Synthetic Kanban View

```
+-------------------------+  +-------------------------+  +-------------------------+
| [>] IN PROGRESS         |  |  [?] ROADMAP            |  |       [X] ARCHIVES      |
+-------------------------+  +-------------------------+  +-------------------------+
| (None)                  |  | (None)                  |  | [x] SP 01..11 (Archived)|
|                         |  |                         |  | [x] SP 12..23 (Archived)|
|                         |  |                         |  | [x] SP 24..31 (Archived)|
|                         |  |                         |  | [x] TASK-PERF-01..02    |
|                         |  |                         |  | [x] TASK-SEC-05..06     |
|                         |  |                         |  | [x] TASK-QUAL-01..02    |
+-------------------------+  +-------------------------+  +-------------------------+
```

---

## Completed Sprint 32: Performance, Bundle Lazy-Loading & Database Indexing

- [x] **`TASK-PERF-01` - Lazy-Load `jspdf` / `pdf-generator` on Client Pages**
  - **Target files:** `src/app/admin/quotes/[id]/page.tsx`, `src/app/espace-client/quotes/[id]/page.tsx`, `src/components/features/client/ClientSpaceDashboard.tsx`
  - **Criteria:** [x] Replaced static top-level `generateQuotePDF` imports with dynamic `await import("@/lib/pdf-generator")` on click to remove ~350KB `jspdf` from initial client bundles.

- [x] **`TASK-PERF-02` - Prisma Query Indexes & Fail-Open Redis Fleet Cache**
  - **Target files:** `prisma/schema.prisma`, `src/app/actions/fleet-actions.ts`
  - **Criteria:** [x] Added strategic `@@index` declarations on `Quote`, `QuoteHistory`, `ContactMessage`, `PartnerApplication`, `SupportMessage`, and `Vehicle`; cached `getPublicFleetAction` in Upstash Redis (120s TTL, fail-open) with invalidation on admin fleet mutations.

---

## Completed Sprint 33: Security & Abuse-Prevention Hardening

- [x] **`TASK-SEC-05` - Rate Limiting on Password Reset & Public AI Endpoints**
  - **Target files:** `src/app/actions/auth-actions.ts`, `src/app/actions/ai-actions.ts`
  - **Criteria:** [x] Enforced fail-open Upstash Redis rate limiting on `requestPasswordResetAction` (5/15m), `resetPasswordWithTokenAction` (10/15m), `generateSupportAiAction` (25/10m), and `estimateTransportAction` (15/10m).

- [x] **`TASK-SEC-06` - Security Rate-Limit Regression Tests**
  - **Target files:** `tests/unit/security-hardening.test.ts`
  - **Criteria:** [x] Added unit test verifying rate-limit rejection on `requestPasswordResetAction` (`6/6` tests PASS).

---

## Completed Sprint 34: Code Quality, SPA Navigation & Overnight Report

- [x] **`TASK-QUAL-01` - Eliminate Remaining ESLint Warning & Wire Chat Validation Errors**
  - **Target files:** `src/hooks/useSupportChat.ts`
  - **Criteria:** [x] Replaced `window.location.href = "/devis"` with `useRouter().push("/devis")`; wired `processFlowAnswer` validation errors cleanly in chat.

- [x] **`TASK-QUAL-02` - Full Verification Suite & Overnight Audit Report**
  - **Target files:** `docs/TASKS.md`
  - **Criteria:** [x] Passed full `pnpm vitest run` (`27/27` files, `140/140` tests), `pnpm next build` (`36/36` routes), and `python evals/run_fullstack_eval.py --quick` (`100/100` PASS).
