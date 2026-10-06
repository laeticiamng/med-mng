-- MED MNG — signalements d'erreur sur le contenu (CF-10, décision CEO du 06.10.2026)
--
-- Décision de la CEO (médecin), option A : mention renforcée sur le récit, les
-- planches et les paroles rédigés par IA, et bouton « Signaler une erreur ».
-- Les signalements sont triés par Claude puis soumis à la CEO.
--
-- Accès client (rôle authenticated) :
--   - INSERT de ses propres signalements, limité aux colonnes item_code,
--     type_contenu, reference, message ; user_id = auth.uid() par défaut et
--     vérifié par la politique ; statut et created_at fixés par le serveur ;
--   - SELECT de ses propres signalements ;
--   - aucune modification ni suppression (aucun privilège, aucune politique).
-- Anti-abus : au plus 20 signalements par compte sur 24 heures glissantes
-- (déclencheur), message de 5 à 2000 caractères, référence de 300 au plus.
-- Migration additive : aucune donnée existante n'est lue ni modifiée.

CREATE TABLE IF NOT EXISTS public.mm_signalements_contenu (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE CASCADE,
  item_code    text        NOT NULL CHECK (item_code ~ '^IC-[0-9]{1,3}$'),
  type_contenu text        NOT NULL CHECK (type_contenu IN ('recit', 'planche', 'paroles', 'competence')),
  reference    text        CHECK (reference IS NULL OR char_length(reference) <= 300),
  message      text        NOT NULL CHECK (char_length(message) BETWEEN 5 AND 2000),
  statut       text        NOT NULL DEFAULT 'nouveau' CHECK (statut IN ('nouveau', 'en_cours', 'traite', 'rejete')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.mm_signalements_contenu IS
'MED MNG : signalements d''erreur des utilisateurs sur le récit, les planches, les paroles ou une compétence (CF-10, décision CEO du 06.10.2026). Écriture client : INSERT de ses propres lignes (4 colonnes) ; lecture : ses propres lignes ; 20 par compte et par 24 h.';

-- Tri par item (file de traitement) et décompte anti-abus par compte.
CREATE INDEX IF NOT EXISTS mm_signalements_contenu_item_date
  ON public.mm_signalements_contenu (item_code, created_at);
CREATE INDEX IF NOT EXISTS mm_signalements_contenu_user_date
  ON public.mm_signalements_contenu (user_id, created_at);

ALTER TABLE public.mm_signalements_contenu ENABLE ROW LEVEL SECURITY;

-- Privilèges : rien pour anon ; pour authenticated, lecture et insertion des
-- seules colonnes saisies par l'utilisateur.
REVOKE ALL ON public.mm_signalements_contenu FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.mm_signalements_contenu TO authenticated;
GRANT INSERT (item_code, type_contenu, reference, message) ON public.mm_signalements_contenu TO authenticated;
GRANT ALL ON public.mm_signalements_contenu TO service_role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public' AND tablename = 'mm_signalements_contenu'
       AND policyname = 'mm_signalements_contenu_insertion_propre'
  ) THEN
    CREATE POLICY mm_signalements_contenu_insertion_propre
      ON public.mm_signalements_contenu FOR INSERT TO authenticated
      WITH CHECK (user_id = (SELECT auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public' AND tablename = 'mm_signalements_contenu'
       AND policyname = 'mm_signalements_contenu_lecture_propre'
  ) THEN
    CREATE POLICY mm_signalements_contenu_lecture_propre
      ON public.mm_signalements_contenu FOR SELECT TO authenticated
      USING (user_id = (SELECT auth.uid()));
  END IF;
END
$$;

-- Limite anti-abus, côté serveur : 20 signalements par compte sur 24 heures.
-- Le verrou consultatif (par compte, le temps de la transaction) empêche de
-- dépasser la limite par des envois simultanés. La fonction s'exécute avec les
-- droits de l'appelant : elle ne compte que les lignes que la RLS lui montre
-- (les siennes). statut et created_at sont fixés ici, quel que soit l'appelant.
CREATE OR REPLACE FUNCTION public.mm_signalements_contenu_avant_insertion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  recents integer;
BEGIN
  IF NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'Signalement refusé : utilisateur non authentifié'
      USING ERRCODE = '42501';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('mm_signalements_contenu:' || NEW.user_id::text, 0)
  );

  SELECT count(*) INTO recents
    FROM public.mm_signalements_contenu s
   WHERE s.user_id = NEW.user_id
     AND s.created_at > pg_catalog.now() - interval '24 hours';

  IF recents >= 20 THEN
    RAISE EXCEPTION 'Limite de 20 signalements par 24 heures atteinte'
      USING ERRCODE = 'P0001', HINT = 'mm_signalements_limite';
  END IF;

  NEW.statut := 'nouveau';
  NEW.created_at := pg_catalog.now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.mm_signalements_contenu_avant_insertion() FROM PUBLIC, anon;

CREATE OR REPLACE TRIGGER mm_signalements_contenu_avant_insertion
  BEFORE INSERT ON public.mm_signalements_contenu
  FOR EACH ROW EXECUTE FUNCTION public.mm_signalements_contenu_avant_insertion();
