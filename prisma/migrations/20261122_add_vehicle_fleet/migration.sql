-- Migration: Add Vehicle Fleet table, Quote vehicle relation & Supabase RLS policies

-- 1. Create VehicleCategory enum
DO $$ BEGIN
    CREATE TYPE "VehicleCategory" AS ENUM ('HEAVY_HAUL', 'CONTAINERS', 'MATERIALS', 'PASSENGER', 'UTILITY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create vehicle table
CREATE TABLE IF NOT EXISTS "vehicle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "VehicleCategory" NOT NULL,
    "capacityLabel" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "totalQuantity" INTEGER NOT NULL DEFAULT 1,
    "availableQuantity" INTEGER NOT NULL DEFAULT 1,
    "dailyRateFcfa" INTEGER,
    "imageUrl" TEXT,
    "specs" JSONB,
    "recommendedFor" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "vehicle_slug_key" ON "vehicle"("slug");

-- 3. Add optional vehicle reference to quote table
ALTER TABLE "quote" ADD COLUMN IF NOT EXISTS "vehicleId" TEXT;
ALTER TABLE "quote" ADD COLUMN IF NOT EXISTS "vehicleQuantity" INTEGER NOT NULL DEFAULT 1;

DO $$ BEGIN
    ALTER TABLE "quote"
        ADD CONSTRAINT "quote_vehicleId_fkey"
        FOREIGN KEY ("vehicleId") REFERENCES "vehicle"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Enable Row Level Security (RLS) on vehicle
ALTER TABLE "vehicle" ENABLE ROW LEVEL SECURITY;

-- Public visitors can read active vehicles in the fleet catalog
DROP POLICY IF EXISTS "Allow public read active vehicles" ON "vehicle";
CREATE POLICY "Allow public read active vehicles" ON "vehicle"
    FOR SELECT TO anon, authenticated USING ("isActive" = true);

-- Authenticated staff (admin) has full CRUD access on vehicles
DROP POLICY IF EXISTS "Allow authenticated full access on vehicle" ON "vehicle";
CREATE POLICY "Allow authenticated full access on vehicle" ON "vehicle"
    FOR ALL TO authenticated USING (true);
