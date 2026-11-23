# [SSOT] TASKS.md - Central Registry & Task Tracker

> Single Source of Truth (SSOT) for orchestrating technical and functional tasks.
> Strict ceiling: 250 lines. Archives: `docs/archive/tasks/SPRINT_01_05_ARCHIVE.md`, `docs/archive/tasks/SPRINT_06_11_ARCHIVE.md`.

---

## Synthetic Kanban View

```
+-------------------------+  +-------------------------+  +-------------------------+
| [>] IN PROGRESS         |  |  [?] ROADMAP            |  |       [X] ARCHIVES      |
+-------------------------+  +-------------------------+  +-------------------------+
| (None)                  |  | (None)                  |  | [x] SP 01..11 (Archived)|
|                         |  |                         |  | [x] TASK-INF-01..04     |
|                         |  |                         |  | [x] TASK-SUP-01..03     |
|                         |  |                         |  | [x] TASK-CLT-01..03     |
|                         |  |                         |  | [x] TASK-PRT-03..04     |
|                         |  |                         |  | [x] TASK-ADM-01..05     |
|                         |  |                         |  | [x] TASK-UIX-01..07     |
|                         |  |                         |  | [x] TASK-QTE-01..04     |
|                         |  |                         |  | [x] TASK-FLT-03 / USR-01|
+-------------------------+  +-------------------------+  +-------------------------+
```

---

## Completed Sprint 12: Redis, Server S3 Upload + Compression, Admin-Only Status & Notifications/Toasts

- [x] **`TASK-INF-01` - Resilient Upstash Redis REST Normalization & Diagnostics**
  - **Priority:** HIGH
  - **Target files:** `src/lib/redis.ts`, `src/lib/health-check.ts`
  - **Acceptance criteria:**
    - [x] Automatically normalize `rediss://` TCP URLs to Upstash REST `https://` URL + clear 401 diagnostic on `/admin/status`.

- [x] **`TASK-INF-02` - Server-Side S3 Upload (`POST /api/upload`), Client Image Compression & Fleet Image Proxy**
  - **Priority:** CRITICAL
  - **Target files:** `src/lib/file-compression.ts`, `src/app/api/upload/route.ts`, `src/app/api/fleet-image/[...key]/route.ts`, `src/components/features/FileUpload.tsx`, `src/components/features/fleet/AdminFleetClient.tsx`, `src/components/features/partners/PartnerApplicationWizard.tsx`
  - **Acceptance criteria:**
    - [x] Auto-compress images client-side (< 4 Mo), upload server-side via `POST /api/upload` (0 CORS), fix `folder="quotes"` bug in `StepNotes`, support vehicle image upload in `/admin/fleet` served via `/api/fleet-image/[...key]`.

- [x] **`TASK-INF-03` - Admin-Only Service Status (`/status` & `/api/health`)**
  - **Priority:** HIGH
  - **Target files:** `src/app/status/page.tsx`, `src/app/api/health/route.ts`, `src/components/layout/Footer.tsx`
  - **Acceptance criteria:**
    - [x] Removed `/status` from public footer, redirected `/status` to `/admin/status`, and restricted `GET /api/health` to authenticated admins (`401/403` otherwise).

- [x] **`TASK-INF-04` - Enlarged Desktop Toasts & Persistent Admin Notifications Center**
  - **Priority:** HIGH
  - **Target files:** `prisma/schema.prisma`, `src/components/ui/sonner.tsx`, `src/app/actions/notification-management.ts`, `src/components/features/AdminNotifications.tsx`
  - **Acceptance criteria:**
    - [x] Longer, larger desktop toasts (`6500ms`, `closeButton`, enlarged width/padding) and persistent `AdminNotificationRead` aggregating quotes, cancellations, contacts, partners, and human-takeover chat threads (`100/100` RSI PASS).

---

## Completed Sprint 13: Readable Tracking Codes (`HBC-2026-XXXX`) & Warm AI Support Chat

- [x] **`TASK-SUP-01` - Readable Quote Tracking Codes (`HBC-2026-XXXX`)**
  - **Priority:** HIGH
  - **Target files:** `prisma/schema.prisma`, `src/lib/tracking-code.ts`, `src/app/actions/quote-management.ts`, `src/lib/pdf-generator.ts`, `tests/unit/tracking-code.test.ts`
  - **Acceptance criteria:**
    - [x] Generated & backfilled unambiguous `HBC-YYYY-XXXX` tracking codes across quotes, search, summary dialog, and PDFs.

