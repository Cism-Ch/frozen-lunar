# Archive — Sprints 24 to 31

- **Sprint 24 (`a5b8a69`)**: `TASK-SEC-01..03` — Binary magic-byte upload verification, `fleet-images` auth parity, Upstash Redis rate limiting, CSP hardening, security regression test suite.
- **Sprint 25 (`0d956a9`)**: `TASK-BUG-01..03` — Preserved `attachments` in `createQuoteAction`, fixed `searchAdminAction` (`trackingCode`, `CANCELLED`, admin nav routes), replaced `#id.slice(0,8)` with `formatQuoteReference` in `thread-actions.ts`.
- **Sprint 26 (`1b0f073`)**: `TASK-CLN-01..02` — Migrated `/admin/dashboard` to live-synced `QuoteDetailsModal`, deleted dead `QuoteDetailsSheet.tsx`, fixed `health-check.ts` SMTP provider check.
- **Sprint 27**: `TASK-RSI-01` — Enriched RSI rule modules (`[R-SEC-05..06]`, `[R-API-05..06]`, `[R-UI-05..06]`, `[R-PAT-07]`).
- **Sprint 28 (`1b49985`)**: `TASK-QWS-01..04` — Quote Workspace & Pricing Studio overhaul, vehicle × quantity pricing, server-side `draftEmailAction` + `sendAdminQuoteEmailAction`, PDF breakdown export, `CANCELLED` status guard.
- **Sprint 29 (`c8328f3`)**: `TASK-UX-01..02`, `TASK-SUP-01` — Dynamic zero-overlap A4 PDF template (`sanitizePdfText`), post-quote stay vs view quotes modal, interactive support tests fixing `HBC-2026-XXXX` regex truncation & email validation.
- **Sprint 30 (`1ca81f9`)**: `TASK-REF-01..03` — Timestamped `HBC-YYYY-HHMMSS-XXXXXX` tracking codes, fixed email/PDF queue payloads, added `HH:mm` deadline time picker in `StepDate`, fixed `lookupQuoteStatusTool` `trackingCode` search.
- **Sprint 31 (`e69aef0`)**: `TASK-UX-03`, `TASK-SEC-04` — Fixed mobile drawer `ThemeToggle` (`resolvedTheme`, no floating `absolute` icon, 44px target), added authenticated `GET /api/attachments/[...key]` proxy (`?download=1`), updated realistic isometric Hero visual.
