-- Marquer la violation critique comme résolue
UPDATE public.security_audit_log 
SET 
    resolved_at = now(),
    action_taken = 'REMOVED_HARDCODED_JWT',
    metadata = metadata || jsonb_build_object('resolution_date', now(), 'corrected_by', 'SECURITY_AUDIT')
WHERE finding_type = 'HARDCODED_JWT' 
AND location = 'supabase/functions/auto-extract-oic/index.ts';