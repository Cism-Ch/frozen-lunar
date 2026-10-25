-- Migration: Enable Row Level Security (RLS) on contact_message & system_settings
-- Completes the RLS hardening for all PostgreSQL tables in Supabase

-- 1. Enable Row Level Security on remaining tables
ALTER TABLE "contact_message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "system_settings" ENABLE ROW LEVEL SECURITY;

-- 2. Policies for contact_message
-- Public visitors can submit contact messages via the public form
DROP POLICY IF EXISTS "Allow public insert on contact_message" ON "contact_message";
CREATE POLICY "Allow public insert on contact_message" ON "contact_message"
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Authenticated staff (admin) has full access to read, update and archive messages
DROP POLICY IF EXISTS "Allow authenticated full access on contact_message" ON "contact_message";
CREATE POLICY "Allow authenticated full access on contact_message" ON "contact_message"
  FOR ALL TO authenticated USING (true);

-- 3. Policies for system_settings (Singleton)
-- Public can read public company settings (address, phone, name)
DROP POLICY IF EXISTS "Allow public read on system_settings" ON "system_settings";
CREATE POLICY "Allow public read on system_settings" ON "system_settings"
  FOR SELECT TO anon, authenticated USING (true);

-- Authenticated staff can update system settings
DROP POLICY IF EXISTS "Allow authenticated full access on system_settings" ON "system_settings";
CREATE POLICY "Allow authenticated full access on system_settings" ON "system_settings"
  FOR ALL TO authenticated USING (true);
