-- ============================================================================
-- MED MNG — Quiz de mémorisation : distribution SERVEUR des questions
-- ============================================================================
-- STATUT : préparée, NON APPLIQUÉE. Aucune question n'est insérée par cette migration
-- (voir scripts/quiz-memorisation/README.md pour le semis, après décision).
--
-- OBJECTIF : les questions du quiz de mémorisation ne doivent jamais voyager dans le
-- JavaScript public (celles des items Premium en particulier). Elles vivent dans une
-- table fermée et ne sortent que par la RPC mm_quiz_memorisation_item(), qui applique
-- la MÊME règle que mm_contenu_immersif_item() : item d'essai (mm_item_gratuit),
-- abonné Premium ou administrateur (mm_a_acces_premium), d'après le JWT de l'appelant.
--
-- GARDE-FOUS
--  1. Table fermée : RLS activée, aucun droit pour anon / authenticated.
--  2. Statuts affichables fixés CÔTÉ SERVEUR : par défaut seul « valide_expert ».
--     Le mode pilote (conforme_referentiel, verifie_source_externe) ne s'active que par
--     mm_quiz_memorisation_config.pilote = true (service_role). « bloque » et « brouillon »
--     ne sont jamais servis.
--  3. « valide_expert » ne s'obtient QUE par mm_quiz_memorisation_enregistrer_validation()
--     (administrateur ou service_role), qui exige l'identité et la qualité du relecteur, les
--     sources vérifiées, et le hash EXACT du contenu relu. Le trigger n'accepte la promotion que
--     (a) exécutée avec les droits du PROPRIÉTAIRE de cette fonction (current_user, non
--     falsifiable par une session service_role : pas de paramètre de session) ET (b) si le
--     registre contient une décision « valide » portant le hash courant. Le registre n'est
--     inscriptible que par cette fonction (aucun INSERT direct pour service_role).
--     Toute modification du contenu d'une question validée la repasse en « bloque ».
--  4. Registre de validation : table append-only (ni UPDATE ni DELETE).
--  5. Aucune justification ni source interne n'est renvoyée par la RPC.
--
-- RETOUR ARRIÈRE :
--   DROP FUNCTION public.mm_quiz_memorisation_item(text);
--   DROP FUNCTION public.mm_quiz_memorisation_enregistrer_validation(text, text, text, text, text, text, text);
--   DROP FUNCTION public.mm_quiz_memorisation_statuts();
--   DROP TABLE public.mm_quiz_memorisation_validations, public.mm_quiz_memorisation_config,
--              public.mm_quiz_memorisation_questions;
--   (plus les fonctions de trigger mm_qm_*)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Questions (contenu + traçabilité interne)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mm_quiz_memorisation_questions (
  id            TEXT PRIMARY KEY CHECK (id ~ '^M[0-9]+-[AB][0-9]+$'),
  item_code     TEXT NOT NULL CHECK (item_code ~ '^IC-[0-9]+$'),
  rang          TEXT NOT NULL CHECK (rang IN ('A', 'B')),
  objectif_id   TEXT NOT NULL CHECK (objectif_id ~ '^OIC-[0-9]{3}-[0-9]{2}-[AB]$'),
  type          TEXT NOT NULL CHECK (type IN ('qcm', 'rappel')),
  question      TEXT NOT NULL CHECK (length(btrim(question)) > 0),
  options       JSONB,
  index_correct SMALLINT,
  reponse       TEXT,
  explication   TEXT NOT NULL CHECK (length(btrim(explication)) > 0),
  statut        TEXT NOT NULL DEFAULT 'brouillon'
                CHECK (statut IN ('brouillon', 'conforme_referentiel', 'verifie_source_externe', 'valide_expert', 'bloque')),
  -- extrait du référentiel, sources, justification, motif de blocage : jamais renvoyés au client.
  tracabilite   JSONB NOT NULL DEFAULT '{}'::JSONB,
  contenu_hash  TEXT NOT NULL DEFAULT '',
  ordre         INTEGER NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT mm_qm_forme CHECK (
    (type = 'qcm'
       AND jsonb_typeof(options) = 'array' AND jsonb_array_length(options) = 4
       AND index_correct BETWEEN 0 AND 3 AND reponse IS NULL)
    OR
    (type = 'rappel'
       AND options IS NULL AND index_correct IS NULL
       AND reponse IS NOT NULL AND length(btrim(reponse)) > 0)
  )
);

CREATE INDEX IF NOT EXISTS mm_qm_questions_item_idx
  ON public.mm_quiz_memorisation_questions (item_code, rang, ordre, id);

ALTER TABLE public.mm_quiz_memorisation_questions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mm_quiz_memorisation_questions FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.mm_quiz_memorisation_questions TO service_role;

