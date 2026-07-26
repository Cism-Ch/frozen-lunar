# 📋 Frozen Lunar — État du Projet

> **Dernière mise à jour** : 2026-07-26
> **Mis à jour par** : mission-control
> **Version** : 1.0.0 (V1 Production Release)

---

## Phase Actuelle

**Phase 3 — Production & Deployment** 🔄 En cours

> Les phases 1 (UI) et 2 (Backend & Asynchronous Infrastructure) sont intégralement terminées (100%). L'application dispose d'une suite de 32 tests automatisés, du rate limiting, de QStash workers, d'emails HTML typés, d'upload S3 Tigris, de Supabase Realtime, des headers HTTP de sécurité, du logging structuré Pino, du RLS et du pipeline CI/CD GitHub Actions.

---

## Avancement des Phases

| Phase | Nom                 | Statut      | Progression | Notes                                                            |
| ----- | ------------------- | ----------- | ----------- | ---------------------------------------------------------------- |
| 1     | UI Implementation   | ✅ Terminé  | 100%        | Landing page, admin, wizard devis, support chat, thèmes          |
| 2     | Backend Integration | ✅ Terminé  | 100%        | Auth ✅, Quotes CRUD ✅, QStash/Email/S3/Realtime/Pino/RLS ✅     |
| 3     | Production Ready    | 🔄 En cours | ~35%        | Tests Vitest ✅, CI/CD GitHub Actions ✅, Security ✅           |

---

## Inventaire du Code

### Routes (15 pages)

| Route                     | Type   | Statut                                                |
| ------------------------- | ------ | ----------------------------------------------------- |
| `/`                       | Public | ✅ Landing page avec hero, services, FAQ, témoignages |
| `/about`                  | Public | ✅ Page "À propos"                                    |
| `/contact`                | Public | ✅ Formulaire de contact                              |
| `/devis`                  | Public | ✅ Wizard multi-étapes (4 steps)                      |
| `/services`               | Public | ✅ Catalogue des services                             |
| `/legal/cgv`              | Public | ✅ CGV                                                |
| `/legal/mentions-legales` | Public | ✅ Mentions légales                                   |
| `/admin/login`            | Admin  | ✅ Page de connexion Better-Auth                      |
| `/admin/init`             | Admin  | ✅ Initialisation du premier admin                    |
| `/admin/dashboard`        | Admin  | ✅ Tableau de bord avec métriques                     |
| `/admin/quotes`           | Admin  | ✅ Liste des devis avec filtres                       |
| `/admin/quotes/[id]`      | Admin  | ✅ Détail d'un devis                                  |
| `/admin/contacts`         | Admin  | ✅ Gestion des contacts                               |
| `/admin/users`            | Admin  | ✅ Gestion des utilisateurs                           |
| `/admin/settings`         | Admin  | ✅ Paramètres                                         |

### Composants (62 fichiers .tsx)

| Catégorie              | Nombre | Exemples                                                    |
| ---------------------- | ------ | ----------------------------------------------------------- |
| UI Primitives (shadcn) | 23     | Button, Card, Dialog, Sheet, Table, Select, Tabs...         |
| Feature Components     | 13     | QuoteWizard, QuoteDetailsSheet, FAQSection, StatsSection... |
| Admin Components       | 3      | SidebarContent, UserList, AddUserDialog                     |
| Layout Components      | ~5     | Header, Footer, SectionContainer                            |
| Quote Wizard Steps     | ~4     | Steps du formulaire multi-étapes                            |
| Support Chat           | ~3     | SupportChatModal, SupportChatButton                         |
| Email Templates        | ~2     | Templates React Email                                       |
| Theme/Misc             | 2      | ThemeProvider, ThemeToggle                                  |

### Server Actions (3 fichiers)

| Fichier                      | Actions                                                                                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `quote-management.ts`        | createQuoteAction, getQuotesAction, getQuoteByIdAction, updateQuoteAction, updateQuoteStatusAction, deleteQuoteAction, addQuoteNoteAction |
| `user-management.ts`         | Gestion des utilisateurs admin                                                                                                            |
| `notification-management.ts` | Gestion des notifications                                                                                                                 |

