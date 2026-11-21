# 📋 Frozen Lunar — État du Projet

> **Dernière mise à jour** : 2026-10-23  
> **Mis à jour par** : doc-writer / fullstack-architect / project-tracker  
> **Version** : 1.5.0 (Admin Dashboard & Quote Management 2026 UI/UX Overhaul)

---

## Phase Actuelle

**Phase 3 — Production & Deployment** 🔄 En cours (~95%)

> Les phases 1 (UI) et 2 (Backend & Asynchronous Infrastructure) sont intégralement terminées (100%). L'application dispose d'une suite de **79 tests automatisés** (Vitest, 12 suites réussies, 100% pass), d'un hub de contacts admin refondu adossé à PostgreSQL Supabase (`ContactMessage`), d'un tableau de bord moderne avec graphiques dynamiques (`ActivityChart`, `BusinessAnalytics`), d'une gestion des devis unifiée avec badges cohérents (`QuoteStatusBadge`), d'un panneau latéral de consultation rapide (`QuoteDetailsSheet`) révisé aux normes 2026 avec WhatsApp 1-Clic, export CSV Excel UTF-8 BOM, dialogue de confirmation accessible (`ConfirmDialog`), réinitialisation universelle de mot de passe par email, omnibar de recherche globale Ctrl+K (`AdminCommandPalette`), notifications réelles en temps réel, résilience IA multi-niveaux (Gemini 1.5 + Fail-Safe heuristique), rate limiting Upstash Redis, workers asynchrones QStash, emails HTML typés Resend, upload S3 Tigris, Supabase Realtime, logging Pino, RLS Supabase et pipeline CI/CD GitHub Actions.
> La constitution unifiée des agents est centralisée à la racine du projet dans [AGENTS.md](AGENTS.md).

---

## Avancement des Phases

| Phase | Nom                 | Statut      | Progression | Notes                                                                                                                                        |
| ----- | ------------------- | ----------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | UI Implementation   | ✅ Terminé  | 100%        | Landing page, admin, wizard devis, support chat (responsive, 0 émojis), thèmes clair/sombre, accessibilité WCAG AA/AAA                       |
| 2     | Backend Integration | ✅ Terminé  | 100%        | Auth Better-Auth (4 rôles) ✅, Hub Contacts & Inbox DB ✅, Password Reset Universel ✅, Quotes CRUD ✅, QStash/Email/S3/Realtime/Pino/RLS ✅ |
| 3     | Production Ready    | 🔄 En cours | ~95%        | Tests Vitest (79 tests / 12 suites) ✅, CI/CD ✅, Command Palette Ctrl+K ✅, Notifications Réelles ✅, WhatsApp 1-Clic ✅, Refonte Devis ✅  |

---

## Inventaire du Code

### Routes (19 pages)

| Route                     | Type   | Statut                                                     |
| ------------------------- | ------ | ---------------------------------------------------------- |
| `/`                       | Public | ✅ Landing page avec hero, services, FAQ, témoignages      |
| `/about`                  | Public | ✅ Page "À propos"                                         |
| `/contact`                | Public | ✅ Formulaire de contact public adossé à PostgreSQL        |
| `/devis`                  | Public | ✅ Wizard multi-étapes (4 steps) avec validation Zod       |
| `/services`               | Public | ✅ Catalogue des services                                  |
| `/legal/cgv`              | Public | ✅ CGV                                                     |
| `/legal/mentions-legales` | Public | ✅ Mentions légales                                        |
| `/auth/forgot-password`   | Public | ✅ Demande universelle de réinitialisation (Admin/User)    |
| `/auth/reset-password`    | Public | ✅ Page de réinitialisation avec jeton sécurisé            |
| `/admin/login`            | Admin  | ✅ Page de connexion Better-Auth                           |
| `/admin/forgot-password`  | Admin  | ✅ Alias dédié réinitialisation espace administration      |
| `/admin/reset-password`   | Admin  | ✅ Alias dédié définition nouveau mot de passe admin       |
| `/admin/init`             | Admin  | ✅ Initialisation sécurisée du premier compte admin        |
| `/admin/dashboard`        | Admin  | ✅ Tableau de bord avec graphiques d'activité & analytics  |
| `/admin/quotes`           | Admin  | ✅ Liste complète des devis avec filtres & export CSV      |
| `/admin/quotes/[id]`      | Admin  | ✅ Détail d'un devis avec timeline, relance WhatsApp & PDF |
| `/admin/contacts`         | Admin  | ✅ Gestion des contacts (inbox messages & répertoire)      |
| `/admin/users`            | Admin  | ✅ Gestion des utilisateurs et attributions de rôles       |
| `/admin/settings`         | Admin  | ✅ Paramètres entreprise, notifications & WhatsApp IA      |