-- Hash du contenu AFFICHÉ (ce que le relecteur lit), calculé côté serveur.
CREATE OR REPLACE FUNCTION public.mm_qm_calculer_hash()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_ancien TEXT := CASE WHEN TG_OP = 'UPDATE' THEN OLD.contenu_hash END;
BEGIN
  NEW.contenu_hash := md5(
    coalesce(NEW.question, '') || E'\x1f' || coalesce(NEW.options::TEXT, '') || E'\x1f' ||
    coalesce(NEW.index_correct::TEXT, '') || E'\x1f' || coalesce(NEW.reponse, '') || E'\x1f' ||
    coalesce(NEW.explication, '')
  );
  NEW.updated_at := now();

  -- « valide_expert » : seulement par la fonction d'enregistrement d'une validation. Contrôle
  -- structurel, sans paramètre de session falsifiable :
  --  (a) le trigger s'exécute avec les droits du propriétaire de la fonction (SECURITY DEFINER) ;
  --  (b) le registre contient une décision « valide » pour ce hash exact.
  IF NEW.statut = 'valide_expert' THEN
    IF TG_OP = 'INSERT' OR OLD.statut IS DISTINCT FROM 'valide_expert' THEN
      IF current_user IS DISTINCT FROM (
           SELECT pg_get_userbyid(p.proowner) FROM pg_proc p
            WHERE p.oid = 'public.mm_quiz_memorisation_enregistrer_validation(text, text, text, text, text, text, text)'::regprocedure)
         OR NOT EXISTS (
           SELECT 1 FROM public.mm_quiz_memorisation_validations v
            WHERE v.question_id = NEW.id AND v.decision = 'valide' AND v.contenu_hash = NEW.contenu_hash) THEN
        RAISE EXCEPTION 'valide_expert ne peut être attribué que par mm_quiz_memorisation_enregistrer_validation()'
          USING ERRCODE = '42501';
      END IF;
    ELSIF NEW.contenu_hash IS DISTINCT FROM v_ancien THEN
      -- Déjà validée : toute modification du contenu annule la validation.
      NEW.statut := 'bloque';
      NEW.tracabilite := jsonb_set(coalesce(NEW.tracabilite, '{}'::JSONB), '{motifBlocage}',
        to_jsonb('Contenu modifié après validation : nouvelle relecture médicale requise.'::TEXT));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS mm_qm_questions_hash ON public.mm_quiz_memorisation_questions;
CREATE TRIGGER mm_qm_questions_hash
  BEFORE INSERT OR UPDATE ON public.mm_quiz_memorisation_questions
  FOR EACH ROW EXECUTE FUNCTION public.mm_qm_calculer_hash();

