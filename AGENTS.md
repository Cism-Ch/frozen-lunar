# 🧠 Frozen Lunar — Constitution des Agents

> Ce fichier est la **source unique d'instructions** pour tous les agents IA (Antigravity, Copilot, Codex, Cursor, Claude…).
> Il suit le standard [agents.md](https://agents.md) et vit **à la racine** du dépôt pour être versionné et détecté par tous les outils.
> Les skills spécialisés restent dans `.agents/skills/` (non versionné). L'état d'avancement est dans [PROJECT_STATUS.md](PROJECT_STATUS.md).

---

## 1. Identité

- **Nom de code** : Frozen Lunar — **Version** : voir `package.json`
- **Nom commercial** : HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE
- **Mission** : « Votre sécurité, Notre priorité » — plateforme de logistique spécialisée (matériaux, containers, charpentes, machines, modules préfabriqués)
- **Fonctionnalités clés** : site vitrine, wizard de devis, chat de support IA, back-office admin (devis, contacts, utilisateurs, paramètres, notifications, palette Ctrl+K, WhatsApp 1-clic)
- **Langue** : Français (UI, docs, messages d'erreur utilisateur, commentaires métier)
- **Licence** : Privée — Tous droits réservés

---

## 2. Démarrage rapide (TL;DR pour agents)

1. Lire ce fichier, puis [PROJECT_STATUS.md](PROJECT_STATUS.md) et [ISSUES.md](ISSUES.md).
2. Chercher un pattern existant **avant** d'écrire du code (`src/app/actions/*`, `src/lib/*`).
3. Implémenter en respectant les conventions de la section 5.
4. Valider avec la **Definition of Done** (section 7) — identique à la CI.
5. Mettre à jour `CHANGELOG.md` (+ `PROJECT_STATUS.md` / `ISSUES.md` si pertinent).

> Environnement de dev principal : **Windows + PowerShell** et **pnpm 9**. Ne jamais utiliser `npm`/`yarn` pour installer des dépendances.

---

## 3. Stack Technique

| Couche                | Technologie                                                           | Version |
| --------------------- | --------------------------------------------------------------------- | ------- |
| Framework             | Next.js (App Router, `middleware.ts` en Edge)                         | 16      |
| UI                    | React                                                                 | 19      |
| Langage               | TypeScript (strict, zéro `any`)                                       | 5       |
| Styling               | Tailwind CSS (+ `tw-animate-css`, Prettier plugin Tailwind)           | 4       |
| Composants UI         | shadcn/ui (Radix UI)                                                  | —       |
| Animations            | Framer Motion                                                         | 12      |
| ORM / DB              | Prisma Client → PostgreSQL (Supabase, RLS activé)                     | 6       |
| Authentification      | Better-Auth (email/mot de passe, rôles)                               | 1.4     |
| Cache & Rate Limiting | Upstash Redis + `@upstash/ratelimit`                                  | —       |
| Tâches async          | Upstash QStash (workers email & PDF)                                  | —       |
| Stockage fichiers     | Tigris (S3-compatible, URLs présignées)                               | —       |
| Emails                | Resend + React Email                                                  | —       |
| Realtime              | Supabase Realtime (`useRealtimeQuotes`, `useRealtimeContacts`)        | —       |
| IA                    | Google Gemini (estimation, emails, support) + Hugging Face (WhatsApp) | —       |
| Logging               | Pino (`@/lib/logger`)                                                 | 10      |
| Validation            | Zod                                                                   | 4       |
| Formulaires           | React Hook Form + `@hookform/resolvers`                               | 7       |
| PDF                   | jsPDF + jspdf-autotable (client uniquement)                           | —       |
| Tests                 | Vitest + Testing Library + jsdom                                      | 4       |
| CI                    | GitHub Actions (`.github/workflows/ci.yml`)                           | —       |
| Divers                | Lucide React, next-themes, Sonner, date-fns                           | —       |

---

## 4. Structure — « Où mettre quoi »

```
frozen-lunar/
├── AGENTS.md                    # CE FICHIER — constitution des agents
├── PROJECT_STATUS.md            # Source de vérité de l'avancement
├── CHANGELOG.md                 # Historique des changements (à tenir à jour)
├── ISSUES.md                    # Tickets (géré par issue-resolver)
├── middleware.ts                # Edge : protection /admin + rate limiting API/Server Actions
├── .agents/skills/              # Skills des agents (non versionné)
├── .github/
│   ├── workflows/ci.yml         # format → lint → type-check → test → build
│   └── copilot-instructions.md  # ⚠️ Legacy/obsolète — AGENTS.md fait foi
├── docs/                        # Docs techniques (non versionné) ; docs/old = archives
├── prisma/
│   ├── schema.prisma            # Schéma DB (Better-Auth + métier)
│   ├── migrations/              # Migrations (dont RLS) — ne jamais modifier une migration appliquée
│   └── demo-data.json           # Données de démo
├── scripts/                     # check-db-health, reset-admin-password, test-admin-login, seed-admin
├── tests/
│   ├── setup.ts                 # Setup Vitest (jest-dom)
│   ├── unit/                    # Tests unitaires (*.test.ts)
│   └── integration/             # Tests d'intégration (Server Actions)
└── src/
    ├── app/
    │   ├── actions/             # Server Actions ("use server") — UN fichier par domaine
    │   ├── api/                 # Route Handlers : admin/{init,check}, auth/[...all], seed, workflow/{email,pdf}
    │   ├── admin/               # Back-office (dashboard, quotes, quotes/[id], contacts, users, settings, login, init, forgot/reset-password)
    │   │   └── <route>/components/  # Composants colocalisés propres à une route
    │   ├── auth/                # forgot-password, reset-password (publics)
    │   ├── about/ contact/ devis/ services/ legal/{cgv,mentions-legales}/
    │   ├── layout.tsx           # Providers globaux (Theme, Toaster, SupportChat)
    │   ├── page.tsx             # Landing page
    │   └── globals.css          # Tokens Tailwind / thème (seul CSS custom autorisé)
    ├── components/
    │   ├── ui/                  # Primitives shadcn/ui (+ motion.tsx)
    │   ├── layout/              # Header, Footer, SectionContainer, LayoutWrapper, JsonLd
    │   ├── emails/              # Templates React Email
    │   └── features/            # Composants métier partagés
    │       ├── admin/           # Sidebar, UserList, QuoteStatusBadge, AdminCommandPalette, charts…
    │       ├── auth/            # ForgotPasswordForm, ResetPasswordForm
    │       ├── quote-wizard/    # Steps + header/footer du wizard
    │       └── support/         # Chat de support IA
    ├── config/marketing.ts      # Contenus marketing data-driven (pas de texte en dur dans les sections)
    ├── hooks/                   # useHasMounted, useRealtime*, useSupportChat
    ├── types/                   # Types partagés + schémas Zod de domaine (ex: types/contact.ts)
    └── lib/                     # Clients & services (singletons) — voir tableau ci-dessous
```

### Services `src/lib` (réutiliser, ne jamais réinstancier)

| Fichier                                      | Export principal                                       | Rôle                                                   |
| -------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| `prisma.ts`                                  | `default prisma`                                       | Singleton Prisma (`import prisma from "@/lib/prisma"`) |
| `auth.ts`                                    | `auth`                                                 | Config Better-Auth serveur                             |
| `auth-client.ts`                             | client Better-Auth                                     | Auth côté client                                       |
| `auth-guard.ts`                              | `requireAuth()`, `requireAdmin()`                      | Garde serveur des Server Actions / pages               |
| `validation.ts`                              | schémas Zod partagés, `formatZodError`, `validateData` | Validation (email, password, rôles, reset…)            |
| `error-handler.ts`                           | `handlePrismaError`, type guards Prisma/Better-Auth    | Normalisation des erreurs                              |
| `error-codes.ts`                             | codes d'erreur                                         | Codes standardisés                                     |
| `logger.ts`                                  | `logger`                                               | Logs structurés Pino (`info/warn/error/debug`)         |
| `redis.ts`                                   | `redis`                                                | Cache Upstash                                          |
| `qstash.ts`                                  | `qstash`, `emailQueue`, `pdfQueue`                     | Mise en file des tâches lourdes                        |
| `email.ts`                                   | client Resend                                          | Envoi d'emails (via worker QStash)                     |
| `storage.ts`                                 | `s3Client`, `getUploadUrl`, `getPublicUrl`             | Tigris S3 (URLs présignées)                            |
| `supabase.ts`                                | `supabase` (nullable)                                  | Client Realtime                                        |
| `gemini.ts`                                  | `geminiService`, `calculateHeuristicEstimate`…         | IA avec fallback heuristique si clé absente            |
| `huggingface.ts`                             | `generateWhatsAppMessage`, `normalizePhoneForWhatsApp` | Messages WhatsApp IA + fallback local                  |
| `support-agent/`                             | config, quote-flow, tutorials, mock-responses          | Logique du chat de support                             |
| `pdf-generator.ts` / `pdf.ts`                | génération PDF                                         | **Client uniquement** (jsPDF touche `window`)          |
| `quote-storage.ts`                           | stockage local                                         | Legacy `localStorage` — la DB est la source de vérité  |
| `utils.ts`, `date-utils.ts`, `animations.ts` | helpers                                                | `cn()`, dates FR, presets Framer Motion                |

---

## 5. Conventions Obligatoires

### 5.1 TypeScript

- **Strict** + **zéro `any`** (`@typescript-eslint/no-explicit-any` = `error`). Utiliser types concrets, génériques ou `unknown` + narrowing.
- Annoter les callbacks d'itération : `.map((m: ContactMessage) => …)`.
- **Imports** : alias `@/*` uniquement, pas d'imports relatifs profonds. Supprimer imports/variables inutilisés.
- **Types de retour explicites** sur toute fonction exportée (`Promise<{ data: T | null; error: string | null }>`).
- **Catch** : `catch (error: unknown)` puis narrowing (`instanceof z.ZodError`, `instanceof Error`). Jamais de `catch` vide.
- Dériver les types des schémas : `type X = z.infer<typeof xSchema>`.

### 5.2 Server Actions (`src/app/actions/`)

- `"use server"` en tête ; un fichier par domaine (`quote-management.ts`, `contact.ts`, `user-management.ts`…).
- **Ordre** : `requireAdmin()`/`requireAuth()` (si protégée) → validation Zod → Prisma → `revalidatePath`/`revalidateTag` → `return`.
- **Retour obligatoire** `{ data, error }` — ne jamais `throw` vers le client.
- Messages d'erreur utilisateur **en français** ; ne jamais renvoyer de stack, hash ou token.

```typescript
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { logger } from "@/lib/logger";

const inputSchema = z.object({ id: z.string().min(1) });

/** Archive un message de contact (admin uniquement). */
export async function archiveContactAction(
    input: unknown
): Promise<{ data: { success: true } | null; error: string | null }> {
    try {
        await requireAdmin();
        const { id } = inputSchema.parse(input);

        await prisma.contactMessage.update({
            where: { id },
            data: { status: "ARCHIVED" },
        });

        revalidatePath("/admin/contacts");
        return { data: { success: true }, error: null };
    } catch (error: unknown) {
        logger.error("archiveContactAction failed", error);
        if (error instanceof z.ZodError) {
            return {
                data: null,
                error: error.issues[0]?.message ?? "Données invalides",
            };
        }
        if (error instanceof Error) return { data: null, error: error.message };
        return { data: null, error: "Erreur inconnue" };
    }
}
```

### 5.3 React / Next.js

- **RSC par défaut** ; `"use client"` uniquement pour l'état, les effets, les animations ou les API navigateur.
- Colocaliser les composants propres à une route dans `src/app/<route>/components/` ; partagés → `src/components/features/`.
- Métadonnées via `export const metadata` par route (SEO : un seul `<h1>`, titres/descriptions FR).
- Providers globaux uniquement dans `src/app/layout.tsx`.
- Respecter `prefers-reduced-motion` pour les animations ; réutiliser `components/ui/motion.tsx` et `lib/animations.ts`.

### 5.4 Prisma & Base de données

- Toujours passer par le singleton `@/lib/prisma`. Prisma **ne tourne pas en Edge**.
- Conserver dans `schema.prisma` : `output = "../node_modules/.prisma/client"` et `binaryTargets = ["native", "rhel-openssl-3.0.x"]`.
- Conserver le script `"postinstall": "prisma generate"`.
- Migrations : `pnpm exec prisma migrate dev --name <nom>` (utilise `DIRECT_URL`, port 5432). Toute nouvelle table sensible ⇒ **policy RLS** dans une migration.
- Garder les modèles `User/Session/Account/Verification` synchronisés avec Better-Auth.

**Modèle de données actuel** :

| Modèle                               | Notes                                                                                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `User`                               | `role` : `admin` \| `moderator` \| `developer` \| `user`                                                                           |
| `Session`, `Account`, `Verification` | Gérés par Better-Auth (`Account.password` = hash, jamais exposé)                                                                   |
| `Quote`                              | `status` `PENDING/VALIDATED/REJECTED`, `source` `FORM/CHAT`, `amount` **String** (défaut « À calculer »), `supplementaryInfo` Json |
| `QuoteHistory`                       | Journal d'audit des devis (cascade delete)                                                                                         |
| `ContactMessage`                     | `status` `UNREAD/READ/ARCHIVED`                                                                                                    |
| `SystemSettings`                     | **Singleton** `id = "default"` (entreprise, WhatsApp, modèle HF, notifications)                                                    |

### 5.5 Sécurité

- Auth **toujours** vérifiée côté serveur (`requireAdmin()`) — le middleware ne contrôle que la présence du cookie.
- Ne jamais exposer : hash, tokens, clés API, stack traces. Seules les variables `NEXT_PUBLIC_*` atteignent le client.
- Webhooks QStash : `verifySignatureAppRouter` obligatoire ; handlers **idempotents** (retries).
- Tâches lourdes (emails, PDF) **toujours** via `emailQueue`/`pdfQueue`, jamais en synchrone.
- Uploads : URLs présignées Tigris uniquement.
- `/api/seed` bloquée hors `ENABLE_SEED_ROUTE=true` en dev — ne pas affaiblir.
- **Ne jamais écrire d'identifiants réels** dans un fichier versionné (code, README, CHANGELOG, tests). `docs/` est ignoré par git mais reste sensible.

### 5.6 Tailwind CSS & UI

- Ordre canonique : layout → spacing → typography → colors → effects (Prettier trie automatiquement : `pnpm format`).
- Pas de CSS custom hors tokens de `globals.css`. Utiliser `cn()` pour les classes conditionnelles.
- Réutiliser shadcn/ui avant de créer un composant ; variantes via props (`cva`), pas de fichiers dupliqués.
- Responsive par défaut, accessible (WCAG AA : labels, focus visible, contrastes), pas d'émojis dans l'UI.
- Si un élément d'UI manque pour exposer une fonctionnalité backend, l'implémenter dans le design system existant.

### 5.7 Commentaires & Documentation

- JSDoc sur toute fonction exportée ; commentaires métier en français, techniques standard en anglais.
- Ne jamais supprimer de commentaires/docstrings existants sans rapport avec la modification.
- Mettre à jour la doc concernée (`README.md`, `PROJECT_STATUS.md`, `docs/*`) quand le comportement change.

### 5.8 Fichiers `.env`

- Rechercher les `.env*` existants avant toute modification.
- **Ne jamais supprimer** de contenu d'un `.env*` : commenter ce qui est inutile.
- Toute nouvelle variable ⇒ ajout commenté dans `.env.example` + table section 8.

### 5.9 Tests

- Vitest (`jsdom`, globals). Fichiers dans `tests/unit/` ou `tests/integration/`, nommés `*.test.ts(x)`.
- Toute nouvelle Server Action ou fonction de `lib/` ⇒ test unitaire couvrant succès, validation Zod et refus d'accès.
- Mocker Prisma, `auth-guard` et les services externes (aucun appel réseau réel en test).

---

## 6. Commandes

```bash
pnpm dev                       # Serveur de dev (http://localhost:3000)
pnpm build / pnpm start        # Build & serveur de production
pnpm format / format:check     # Prettier (+ tri des classes Tailwind)
pnpm lint                      # ESLint
pnpm type-check                # tsc --noEmit
pnpm test / test:watch         # Vitest
pnpm check:db                  # Santé de la connexion DB
pnpm admin:reset-password      # Réinitialiser le mot de passe admin
pnpm admin:test-login          # Tester la connexion admin

pnpm exec prisma migrate dev   # Créer/appliquer une migration
pnpm exec prisma generate      # Régénérer le client
pnpm exec prisma studio        # UI DB
```

---

## 7. Definition of Done

Une tâche n'est terminée que si **toutes** ces commandes passent (même ordre que la CI) :

```bash
pnpm format:check && pnpm lint && pnpm type-check && pnpm test && pnpm build
```

Et :

- [ ] Aucun `any`, import inutilisé ou `console.log` de debug restant
- [ ] Server Actions : auth + Zod + `{ data, error }` + revalidation
- [ ] Tests ajoutés/mis à jour
- [ ] `CHANGELOG.md` mis à jour (et `PROJECT_STATUS.md` / `ISSUES.md` si concerné)
- [ ] `.env.example` à jour si nouvelle variable

---

## 8. Variables d'Environnement

| Variable                                                                                                            | Requise | Description                                                      |
| ------------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| `DATABASE_URL`                                                                                                      | ✅      | PostgreSQL Supabase pooled (port 6543, `?pgbouncer=true`)        |
| `DIRECT_URL`                                                                                                        | ✅      | PostgreSQL direct (port 5432) pour les migrations                |
| `NEXT_PUBLIC_APP_URL`                                                                                               | ✅      | URL de l'app (`http://localhost:3000` en dev)                    |
| `BETTER_AUTH_SECRET`                                                                                                | ✅ prod | Secret de session (≥ 32 caractères)                              |
| `GEMINI_API_KEY` / `NEXT_PUBLIC_GEMINI_API_KEY`                                                                     | ⚠️      | Gemini (secret serveur prioritaire ; fallback heuristique sinon) |
| `HUGGINGFACE_API_KEY`                                                                                               | ⚠️      | Génération des messages WhatsApp (fallback local sinon)          |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`                                                                                       | ⚠️      | Numéro WhatsApp officiel (format international)                  |
| `RESEND_KEY`                                                                                                        | ⚠️      | Envoi d'emails                                                   |
| `ADMIN_NOTIFICATION_EMAIL`                                                                                          | ⚠️      | Destinataire des notifications admin                             |
| `TIGRIS_BUCKET_NAME`, `TIGRIS_STORAGE_ACCESS_KEY_ID`, `TIGRIS_STORAGE_SECRET_ACCESS_KEY`, `TIGRIS_STORAGE_ENDPOINT` | ⚠️      | Stockage S3 Tigris                                               |
| `NEXT_PUBLIC_TIGRIS_PUBLIC_URL`                                                                                     | ⚠️      | URL publique des fichiers                                        |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`                                                                | ⚠️      | Redis (rate limiting désactivé si absent)                        |
| `RATE_LIMIT_MAX_REQUESTS`, `RATE_LIMIT_WINDOW_SECONDS`                                                              | ➖      | Réglage du rate limit (défaut 20 / 10 s)                         |
| `QSTASH_TOKEN`                                                                                                      | ⚠️      | Publication des tâches QStash                                    |
| `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`                                                             | ✅ prod | Vérification de signature des webhooks                           |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`                                          | ⚠️      | Supabase Realtime                                                |
| `ENABLE_SEED_ROUTE`                                                                                                 | ➖      | `true` pour autoriser `POST /api/seed` en dev uniquement         |
| `LOG_LEVEL`                                                                                                         | ➖      | Niveau Pino (défaut : `info` en prod, `debug` en dev)            |

Légende : ✅ requis · ⚠️ optionnel avec fonctionnalité dégradée · ➖ réglage facultatif

---

## 9. Limites — Ce que les agents ne doivent PAS faire sans accord explicite

- Exécuter `prisma migrate reset`, `db push --force-reset` ou toute commande destructive sur la DB.
- Modifier une migration déjà appliquée ou désactiver une policy RLS.
- Committer / pousser, ou écrire des secrets dans un fichier versionné.
- Ajouter une dépendance (justifier le besoin, préférer l'existant) ou changer de version majeure.
- Régénérer/écraser en masse `src/components/ui/` (shadcn) ou désactiver une règle ESLint globalement.
- Supprimer du contenu de `.env*`, `CHANGELOG.md` ou des archives `docs/old/`.

---

## 10. Gotchas

1. **SSR vs CSR** : `window`, `document`, `localStorage`, jsPDF ⇒ composants `"use client"` ou garde `typeof window !== "undefined"`. Utiliser `useHasMounted` contre les erreurs d'hydratation.
2. **Edge Runtime** : `middleware.ts` n'a pas accès à Node (`fs`, `path`…) ni à Prisma.
3. **Middleware ≠ autorisation** : il vérifie seulement le cookie `better-auth.session_token` ; le rôle est validé par `requireAdmin()`.
4. **PNPM + Prisma** : sans `output = "../node_modules/.prisma/client"`, le type `Prisma` devient introuvable (cf. ISSUE-001).
5. **Import Prisma** : export **par défaut** → `import prisma from "@/lib/prisma"`.
6. **`Quote.amount` est une `String`** (ex. « À calculer ») — ne pas faire d'arithmétique sans parsing.
7. **`SystemSettings`** est un singleton (`id = "default"`) : utiliser `upsert`.
8. **IA résiliente** : Gemini et Hugging Face ont des fallbacks ; toute nouvelle fonction IA doit fonctionner sans clé API.
9. **Rate limiting** : actif sur `/api/*` et les Server Actions (5 req/min sur `POST /api/auth/*`) — en tenir compte dans les tests manuels.
10. **Docs ignorées** : `docs/` et `.agents/` sont dans `.gitignore` — ce qui doit être partagé va dans un fichier racine.
11. **Contenu francophone** : tout texte utilisateur en français, ton professionnel.

---

## 11. Équipe d'Agents (skills dans `.agents/skills/`)

| Skill                 | Rôle                 | Déclencheurs                                            |
| --------------------- | -------------------- | ------------------------------------------------------- |
| `mission-control`     | Orchestrateur        | « brief », « aide », « revue critique », « pré-deploy » |
| `project-tracker`     | Chef de projet       | « roadmap », « status », « backlog »                    |
| `code-guardian`       | Qualité de code      | « lint », « type-check », « code review »               |
| `fullstack-architect` | Architecture         | « architecture », « où mettre », « pattern »            |
| `security-sentinel`   | Sécurité             | « security », « audit », « secrets », « RLS »           |
| `issue-resolver`      | Bugs & tickets       | « bug », « fix », « ticket », « issue »                 |
| `doc-writer`          | Documentation        | « documentation », « readme », « guide »                |
| `ui-ux-pro-max`       | Design & UX          | « design UI/UX », « palettes », « UX guidelines »       |
| `ui-styling`          | Composants & styling | « shadcn/ui », « tailwind », « thèmes »                 |
| `design-system`       | Tokens & specs       | « tokens », « design system », « échelles »             |
| `design` / `brand`    | Identité visuelle    | « logo », « charte graphique », « brand »               |
| `banner-design`       | Bannières            | « bannière », « hero banner »                           |
| `slides`              | Présentations        | « slides », « pitch deck »                              |

**Règle de délégation** : une tâche qui touche la DB ou l'auth passe par `fullstack-architect` + `security-sentinel` ; toute tâche se termine par une vérification `code-guardian` (section 7).
