# [SSOT] TASKS.md - Central Registry & Task Tracker

> Single Source of Truth (SSOT) for orchestrating technical and functional tasks.
> Absolute rule for AI Agents: Consult before every task, update immediately on completion.
> Strict ceiling: 250 lines.

---

## Synthetic Kanban View

```
+-------------------------+  +-------------------------+  +-------------------------+
| [>] IN PROGRESS (SP 03) |  |   [?] FUTURE BACKLOG    |  |       [X] ARCHIVES      |
+-------------------------+  +-------------------------+  +-------------------------+
| (Sprint 03 completed)   |  | [ ] Ready for Sprint 04 |  | [x] TASK-INIT-01        |
|                         |  |                         |  | [x] TASK-LOC-01..03     |
|                         |  |                         |  | [x] TASK-AI-01..03      |
+-------------------------+  +-------------------------+  +-------------------------+
```

---

## Active Sprint 03: AI Upgrade (Google Gemini 2.5 Flash + OpenRouter Fallback)

- [x] **`TASK-AI-01` - OpenRouter Client & Environment Configuration**
  - **Priority:** HIGH
  - **Target files:** `src/lib/openrouter.ts`, `.env.example`
  - **Acceptance criteria:**
    - [x] `TASK-AI-01.01`: Zod-validated OpenRouter OpenAI-compatible client (`src/lib/openrouter.ts`) with timeout, key sanitization, and safe JSON extraction.
    - [x] `TASK-AI-01.02`: Documented `GEMINI_MODEL`, `OPENROUTER_API_KEY`, and `OPENROUTER_MODEL` in `.env.example`.

- [x] **`TASK-AI-02` - Gemini 2.5 Flash Migration & 3-Tier AI Resilience Chain**
  - **Priority:** HIGH
  - **Target files:** `src/lib/gemini.ts`, `src/lib/huggingface.ts`, `src/app/actions/ai-actions.ts`, `src/hooks/useSupportChat.ts`, `src/components/features/support/components/ChatHeader.tsx`
  - **Acceptance criteria:**
    - [x] `TASK-AI-02.01`: Upgraded all `gemini-1.5-flash` calls in `src/lib/gemini.ts` & `ai-actions.ts` to configurable `gemini-2.5-flash` (`GEMINI_MODEL`).
    - [x] `TASK-AI-02.02`: Wired automatic OpenRouter fallback in `estimateTransport`, `draftEmail`, `generateSupportAiResponse`, `generateWhatsAppMessage`, and chat status UI.

- [x] **`TASK-AI-03` - Unit Tests & Deterministic RSI Validation**
  - **Priority:** MEDIUM
  - **Target files:** `tests/unit/openrouter.test.ts`, `docs/TASKS.md`
  - **Acceptance criteria:**
    - [x] `TASK-AI-03.01`: Added 6 unit tests in `tests/unit/openrouter.test.ts` (21/21 AI tests passed).
    - [x] `TASK-AI-03.02`: Validated with `python evals/run_fullstack_eval.py --quick` (100/100 PASS).

---

## Completed Tasks History

| Date | Task ID | Title & Description | Created / Modified Files |
| :--- | :--- | :--- | :--- |
| 2026-11-21 | `TASK-INIT-01` | RSI Protocol Initialization & Deterministic Baseline (100/100 PASS) | `.gitignore`, `docs/TASKS.md`, `docs/old/*.md`, `tests/unit/ai-resilience.test.ts` |
| 2026-11-21 | `TASK-LOC-01..03` | OpenStreetMap + Leaflet + shadcn Dynamic LocationPicker & Tests | `next.config.ts`, `src/lib/geocoding.ts`, `LocationPicker.tsx`, `InteractiveLocationMap.tsx`, `geocoding.test.ts` |
| 2026-11-21 | `TASK-AI-01..03` | Google Gemini 2.5 Flash Upgrade & OpenRouter Multi-Model Fallback | `src/lib/openrouter.ts`, `src/lib/gemini.ts`, `src/lib/huggingface.ts`, `ai-actions.ts`, `useSupportChat.ts`, `ChatHeader.tsx`, `openrouter.test.ts` |
