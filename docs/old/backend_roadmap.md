# Roadmap de Développement Backend : HBC Logistique

Ce document définit les phases logiques pour l'implémentation du backend modulaire "Lean SaaS". L'objectif est de construire une architecture **découplée** (services indépendants) pour éviter le code monolithique et faciliter la maintenance.

## Principes de Modularité
- **Service Layer Pattern** : La logique métier (ex: calcul de devis) est isolée des Server Actions.
- **Repository Pattern** : L'accès aux données (Prisma) est encapsulé pour permettre de changer de DB si besoin.
- **Adapter Pattern** : Les services tiers (Tigris/S3, Resend/SMTP) utilisent des interfaces standard.

---

## Phase 1 : Fondations & Authentification
*Objectif : Établir le tunnel de communication et sécuriser l'accès.*

- **Tâche 1.1 : Setup Infrastructure (Supabase & Secrets)**
    - Configuration du projet Supabase (Postgres & Realtime).
    - Setup des variables d'environnement (`DATABASE_URL`, `SUPABASE_KEY`).
- **Tâche 1.2 : Schéma de Données (Prisma)**
    - Migration des types locaux vers le schéma Prisma.
    - Ajout des tables nécessaires pour **Better-Auth** (User, Session, Account).
- **Tâche 1.3 : Configuration Better-Auth**
    - Initialisation du serveur Better-Auth.
    - Création des routes API d'authentification (`/api/auth/*`).
    - Mise en place du client d'auth pour l'application React.

## Phase 2 : Couche de Persistence & Assets
*Objectif : Gérer les données structurées et les fichiers lourds.*

- **Tâche 2.1 : Service de Stockage (Tigris/S3)**
    - Création de l'adapter S3 générique.
    - Implémentation des fonctions `uploadFile` et `getFileUrl` (modulables).
- **Tâche 2.2 : Repositories de Données**
    - Création des repositories `QuoteRepository`, `UserRepository`, `TransportRepository`.
    - Centralisation des requêtes Prisma complexes.

## Phase 3 : Logique Métier & Sécurité Edge
*Objectif : Implémenter le "cerveau" de l'application.*

- **Tâche 3.1 : Services Métiers (Domain Services)**
    - Implémentation du `QuoteService` (Logique de validation et calcul).
    - Implémentation du `EstimationService` (Intégration facultative vers l'IA).
- **Tâche 3.2 : Middleware de Protection (Redis)**
    - Intégration d'Upstash Redis dans le `middleware.ts` pour le **Rate Limiting**.
    - Sécurisation des routes API sensibles (formulaire de devis).

## Phase 4 : Traitements Asynchrones & Communications
*Objectif : Déclencher les actions "lourdes" sans bloquer l'UI.*

- **Tâche 4.1 : Pipeline de Tâches (QStash)**
    - Configuration des endpoints de webhook pour QStash.
    - Modularisation des "Workers" (Email Worker, PDF Worker).
- **Tâche 4.2 : Service de Communication (Resend)**
    - Création des templates React-Email pour les confirmations de devis.
    - Envoi asynchrone via la queue QStash.

## Phase 5 : Real-time & Optimisation Finale
*Objectif : Améliorer l'expérience utilisateur et les performances.*

- **Tâche 5.1 : Flux Temps-Réel (Supabase Realtime)**
    - Activation de la réplication sur les tables critiques.
    - Hooks React pour la mise à jour live du tableau de bord Admin.
- **Tâche 5.2 : Stratégie de Caching**
    - Optimisation du `revalidatePath` et `revalidateTag` de Next.js.
    - Caching des requêtes répétitives dans Redis.

---

## Résumé de Cohérence
| Module | Responsabilité | Dépendance |
| :--- | :--- | :--- |
| **Logic Layer** | Calculs, Validation Zod | Aucune (Pure TS) |
| **Data Layer** | CRUD, Relations | Prisma / Supabase |
| **Infrastructure** | S3, SMTP, Redis | Tigris, Resend, Upstash |
| **Edge Layer** | Auth, Rate Limit | Middleware Next.js |

> [!TIP]
> Chaque phase peut être testée indépendamment. En isolant les services dans `src/lib/services`, nous garantissons que l'application reste évolutive même si nous changeons de fournisseur SaaS à l'avenir.
