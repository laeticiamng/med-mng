-- CRITICAL SECURITY FIXES - Phase 1: Fix Public Data Exposure

-- Fix 1: Secure Digital Medicine table - restrict to service role only
DROP POLICY IF EXISTS "Service role only can read Digital Medicine" ON public."Digital Medicine";
DROP POLICY IF EXISTS "Service role only can insert Digital Medicine" ON public."Digital Medicine";
DROP POLICY IF EXISTS "Service role only can update Digital Medicine" ON public."Digital Medicine";
DROP POLICY IF EXISTS "Service role only can delete Digital Medicine" ON public."Digital Medicine";

-- Create more restrictive policies for Digital Medicine
CREATE POLICY "Service role full access Digital Medicine"
ON public."Digital Medicine"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Deny all public access to Digital Medicine
CREATE POLICY "Deny public access Digital Medicine"
ON public."Digital Medicine"
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- Fix 2: Secure abonnement_fiches table - currently allows public inserts
DROP POLICY IF EXISTS "Allow inserts for everyone" ON public.abonnement_fiches;

-- Replace with secure authentication-based policy
CREATE POLICY "Authenticated users can insert subscriptions"
ON public.abonnement_fiches
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Fix 3: Enhance biovida_analyses security - ensure only authenticated users access their own data
DROP POLICY IF EXISTS "Users can only access their own biovida analyses" ON public.biovida_analyses;

-- Create email-based access policy for biovida analyses
CREATE POLICY "Users access own biovida analyses by email"
ON public.biovida_analyses
FOR ALL
TO authenticated
USING (
  -- User can access if authenticated user's email matches record email
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = biovida_analyses.email
  )
)
WITH CHECK (
  -- User can create/modify if authenticated user's email matches record email
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = biovida_analyses.email
  )
);

-- Fix 4: Secure admin and audit tables - ensure only service role access
CREATE POLICY "Service role only admin_changelog"
ON public.admin_changelog
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Restrict admin changelog to authenticated admin users only (not public)
DROP POLICY IF EXISTS "Admins can insert changelog" ON public.admin_changelog;
DROP POLICY IF EXISTS "Admins can view changelog" ON public.admin_changelog;

CREATE POLICY "Admin role only changelog access"
ON public.admin_changelog  
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);