-- ---------------------------------------------------------------------------
-- 2. Configuration (une seule ligne) : le mode pilote est ÉTEINT par défaut
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mm_quiz_memorisation_config (
  id         BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
  pilote     BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.mm_quiz_memorisation_config (id, pilote) VALUES (TRUE, FALSE) ON CONFLICT (id) DO NOTHING;
ALTER TABLE public.mm_quiz_memorisation_config ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mm_quiz_memorisation_config FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.mm_quiz_memorisation_config TO service_role;

CREATE OR REPLACE FUNCTION public.mm_quiz_memorisation_statuts()
RETURNS TEXT[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE WHEN coalesce((SELECT pilote FROM public.mm_quiz_memorisation_config WHERE id), FALSE)
              THEN ARRAY['conforme_referentiel', 'verifie_source_externe', 'valide_expert']
              ELSE ARRAY['valide_expert'] END;
$$;
REVOKE ALL ON FUNCTION public.mm_quiz_memorisation_statuts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mm_quiz_memorisation_statuts() TO service_role;

-- ---------------------------------------------------------------------------
-- 3. Registre de validation médicale (append-only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mm_quiz_memorisation_validations (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id        TEXT NOT NULL REFERENCES public.mm_quiz_memorisation_questions (id),
  contenu_hash       TEXT NOT NULL,
  decision           TEXT NOT NULL CHECK (decision IN ('valide', 'a_corriger', 'refuse')),
  relecteur_nom      TEXT NOT NULL CHECK (length(btrim(relecteur_nom)) > 1),
  relecteur_qualite  TEXT NOT NULL CHECK (length(btrim(relecteur_qualite)) > 1),
  sources_verifiees  TEXT NOT NULL CHECK (length(btrim(sources_verifiees)) > 1),
  commentaire        TEXT,
  enregistre_par     UUID,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mm_qm_validations_question_idx
  ON public.mm_quiz_memorisation_validations (question_id, created_at DESC);

ALTER TABLE public.mm_quiz_memorisation_validations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mm_quiz_memorisation_validations FROM PUBLIC, anon, authenticated;
-- Lecture seule : seule mm_quiz_memorisation_enregistrer_validation() (propriétaire) y écrit.
GRANT SELECT ON public.mm_quiz_memorisation_validations TO service_role;

CREATE OR REPLACE FUNCTION public.mm_qm_validations_append_only()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Le registre de validation est en ajout seul (ni modification ni suppression)' USING ERRCODE = '42501';
END;
$$;
DROP TRIGGER IF EXISTS mm_qm_validations_immuable ON public.mm_quiz_memorisation_validations;
CREATE TRIGGER mm_qm_validations_immuable
  BEFORE UPDATE OR DELETE ON public.mm_quiz_memorisation_validations
  FOR EACH ROW EXECUTE FUNCTION public.mm_qm_validations_append_only();

-- Enregistre la décision d'un relecteur HUMAIN sur le contenu exact qu'il a lu.
CREATE OR REPLACE FUNCTION public.mm_quiz_memorisation_enregistrer_validation(
  p_question_id       TEXT,
  p_decision          TEXT,
  p_relecteur_nom     TEXT,
  p_relecteur_qualite TEXT,
  p_sources_verifiees TEXT,
  p_commentaire       TEXT,
  p_contenu_hash      TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_q public.mm_quiz_memorisation_questions%ROWTYPE;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role'
     AND NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role::TEXT = 'admin') THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_q FROM public.mm_quiz_memorisation_questions WHERE id = p_question_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Question inconnue : %', p_question_id USING ERRCODE = 'P0002';
  END IF;
  IF p_contenu_hash IS DISTINCT FROM v_q.contenu_hash THEN
    RAISE EXCEPTION 'Le contenu a changé depuis la relecture (hash différent) : relire la version actuelle' USING ERRCODE = '22023';
  END IF;
  IF v_q.statut = 'bloque' AND p_decision = 'valide' THEN
    RAISE EXCEPTION 'Question bloquée : lever d''abord le blocage (source lue, statut reclassé) avant de la valider' USING ERRCODE = '22023';
  END IF;

  -- Les contrôles d'identité sont portés par les CHECK de la table (nom, qualité, sources).
  INSERT INTO public.mm_quiz_memorisation_validations
    (question_id, contenu_hash, decision, relecteur_nom, relecteur_qualite, sources_verifiees, commentaire, enregistre_par)
  VALUES
    (p_question_id, v_q.contenu_hash, p_decision, p_relecteur_nom, p_relecteur_qualite, p_sources_verifiees, p_commentaire, auth.uid());

  IF p_decision = 'valide' THEN
    UPDATE public.mm_quiz_memorisation_questions SET statut = 'valide_expert' WHERE id = p_question_id;
  ELSE
    -- « a_corriger » et « refuse » : la question cesse d'être servie, même si elle était validée.
    UPDATE public.mm_quiz_memorisation_questions
       SET statut = 'bloque',
           tracabilite = jsonb_set(tracabilite, '{motifBlocage}', to_jsonb(
             CASE WHEN p_decision = 'refuse' THEN 'Refusée par le relecteur : ' ELSE 'À corriger selon le relecteur : ' END
             || coalesce(nullif(btrim(p_commentaire), ''), 'voir le registre')))
     WHERE id = p_question_id;
  END IF;

  RETURN jsonb_build_object('question_id', p_question_id, 'decision', p_decision,
                            'statut', (SELECT statut FROM public.mm_quiz_memorisation_questions WHERE id = p_question_id));
END;
$$;
REVOKE ALL ON FUNCTION public.mm_quiz_memorisation_enregistrer_validation(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mm_quiz_memorisation_enregistrer_validation(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 4. RPC de distribution : même règle d'accès que mm_contenu_immersif_item
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.mm_quiz_memorisation_item(p_item_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code     TEXT := public.mm_normaliser_code_item(p_item_code);
  v_statuts  TEXT[] := public.mm_quiz_memorisation_statuts();
  v_questions JSONB;
BEGIN
  -- Item d'essai, sinon abonné Premium / administrateur : jamais d'erreur, seulement « verrouillé ».
  IF NOT public.mm_item_gratuit(v_code) THEN
    IF NOT public.mm_a_acces_premium(auth.uid()) THEN
      RETURN jsonb_build_object('item_code', v_code, 'verrouille', TRUE);
    END IF;
  END IF;

  SELECT coalesce(jsonb_agg(jsonb_build_object(
           'id', q.id, 'rang', q.rang, 'type', q.type, 'question', q.question,
           'options', q.options, 'index_correct', q.index_correct, 'reponse', q.reponse,
           'explication', q.explication, 'objectif_id', q.objectif_id, 'statut', q.statut
         ) ORDER BY q.rang, q.ordre, q.id), '[]'::JSONB)
    INTO v_questions
    FROM public.mm_quiz_memorisation_questions q
   WHERE q.item_code = v_code AND q.statut = ANY (v_statuts);

  RETURN jsonb_build_object(
    'item_code', v_code,
    'verrouille', FALSE,
    'pilote', NOT (v_statuts = ARRAY['valide_expert']),
    'questions', v_questions
  );
END;
$$;
COMMENT ON FUNCTION public.mm_quiz_memorisation_item(TEXT) IS
'MED MNG : questions de mémorisation d''un item si l''item est un item d''essai ou si l''appelant (JWT) a accès Premium ; sinon {verrouille: true}. Statuts servis fixés côté serveur (par défaut valide_expert seulement).';
REVOKE ALL ON FUNCTION public.mm_quiz_memorisation_item(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mm_quiz_memorisation_item(TEXT) TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
