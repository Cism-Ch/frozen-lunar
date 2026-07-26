-- Migration: Enable Row Level Security (RLS) policies on Supabase PostgreSQL
-- Enforces OWASP data protection & security best practices

-- 1. Enable Row Level Security on all tables
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "quote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "quote_history" ENABLE ROW LEVEL SECURITY;

-- 2. Quote Policies
-- Public (anonymous) users can submit quote requests from the web wizard or chat
DROP POLICY IF EXISTS "Allow public insert on quote" ON "quote";
CREATE POLICY "Allow public insert on quote" ON "quote"
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Authenticated users (admin staff) have full access to view and update quotes
DROP POLICY IF EXISTS "Allow authenticated full access on quote" ON "quote";
CREATE POLICY "Allow authenticated full access on quote" ON "quote"
  FOR ALL TO authenticated USING (true);

-- 3. Quote History Policies
-- Public quote creation can append history logs
DROP POLICY IF EXISTS "Allow public insert on quote_history" ON "quote_history";
CREATE POLICY "Allow public insert on quote_history" ON "quote_history"
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Authenticated users can view full history
DROP POLICY IF EXISTS "Allow authenticated full access on quote_history" ON "quote_history";
CREATE POLICY "Allow authenticated full access on quote_history" ON "quote_history"
  FOR ALL TO authenticated USING (true);

-- 4. Auth Tables Policies (Better-Auth)
-- Only authenticated users/service role can access auth records
DROP POLICY IF EXISTS "Allow authenticated full access on user" ON "user";
CREATE POLICY "Allow authenticated full access on user" ON "user"
  FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated full access on session" ON "session";
CREATE POLICY "Allow authenticated full access on session" ON "session"
  FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated full access on account" ON "account";
CREATE POLICY "Allow authenticated full access on account" ON "account"
  FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated full access on verification" ON "verification";
CREATE POLICY "Allow authenticated full access on verification" ON "verification"
  FOR ALL TO authenticated USING (true);
