# [SSOT] TASKS.md - Central Registry & Task Tracker

> Single Source of Truth (SSOT) for orchestrating technical and functional tasks.
> Strict ceiling: 250 lines. Archives: `docs/archive/tasks/SPRINT_01_05_ARCHIVE.md`.

---

## Synthetic Kanban View

```
+-------------------------+  +-------------------------+  +-------------------------+
| [>] NEXT UP             |  |  [?] ROADMAP            |  |       [X] ARCHIVES      |
+-------------------------+  +-------------------------+  +-------------------------+
| All Planned Sprints     |  |                         |  | [x] SP 01..05 (Archived)|
| Completed (SP 06..11)   |  |                         |  | [x] TASK-LOC2-01..03    |
|                         |  |                         |  | [x] TASK-BOT-01..03     |
|                         |  |                         |  | [x] TASK-UPT-01..02     |
|                         |  |                         |  | [x] TASK-FLT-01..03     |
|                         |  |                         |  | [x] TASK-PRT-01..02     |
|                         |  |                         |  | [x] TASK-USR-01..03     |
+-------------------------+  +-------------------------+  +-------------------------+
```

---

## Completed Sprint 06: Complete Africa/CI Localization, OHADA Legal, X Branding & Resend

- [x] **`TASK-LOC2-01` - Eradicate Remaining France/Euro References & Twitter -> X**
  - **Priority:** HIGH
  - **Target files:** `src/components/features/FAQSection.tsx`, `src/components/layout/Footer.tsx`, `src/components/features/QuoteWizard.tsx`, `src/components/features/admin/BusinessAnalytics.tsx`, `src/app/actions/settings-actions.ts`, `src/app/admin/settings/components/SettingsClient.tsx`, `src/app/admin/dashboard/page.tsx`, `src/app/admin/quotes/[id]/page.tsx`, `src/lib/pdf.ts`, `src/lib/pdf-generator.ts`, `src/lib/support-agent/tutorials.ts`, `src/app/layout.tsx`
  - **Acceptance criteria:**
    - [x] Zero remaining France/Ile-de-France/Euro/`+33` strings in UI, FAQ, admin analytics, settings, PDFs, and tutorials.
    - [x] Replaced Twitter icon/link with official X SVG icon and accessible ARIA label.

- [x] **`TASK-LOC2-02` - Industry-Grade OHADA/AUCTMR CGV & ARTCI Legal Notices**
  - **Priority:** HIGH
  - **Target files:** `src/app/legal/cgv/page.tsx`, `src/app/legal/mentions-legales/page.tsx`
  - **Acceptance criteria:**
    - [x] Full transport/logistics CGV aligned with OHADA AUCTMR (consignment note, demurrage, cargo insurance, liability limits, force majeure, UEMOA/Mobile Money payment).
    - [x] Full Mentions Legales aligned with Loi ARTCI n° 2013-450 & Loi n° 2013-546 (electronic transactions).

- [x] **`TASK-LOC2-03` - Resend Verification, Configurable Sender & Alert Email Templates**
  - **Priority:** HIGH
  - **Target files:** `src/lib/email.ts`, `src/lib/qstash.ts`, `src/app/api/workflow/email/route.ts`, `src/components/emails/`, `tests/unit/email-workflows.test.ts`
  - **Acceptance criteria:**
    - [x] Added `EMAIL_FROM` env var & `isResendConfigured()`, dev loopback QStash guard, and React Email alert templates (`AdminAlertEmail`, `PartnerApplicationEmail`, `QuoteStatusUpdateEmail`) verified with `email-workflows.test.ts` (99/99 Vitest, 100/100 RSI PASS).

---

## Completed Sprint 07: Dual-Mode Support Agent (Mode IA vs Mode Robot) & Interactive Quote Flow

- [x] **`TASK-BOT-01` - Dual-Mode Architecture (Mode IA Humain vs Mode Robot Cadré)**
  - **Priority:** HIGH
  - **Target files:** `src/hooks/useSupportChat.ts`, `src/components/features/support/components/ChatHeader.tsx`, `src/components/features/support/SupportChatModal.tsx`, `src/lib/support-agent/config.ts`, `src/lib/support-agent/mock-responses.ts`
  - **Acceptance criteria:**
    - [x] Replaced "Mode Autonome" with explicit **Mode IA** (`Mode IA • Gemini` / `Mode IA • OpenRouter`, concise 2-3 sentences) and **Mode Robot** (deterministic fallback & manual toggle that politely redirects off-topic queries).

