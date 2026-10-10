-- ============================================================================
-- Non-régression MED MNG sur la base partagée : essai gratuit, contenu Premium, droits SQL
-- (migrations 20261009150134 [emotionscare, A19 bis], 20261009190700_mm_securite_definer_et_initplan ;
--  points 5 et 6 ajoutés le 10.10.2026 : verrouillage des 357 items Premium, rang B des items d'essai)
-- ============================================================================
-- Lecture seule, transaction annulée. Un passage complet affiche « securite_essai_gratuit : OK ».
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/securite_essai_gratuit.sql
-- Test complet de la base partagée : emotionscare/supabase/tests/securite_definer.sql.
-- ============================================================================

begin;

do $$
declare
  restant text;
  n int;
  premier text;
  contenu jsonb;
begin
  -- 1. Essai gratuit : appelable sans compte, 10 items, contenu déverrouillé
  select string_agg(fn, ', ') into restant
  from unnest(array['public.mm_items_gratuits()', 'public.mm_contenu_immersif_item(text)',
                    'public.mm_etat_contenu_immersif()']) fn
  where to_regprocedure(fn) is null
     or not has_function_privilege('anon', to_regprocedure(fn), 'EXECUTE');
  if restant is not null then
    raise exception 'ÉCHEC 1 : essai gratuit inaccessible à anon : %', restant;
  end if;

  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  set local role anon;
  select coalesce(array_length(public.mm_items_gratuits(), 1), 0), (public.mm_items_gratuits())[1]
    into n, premier;
  contenu := public.mm_contenu_immersif_item(premier);
  reset role;
  if n <> 10 then
    raise exception 'ÉCHEC 1b : mm_items_gratuits() renvoie % items au lieu de 10', n;
  end if;
  if coalesce((contenu ->> 'verrouille')::boolean, true) then
    raise exception 'ÉCHEC 1c : item gratuit % verrouillé pour anon', premier;
  end if;

  -- 2. Colonnes Premium de edn_items_immersive : jamais accordées directement
  if has_column_privilege('anon', 'public.edn_items_immersive', 'bd_panels', 'SELECT')
     or has_column_privilege('authenticated', 'public.edn_items_immersive', 'bd_panels', 'SELECT')
     or has_column_privilege('anon', 'public.edn_items_immersive', 'roman_story', 'SELECT')
     or has_column_privilege('authenticated', 'public.edn_items_immersive', 'roman_story', 'SELECT') then
    raise exception 'ÉCHEC 2 : colonnes Premium de edn_items_immersive accordées';
  end if;

  -- 3. Fonctions MED MNG : plus d'accès anonyme, accès connecté conservé (musique comprise)
  select string_agg(p.oid::regprocedure::text, ', ') into restant
  from pg_proc p
  where p.pronamespace = 'public'::regnamespace and p.prosecdef
    and (p.proname ~ '^med_mng_' or p.proname = 'secure_generate_music')
    and has_function_privilege('anon', p.oid, 'EXECUTE');
  if restant is not null then
    raise exception 'ÉCHEC 3 : fonctions MED MNG exécutables par anon : %', restant;
  end if;

  select string_agg(fn, ', ') into restant
  from unnest(array['public.secure_generate_music(text,text,text[],text)',
                    'public.med_mng_get_remaining_quota()', 'public.med_mng_decrement_quota(integer)',
                    'public.med_mng_toggle_like(uuid)', 'public.med_mng_create_playlist(text,text,boolean)']) fn
  where to_regprocedure(fn) is not null
    and not has_function_privilege('authenticated', to_regprocedure(fn), 'EXECUTE');
  if restant is not null then
    raise exception 'ÉCHEC 3b : un compte connecté a perdu le droit : %', restant;
  end if;

  -- 4. Politiques des tables MED MNG : auth.<fn>() évalué une fois par requête
  select string_agg(tablename || '.' || policyname, ', ') into restant
  from pg_policies
  where schemaname = 'public'
    and (tablename ~ '^(mm_|med_mng_)' or tablename ~ 'edn')
    and regexp_replace(coalesce(qual, '') || ' ' || coalesce(with_check, ''),
          '\( SELECT auth\.(uid|role|jwt|email)\(\) AS (uid|role|jwt|email)\)', '', 'g')
        ~ 'auth\.(uid|role|jwt|email)\(\)';
  if restant is not null then
    raise exception 'ÉCHEC 4 : auth.<fn>() réévalué par ligne : %', restant;
  end if;

  -- 5. Compte connecté SANS abonnement : 357 des 367 items actifs verrouillés (10 d'essai
  --    ouverts) ; colonnes Premium de edn_items_complete jamais accordées directement
  --    (vérifié en production le 10.10.2026 : 367 actifs, 357 verrouillés).
  if has_column_privilege('authenticated', 'public.edn_items_complete', 'paroles_rang_b', 'SELECT')
     or has_column_privilege('authenticated', 'public.edn_items_complete', 'paroles_rang_a', 'SELECT')
     or has_column_privilege('authenticated', 'public.edn_items_complete', 'paroles_musicales', 'SELECT')
     or has_column_privilege('authenticated', 'public.edn_items_complete', 'quiz_questions', 'SELECT')
     or has_column_privilege('authenticated', 'public.edn_items_complete', 'payload_v2', 'SELECT')
     or has_column_privilege('anon', 'public.edn_items_complete', 'paroles_rang_b', 'SELECT') then
    raise exception 'ÉCHEC 5 : colonnes Premium de edn_items_complete accordées';
  end if;

  declare
    total int := 0;
    verrouilles int := 0;
    code text;
  begin
    perform set_config('request.jwt.claims',
      json_build_object('role', 'authenticated', 'sub', gen_random_uuid())::text, true);
    set local role authenticated;
    for code in select c.item_code from public.edn_items_complete c where c.status = 'active' loop
      total := total + 1;
      if coalesce((public.mm_contenu_immersif_item(code) ->> 'verrouille')::boolean, false) then
        verrouilles := verrouilles + 1;
      end if;
    end loop;
    reset role;
    if total - verrouilles <> 10 then
      raise exception 'ÉCHEC 5b : % item(s) ouverts sur % pour un compte sans abonnement (attendu : 10)',
        total - verrouilles, total;
    end if;
  end;

  -- 6. Items d'essai : rang B présent (paroles et compétences) quand le référentiel en compte.
  --    IC-1 n'a aucune compétence de rang B dans le référentiel LiSA (15 de rang A) : exempté.
  select string_agg(c.item_code, ', ') into restant
  from public.edn_items_complete c
  where c.item_code = any (public.mm_items_gratuits())
    and coalesce(c.competences_count_rang_b, 0) > 0
    and coalesce(array_length(c.paroles_rang_b, 1), 0) = 0;
  if restant is not null then
    raise exception 'ÉCHEC 6 : items d''essai sans paroles de rang B : %', restant;
  end if;
end $$;

select 'securite_essai_gratuit : OK' as resultat;

rollback;