### Composants (75 fichiers .tsx dans `src/components` + 5 colocalisés dans `src/app/admin`)

| Catégorie                           | Nombre | Exemples                                                                            |
| ----------------------------------- | ------ | ----------------------------------------------------------------------------------- |
| UI Primitives (shadcn/ui & Motion)  | 25     | Button, Card, Dialog, Sheet, Skeleton, ConfirmDialog, Table, motion.tsx...          |
| Feature Components (partagés)       | 14     | QuoteWizard, QuoteDetailsSheet, FileUpload, WhatsAppButton, StatsSection, FAQ...    |
| Admin Feature Components            | 8      | AdminCommandPalette, ActivityChart, BusinessAnalytics, UserList, DemoModeControl... |
| Auth Components                     | 2      | ForgotPasswordForm, ResetPasswordForm                                               |
| Quote Wizard Steps & Controls       | 7      | StepContact, StepDate, StepItemType, StepLocation, StepNotes, Header, Footer        |
| Support Chat Components             | 9      | SupportChatModal, SupportChatButton, ChatInput, ChatMessage, ChatMessagesList...    |
| Layout Components                   | 5      | Header, Footer, SectionContainer, LayoutWrapper, JsonLd                             |
| Email Templates (React Email)       | 3      | PasswordResetEmail, QuoteConfirmationEmail, QuoteRequestEmail                       |
| Theme Providers & Controls          | 2      | ThemeProvider, ThemeToggle                                                          |
| Composants colocalisés (`src/app/`) | 5      | ClientDirectory, ContactMessagesInbox, ContactsDashboardView, SettingsClient...     |

### Server Actions (11 fichiers dans `src/app/actions/`)

| Fichier                      | Actions principales exportées                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `quote-management.ts`        | `createQuoteAction`, `getQuotesAction`, `getQuoteByIdAction`, `updateQuoteStatusAction`, `deleteQuoteAction`            |
| `search-actions.ts`          | `searchAdminAction` (Recherche globale multi-tables Devis, Contacts & Raccourcis navigation)                            |
| `contact.ts`                 | `sendContactMessageAction`, `getContactMessagesAction`, `updateContactMessageStatusAction`, `getClientsDirectoryAction` |
| `whatsapp-actions.ts`        | `prepareWhatsAppQuoteMessageAction`, `logWhatsAppContactAction`, `getQuotesByPhoneAction`                               |
| `ai-actions.ts`              | `getAiStatusAction`, `estimateTransportAction`, `draftEmailAction`, `generateSupportAiAction`                           |
| `upload-management.ts`       | `getPresignedUploadUrlAction`, `deleteUploadedFileAction`, `listUploadedFilesAction`                                    |
| `user-management.ts`         | `getUsersAction`, `createUserAction`, `updateUserAction`, `deleteUserAction`                                            |
| `notification-management.ts` | `getNotificationsAction`, `getUnreadNotificationCountAction`, `markAllNotificationsAsReadAction`                        |
| `auth-actions.ts`            | `requestPasswordResetAction`, `verifyResetTokenAction`, `resetPasswordWithTokenAction`                                  |
| `demo-actions.ts`            | `injectDemoDataAction`, `clearDemoDataAction`, `getDemoStatusAction`                                                    |
| `settings-actions.ts`        | `getSettingsAction`, `updateSettingsAction`, `resetSettingsAction`                                                      |

### API Routes (5 routes dans `src/app/api/`)

