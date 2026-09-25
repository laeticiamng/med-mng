CREATE OR REPLACE FUNCTION public.mm_items_gratuits()
RETURNS TEXT[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT ARRAY['IC-1','IC-2','IC-3','IC-4','IC-5','IC-6','IC-7','IC-8','IC-9','IC-10']::TEXT[];
$$;

CREATE OR REPLACE FUNCTION public.mm_normaliser_code_item(p_code TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_code ~* '^\s*ic-?0*[0-9]+\s*$'
      THEN 'IC-' || (regexp_replace(p_code, '[^0-9]', '', 'g'))::INTEGER::TEXT
    ELSE upper(trim(p_code))
  END;
$$;

CREATE OR REPLACE FUNCTION public.mm_item_gratuit(p_item_code TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT public.mm_normaliser_code_item(p_item_code) = ANY (public.mm_items_gratuits());
$$;

CREATE OR REPLACE FUNCTION public.mm_a_acces_premium(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p_user_id IS NOT NULL AND (
    EXISTS (
      SELECT 1
        FROM public.user_subscriptions us
       WHERE us.user_id = p_user_id
         AND us.status IN ('active', 'trialing')
         AND (us.current_period_end IS NULL OR us.current_period_end > now())
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
       WHERE ur.user_id = p_user_id AND ur.role::TEXT = 'admin'
    )
  );
$$;

COMMENT ON FUNCTION public.mm_a_acces_premium(UUID) IS
'MED MNG : true si l''utilisateur a un abonnement Premium actif (active/trialing, période non échue) ou est administrateur.';

REVOKE ALL ON FUNCTION public.mm_a_acces_premium(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mm_a_acces_premium(UUID) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.mm_contenu_immersif_item(p_item_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT := public.mm_normaliser_code_item(p_item_code);
  v_complete RECORD;
  v_immersive RECORD;
BEGIN
  IF NOT (public.mm_item_gratuit(v_code) OR public.mm_a_acces_premium(auth.uid())) THEN
    RETURN jsonb_build_object('item_code', v_code, 'verrouille', TRUE);
  END IF;

  SELECT c.paroles_musicales, c.paroles_rang_a, c.paroles_rang_b, c.paroles_rang_ab,
         c.quiz_questions, c.payload_v2
    INTO v_complete
    FROM public.edn_items_complete c
   WHERE c.item_code = v_code
   LIMIT 1;

  SELECT i.bd_panels, i.roman_story
    INTO v_immersive
    FROM public.edn_items_immersive i
   WHERE i.item_code = v_code
   LIMIT 1;

  RETURN jsonb_build_object(
    'item_code', v_code,
    'verrouille', FALSE,
    'paroles_musicales', to_jsonb(v_complete.paroles_musicales),
    'paroles_rang_a', to_jsonb(v_complete.paroles_rang_a),
    'paroles_rang_b', to_jsonb(v_complete.paroles_rang_b),
    'paroles_rang_ab', to_jsonb(v_complete.paroles_rang_ab),
    'quiz_questions', v_complete.quiz_questions,
    'payload_v2', v_complete.payload_v2,
    'bd_panels', v_immersive.bd_panels,
    'roman_story', v_immersive.roman_story
  );
END;
$$;

COMMENT ON FUNCTION public.mm_contenu_immersif_item(TEXT) IS
'MED MNG : paroles, quiz, planches et récit d''un item si l''item est un item d''essai ou si l''appelant (JWT) a accès Premium ; sinon {verrouille: true}.';

REVOKE ALL ON FUNCTION public.mm_contenu_immersif_item(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mm_contenu_immersif_item(TEXT) TO anon, authenticated, service_role;