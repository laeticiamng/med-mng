-- Add RLS policies to dsar_approvals table
-- This table manages DSAR (Data Subject Access Request) approval workflows

-- Policy 1: Approvers can view their assigned approvals
CREATE POLICY "Approvers can view their own approvals"
ON public.dsar_approvals
FOR SELECT
USING (approver_id = auth.uid());

-- Policy 2: Approvers can update their own approval decisions
CREATE POLICY "Approvers can update their own approvals"
ON public.dsar_approvals
FOR UPDATE
USING (approver_id = auth.uid())
WITH CHECK (approver_id = auth.uid());

-- Policy 3: System can create approval records (via service_role or admin)
-- Users cannot create approvals directly - only the system should
CREATE POLICY "Service role can insert approvals"
ON public.dsar_approvals
FOR INSERT
WITH CHECK (false); -- Blocked for regular users, service_role bypasses RLS

-- Policy 4: Service role has full access (bypasses RLS by default)
-- No explicit policy needed - service_role automatically bypasses RLS

-- Add helpful comment
COMMENT ON TABLE public.dsar_approvals IS 'DSAR approval workflow table with RLS: approvers can view/update their own approvals, system manages creation';

-- Verify RLS is still enabled
ALTER TABLE public.dsar_approvals ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, UPDATE ON public.dsar_approvals TO authenticated;
GRANT ALL ON public.dsar_approvals TO service_role;