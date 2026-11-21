# 📝 Issues — Frozen Lunar

> **Dernière mise à jour** : 2026-10-25  
> **Géré par** : `mission-control` & `issue-resolver`

## Statistiques

- 🔴 Ouvertes : 0
- 🟡 En cours : 0
- 🟢 Résolues : 12

---

## Issues Ouvertes

_(Aucune issue ouverte — backlog courant 100% résolu)_

---

## Issues Résolues (archive)

### ISSUE-005: Réorganisation adaptative du sélecteur de position dans `LocationPicker.tsx` (`UI-RESP-01`)

- **Priorité** : P0 (Bloquant UX Mobile)
- **Type** : Amélioration UI/UX / Responsivité
- **Statut** : 🟢 Fixed & Verified
- **Composant** : [src/components/features/LocationPicker.tsx](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/src/components/features/LocationPicker.tsx)
- **Rapporté** : 2026-10-25 — **Résolu** : 2026-10-25
- **Description** : Sur mobile étroit, l'input texte était comprimé sur < 100px utile par les deux boutons d'action fixes 120px.
- **Solution appliquée** :
    1. Réorganisation adaptative : champ texte étendu en pleine largeur sur mobile (`w-full`), et boutons GPS / carte interactive positionnés en barre d'action tactile ergonomique ($\ge 44\text{px}$) avec libellés explicites en dessous.
    2. Préservation de l'alignement en ligne avec boutons carrés 56px sur desktop (`hidden sm:flex`).
    3. Dialog adaptatif avec bornage de hauteur (`max-h-[85vh] overflow-y-auto`) et pied d'action responsive.
- **Vérifié** : format ✅ | lint ✅ | tsc ✅ | vitest ✅ | build ✅

### ISSUE-006: Auto-Dismiss & Dimensionnement adaptatif du tiroir mobile dans `Header.tsx` (`UI-RESP-02`)

- **Priorité** : P0 (Bloquant Navigation Mobile)
- **Type** : Amélioration UI/UX / Navigation
- **Statut** : 🟢 Fixed & Verified
- **Composant** : [src/components/layout/Header.tsx](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/src/components/layout/Header.tsx)
- **Rapporté** : 2026-10-25 — **Résolu** : 2026-10-25
- **Description** : Le tiroir mobile restait ouvert après navigation sur un lien ; largeur rigide `w-[300px]`.
- **Solution appliquée** :
    1. Tiroir mobile contrôlé avec `mobileMenuOpen` et `setMobileMenuOpen(false)` au tap sur chaque item, le logo et le CTA devis.
    2. Largeur adaptative `w-[min(calc(100vw-1.5rem),340px)] sm:w-[380px]`.
    3. Cibles tactiles standardisées à `min-h-[44px]` avec état `active:bg-muted/80`.
- **Vérifié** : format ✅ | lint ✅ | tsc ✅ | vitest ✅ | build ✅

### ISSUE-007: Grille adaptative et fluidité mobile dans `contact/page.tsx` (`UI-RESP-03`)

- **Priorité** : P1 (UX / Formulaire)
- **Type** : Amélioration UI/UX / Responsivité
- **Statut** : 🟢 Fixed & Verified
- **Composant** : [src/app/contact/page.tsx](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/src/app/contact/page.tsx)
- **Rapporté** : 2026-10-25 — **Résolu** : 2026-10-25
- **Description** : Grille `grid-cols-2` rigide forçant deux colonnes étriquées sur mobile pour Prénom et Nom.
- **Solution appliquée** : Remplacement par `grid grid-cols-1 sm:grid-cols-2 gap-4` permettant un empilement vertical naturel sur mobile sans tronquer les champs ni les erreurs de validation.
- **Vérifié** : format ✅ | lint ✅ | tsc ✅ | vitest ✅ | build ✅

### ISSUE-008: Thumb Zone & Prévention d'étouffement des boutons dans `WizardFooter.tsx` (`UI-RESP-04`)

- **Priorité** : P1 (UX / Tunnel de Conversion)
- **Type** : Amélioration UI/UX / Responsivité
- **Statut** : 🟢 Fixed & Verified
- **Composant** : [src/components/features/quote-wizard/WizardFooter.tsx](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/src/components/features/quote-wizard/WizardFooter.tsx)
- **Rapporté** : 2026-10-25 — **Résolu** : 2026-10-25
- **Description** : `CardFooter flex justify-between` créant un écrasement entre le bouton retour et le CTA devis sur smartphone 320px.
- **Solution appliquée** :
    1. Bascule en `flex flex-col-reverse gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6`.
    2. Bouton principal pleine largeur au-dessus (`w-full sm:w-auto h-12`) directement dans la Thumb Zone, et bouton retour en dessous (`w-full sm:w-auto min-h-[44px]`).
- **Vérifié** : format ✅ | lint ✅ | tsc ✅ | vitest ✅ | build ✅

### ISSUE-009: Cibles tactiles WCAG 2.5.5 et espacement newsletter dans `Footer.tsx` (`UI-RESP-05`)

