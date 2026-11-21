# [SSOT] TASKS.md - Central Registry & Task Tracker

> Single Source of Truth (SSOT) for orchestrating technical and functional tasks.
> Absolute rule for AI Agents: Consult before every task, update immediately on completion.
> Strict ceiling: 250 lines.

---

## Synthetic Kanban View

```
+-------------------------+  +-------------------------+  +-------------------------+
| [>] IN PROGRESS (SP 02) |  |   [?] FUTURE BACKLOG    |  |       [X] ARCHIVES      |
+-------------------------+  +-------------------------+  +-------------------------+
| (Sprint 02 completed)   |  | [ ] Ready for Sprint 03 |  | [x] TASK-INIT-01        |
|                         |  |                         |  | [x] TASK-LOC-01         |
|                         |  |                         |  | [x] TASK-LOC-02         |
|                         |  |                         |  | [x] TASK-LOC-03         |
+-------------------------+  +-------------------------+  +-------------------------+
```

---

## Active Sprint 02: Dynamic Location Selection (OpenStreetMap + Leaflet + shadcn)

- [x] **`TASK-LOC-01` - Open-Source Geocoding Service & CSP Hardening**
  - **Priority:** HIGH
  - **Target files:** `next.config.ts`, `src/lib/geocoding.ts`, `package.json`
  - **Acceptance criteria:**
    - [x] `TASK-LOC-01.01`: Install `leaflet` (1.9.4), `react-leaflet` (5.0.0), `@types/leaflet` (1.9.22).
    - [x] `TASK-LOC-01.02`: Update `next.config.ts` CSP (`connect-src`) for Photon (`photon.komoot.io`) and Nominatim (`nominatim.openstreetmap.org`).
    - [x] `TASK-LOC-01.03`: Implement Zod-validated geocoding service (`src/lib/geocoding.ts`) supporting Photon forward search & Nominatim reverse geocoding.

- [x] **`TASK-LOC-02` - Interactive LocationPicker & Leaflet Map Modal (100% shadcn)**
  - **Priority:** HIGH
  - **Target files:** `src/components/features/LocationPicker.tsx`, `src/components/features/InteractiveLocationMap.tsx`
  - **Acceptance criteria:**
    - [x] `TASK-LOC-02.01`: Real-time address autocomplete using exclusively shadcn components (`Popover`, `Input`, `ScrollArea`, `Skeleton`, `Button`, `Badge`) with keyboard navigation, ARIA attributes, and Framer Motion transitions.
    - [x] `TASK-LOC-02.02`: Real GPS geolocation with Nominatim reverse geocoding and all 4 UI states (loading, error, empty, data).
    - [x] `TASK-LOC-02.03`: SSR-safe dynamic Leaflet map inside shadcn `Dialog` (`InteractiveLocationMap.tsx`) with click-to-pin, draggable marker, reverse geocoding preview, and Mobile-First layout (>= 44px touch targets).

- [x] **`TASK-LOC-03` - Unit Tests & Deterministic RSI Validation**
  - **Priority:** MEDIUM
  - **Target files:** `tests/unit/geocoding.test.ts`, `docs/TASKS.md`
  - **Acceptance criteria:**
    - [x] `TASK-LOC-03.01`: Unit tests for `src/lib/geocoding.ts` (5/5 passed, 84/84 total Vitest suite).
    - [x] `TASK-LOC-03.02`: Validated with `pnpm test`, `pnpm run build`, and `python evals/run_fullstack_eval.py` (typecheck, lint, security_audit, memory hygiene, eval tests).

---

## Completed Tasks History

| Date | Task ID | Title & Description | Created / Modified Files |
| :--- | :--- | :--- | :--- |
| 2026-11-21 | `TASK-INIT-01` | RSI Protocol Initialization & Deterministic Baseline (100/100 PASS) | `.gitignore`, `docs/TASKS.md`, `docs/old/*.md`, `tests/unit/ai-resilience.test.ts` |
| 2026-11-21 | `TASK-LOC-01` | Open-Source Geocoding Service (Photon + Nominatim) & CSP Hardening | `package.json`, `next.config.ts`, `src/lib/geocoding.ts` |
| 2026-11-21 | `TASK-LOC-02` | Interactive LocationPicker & Leaflet Map Modal (100% shadcn + Framer Motion) | `src/components/features/LocationPicker.tsx`, `src/components/features/InteractiveLocationMap.tsx` |
| 2026-11-21 | `TASK-LOC-03` | Unit Tests & Full Validation (84/84 Vitest, Next.js build 28/28, RSI checks) | `tests/unit/geocoding.test.ts`, `docs/TASKS.md` |
