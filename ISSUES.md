# 📝 Issues — Frozen Lunar

> **Dernière mise à jour** : 2026-07-26  
> **Géré par** : `mission-control` & `issue-resolver`

## Statistiques
- 🔴 Ouvertes : 0
- 🟡 En cours : 0
- 🟢 Résolues : 4

---

## Issues Résolues (archive)

### ISSUE-001: Correction de l'Export Type `Prisma` introuvable sous PNPM
- **Priorité** : P0 (Bloquant Build/Type-Check)
- **Type** : Bug / DX
- **Statut** : 🟢 Fixed & Verified
- **Composants** : [prisma/schema.prisma](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/prisma/schema.prisma), [package.json](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/package.json)
- **Rapporté** : 2026-07-25
- **Description** : `tests/unit/error-handler.test.ts` signalait `Module '"@prisma/client"' has no exported member 'Prisma'`.
- **Solution appliquée** : Ajout de `output = "../node_modules/.prisma/client"` et `"postinstall": "prisma generate"`.

### ISSUE-002: Consolidation et Hardening du Client Prisma 6
- **Priorité** : P1 (Stabilité / Production)
- **Type** : Stabilité & Sécurité
- **Statut** : 🟢 Fixed & Verified
- **Composants** : [prisma/schema.prisma](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/prisma/schema.prisma), [.env.example](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/.env.example)

### ISSUE-003: Résolution des erreurs de types et d'exports dans `quote-management.ts`
- **Priorité** : P1 (Qualité & Types)
- **Type** : Bug / TypeScript
- **Statut** : 🟢 Fixed & Verified
- **Composant** : [src/app/actions/quote-management.ts](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/src/app/actions/quote-management.ts)

### ISSUE-004: Interdiction Stricte du Type `any` sur l'Ensemble du Projet
- **Priorité** : P1 (Gouvernance & Qualité)
- **Type** : Règle Qualité / Refactor
- **Statut** : 🟢 Fixed & Verified
- **Composants** : [eslint.config.mjs](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/eslint.config.mjs), [.agents/AGENTS.md](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/.agents/AGENTS.md), [src/lib/support-agent/quote-flow.ts](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/src/lib/support-agent/quote-flow.ts), suite de tests `tests/`
- **Rapporté** : 2026-07-26
- **Description** : Imposition de la règle **Zero `any`** sur l'ensemble du projet.
- **Solution appliquée** :
  1. Ajout de la règle `"@typescript-eslint/no-explicit-any": "error"` dans [eslint.config.mjs](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/eslint.config.mjs).
  2. Mise à jour des conventions du projet dans [.agents/AGENTS.md](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/.agents/AGENTS.md).
  3. Nettoyage de tous les types `any` restants dans le code applicatif et la suite de tests (remplacés par des types concrets, generics et `unknown`).
- **Vérifié** : tsc ✅ | lint ✅ | vitest ✅
