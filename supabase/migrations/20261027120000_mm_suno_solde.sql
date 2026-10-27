-- ============================================================================
-- Surveillance du solde de crédits sunoapi.org (27.10.2026) — alerte de solde bas
-- ============================================================================
-- CONSTAT : les 22 et 23.10.2026, 25 générations ont été refusées (HTTP 402/429 du fournisseur, affichées
-- « service saturé ») parce que le solde était tombé à 5,6 crédits. Aucune alerte n'existait.
--
-- EFFET (idempotent) :
--   1. public.mm_suno_solde_releves : un relevé par vérification (solde, état, alerte envoyée ou non).
--      RLS activée sans aucune politique ; aucun accès pour anon / authenticated (service_role seulement).
--      Sert aussi à mesurer la consommation réelle de crédits.
--   2. public.mm_suno_alerte_destinataire() : adresse du destinataire de l'alerte, lue dans Vault ('mm_alerte_email'
--      si elle existe, sinon 'devis_notify_email', l'adresse déjà choisie pour les notifications du propriétaire).
--      L'adresse ne figure ni dans le code ni dans ce fichier. EXECUTE réservé à service_role.
--   3. Tâche pg_cron « mm-suno-solde-horaire » (toutes les heures, minute 17) : appelle la fonction Edge
--      mm-suno-solde avec le jeton des tâches planifiées (Vault 'f66_jeton_taches_planifiees', lu à chaque
--      exécution ; la commande enregistrée ne contient jamais le jeton).
--
-- DÉPEND de : la RPC public.f66_verifier_jeton_tache(text) et le secret Vault 'f66_jeton_taches_planifiees'
--   (vague sécurité F66, base partagée avec EmotionsCare). Sans eux, la fonction refuse l'appel (401).
--
-- RETOUR ARRIÈRE :
--   select cron.unschedule('mm-suno-solde-horaire');
--   drop function public.mm_suno_alerte_destinataire();
--   drop table public.mm_suno_solde_releves;
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mm_suno_solde_releves (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  releve_at timestamptz NOT NULL DEFAULT now(),
  credits numeric(10, 1) NOT NULL CHECK (credits >= 0),
  etat text NOT NULL CHECK (etat IN ('ok', 'bas', 'critique')),
  alerte_envoyee boolean NOT NULL DEFAULT false,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb
);

COMMENT ON TABLE public.mm_suno_solde_releves IS
  'Relevés horaires du solde de crédits sunoapi.org (fonction mm-suno-solde). Service_role seulement.';

CREATE INDEX IF NOT EXISTS mm_suno_solde_releves_alerte_idx
  ON public.mm_suno_solde_releves (releve_at DESC) WHERE alerte_envoyee;

ALTER TABLE public.mm_suno_solde_releves ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mm_suno_solde_releves FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.mm_suno_alerte_destinataire()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT s.decrypted_secret
  FROM vault.decrypted_secrets s
  WHERE s.name IN ('mm_alerte_email', 'devis_notify_email')
  ORDER BY (s.name = 'mm_alerte_email') DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.mm_suno_alerte_destinataire() IS
  'Destinataire de l''alerte de solde Suno (Vault : mm_alerte_email, sinon devis_notify_email). Service_role seulement.';

REVOKE ALL ON FUNCTION public.mm_suno_alerte_destinataire() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mm_suno_alerte_destinataire() TO service_role;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RAISE NOTICE 'pg_cron absent : tâche mm-suno-solde-horaire non créée';
    RETURN;
  END IF;

  PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'mm-suno-solde-horaire';

  PERFORM cron.schedule(
    'mm-suno-solde-horaire',
    '17 * * * *',
    $cmd$
  SELECT net.http_post(
    url := 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/mm-suno-solde',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-tache-planifiee', (
        SELECT decrypted_secret FROM vault.decrypted_secrets
        WHERE name = 'f66_jeton_taches_planifiees'
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $cmd$
  );
END
$$;

NOTIFY pgrst, 'reload schema';