- [x] **`TASK-BOT-02` - Anti-Drift Guardrails, Interactive Quote Configurator & Tool Fixes**
  - **Priority:** HIGH
  - **Target files:** `src/lib/support-agent/knowledge.ts`, `src/lib/support-agent/tools.ts`, `src/lib/gemini.ts`, `src/app/actions/ai-actions.ts`
  - **Acceptance criteria:**
    - [x] Fixed `SystemSettings` lookup (`id: "default"`), enforced anti-verbosity / anti-prompt-injection (`<client_message>`) / anti-off-topic guardrails, and wired interactive quote configuration (`suggestedAction`).

- [x] **`TASK-BOT-03` - Dual-Mode Compliance Tests & RSI Validation**
  - **Priority:** MEDIUM
  - **Target files:** `tests/unit/support-agent-compliance.test.ts`
  - **Acceptance criteria:**
    - [x] Verified Mode IA, Mode Robot off-topic redirection, `SystemSettings` lookup, and prompt guardrails (`100/100` Vitest tests passed, `100/100` RSI PASS).

---

## Completed Sprint 08: Dependencies Uptime & Service Health Page

- [x] **`TASK-UPT-01` - Secure Health Probe Endpoint (`/api/health`) & Alerting**
  - **Priority:** HIGH
  - **Target files:** `src/app/api/health/route.ts`, `src/lib/health-check.ts`, `src/app/actions/health-actions.ts`, `tests/unit/health-check.test.ts`
  - **Acceptance criteria:**
    - [x] Rate-limited & Redis-cached (30s) health checks (3s timeout, zero secrets leaked) for Supabase/Postgres, Redis, QStash, Tigris S3, Resend, Gemini 2.5, OpenRouter, OpenStreetMap (Photon/Nominatim).
    - [x] Trigger deduplicated Resend admin warning email (30-min Redis lock with memory fallback) on critical dependency outage.

- [x] **`TASK-UPT-02` - Dedicated Uptime Dashboard UI (`/status` & `/admin/status`)**
  - **Priority:** MEDIUM
  - **Target files:** `src/app/status/page.tsx`, `src/app/admin/status/page.tsx`, `src/components/features/status/StatusDashboard.tsx`
  - **Acceptance criteria:**
    - [x] 100% shadcn responsive Mobile-First UI with Framer Motion, live refresh, latency indicators, and admin-only Resend test button (`105/105` Vitest, `100/100` RSI PASS).

---

## Completed Sprint 09: African Fleet Portfolio, Stock Management & Quote Vehicle Step

- [x] **`TASK-FLT-01` - Prisma `Vehicle` Schema, RLS & West Africa Seed Catalog**
  - **Priority:** HIGH
  - **Target files:** `prisma/schema.prisma`, `prisma/migrations/20261122_add_vehicle_fleet/migration.sql`, `src/lib/fleet-catalog.ts`
  - **Acceptance criteria:**
    - [x] Added `Vehicle` model + `VehicleCategory` enum + `Quote.vehicleId` & `Quote.vehicleQuantity` + Supabase RLS policies + 10-vehicle West African seed catalog.

- [x] **`TASK-FLT-02` - Styled Fleet Portfolio (`/flotte`) & Admin Fleet Manager (`/admin/fleet`)**
  - **Priority:** HIGH
  - **Target files:** `src/app/flotte/page.tsx`, `src/app/admin/fleet/page.tsx`, `src/app/actions/fleet-actions.ts`, `src/components/features/fleet/`
  - **Acceptance criteria:**
    - [x] Showcased African fleet (Bus 64 places, Coaster 30 places, Pick-up 4x4, Porte-char 40-70T, Porte-conteneur 20'/40', Plateau 12m, Bennes 6x4/8x4, Semi-benne 35-50m3, Camion-grue Hiab, Fourgon 3.5T) with live `Qté: 02 disponibles` badges & full admin CRUD + quick stock controls.

- [x] **`TASK-FLT-03` - `QuoteWizard` Vehicle Selection Step (`StepVehicle`)**
  - **Priority:** HIGH
  - **Target files:** `src/components/features/quote-wizard/steps/StepVehicle.tsx`, `src/components/features/QuoteWizard.tsx`, `src/app/actions/quote-management.ts`, `tests/unit/fleet-catalog.test.ts`
  - **Acceptance criteria:**
    - [x] Added Step 2 vehicle selector displaying live available stock, disabled/on-request state for `0` stock, `?vehicle=<slug>` URL pre-selection, and atomic server-side Zod + availability validation (`109/109` Vitest, `100/100` RSI PASS).

