# Setup Guide - Production Deployment

## Prerequisites

- Node.js 20.x or higher
- PostgreSQL database (Supabase recommended)
- Git

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
DIRECT_URL="postgresql://user:password@host:5432/database?sslmode=require"

# App URL (Required)
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Optional Services
NEXT_PUBLIC_GEMINI_API_KEY="your_gemini_api_key"
RESEND_KEY="your_resend_api_key"

# Tigris S3 Storage (Optional)
TIGRIS_BUCKET_NAME="your_bucket_name"
TIGRIS_STORAGE_ACCESS_KEY_ID="your_access_key"
TIGRIS_STORAGE_SECRET_ACCESS_KEY="your_secret_key"
TIGRIS_STORAGE_ENDPOINT="https://fly.storage.tigris.dev"
NEXT_PUBLIC_TIGRIS_PUBLIC_URL="your_public_url"

# Redis/Upstash (Optional - for rate limiting)
UPSTASH_REDIS_REST_URL="your_redis_url"
UPSTASH_REDIS_REST_TOKEN="your_redis_token"

# QStash (Optional - for background jobs)
QSTASH_TOKEN="your_qstash_token"
```

## Database Setup

### 1. Install Dependencies

```bash
npm install
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

## First-Time Admin Setup

After deploying the application:

1. Visit `https://your-domain.com/admin/init`
2. Create the first admin account
3. Login with your credentials at `/admin/login`

## Security Features Implemented

### 1. Route Protection
- All `/admin/*` routes are protected by middleware
- Requires valid session token
- Redirects to login if unauthenticated

### 2. Role-Based Access Control
- Admin role: Full access
- Moderator role: Limited access
- Developer role: Development access
- User role: No admin access

### 3. Session Management
- Better-Auth for authentication
- Session tokens stored in secure cookies
- Automatic session validation

## Authentication Flow

```
User → /admin/* → Middleware Check → Has Session?
                                      ↓ No
                                 /admin/login
                                      ↓ Success
                                 /admin/dashboard
```

## Admin Features

### Dashboard
- Real-time quote statistics
- Recent quotes list
- Activity charts
- Quote management

### Notifications
- Real-time notifications (ready for WebSocket integration)
- Unread count display
- Mark as read functionality
- Persistent storage ready

### User Management
- Create non-user roles (admin, moderator, developer)
- Delete users (except self)
- View user list with roles
- Role-based badges

### Quote Management
- Create quotes from form or chat
- Update quote status
- Add notes and history
- PDF export
- Backend fully integrated with Prisma

## Development

### Run Development Server

```bash
npm run dev
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Build

```bash
npm run build
```

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm run start
```

## Post-Deployment Steps

1. **Initialize Admin Account**
   - Visit `/admin/init`
   - Create first admin user

2. **Configure Services** (Optional)
   - Set up Gemini AI for chat
   - Configure Resend for emails
   - Set up Tigris for file storage
   - Configure Upstash Redis for rate limiting

3. **Test Authentication**
   - Login at `/admin/login`
   - Verify logout works
   - Check route protection

4. **Create Additional Users**
   - Navigate to `/admin/users`
   - Add moderators/developers as needed

## Troubleshooting

### Cannot connect to database
- Verify DATABASE_URL is correct
- Check database is accessible
- Ensure migrations are run

### Session not persisting
- Check NEXT_PUBLIC_APP_URL matches deployment URL
- Verify cookies are being set
- Check browser console for errors

### Login redirects to /admin/login
- Session may be expired
- Check better-auth configuration
- Verify database connection

## API Routes

### Authentication
- `POST /api/auth/[...all]` - Better Auth handler

### Admin
- `GET /api/admin/check` - Check if admin exists
- `POST /api/admin/init` - Initialize first admin

### Workflow
- `POST /api/workflow/email` - Email workflow
- `POST /api/workflow/pdf` - PDF generation

## Database Schema

### User
- Authentication data
- Role (admin, moderator, developer, user)
- Email verification status

### Quote
- Client information
- Transport details
- Status (PENDING, VALIDATED, REJECTED)
- Source (FORM, CHAT)
- Supplementary info (JSON)

### QuoteHistory
- Action tracking
- Description
- Timestamp
- User attribution

## Security Checklist

- [x] Admin routes protected
- [x] Session validation
- [x] Role-based access control
- [x] Rate limiting on API routes
- [x] SQL injection prevention (Prisma)
- [x] XSS protection (React)
- [x] CSRF protection (Better Auth)
- [x] Secure password hashing (Better Auth)

## Next Steps

1. Set up monitoring (Sentry, LogRocket, etc.)
2. Configure analytics (Plausible, Umami, etc.)
3. Set up backup strategy for database
4. Configure CI/CD pipeline
5. Set up staging environment
6. Add integration tests
7. Configure error tracking
8. Set up uptime monitoring

## Support

For issues or questions:
1. Check the [Backend Setup Guide](./BACKEND_SETUP.md)
2. Review the [Architecture Documentation](./ARCHITECTURE.md)
3. Check GitHub issues
4. Contact development team