### API Routes (4 dossiers)

| Route                | Méthode | Description                   |
| -------------------- | ------- | ----------------------------- |
| `/api/admin/init`    | POST    | Créer le premier compte admin |
| `/api/admin/check`   | GET     | Vérifier si un admin existe   |
| `/api/auth/[...all]` | ALL     | Routes Better-Auth            |
| `/api/seed/`         | POST    | Seeding de la DB              |
| `/api/workflow/`     | POST    | Webhooks QStash               |

### Libs & Services (18 fichiers)

| Fichier            | Rôle                          | Statut                                    |
| ------------------ | ----------------------------- | ----------------------------------------- |
| `prisma.ts`        | Singleton Prisma Client       | ✅ Fonctionnel                            |
| `auth.ts`          | Config Better-Auth serveur    | ✅ Fonctionnel                            |
| `auth-client.ts`   | Config Better-Auth client     | ✅ Fonctionnel                            |
| `redis.ts`         | Client Upstash Redis          | ✅ Fonctionnel                            |
| `qstash.ts`        | Client Upstash QStash         | ⚠️ Initialisé, workers manquants          |
| `storage.ts`       | Client Tigris S3              | ⚠️ Initialisé, upload manquant            |
| `email.ts`         | Client Resend                 | ⚠️ Initialisé, templates partiels         |
| `gemini.ts`        | Client Google Gemini          | ✅ Fonctionnel (fallback mock)            |
| `validation.ts`    | Schémas Zod partagés          | ✅ Fonctionnel                            |
| `error-handler.ts` | Gestion d'erreurs centralisée | ✅ Fonctionnel                            |
| `error-codes.ts`   | Codes d'erreur standardisés   | ✅ Fonctionnel                            |
| `quote-storage.ts` | localStorage (legacy)         | ⚠️ Utilisé en admin, à migrer vers Prisma |
| `pdf-generator.ts` | Générateur PDF jsPDF          | ✅ Fonctionnel (client-only)              |
| `pdf.ts`           | Helpers PDF                   | ✅ Fonctionnel                            |
| `animations.ts`    | Config Framer Motion          | ✅ Fonctionnel                            |
| `date-utils.ts`    | Helpers date-fns              | ✅ Fonctionnel                            |
| `utils.ts`         | Helpers génériques (cn)       | ✅ Fonctionnel                            |
| `support-agent/`   | Agent de support IA           | ✅ Fonctionnel (mock + Gemini)            |

### Hooks (2 fichiers)

| Hook                   | Description                    | Statut                  |
| ---------------------- | ------------------------------ | ----------------------- |
| `useRealtimeQuotes.ts` | Souscription Supabase Realtime | ⚠️ Initialisé, à tester |
| `useSupportChat.ts`    | Logique du chat de support     | ✅ Fonctionnel          |

### Middleware

| Fichier         | Fonctionnalité                          | Statut         |
| --------------- | --------------------------------------- | -------------- |
| `middleware.ts` | Auth check + Rate Limiting (20 req/10s) | ✅ Fonctionnel |

---

## Ce Qui Fonctionne ✅

