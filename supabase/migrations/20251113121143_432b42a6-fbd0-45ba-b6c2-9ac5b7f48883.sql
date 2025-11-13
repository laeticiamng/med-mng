-- Fix Function Search Path Mutable warnings by adding SET search_path = public
-- This prevents potential SQL injection attacks through search_path manipulation

-- 1. generate_anonymous_pseudo
CREATE OR REPLACE FUNCTION public.generate_anonymous_pseudo()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  adjectives TEXT[] := ARRAY['Brave', 'Calm', 'Joyful', 'Wise', 'Swift', 'Noble', 'Bright', 'Peaceful', 'Strong', 'Gentle'];
  nouns TEXT[] := ARRAY['Phoenix', 'Tiger', 'Dolphin', 'Eagle', 'Wolf', 'Owl', 'Dragon', 'Lion', 'Butterfly', 'Swan'];
  random_adjective TEXT;
  random_noun TEXT;
  random_number INTEGER;
BEGIN
  random_adjective := adjectives[floor(random() * array_length(adjectives, 1) + 1)];
  random_noun := nouns[floor(random() * array_length(nouns, 1) + 1)];
  random_number := floor(random() * 999 + 1);
  RETURN random_adjective || random_noun || random_number;
END;
$$;

-- 2. get_gamification_cron_history (SECURITY DEFINER - critical)
CREATE OR REPLACE FUNCTION public.get_gamification_cron_history()
RETURNS TABLE(jobid bigint, job_name text, status text, return_message text, start_time timestamp with time zone, end_time timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    jrd.jobid,
    j.jobname as job_name,
    jrd.status,
    jrd.return_message,
    jrd.start_time,
    jrd.end_time
  FROM cron.job_run_details jrd
  JOIN cron.job j ON j.jobid = jrd.jobid
  WHERE j.jobname IN ('generate-daily-challenges-midnight', 'calculate-rankings-hourly')
  ORDER BY jrd.start_time DESC
  LIMIT 100;
END;
$$;

-- 3. get_gamification_cron_jobs (SECURITY DEFINER - critical)
CREATE OR REPLACE FUNCTION public.get_gamification_cron_jobs()
RETURNS TABLE(jobid bigint, jobname text, schedule text, active boolean, database text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.jobid,
    j.jobname,
    j.schedule,
    j.active,
    j.database
  FROM cron.job j
  WHERE j.jobname IN ('generate-daily-challenges-midnight', 'calculate-rankings-hourly')
  ORDER BY j.jobname;
END;
$$;

-- 4. handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 5. set_dsar_legal_deadline
CREATE OR REPLACE FUNCTION public.set_dsar_legal_deadline()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.legal_deadline := NEW.created_at + INTERVAL '30 days';
  RETURN NEW;
END;
$$;

-- 6. update_custom_challenges_updated_at
CREATE OR REPLACE FUNCTION public.update_custom_challenges_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 7. update_focus_sessions_updated_at
CREATE OR REPLACE FUNCTION public.update_focus_sessions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 8. update_music_journey_updated_at
CREATE OR REPLACE FUNCTION public.update_music_journey_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 9. update_pdf_templates_updated_at
CREATE OR REPLACE FUNCTION public.update_pdf_templates_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 10. update_privacy_policy_updated_at
CREATE OR REPLACE FUNCTION public.update_privacy_policy_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 11. update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;