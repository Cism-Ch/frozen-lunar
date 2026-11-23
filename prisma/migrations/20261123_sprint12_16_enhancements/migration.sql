-- Migration: Sprints 12-16 Enhancements
-- Adds AdminNotificationRead, Quote.trackingCode (with backfill), QuoteStatus.CANCELLED + cancellationReason,
-- CompanyProfile.accountType, PartnerApplication.partnerType & idDocumentNumber (nullable rccmNumber), + RLS.

-- 1. Extend QuoteStatus enum with CANCELLED
DO $$ BEGIN
    ALTER TYPE "QuoteStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add trackingCode and cancellation fields to quote
ALTER TABLE "quote" ADD COLUMN IF NOT EXISTS "trackingCode" TEXT;
ALTER TABLE "quote" ADD COLUMN IF NOT EXISTS "cancellationReason" TEXT;
ALTER TABLE "quote" ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3);

-- Backfill readable tracking codes for existing quotes (HBC-YYYY-XXXXXX)
UPDATE "quote"
SET "trackingCode" = 'HBC-' || TO_CHAR("date", 'YYYY') || '-' || UPPER(SUBSTRING(MD5("id") FROM 1 FOR 6))
WHERE "trackingCode" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "quote_trackingCode_key" ON "quote"("trackingCode");

-- 3. Add accountType to company_profile (INDIVIDUAL | COMPANY)
ALTER TABLE "company_profile" ADD COLUMN IF NOT EXISTS "accountType" TEXT NOT NULL DEFAULT 'INDIVIDUAL';

-- 4. Update partner_application for INDIVIDUAL vs COMPANY support
ALTER TABLE "partner_application" ADD COLUMN IF NOT EXISTS "partnerType" TEXT NOT NULL DEFAULT 'COMPANY';
ALTER TABLE "partner_application" ADD COLUMN IF NOT EXISTS "idDocumentNumber" TEXT;
ALTER TABLE "partner_application" ALTER COLUMN "rccmNumber" DROP NOT NULL;

-- 5. Create admin_notification_read table for persistent notification acknowledgement
CREATE TABLE IF NOT EXISTS "admin_notification_read" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationKey" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_notification_read_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "admin_notification_read_userId_notificationKey_key"
    ON "admin_notification_read"("userId", "notificationKey");

-- 6. Enable RLS on admin_notification_read
ALTER TABLE "admin_notification_read" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated access on admin_notification_read" ON "admin_notification_read";
CREATE POLICY "Allow authenticated access on admin_notification_read" ON "admin_notification_read"
    FOR ALL TO authenticated USING (true);
