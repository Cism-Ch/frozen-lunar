# [SSOT] TASKS.md - Central Registry & Task Tracker

> Single Source of Truth (SSOT) for orchestrating technical and functional tasks.
> Strict ceiling: 250 lines. Archives: `docs/archive/tasks/SPRINT_01_05_ARCHIVE.md`, `docs/archive/tasks/SPRINT_06_11_ARCHIVE.md`.

---

## Synthetic Kanban View

```
+-------------------------+  +-------------------------+  +-------------------------+
| [>] IN PROGRESS (SP 13) |  |  [?] ROADMAP (SP 14-16) |  |       [X] ARCHIVES      |
+-------------------------+  +-------------------------+  +-------------------------+
| [-] TASK-SUP-01..02     |  | [ ] TASK-CLT-01..03     |  | [x] SP 01..05 (Archived)|
|                         |  | [ ] TASK-PRT-03..04     |  | [x] SP 06..11 (Archived)|
|                         |  | [ ] TASK-ADM-01..02     |  | [x] TASK-INF-01..04     |
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

## In-Progress Sprint 13: Readable Tracking Codes (`HBC-2026-XXXX`) & Warm AI Support Chat

- [-] **`TASK-SUP-01` - Readable Quote Tracking Codes (`HBC-2026-XXXX`)**
  - **Priority:** HIGH
  - **Target files:** `prisma/schema.prisma`, `src/lib/tracking-code.ts`, `src/app/actions/quote-management.ts`, `src/lib/pdf-generator.ts`
  - **Acceptance criteria:**
    - [ ] Generate & backfill `HBC-YYYY-XXXX` tracking codes, display consistently across client space, admin, PDFs, and support tracking.

- [-] **`TASK-SUP-02` - Warm Default AI Support Chat (Emergency-Only Robot Mode)**
  - **Priority:** HIGH
  - **Target files:** `src/hooks/useSupportChat.ts`, `src/lib/gemini.ts`, `src/lib/support-agent/knowledge.ts`, `src/components/features/support/components/ChatHeader.tsx`
  - **Acceptance criteria:**
    - [ ] Default to warm, empathetic AI mode (Gemini -> OpenRouter); activate Robot Mode strictly as an automatic emergency fallback if all LLMs fail.

---

## Planned Sprint 14: Individual vs Company Client Space, Auto-Prefill, Cancellation Modal & Analytics

- [ ] **`TASK-CLT-01` - Individual vs Company Client Profile & QuoteWizard Auto-Prefill**
  - **Priority:** HIGH
  - **Target files:** `src/app/actions/client-space-actions.ts`, `src/components/features/client/ClientSpaceDashboard.tsx`, `src/components/features/QuoteWizard.tsx`
  - **Acceptance criteria:**
    - [ ] Support `INDIVIDUAL` (no RCCM/NCC required) vs `COMPANY` account types and auto-prefill `QuoteWizard` for authenticated users without overwriting user edits.

- [ ] **`TASK-CLT-02` - Quote Cancellation Modal (Preset/Custom Reasons) & Admin Cancellation Rate KPI**
  - **Priority:** HIGH
  - **Target files:** `src/app/actions/client-space-actions.ts`, `src/components/features/admin/BusinessAnalytics.tsx`, `src/components/features/admin/QuoteStatusBadge.tsx`, `src/app/admin/quotes/[id]/page.tsx`
  - **Acceptance criteria:**
    - [ ] Centered cancellation modal with preset + custom reasons, `CANCELLED` status tracking, admin visibility, and cancellation rate (%) + top reasons KPI in `BusinessAnalytics`.

- [ ] **`TASK-CLT-03` - Centered Confirmation Modals Across Popular & Critical Actions**
  - **Priority:** MEDIUM
  - **Target files:** `src/components/features/client/ClientSpaceDashboard.tsx`, `src/app/admin/quotes/[id]/page.tsx`, `src/components/features/partners/AdminPartnersClient.tsx`
  - **Acceptance criteria:**
    - [ ] Enforce centered `ConfirmDialog` confirmations before reorder, logout, admin approve/reject, human takeover toggle, and partner submission.

---

## Planned Sprint 15: Partner Individual vs Company Forms & CI Road Safety Charter

- [ ] **`TASK-PRT-03` - Differentiated Individual vs Company Partner Application (`/partenaires`)**
  - **Priority:** HIGH
  - **Target files:** `src/app/actions/partner-actions.ts`, `src/components/features/partners/PartnerApplicationWizard.tsx`, `src/components/features/partners/AdminPartnersClient.tsx`
  - **Acceptance criteria:**
    - [ ] Adapt Step 1 & Step 3 fields for `INDIVIDUAL` (CNI/Permis, nullable RCCM) vs `COMPANY` (Raison sociale, RCCM, NCC).

- [ ] **`TASK-PRT-04` - Côte d'Ivoire Road Safety & Quality Charter Page + Interactive Modal**
  - **Priority:** MEDIUM
  - **Target files:** `src/lib/ci-road-charter.ts`, `src/app/legal/charte-qualite-securite/page.tsx`, `src/components/features/partners/PartnerApplicationWizard.tsx`
  - **Acceptance criteria:**
    - [ ] Publish complete Côte d'Ivoire road safety & transport quality charter (Code de la route CI, SICTA, CIMA, permis C/D/E, temps de repos) accessible via dedicated page and modal link next to the honor attestation checkbox.

---

## Planned Sprint 16: Admin AI Copilot Executor (`/admin/assistant`)

- [ ] **`TASK-ADM-01` - Secure Admin AI Copilot Actions & Tool Registry**
  - **Priority:** HIGH
  - **Target files:** `src/app/actions/admin-agent-actions.ts`, `tests/unit/admin-agent.test.ts`
  - **Acceptance criteria:**
    - [ ] `requireAdmin()` + Zod tool registry supporting immediate read tools and confirmation-gated write tools (stock, price, quote status, partner status) with `<untrusted_data>` prompt-injection isolation.

- [ ] **`TASK-ADM-02` - Admin AI Copilot Chat Interface (`/admin/assistant`)**
  - **Priority:** HIGH
  - **Target files:** `src/app/admin/assistant/page.tsx`, `src/components/features/admin/AdminCopilotClient.tsx`, `src/components/features/admin/SidebarContent.tsx`
  - **Acceptance criteria:**
    - [ ] Dedicated admin chat interface with quick task prompts, structured result cards, and centered `ConfirmDialog` before every database write action.
