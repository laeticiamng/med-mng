-- ============================================================================
-- ai_generated_content : lecture réservée aux administrateurs (10.10.2026, base partagée)
-- ============================================================================
-- CONSTAT : la politique « ai_generated_content_read_authenticated » (créée par
-- emotionscare 20260915150000_close_anonymous_reads_lot1, qui avait remplacé une lecture
-- publique) laissait TOUT compte connecté — y compris un compte gratuit Med MNG créé en
-- libre inscription — lire toute la table : contenus « edn-premium », « ecos-premium »,
-- « docflamme-premium », fiches médicales générées et un questionnaire de santé
-- (« biovida-plus », données personnelles d'une autre application de la base partagée).
--
-- Lecteurs légitimes (vérifiés le 10.10.2026) :
--  - fonction ai-content (Med MNG) : clé de service → politique « Service role manages
--    ai_generated_content », inchangée ;
--  - src/components/admin/AdminAnalytics.tsx (Med MNG) : page administrateur, JWT de
--    l'administrateur → conservé par la nouvelle condition ;
--  - aucune autre lecture dans les journaux de l'API (24 h) ni dans le code d'EmotionsCare,
--    learn-jams ou medcopilote-suisse (le dépôt EmotionsCare ne la cite que dans ses docs et
--    migrations).
--
-- Correction minimale : la même politique, mais limitée aux administrateurs (has_role,
-- SECURITY DEFINER, non modifiée), auth.uid() en initplan. Aucune donnée supprimée,
-- aucun droit d'écriture ajouté (aucune politique INSERT/UPDATE/DELETE pour anon/authenticated).
-- ============================================================================

alter policy "ai_generated_content_read_authenticated" on public.ai_generated_content
  using ((select public.has_role((select auth.uid()), 'admin'::public.app_role)));

alter policy "ai_generated_content_read_authenticated" on public.ai_generated_content
  rename to "ai_generated_content_read_admin";

comment on policy "ai_generated_content_read_admin" on public.ai_generated_content is
  'Lecture réservée aux administrateurs (Med MNG, 10.10.2026) ; la fonction ai-content passe par la clé de service.';

-- Vérification en fin de migration : plus aucune politique permissive « true » pour les
-- rôles de l'API sur cette table.
do $$
declare
  restant text;
begin
  select string_agg(policyname, ', ') into restant
  from pg_policies
  where schemaname = 'public' and tablename = 'ai_generated_content'
    and cmd in ('SELECT', 'ALL')
    and (roles && array['authenticated', 'anon', 'public']::name[])
    and coalesce(qual, 'true') = 'true';
  if restant is not null then
    raise exception 'ai_generated_content encore lisible par tout compte : %', restant;
  end if;
end
$$;
