-- Fix Critical Security Issue: Secure Digital Medicine table from public access
-- This table contains personal information (emails, names) and must be protected

-- First, remove any existing permissive policies that might allow public access
DROP POLICY IF EXISTS "Service role can manage Digital Medicine" ON "Digital Medicine";
DROP POLICY IF EXISTS "Service role can manage contact forms" ON "Digital Medicine";

-- Create secure, restrictive policies for the Digital Medicine table
-- Only service role and authenticated admins should have access to personal data

-- Policy 1: Only service role can read personal data (for backend operations)
CREATE POLICY "Service role only can read Digital Medicine"
ON "Digital Medicine"
FOR SELECT
USING (
  (auth.jwt() ->> 'role'::text) = 'service_role'::text
);

-- Policy 2: Only service role can insert new records (for form submissions via API)
CREATE POLICY "Service role only can insert Digital Medicine"
ON "Digital Medicine"  
FOR INSERT
WITH CHECK (
  (auth.jwt() ->> 'role'::text) = 'service_role'::text
);

-- Policy 3: Only service role can update records (for data management)
CREATE POLICY "Service role only can update Digital Medicine"
ON "Digital Medicine"
FOR UPDATE
USING (
  (auth.jwt() ->> 'role'::text) = 'service_role'::text
);

-- Policy 4: Only service role can delete records (for GDPR compliance)
CREATE POLICY "Service role only can delete Digital Medicine"
ON "Digital Medicine"
FOR DELETE
USING (
  (auth.jwt() ->> 'role'::text) = 'service_role'::text
);

-- Ensure RLS is enabled (should already be enabled but confirming)
ALTER TABLE "Digital Medicine" ENABLE ROW LEVEL SECURITY;

-- Add comment explaining the security requirement
COMMENT ON TABLE "Digital Medicine" IS 'Contains personal information (emails, names) - Access restricted to service role only for privacy protection';