# Changelog

Tous les changements notables du projet **Frozen Lunar** sont documentés ici.
Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

---

## [Unreleased]

### Planned
- Intégration de Sentry pour la télémétrie de production.
- SEO avancé (Structured Data & Sitemap dynamique).

---

## [1.0.0] — 2026-07-26 — Version 1.0.0 (V1 Production Release)

### Added

- **Suite de tests automatisés avec Vitest** (`vitest`, `@testing-library/react`, `jsdom`) :
    - 29 tests unitaires et d'intégration couvrant la validation Zod (`validation.test.ts`), la gestion d'erreurs Prisma (`error-handler.test.ts`), les utilitaires de date (`date-utils.test.ts`) et les Server Actions de devis (`quote-actions.test.ts`).
    - Script `"test": "vitest run"` et `"test:watch": "vitest"` dans `package.json`.
- **Typage des erreurs Prisma avec `instanceof`** (`TASK-002`) :
    - Gestion type-safe centralisée des erreurs Prisma (`PrismaClientKnownRequestError`, `PrismaClientInitializationError`, `PrismaClientValidationError`) via `handleError` dans `src/app/actions/quote-management.ts` et `src/app/actions/notification-management.ts`.
- **Pipeline de Tâches Asynchrones Upstash QStash & Workers** (`TASK-004`) :
    - Envois d'emails et générations de PDF déchargés de manière non-bloquante via QStash (`emailQueue`, `pdfQueue`) dans `src/lib/qstash.ts`.
    - Route Handlers sécurisés avec vérification de signature QStash (`src/app/api/workflow/email/route.ts` et `src/app/api/workflow/pdf/route.ts`).
- **Templates React Email complétés** (`TASK-005`) :
    - Template d'email de confirmation de demande de devis pour le client (`src/components/emails/QuoteConfirmationEmail.tsx`) avec branding aux couleurs HBC Logistique (#003366 Deep Blue, #FF6600 Industrial Orange) et récapitulatif détaillé.
    - Template de notification d'administration (`QuoteRequestEmail.tsx`) mis à jour pour le routing multi-destinataires.
- **Upload de Fichiers & Pièces Jointes Tigris S3** (`TASK-006`) :
    - Server Action `getPresignedUploadUrlAction` dans `src/app/actions/upload-management.ts` pour la génération d'URLs pré-signées sécurisées S3 avec validation des types MIME (PDF, JPG, PNG, WEBP) et taille max de 10 Mo.
    - Composant UI réutilisable `FileUpload.tsx` dans `src/components/features/FileUpload.tsx` avec drag-and-drop, indicateur de progression, prévisualisation, gestion d'erreurs et toasts.
    - Amélioration de `src/lib/storage.ts` avec support des URLs signées et mode dégradé dev.
    - 3 tests unitaires ajoutés dans `tests/unit/upload-actions.test.ts` (32 tests total validés).
- **Supabase Realtime pour le Dashboard Admin** (`TASK-007`) :
    - Écoute en temps réel des modifications de la table `quote` (`INSERT`, `UPDATE`, `DELETE`) dans `src/hooks/useRealtimeQuotes.ts`.
    - Intégration dans les pages admin (`DashboardPage` et `QuotesPage`) avec callbacks optimistes et notifications toast instantanées.