- [x] **`TASK-SUP-02` - Warm Default AI Support Chat (Emergency-Only Robot Mode)**
  - **Priority:** HIGH
  - **Target files:** `src/hooks/useSupportChat.ts`, `src/lib/gemini.ts`, `src/lib/support-agent/knowledge.ts`, `src/components/features/support/components/ChatHeader.tsx`
  - **Acceptance criteria:**
    - [x] Defaulted to warm, empathetic AI mode (Gemini -> OpenRouter); Robot Mode activates strictly as an automatic emergency fallback if all LLMs fail (`100/100` RSI PASS).

---

## Completed Sprint 14: Individual vs Company Client Space, Auto-Prefill, Cancellation Modal & Analytics

- [x] **`TASK-CLT-01` - Individual vs Company Client Profile & QuoteWizard Auto-Prefill**
  - **Priority:** HIGH
  - **Target files:** `src/app/actions/client-space-actions.ts`, `src/components/features/client/ClientSpaceDashboard.tsx`, `src/components/features/QuoteWizard.tsx`
  - **Acceptance criteria:**
    - [x] Supported `INDIVIDUAL` (no RCCM/NCC required) vs `COMPANY` account types and auto-prefilled `QuoteWizard` for authenticated users without overwriting user edits.

- [x] **`TASK-CLT-02` - Quote Cancellation Modal (Preset/Custom Reasons) & Admin Cancellation Rate KPI**
  - **Priority:** HIGH
  - **Target files:** `src/app/actions/client-space-actions.ts`, `src/components/features/admin/BusinessAnalytics.tsx`, `src/components/features/admin/QuoteStatusBadge.tsx`, `src/app/admin/quotes/[id]/page.tsx`
  - **Acceptance criteria:**
    - [x] Centered cancellation modal with preset + custom reasons, `CANCELLED` status tracking, admin visibility, and cancellation rate (%) + top reasons KPI in `BusinessAnalytics`.

- [x] **`TASK-CLT-03` - Centered Confirmation Modals Across Popular & Critical Actions**
  - **Priority:** MEDIUM
  - **Target files:** `src/components/features/client/ClientSpaceDashboard.tsx`, `src/components/features/client/OrderChat.tsx`
  - **Acceptance criteria:**
    - [x] Enforced centered `ConfirmDialog` confirmations before reorder, logout, cancellation, and human takeover toggle (`100/100` RSI PASS).

---

## Completed Sprint 15: Partner Individual vs Company Forms & CI Road Safety Charter

- [x] **`TASK-PRT-03` - Differentiated Individual vs Company Partner Application (`/partenaires`)**
  - **Priority:** HIGH
  - **Target files:** `src/app/actions/partner-actions.ts`, `src/components/features/partners/PartnerApplicationWizard.tsx`, `src/components/features/partners/AdminPartnersClient.tsx`, `tests/unit/partner-actions.test.ts`
  - **Acceptance criteria:**
    - [x] Adapted Step 1 & Step 3 fields for `INDIVIDUAL` (CNI/Permis, nullable RCCM) vs `COMPANY` (Raison sociale, RCCM, NCC) with centered admin & submission confirmations.

- [x] **`TASK-PRT-04` - Côte d'Ivoire Road Safety & Quality Charter Page + Interactive Modal**
  - **Priority:** MEDIUM
  - **Target files:** `src/lib/ci-road-charter.ts`, `src/app/legal/charte-qualite-securite/page.tsx`, `src/components/features/partners/PartnerApplicationWizard.tsx`
  - **Acceptance criteria:**
    - [x] Published complete Côte d'Ivoire road safety & transport quality charter (Code de la route CI, SICTA, CIMA, permis B/C/D/E, temps de repos) accessible via dedicated page and modal link next to the honor attestation checkbox (`100/100` RSI PASS).

---

## Completed Sprint 16: Admin AI Copilot Executor (`/admin/assistant`)

- [x] **`TASK-ADM-01` - Secure Admin AI Copilot Actions & Tool Registry**
  - **Priority:** HIGH
  - **Target files:** `src/app/actions/admin-agent-actions.ts`, `tests/unit/admin-agent.test.ts`
  - **Acceptance criteria:**
    - [x] `requireAdmin()` + Zod tool registry supporting immediate read tools and confirmation-gated write tools (stock, price, quote status, partner status) with `<untrusted_data>` prompt-injection isolation.

- [x] **`TASK-ADM-02` - Admin AI Copilot Chat Interface (`/admin/assistant`)**
  - **Priority:** HIGH
  - **Target files:** `src/app/admin/assistant/page.tsx`, `src/components/features/admin/AdminCopilotClient.tsx`, `src/components/features/admin/SidebarContent.tsx`
  - **Acceptance criteria:**
    - [x] Dedicated admin chat interface with quick task prompts, structured result cards, and centered `ConfirmDialog` before every database write action (`100/100` RSI PASS, `pnpm next build` + 122/122 tests PASS).

