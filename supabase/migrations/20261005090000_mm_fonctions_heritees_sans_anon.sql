-- ============================================================================
-- MED MNG — Fonctions héritées SECURITY DEFINER : plus exécutables par les clés
-- publiques (critique finale, 05.10.2026). À APPLIQUER APRÈS APPROBATION CEO.
-- ============================================================================
-- CONSTAT (advisor « anon_security_definer_function_executable », 31 fonctions
-- Med MNG ; définitions relues en lecture seule) : 7 fonctions SECURITY DEFINER,
-- sans AUCUN appelant dans Med MNG (src/, supabase/functions/) ni dans EmotionsCare
-- (même projet Supabase), restent exécutables par anon et authenticated :
--   - med_mng_refund_credits(uuid, integer)  : crédite N générations à N'IMPORTE
--     QUEL compte (aucun contrôle de l'appelant) — table héritée
--     med_mng_subscriptions, que le quota actuel (mm-generate-music) ne lit plus ;
--   - med_mng_increment_quota(integer)       : un compte se crédite lui-même
--     (même table héritée) ;
--   - med_mng_refresh_monthly_quota()        : recharge (60 à 5 000 crédits) les
--     abonnements hérités arrivés à échéance, pour tous les comptes ;
--   - med_mng_create_activity_log_cleanup_job() : appelle cron.schedule (tâche
--     fixe « med-mng-activity-logs-cleanup ») ;
--   - med_mng_get_activity_stats(timestamptz, timestamptz) et
--     med_mng_get_anonymous_activity_logs(…) : statistiques d'activité agrégées
--     de TOUS les comptes, ouvertes aux visiteurs (aujourd'hui en erreur 42702
--     « activity_type is ambiguous » : aucune fuite constatée, mais une
--     correction de ces fonctions les rendrait lisibles par tous) ;
--   - med_mng_generate_qcm(text, text, integer) : fonction d'une fonctionnalité
--     retirée (DC7).
-- Impact actuel faible (tables héritées, aucune fonction payante concernée),
-- mais aucun de ces droits n'a de raison d'exister.
--
-- EFFET : EXECUTE retiré à PUBLIC, anon et authenticated ; conservé pour
-- service_role. Idempotent (fonction absente : ignorée).
--
-- RETOUR ARRIÈRE (pour une fonction donnée) :
--   GRANT EXECUTE ON FUNCTION public.<fonction>(<arguments>) TO anon, authenticated;
--
-- VÉRIFICATION APRÈS APPLICATION :
--   select has_function_privilege('anon', 'public.med_mng_refund_credits(uuid,integer)', 'execute');  -- false
--   e2e-prod/critique.spec.ts › « fonctions héritées refusées à la clé publique ».
-- ============================================================================

DO $$
DECLARE
  f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.med_mng_refund_credits(uuid, integer)',
    'public.med_mng_increment_quota(integer)',
    'public.med_mng_refresh_monthly_quota()',
    'public.med_mng_create_activity_log_cleanup_job()',
    'public.med_mng_get_activity_stats(timestamp with time zone, timestamp with time zone)',
    'public.med_mng_get_anonymous_activity_logs(timestamp with time zone, timestamp with time zone, text, text, integer, integer)',
    'public.med_mng_generate_qcm(text, text, integer)'
  ]
  LOOP
    IF to_regprocedure(f) IS NOT NULL THEN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', f);
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f);
    ELSE
      RAISE NOTICE 'Fonction absente, ignorée : %', f;
    END IF;
  END LOOP;
END
$$;

NOTIFY pgrst, 'reload schema';