| Route                 | Méthode | Description                                                    |
| --------------------- | ------- | -------------------------------------------------------------- |
| `/api/admin/init`     | `POST`  | Initialisation sécurisée du premier compte administrateur      |
| `/api/admin/check`    | `GET`   | Vérification si un compte administrateur est déjà initialisé   |
| `/api/auth/[...all]`  | `ALL`   | Handlers Better-Auth (session, login, signout, reset tokens)   |
| `/api/seed`           | `POST`  | Injection de données de démo (protégé par `ENABLE_SEED_ROUTE`) |
| `/api/workflow/email` | `POST`  | Webhook QStash pour traitement asynchrone des emails Resend    |
| `/api/workflow/pdf`   | `POST`  | Webhook QStash pour génération et stockage asynchrone des PDF  |

### Libs & Services (26 fichiers dans `src/lib/`)

| Fichier            | Rôle                                                       | Statut                              |
| ------------------ | ---------------------------------------------------------- | ----------------------------------- |
| `prisma.ts`        | Singleton Prisma Client 6 (port pooler 6543)               | ✅ Fonctionnel                      |
| `auth.ts`          | Configuration serveur Better-Auth                          | ✅ Fonctionnel                      |
| `auth-client.ts`   | Client Better-Auth pour composants client                  | ✅ Fonctionnel                      |
| `auth-guard.ts`    | Fonctions gardes serveur `requireAuth()`, `requireAdmin()` | ✅ Fonctionnel                      |
| `redis.ts`         | Client Upstash Redis (REST)                                | ✅ Fonctionnel                      |
| `qstash.ts`        | Client Upstash QStash & files d'attente (email, pdf)       | ✅ Fonctionnel                      |
| `storage.ts`       | Client Tigris S3 (URLs signées PutObject/GetObject)        | ✅ Fonctionnel                      |
| `email.ts`         | Client Resend (Envoi via templates React Email)            | ✅ Fonctionnel                      |
| `supabase.ts`      | Client Supabase pour Realtime sélectif                     | ✅ Fonctionnel                      |
| `gemini.ts`        | Client Google Gemini avec Fail-Safe heuristique            | ✅ Fonctionnel                      |
| `huggingface.ts`   | Inférence IA WhatsApp (Mistral-7B) & fallback              | ✅ Fonctionnel                      |
| `validation.ts`    | Schémas Zod partagés & helpers de validation               | ✅ Fonctionnel                      |
| `error-handler.ts` | Normalisation des erreurs Prisma & Better-Auth             | ✅ Fonctionnel                      |
| `error-codes.ts`   | Dictionnaire standardisé des codes d'erreur                | ✅ Fonctionnel                      |
| `logger.ts`        | Logging JSON structuré Pino (multi-niveaux)                | ✅ Fonctionnel                      |
| `quote-storage.ts` | Legacy `localStorage` (conservé pour fallback)             | ⚠️ Déprécié (DB = source de vérité) |
| `pdf-generator.ts` | Génération de devis PDF (jsPDF autotable client)           | ✅ Fonctionnel (client-only)        |
| `pdf.ts`           | Helpers utilitaires pour PDF                               | ✅ Fonctionnel                      |
| `animations.ts`    | Presets et transitions Framer Motion                       | ✅ Fonctionnel                      |
| `date-utils.ts`    | Formatage et manipulation de dates (date-fns FR)           | ✅ Fonctionnel                      |
| `utils.ts`         | Utilitaire `cn()` (clsx + tailwind-merge)                  | ✅ Fonctionnel                      |
| `support-agent/`   | 5 modules FSM et connaissances du support IA               | ✅ Fonctionnel                      |

### Hooks (4 fichiers dans `src/hooks/`)

| Hook                     | Description                                                     | Statut         |
| ------------------------ | --------------------------------------------------------------- | -------------- |
| `useHasMounted.ts`       | Détection du montage côté client (sécurité hydratation SSR/CSR) | ✅ Fonctionnel |
| `useRealtimeQuotes.ts`   | Souscription Supabase Realtime aux créations/mises à jour devis | ✅ Fonctionnel |
| `useRealtimeContacts.ts` | Souscription Supabase Realtime aux nouveaux messages de contact | ✅ Fonctionnel |
| `useSupportChat.ts`      | Machine à états finis et persistance locale du chat de support  | ✅ Fonctionnel |

### Middleware

| Fichier         | Fonctionnalité                                                                                                | Statut         |
| --------------- | ------------------------------------------------------------------------------------------------------------- | -------------- |
| `middleware.ts` | Auth check `/admin/*` + Rate Limiting global (20 req/10s) + Anti-brute force auth (5 req/60s) en Edge Runtime | ✅ Fonctionnel |

