-- ============================================================================
-- Non-régression : ai_generated_content n'est lisible que par les administrateurs
-- (migration 20261010022829_mm_ai_generated_content_admin)
-- ============================================================================
-- Transaction annulée (le rôle admin temporaire éventuel n'est pas conservé). Un passage complet affiche
-- « securite_ai_generated_content : OK ».
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/securite_ai_generated_content.sql
-- ============================================================================

begin;

do $$
declare
  total int;
  vu int;
  admin_id uuid;
  restant text;
begin
  select count(*) into total from public.ai_generated_content;
  -- Table vide : une ligne temporaire (annulée en fin de fichier) pour que les lectures
  -- autorisées (administrateur, clé de service) soient réellement démontrées.
  if total = 0 then
    insert into public.ai_generated_content (identifier, content_type, title, content)
    values ('test-securite', 'test', 'Ligne de test', '{}'::jsonb);
    total := 1;
  end if;

  -- 1. Aucune politique permissive « true » pour les rôles de l'API
  select string_agg(policyname, ', ') into restant
  from pg_policies
  where schemaname = 'public' and tablename = 'ai_generated_content'
    and cmd in ('SELECT', 'ALL')
    and (roles && array['authenticated', 'anon', 'public']::name[])
    and coalesce(qual, 'true') = 'true';
  if restant is not null then
    raise exception 'ÉCHEC 1 : politique permissive restante : %', restant;
  end if;

  -- 2. Compte connecté sans rôle (ex. compte gratuit) : aucune ligne
  perform set_config('request.jwt.claims',
    json_build_object('role', 'authenticated', 'sub', gen_random_uuid())::text, true);
  set local role authenticated;
  select count(*) into vu from public.ai_generated_content;
  reset role;
  if vu <> 0 then
    raise exception 'ÉCHEC 2 : un compte non administrateur lit % ligne(s)', vu;
  end if;

  -- 3. Anonyme : aucune ligne
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  set local role anon;
  select count(*) into vu from public.ai_generated_content;
  reset role;
  if vu <> 0 then
    raise exception 'ÉCHEC 3 : anon lit % ligne(s)', vu;
  end if;

  -- 4. Administrateur (AdminAnalytics) : tout est lisible. Toujours exercé : sans
  --    administrateur existant, un rôle admin temporaire est créé pour un compte existant
  --    (transaction annulée en fin de fichier : rien n'est conservé).
  select ur.user_id into admin_id from public.user_roles ur where ur.role::text = 'admin' limit 1;
  if admin_id is null then
    select u.id into admin_id from auth.users u order by u.created_at limit 1;
    if admin_id is null then
      raise exception 'ÉCHEC 4 : aucun compte pour créer un administrateur temporaire';
    end if;
    insert into public.user_roles (user_id, role) values (admin_id, 'admin');
  end if;
  perform set_config('request.jwt.claims',
    json_build_object('role', 'authenticated', 'sub', admin_id)::text, true);
  set local role authenticated;
  select count(*) into vu from public.ai_generated_content;
  reset role;
  if vu <> total then
    raise exception 'ÉCHEC 4 : un administrateur lit % ligne(s) sur %', vu, total;
  end if;

  -- 5. Clé de service (fonction ai-content) : tout est lisible
  perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
  set local role service_role;
  select count(*) into vu from public.ai_generated_content;
  reset role;
  if vu <> total then
    raise exception 'ÉCHEC 5 : la clé de service lit % ligne(s) sur %', vu, total;
  end if;

  raise notice 'securite_ai_generated_content : OK (% lignes)', total;
end
$$;

rollback;
