-- MED MNG — fonctions d'abonnement non appelables sans connexion (04.10.2026)
--
-- CONSTAT (vérifié en lecture sur la production) : get_user_subscription,
-- mm_a_acces_premium, check_music_generation_quota et increment_music_usage
-- sont exécutables par le rôle anon. Avec la seule clé publique, n'importe qui
-- obtient l'offre (Premium / Gratuit, statut d'essai) d'un identifiant
-- d'utilisateur connu : get_user_subscription ne filtre que si auth.uid() est
-- renseigné.
--
-- Aucun appel légitime ne se fait sans connexion : le front n'appelle
-- get_user_subscription qu'avec la session de l'utilisateur (useSubscription),
-- mm_contenu_immersif_item (SECURITY DEFINER, reste exécutable par anon pour
-- les items d'essai) appelle mm_a_acces_premium avec les droits de son
-- propriétaire, et les fonctions Edge utilisent la clé de service.
REVOKE EXECUTE ON FUNCTION public.get_user_subscription(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.mm_a_acces_premium(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.check_music_generation_quota(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_subscription(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mm_a_acces_premium(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_music_generation_quota(UUID) TO authenticated, service_role;

-- increment_music_usage : signature vérifiée avant révocation (aucun appel front).
DO $$
DECLARE f RECORD;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS sig
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.proname = 'increment_music_usage'
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', f.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', f.sig);
  END LOOP;
END $$;