---

## Ce Qui Fonctionne ✅

- ✅ Landing page complète avec animations fluides Framer Motion et thèmes clair/sombre.
- ✅ Wizard de devis multi-étapes avec validation Zod stricte et estimation de transport.
- ✅ Chat de support IA résilient (Google Gemini + repli heuristique local sans clé requise).
- ✅ Authentification Better-Auth avec 4 rôles (`admin`, `moderator`, `developer`, `user`).
- ✅ Protection des routes admin par `middleware.ts` (Edge) complétée par `requireAdmin()` (Server).
- ✅ Rate limiting Upstash Redis sur les routes `/api/*` et Server Actions + seuil strict anti-brute force sur l'authentification.
- ✅ CRUD complet des devis via Server Actions adossées à PostgreSQL Supabase (RLS actif).
- ✅ Boîte de réception des messages de contact avec statuts Non lu/Lu/Archivé et répertoire clients.
- ✅ Omnibar de recherche globale Ctrl+K (`AdminCommandPalette`) avec filtres multi-tables instantanés.
- ✅ Système de notifications opérationnelles réelles avec badge de compteur non lu et marquage unitaire/groupé.
- ✅ Automatisation de relance WhatsApp 1-Clic via Hugging Face Mistral-7B et liens universels `wa.me`.
- ✅ File d'attente asynchrone QStash pour les workers Email (Resend) et PDF (Tigris S3).
- ✅ Export PDF côté client (jsPDF) et export tabulaire Excel CSV UTF-8 BOM.
- ✅ Mode Démo en 1-clic avec injection/purge de données de test sans corrompre la production.
- ✅ SEO dynamique : sitemap XML, robots.txt et données structurées JSON-LD Schema.org.
- ✅ Suite de 81 tests automatisés Vitest validée à 100% sur 13 suites sans aucun échec.
- ✅ Pipeline GitHub Actions CI/CD (Prettier, ESLint, `tsc --noEmit`, Vitest, `next build`).

---

## Ce Qui Reste à Faire (Reel Restant) 🎯

| Feature / Tâche                                    | Priorité | Description / Dépendance                                               |
| -------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| **TASK-003** : Monitoring d'erreurs Sentry         | P2       | Intégration SDK Sentry Next.js pour capturer les exceptions de prod    |
| **TASK-015** : Intégration passerelle de paiement  | P3       | Paiement d'acomptes en ligne (Stripe / agrégateur régional)            |
| **TASK-016** : Analytics de navigation respectueux | P3       | Vercel Analytics ou Plausible sans cookies intrusifs                   |

---

## Backlog Priorisé & Historique des Tâches

### P0 — Critique (Infrastructure & Qualité Fondamentale)

- [x] **TASK-001** : Mettre en place les tests automatisés avec Vitest (81 tests validés sur 13 suites)
    - Fichiers : `vitest.config.ts`, `tests/setup.ts`, `tests/unit/*.test.ts`, `tests/integration/*.test.ts`
    - Statut : ✅ Terminé (100% pass)

### P1 — Important (Fonctionnalités Clés & Sécurité)

- [x] **TASK-002** : Typer les erreurs Prisma avec `instanceof`
    - Fichiers : `src/app/actions/quote-management.ts`, `src/lib/error-handler.ts`
    - Statut : ✅ Terminé
- [x] **TASK-004** : Implémenter le pipeline QStash (email worker, PDF worker)
    - Fichiers : `src/app/api/workflow/email/route.ts`, `src/app/api/workflow/pdf/route.ts`, `src/lib/qstash.ts`
    - Statut : ✅ Terminé
- [x] **TASK-005** : Compléter les templates React Email typés
    - Fichiers : `src/components/emails/`
    - Statut : ✅ Terminé (Confirmation devis, notification admin, réinitialisation mot de passe)
- [x] **TASK-006** : Implémenter l'upload de fichiers via Tigris S3
    - Fichiers : `src/lib/storage.ts`, `src/app/actions/upload-management.ts`, `src/components/features/FileUpload.tsx`
    - Statut : ✅ Terminé
