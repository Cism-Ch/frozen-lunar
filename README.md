# 🚚 Frozen Lunar — HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE

[![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.1-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://www.prisma.io/)
[![Better-Auth](https://img.shields.io/badge/Better--Auth-1.4-black)](https://better-auth.com/)
[![Tests Vitest](https://img.shields.io/badge/Vitest-52%20passed-success?logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-Private-red)](<>)

> **"Votre sécurité, Notre priorité"**  
> Plateforme digitale moderne de logistique spécialisée et transport lourd : matériaux de construction, containers maritimes, charpentes, machines industrielles et modules préfabriqués.

---

## 📋 Sommaire

- [Vue d'Ensemble](#-vue-densemble)
- [État d'Avancement](#-état-davancement)
- [Fonctionnalités Clés](#-fonctionnalités-clés)
- [Architecture & Stack Technique](#-architecture--stack-technique)
- [Installation & Démarrage](#-installation--démarrage)
- [Variables d'Environnement](#-variables-denvironnement)
- [Scripts Disponibles](#-scripts-disponibles)
- [Structure du Projet](#-structure-du-projet)
- [Qualité & Sécurité](#-qualité--sécurité)
- [Documentation & Ressources](#-documentation--ressources)
- [Licence & Contact](#-licence--contact)

---

## 🎯 Vue d'Ensemble

**Frozen Lunar** est la solution logicielle de **HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE** conçue pour digitaliser l'ensemble du cycle de fret logistique :

- 🏗️ **Transport de Matériaux** : Livraison rapide de matériaux sur chantiers avec camions-grues et plateaux.
- 🚢 **Transport de Containers** : Acheminement sécurisé de conteneurs 20 et 40 pieds.
- 🪵 **Transport de Charpentes** : Logistique spécialisée pour structures bois et métal de grandes dimensions.
- 🚜 **Transport de Machines & Engins** : Transfert de pelles, bulldozers et machines industrielles lourdes.
- 🏠 **Modules Préfabriqués & Bungalows** : Manutention et transport de modules modulaires complets.

---

## 🚀 État d'Avancement

| Phase                                    | Description                                                                                   |   Statut    | Avancement |
| :--------------------------------------- | :-------------------------------------------------------------------------------------------- | :---------: | :--------: |
| **Phase 1 : UI / UX & Design System**    | Landing page, Wizard devis 4 étapes, Chat support, Dashboard admin, Accessibilité WCAG AA/AAA | ✅ Terminé  |    100%    |
| **Phase 2 : Backend & Infrastructure**   | Auth Better-Auth, Prisma ORM, Supabase DB, QStash queues, Tigris S3, Resend, Redis Rate Limit | ✅ Terminé  |    100%    |
| **Phase 3 : Production & Résilience IA** | Tests Vitest (52 tests), Circuit-breaker Gemini, Inférence Hugging Face, WhatsApp 1-Clic, RLS | 🔄 En cours |    ~75%    |

---

## ✨ Fonctionnalités Clés

### 🌐 Portail Public

- **Landing Page immersive** avec animations Framer Motion, thèmes Sombre/Clair (`next-themes`) et composants ergonomiques.
- **Wizard de Devis interactif en 4 étapes** avec calcul d'estimation heuristique instantané, validation Zod et upload de pièces jointes.
- **Support Client Hybride & Résilient** : Assistant IA conversationnel connecté à l'API Gemini 1.5 avec basculement automatique sur moteur local autonome (Fail-Safe Tier-2).
- **Formulaire de Contact réactif** branché sur Server Action avec notifications et vérification de conformité.
- **Catalogue interactif des services** avec caractéristiques techniques et tarifs indicatifs.

### 🔐 Espace Administrateur (`/admin`)

- **Authentification & Contrôle d'Accès** basé sur Better-Auth (session sécurisée, RBAC admin).
- **Dashboard Métier temps réel** avec KPIs financiers, volume de fret et écoute Supabase Realtime.
- **Gestion Complète des Devis** :
    - Traitement des dossiers (Acceptation, Planification, Facturation, Rejet).
    - Génération et téléchargement instantané de devis officiels au format PDF (`jsPDF`).
    - Journal d'audit complet et historique chronologique de chaque dossier (`QuoteHistory`).
    - **Recherche croisée par numéro de téléphone** pour lier l'historique de tous les devis d'un même client.
- **Automatisation WhatsApp 1-Clic & IA Hugging Face (100% Gratuit)** :
    - Génération de messages personnalisés optimisés pour mobile via l'Inference API Serverless de Hugging Face (`mistralai/Mistral-7B-Instruct-v0.3`).
    - Basculement instantané sur template déterministe en cas de quota ou indisponibilité.
    - Amorçage direct de WhatsApp Web / Desktop / Mobile via liens universels `wa.me` sans frais Meta Cloud API.
    - Consignation automatique de l'échange dans l'audit du devis.
- **Gestion des Utilisateurs & Équipes** : Création d'administrateurs avec mot de passe fort (règles OWASP).
- **Gestion des Fichiers Sécurisée** : Stockage d'objets S3 Tigris avec URLs pré-signées éphémères.
- **Panneau de Paramètres Avancé** : Configuration d'entreprise, notifications et réglages WhatsApp / modèle IA.

---

## 🛠 Architecture & Stack Technique

### Frontend

- **Framework** : [Next.js 16](https://nextjs.org/) (App Router, React Server Components par défaut)
- **Bibliothèque UI** : [React 19](https://reactjs.org/)
- **Langage** : [TypeScript 5](https://www.typescriptlang.org/) (Mode strict activé, zero `any` toléré)
- **Styling** : [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Animations** : [Framer Motion 12](https://www.framer.com/motion/)
- **Icônes** : [Lucide React](https://lucide.dev/)
- **Formulaires** : [React Hook Form](https://react-hook-form.com/) + [Zod 4](https://zod.dev/)

### Backend & Infrastructure

- **Base de Données** : PostgreSQL via [Supabase](https://supabase.com/) avec Row Level Security (RLS)
- **ORM** : [Prisma Client 6](https://www.prisma.io/) (Singleton typé avec client poolé + direct)
- **Authentification** : [Better-Auth 1.4](https://better-auth.com/) (Sessions HTTP-only cookies, Server Actions guard)
- **Moteur Asynchrone & Queues** : [Upstash QStash](https://upstash.com/docs/qstash) (Traitement différé des emails et PDFs)
- **Cache & Rate Limiting** : [Upstash Redis](https://upstash.com/docs/redis) (Limitation des abus sur Edge middleware)
- **Stockage de Fichiers** : [Tigris Data](https://www.tigrisdata.com/) (Stockage d'objets S3 compatible, URLs signées)
- **Emails Transactionnels** : [Resend](https://resend.com/) + [React Email](https://react.email/) (Templates typés)
- **Intelligence Artificielle & LLM** :
    - [Google Gemini 1.5](https://ai.google.dev/) (Support interactif et calculs avancés)
    - [Hugging Face](https://huggingface.co/) (Modèles Open Source `Mistral-7B-Instruct` pour WhatsApp 1-Clic)
    - Moteur Fail-Safe heuristique autonome Tier-2 (Formule de Haversine corrigée, barème transport)
- **Génération Documentaire** : [jsPDF](https://github.com/parallax/jsPDF) + `jspdf-autotable`
- **Logging** : [Pino](https://getpino.io/) (Logs JSON structurés avec niveaux ISO)

---

## 🚀 Installation & Démarrage

### Prérequis

- **Node.js** 20.x ou supérieur
- **pnpm** 9.x ou supérieur (recommandé)

### 1. Cloner le dépôt

```bash
git clone https://github.com/Cism-Ch/frozen-lunar.git
cd frozen-lunar
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Configurer l'environnement

Copiez `.env.example` vers `.env` et complétez vos clés :

```bash
cp .env.example .env
```

### 4. Initialiser la base de données Prisma

```bash
pnpm exec prisma generate
pnpm exec prisma migrate dev
```

### 5. Démarrer le serveur de développement

```bash
pnpm dev
```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## ⚙️ Variables d'Environnement

Consultez [`.env.example`](file:///.env.example) pour la liste exhaustive des variables :

| Variable                      | Rôle                                                          |    Requis    |
| :---------------------------- | :------------------------------------------------------------ | :----------: |
| `DATABASE_URL`                | URL de transaction poolée PostgreSQL Supabase (port 6543)     |    ✅ Oui    |
| `DIRECT_URL`                  | URL directe PostgreSQL pour migrations Prisma (port 5432)     |    ✅ Oui    |
| `NEXT_PUBLIC_APP_URL`         | URL de base de l'application (`http://localhost:3000` en dev) |    ✅ Oui    |
| `BETTER_AUTH_SECRET`          | Secret de chiffrement des sessions Better-Auth                |    ✅ Oui    |
| `GEMINI_API_KEY`              | Clé d'accès Google Gemini API (fallback local si absente)     | ⚠️ Optionnel |
| `HUGGINGFACE_API_KEY`         | Access token Hugging Face pour l'Inference Serverless         | ⚠️ Optionnel |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Numéro d'entreprise pour les échanges WhatsApp                | ⚠️ Optionnel |
| `RESEND_KEY`                  | Clé API Resend pour l'envoi d'emails                          | ⚠️ Optionnel |
| `TIGRIS_STORAGE_*`            | Clés d'accès Tigris S3 pour l'upload de pièces jointes        | ⚠️ Optionnel |
| `UPSTASH_REDIS_REST_*`        | URL et token Upstash Redis pour le rate-limiting              | ⚠️ Optionnel |
| `QSTASH_TOKEN`                | Token Upstash QStash pour les tâches asynchrones              | ⚠️ Optionnel |

---

## 📜 Scripts Disponibles

```bash
# Développement & Build
pnpm dev             # Lance le serveur de développement (localhost:3000)
pnpm build           # Construit l'application pour la production
pnpm start           # Démarre le serveur en mode production

# Qualité & Tests
pnpm type-check      # Vérification stricte TypeScript (tsc --noEmit)
pnpm lint            # Analyse ESLint du code
pnpm test            # Exécution de la suite Vitest (52 tests unitaires & intégration)
pnpm format          # Formatage automatique avec Prettier
pnpm format:check    # Contrôle de conformité du style de code

# Base de Données (Prisma)
pnpm exec prisma migrate dev   # Applique les migrations Prisma
pnpm exec prisma studio        # Interface visuelle d'exploration de la base
pnpm exec prisma generate      # Régénère le client Prisma localement
```

---

## 📁 Structure du Projet

```
frozen-lunar/
├── .agents/                    # Configuration et compétences des agents AI
├── docs/                       # Documentation technique active & guides
│   ├── ADMIN_CREDENTIALS.md    # Procédure d'accès administrateur
│   ├── DESIGN_SYSTEM_AND_UI_ANALYSIS.md # Analyse design system et WCAG
│   ├── SECURITY_AUDIT.md       # Audit de sécurité global OWASP & RLS
│   ├── TECH_STACK_AND_ARCHITECTURE.md   # Spécifications d'architecture
│   └── old/                    # Archives de documentation
├── prisma/
│   ├── schema.prisma           # Schéma relationnel PostgreSQL
│   └── migrations/             # Historique des migrations SQL
├── public/                     # Assets statiques et médias
├── src/
│   ├── app/                    # Next.js App Router (Pages, Layouts, Server Actions)
│   │   ├── actions/            # Server Actions sécurisées ("use server")
│   │   │   ├── ai-actions.ts
│   │   │   ├── contact.ts
│   │   │   ├── quote-management.ts
│   │   │   ├── upload-management.ts
│   │   │   ├── user-management.ts
│   │   │   └── whatsapp-actions.ts
│   │   ├── admin/              # Espace d'administration protégé
│   │   ├── api/                # Route Handlers REST (Auth, Webhooks, Seed)
│   │   ├── devis/              # Formulaire de devis multi-étapes
│   │   └── globals.css         # Thème global et tokens Tailwind
│   ├── components/             # Composants React modulaires
│   │   ├── emails/             # Templates React Email typés
│   │   ├── features/           # Composants métier (Wizard, Chat, Modales)
│   │   ├── layout/             # En-tête, Pied de page, Navigation
│   │   └── ui/                 # Primitives shadcn/ui
│   ├── config/                 # Constantes marketing et navigation
│   ├── hooks/                  # Hooks React réutilisables
│   ├── lib/                    # Clients de services & utilitaires métier
│   │   ├── auth.ts             # Configuration Better-Auth serveur
│   │   ├── gemini.ts           # Client Gemini & Moteur Heuristique Fail-Safe
│   │   ├── huggingface.ts      # Client Hugging Face & Liens Click-to-Chat
│   │   ├── prisma.ts           # Singleton Prisma Client
│   │   ├── qstash.ts           # Client QStash pour queues asynchrones
│   │   ├── storage.ts          # Client S3 Tigris avec URLs signées
│   │   └── validation.ts       # Schémas de validation Zod partagés
│   └── types/                  # Interfaces et déclarations TypeScript
├── tests/                      # Suite de tests Vitest (Unitaires et Intégration)
├── middleware.ts                # Protection des routes et rate-limiting Edge
├── CHANGELOG.md                 # Historique des versions (Keep a Changelog)
├── PROJECT_STATUS.md            # Source de vérité vivante du projet
└── README.md                    # Ce fichier
```

---

## 🛡️ Qualité & Sécurité

- **Zero `any` TypeScript** : Règle ESLint bloquante garantissant un typage strict et explicite à 100%.
- **Validation Systématique Zod** : Toutes les entrées utilisateurs (Server Actions et formulaires) sont assainies avant tout traitement DB.
- **Sécurité OWASP** :
    - Politique de mot de passe fort (12 caractères, majuscule, minuscule, chiffre, symbole).
    - En-têtes HTTP stricts : HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.
    - Row Level Security (RLS) configuré sur Supabase PostgreSQL.
    - Rate limiting basé sur Upstash Redis protégeant contre le brute-force et le déni de service.
- **Protection des Secrets** : Détection et exclusion automatique des clés fictives ou d'exemples sans crash serveur.
- **Suite de Tests Automatisée** : 52 tests unitaires et d'intégration validant les workflows critiques à chaque commit.

---

## 📚 Documentation & Ressources

- 📋 [**État du Projet (PROJECT_STATUS.md)**](PROJECT_STATUS.md) — Source de vérité et backlog priorisé
- 📝 [**Journal des Modifications (CHANGELOG.md)**](CHANGELOG.md) — Historique complet des versions
- 🔐 [**Audit de Sécurité Global (docs/SECURITY_AUDIT.md)**](docs/SECURITY_AUDIT.md) — Rapport de remédiation OWASP & RLS
- 🏗️ [**Architecture & Choix Techniques (docs/TECH_STACK_AND_ARCHITECTURE.md)**](docs/TECH_STACK_AND_ARCHITECTURE.md) — Guide d'implémentation
- 🎨 [**Design System & Accessibilité (docs/DESIGN_SYSTEM_AND_UI_ANALYSIS.md)**](docs/DESIGN_SYSTEM_AND_UI_ANALYSIS.md) — Tokens & conformité WCAG

---

## 📄 Licence & Contact

**HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE**  
_Tous droits réservés — Usage privé et propriétaire._

- Site Web : [http://localhost:3000](http://localhost:3000) (Développement)
- WhatsApp Support : Accessible via le bouton d'assistance sur la plateforme
