# [SSOT] TASKS.md - Central Registry & Task Tracker

> Single Source of Truth (SSOT) for orchestrating technical and functional tasks.
> Strict ceiling: 250 lines. Archives: `SPRINT_01_05_ARCHIVE.md`, `SPRINT_06_11_ARCHIVE.md`, `SPRINT_12_23_ARCHIVE.md`, `SPRINT_24_31_ARCHIVE.md`.

---

## Synthetic Kanban View

```
+-------------------------+  +-------------------------+  +-------------------------+
| [>] IN PROGRESS         |  |  [?] ROADMAP            |  |       [X] ARCHIVES      |
+-------------------------+  +-------------------------+  +-------------------------+
| [-] TASK-SEC-05         |  | [ ] TASK-QUAL-01        |  | [x] SP 01..11 (Archived)|
| [-] TASK-SEC-06         |  | [ ] TASK-QUAL-02        |  | [x] SP 12..23 (Archived)|
|                         |  |                         |  | [x] SP 24..31 (Archived)|
|                         |  |                         |  | [x] TASK-PERF-01..02    |
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

## Active Sprint 33: Security & Abuse-Prevention Hardening

- [-] **`TASK-SEC-05` - Rate Limiting on Password Reset & Public AI Endpoints**
  - **Target files:** `src/app/actions/auth-actions.ts`, `src/app/actions/ai-actions.ts`
  - **Criteria:** [ ] Enforce fail-open Upstash Redis rate limiting on `requestPasswordResetAction`, `resetPasswordWithTokenAction`, `generateSupportAiAction`, and `estimateTransportAction`.

- [ ] **`TASK-SEC-06` - Security Rate-Limit Regression Tests**
  - **Target files:** `tests/unit/security-hardening.test.ts`
  - **Criteria:** [ ] Add unit tests verifying rate-limit rejection on password reset and support AI actions.

---

## Planned Sprint 34: Code Quality, SPA Navigation & Overnight Report

- [ ] **`TASK-QUAL-01` - Eliminate Remaining ESLint Warning & Wire Chat Validation Errors**
  - **Target files:** `src/hooks/useSupportChat.ts`
  - **Criteria:** [ ] Replace `window.location.href = "/devis"` with `useRouter().push("/devis")` (zero ESLint warnings); display `processFlowAnswer` validation errors (e.g. invalid email) cleanly in chat.

- [ ] **`TASK-QUAL-02` - Full Verification Suite & Overnight Audit Report**
  - **Target files:** `docs/TASKS.md`
  - **Criteria:** [ ] Pass full `pnpm vitest run`, `pnpm next build`, and `python evals/run_fullstack_eval.py --quick` (`100/100` PASS); commit Sprints 32, 33, 34 separately.
