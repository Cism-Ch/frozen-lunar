# Backend Integration Setup Guide

## Overview

This guide explains how to set up and configure the backend integration for the Frozen Lunar application. The backend uses:

- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Better Auth** - Authentication
- **Server Actions** - Next.js server-side operations

## Prerequisites

- Node.js 20.x or higher
- PostgreSQL database (local or hosted)
- Environment variables configured

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/frozen_lunar?schema=public"
DIRECT_URL="postgresql://username:password@localhost:5432/frozen_lunar?schema=public"

# App URL (for development)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: AI/Email Services (for full functionality)
NEXT_PUBLIC_GEMINI_API_KEY="your_gemini_api_key"
RESEND_API_KEY="your_resend_api_key"

# Optional: Storage (Tigris S3)
TIGRIS_BUCKET_NAME="your_bucket_name"
TIGRIS_ACCESS_KEY_ID="your_access_key"
TIGRIS_SECRET_ACCESS_KEY="your_secret_key"
TIGRIS_ENDPOINT="https://fly.storage.tigris.dev"
NEXT_PUBLIC_TIGRIS_PUBLIC_URL="your_public_url"

# Optional: Redis (Upstash)
UPSTASH_REDIS_REST_URL="your_redis_url"
UPSTASH_REDIS_REST_TOKEN="your_redis_token"

# Optional: QStash (for background jobs)
QSTASH_TOKEN="your_qstash_token"
```

## Database Setup

### 1. Install Prisma CLI (if not already installed)

```bash
npm install -D prisma
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Run Database Migrations

```bash
npx prisma migrate deploy
```

Or for development:

```bash
npx prisma migrate dev
```

### 4. (Optional) Seed the Database

```bash
# You can create a seed script or use the API route
curl -X POST http://localhost:3000/api/seed
```

## Database Schema

The application uses the following main models:

### User Model
- Authentication and user management
- Roles: admin, moderator, developer, user

### Quote Model
- Quote requests from form or chat
- Fields: clientName, email, phone, itemType, locations, transportDate
- Status: PENDING, VALIDATED, REJECTED
- Source: FORM, CHAT
- Supplementary info stored as JSON

### QuoteHistory Model
- Tracks all changes and actions on quotes
- Linked to Quote via foreign key

## Server Actions

The application uses Next.js Server Actions for data operations:

### Quote Management Actions (`src/app/actions/quote-management.ts`)

- `createQuoteAction` - Create a new quote
- `getQuotesAction` - Fetch all quotes with optional filters
- `getQuoteByIdAction` - Fetch a single quote by ID
- `updateQuoteAction` - Update quote details
- `updateQuoteStatusAction` - Change quote status
- `deleteQuoteAction` - Delete a quote
- `addQuoteNoteAction` - Add a note to quote history

### User Management Actions (`src/app/actions/user-management.ts`)

- `createUserAction` - Create a new user (admin only)
- `deleteUserAction` - Delete a user (admin only)

## Migration from localStorage

The application now uses the database instead of localStorage for quote storage. The migration is automatic:

1. **Old quotes in localStorage**: Will remain in localStorage but won't be synced to the database
2. **New quotes**: Will be saved directly to the database
3. **Admin interface**: Will only display quotes from the database

To migrate existing localStorage quotes:
- Export them manually before deploying
- Re-create them through the form or API after deployment

## Testing the Integration

### 1. Start the development server

```bash
npm run dev
```

### 2. Test Quote Creation

Visit `http://localhost:3000/devis` and fill out the quote form.

### 3. Test Admin Interface

1. Visit `http://localhost:3000/admin/quotes`
2. You should see quotes from the database
3. Test status updates, deletion, and filtering

### 4. Test Chat Integration

1. Click the support chat button
2. Start a quote creation flow
3. Verify the quote is saved to the database

## Common Issues

### Database Connection Errors

If you see "Can't reach database server":
- Verify your DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check firewall settings

### Migration Errors

If migrations fail:
```bash
# Reset the database (WARNING: deletes all data)
npx prisma migrate reset

# Or manually fix migrations
npx prisma migrate resolve
```

### Type Errors

If you see Prisma type errors:
```bash
# Regenerate Prisma Client
npx prisma generate
```

## Production Deployment

### 1. Set Production Environment Variables

Ensure all required environment variables are set in your hosting platform.

### 2. Run Migrations

```bash
npx prisma migrate deploy
```

### 3. Build and Deploy

```bash
npm run build
npm start
```

## Monitoring

To monitor database operations:

```bash
# View database in Prisma Studio
npx prisma studio
```

## Backup and Recovery

### Backup Database

```bash
# PostgreSQL backup
pg_dump -U username -d frozen_lunar > backup.sql
```

### Restore Database

```bash
# PostgreSQL restore
psql -U username -d frozen_lunar < backup.sql
```

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Support

For issues or questions, please create an issue in the repository.
