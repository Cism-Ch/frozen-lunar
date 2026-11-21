# Changelog

Tous les changements notables du projet **Frozen Lunar** sont documentés ici.
Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

---

## [Unreleased]

### Added & Documented (TASK-014 : Spécification OpenAPI 3.1.0, Swagger & Référence API Développeurs)

- **Spécification OpenAPI 3.1.0 Exhaustive (JSON & YAML)** :
    - Publication de la spécification standardisée au format JSON (`public/openapi.json`) et YAML (`docs/openapi.yaml`).
    - Couverture intégrale des Route Handlers REST, de l'authentification et des webhooks asynchrones :
        - `/api/admin/check` (GET : vérification de l'existence d'un administrateur).
        - `/api/admin/init` (POST : initialisation du premier compte administrateur à usage unique).
        - `/api/workflow/email` (POST : webhook asynchrone signé QStash / Resend pour notifications admin et confirmations client).
        - `/api/workflow/pdf` (POST : webhook asynchrone signé QStash / Tigris S3 pour génération de devis PDF).
        - `/api/seed` (POST : injection contrôlée d'utilisateurs de test avec protection stricte hors production).
        - `/api/auth/[...all]` (Better-Auth : sign-in, sign-up, sign-out, get-session, forget-password, reset-password, change-password).
    - Définition formelle des schémas de sécurité (`SessionCookieAuth` via cookie `better-auth.session_token`, `QStashSignatureAuth` via header HMAC `Upstash-Signature`).
    - Modélisation de tous les schémas de données d'entrée et de sortie (`AdminCheckResponse`, `AdminInitRequest`, `EmailWorkflowPayload`, `PdfWorkflowPayload`, `ErrorResponse`, `RateLimitErrorResponse`...).
- **Route de Découverte OpenAPI & Support CORS (`/api/openapi`)** :
    - Route Next.js App Router dynamique (`src/app/api/openapi/route.ts`) exposant la spécification JSON avec en-têtes CORS (`Access-Control-Allow-Origin: *`) et gestion de cache (`Cache-Control: public, s-maxage=3600`).
    - Handler OPTIONS pré-vol (preflight CORS) pour intégration transparente avec Swagger UI, Redoc, Postman et Insomnia.
- **Référence Technique Développeurs Complète (`docs/API_REFERENCE.md`)** :
    - Guide technique détaillé pour intégrateurs et développeurs tiers selon les standards du skill `doc-writer`.
    - Documentation des architectures REST et Server Actions (contrat de retour systématique `{ data, error }`).
    - Règles de Rate Limiting Edge Middleware (20 req / 10s API, 5 req / 60s Auth), formats d'en-têtes et codes d'erreur centralisés (`DBxxx`, `AUTHxxx`, `VALxxx`, `EMAILxxx`, `SYSxxx`).
- **Tests Automatisés Vitest (`tests/unit/openapi.test.ts`)** :
    - 2 nouveaux tests unitaires automatisés validant la validité du schéma OpenAPI 3.1.0, la présence de toutes les routes requises, et le comportement des handlers GET et OPTIONS (total de la suite porté à 81 tests réussis sur 13 suites).

### Added & Improved (TASK-027 : Refonte Responsivité & Normes UI/UX 2026 Espace Public & Partagé)

- **Audit Spécialisé Multi-Agents UI/UX (Standards SaaS / Web 2026 & WCAG 2.1 AA/AAA)** :
    - Audit statique exhaustif conduit par `ui-ux-pro-max`, `project-tracker` et `issue-resolver` sur l'ensemble des composants publics, du tunnel de conversion (Wizard de devis), du module de chat de support et des composants interactifs partagés.
    - Élaboration du plan de référence [docs/PLAN_SUIVI_RESPONSIVITE_PUBLIC_2026.md](file:///c:/Users/hanok/Dev/Personal-Project/frozen-lunar/docs/PLAN_SUIVI_RESPONSIVITE_PUBLIC_2026.md) détaillant la grille d'évaluation, les critères d'acceptation, les cotes d'espacement 8pt et les dimensions cibles tactiles ($\ge 44\text{px}$).
- **Résolution Intégrale des 8 Chantiers de Responsivité (`ISSUE-005` à `ISSUE-012`)** :
    - `UI-RESP-01` (`ISSUE-005` — `LocationPicker.tsx`) : Champ d'adresse pleine largeur sur mobile avec barre d'action tactile ergonomique ($\ge 44\text{px}$) pour GPS et carte interactive ; alignement desktop préservé ; dialogue de carte responsive.
    - `UI-RESP-02` (`ISSUE-006` — `Header.tsx`) : Tiroir mobile contrôlé avec fermeture automatique immédiate (_auto-dismiss_) au clic sur tout lien de navigation ou CTA ; largeur adaptative `w-[min(calc(100vw-1.5rem),340px)]` ; cibles tactiles $\ge 44\text{px}$.
    - `UI-RESP-03` (`ISSUE-007` — `contact/page.tsx`) : Grille fluide `grid-cols-1 sm:grid-cols-2` pour Prénom et Nom supprimant l'écrasement sur viewport mobile.
    - `UI-RESP-04` (`ISSUE-008` — `WizardFooter.tsx`) : Pied de carte adaptatif `flex-col-reverse sm:flex-row` plaçant le CTA principal en pleine largeur dans la Thumb Zone et prévenant les collisions de boutons.
    - `UI-RESP-05` (`ISSUE-009` — `Footer.tsx`) : Cibles tactiles des réseaux sociaux agrandies à $44\text{px}$ (WCAG 2.5.5 Target Size) avec `aria-label` ; formulaire newsletter adaptatif `flex-col sm:flex-row`.
    - `UI-RESP-06` (`ISSUE-010` — `StepDate.tsx`) : Popover calendrier centré avec bornage dynamique de largeur (`max-w-[calc(100vw-2rem)]`) empêchant tout débordement latéral sur smartphone.
    - `UI-RESP-07` (`ISSUE-011` — `QuoteSummaryDialog.tsx`) : Puces de timeline mathématiquement centrées sur l'axe vertical sans marges arbitraires désaxées ; grille 2 colonnes adaptative ; modale scrollable bornée (`max-h-[85vh]`).
    - `UI-RESP-08` (`ISSUE-012` — `ChatInput.tsx` & `ChatHeader.tsx`) : Pilules de quick-replies portées à `min-h-[38px]` avec défilement fluide `no-scrollbar` ; boutons de contrôle d'en-tête agrandis à $36-40\text{px}$.

### Improved & Fixed (DT-008 : Éradication Totale des `console.*` et Migration vers Pino `logger`)

- **Migration Complète vers le Singleton Pino (`@/lib/logger`)** :
    - Élimination des 68 occurrences de `console.log`, `console.warn`, `console.error` et `console.info` dans l'ensemble de la codebase `src/`.
    - Migration des 11 Server Actions (`src/app/actions/`), des 5 Route Handlers (`src/app/api/`), de la couche de services (`src/lib/auth.ts`, `src/lib/date-utils.ts`, `src/lib/gemini.ts`, `src/lib/huggingface.ts`, `src/lib/email.ts`, `src/lib/qstash.ts`, `src/lib/redis.ts`, `src/lib/storage.ts`), des hooks (`useSupportChat.ts`, `useRealtimeQuotes.ts`), et des composants et pages de l'espace d'administration.
    - Mise à jour de la suite de tests unitaires (`tests/unit/date-utils.test.ts`) avec espionnage direct sur `logger.warn`.
    - Formatage JSON structuré des logs avec métadonnées (`service`, `env`, timestamp ISO standardisé) et gestion transparente en environnement client (browser mode Pino).

### Added & Improved (TASK-026 : Refonte Responsivité & Normes UI/UX 2026 Espace Administration)

- **Dual Pattern Tactile Mobile & Desktop (`RESP-01` — `UserList.tsx`)** :
    - Remplacement du tableau monolithique écrasé par une vue duale : cartes tactiles fluides avec cibles tactiles $\ge 44\text{px}$ sur mobile (`md:hidden`), tableau étendu avec défilement de sécurité sur desktop (`hidden md:block`).
    - Remplacement de `window.confirm()` bloquant par le dialogue accessible `@/components/ui/confirm-dialog` (`ConfirmDialog`).
- **Formulaire Adaptatif Vertical (`RESP-02` — `AddUserDialog.tsx`)** :
    - Alignement vertical fluide des libellés et champs en vue mobile, éliminant les collisions sur écran étroit.
    - Largeur modale calibrée `w-[calc(100vw-2rem)] sm:max-w-[440px]` et boutons CTA pleine largeur sur mobile (`w-full sm:w-auto`).
- **En-Tête Adaptatif (`RESP-03` — `admin/users/page.tsx`)** :
    - Réorganisation du conteneur en `flex-col sm:flex-row sm:items-center sm:justify-between`, supprimant le télescopage entre le titre H1 et le CTA d'ajout.
- **Fermeture Automatique du Tiroir Mobile (`RESP-04` — `admin/layout.tsx` & `SidebarContent.tsx`)** :
    - État contrôlé `sidebarOpen` avec prop `onNavigate` fermant instantanément le tiroir mobile (`Sheet`) lors de la sélection d'un onglet.
    - Synchronisation automatique sur changement d'URL (`pathname`) pour garantir une navigation fluide.
- **Barre d'Onglets Défilable Horizontalement (`RESP-05` — `SettingsClient.tsx`)** :
    - Restauration des libellés textuels sur tous les écrans (fin des icônes orphelines sans label) avec défilement horizontal fluide (`overflow-x-auto no-scrollbar scroll-smooth`) et dégradé d'indication visuel sur mobile.
    - Ajout de l'utilitaire Tailwind v4 `@utility no-scrollbar` dans `globals.css`.
- **Barre de Décision Tactile Sticky Mobile (`RESP-06` — `quotes/[id]/page.tsx`)** :
    - Barre fixe d'actions décisionnelles au pouce (`fixed bottom-0 left-0 right-0 z-30`) offrant les actions critiques 1-clic (_Valider_, _Refuser_, _WhatsApp_) sans nécessiter de défilement préalable.
    - Padding de sécurité `pb-24 lg:pb-0` et tracé de l'itinéraire calibré (`pl-3 sm:pl-6`) sans débordement.
- **Toolbar Temporelle Adaptative & SVG Responsive (`RESP-07` — `ActivityChart.tsx`)** :
    - Réorganisation de la barre de contrôle temporelle en disposition adaptative et grille de statistiques récapitulatives `grid-cols-2 sm:grid-cols-4`.
    - Pas d'échantillonnage dynamique (`xLabelStep`) préservant la lisibilité des dates de l'axe X $\ge 10\text{px}$ sur mobile.
- **Identité de Marque Mobile & Paddings Fluides (`RESP-08` — `admin/login/page.tsx`)** :
    - Intégration de l'en-tête de marque HBC Logistique visible sur mobile (`lg:hidden`).
    - Fluidification des marges intérieures `p-4 sm:p-8` pour maximiser la surface utile.

### Changed (Documentation agents)

- **`AGENTS.md` déplacé à la racine** (standard agents.md) : désormais versionné (`.agents/` est ignoré par git) et lu par Antigravity, Copilot, Codex et Cursor. Ancienne version archivée dans `docs/old/AGENTS.legacy.md`.
- **Constitution resynchronisée avec le code** : services `src/lib` réels (`auth-guard`, `logger`, `huggingface`, `supabase`), modèle de données, tests Vitest, CI, variables d'environnement complètes, Definition of Done alignée sur la CI, section « Limites » et nouveaux gotchas.
- **`PROJECT_STATUS.md` synchronisé à 100% avec l'état réel** : métriques réelles (79 tests Vitest / 12 suites, 11 Server Actions, 75 composants TSX, 26 modules lib, 4 hooks), nettoyage des fausses tâches manquantes déjà terminées, et identification de la dette DT-008 (migration `console.*` vers `logger`).

---

## [1.5.0] — 2026-10-21 — Version 1.5.0 (Admin Dashboard & Quote Management 2026 UI/UX Overhaul)

### Added & Improved (Global Search Command Palette & Real Operational Notifications)

- **Recherche Globale & Command Palette Omnibar (`Ctrl + K` / `⌘ K`)** :
    - **Composant `AdminCommandPalette`** : Fenêtre modale accessible (Radix UI `Dialog`) déclenchable au clavier depuis n'importe quelle page de l'administration ou via le nouveau bouton d'en-tête interactif.
    - **Recherche Multi-Tables Asynchrone (`searchAdminAction`)** : Interrogation simultanée PostgreSQL en sous-50ms sur les devis (`prisma.quote` par réf, client, téléphone, trajet, type) et les messages (`prisma.contactMessage` par nom, email, téléphone, contenu).
    - **Navigation Clavier Intuitive** : Navigation par flèches `↑` / `↓`, ouverture directe par `Entrée` vers `/admin/quotes/[id]` ou `/admin/contacts?q=...`, et fermeture immédiate par `Échap`.
    - **Raccourcis Système Instantanés** : Accès direct en un clic aux sections Dashboard, Devis, Contacts, Utilisateurs, Paramètres d'entreprise et Site public.
    - **Audit UI/UX & Accessibilité 2026 (`/ui-styling`)** :
        - _Auto-Scroll Clavier_ : Défilement assisté (`scrollIntoView({ block: "nearest" })`) assurant la visibilité permanente de l'élément actif lors de la navigation aux flèches `↑` / `↓`.
        - _Contraste & Lisibilité des Badges_ : Remplacement de l'aplat saturé `bg-primary` par un surlignage neutre `bg-accent/80 text-foreground` préservant l'intégrité chromatique et la lisibilité des badges de statut (`QuoteStatusBadge`, badges contacts).
        - _Détection Dynamique macOS / Windows_ : Affichage automatique de `⌘K` sur Mac et `Ctrl+K` sur PC/Linux via `useSyncExternalStore` (zéro cascade de re-render).
        - _Ergonomie Mobile & Accessibilité_ : Calibrage responsive du déclencheur, focus ring accessible, bouton de réinitialisation explicite dans l'état vide et neutralisation du comportement natif `type="search"`.
- **Centre de Notifications Opérationnelles Réelles (Derived Alerts)** :
    - **Élimination Totale des Mocks Statiques** : Remplacement du tableau factice en dur par une agrégation en temps réel des faits métier réels de PostgreSQL via `getLiveAdminNotificationsAction()`.
    - **Alertes Dérivées des Devis en Attente (`PENDING`)** : Notification automatique des nouveaux dossiers avec mise en évidence des dossiers prioritaires et urgences critiques (`very_urgent`, matières dangereuses).
    - **Alertes des Nouveaux Messages de Contact (`UNREAD`)** : Notification immédiate des demandes clients avec lien direct vers la boîte de réception.
    - **Résolution Automatique Zéro Dette** : Dès qu'un devis est validé/refusé ou qu'un message est marqué comme lu, l'alerte se résout d'elle-même sans risque de désynchronisation.
    - **Acquittement & Interactivité** : Bouton « Tout acquitter » fonctionnel avec `e.stopPropagation()` et mise à jour du compteur dynamique.
    - **Audit UI/UX & Ergonomie 2026 (`/ui-styling`)** :
        - _Micro-Badge Chiffré Direct_ : Remplacement du simple point clignotant par une pastille rouge chiffrée (`1`, `3`, `9+`) avec support de `motion-reduce:hidden` pour l'accessibilité vestibulaire.
        - _Tag d'Urgence Explicite_ : Badge visuel `Urgent` sur fond rosé avec animation calmée (`motion-reduce:animate-none`).
        - _Footer Intelligent Bipolaire_ : Accès rapide simultané vers les Devis en attente et la Boîte de réception des Messages de contact, résolvant le blocage unilatéral.
        - _Dimensionnement Anti-Débordement_ : Remplacement de la largeur rigide `w-84` par `w-[calc(100vw-2rem)] max-w-sm sm:w-96`.
- **Tests Automatisés Vitest (`tests/unit/admin-search-notifications.test.ts`)** :
    - 6 nouveaux tests unitaires couvrant la recherche multi-tables, les raccourcis par défaut, le filtrage des alertes et le comptage unifié (suite portée à **79 tests réussis** sur 12 suites).

### Added & Improved (Quote Management & QuoteDetailsSheet 2026 UI/UX Overhaul)

- **Refonte Intégrale du Panneau Latéral des Devis (`QuoteDetailsSheet`)** :
    - **Architecture Sticky Frame (Zéro scroll superflu)** : `SheetHeader` sticky au sommet avec `pr-12` anti-collision avec le bouton fermer, corps de défilement indépendant (`flex-1 overflow-y-auto`), et `SheetFooter` sticky en permanence au bas de l'écran pour accéder instantanément aux boutons de décision opérationnelle (_Valider_, _Refuser_).
    - **Bloc Financier Dédié** : Mise en valeur du montant convenu (`text-2xl font-bold font-mono`) avec badge de confirmation ou alerte ambre « Chiffrage en attente » incitant au chiffrage dans l'espace de travail.
    - **Barre d'Actions Rapides de Contact (WhatsApp 1-Clic)** : Bouton direct vers `https://wa.me/{phone}?text=...` pré-formaté avec enregistrement automatique de l'échange dans l'historique d'audit via `logWhatsAppContactAction`, et cartes Téléphone / Email avec copie presse-papier 1-clic (`Copy` / `Check`).
    - **Axe de Transport & Itinéraire Google Maps** : Tracé chronologique vertical contrasté (Enlèvement émeraude $\rightarrow$ Livraison corail) avec bouton de calcul GPS direct sur Google Maps.
    - **Badges de Contraintes Logistiques Lourdes** : Affichage d'alertes visuelles automatiques pour _Matières dangereuses_, _Grue requise au chargement_ et _Urgence prioritaire_.
    - **Mini-Timeline d'Audit** : Rendu des 3 dernières activités du dossier pour un suivi opérationnel immédiat.
    - **Sécurité des Mutations** : État `isUpdating` bloquant les boutons d'action et affichant un spinner `<Loader2 className="animate-spin" />` pour éliminer tout risque de double-soumission en base de données.
    - **Correction d'Hydratation HTML React** : Remplacement de l'imbrication illégale d'éléments `<div>` / `<button>` dans la balise `<p>` de `<SheetDescription>` par un conteneur `<div>` neutre et une description `sr-only` accessible.
- **Unification des Badges de Statut (`QuoteStatusBadge`)** :
    - Nouveau composant centralisé harmonisant les variantes de couleur, icônes et typographie sur l'ensemble de la plateforme (Dashboard, table des devis `/admin/quotes`, vue détaillée `/admin/quotes/[id]`, et panneau latéral `QuoteDetailsSheet`).
- **Modernisation de la Gestion des Devis (`/admin/quotes`)** :
    - **Persistance & Synchronisation PostgreSQL** : Correction du rechargement des données (`refreshQuotes`) qui pointait vers le `localStorage` obsolète au lieu de la base PostgreSQL Supabase via `loadQuotes()`.
    - **Dialogue de Confirmation Accessible (`ConfirmDialog`)** : Remplacement de `window.confirm()` par un composant Radix modal avec focus trap et actions destructives stylisées.
    - **Export CSV Encodé UTF-8 BOM** : Export client instantané compatible nativement avec Microsoft Excel et les tableurs modernes.
    - **Pillules de Filtres Rapides avec Compteurs Live** : Boutons de filtrage en un clic (`Tous`, `En attente`, `Validés`, `Refusés`) avec badges de décompte en temps réel.
    - **État de Chargement Dédié (`Skeleton`)** : Composant de chargement squelette éliminant l'effet de vide (_FOEC_).

### Added & Improved (Admin Dashboard, Activity Chart & UI/UX Audit)

- **Refonte Ergonomique du Tableau de Bord Admin (`/admin/dashboard`)** :
    - **Alignement & Marges Fluides** : Remplacement des conteneurs rigides par un conteneur adaptatif `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`, éliminant les marges latérales excessives sur écrans ultra-larges tout en préservant l'aisance sur tablettes et mobiles.
    - **Rationalisation des KPIs Exécutifs** : Remplacement du doublon des 8 cartes métriques par 4 cartes d'orientation stratégique à forte valeur ajoutée (Volume Financier & Panier moyen, Total Demandes avec ventilation Formulaire/Chat, Dossiers prioritaires en attente, Taux de conversion global).
    - **Réorganisation du Flux Opérationnel** : Priorisation de l'activité opérationnelle en tête de page (`ActivityChart` en 4/7 et Devis Récents en 3/7), suivie des analyses macro-économiques (`BusinessAnalytics`).
- **Graphique d'Activité & Historique Temporel (`ActivityChart`)** :
    - **Barre d'outils unifiée** : Regroupement de l'ensemble des contrôles en haut à droite avec sélecteurs de granularité (`7j`, `14j`, `30j`, `Mois`), stepper chronologique `< >`, menu déroulant des mois et bouton de retour immédiat `Aujourd'hui`.
    - **Tooltip Intelligent Anti-Collision** : Détection dynamique de position pour inverser l'ouverture du tooltip vers la gauche (`left-12`) dès qu'une barre est sur la moitié droite du graphique, éliminant tout masquage de la barre active.
    - **En-tête & Métriques Aérées** : Largeur calibrée à `w-72`, séparation aérée entre date et badge total, présentation des métriques sous forme de capsules distinctes avec alignement tabulaire des valeurs et calcul dynamique des pourcentages.
    - **Repère Visuel de Performance** : Remplacement du point flottant orphelin par une couronne dorée ancrée au sommet de la barre record.
- **Analyses Métier (`BusinessAnalytics`)** :
    - Équilibrage des hauteurs de cartes entre le donut de distribution des devis et la liste typologique du fret (`flex flex-col justify-between`).
    - Assainissement des hubs logistiques avec filtrage des coordonnées GPS brutes.
- **Actifs Statiques & Robustesse** :
    - Création de `public/grid.svg` éliminant les erreurs 404 sur les pages d'authentification et d'administration.

### Added & Improved (UI/UX 2026 & Responsive Audit Corrections)

- **Correction Intégrale de Responsivité (Mobile & Tablette)** :
    - **Grille Tablette (768px – 1024px)** : Remplacement d'`overflow-hidden` par `overflow-x-auto min-w-[850px]` sur les tables desktop et basculement adaptatif en cartes fluides sous `lg:` (1024px) dans `ContactMessagesInbox` et `ClientDirectory`, éliminant la troncature de 400px à 530px causée par la présence de la barre latérale fixe (256px) et des paddings.
    - **Navigation par Onglets Mobile (< 390px)** : `TabsList` doté d'un conteneur horizontal scrollable anti-débordement (`overflow-x-auto no-scrollbar`), flexibilité totale sans cassure sur écrans étroits (iPhone SE, Galaxy S8).
    - **Modale de Lecture Adaptative** : `DialogContent` borné à `max-h-[88dvh]` avec corps défilable `overflow-y-auto` et footer fixe (`shrink-0`), garantissant l'accès permanent aux boutons d'actions ("Supprimer", "Archiver", "Répondre") y compris sur les messages volumineux ou en orientation paysage.
- **Ergonomie Tactile & Accessibilité WCAG 2.2** :
    - Cibles tactiles rehaussées à $\ge 44\text{px}$ (boutons de filtres à `h-9 min-h-[36px]`, boutons d'action à `h-9 w-9`).
    - Navigation clavier complète sur les lignes de tableau (`tabIndex={0}`, `role="button"`, écouteurs `Enter`/`Space`).
    - Attributs ARIA (`aria-label`, `aria-hidden="true"` sur les initiales de clients).
- **Standards SaaS B2B 2026** :
    - **Actions Groupées (Bulk Actions)** : Système de sélection multiple par cases à cocher (`Checkbox`), barre d'actions de masse flottante (marquer comme lu, archiver, suppression groupée).
    - **Nouvelles Server Actions par lot** : `bulkUpdateContactMessagesStatusAction` et `bulkDeleteContactMessagesAction`.
    - **Synchronisation URL (Search Params)** : État des filtres et de la recherche synchronisé en temps réel avec l'URL (`?status=...&q=...`) avec debounce, permettant le partage de vues et le rechargement sans perte d'état.
    - **Dialogue de Confirmation Accessible** (`ConfirmDialog`) : Élimination totale de `window.confirm()` natif au profit d'un composant Radix thématique avec piège de focus et styles destructifs.
    - **Temps Réel Supabase (`useRealtimeContacts`)** : Souscription dynamique aux événements `postgres_changes` sur la table `contact_message` pour mettre à jour la boîte de réception sans rafraîchissement manuel.

---

## [1.4.0] — 2026-10-20 — Version 1.4.0 (Admin Contact Hub, PostgreSQL Inbox & Real Clients Directory Release)

### Added

- **Architecture Complète de Messagerie de Contact & Persistance Supabase PostgreSQL** :
    - **Nouveau Modèle Prisma & Énumération** (`prisma/schema.prisma`) :
        - Modèle `ContactMessage` avec identifiant `cuid()`, `firstName`, `lastName`, `email`, `phone`, `message` (`@db.Text`), `status`, `createdAt`, `updatedAt` mappé vers la table SQL `contact_message`.
        - Enum `ContactStatus` avec les états `UNREAD` (Non lu), `READ` (Lu), `ARCHIVED` (Archivé).
        - Migration et synchronisation appliquées avec succès sur la base Supabase PostgreSQL.
    - **Server Actions Sécurisées & Pattern Canonique `{ data, error }`** (`src/app/actions/contact.ts`) :
        - `sendContactMessageAction` : validation Zod stricte des coordonnées et du message (2 à 2000 caractères), persistance en BDD et revalidation de `/admin/contacts`.
        - `getContactMessagesAction` : sécurisé côté serveur avec `requireAdmin()`, filtrage dynamique par statut et recherche plein texte (nom, prénom, email, message).
        - `updateContactMessageStatusAction` : mise à jour instantanée du statut (marquer comme lu, archiver, restaurer).
        - `deleteContactMessageAction` : suppression définitive sécurisée d'un message avec revalidation de cache.
        - `getClientsDirectoryAction` : agrégation en temps réel des clients uniques issus des devis réels `prisma.quote`, calculant le volume de devis, la date de dernière activité et le statut du dernier devis.
    - **Page Admin en React Server Component (RSC)** (`src/app/admin/contacts/page.tsx`) :
        - Sécurisation stricte côté serveur avec `await requireAdmin()`.
        - Pré-chargement asynchrone parallèle `Promise.all` des messages et du répertoire client évitant tout effet de scintillement (zero CLS) et éliminant le chargement factice `setTimeout`.
    - **Composants d'Interface Modernes & Fonctionnels** (`src/app/admin/contacts/components/`) :
        - `ContactsDashboardView.tsx` : navigation par onglets avec compteurs dynamiques en temps réel (badge des messages non lus) et redirection vers `/admin/users` pour la gestion des collaborateurs.
        - `ContactMessagesInbox.tsx` : boîte de réception professionnelle avec filtres d'état, barre de recherche, affichage réactif (table desktop & cartes mobiles), modal de consultation détaillée, actions contextuelles et déclenchement d'un email de réponse `mailto:`.
        - `ClientDirectory.tsx` : annuaire réel des clients HBC Logistique connectés aux données métier avec badges de statut et liens directs vers les devis.
    - **Tests Automatisés Vitest** (`tests/unit/contact-actions.test.ts`) :
        - 6 nouveaux tests unitaires couvrant la validation Zod, le rejet des entrées invalides et la persistance BDD (suite globale portée à 73 tests réussis).

### Removed & Refactored

- **Élimination Définitive des Fausses Données & Mocks** :
    - Suppression de la dépendance à `window.localStorage` (`hbc_quotes`) qui laissait la liste des clients vide pour tout administrateur connecté depuis un nouveau navigateur.
    - Suppression de `src/app/admin/contacts/components/ClientList.tsx` (ancienne version basée sur `localStorage`).
    - Suppression des composants obsolètes ou dupliqués : `TeamList.tsx`, `AddTeamMemberDialog.tsx`, `TeamMemberProfile.tsx` (remplacés par `/admin/users` et le nouveau hub).
    - Remplacement du faux loader `setTimeout(..., 800)` par du véritable rendu serveur RSC.

---

## [1.3.0] — 2026-10-19 — Version 1.3.0 (Universal Password Reset, Support Chat & Resilience Release)

### Added

- **Système Universel de Réinitialisation de Mot de Passe par Email (Admin & Utilisateur)** :
    - **Architecture Universelle & Rôles Détectés** :
        - Détection automatique et contextuelle du profil cible (`role: "admin"` vs `role: "user"` pour les futurs comptes clients).
        - Personnalisation dynamique de l'email, des avertissements de sécurité (minimum 12 caractères pour les admins vs 8 pour les utilisateurs), des badges et des redirections après succès (`/admin/login` ou `/`).
    - **Template React Email Branded HBC Logistique** (`src/components/emails/PasswordResetEmail.tsx`) :
        - Respect scrupuleux de la charte visuelle (marine `#0F172A`, cyan `#38BDF8`, boutons d'action stylisés, fallback textuel).
        - Badges distinctifs (`🛡️ Espace Administration • Accès Sécurisé` vs `👤 Espace Compte Client / Utilisateur`).
        - Mention de la durée de validité du jeton (60 minutes) et avertissement anti-phishing.
    - **Server Actions Sécurisées & Pattern `{ data, error }`** (`src/app/actions/auth-actions.ts`) :
        - `requestPasswordResetAction` : validation Zod, protection anti-énumération et timing attack, génération de jetons cryptographiques de 32 octets (64 hex), expédition via Resend et fallback local sans interruption.
        - `verifyResetTokenAction` : validation cryptographique du jeton, contrôle d'expiration, masquage de l'adresse email pour affichage sécurisé (`c***h@domain.com`).
        - `resetPasswordWithTokenAction` : consommation unique du jeton, hachage via l'algorithme officiel Better-Auth (`better-auth/crypto`), mise à jour en base et révocation immédiate de toutes les sessions actives pour neutraliser les accès compromis.
    - **Composants d'Interface Réactifs & État "Modification autorisée"** :
        - `ForgotPasswordForm.tsx` : formulaire universel de demande avec badge contextuel, gestion d'erreurs et confirmation visuelle.
        - `ResetPasswordForm.tsx` : vérification dynamique à l'ouverture du lien, transition automatique vers le badge vert **« Statut : Modification autorisée »**, indicateur de force de mot de passe en temps réel et compte à rebours de redirection.
    - **Routes & Pages** :
        - `/auth/forgot-password` & `/auth/reset-password` (routes universelles).
        - `/admin/forgot-password` & `/admin/reset-password` (alias dédiés espace administration).
        - Connexion du lien "Mot de passe oublié ?" dans `src/app/admin/login/page.tsx`.
    - **Tests Automatisés Vitest** (`tests/unit/password-reset-validation.test.ts`) :
        - 10 nouveaux tests unitaires validant les schémas Zod, l'anti-régression et le rendu HTML des templates d'emails selon le rôle (Total projet : 67 tests réussis).

### Fixed & Improved

- **Module Support Chat & Agent Conversationnel** :
    - **Résolution du flux de suivi de transport** :
        - Ajout du flux guidé `tracking-flow` dans `src/lib/support-agent/tutorials.ts` avec déclencheurs complets (`suivre`, `suivi`, `état`, `statut`, `commande`, `expédition`, `livraison`).
        - Correction de la réponse générique intempestive ("Je suis là pour vous aider ! Que souhaitez-vous savoir...") lors des requêtes "Je veux suivre l'état de mon transport" ou "Je veux suivre mon transport".
        - Connexion directe au tutoriel pré-enregistré `TUTORIALS["track-transport"]` et fourniture d'options interactives (numéro de dossier disponible, numéro égaré, mise en relation avec le régulateur d'exploitation).
        - Détection intelligente des références de dossier `HBC-XXXXX` dans les messages avec confirmation de statut immédiate et options d'assistance.
    - **Assainissement Visuel & Suppression des Émojis Bruts** :
        - Élimination intégrale des émojis bruts dans les boutons de suggestion en bas de chat (`ChatInput.tsx`, `ChatOptions.tsx`, `ChatMessagesList.tsx`, `quote-flow.ts`, `tutorials.ts`).
        - Remplacement par des icônes vectorielles SVG Lucide élégantes et adaptées au contexte (`Package`, `FileText`, `Truck`, `Phone`, `AlertCircle`, `Check`, `ChevronRight`).
        - Implémentation d'une fonction de filtrage regex `stripEmojis` sur tous les labels pour garantir un rendu irréprochable sans émoji non désiré.
    - **Positionnement & Responsive Design** :
        - Suppression de l'icône de fermeture en doublon qui chevauchait l'en-tête grâce à `showCloseButton={false}` sur `DialogContent`.
        - Remplacement du bouton ambigu `Minimize2` par une croix de fermeture `X` explicite et accessible.
        - Ancrage ergonomique de la modale sur desktop (`sm:bottom-6 sm:left-6`) en harmonie avec le bouton d'appel flottant.
        - Adaptation plein écran native sur mobile avec prise en compte du clavier virtuel (`100dvh`) et des safe-areas iOS (`env(safe-area-inset-bottom)`).
    - **Tests Automatisés** :
        - Ajout de la suite de tests `tests/unit/support-chat-tracking.test.ts` (5 tests validant le routage, l'absence de repli générique, la reconnaissance des numéros HBC et l'absence totale d'émojis).

---

## [1.2.0] — 2026-10-19 — Version 1.2.0 (Resilience, WhatsApp Automation & Security Release)

### Added

- **Organisation & Gouvernance Documentaire** :
    - Déplacement et classification du rapport d'audit [`docs/SECURITY_AUDIT.md`](file:///docs/SECURITY_AUDIT.md) dans le répertoire dédié `docs/`.
    - Harmonisation complète du [`README.md`](file:///README.md) reflétant l'architecture Next.js 16/React 19, l'ensemble des intégrations backend et la suite de tests automatisés.
    - Synchronisation de la source de vérité [`PROJECT_STATUS.md`](file:///PROJECT_STATUS.md).

- **Automatisation WhatsApp 1-Clic 100% Gratuite & IA Hugging Face (Option B)** :
    - **Intégration Open Source Hugging Face Inference** (`src/lib/huggingface.ts`) :
        - Support du modèle `mistralai/Mistral-7B-Instruct-v0.3` via token Hugging Face (`HUGGINGFACE_API_KEY`), avec détection de disponibilité et fallback instantané sur moteur paramétrique local déterministe.
        - Normalisation des numéros mobiles et indicatifs internationaux (`normalizePhoneForWhatsApp`) supportant les formats français (06, 07, etc.), préfixes `00`, `+` et indicatifs internationaux.
        - Génération d'URLs universelles `wa.me/{phone}?text={encoded}` pour ouverture directe de WhatsApp Web ou de l'application mobile sans aucun frais Meta Cloud API.
    - **Server Actions Dédiées** (`src/app/actions/whatsapp-actions.ts`) :
        - `prepareWhatsAppQuoteMessageAction` : préparation validée par Zod du message contextualisé selon les caractéristiques du devis.
        - `logWhatsAppContactAction` : consigne automatique d'un événement `WHATSAPP_CONTACT` dans l'historique d'audit du devis (`QuoteHistory`).
        - `getQuotesByPhoneAction` : recherche croisée des dossiers liés au même numéro de téléphone pour un suivi unifié du client.
    - **Interface Modération Devis & Panneau de Paramétrage** :
        - Modal de contact WhatsApp 1-Clic dans `src/app/admin/quotes/[id]/page.tsx` avec prévisualisation en direct, note personnalisée, badge d'état du fournisseur (`Hugging Face` vs `Template Local`) et historique des devis du même numéro.
        - Onglet dédié "WhatsApp & IA" dans `src/app/admin/settings/page.tsx` permettant de configurer le numéro commercial, le modèle HF, le template déterministe et les options d'automatisation.
    - **Suite de Tests Unitaires** (`tests/unit/huggingface.test.ts`) :
        - 6 tests unitaires validant la normalisation des numéros, la génération de templates locaux et la construction des liens Click-to-Chat.

- **Architecture de Résilience IA & Pattern Fail-Safe Multi-Niveaux** :
    - **Détection & Assainissement Robuste des Clés API Gemini** (`src/lib/gemini.ts`) :
        - Support prioritaire de `GEMINI_API_KEY` (secret d'environnement côté serveur sécurisé) avec rétrocompatibilité `NEXT_PUBLIC_GEMINI_API_KEY`.
        - Filtrage automatique et assainissement des clés fictives ou placeholders (`your_gemini_api_key`, `placeholder`, `mock`, chaînes vides) sans jamais lever d'exception non gérée.
    - **Moteur Déterministe Heuristique de Secours (Tier 2)** :
        - `calculateHeuristicEstimate` : algorithme logistique déterministe avec calcul kilométrique basé sur les grands nœuds routiers français (formule de Haversine ajustée au facteur routier 1.25x), barème différencié par type de véhicule (camion-grue, plateau, porte-conteneur, convoi exceptionnel, benne), calcul réaliste de durée (vitesse fret 70 km/h + forfait manutention) et marges min/max.
        - `generateFallbackEmail` : modèles d'emails professionnels en français soigné pour validation, refus courtois et demande de complément technique.
    - **Server Actions Sécurisées & Circuit Breaker** (`src/app/actions/ai-actions.ts`) :
        - `getAiStatusAction` : introspection temps réel de l'état du sous-système IA (`gemini` vs `resilient_local`).
        - `estimateTransportAction` & `draftEmailAction` : endpoints protégés par Zod et `requireAdmin()` avec timeout strict (6000ms via `Promise.race`) évitant tout gel d'interface en cas de panne réseau externe.
        - `generateSupportAiAction` : endpoint conversationnel supportant l'analyse de sentiment, catégorisation et suggestion d'escalade.
    - **Support Chat Hybride & Feedback Visuel Transparent** :
        - Mise à jour de `src/hooks/useSupportChat.ts` et `src/components/features/support/components/ChatHeader.tsx` : affichage en direct du mode d'exécution via badge pulsant (🟢 `IA Gemini 1.5 Active` vs 🛡️ `Mode Résilient Autonome`).
        - Mise à jour de l'interface modération admin `src/app/admin/quotes/[id]/page.tsx` avec badges explicites (`Gemini 1.5` vs `Moteur Secours`) et conservation de la continuité du devis même en mode hors-ligne.
    - **Suite de Tests de Résilience Dédiée** (`tests/unit/ai-resilience.test.ts`) :
        - 10 tests unitaires automatisés validant la détection des clés, la non-régression en l'absence de clé, les calculs de barèmes heuristiques et le comportement zéro-crash de `geminiService`.

---

## [1.1.0] — 2026-10-15 — Version 1.1.0 (UI/UX Compliance & Feature Release)

### Added

- **Remédiation Complète de Conformité UI/UX & Accessibilité WCAG** (`TASK-019`) :
    - **Accessibilité & Contraste WCAG 2.1 AA/AAA** :
        - Éradication des défauts de contraste texte blanc sur orange (`#ff6600`) : migration vers `bg-secondary` (Bleu profond, contraste >12:1) et fonds neutres dans `ProfessionalsCTA.tsx`, `StatsSection.tsx`, `src/app/page.tsx` et `src/app/about/page.tsx`.
        - Renforcement du contraste des bulles de chat utilisateur (`text-zinc-950` sur `bg-primary`, 7.2:1) dans `ChatMessage.tsx` et des badges d'étapes dans `ChatTutorial.tsx`.
        - Correction du contraste en mode sombre sur le bouton de déconnexion (`SidebarContent.tsx`) et badges émeraude (`QuoteSummaryDialog.tsx`).
    - **Formulaire de Contact Connecté & Interactif** :
        - Création de la Server Action `submitContactAction` dans `src/app/actions/contact.ts` avec schéma Zod et pattern canonique `{ data, error }`.
        - Migration de `src/app/contact/page.tsx` en composant client réactif avec validation, feedback visuel instantané par Sonner toast et écran de succès dédié.
    - **Routage SPA & Performance Next.js** :
        - Remplacement systématique de l'ensemble des balises `<a href>` de la navigation par le composant Next.js `<Link>` (`src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/services/page.tsx`, `ServiceCard.tsx`, `ProfessionalsCTA.tsx`) éliminant les rechargements complets de page.
    - **Optimisations Ergonomiques du Quote Wizard** :
        - Étape 1 (`StepItemType.tsx`) : transformation des tuiles indicatives en boutons interactifs de sélection rapide avec icônes métier et synchronisation bidirectionnelle.
        - Étape 4 (`StepDate.tsx`) : correction du filtre calendrier avec `startOfDay` autorisant la réservation pour le jour même (urgences).
        - Étape 5 (`StepContact.tsx`) : ajout d'`autoComplete`, `type="tel"` et `inputMode="tel"` pour l'autocomplétion sur smartphone.
        - Étape 6 (`StepNotes.tsx`) : intégration du composant `FileUpload` pour l'envoi de plans et documents techniques liés au devis.
        - Barre de progression (`WizardHeader.tsx`) : ajout des attributs ARIA complets (`role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`).
    - **Micro-Interactions & Polissage d'Accessibilité** :
        - `LocationPicker.tsx` : ajout des attributs `aria-label` et remplacement du placeholder d'image externe par une carte vectorielle SVG stylisée.
        - Ajout de `cursor-pointer` dans `buttonVariants` (`button.tsx`).
        - Francisation des textes d'accessibilité `sr-only` ("Changer de thème", "Ouvrir le menu de navigation").
        - Élimination des erreurs et avertissements ESLint et TypeScript (`tsc --noEmit` & `eslint .` 100% propres).

- **Politique de mot de passe renforcée (OWASP)** (`TASK-013`) :
    - Application de la politique stricte de mot de passe OWASP sur `adminInitSchema` et `createUserSchema` dans `src/lib/validation.ts` (12 caractères minimum, majuscule, minuscule, chiffre et caractère spécial requis).
    - Ajout des tests unitaires de validation dans `tests/unit/validation.test.ts`.

- **SEO Avancé & Données Structurées Schema.org** (`TASK-017`) :
    - Fichier `src/app/sitemap.ts` pour la génération dynamique du sitemap XML de toutes les pages publiques (`/`, `/services`, `/devis`, `/about`, `/contact`, `/legal/`).
    - Fichier `src/app/robots.ts` interdisant l'indexation des routes sensibles (`/admin/`, `/api/`) et fournissant l'URL du sitemap.
    - Composant `JsonLd.tsx` injectant le schéma Schema.org `LogisticsService` & `LocalBusiness` pour les rich snippets Google.
    - Métadonnées globales enrichies dans `src/app/layout.tsx` (OpenGraph, Twitter Cards, mots-clés logistiques).

- **Analytics Métier & Mode Démo Activable en 1-Clic** (`TASK-018`) :
    - Création du jeu de données démo réelles `prisma/demo-data.json` simulant 8 demandes de devis réelles d'entreprises majeures du BTP (Vinci, Eiffage, Bouygues, SNCF, Nexity).
    - Server Actions `injectDemoDataAction` et `clearDemoDataAction` dans `src/app/actions/demo-actions.ts` pour peupler et purger directement la base PostgreSQL.
    - Composant UI `DemoModeControl.tsx` intégré en haut du tableau de bord admin (`/admin/dashboard`) pour activer la démonstration en 1-clic avec notifications sonner et synchronisation Supabase Realtime.

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
