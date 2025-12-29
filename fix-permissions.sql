-- FIX: Enable full access to assignments, volunteers, and requests to resolve permission errors
-- Run this in the Supabase SQL Editor

-- 1. Assignments Table
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for assignments" ON assignments;
DROP POLICY IF EXISTS "Allow public read access on assignments" ON assignments;
DROP POLICY IF EXISTS "Allow public insert on assignments" ON assignments;
DROP POLICY IF EXISTS "Allow public update on assignments" ON assignments;

CREATE POLICY "Enable all access for assignments" ON assignments FOR ALL USING (true) WITH CHECK (true);

-- 2. Volunteers Table
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for volunteers" ON volunteers;
DROP POLICY IF EXISTS "Allow public read access on volunteers" ON volunteers;
DROP POLICY IF EXISTS "Allow public insert on volunteers" ON volunteers;
DROP POLICY IF EXISTS "Allow public update on volunteers" ON volunteers;

CREATE POLICY "Enable all access for volunteers" ON volunteers FOR ALL USING (true) WITH CHECK (true);

-- 3. Requests Table
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for requests" ON requests;
DROP POLICY IF EXISTS "Allow public read access on requests" ON requests;
DROP POLICY IF EXISTS "Allow public insert on requests" ON requests;
DROP POLICY IF EXISTS "Allow public update on requests" ON requests;

CREATE POLICY "Enable all access for requests" ON requests FOR ALL USING (true) WITH CHECK (true);

-- 4. Verify Foreign Key Logic (Self-repair if needed)
-- This ensures that updating potential related tables (like counters) works
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