- **Headers de Sécurité HTTP** (`TASK-008`) :
    - Configuration centralisée dans `next.config.ts` des en-têtes de sécurité renforcés : HSTS, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` et `X-XSS-Protection`.
- **Rate Limiting Configurable via Variables d'Environnement** (`TASK-009`) :
    - Paramétrage dynamique de `RATE_LIMIT_MAX_REQUESTS` (défaut : 20) et `RATE_LIMIT_WINDOW_SECONDS` (défaut : 10s) dans `middleware.ts`.
    - Documentation des variables dans `.env.example`.
- **Logging Structuré avec Pino** (`TASK-010`) :
    - Implémentation du journaliseur Pino dans `src/lib/logger.ts` (`pino` 10.3) avec niveau de log dynamique (`LOG_LEVEL`), horodatage ISO et formatage JSON structuré.
    - Intégration dans le gestionnaire d'erreurs centralisé `src/lib/error-handler.ts` et mise à jour de la suite de tests (`error-handler.test.ts`).
- **Politiques de Sécurité Supabase RLS (Row Level Security)** (`TASK-011`) :
    - Fichier de migration SQL `prisma/migrations/20260726_enable_rls/migration.sql` activant le RLS sur toutes les tables (`quote`, `quote_history`, `user`, `session`, `account`, `verification`).
    - Règles de sécurité autorisant la création anonyme de devis par le public (`FOR INSERT TO anon`) et l'accès d'administration complet réservé aux utilisateurs authentifiés (`FOR ALL TO authenticated`).
- **Pipeline CI/CD avec GitHub Actions** (`TASK-012`) :
    - Création du workflow d'intégration continue `.github/workflows/ci.yml` exécutant le checkout, la configuration Node.js 20 & pnpm, `prisma generate`, ESLint, TypeScript `tsc`, Vitest (32 tests) et le test de build de production Next.js sur les branches `main`, `master` et `develop`.
- **Analyse compréhensive du design system & UI/UX** (`docs/DESIGN_SYSTEM_AND_UI_ANALYSIS.md`) :
    - Documentation point par point de l'esthétique Neo-Tech Industrial, des tokens HSL (Light/Dark), de la typographie Inter, de l'architecture des composants UI (shadcn/ui + features), du moteur d'animations (Framer Motion 12) et des règles canoniques pour les agents IA.
- **Migration vers pnpm** : Remplacement de `npm`/`package-lock.json` par `pnpm` (`pnpm-lock.yaml`, `pnpm-workspace.yaml`, et `.npmrc`).
- **Configuration Prettier & Tailwind CSS** : Ajout de `prettier` et `prettier-plugin-tailwindcss` pour le formatage automatique et le tri des classes Tailwind.
- **Équipe de 7 agents AI** pour le suivi du projet de bout en bout (`.agents/skills/`) :
    - `mission-control` — Orchestrateur central (briefing, revue critique, changelog)
    - `project-tracker` — Chef de projet (roadmap, backlog, `PROJECT_STATUS.md`)
    - `code-guardian` — Gardien de qualité (TypeScript strict, lint, conventions)
    - `fullstack-architect` — Architecte fullstack (patterns, placement, stack)
    - `security-sentinel` — Sentinelle sécurité (OWASP, secrets, RLS, auth)
    - `issue-resolver` — Résolveur de problèmes (tickets, bugs, améliorations)
    - `doc-writer` — Rédacteur technique (README, guides, API docs)
- **`.agents/AGENTS.md`** — Constitution du projet (stack, conventions, structure, gotchas).
- **`PROJECT_STATUS.md`** — Source de vérité unique sur l'état du projet.
- **`CHANGELOG.md`** — Suivi de l'historique du projet.
- Variables Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`) documentées dans `.env.example`.

### Changed

- Refactoring du composant `Header.tsx` pour isoler `MotionLink` hors du render body (conformité React 19).
- Déplacement et archivage de 11 anciens fichiers de documentation Markdown vers `docs/old/`.

---

## [0.3.0] — 2025-12-25

### Added

- **Système de gestion d'erreurs centralisé** (`src/lib/error-handler.ts` et `src/lib/error-codes.ts`).
- Guide des améliorations futures (`FUTURE_IMPROVEMENTS.md`).

### Fixed

- **Validation Email** : Correction de la saisie d'email invalide dans les composants d'authentification (PR #10).
- **AdminNotifications** : Correction de l'état `isLoading` manquant.
- **Zod v4** : Mise à jour des schémas et typages pour compatibilité Zod v4 (`issues` vs `errors`).
- Résolution des avertissements ESLint (imports, apostrophes, hooks).

---

## [0.2.0] — 2025-12-23 – 2025-12-24

### Added

- **Mise à niveau Prisma 6** (`^6.19.1`) et **Better-Auth** (`^1.4.8`) (PR #3).
- **Authentification & Protection des routes** :
    - Routes d'initialisation et de vérification admin (`/api/admin/init`, `/api/admin/check`).
    - Middleware Edge avec vérification du token de session et Rate Limiting Upstash Redis (20 req / 10s).
- **Server Actions Backend** :
    - `quote-management.ts` : Actions CRUD pour la gestion des devis.
    - `user-management.ts` & `notification-management.ts` : Gestion des utilisateurs et notifications admin.
- **Base de données PostgreSQL (Prisma)** :
    - Modèles d'authentification (`User`, `Session`, `Account`, `Verification`).
    - Modèles métier (`Quote`, `QuoteHistory`).
- **Roadmap & Architecture** : Document d'architecture (`ARCHITECTURE.md`) et roadmap backend modulaire (`backend_roadmap.md`).

### Changed

- Connexion du tableau de bord admin et du wizard de devis au backend PostgreSQL.

---

## [0.1.0] — 2025-11-27 – 2025-12-22

### Added

- **Fondations Next.js 16 (App Router) & React 19** avec TypeScript strict et Tailwind CSS 4.
- **Pages Publiques** :
    - Page d'accueil (`/`) avec Hero section, catalogue de services, FAQ, témoignages.
    - À propos (`/about`), Services (`/services`), Contact (`/contact`), Mentions légales & CGV (`/legal/*`).
- **Formulaire de Devis Multi-Étapes** (`/devis`) avec validation React Hook Form + Zod.
- **Assistant de Support IA** : Chatbot basé sur Google Gemini API avec fallback mock et guidage interactif de devis.
- **Interface Admin** (`/admin/*`) : Tableau de bord, modération des devis, gestion des contacts et utilisateurs, paramètres.
- **Composants UI** : Primitives shadcn/ui (Radix UI), animations Framer Motion, icônes Lucide.
- **Génération de PDF** : Exportation de devis au format PDF via jsPDF.
- Fichier `README.md` initial et documentation de la Phase UI (PR #1).
