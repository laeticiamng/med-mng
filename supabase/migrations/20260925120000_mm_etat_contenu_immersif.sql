-- ============================================================================
-- MED MNG — État du contenu immersif par item (booléens seulement)
-- ============================================================================
-- Préalable à la phase 2 (20260925130000_mm_contenu_premium_phase2.sql), qui
-- retire à anon/authenticated la lecture directe des colonnes premium
-- (paroles_*, quiz_questions, payload_v2, bd_panels, roman_story).
--
-- Deux écrans lisaient ces colonnes pour les 367 items d'un coup, uniquement
-- pour savoir si elles sont renseignées : l'onglet « Statut des paroles » de
-- /edn-complete (src/components/lyrics/LyricsCompletionStatus.tsx) et le
-- gestionnaire de contenu administrateur (src/components/admin/
-- AdminContentManager.tsx). Cette RPC leur rend le même service sans jamais
-- faire sortir une ligne de paroles : elle ne renvoie que des booléens.
--
-- Sans danger à appliquer dès maintenant (SECURITY DEFINER, lecture seule,
-- aucun contenu). Idempotente. Le front tolère son absence (message
-- « statut indisponible ») tant qu'elle n'est pas appliquée.
-- ============================================================================

-- Même règle que parolesSontRedigees() + contientResidusDeBalisage() de
-- src/components/edn/music/utils/parolesFormatter.ts : des paroles sont
-- « rédigées » si une ligne porte un marqueur de structure ([Couplet],
-- [Refrain]…) ou si plus de la moitié des lignes sont ponctuées, et si aucune
-- ligne ne contient de résidu HTML de l'import UNESS (nbsp, &amp;, <br>…).
CREATE OR REPLACE FUNCTION public.mm_paroles_redigees(p_paroles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  WITH lignes AS (
    SELECT l
      FROM unnest(COALESCE(p_paroles, ARRAY[]::TEXT[])) AS l
     WHERE btrim(l) <> ''
  )
  SELECT (SELECT count(*) FROM lignes) > 0
     AND NOT EXISTS (
           SELECT 1 FROM lignes
            WHERE l ~* '\mnbsp\M|&[a-z]+;|&#[0-9]+|<\s*/?\s*(br|p|div|span|li|ul|td|tr)\M'
         )
     AND (
           EXISTS (SELECT 1 FROM lignes WHERE l ~* '\[(couplet|refrain|pont|intro|outro|bridge|verse|chorus)')
        OR (SELECT count(*) FILTER (WHERE l ~ '[.,;:!?…—]')::NUMERIC / count(*) FROM lignes) > 0.5
     );
$$;

COMMENT ON FUNCTION public.mm_paroles_redigees(TEXT[]) IS
'MED MNG : true si les paroles sont réellement rédigées (structure [Couplet]/[Refrain] ou lignes ponctuées) et sans résidu HTML — même règle que le front.';

-- Un booléen par colonne premium et par item. `title` et `updated_at` sont
-- des colonnes publiques, jointes ici pour éviter une seconde requête.
CREATE OR REPLACE FUNCTION public.mm_etat_contenu_immersif()
RETURNS TABLE (
  item_code          TEXT,
  title              TEXT,
  updated_at         TIMESTAMPTZ,
  paroles_musicales  BOOLEAN,
  paroles_rang_a     BOOLEAN,
  paroles_rang_b     BOOLEAN,
  paroles_rang_ab    BOOLEAN,
  quiz               BOOLEAN,
  planches           BOOLEAN,
  recit              BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.item_code,
         c.title,
         c.updated_at,
         public.mm_paroles_redigees(c.paroles_musicales)  AS paroles_musicales,
         public.mm_paroles_redigees(c.paroles_rang_a)     AS paroles_rang_a,
         public.mm_paroles_redigees(c.paroles_rang_b)     AS paroles_rang_b,
         public.mm_paroles_redigees(c.paroles_rang_ab)    AS paroles_rang_ab,
         (c.quiz_questions IS NOT NULL
          AND jsonb_typeof(c.quiz_questions) = 'array'
          AND jsonb_array_length(c.quiz_questions) > 0)   AS quiz,
         (i.bd_panels IS NOT NULL
          AND jsonb_typeof(i.bd_panels) = 'array'
          AND jsonb_array_length(i.bd_panels) > 0)        AS planches,
         (i.roman_story IS NOT NULL
          AND i.roman_story <> 'null'::jsonb
          AND i.roman_story <> '{}'::jsonb
          AND i.roman_story <> '[]'::jsonb)               AS recit
    FROM public.edn_items_complete c
    LEFT JOIN public.edn_items_immersive i ON i.item_code = c.item_code
   ORDER BY c.item_code;
$$;

COMMENT ON FUNCTION public.mm_etat_contenu_immersif() IS
'MED MNG : pour chaque item, des booléens « contenu renseigné » (paroles rédigées par variante, quiz, planches, récit). Aucun contenu premium ne sort ; lisible par tous.';

REVOKE ALL ON FUNCTION public.mm_paroles_redigees(TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mm_paroles_redigees(TEXT[]) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.mm_etat_contenu_immersif() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mm_etat_contenu_immersif() TO anon, authenticated, service_role;
