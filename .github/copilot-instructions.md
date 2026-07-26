# Copilot Instructions for frozen-lunar

## Build & Environment

- Run `npm run dev` for local work, `npm run build` + `npm run start` for previews, and `npm run lint` for ESLint (Next.js 16 App Router setup).
- Set `NEXT_PUBLIC_GEMINI_API_KEY` before touching the Gemini helpers; without it `geminiService` falls back to mocks ([../src/lib/gemini.ts](../src/lib/gemini.ts)).

## Architecture & Styling

- Public marketing flows live under [../src/app](../src/app) with server layouts plus client sections; the landing page assembles feature sections in [../src/app/page.tsx](../src/app/page.tsx) using motion helpers.
- All typography/layout primitives live in [../src/components/layout](../src/components/layout) (e.g. `Header`, `Footer`, `SectionContainer`), and rely on the `ThemeProvider` & `Toaster` injected in [../src/app/layout.tsx](../src/app/layout.tsx).
- Marketing copy/images are data-driven; service cards read from [../src/config/marketing.ts](../src/config/marketing.ts) rather than inline strings.

## Quotes & Admin Surfaces

- The multi-step quote form is consolidated in [../src/components/features/QuoteWizard.tsx](../src/components/features/QuoteWizard.tsx) using `react-hook-form` + Zod per-step validation; extend it by adding new steps + updating `TOTAL_STEPS` and the `nextStep` validation map.
- Persisted quote data is browser-only via `localStorage` in [../src/lib/quote-storage.ts](../src/lib/quote-storage.ts); any call site must run on the client and typically hydrate inside `useEffect` (see [../src/app/admin/quotes/page.tsx](../src/app/admin/quotes/page.tsx)).
- Admin layout, table views, and drill-ins live under [../src/app/admin](../src/app/admin); the shell in [../src/app/admin/layout.tsx](../src/app/admin/layout.tsx) expects client components because of routing, animations, and storage access.
- Quote drill-ins, PDF export, and status changes are centralized in [../src/components/features/QuoteDetailsSheet.tsx](../src/components/features/QuoteDetailsSheet.tsx); reuse its helpers instead of duplicating formatting logic.
- PDF exports rely on jsPDF/autotable in [../src/lib/pdf-generator.ts](../src/lib/pdf-generator.ts); only call inside client interactions (jsPDF touches `window`).

## Support Assistant

- The floating chat entrypoint is added in [../src/app/layout.tsx](../src/app/layout.tsx) via `SupportChatButton`; the full experience is managed in [../src/components/features/support/SupportChatModal.tsx](../src/components/features/support/SupportChatModal.tsx).
- Conversation logic is mocked but structured: responses + quick replies come from [../src/lib/support-agent/mock-responses.ts](../src/lib/support-agent/mock-responses.ts) and tutorial metadata in [../src/lib/support-agent/tutorials.ts](../src/lib/support-agent/tutorials.ts).
- Guided quote capture inside chat uses the finite-state machine in [../src/lib/support-agent/quote-flow.ts](../src/lib/support-agent/quote-flow.ts); it writes into the same `quoteStorage`, so any schema changes must be mirrored both in the wizard and the flow definitions.

## UI & Motion Conventions

- UI atoms originate from the shadcn-based library in [../src/components/ui](../src/components/ui); prefer composing those before adding new design systems.
- Framer Motion wrappers live in [../src/components/ui/motion.tsx](../src/components/ui/motion.tsx) and helper configs live in [../src/lib/animations.ts](../src/lib/animations.ts); reuse these animated components for consistent transitions.
- TypeScript path aliases (`@/*`) are configured in [tsconfig.json](../tsconfig.json); keep imports absolute through that alias to avoid brittle relative paths.
- variants of shared components (e.g. buttons, inputs) are defined via props in their source files; avoid creating separate files for minor stylistic changes.
- ensure new components are responsive by default, using existing layout components and CSS utilities.
- follow existing design tokens and theming conventions defined in the project for colors, spacing, and typography.
- use Framer Motion for animations, adhering to the established patterns in the codebase.
- prefer composition over inheritance when building new UI components to maintain flexibility and reusability.
- review existing components for similar functionality before creating new ones to promote code reuse.
- document new components with clear prop definitions and usage examples.
- organize component files and folders logically to reflect their purpose and relationships within the project.
- p

