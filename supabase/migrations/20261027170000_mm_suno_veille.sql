-- ============================================================================
-- Veille de la surveillance du solde Suno (27.10.2026)
-- ============================================================================
-- CONSTAT : mm-suno-solde signale les pannes du fournisseur et, quand elle reprend, l'interruption qui a précédé.
-- Si elle ne repart jamais (tâche « mm-suno-solde-horaire » désactivée ou supprimée, fonction en erreur au
-- démarrage, jeton des tâches planifiées refusé), rien ne le signalait.
--
-- EFFET (idempotent) :
--   1. mm_suno_solde_config.veille_alerte_at : date de la dernière alerte de la veille (réservation atomique).
--   2. public.mm_suno_veille_etat() : date du dernier relevé, tâche horaire active / désactivée / absente, date de
--      la dernière alerte de la veille. Service_role seulement.
--   3. public.mm_suno_veille_reserver(p_liberer) : réserve l'envoi d'une alerte (au plus une toutes les 23 h,
--      quel que soit le nombre d'appels) ou rend la réservation (envoi raté, surveillance repartie).
--      Service_role seulement.
--   4. Tâche pg_cron « mm-suno-solde-veille » (minute 47, toutes les 2 h) : appelle la fonction mm-suno-veille.
--      Aucun jeton : la veille ne doit pas dépendre du jeton des tâches planifiées qu'elle surveille (voir l'en-tête
--      de la fonction).
--
-- RETOUR ARRIÈRE :
--   select cron.unschedule('mm-suno-solde-veille');
--   drop function public.mm_suno_veille_reserver(boolean);
--   drop function public.mm_suno_veille_etat();
--   alter table public.mm_suno_solde_config drop column veille_alerte_at;
-- ============================================================================

ALTER TABLE public.mm_suno_solde_config ADD COLUMN IF NOT EXISTS veille_alerte_at timestamptz;

CREATE OR REPLACE FUNCTION public.mm_suno_veille_etat()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_tache_active boolean;
BEGIN
  IF to_regclass('cron.job') IS NOT NULL THEN
    EXECUTE 'SELECT bool_or(active) FROM cron.job WHERE jobname = $1'
      INTO v_tache_active
      USING 'mm-suno-solde-horaire';
  END IF;

  RETURN jsonb_build_object(
    'dernier_releve', (SELECT max(r.releve_at) FROM public.mm_suno_solde_releves r),
    'tache_active', v_tache_active,
    'veille_alerte_at', (SELECT c.veille_alerte_at FROM public.mm_suno_solde_config c WHERE c.id = 1)
  );
END;
$$;

COMMENT ON FUNCTION public.mm_suno_veille_etat() IS
  'Veille de la surveillance Suno : dernier relevé, tâche horaire active (NULL = absente), dernière alerte de la veille. Service_role seulement.';

REVOKE ALL ON FUNCTION public.mm_suno_veille_etat() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mm_suno_veille_etat() TO service_role;

CREATE OR REPLACE FUNCTION public.mm_suno_veille_reserver(p_liberer boolean DEFAULT false)
RETURNS boolean
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_liberer THEN
    UPDATE public.mm_suno_solde_config SET veille_alerte_at = NULL WHERE id = 1;
    RETURN false;
  END IF;

  UPDATE public.mm_suno_solde_config
     SET veille_alerte_at = now()
   WHERE id = 1
     AND (veille_alerte_at IS NULL OR veille_alerte_at < now() - interval '23 hours');
  RETURN FOUND;
END;
$$;

COMMENT ON FUNCTION public.mm_suno_veille_reserver(boolean) IS
  'Veille de la surveillance Suno : réserve l''envoi d''une alerte (vrai au plus une fois par 23 h) ou rend la réservation. Service_role seulement.';

REVOKE ALL ON FUNCTION public.mm_suno_veille_reserver(boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mm_suno_veille_reserver(boolean) TO service_role;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RAISE NOTICE 'pg_cron absent : tâche mm-suno-solde-veille non créée';
    RETURN;
  END IF;

  PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'mm-suno-solde-veille';

  PERFORM cron.schedule(
    'mm-suno-solde-veille',
    '47 */2 * * *',
    $cmd$
  SELECT net.http_post(
    url := 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/mm-suno-veille',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $cmd$
  );
END;
$$;

NOTIFY pgrst, 'reload schema';
