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
|                         |  |                         |  | [x] TASK-PERF-01..04    |
|                         |  |                         |  | [x] TASK-SEC-05..08     |
|                         |  |                         |  | [x] TASK-QUAL-01..02    |
|                         |  |                         |  | [x] TASK-SUP-02         |
|                         |  |                         |  | [x] TASK-MAIL-01        |
|                         |  |                         |  | [x] TASK-KYC-01..04     |
|                         |  |                         |  | [x] TASK-PRT-01..02     |
|                         |  |                         |  | [x] TASK-CNT-01         |
|                         |  |                         |  | [x] TASK-OPS-01         |
+-------------------------+  +-------------------------+  +-------------------------+
```

---

## Completed Sprint 42: Contact Form Email Delivery & Gmail SMTP Uptime Monitoring

- [x] **`TASK-CNT-01` - Deliver Real Admin & Visitor Emails on `/contact` Submission**
  - **Target files:** `src/app/actions/contact.ts`, `tests/unit/contact-and-health.test.ts`
  - **Criteria:** [x] Sent HTML/text admin notification (`replyTo` sender) and visitor confirmation email via `sendTransactionalEmail` (Resend -> Gmail SMTP cascade) on `sendContactMessageAction`, escaping HTML and sanitizing CRLF headers.

- [x] **`TASK-OPS-01` - Add Live Gmail SMTP Dependency Probe & Diagnostics on `/admin/status`**
  - **Target files:** `src/lib/health-check.ts`, `src/app/actions/health-actions.ts`, `src/components/features/status/StatusDashboard.tsx`, `tests/unit/contact-and-health.test.ts`
  - **Criteria:** [x] Probed Gmail SMTP (`nodemailer.verify()` with 3s timeout) in `getSystemHealthReport`, displayed Gmail SMTP status badge & diagnostics in `StatusDashboard`, enabled test email button when either Resend or Gmail SMTP is configured, and verified with `vitest` (`2/2`), `pnpm next build`, and RSI eval (`100/100` PASS).

---

## Completed Sprint 41: Partner Value Proposition, Revenue Simulator & Quote Partner Dispatch

- [x] **`TASK-PRT-01` - Partner Benefits & Interactive FCFA Revenue Simulator on `/partenaires`**
  - **Target files:** `src/components/features/partners/PartnerBenefitsSection.tsx`, `src/app/partenaires/page.tsx`
  - **Criteria:** [x] Presented 4 concrete partner advantages (0 FCFA signup, pre-qualified B2B missions, secured payment, empty-return monetization) + interactive FCFA monthly net revenue simulator by vehicle category, fleet size, and rotations/month.

- [x] **`TASK-PRT-02` - Approved Partner Dispatch, Margin Calculator & 1-Click Mission Send on `/admin/quotes/[id]`**
  - **Target files:** `src/lib/quote-storage.ts`, `src/app/actions/partner-actions.ts`, `src/components/features/admin/QuotePartnerDispatch.tsx`, `src/app/admin/quotes/[id]/page.tsx`, `tests/unit/partner-dispatch.test.ts`
  - **Criteria:** [x] Allowed admins to assign an `APPROVED` partner to a quote with net FCFA payout, auto-computed HBC margin, sent mission sheet via WhatsApp or transactional Email, preserved existing `supplementaryInfo` keys, and verified with `vitest` (`2/2`), `pnpm next build`, and `python evals/run_fullstack_eval.py --quick` (`100/100` PASS).

---

## Completed Sprint 39: Security Headers, Endpoint Rate-Limiting & Anti-Abuse Hardening

- [x] **`TASK-SEC-07` - Harden `/api/admin/check`, Security Headers & Authenticated Mutation Rate-Limits**
  - **Target files:** `src/app/api/admin/check/route.ts`, `next.config.ts`, `src/app/actions/client-space-actions.ts`
  - **Criteria:** [x] Added fail-open rate limiting + `Cache-Control: no-store` + sanitized errors on `GET /api/admin/check`; added `poweredByHeader: false`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy` in `next.config.ts`; rate-limited `saveClientKycDocumentAction`.

- [x] **`TASK-SEC-08` - Security Hardening Regression Tests**
  - **Target files:** `tests/unit/security-hardening.test.ts`
  - **Criteria:** [x] Verified `GET /api/admin/check` returns `429` when rate-limited and includes `Cache-Control: no-store` (`7/7` PASS).

---

## Completed Sprint 40: Query Boundedness, Nested Payload Reduction & AVIF/WebP Optimization

- [x] **`TASK-PERF-03` - Bound All Admin/Client `findMany` Queries & Nested `history` Payloads**
  - **Target files:** `src/app/actions/quote-management.ts`, `src/app/actions/contact.ts`, `src/app/actions/partner-actions.ts`, `src/app/admin/users/page.tsx`, `src/app/actions/client-space-actions.ts`
  - **Criteria:** [x] Added explicit `take` caps across `getQuotesAction` (`take: 250`, nested `history: { take: 6 }`), `getContactMessagesAction` (`250`), `getClientsDirectoryAction` (`500` + DB-side search filter), `getAdminPartnerApplicationsAction` (`200`), `AdminUsersPage` (`300`), and `getClientDashboardAction` (`100`).

