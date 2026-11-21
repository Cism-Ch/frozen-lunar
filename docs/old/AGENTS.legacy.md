# 🧠 Frozen Lunar — Constitution du Projet

> Ce fichier est lu automatiquement par tous les agents AI. Il définit les règles, conventions, et connaissances partagées du projet.

---

## Identité

- **Nom de code** : Frozen Lunar
- **Nom commercial** : HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE
- **Mission** : "Votre sécurité, Notre priorité" — Plateforme digitale de logistique spécialisée (transport de matériaux, containers, charpentes, machines, modules préfabriqués)
- **Langue principale** : Français (UI, documentation, commentaires de code)
- **Licence** : Privée — Tous droits réservés

---

## Stack Technique

| Couche | Technologie | Version |
|--------|------------|---------|
| Framework | Next.js (App Router) | 16 |
| UI Library | React | 19 |
| Langage | TypeScript (strict) | 5 |
| Styling | Tailwind CSS | 4 |
| Composants UI | shadcn/ui (Radix UI) | Latest |
| Animations | Framer Motion | 12 |
| ORM | Prisma Client | 6 |
| Base de données | PostgreSQL (via Supabase) | — |
| Authentification | Better-Auth | 1.4 |
| Cache & Rate Limiting | Upstash Redis | — |
| Tâches async | Upstash QStash | — |
| Stockage fichiers | Tigris (S3-compatible) | — |
| Emails | Resend + React Email | — |
| IA | Google Gemini API | — |
| Validation | Zod | 4 |
| Formulaires | React Hook Form | 7 |
| PDF | jsPDF + jspdf-autotable | — |
| Icons | Lucide React | — |
| Thèmes | next-themes | — |
| Toasts | Sonner | — |

---

## Structure de Fichiers — "Où Mettre Quoi"

```
frozen-lunar/
├── .agents/                    # Configuration des agents AI
│   ├── AGENTS.md               # CE FICHIER — Constitution
│   └── skills/                 # Skills des agents
├── docs/                       # Documentation active
│   └── old/                    # Archives (anciens .md)
├── prisma/
│   ├── schema.prisma           # Schéma de base de données
│   └── migrations/             # Migrations Prisma
├── public/                     # Assets statiques
├── src/
│   ├── app/                    # Routes Next.js (App Router)
│   │   ├── actions/            # Server Actions ("use server")
│   │   ├── admin/              # Pages admin protégées
│   │   ├── api/                # Route Handlers (REST)
│   │   │   ├── admin/          # API admin (init, check)
│   │   │   ├── auth/           # API Better-Auth
│   │   │   ├── seed/           # Seeding DB
│   │   │   └── workflow/       # Webhooks QStash
│   │   ├── about/              # Page "À propos"
│   │   ├── contact/            # Page contact
│   │   ├── devis/              # Formulaire de devis
│   │   ├── legal/              # Pages légales
│   │   ├── services/           # Page services
│   │   ├── layout.tsx          # Layout racine (providers, fonts)
│   │   ├── page.tsx            # Homepage
│   │   └── globals.css         # Styles globaux + tokens Tailwind
│   ├── components/
│   │   ├── emails/             # Templates React Email
│   │   ├── features/           # Composants métier
│   │   │   ├── admin/          # Composants admin (sidebar, users)
│   │   │   ├── quote-wizard/   # Steps du wizard devis
│   │   │   └── support/        # Chat de support IA
│   │   ├── layout/             # Layout (Header, Footer, Section)
│   │   └── ui/                 # Primitives shadcn/ui
│   ├── config/                 # Configuration app (marketing.ts)
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilitaires & services
│   │   ├── support-agent/      # Logique de l'agent de support
│   │   ├── auth.ts             # Config Better-Auth (serveur)
│   │   ├── auth-client.ts      # Config Better-Auth (client)
│   │   ├── prisma.ts           # Singleton Prisma
│   │   ├── redis.ts            # Client Redis
│   │   ├── qstash.ts           # Client QStash
│   │   ├── storage.ts          # Client Tigris/S3
│   │   ├── email.ts            # Client Resend
│   │   ├── gemini.ts           # Client Gemini AI
│   │   ├── validation.ts       # Schémas Zod partagés
│   │   ├── error-handler.ts    # Gestion d'erreurs centralisée
│   │   ├── error-codes.ts      # Codes d'erreur standardisés
│   │   └── utils.ts            # Helpers génériques (cn, etc.)
│   └── types/                  # Définitions TypeScript
├── middleware.ts                # Auth + Rate Limiting (Edge)
├── PROJECT_STATUS.md            # Source de vérité (état du projet)
├── CHANGELOG.md                 # Historique des changements
├── README.md                    # Présentation GitHub
└── package.json                 # Dépendances
```