---

## Completed Sprint 17: Premium Palette, Raleway, Floating Adaptive Header & Hero Redesign

- [x] **`TASK-UIX-01` - Premium Color Palette (`#001F3D`, `#6081A0`, `#FF6600`, `#FF7C24`) & Raleway Typography**
  - **Target files:** `src/app/layout.tsx`, `src/app/globals.css`
  - **Criteria:** [x] Raleway loaded via `next/font/google`; new CSS/Tailwind tokens active in light & dark mode with WCAG AA contrast.

- [x] **`TASK-UIX-02` - Floating Translucent Adaptive Header, Drawer Compression & Client `UserAccountMenu`**
  - **Target files:** `src/components/layout/Header.tsx`, `src/components/layout/UserAccountMenu.tsx`
  - **Criteria:** [x] Borderless floating translucent header, menu icons, manual + automatic (`ResizeObserver` hysteresis) title↔icon toggle, mobile drawer compression toggle, and Better-Auth user connection status menu.

- [x] **`TASK-UIX-03` - Hero Cover Redesign & Heavy Freight Illustration**
  - **Target files:** `public/images/hero-freight.jpg`, `src/components/features/HeroSection.tsx`, `src/app/page.tsx`
  - **Criteria:** [x] Cover-styled Hero with heavy freight illustration matching input style, gradient glow, glassmorphism HUD elements, and subtle watermark (`100/100` RSI PASS).

## Completed Sprint 18 & Active Sprint 19

- [x] **`TASK-ADM-03` (SP 18)** - Reusable `<PasswordInput />` deployed across all password forms.
- [x] **`TASK-ADM-04` (SP 18)** - Production audit & fixes for `/admin/settings` & `/espace-client` profile links.
- [x] **`TASK-ADM-05` (SP 18)** - Patch demo data (8 CI quotes, dynamic dates, `HBC-YYYY-XXXX`, aligned `supplementaryInfo`, `100/100` RSI PASS).
- [x] **`TASK-QTE-01` (SP 19)** - Replace `QuoteDetailsSheet` with responsive centered `QuoteDetailsModal` (equal auto X/Y margins).
- [x] **`TASK-QTE-02` (SP 19)** - Redesign `/admin/quotes` list with KPIs, `HBC-YYYY-XXXX`, amount column, and `CANCELLED` filter (`100/100` RSI PASS).
- [x] **`TASK-QTE-03` (SP 20)** - Server AI pricing engine (`assistQuotePricingAction` & `saveStructuredPricingAction`).
- [x] **`TASK-QTE-04` (SP 20)** - Rebuild `/admin/quotes/[id]` workspace & interactive `QuotePricingStudio` (`100/100` RSI PASS, `pnpm next build` + 127/127 tests PASS).

## Completed Sprint 21: Theme-Adaptive Hero (#F2F5F7 / #92A9BE), Isometric Design, Nunito Sans & Mobile Fleet Fix

- [x] **`TASK-UIX-04` (SP 21)** - Switch typography to `Nunito Sans` & theme-adaptive tokens (`#F2F5F7` light / `#92A9BE` dark + orange glows).
- [x] **`TASK-UIX-05` (SP 21)** - Editorial Hero redesign (BAU CARGO inspired) with isometric background, dynamic multi-service text & `/about` isometric visual.
- [x] **`TASK-UIX-06` (SP 21)** - Fix mobile vehicle cards disappearing on `/flotte` (`motion.tsx` `amount: "some"` + direct card render, `100/100` RSI PASS, `pnpm next build` PASS).

## Completed Sprint 22: Hero Tweaks, 1x6/2x6/3x6 Fleet, Admin vs Client Users, Dark Contrast & Support AI Fix

- [x] **`TASK-UIX-07` (SP 22)** - Brighter isometric Hero bg, removed top-right cities & fixed dark-mode logout contrast (`--destructive`). *(Studio truck image regeneration pending image API 503 capacity recovery.)*
- [x] **`TASK-FLT-03` (SP 22)** - Shared mobile-first `1x6 / 2x6 / 3x6` fleet layout + pagination on `/flotte` & `/admin/fleet` + admin filter block & card image fix.
- [x] **`TASK-USR-01` (SP 22)** - Separated Admin Team vs Client Accounts on `/admin/users` with role update, session revocation & email verification actions.
- [x] **`TASK-SUP-03` (SP 22)** - Fixed premature Support AI fallback to Robot Mode (`1024`/`700` tokens, `15s` timeout, JSON mode + plain-text fallback, `100/100` RSI PASS, `pnpm next build` + 127/127 tests PASS).
