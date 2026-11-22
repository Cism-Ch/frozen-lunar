-- Migration: Add CompanyProfile, Quote.userId, SupportThread & SupportMessage + Supabase RLS policies

-- 1. Create enums for Hybrid Chat
DO $$ BEGIN
    CREATE TYPE "SupportThreadStatus" AS ENUM ('AI_ACTIVE', 'HUMAN_TAKEOVER', 'RESOLVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SupportSenderRole" AS ENUM ('CLIENT', 'AI', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add userId on quote for client ownership & IDOR isolation
ALTER TABLE "quote" ADD COLUMN IF NOT EXISTS "userId" TEXT;

DO $$ BEGIN
    ALTER TABLE "quote"
        ADD CONSTRAINT "quote_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "user"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create company_profile table
CREATE TABLE IF NOT EXISTS "company_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "rccmNumber" TEXT,
    "nccNumber" TEXT,
    "phone" TEXT NOT NULL,
    "defaultPickup" TEXT,
    "defaultDropoff" TEXT,
    "savedAddresses" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_profile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "company_profile_userId_key" ON "company_profile"("userId");

DO $$ BEGIN
    ALTER TABLE "company_profile"
        ADD CONSTRAINT "company_profile_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "user"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Create support_thread table
CREATE TABLE IF NOT EXISTS "support_thread" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "userId" TEXT,
    "status" "SupportThreadStatus" NOT NULL DEFAULT 'AI_ACTIVE',
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_thread_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "support_thread_quoteId_key" ON "support_thread"("quoteId");

DO $$ BEGIN
    ALTER TABLE "support_thread"
        ADD CONSTRAINT "support_thread_quoteId_fkey"
        FOREIGN KEY ("quoteId") REFERENCES "quote"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "support_thread"
        ADD CONSTRAINT "support_thread_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "user"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Create support_message table
CREATE TABLE IF NOT EXISTS "support_message" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderRole" "SupportSenderRole" NOT NULL,
    "senderName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_message_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
    ALTER TABLE "support_message"
        ADD CONSTRAINT "support_message_threadId_fkey"
        FOREIGN KEY ("threadId") REFERENCES "support_thread"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 6. Enable Row Level Security (RLS) on new tables
ALTER TABLE "company_profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "support_thread" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "support_message" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated access on company_profile" ON "company_profile";
CREATE POLICY "Allow authenticated access on company_profile" ON "company_profile"
    FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated access on support_thread" ON "support_thread";
CREATE POLICY "Allow authenticated access on support_thread" ON "support_thread"
    FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated access on support_message" ON "support_message";
CREATE POLICY "Allow authenticated access on support_message" ON "support_message"
    FOR ALL TO authenticated USING (true);
