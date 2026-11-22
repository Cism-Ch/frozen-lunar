-- Migration: Add PartnerApplication table for Africa Partner Portal & Supabase RLS policies

-- 1. Create PartnerApplicationStatus enum
DO $$ BEGIN
    CREATE TYPE "PartnerApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create partner_application table
CREATE TABLE IF NOT EXISTS "partner_application" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "rccmNumber" TEXT NOT NULL,
    "nccNumber" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Côte d''Ivoire',
    "city" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "fleetCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "fleetSummary" TEXT NOT NULL,
    "totalVehicles" INTEGER NOT NULL DEFAULT 1,
    "operatingZones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "kycDocumentKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "PartnerApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_application_pkey" PRIMARY KEY ("id")
);

-- 3. Enable Row Level Security (RLS) on partner_application
ALTER TABLE "partner_application" ENABLE ROW LEVEL SECURITY;

-- Public visitors can ONLY submit a partner application (INSERT); zero public SELECT on KYC dossiers
DROP POLICY IF EXISTS "Allow public insert on partner_application" ON "partner_application";
CREATE POLICY "Allow public insert on partner_application" ON "partner_application"
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Authenticated staff (admin) has full access to review, approve, reject and delete partner applications
DROP POLICY IF EXISTS "Allow authenticated full access on partner_application" ON "partner_application";
CREATE POLICY "Allow authenticated full access on partner_application" ON "partner_application"
    FOR ALL TO authenticated USING (true);