## Next.js App Practices

- Use App Router conventions: each route folder under [../src/app](../src/app) can include `page.tsx`, `layout.tsx`, and `loading.tsx`; lean on server components for static content and mark stateful pieces with `"use client"` (see [../src/app/page.tsx](../src/app/page.tsx)).
- Global providers (theme, toasts, floating widgets) belong in [../src/app/layout.tsx](../src/app/layout.tsx); avoid re-instantiating them per page to keep hydration stable.
- Prefer streaming-friendly patterns (async server components, Suspense boundaries) when fetching data; marketing sections already split into composable components for this reason.
- Keep metadata centralized via exported `metadata` objects per route (example in [../src/app/layout.tsx](../src/app/layout.tsx)); when adding new pages, define titles/descriptions there instead of manual `<Head>` usage.
- When introducing API interactions, add server actions under [../src/server/actions](../src/server/actions) or route handlers under [../src/app/api](../src/app/api) to stay aligned with Next.js 16 capabilities.
- For assets and fonts, rely on `next/font` and the `public/` folder; avoid importing remote fonts manually since the app already uses the configured `Inter` font in the root layout.

## Gotchas & Tips

- Because `quoteStorage` and the PDF/Gemini utilities touch browser APIs, keep them out of server components or guard with `typeof window` checks just like the existing modules.
- Admin routes assume authenticated context but have no backend; avoid introducing server-only code there unless you also replace the storage layer.
- The site is French-first: new copy should stay localized, and any CTA/Badge text should match the tone already used in [../src/app/page.tsx](../src/app/page.tsx).
- Motion-heavy components respect reduced-motion preferences (see [../src/app/admin/layout.tsx](../src/app/admin/layout.tsx)); follow the same pattern when adding new animations.

## TypeScript Guidelines

- Follow strict typing conventions; avoid using `any` or `unknown` without proper type guards.
- Leverage existing types in src/types to maintain consistency across the codebase.
- When defining new types or interfaces, ensure they are well-documented and follow the existing naming conventions.
- Use Zod schemas for runtime validation of data structures, especially for AI responses and external data.
- Ensure all functions and methods have explicit return types for better readability and maintainability.
- avoid deeply nested types; consider breaking them down into smaller, reusable types or interfaces.
- avoid using `any` type; prefer `unknown` with proper type narrowing.
- ensure all asynchronous functions return a Promise with a defined type.
- add comments to complex type definitions to explain their purpose and usage.
- regularly review and refactor types to keep the codebase clean and efficient.
- adopt utility types from TypeScript where applicable to reduce redundancy.
- name types and interfaces clearly to reflect their intent and usage within the application.
- Handle unused `catch` variables explicitly to satisfy ESLint (`@typescript-eslint/no-unused-vars`):
- Treat caught errors as first-class values; do not leave `catch` variables unused. Preferred patterns:
    - Prefer typing the caught value as `unknown` and narrow before use:
        - `catch (error: unknown) { if (error instanceof Error) console.error(error.message); /* handle */ }`
    - If you need to handle details, log or re-throw: `catch (error: unknown) { console.error(error); throw error; }`.
    - Avoid disabling `@typescript-eslint/no-unused-vars` globally; if necessary, add a short inline comment explaining why at the catch-site.
    - In short: always handle, log, re-throw, or narrow — do not leave `error` unused.
- When a component lives under [../src/app](../src/app), prefer deriving props from data sources instead of duplicating shapes (e.g. `type QuoteFormValues = z.infer<typeof formSchema>` in [../src/components/features/QuoteWizard.tsx](../src/components/features/QuoteWizard.tsx)); this keeps form state, server actions, and admin views on the same contract.

```md
---

description: This file provides instructions for contributors working on the frozen-lunar project.
```