- **Priorité** : P1 (Accessibilité / Ergonomie)
- **Type** : Amélioration UI/UX / WCAG
- **Statut** : 🟢 Fixed & Verified
- **Composant** : [src/components/layout/Footer.tsx](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/src/components/layout/Footer.tsx)
- **Rapporté** : 2026-10-25 — **Résolu** : 2026-10-25
- **Description** : Boutons réseaux sociaux en `p-2` (~32px) < 44px requis par WCAG 2.5.5 ; newsletter écrasée sur mobile.
- **Solution appliquée** :
    1. Liens sociaux agrandis à `min-h-[44px] min-w-[44px] h-11 w-11` avec `aria-label`.
    2. Formulaire newsletter adaptatif `flex flex-col sm:flex-row gap-2` avec input `h-11 sm:h-10` et bouton `h-11 sm:h-10 px-5 w-full sm:w-auto`.
- **Vérifié** : format ✅ | lint ✅ | tsc ✅ | vitest ✅ | build ✅

### ISSUE-010: Adaptabilité et confort de sélection dans `StepDate.tsx` (`UI-RESP-06`)

- **Priorité** : P2 (UX / Wizard)
- **Type** : Amélioration UI/UX / Calendrier
- **Statut** : 🟢 Fixed & Verified
- **Composant** : [src/components/features/quote-wizard/steps/StepDate.tsx](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/src/components/features/quote-wizard/steps/StepDate.tsx)
- **Rapporté** : 2026-10-25 — **Résolu** : 2026-10-25
- **Description** : Débordement latéral potentiel du calendrier popover sur smartphone 320px.
- **Solution appliquée** : Centrage et bornage de largeur du popover `align="center" sideOffset={8} className="w-auto max-w-[calc(100vw-2rem)] p-0 rounded-xl shadow-xl"` et taille de bouton fluide `h-12 sm:h-14`.
- **Vérifié** : format ✅ | lint ✅ | tsc ✅ | vitest ✅ | build ✅

### ISSUE-011: Puces de timeline et structure modale dans `QuoteSummaryDialog.tsx` (`UI-RESP-07`)

- **Priorité** : P2 (UX / Modale Devis)
- **Type** : Amélioration UI/UX / Alignement
- **Statut** : 🟢 Fixed & Verified
- **Composant** : [src/components/features/QuoteSummaryDialog.tsx](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/src/components/features/QuoteSummaryDialog.tsx)
- **Rapporté** : 2026-10-25 — **Résolu** : 2026-10-25
- **Description** : Décalage de 3px de la puce de timeline sur marges négatives arbitraires ; dialogue non borné.
- **Solution appliquée** :
    1. Alignement strict de la timeline sur `border-l-2 border-border/80 pl-4 ml-2` avec puces centrées `-left-[21px]`.
    2. Grille de métadonnées `grid-cols-1 sm:grid-cols-2 gap-4`.
    3. Dialogue scrollable borné `max-h-[85vh] overflow-y-auto`.
- **Vérifié** : format ✅ | lint ✅ | tsc ✅ | vitest ✅ | build ✅

### ISSUE-012: Ergonomie tactile des Quick-Replies et contrôles dans le Chat IA (`UI-RESP-08`)

- **Priorité** : P2 (UX / Chat IA)
- **Type** : Amélioration UI/UX / Support
- **Statut** : 🟢 Fixed & Verified
- **Composants** : [src/components/features/support/ChatInput.tsx](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/src/components/features/support/ChatInput.tsx), [src/components/features/support/components/ChatHeader.tsx](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/src/components/features/support/components/ChatHeader.tsx)
- **Rapporté** : 2026-10-25 — **Résolu** : 2026-10-25
- **Description** : Cibles des suggestions rapides réduites (`h-8`), difficiles à manipuler au pouce.
- **Solution appliquée** :
    1. Suggestions rapides portées à `min-h-[38px] px-3.5 py-1.5` avec défilement fluide `no-scrollbar`.
    2. Boutons d'action d'en-tête agrandis à `h-9 w-9` avec feedback visuel amélioré.
- **Vérifié** : format ✅ | lint ✅ | tsc ✅ | vitest ✅ | build ✅

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
- **Composants** : [eslint.config.mjs](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/eslint.config.mjs), [AGENTS.md](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/AGENTS.md), [src/lib/support-agent/quote-flow.ts](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/src/lib/support-agent/quote-flow.ts), suite de tests `tests/`
- **Rapporté** : 2026-07-26
- **Description** : Imposition de la règle **Zero `any`** sur l'ensemble du projet.
- **Solution appliquée** :
    1. Ajout de la règle `"@typescript-eslint/no-explicit-any": "error"` dans [eslint.config.mjs](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/eslint.config.mjs).
    2. Mise à jour des conventions du projet dans [AGENTS.md](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/AGENTS.md).
    3. Nettoyage de tous les types `any` restants dans le code applicatif et la suite de tests (remplacés par des types concrets, generics et `unknown`).
- **Vérifié** : tsc ✅ | lint ✅ | vitest ✅
