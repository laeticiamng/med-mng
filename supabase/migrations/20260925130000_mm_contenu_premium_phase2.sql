-- ============================================================================
-- MED MNG — Verrouillage serveur du contenu Premium : PHASE 2
-- ============================================================================
-- Suite de 20260924121000_mm_contenu_premium.sql (RPC mm_contenu_immersif_item,
-- déjà appliquée) et de 20260925120000_mm_etat_contenu_immersif.sql (booléens
-- « contenu renseigné », à appliquer AVANT ou EN MÊME TEMPS que ce fichier).
--
-- EFFET
--   Les rôles `anon` (visiteur, clé publique) et `authenticated` (utilisateur
--   connecté, abonné ou non) perdent le droit de lire directement, via l'API
--   REST, les colonnes de contenu Premium :
--     edn_items_complete  : paroles_musicales, paroles_rang_a, paroles_rang_b,
--                           paroles_rang_ab, quiz_questions, payload_v2
--     edn_items_immersive : les mêmes six colonnes + bd_panels, roman_story
--   ainsi que edn_items_complete.backup_data (copie de sauvegarde, jamais lue
--   par l'application, susceptible de contenir une ligne entière).
--   Toutes les autres colonnes restent lisibles (GRANT SELECT par colonne
--   ci-dessous, liste explicite = src/lib/colonnesEdnPubliques.ts).
--
--   Concrètement, après application :
--     - `select=*` ou `select=…,paroles_rang_a,…` sur ces deux tables échoue
--       entièrement (42501 « permission denied for table ») pour anon et
--       authenticated, y compris pour un administrateur (les droits sont par
--       rôle Postgres, pas par utilisateur) ;
--     - le contenu Premium ne s'obtient que par la RPC
--       mm_contenu_immersif_item(p_item_code) — SECURITY DEFINER — qui rend
--       {verrouille:true} sauf item d'essai, abonné Premium actif ou admin ;
--     - `service_role` (Edge Functions avec clé de service, webhooks) n'est
--       pas concerné : son GRANT est réaffirmé explicitement ci-dessous ;
--     - les policies RLS existantes (lecture publique) restent en place ;
--       les privilèges de colonne sont vérifiés AVANT les policies.
--
-- PRÉREQUIS FRONT (fait dans le même commit) : plus aucune requête de src/ ni
-- des Edge Functions utilisant la clé anon ne demande `*` ni une colonne
-- premium sur ces tables ; tout passe par la RPC (src/hooks/
-- useContenuImmersifItem.ts) ou par mm_etat_contenu_immersif (booléens).
-- Le front fonctionne à l'identique avant et après cette migration.
--
-- FONCTIONS / VUES EXISTANTES LISANT CES TABLES (audit de supabase/migrations)
--   - Toutes les fonctions qui les lisent sont SECURITY DEFINER (fix_*,
--     fusion_*, audit_*, get_audit_summary, calculate_item_completeness_score,
--     run_automated_completeness_audit, mm_contenu_immersif_item…) : elles
--     s'exécutent avec les droits de leur propriétaire, non concernées.
--   - SECURITY INVOKER : check_edn_item_completeness(text) ne lit que
--     item_code, title, tableau_rang_a/b (colonnes conservées) ;
--     generate_structured_lyrics_for_item(text) lit paroles_* — elle n'est
--     appelée par aucun écran ni aucune Edge Function ; elle échouera (42501)
--     si un rôle anon/authenticated l'invoque, ce qui est le comportement
--     voulu. Les triggers (update_competences_counters,
--     update_edn_items_complete_updated_at) ne font que des écritures.
--   - Vues : aucune vue vivante ne référence ces tables (audit_summary a été
--     remplacée par la fonction get_audit_summary, SECURITY DEFINER).
--
-- IDEMPOTENCE : REVOKE / GRANT sont rejouables sans effet de bord.
--
-- RETOUR ARRIÈRE (rétablit la lecture complète, comme avant) :
--   GRANT SELECT ON public.edn_items_complete  TO anon, authenticated;
--   GRANT SELECT ON public.edn_items_immersive TO anon, authenticated;
-- (le front, qui ne lit plus les colonnes premium, continue de fonctionner.)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- edn_items_complete
-- ---------------------------------------------------------------------------
REVOKE SELECT ON public.edn_items_complete FROM PUBLIC, anon, authenticated;
-- Au cas où des privilèges de colonne auraient été accordés séparément.
REVOKE SELECT (
  paroles_musicales, paroles_rang_a, paroles_rang_b, paroles_rang_ab,
  quiz_questions, payload_v2, backup_data
) ON public.edn_items_complete FROM PUBLIC, anon, authenticated;

GRANT SELECT (
  id, item_code, title, subtitle, slug, pitch_intro,
  specialite, domaine_medical, niveau_complexite, mots_cles, tags_medicaux, status,
  competences_count_rang_a, competences_count_rang_b, competences_count_total,
  competences_oic_rang_a, competences_oic_rang_b,
  tableau_rang_a, tableau_rang_b, scene_immersive, interaction_config, reward_messages,
  audio_ambiance, visual_ambiance,
  completeness_score, is_validated, validation_status, validation_date, validation_sources,
  last_audit_date, migration_notes,
  reviewer_1_id, reviewer_1_date, reviewer_1_notes,
  reviewer_2_id, reviewer_2_date, reviewer_2_notes,
  created_at, updated_at
) ON public.edn_items_complete TO anon, authenticated;

GRANT SELECT ON public.edn_items_complete TO service_role;

-- ---------------------------------------------------------------------------
-- edn_items_immersive
-- ---------------------------------------------------------------------------
REVOKE SELECT ON public.edn_items_immersive FROM PUBLIC, anon, authenticated;
REVOKE SELECT (
  paroles_musicales, paroles_rang_a, paroles_rang_b, paroles_rang_ab,
  quiz_questions, payload_v2, bd_panels, roman_story
) ON public.edn_items_immersive FROM PUBLIC, anon, authenticated;

GRANT SELECT (
  id, item_code, title, subtitle, slug, pitch_intro, specialite, mots_cles,
  competences_count_rang_a, competences_count_rang_b, competences_count_total,
  competences_oic_rang_a, competences_oic_rang_b,
  tableau_rang_a, tableau_rang_b, scene_immersive, interaction_config, reward_messages,
  audio_ambiance, visual_ambiance,
  created_at, updated_at
) ON public.edn_items_immersive TO anon, authenticated;

GRANT SELECT ON public.edn_items_immersive TO service_role;

-- ---------------------------------------------------------------------------
-- Garde-fou : la RPC de contenu et celle des booléens restent exécutables.
-- ---------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.mm_contenu_immersif_item(TEXT) TO anon, authenticated, service_role;

COMMENT ON TABLE public.edn_items_complete IS
'MED MNG : colonnes paroles_*, quiz_questions, payload_v2 (et backup_data) non lisibles par anon/authenticated depuis la phase 2 (20260925130000) — contenu Premium servi par la RPC mm_contenu_immersif_item.';
COMMENT ON TABLE public.edn_items_immersive IS
'MED MNG : colonnes paroles_*, quiz_questions, payload_v2, bd_panels, roman_story non lisibles par anon/authenticated depuis la phase 2 (20260925130000) — contenu Premium servi par la RPC mm_contenu_immersif_item.';

-- PostgREST recharge son cache de schéma (les événements DDL de Supabase le
-- font déjà ; ceci ne coûte rien).
NOTIFY pgrst, 'reload schema';
