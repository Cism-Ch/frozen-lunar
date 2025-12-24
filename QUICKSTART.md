# Guide de démarrage rapide - Frozen Lunar

Ce guide vous aide à démarrer l'application et tester les corrections apportées au backend.

## Prérequis

- Node.js 20.x ou supérieur
- PostgreSQL 14+ (local ou distant)
- npm ou pnpm

## Étape 1: Configuration de la base de données

### Option A: PostgreSQL local

1. Installer PostgreSQL si ce n'est pas déjà fait:
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS avec Homebrew
brew install postgresql
brew services start postgresql
```

2. Créer la base de données:
```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer l'utilisateur et la base de données
CREATE USER frozen_lunar_user WITH PASSWORD 'votre_mot_de_passe';
CREATE DATABASE frozen_lunar OWNER frozen_lunar_user;
GRANT ALL PRIVILEGES ON DATABASE frozen_lunar TO frozen_lunar_user;
\q
```

### Option B: PostgreSQL hébergé

Utilisez un service comme:
- [Neon](https://neon.tech) (gratuit)
- [Supabase](https://supabase.com) (gratuit)
- [Railway](https://railway.app) (gratuit avec limites)

## Étape 2: Configuration de l'environnement

1. Copier le fichier d'exemple:
```bash
cp .env.example .env
```

2. Éditer `.env` et configurer au minimum:
```env
# REQUIS: URL de connexion à PostgreSQL
DATABASE_URL="postgresql://frozen_lunar_user:votre_mot_de_passe@localhost:5432/frozen_lunar?schema=public"
DIRECT_URL="postgresql://frozen_lunar_user:votre_mot_de_passe@localhost:5432/frozen_lunar?schema=public"

# REQUIS: URL de l'application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Note**: Les autres variables (Redis, Tigris, etc.) sont optionnelles pour le développement.

## Étape 3: Installation des dépendances

```bash
npm install
```

## Étape 4: Initialisation de la base de données

1. Générer le client Prisma:
```bash
npx prisma generate
```

2. Appliquer les migrations:
```bash
# En développement
npx prisma migrate dev

# Ou directement pour la production
npx prisma migrate deploy
```

3. (Optionnel) Vérifier la base de données avec Prisma Studio:
```bash
npx prisma studio
```
Ouvre un navigateur sur `http://localhost:5555`

## Étape 5: Démarrer l'application

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## Étape 6: Initialisation de l'administrateur

### Option A: Via l'interface web (Recommandé)

1. Ouvrir `http://localhost:3000/admin/init`
2. Remplir le formulaire avec:
   - Nom complet
   - Email
   - Mot de passe (minimum 8 caractères)
3. Cliquer sur "Créer le compte administrateur"
4. Connexion automatique au dashboard

### Option B: Via l'API de seed (Développement uniquement)

**⚠️ ATTENTION**: Cette méthode crée des comptes avec des mots de passe par défaut.
Pour des raisons de sécurité, ces mots de passe doivent être changés immédiatement en production.

```bash
curl -X POST http://localhost:3000/api/seed
```

Crée automatiquement des utilisateurs avec différents rôles.
**Voir le fichier `src/app/api/seed/route.ts` pour les identifiants par défaut.**

> 🔒 **Sécurité**: Ne jamais utiliser cette route en production. Elle est automatiquement désactivée quand `NODE_ENV=production`.

## Vérification des corrections

### Test 1: Erreur de configuration explicite

1. Renommer `.env` en `.env.backup`:
```bash
mv .env .env.backup
```

2. Démarrer l'app:
```bash
npm run dev
```

**Résultat attendu**: Erreur claire indiquant que `DATABASE_URL` n'est pas configurée

3. Restaurer `.env`:
```bash
mv .env.backup .env
```

### Test 2: Route de vérification admin

```bash
curl http://localhost:3000/api/admin/check
```

**Résultat attendu**:
```json
{ "hasAdmin": false }
```
Ou `true` si un admin existe déjà.

### Test 3: Création de l'admin via API

```bash
curl -X POST http://localhost:3000/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Admin",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

**Résultat attendu**:
```json
{
  "success": true,
  "message": "Compte administrateur créé avec succès"
}
```

### Test 4: Protection contre double création

Répéter le test 3. **Résultat attendu**:
```json
{
  "error": "Un administrateur existe déjà"
}
```

### Test 5: Connexion au dashboard

1. Ouvrir `http://localhost:3000/admin/login`
2. Se connecter avec les identifiants créés
3. Vérifier l'accès au dashboard

## Dépannage

### Erreur: "Can't reach database server"

**Cause**: PostgreSQL n'est pas démarré ou l'URL est incorrecte

**Solution**:
```bash
# Vérifier que PostgreSQL est démarré
sudo systemctl status postgresql  # Linux
brew services list                # macOS

# Tester la connexion
psql -U frozen_lunar_user -d frozen_lunar -h localhost
```

### Erreur: "Prisma schema does not match"

**Cause**: Les migrations ne sont pas appliquées

**Solution**:
```bash
npx prisma migrate reset  # Attention: supprime les données!
npx prisma migrate dev
```

### Erreur: "better-auth.session_token not found"

**Cause**: Session expirée ou cookies bloqués

**Solution**:
1. Vider les cookies du navigateur
2. Se reconnecter via `/admin/login`

### Erreur de build: "Failed to fetch Inter from Google Fonts"

**Cause**: Problème de connexion réseau pendant le build

**Solution**:
```bash
# Désactiver temporairement la vérification SSL (développement seulement)
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run build

# Ou utiliser un proxy/VPN si nécessaire
```

### Rate Limiting (429 Too Many Requests)

**Cause**: Trop de requêtes en peu de temps

**Solution**:
- Attendre 10 secondes
- Ou désactiver temporairement le rate limiting en commentant la section dans `middleware.ts`

## Logs et débogage

Les erreurs backend sont préfixées avec ❌ pour un repérage facile dans la console:

```bash
# Filtrer uniquement les erreurs
npm run dev 2>&1 | grep "❌"
```

## Scripts utiles

```bash
# Lancer en développement
npm run dev

# Build pour production
npm run build

# Démarrer en production
npm run start

# Vérifier le lint
npm run lint

# Ouvrir Prisma Studio
npx prisma studio

# Réinitialiser la base de données (DANGER: supprime tout!)
npx prisma migrate reset

# Appliquer les migrations
npx prisma migrate deploy
```

## Prochaines étapes

1. Explorer le dashboard admin: `http://localhost:3000/admin/dashboard`
2. Tester la création de devis: `http://localhost:3000/devis`
3. Gérer les utilisateurs: `http://localhost:3000/admin/users`
4. Consulter les devis: `http://localhost:3000/admin/quotes`

## Support

- Documentation technique: Voir `BACKEND_SETUP.md` et `AUTH_SYSTEM.md`
- Architecture: Voir `ARCHITECTURE.md`
- Problèmes: Créer une issue sur GitHub