- [x] **TASK-027** : Refonte Responsivité & Alignement Normes UI/UX 2026 Espace Public & Partagé
    - Fichiers : [docs/PLAN_SUIVI_RESPONSIVITE_PUBLIC_2026.md](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/docs/PLAN_SUIVI_RESPONSIVITE_PUBLIC_2026.md), [ISSUES.md](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/ISSUES.md) (`ISSUE-005` à `ISSUE-012`)
    - Chantiers :
        - `UI-RESP-01` (`ISSUE-005`) : LocationPicker adaptatif (résolution compression mobile 320px)
        - `UI-RESP-02` (`ISSUE-006`) : Header Drawer auto-dismiss & dimensionnement adaptatif
        - `UI-RESP-03` (`ISSUE-007`) : Contact form grille fluide (`sm:grid-cols-2`)
        - `UI-RESP-04` (`ISSUE-008`) : WizardFooter thumb zone & boutons pleine largeur
        - `UI-RESP-05` (`ISSUE-009`) : Footer cibles tactiles WCAG 2.5.5 ($\ge 44\text{px}$) & newsletter
        - `UI-RESP-06` (`ISSUE-010`) : StepDate popover centré & calendrier mobile fluide
        - `UI-RESP-07` (`ISSUE-011`) : QuoteSummaryDialog puces timeline standardisées & scroll sécurisé
        - `UI-RESP-08` (`ISSUE-012`) : Support Chat IA quick-replies tactiles & `100dvh`
    - Statut : ✅ Terminé (8 chantiers validés : LocationPicker adaptatif, Header Drawer auto-dismiss, Contact form grille fluide, WizardFooter thumb zone, Footer 44px, StepDate popover, QuoteSummaryDialog timeline & Chat IA quick-replies)

### P2 — Souhaitable (Améliorations, Temps Réel & Finitions)

- [x] **TASK-007** : Configurer Supabase Realtime pour le dashboard admin
    - Fichiers : `src/hooks/useRealtimeQuotes.ts`, `src/hooks/useRealtimeContacts.ts`
    - Statut : ✅ Terminé
- [x] **TASK-008** : Ajouter les headers de sécurité dans `next.config.ts`
    - Fichiers : `next.config.ts`
    - Statut : ✅ Terminé (HSTS, CSP, X-Frame-Options...)
- [x] **TASK-009** : Configurer le rate limiting dynamique via variables d'environnement
    - Fichiers : `middleware.ts`, `.env.example`
    - Statut : ✅ Terminé
- [x] **TASK-010** : Logging structuré avec Pino
    - Fichiers : `src/lib/logger.ts`
    - Statut : ✅ Terminé
- [x] **TASK-011** : Configurer les RLS Supabase sur toutes les tables
    - Fichiers : `prisma/migrations/20260726_enable_rls/migration.sql`
    - Statut : ✅ Terminé
- [x] **TASK-012** : Mettre en place CI/CD avec GitHub Actions
    - Fichiers : `.github/workflows/ci.yml`
    - Statut : ✅ Terminé
- [x] **TASK-019** : Remédiation globale UI/UX & Accessibilité WCAG 2.1 AA/AAA
    - Statut : ✅ Terminé
- [x] **TASK-024** : Command Palette Omnibar `Ctrl + K` pour l'administration
    - Fichiers : `src/components/features/admin/AdminCommandPalette.tsx`, `src/app/actions/search-actions.ts`
    - Statut : ✅ Terminé
- [x] **TASK-025** : Système de Notifications Opérationnelles Réelles
    - Fichiers : `src/components/features/AdminNotifications.tsx`, `src/app/actions/notification-management.ts`
    - Statut : ✅ Terminé
- [x] **TASK-026** : Refonte Responsivité & Alignement Normes UI/UX 2026 Espace Administration
    - Fichiers : `docs/PLAN_SUIVI_RESPONSIVITE_ADMIN_2026.md`, `src/app/admin/*`, `src/components/features/admin/*`
    - Statut : ✅ Terminé (8 chantiers RESP-01 à RESP-08 validés : dual pattern mobile/desktop, auto-dismiss sheet, sticky bar, toolbar adaptative)

### P3 — Évolutions Futures & Documentation