---

## Conventions Obligatoires

### TypeScript
- **Strict mode** activé — **Zero `any` toléré** : L'utilisation du type `any` ou `as any` est strictement interdite dans l'ensemble du projet (règle ESLint `@typescript-eslint/no-explicit-any` réglée sur `"error"`). Utiliser des types concrets, des génériques, ou `unknown` avec type narrowing (`instanceof` ou type guards).
- **Imports** : Toujours utiliser l'alias `@/*` — jamais d'imports relatifs profonds
- **Types de retour** : Toujours explicites sur les fonctions publiques
- **Catch blocks** : Toujours typer `error: unknown` et narrower avec `instanceof`

### Server Actions
- **Pattern de retour obligatoire** : `{ data, error }` — jamais de throw direct
- **Validation Zod** : Toutes les entrées validées AVANT l'accès DB
- **Revalidation** : `revalidatePath()` ou `revalidateTag()` après mutation
- **Fichiers** : dans `src/app/actions/`

```typescript
// ✅ Pattern obligatoire
export async function myAction(input: unknown) {
  try {
    const validated = mySchema.parse(input);
    const result = await prisma.model.create({ data: validated });
    revalidatePath("/path");
    return { data: result, error: null };
  } catch (error: unknown) {
    console.error("myAction Error:", error);
    if (error instanceof Error) {
      return { data: null, error: error.message };
    }
    return { data: null, error: "Erreur inconnue" };
  }
}
```

### Prisma & PNPM
- **Singleton** : Utiliser `@/lib/prisma` — ne jamais instancier `PrismaClient` directement
- **Output PNPM** : Spécifier `output = "../node_modules/.prisma/client"` dans `schema.prisma` pour assurer une détection immédiate des types sous PNPM
- **Hook Postinstall** : Le script `"postinstall": "prisma generate"` dans `package.json` doit être préservé
- **Moteur Multi-Plateformes** : Conserver `binaryTargets = ["native", "rhel-openssl-3.0.x"]` dans `schema.prisma`
- **Migrations & Sync** : Utiliser `DIRECT_URL` (port 5432) pour les migrations, et synchroniser le schéma avec Better-Auth

### Sécurité
- **Ne jamais exposer** : hash de mots de passe, tokens, clés API côté client
- **Vérifications côté serveur** : L'auth est TOUJOURS vérifiée côté serveur, jamais uniquement côté client
- **Variables d'environnement** : Seules les variables `NEXT_PUBLIC_*` sont accessibles côté client
- **RLS Supabase** : Configurer les Row Level Security policies sur les tables sensibles

### Tailwind CSS
- **Ordre canonique** des classes : layout → spacing → typography → colors → effects
- **Pas de CSS custom** sauf pour les tokens dans `globals.css`
- **shadcn/ui** : Préférer les composants existants avant d'en créer de nouveaux

### Commentaires & Documentation
- **Langue** : Français pour les commentaires métier, anglais pour les commentaires techniques standard
- **JSDoc** : Sur toutes les fonctions publiques exportées
- **Pas de code sans commentaire pertinent** si la logique n'est pas triviale

### Fichiers .env
- **Ne JAMAIS supprimer** le contenu des fichiers `.env.*` — commenter si inutile
- **Toujours mettre à jour** `.env.example` quand une nouvelle variable est ajoutée
- **Chercher les .env existants** avant toute modification

---

## Variables d'Environnement

