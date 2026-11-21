# [SSOT] TASKS.md - Central Registry & Task Tracker

> Single Source of Truth (SSOT) for orchestrating technical and functional tasks.
> Absolute rule for AI Agents: Consult before every task, update immediately on completion.
> Strict ceiling: 250 lines.

---

## Synthetic Kanban View

```
+-------------------------+  +-------------------------+  +-------------------------+
| [>] IN PROGRESS (SP 05) |  |   [?] FUTURE BACKLOG    |  |       [X] ARCHIVES      |
+-------------------------+  +-------------------------+  +-------------------------+
| (Sprint 05 completed)   |  | [ ] Ready for Sprint 06 |  | [x] TASK-INIT-01        |
|                         |  |                         |  | [x] TASK-LOC-01..03     |
|                         |  |                         |  | [x] TASK-AI-01..03      |
|                         |  |                         |  | [x] TASK-SEC-01..03     |
|                         |  |                         |  | [x] TASK-CI-01..03      |
+-------------------------+  +-------------------------+  +-------------------------+
```

---

## Active Sprint 05: Côte d'Ivoire Localization & Compliant Support Agent

- [x] **`TASK-CI-01` - Côte d'Ivoire SSOT Config & Full Platform Localization (FCFA / +225 / OHADA)**
  - **Priority:** HIGH
  - **Target files:** `src/lib/company-config.ts`, `prisma/demo-data.json`, `src/lib/gemini.ts`, `src/lib/huggingface.ts`, `src/app/legal/mentions-legales/page.tsx`, `src/app/legal/cgv/page.tsx`, `src/app/contact/page.tsx`, `src/components/layout/Footer.tsx`, `src/components/layout/JsonLd.tsx`
  - **Acceptance criteria:**
    - [x] `TASK-CI-01.01`: Centralized Côte d'Ivoire company info (Abidjan, +225, FCFA, RCCM/NCC, ARTCI/OHADA) in `src/lib/company-config.ts`.
    - [x] `TASK-CI-01.02`: Replaced France mock data with Côte d'Ivoire corridors, FCFA pricing, `+225` WhatsApp normalization, and OHADA/ARTCI legal pages.

- [x] **`TASK-CI-02` - Compliant & Tool-Enabled Support Agent (Knowledge Base + Guardrails)**
  - **Priority:** HIGH
  - **Target files:** `src/lib/support-agent/knowledge.ts`, `src/lib/support-agent/tools.ts`, `src/lib/support-agent/config.ts`, `src/lib/gemini.ts`
  - **Acceptance criteria:**
    - [x] `TASK-CI-02.01`: Built structured SSOT Knowledge Base (`knowledge.ts`) with ARTCI (Loi n° 2013-450) & OHADA guardrails and anti-hallucination rules.
    - [x] `TASK-CI-02.02`: Implemented Zod-validated server-side tools (`tools.ts`) for verified quote status lookup, live `SystemSettings` lookup, and human ticket escalation.

- [x] **`TASK-CI-03` - Unit Tests & Deterministic RSI Validation**
  - **Priority:** HIGH
  - **Target files:** `tests/unit/support-agent-compliance.test.ts`, `tests/unit/ai-resilience.test.ts`, `tests/unit/huggingface.test.ts`, `docs/TASKS.md`
  - **Acceptance criteria:**
    - [x] `TASK-CI-03.01`: Updated CI localization tests (FCFA / +225) and added 5 compliance & PII-protection tests (95/95 total Vitest passed).
    - [x] `TASK-CI-03.02`: Validated with `python evals/run_fullstack_eval.py --quick` (100/100 PASS).

---

## Completed Tasks History

| Date | Task ID | Title & Description | Created / Modified Files |
| :--- | :--- | :--- | :--- |
| 2026-11-21 | `TASK-INIT-01` | RSI Protocol Initialization & Deterministic Baseline (100/100 PASS) | `.gitignore`, `docs/TASKS.md`, `docs/old/*.md`, `tests/unit/ai-resilience.test.ts` |
| 2026-11-21 | `TASK-LOC-01..03` | OpenStreetMap + Leaflet + shadcn Dynamic LocationPicker & Tests | `next.config.ts`, `src/lib/geocoding.ts`, `LocationPicker.tsx`, `InteractiveLocationMap.tsx`, `geocoding.test.ts` |
| 2026-11-21 | `TASK-AI-01..03` | Google Gemini 2.5 Flash Upgrade & OpenRouter Multi-Model Fallback | `src/lib/openrouter.ts`, `src/lib/gemini.ts`, `src/lib/huggingface.ts`, `ai-actions.ts`, `useSupportChat.ts`, `ChatHeader.tsx`, `openrouter.test.ts` |
| 2026-11-21 | `TASK-SEC-01..03` | Security Hardening (6 App Fixes) & Critical CVE Upgrades (0 Critical) | `auth.ts`, `workflow/email`, `workflow/pdf`, `upload-management.ts`, `middleware.ts`, `next.config.ts`, `package.json`, `pnpm-lock.yaml` |
| 2026-11-21 | `TASK-CI-01..03` | Côte d'Ivoire Localization (FCFA/+225/OHADA) & Compliant Support Agent | `company-config.ts`, `knowledge.ts`, `tools.ts`, `demo-data.json`, `gemini.ts`, `huggingface.ts`, `mentions-legales`, `cgv`, `contact`, `Footer`, `JsonLd`, `support-agent-compliance.test.ts` |