- [x] **`TASK-FLT-04` - Fleet Page Design System Alignment, Vehicle Illustrations & Public Layout Compliance**
  - **Priority:** HIGH
  - **Target files:** `src/lib/fleet-catalog.ts`, `src/components/features/fleet/FleetPortfolioClient.tsx`, `src/app/flotte/page.tsx`, `src/app/partenaires/page.tsx`, `src/app/status/page.tsx`, `src/app/espace-client/page.tsx`
  - **Acceptance criteria:**
    - [x] Aligned `/flotte` (and public portals) with site-wide layout (`Header`, `Footer`, `SectionContainer`, `FadeIn`, `ScrollReveal`, `AnimatedCard`, `border-2 hover:border-primary/50`, `/devis?vehicle=` CTA) and added verified online illustration photos for all 10 fleet vehicles (`100/100` RSI PASS).

---

## Completed Sprint 10: Africa Partner Onboarding Portal

- [x] **`TASK-PRT-01` - Prisma `PartnerApplication` Model, KYC S3 Uploads & Server Actions**
  - **Priority:** HIGH
  - **Target files:** `prisma/schema.prisma`, `prisma/migrations/20261122_add_partner_application/migration.sql`, `src/app/actions/partner-actions.ts`, `src/app/actions/upload-management.ts`, `src/lib/storage.ts`, `src/lib/redis.ts`
  - **Acceptance criteria:**
    - [x] Added `PartnerApplication` schema (UEMOA/CEDEAO country, city, RCCM/NCC, fleet inventory, private KYC documents in S3 folder `partners-kyc` with `publicUrl: null` and 300s signed URLs behind `requireAdmin()`), Supabase RLS policies (public INSERT only), Zod validation, and rate limiting.

- [x] **`TASK-PRT-02` - Partner Application Page (`/partenaires`) & Admin Approval (`/admin/partners`)**
  - **Priority:** HIGH
  - **Target files:** `src/app/partenaires/page.tsx`, `src/app/admin/partners/page.tsx`, `src/components/features/partners/`, `tests/unit/partner-actions.test.ts`
  - **Acceptance criteria:**
    - [x] Multi-step 3-stage shadcn Mobile-First form + Resend confirmation/alert emails + admin KYC review workflow (`113/113` Vitest, `100/100` RSI PASS).

---

## Completed Sprint 11: Client/Business User Space & Hybrid AI + Human Chat

- [x] **`TASK-USR-01` - Client Account Schema (`CompanyProfile`, `Quote.userId`) & Strict IDOR Isolation**
  - **Priority:** CRITICAL
  - **Target files:** `prisma/schema.prisma`, `prisma/migrations/20261122_add_client_space_and_hybrid_chat/migration.sql`, `src/lib/auth-guard.ts`, `tests/unit/client-space-idor.test.ts`
  - **Acceptance criteria:**
    - [x] Enforced strict ownership checks (`requireQuoteOwnershipOrAdmin` with `userId === session.user.id`) + Supabase RLS on `company_profile`, `support_thread`, and `support_message`.

- [x] **`TASK-USR-02` - Client Portal UI (`/espace-client`)**
  - **Priority:** HIGH
  - **Target files:** `src/app/espace-client/page.tsx`, `src/app/espace-client/quotes/[id]/page.tsx`, `src/components/features/client/ClientSpaceDashboard.tsx`, `src/app/actions/client-space-actions.ts`
  - **Acceptance criteria:**
    - [x] Dashboard for recurring clients/businesses: inline B2B authentication, saved addresses & RCCM/NCC company profile, quote history, PDF downloads, and 1-click reorder.

- [x] **`TASK-USR-03` - Hybrid AI + Human Validator Internal Chat (`SupportThread` + Realtime)**
  - **Priority:** HIGH
  - **Target files:** `src/app/actions/thread-actions.ts`, `src/components/features/client/OrderChat.tsx`, `src/app/admin/quotes/[id]/page.tsx`
  - **Acceptance criteria:**
    - [x] Real-time order chat with selective Supabase Realtime subscription, optimistic UI, concise AI triage, and seamless `HUMAN_TAKEOVER` pause by admin validators (`116/116` Vitest, `100/100` RSI PASS).