- [x] **`TASK-PERF-04` - Enable AVIF/WebP Next.js Image Optimization & Full Verification**
  - **Target files:** `next.config.ts`
  - **Criteria:** [x] Configured `images: { formats: ["image/avif", "image/webp"] }`; passed full `vitest` (`28/28` files, `145/145` tests), `pnpm next build` (`36/36` routes), and `python evals/run_fullstack_eval.py --quick` (`100/100` PASS).

---

## Completed Sprint 38: Dedicated Admin KYC Validation Queue & Verified Client Visual Indicators

- [x] **`TASK-KYC-03` - Dedicated Admin `KycValidationQueue` Component on `/admin/users`**
  - **Target files:** `src/components/features/admin/KycValidationQueue.tsx`, `src/components/features/admin/UserList.tsx`
  - **Criteria:** [x] Created a dedicated intuitive card-based component managing all clients with uploaded KYC documents (filters: All / À valider / Profils validés / Refusés, inline Open/Download/Approve/Reject with optional rejection reason, live status update, green ring around verified user icons).

- [x] **`TASK-KYC-04` - Green Circle Ring & Verified Badge in Client Space**
  - **Target files:** `src/components/features/client/ClientSpaceDashboard.tsx`
  - **Criteria:** [x] Displayed an emerald green circle ring around the User icon and a prominent "Profil validé" badge in the Espace Client header when KYC status is `VERIFIED`; validated with `pnpm next build` (`36/36` routes) and `python evals/run_fullstack_eval.py --quick` (`100/100` PASS).

---

## Completed Sprint 35: Support Chat Production Resilience & Interactive Evaluation

- [x] **`TASK-SUP-02` - Harden Support Quote Flow, FR Date Parsing, Cancel Escape & Resilience**
  - **Target files:** `src/lib/support-agent/quote-flow.ts`, `src/hooks/useSupportChat.ts`, `tests/unit/support-interactive.test.ts`
  - **Criteria:** [x] Supported graceful cancel/exit (`annuler`/`stop`/`quitter`) mid-flow; validated pickup/dropoff/phone/email inline; parsed FR dates (`DD/MM/YYYY`, `demain`) to valid ISO dates; prevented permanent fallback lock on transient AI errors; verified via interactive unit tests.

---

## Completed Sprint 36: Brand-Aligned Client & Admin Email Templates

- [x] **`TASK-MAIL-01` - Executive HBC Logistique Email Templates Overhaul**
  - **Target files:** `src/components/emails/QuoteConfirmationEmail.tsx`, `src/components/emails/QuoteStatusUpdateEmail.tsx`, `src/components/emails/QuoteRequestEmail.tsx`
  - **Criteria:** [x] Aligned all 3 templates with HBC brand tokens (`#001F3D`, `#FF7C24`, `#F2F5F7`, `#92A9BE`), removed `#` before `HBC-...`, pointed client CTAs to `/espace-client`.

---

## Completed Sprint 37: Profile LocationPicker, KYC Document Tracking & 1/Day Admin Reminder

- [x] **`TASK-KYC-01` - Profile LocationPicker + KYC Storage/Reminder/Review Backend**
  - **Target files:** `src/lib/client-kyc.ts`, `src/app/actions/client-space-actions.ts`, `src/app/actions/user-management.ts`, `tests/unit/client-kyc.test.ts`
  - **Criteria:** [x] Defined required KYC documents per profile type (`INDIVIDUAL`: CNI/Passeport + justificatif domicile; `COMPANY`: CNI/Passeport gérant + RCCM + DFE/NCC); stored backwards-compatibly in `CompanyProfile`; enforced 1/day (24h) validation reminder creating admin notification + alert email; added admin review action (`APPROVED`/`REJECTED`).

- [x] **`TASK-KYC-02` - Profile UI (`LocationPicker` + KYC Panel) & Admin Users KYC Review**
  - **Target files:** `src/components/features/client/ClientKycSection.tsx`, `src/components/features/client/ClientSpaceDashboard.tsx`, `src/app/admin/users/page.tsx`, `src/components/features/admin/UserList.tsx`
  - **Criteria:** [x] Wired `LocationPicker` to `defaultPickup`, `defaultDropoff`, and address book; added KYC upload/status panel + "Réclamer la validation (1/j)" button in client profile; added admin KYC document Open/Download/Approve/Reject controls in `/admin/users`; passed `vitest` (`12/12`), `pnpm next build` (`36/36` routes), and `python evals/run_fullstack_eval.py --quick` (`100/100` PASS).

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
