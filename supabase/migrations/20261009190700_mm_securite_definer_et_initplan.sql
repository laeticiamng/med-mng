-- ============================================================================
-- Objets MED MNG de la base PARTAGÉE : fonctions de trigger SECURITY DEFINER et performance RLS
-- (09.10.2026, projet yaincoxihiqdksxgrsrk)
-- ============================================================================
-- Jumelle des migrations EmotionsCare 20261009190500_ec_definer_requalification.sql et
-- 20261009190600_ec_rls_initplan.sql, qui traitent tout le reste de la base. Ici : objets dont
-- le nom commence par mm_ / med_mng_ ou contient « edn ». Analyse complète :
-- emotionscare/docs/securite/DEFINER_REQUALIFICATION.md (renvoi : docs/SOURCE_DE_VERITE.md).
--
-- A. Fonctions de trigger SECURITY DEFINER (med_mng_decrement_quota, med_mng_handle_new_user,
--    med_mng_trigger_welcome_email, med_mng_update_updated_at, med_mng_delete_old_activity_logs,
--    update_edn_*_updated_at, update_user_edn_progress_updated_at) : EXECUTE retiré à PUBLIC,
--    anon, authenticated. PostgREST ne peut pas les appeler et le déclenchement ne vérifie pas
--    EXECUTE (vérifié le 09.10.2026) : quotas et compteurs musicaux continuent de fonctionner.
-- B. Politiques RLS des tables mm_* / med_mng_* / *edn* : auth.uid() & co. enveloppés dans
--    `(select …)` (alerte auth_rls_initplan), sémantique inchangée, vérifiée en fin de migration.
--
-- Non modifiées : mm_items_gratuits(), mm_contenu_immersif_item(text), mm_etat_contenu_immersif()
-- (essai gratuit, appelées sans compte) ; colonnes Premium de edn_items_immersive (aucun droit
-- anon/authenticated, inchangé).
-- ============================================================================

-- A. Fonctions de trigger
do $$
declare
  f regprocedure;
begin
  for f in
    select p.oid::regprocedure
    from pg_proc p
    where p.pronamespace = 'public'::regnamespace
      and p.prosecdef
      and p.prorettype in ('trigger'::regtype, 'event_trigger'::regtype)
      and (p.proname ~ '^(mm_|med_mng_)' or p.proname ~ 'edn')
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', f);
  end loop;
end $$;

-- B. Politiques RLS (initplan)
create temporary table if not exists _mm_initplan_avant as
select tablename, policyname, qual, with_check
from pg_policies
where schemaname = 'public'
  and (tablename ~ '^(mm_|med_mng_)' or tablename ~ 'edn');

do $$
declare
  r record;
  nq text;
  nw text;
begin
  for r in
    select tablename, policyname, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and (tablename ~ '^(mm_|med_mng_)' or tablename ~ 'edn')
    order by tablename, policyname
  loop
    nq := regexp_replace(regexp_replace(regexp_replace(r.qual,
            '\( SELECT auth\.(uid|role|jwt|email)\(\) AS (uid|role|jwt|email)\)', '@@\1@@', 'g'),
            'auth\.(uid|role|jwt|email)\(\)', '( SELECT auth.\1() AS \1)', 'g'),
            '@@(uid|role|jwt|email)@@', '( SELECT auth.\1() AS \1)', 'g');
    nw := regexp_replace(regexp_replace(regexp_replace(r.with_check,
            '\( SELECT auth\.(uid|role|jwt|email)\(\) AS (uid|role|jwt|email)\)', '@@\1@@', 'g'),
            'auth\.(uid|role|jwt|email)\(\)', '( SELECT auth.\1() AS \1)', 'g'),
            '@@(uid|role|jwt|email)@@', '( SELECT auth.\1() AS \1)', 'g');
    if nq is distinct from r.qual then
      execute format('alter policy %I on public.%I using (%s)', r.policyname, r.tablename, nq);
    end if;
    if nw is distinct from r.with_check then
      execute format('alter policy %I on public.%I with check (%s)', r.policyname, r.tablename, nw);
    end if;
  end loop;
end $$;

-- Vérifications
do $$
declare
  ecart text;
begin
  select string_agg(p.oid::regprocedure::text, ', ') into ecart
  from pg_proc p
  where p.pronamespace = 'public'::regnamespace and p.prosecdef
    and p.prorettype in ('trigger'::regtype, 'event_trigger'::regtype)
    and (p.proname ~ '^(mm_|med_mng_)' or p.proname ~ 'edn')
    and (has_function_privilege('anon', p.oid, 'EXECUTE')
         or has_function_privilege('authenticated', p.oid, 'EXECUTE'));
  if ecart is not null then
    raise exception 'MED MNG : fonctions de trigger encore exécutables : %', ecart;
  end if;

  select string_agg(a.tablename || '.' || a.policyname, ', ') into ecart
  from _mm_initplan_avant a
  join pg_policies p on p.schemaname = 'public' and p.tablename = a.tablename and p.policyname = a.policyname
  where regexp_replace(coalesce(p.qual, ''), '\( SELECT auth\.(uid|role|jwt|email)\(\) AS (uid|role|jwt|email)\)', 'auth.\1()', 'g')
          <> regexp_replace(coalesce(a.qual, ''), '\( SELECT auth\.(uid|role|jwt|email)\(\) AS (uid|role|jwt|email)\)', 'auth.\1()', 'g')
     or regexp_replace(coalesce(p.with_check, ''), '\( SELECT auth\.(uid|role|jwt|email)\(\) AS (uid|role|jwt|email)\)', 'auth.\1()', 'g')
          <> regexp_replace(coalesce(a.with_check, ''), '\( SELECT auth\.(uid|role|jwt|email)\(\) AS (uid|role|jwt|email)\)', 'auth.\1()', 'g');
  if ecart is not null then
    raise exception 'MED MNG initplan : expression modifiée au-delà de l''enveloppe : %', ecart;
  end if;

  select string_agg(fn, ', ') into ecart
  from unnest(array['public.mm_items_gratuits()', 'public.mm_contenu_immersif_item(text)',
                    'public.mm_etat_contenu_immersif()']) fn
  where to_regprocedure(fn) is not null
    and not has_function_privilege('anon', to_regprocedure(fn), 'EXECUTE');
  if ecart is not null then
    raise exception 'MED MNG : essai gratuit cassé, anon ne peut plus appeler : %', ecart;
  end if;
end $$;