- ✅ Landing page complète avec animations Framer Motion
- ✅ Thème clair/sombre (next-themes)
- ✅ Navigation responsive avec header/footer
- ✅ Wizard de devis multi-étapes avec validation Zod
- ✅ Chat de support IA (Gemini + mock fallback)
- ✅ Authentification Better-Auth (email/password)
- ✅ Middleware de protection des routes admin
- ✅ Rate limiting Redis sur /api/*
- ✅ CRUD complet des devis via Server Actions
- ✅ Gestion des utilisateurs admin
- ✅ Gestion des notifications
- ✅ Tableau de bord admin avec métriques
- ✅ Export PDF des devis (jsPDF)
- ✅ Historique des actions sur les devis
- ✅ Gestion des contacts
- ✅ Pages légales (CGV, mentions)
- ✅ Gestion d'erreurs centralisée avec codes d'erreur
- ✅ Schéma Prisma avec modèles Auth + Métier

---

## Ce Qui Manque ❌

| Feature                                         | Priorité | Dépendance             |
| ----------------------------------------------- | -------- | ---------------------- |
| Tests automatisés (Vitest)                      | P0       | Aucune                 |
| Erreurs Prisma typées (instanceof)              | P1       | Aucune                 |
| Monitoring Sentry                               | P1       | Aucune                 |
| Pipeline QStash fonctionnel (workers email/PDF) | P1       | Templates email        |
| Templates React Email complets                  | P1       | Aucune                 |
| Upload de fichiers Tigris                       | P1       | Config Tigris          |
| Envoi d'emails via QStash (asynchrone)          | P1       | QStash + Resend        |
| Supabase Realtime fonctionnel                   | P2       | Config Supabase        |
| Validation email robuste                        | P2       | Package validator      |
| Rate limiting configurable via env              | P2       | Aucune                 |
| Logging structuré (Pino)                        | P2       | Package pino           |
| Headers de sécurité Next.js                     | P2       | Aucune                 |
| RLS Supabase                                    | P2       | Config Supabase        |
| CI/CD pipeline                                  | P2       | GitHub Actions         |
| Force mot de passe renforcée                    | P3       | Aucune                 |
| Documentation OpenAPI                           | P3       | Package swagger        |
| Payment gateway                                 | P3       | Stripe/autre           |
| Analytics                                       | P3       | Vercel Analytics/autre |
| SEO avancé                                      | P3       | Aucune                 |

---

## Backlog Priorisé

### P0 — Critique (bloque le développement)

- [x] **TASK-001** : Mettre en place les tests automatisés avec Vitest (29 tests unitaires et d'intégration validés)
    - Composants : Configuration Vitest, tests schémas Zod, error-handler, date-utils, quote-management Server Actions
    - Statut : ✅ Terminé

### P1 — Important (prochaine release)

- [x] **TASK-002** : Typer les erreurs Prisma avec `instanceof`
    - Fichiers : `src/app/actions/quote-management.ts`, `src/app/actions/notification-management.ts`, `src/lib/error-handler.ts`
    - Statut : ✅ Terminé (Centralisé via `handleError` et `instanceof Prisma.PrismaClientKnownRequestError`)
- [ ] **TASK-003** : Intégrer Sentry pour le monitoring d'erreurs
    - Estimation : M
- [x] **TASK-004** : Implémenter le pipeline QStash (email worker, PDF worker)
    - Fichiers : `src/app/api/workflow/email/route.ts`, `src/app/api/workflow/pdf/route.ts`, `src/lib/qstash.ts`
    - Statut : ✅ Terminé (File d'attente asynchrone non-bloquante avec signature de sécurité QStash et mode dégradé dev)
- [x] **TASK-005** : Compléter les templates React Email
    - Fichiers : `src/components/emails/QuoteRequestEmail.tsx`, `src/components/emails/QuoteConfirmationEmail.tsx`
    - Statut : ✅ Terminé (Templates HTML typés pour notifications admin & confirmations clients aux couleurs de la marque)
- [x] **TASK-006** : Implémenter l'upload de fichiers via Tigris S3
    - Fichiers : `src/lib/storage.ts`, `src/app/actions/upload-management.ts`, `src/components/features/FileUpload.tsx`
    - Statut : ✅ Terminé (URLs pré-signées S3 directes, validation MIME/taille 10 Mo, composant UI drag & drop et tests unitaires)

### P2 — Souhaitable (amélioration qualité)

- [x] **TASK-007** : Configurer Supabase Realtime pour le dashboard admin
    - Fichiers : `src/hooks/useRealtimeQuotes.ts`, `src/app/admin/dashboard/page.tsx`, `src/app/admin/quotes/page.tsx`
    - Statut : ✅ Terminé (Souscription sélective sur la table quote, callbacks d'updates optimistes et rafraîchissement en temps réel)
- [x] **TASK-008** : Ajouter les headers de sécurité dans `next.config.ts`
    - Fichiers : `next.config.ts`
    - Statut : ✅ Terminé (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-XSS-Protection)
- [x] **TASK-009** : Configurer le rate limiting via variables d'environnement
    - Fichiers : `middleware.ts`, `.env.example`
    - Statut : ✅ Terminé (`RATE_LIMIT_MAX_REQUESTS` et `RATE_LIMIT_WINDOW_SECONDS` configurables dynamiquement avec fallback Edge)
- [x] **TASK-010** : Logging structuré avec Pino
    - Fichiers : `src/lib/logger.ts`, `src/lib/error-handler.ts`
    - Statut : ✅ Terminé (Journal de logs JSON structuré Pino avec niveau configurable, horodatage ISO et métadonnées d'erreur)
- [x] **TASK-011** : Configurer les RLS Supabase
    - Fichiers : `prisma/migrations/20260726_enable_rls/migration.sql`
    - Statut : ✅ Terminé (Activation du Row Level Security sur l'ensemble des tables et politiques d'accès anonymes/authentifiés)
- [x] **TASK-012** : Mettre en place CI/CD avec GitHub Actions
    - Fichiers : `.github/workflows/ci.yml`
    - Statut : ✅ Terminé (Pipeline d'intégration continue testant l'installation, Prisma generate, ESLint, TypeScript `tsc`, Vitest et le build Next.js)

### P3 — Futur (backlog)

- [ ] **TASK-013** : Force mot de passe renforcée
- [ ] **TASK-014** : Documentation OpenAPI/Swagger
- [ ] **TASK-015** : Intégration payment gateway
- [ ] **TASK-016** : Analytics (Vercel Analytics)
- [ ] **TASK-017** : SEO avancé (sitemap, structured data)

---

## Intégrations & Services

| Service             | Statut       | Config                       | Client               | Notes                                   |
| ------------------- | ------------ | ---------------------------- | -------------------- | --------------------------------------- |
| Supabase PostgreSQL | ✅ Configuré | `DATABASE_URL`, `DIRECT_URL` | `src/lib/prisma.ts`  | Singleton Prisma                        |
| Better-Auth         | ✅ Configuré | —                            | `src/lib/auth.ts`    | Email/Password, rôles (admin/user)      |
| Upstash Redis       | ✅ Configuré | `UPSTASH_*`                  | `src/lib/redis.ts`   | Rate limiting dans middleware           |
| Upstash QStash      | ⚠️ Partiel   | `QSTASH_TOKEN`               | `src/lib/qstash.ts`  | Client initialisé, workers manquants    |
| Tigris S3           | ⚠️ Partiel   | `TIGRIS_*`                   | `src/lib/storage.ts` | Client initialisé, upload à implémenter |
| Resend              | ⚠️ Partiel   | `RESEND_KEY`                 | `src/lib/email.ts`   | Client initialisé, templates partiels   |
| Gemini AI           | ✅ Configuré | `GEMINI_API_KEY`             | `src/lib/gemini.ts`  | Support chat, fallback mock             |

---

## Dettes Techniques

| ID     | Description                                                                        | Fichier                                  | Impact                           |
| ------ | ---------------------------------------------------------------------------------- | ---------------------------------------- | -------------------------------- |
| DT-001 | `quote-storage.ts` utilise encore `localStorage` pour certaines pages admin        | `src/lib/quote-storage.ts`               | Migration vers Prisma nécessaire |
| DT-002 | Erreurs Prisma détectées par `constructor.name.includes()` au lieu de `instanceof` | `src/app/api/admin/`, `src/app/actions/` | Fragile avec minification        |
| DT-003 | Rate limiting hardcodé (20 req/10s) au lieu de via env vars                        | `middleware.ts`                          | Pas configurable par env         |
| DT-004 | Pas de tests automatisés                                                           | —                                        | Risque de régression             |
| DT-005 | Pas de monitoring en production                                                    | —                                        | Erreurs silencieuses             |
| DT-006 | README.md encore en "Phase 1" alors que Phase 2 est en cours                       | `README.md`                              | Documentation décalée            |
