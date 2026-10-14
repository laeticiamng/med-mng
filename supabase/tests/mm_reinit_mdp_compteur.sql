-- ============================================================================
-- Non-régression MED MNG : compteur atomique des demandes de réinitialisation du mot de passe
-- (migration 20261014140000_mm_compteur_reinit_mdp, fonction Edge mm-password-reset)
-- ============================================================================
-- Transaction annulée : aucune ligne ne reste dans mm_reinit_mdp_compteurs. Un passage complet
-- affiche « mm_reinit_mdp_compteur : OK ».
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/mm_reinit_mdp_compteur.sql
-- ============================================================================

begin;

do $$
declare
  cle_a text := 'mm-mdp-email:test-' || gen_random_uuid()::text;
  cle_b text := 'mm-mdp-ip:test-' || gen_random_uuid()::text;
  r boolean;
  n integer;
  refus boolean;
begin
  -- 1. Trois réservations acceptées, la 4e refusée (limite 3 par heure) ; le compteur s'arrête à 3
  for i in 1..3 loop
    r := public.mm_reserver_reinit_mdp(cle_a, 3, interval '1 hour');
    if r is distinct from true then
      raise exception 'ÉCHEC 1 : la réservation % sur 3 devrait être acceptée (obtenu %)', i, r;
    end if;
  end loop;
  r := public.mm_reserver_reinit_mdp(cle_a, 3, interval '1 hour');
  if r is distinct from false then
    raise exception 'ÉCHEC 1b : la 4e réservation devrait être refusée (obtenu %)', r;
  end if;
  r := public.mm_reserver_reinit_mdp(cle_a, 3, interval '1 hour');
  select nombre into n from public.mm_reinit_mdp_compteurs where cle = cle_a;
  if r is distinct from false or n <> 3 then
    raise exception 'ÉCHEC 1c : refus répété attendu, compteur figé à 3 (obtenu %, compteur %)', r, n;
  end if;

  -- 2. Une autre clé a son propre compteur
  r := public.mm_reserver_reinit_mdp(cle_b, 10, interval '1 hour');
  if r is distinct from true then
    raise exception 'ÉCHEC 2 : une autre clé doit avoir son compteur (obtenu %)', r;
  end if;

  -- 3. Une fenêtre antérieure n'est pas comptée dans la fenêtre courante
  insert into public.mm_reinit_mdp_compteurs (cle, fenetre_debut, nombre)
    values ('mm-mdp-email:test-ancien', now() - interval '3 hours', 3);
  r := public.mm_reserver_reinit_mdp('mm-mdp-email:test-ancien', 3, interval '1 hour');
  if r is distinct from true then
    raise exception 'ÉCHEC 3 : la fenêtre courante doit repartir de zéro (obtenu %)', r;
  end if;

  -- 4. Paramètres invalides refusés
  refus := false;
  begin
    perform public.mm_reserver_reinit_mdp(cle_b, 0, interval '1 hour');
  exception when others then refus := true;
  end;
  if not refus then raise exception 'ÉCHEC 4a : limite 0 acceptée'; end if;
  refus := false;
  begin
    perform public.mm_reserver_reinit_mdp(cle_b, 3, interval '0 seconds');
  exception when others then refus := true;
  end;
  if not refus then raise exception 'ÉCHEC 4b : fenêtre nulle acceptée'; end if;

  -- 5. Droits : exécutable par service_role seulement ; table fermée à anon / authenticated
  if has_function_privilege('anon', 'public.mm_reserver_reinit_mdp(text, integer, interval)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.mm_reserver_reinit_mdp(text, integer, interval)', 'EXECUTE') then
    raise exception 'ÉCHEC 5a : mm_reserver_reinit_mdp exécutable par anon ou authenticated';
  end if;
  if not has_function_privilege('service_role', 'public.mm_reserver_reinit_mdp(text, integer, interval)', 'EXECUTE') then
    raise exception 'ÉCHEC 5b : mm_reserver_reinit_mdp non exécutable par service_role';
  end if;
  if has_table_privilege('anon', 'public.mm_reinit_mdp_compteurs', 'SELECT')
     or has_table_privilege('authenticated', 'public.mm_reinit_mdp_compteurs', 'SELECT')
     or has_table_privilege('anon', 'public.mm_reinit_mdp_compteurs', 'INSERT')
     or has_table_privilege('authenticated', 'public.mm_reinit_mdp_compteurs', 'UPDATE') then
    raise exception 'ÉCHEC 5c : mm_reinit_mdp_compteurs accessible à anon ou authenticated';
  end if;
  if not (select relrowsecurity from pg_class where oid = 'public.mm_reinit_mdp_compteurs'::regclass) then
    raise exception 'ÉCHEC 5d : RLS désactivée sur mm_reinit_mdp_compteurs';
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'mm_reinit_mdp_compteurs') then
    raise exception 'ÉCHEC 5e : une politique RLS existe sur mm_reinit_mdp_compteurs (aucune attendue)';
  end if;
  if not (select prosecdef from pg_proc where oid = 'public.mm_reserver_reinit_mdp(text, integer, interval)'::regprocedure) then
    raise exception 'ÉCHEC 5f : mm_reserver_reinit_mdp n''est pas SECURITY DEFINER';
  end if;

  -- 6. Appel réel sous le rôle anon : refusé
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  set local role anon;
  refus := false;
  begin
    perform public.mm_reserver_reinit_mdp(cle_b, 10, interval '1 hour');
  exception when insufficient_privilege then refus := true;
  end;
  reset role;
  if not refus then raise exception 'ÉCHEC 6 : anon a pu appeler mm_reserver_reinit_mdp'; end if;
end $$;

rollback;

select 'mm_reinit_mdp_compteur : OK' as resultat;
