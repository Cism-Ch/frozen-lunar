# Authentication System Documentation

## Overview

The application uses **Better Auth** for authentication with session-based security and role-based access control.

## Architecture

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ 1. Login Request
       ▼
┌─────────────────┐
│  Auth Client    │ (src/lib/auth-client.ts)
│  (Better Auth)  │
└──────┬──────────┘
       │ 2. API Call
       ▼
┌──────────────────┐
│   Auth Server    │ (src/lib/auth.ts)
│  (Better Auth)   │
└──────┬───────────┘
       │ 3. Validate & Store
       ▼
┌──────────────────┐
│    Database      │ (PostgreSQL + Prisma)
│  User, Session   │
└──────┬───────────┘
       │ 4. Session Token
       ▼
┌──────────────────┐
│   Middleware     │ (middleware.ts)
│ Route Protection │
└──────────────────┘
```

## Components

### 1. Auth Client (`src/lib/auth-client.ts`)

Client-side authentication helper using Better Auth React.

```typescript
import { authClient } from "@/lib/auth-client";

// Sign in
const result = await authClient.signIn.email({
  email: "user@example.com",
  password: "password123"
});

// Sign out
await authClient.signOut();

// Get session
const session = await authClient.getSession();
```

### 2. Auth Server (`src/lib/auth.ts`)

Server-side authentication configuration with Prisma adapter.

**Features:**
- Email/password authentication
- Session management with cookie cache
- Custom user fields (role)
- PostgreSQL integration via Prisma

**Configuration:**
```typescript
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "user",
            },
        },
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60 // 5 minutes cache
        }
    }
});
```

### 3. Middleware (`middleware.ts`)

Protects admin routes and applies rate limiting.

**Protected Routes:**
- `/admin/*` (except `/admin/login` and `/admin/init`)

**Features:**
- Session token validation
- Automatic redirect to login
- Rate limiting on API routes
- Static file exclusion

### 4. Admin Login Page (`src/app/admin/login/page.tsx`)

**Features:**
- Email/password authentication
- Role verification (blocks "user" role)
- Error handling with toast notifications
- Callback URL support
- Loading states

**Flow:**
```
1. User enters credentials
2. Client calls authClient.signIn.email()
3. Better Auth validates credentials
4. Check user role
5. If admin/moderator/developer → redirect to dashboard
6. If user role → sign out and show error
```

### 5. Admin Initialization (`src/app/admin/init/page.tsx`)

First-time setup page for creating the initial admin account.

**Features:**
- Checks if admin exists
- Password confirmation
- Minimum 8 character password
- Auto-login after creation
- One-time use (disabled after first admin creation)

**API Endpoints:**
- `GET /api/admin/check` - Check if admin exists
- `POST /api/admin/init` - Create first admin

### 6. User Management Actions (`src/app/actions/user-management.ts`)

Server actions for managing users.

**Functions:**

#### `createUserAction(formData)`
Creates a new user with specified role.

**Permissions:** Admin only

**Parameters:**
- `name`: User's full name
- `email`: User's email address
- `password`: User's password (min 8 chars)
- `role`: admin | moderator | developer | user

**Returns:**
```typescript
{ success: boolean, message?: string, error?: string }
```

#### `deleteUserAction(formData)`
Deletes a user by ID.

**Permissions:** Admin only
**Restrictions:** Cannot delete own account

**Parameters:**
- `userId`: User's unique ID

**Returns:**
```typescript
{ success: boolean, message?: string, error?: string }
```

## Roles

### Admin
- **Access:** Full system access
- **Permissions:**
  - Manage users
  - Manage quotes
  - Manage contacts
  - System settings
  - View all data

### Moderator
- **Access:** Limited admin access
- **Permissions:**
  - Manage quotes
  - View contacts
  - Limited settings

### Developer
- **Access:** Development access
- **Permissions:**
  - View system info
  - Access logs
  - Test features

### User
- **Access:** No admin panel access
- **Permissions:**
  - Public website only
  - Submit quotes (public form)

## Session Management

### Session Storage
- Sessions stored in database (`Session` model)
- Token stored in secure HTTP-only cookie
- Cookie name: `better-auth.session_token`

### Session Lifecycle
```
Login → Create Session → Store Token in Cookie
  ↓
User Activity → Validate Token → Refresh if needed
  ↓
Logout → Delete Session → Clear Cookie
```

### Session Security
- HTTP-only cookies (XSS protection)
- Secure flag in production (HTTPS only)
- SameSite=Lax (CSRF protection)
- 5-minute cookie cache
- Automatic token validation on protected routes

## Database Schema

### User Table
```prisma
model User {
  id            String   @id @default(cuid())
  name          String
  email         String   @unique
  emailVerified Boolean  @default(false)
  image         String?
  role          String   @default("user")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  sessions Session[]
  accounts Account[]
}
```

### Session Table
```prisma
model Session {
  id        String   @id @default(cuid())
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Account Table
```prisma
model Account {
  id                    String    @id @default(cuid())
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  password              String?
  // ... OAuth fields
}
```

## Security Best Practices

### Implemented
✅ Password hashing (bcrypt via Better Auth)
✅ Session tokens (cryptographically secure)
✅ HTTP-only cookies
✅ CSRF protection
✅ Rate limiting
✅ SQL injection prevention (Prisma)
✅ XSS protection (React)
✅ Role-based access control
✅ Secure password requirements (min 8 chars)

### Recommended for Production
- [ ] Email verification
- [ ] 2FA (Two-Factor Authentication)
- [ ] Account lockout after failed attempts
- [ ] Password reset flow
- [ ] Session timeout alerts
- [ ] Audit logging
- [ ] IP whitelisting for admin
- [ ] Security headers (CSP, HSTS, etc.)

## Usage Examples

### Protecting Server Components

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  return <div>Admin Content</div>;
}
```

### Protecting Server Actions

```typescript
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function adminAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  // Perform admin action
}
```

### Client-Side Authentication

```typescript
"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    const result = await authClient.signIn.email({
      email,
      password,
    });

    if (result.error) {
      // Handle error
      return;
    }

    router.push("/admin/dashboard");
  };

  // ...
}
```

## Troubleshooting

### Common Issues

#### "Session not found" error
**Cause:** Session expired or invalid
**Solution:** Clear cookies and login again

#### "Unauthorized" when accessing admin
**Cause:** User role is "user"
**Solution:** Admin must assign proper role via `/admin/users`

#### Admin init page shows "already configured"
**Cause:** Admin user already exists in database
**Solution:** Use `/admin/login` instead

#### Login succeeds but redirects back to login
**Cause:** Cookie domain mismatch
**Solution:** Verify `NEXT_PUBLIC_APP_URL` matches deployment domain

### Debug Mode

Enable Better Auth debug mode in development:

```typescript
// src/lib/auth.ts
export const auth = betterAuth({
  // ... config
  advanced: {
    debug: process.env.NODE_ENV === 'development'
  }
});
```

## API Reference

### Auth Routes

#### `POST /api/auth/sign-in/email`
Authenticate user with email/password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin"
  },
  "session": {
    "token": "...",
    "expiresAt": "..."
  }
}
```

#### `POST /api/auth/sign-out`
Sign out current user.

#### `GET /api/auth/session`
Get current session.

**Response:**
```json
{
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "role": "..."
  },
  "session": {
    "id": "...",
    "expiresAt": "..."
  }
}
```

## Migration Guide

### From Mock Auth to Better Auth

If migrating from a mock authentication system:

1. Install Better Auth
```bash
npm install better-auth
```

2. Update auth configuration
```typescript
// Old: Mock auth
const user = { id: "1", email: "admin@example.com" };

// New: Better Auth
const session = await auth.api.getSession({ headers: await headers() });
const user = session?.user;
```

3. Update middleware
```typescript
// Old: Simple check
if (!hasAuth) redirect("/login");

// New: Token validation
const sessionToken = request.cookies.get("better-auth.session_token");
if (!sessionToken) redirect("/admin/login");
```

4. Migrate existing users
```bash
# Create migration script to hash existing passwords
npx prisma migrate dev --name add_better_auth
```

## Support & Resources

- **Better Auth Docs:** https://better-auth.com
- **Prisma Docs:** https://prisma.io/docs
- **Next.js Auth:** https://nextjs.org/docs/authentication
- **Resend Docs:** https://resend.com/docs
- **GitHub Issues:** [Create Issue](https://github.com/your-repo/issues)

## Email System

### Overview

The application uses **Resend** for sending transactional emails. The email system is configured in `src/lib/email.ts`.

### Configuration

#### Environment Variables

```env
# Required for email sending
RESEND_KEY="re_your_api_key_here"

# Optional: Alternative variable name for compatibility
AUTH_RESEND_KEY="re_your_api_key_here"
```

To get a Resend API key:
1. Sign up at https://resend.com
2. Create an API key in your dashboard
3. Add it to your `.env` file as `RESEND_KEY`

#### Email Sender Configuration

The sender email is automatically configured based on environment:

- **Production**: `contact@hbc-logistique.fr`
- **Development**: `onboarding@resend.dev` (Resend's test domain)

### Usage

#### Importing the Email Service

```typescript
import { resend, EMAIL_SENDER } from "@/lib/email";
```

#### Sending an Email

```typescript
const { data, error } = await resend.emails.send({
    from: EMAIL_SENDER,
    to: ["recipient@example.com"],
    subject: "Your Subject",
    react: YourEmailComponent({ props }),
});

if (error) {
    console.error("Email Error:", error);
    // Handle error
}
```

#### Email Templates

Email templates are created using React and `@react-email/components`. Example location: `src/components/emails/QuoteRequestEmail.tsx`

```typescript
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Text,
} from "@react-email/components";

export function QuoteRequestEmail({
    clientName,
    email,
    // ... other props
}) {
    return (
        <Html>
            <Head />
            <Preview>New quote request</Preview>
            <Body>
                <Container>
                    <Heading>New Quote Request</Heading>
                    <Text>Client: {clientName}</Text>
                    <Text>Email: {email}</Text>
                </Container>
            </Body>
        </Html>
    );
}
```

### Email Workflows

#### Quote Notification Email

When a new quote is submitted, an email is sent via QStash workflow:

1. Quote is submitted via form or chat
2. QStash triggers the email workflow at `/api/workflow/email`
3. Email is sent to admin using Resend
4. Email contains quote details and client information

**Route**: `src/app/api/workflow/email/route.ts`

**Security**: Protected by QStash signature verification

### Error Handling

The email system includes fallback mechanisms:

1. If `RESEND_KEY` is not configured, a warning is logged
2. A dummy key is used to prevent crashes
3. Errors are caught and logged appropriately

```typescript
if (!apiKey) {
    console.warn("⚠️ Resend environment variable is missing (RESEND_KEY).");
}

export const resend = new Resend(apiKey || "re_123456789");
```

### Email Verification (Future)

Better Auth supports email verification out of the box. To enable:

1. Configure email verification in `src/lib/auth.ts`:

```typescript
export const auth = betterAuth({
    // ... existing config
    emailVerification: {
        enabled: true,
        sendVerificationEmail: async ({ user, url }) => {
            await resend.emails.send({
                from: EMAIL_SENDER,
                to: [user.email],
                subject: "Verify your email",
                html: `Click here to verify: <a href="${url}">${url}</a>`,
            });
        },
    },
});
```

2. Update the Prisma schema if needed (emailVerified field already exists)

3. Add email verification UI components

### Testing Emails in Development

Resend provides a test domain (`onboarding@resend.dev`) for development:

- Emails sent from this domain are delivered normally
- No domain verification required
- Limited to 100 emails per day

For production, you must:
1. Add and verify your domain in Resend dashboard
2. Update `EMAIL_SENDER` in `src/lib/email.ts`
3. Configure DNS records (SPF, DKIM)

### Monitoring

To monitor email delivery:

1. Check Resend dashboard for delivery status
2. View email logs and analytics
3. Set up webhooks for delivery events

### Best Practices

1. **Always use EMAIL_SENDER constant** - Don't hardcode sender addresses
2. **Handle errors gracefully** - Email failures shouldn't break user flows
3. **Use React Email components** - For maintainable, responsive emails
4. **Test in development** - Use Resend's test domain before production
5. **Monitor delivery rates** - Check Resend dashboard regularly
6. **Respect rate limits** - Resend has rate limits per plan tier