- [x] **TASK-014** : Spécification OpenAPI 3.1.0, Swagger & Référence API Développeurs
    - Fichiers : `public/openapi.json`, `docs/openapi.yaml`, `src/app/api/openapi/route.ts`, `docs/API_REFERENCE.md`, `tests/unit/openapi.test.ts`
    - Statut : ✅ Terminé (Spécification OpenAPI 3.1.0 JSON & YAML, route de découverte CORS `/api/openapi`, documentation exhaustive des Route Handlers, webhooks QStash et Server Actions)
- [ ] **TASK-003** : Monitoring Sentry
- [ ] **TASK-015** : Intégration paiement d'acompte
- [ ] **TASK-016** : Analytics de visite

---

## Intégrations & Services Externes

| Service             | Statut       | Variables Clés                 | Module Client/Service    | Rôle & Usage                                                |
| ------------------- | ------------ | ------------------------------ | ------------------------ | ----------------------------------------------------------- |
| Supabase PostgreSQL | ✅ Configuré | `DATABASE_URL`, `DIRECT_URL`   | `src/lib/prisma.ts`      | Base de données principale avec pooler transactionnel & RLS |
| Supabase Realtime   | ✅ Configuré | `NEXT_PUBLIC_SUPABASE_*`       | `src/lib/supabase.ts`    | Notifications et souscriptions live (devis et contacts)     |
| Better-Auth         | ✅ Configuré | `BETTER_AUTH_SECRET`           | `src/lib/auth.ts`        | Sessions, mots de passe hashés, 4 rôles utilisateurs        |
| Upstash Redis       | ✅ Configuré | `UPSTASH_REDIS_REST_*`         | `src/lib/redis.ts`       | Rate limiting distribué dans `middleware.ts` en Edge        |
| Upstash QStash      | ✅ Configuré | `QSTASH_TOKEN`, `QSTASH_*_KEY` | `src/lib/qstash.ts`      | Tâches asynchrones fiabilisées (workers email & PDF signés) |
| Tigris S3           | ✅ Configuré | `TIGRIS_STORAGE_*`             | `src/lib/storage.ts`     | Stockage de documents et bordereaux via URLs présignées S3  |
| Resend              | ✅ Configuré | `RESEND_KEY`                   | `src/lib/email.ts`       | Envoi d'emails transactionnels avec React Email             |
| Google Gemini AI    | ✅ Configuré | `GEMINI_API_KEY`               | `src/lib/gemini.ts`      | Support client interactif et estimation de cubage assistée  |
| Hugging Face        | ✅ Configuré | `HUGGINGFACE_API_KEY`          | `src/lib/huggingface.ts` | Génération de relance WhatsApp via LLM Mistral-7B           |

---

## Dettes Techniques

| ID     | Description                                                                                  | Fichier                                                        | Statut                                            |
| ------ | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------- |
| DT-001 | Élimination de `quote-storage.ts` et du localStorage au profit de 100% Prisma Server Actions | `src/lib/quote-storage.ts`, `src/app/admin/contacts/`          | ✅ Résolu (Admin contacts & devis 100% DB)        |
| DT-002 | Erreurs Prisma résolues avec `instanceof`                                                    | `src/app/actions/`                                             | ✅ Résolu (Gestion normalisée dans error-handler) |
| DT-003 | Rate limiting configurable via `process.env`                                                 | `middleware.ts`                                                | ✅ Résolu (Variables dynamiques avec fallbacks)   |
| DT-004 | Suite de tests automatisés Vitest fiabilisée                                                 | `tests/`                                                       | ✅ Résolu (79/79 passés, 12 suites)               |
| DT-005 | Centralisation de la Constitution des Agents à la racine                                     | `AGENTS.md`                                                    | ✅ Résolu (Conforme standard agents.md)           |
| DT-006 | README.md & Documentation de base synchronisés                                               | `README.md`, `CHANGELOG.md`                                    | ✅ Résolu                                         |
| DT-007 | Dépréciation du fichier legacy `.github/copilot-instructions.md`                             | `.github/copilot-instructions.md`                              | ⚠️ À nettoyer (Remplacer par lien vers AGENTS.md) |
| DT-008 | Élimination complète des `console.*` au profit de `logger` Pino structuré                    | Ensemble de la codebase (Server Actions, API, Libs, Hooks, UI) | ✅ Résolu (100% migré, 0 console.* restant)       |