| Variable | Requise | Description |
|----------|---------|-------------|
| `DATABASE_URL` | ✅ | URL PostgreSQL Supabase (pooled) |
| `DIRECT_URL` | ✅ | URL PostgreSQL Supabase (directe, pour migrations) |
| `NEXT_PUBLIC_APP_URL` | ✅ | URL de l'app (http://localhost:3000 en dev) |
| `NEXT_PUBLIC_GEMINI_API_KEY` | ⚠️ | Clé API Gemini (fallback mock si absent) |
| `RESEND_KEY` | ⚠️ | Clé API Resend pour les emails |
| `TIGRIS_BUCKET_NAME` | ⚠️ | Nom du bucket S3 Tigris |
| `TIGRIS_STORAGE_ACCESS_KEY_ID` | ⚠️ | Clé d'accès Tigris |
| `TIGRIS_STORAGE_SECRET_ACCESS_KEY` | ⚠️ | Clé secrète Tigris |
| `TIGRIS_STORAGE_ENDPOINT` | ⚠️ | Endpoint Tigris |
| `NEXT_PUBLIC_TIGRIS_PUBLIC_URL` | ⚠️ | URL publique Tigris |
| `UPSTASH_REDIS_REST_URL` | ⚠️ | URL Redis Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | ⚠️ | Token Redis Upstash |
| `QSTASH_TOKEN` | ⚠️ | Token QStash |

---

## Commandes Essentielles

```bash
pnpm dev             # Serveur de développement (localhost:3000)
pnpm build           # Build de production
pnpm start           # Serveur de production
pnpm lint            # ESLint (pnpm exec eslint .)
pnpm format          # Formatage du code et tri des classes Tailwind (prettier --write .)
pnpm format:check    # Vérification du formatage Prettier
pnpm type-check      # pnpm exec tsc --noEmit (vérification des types)

pnpm exec prisma migrate dev    # Créer/appliquer une migration
pnpm exec prisma studio         # Interface visuelle DB
pnpm exec prisma generate       # Régénérer le client Prisma
```

---

## État Actuel du Projet

Consulter **[PROJECT_STATUS.md](../PROJECT_STATUS.md)** pour l'état détaillé et à jour du projet.

---

## Équipe d'Agents

| Agent / Skill | Rôle | Quand l'invoquer |
|---------------|------|-----------------|
| `mission-control` | Orchestrateur | "brief", "aide", "revue critique" |
| `project-tracker` | Chef de Projet | "roadmap", "status", "backlog" |
| `code-guardian` | Qualité de Code | "lint", "type-check", "code review" |
| `fullstack-architect` | Architecture | "architecture", "où mettre", "pattern" |
| `security-sentinel` | Sécurité | "security", "audit", "secrets" |
| `issue-resolver` | Résolution | "bug", "fix", "ticket", "issue" |
| `doc-writer` | Documentation | "documentation", "readme", "guide" |
| `ui-ux-pro-max` | Expert Design & UI/UX | "design UI/UX", "styles", "palettes", "UX guidelines" |
| `ui-styling` | Composants & Styling UI | "shadcn/ui", "tailwind", "thèmes", "composants UI" |
| `design-system` | Architecture Design System | "tokens", "design system", "échelles CSS", "specs" |
| `design` / `brand` | Identité Visuelle & Logo | "logo", "charte graphique", "brand", "CIP" |
| `banner-design` | Création de Bannières | "bannière", "hero banner", "social media header" |
| `slides` | Présentations & Decks | "slides", "présentation", "pitch deck" |

---

## Gotchas Importants

1. **SSR vs CSR** : `localStorage`, `window`, `document` ne sont disponibles que côté client. Les garder derrière `typeof window !== 'undefined'` ou dans des composants `"use client"`.
2. **Edge Runtime** : Le middleware s'exécute en Edge — pas d'accès à Node.js natif (`fs`, `net`, `path`, etc.)
3. **Prisma en Edge** : Prisma ne fonctionne pas en Edge Runtime — utiliser les Server Actions ou Route Handlers.
4. **Resolution PNPM & Prisma** : `output = "../node_modules/.prisma/client"` doit être maintenu dans `schema.prisma` pour éviter l'échec de résolution TypeScript sous PNPM.
5. **Zero `any` & Annotations Explicites** : La règle ESLint `@typescript-eslint/no-explicit-any` est bloquante. Annoter les fonctions d'itération (`.map((x: ExplicitType) => ...)`) pour éviter toute inférence `any` implicite.
6. **jsPDF** : Touche `window` — uniquement dans des interactions client.
7. **Better-Auth cookies** : Le cookie `better-auth.session_token` est vérifié dans le middleware, mais la validation complète du rôle se fait côté serveur dans les pages.
8. **Site francophone** : Tout le contenu utilisateur doit être en français, cohérent avec le ton professionnel du projet.
