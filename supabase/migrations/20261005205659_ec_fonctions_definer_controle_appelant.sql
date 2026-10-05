-- ===== EmotionsCare (critère F « Sécurité ») : fonctions SECURITY DEFINER exécutables par
-- `authenticated` — contrôle de l'appelant.
--
-- Projet Supabase PARTAGÉ (EmotionsCare + Med MNG). Inventaire du 05.10.2026 : 67 fonctions
-- SECURITY DEFINER du schéma public exécutables par `authenticated` et non par `anon`.
--   (c) 11 fonctions sans aucun appel servi (src/ et supabase/functions/ des deux dépôts),
--       ni politique RLS, ni vue utilisée, ni appel depuis une fonction SECURITY INVOKER
--       → REVOKE EXECUTE FROM PUBLIC, authenticated (service_role conserve son droit).
--   (b) 28 fonctions qui lisent/écrivent les données d'un autre utilisateur ou des données
--       d'administration sans contrôle → CREATE OR REPLACE avec contrôle de l'appelant,
--       signature, langage de retour, SECURITY DEFINER et search_path inchangés.
--       Contrôle admin : public.has_role(auth.uid(), 'admin'::public.app_role) (déjà employé
--       par count_org_members et les politiques RLS des deux projets).
--       Exemption service_role : même règle que get_user_subscription (appels des fonctions
--       Edge avec la clé de service : notifications-send, generate-audit-pdf, send-cron-alert,
--       security-metrics, mm-garde / generer-paroles-item de Med MNG).
-- Non traitées ici (documentées) : 12 compteurs increment_*/decrement_* (intégrité seulement,
-- pas de paramètre utilisateur), helpers RLS is_*/can_view_* et verified_email (requis par
-- des politiques RLS, donc EXECUTE indispensable pour `authenticated`).
-- Erreur levée : SQLSTATE 42501 (insufficient_privilege) → HTTP 403 côté PostgREST.

-- =====================================================================================
-- (c) Fonctions mortes : retrait du droit d'exécution
-- =====================================================================================
-- decrypt_sensitive_data : déchiffre n'importe quel texte avec n'importe quelle clé de
-- encryption_keys. Seuls consommateurs : vues journal_text_decrypted / journal_voice_decrypted
-- (security_invoker) qu'aucun code servi n'interroge.
REVOKE EXECUTE ON FUNCTION public.decrypt_sensitive_data(text, text) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_or_create_weekly_draw(uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_dashboard_stats(uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_edn_progress_summary(uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_statistics(uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_weekly_summary(uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.mark_notifications_as_read(uuid, uuid[]) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_analytics_opt_in(uuid, boolean, text, integer) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.track_user_activity(uuid, text, jsonb, integer) FROM PUBLIC, authenticated;
-- unlock_story_fragment reste appelée par complete_story_session (SECURITY DEFINER : exécutée
-- avec les droits du propriétaire, non affectée).
REVOKE EXECUTE ON FUNCTION public.unlock_story_fragment(uuid, text) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_aura_from_who5(uuid, integer) FROM PUBLIC, authenticated;

-- =====================================================================================
-- (b) Paramètre utilisateur sans contrôle (IDOR) : l'appelant doit être l'utilisateur visé,
--     un administrateur ou la clé de service.
-- =====================================================================================

-- Med MNG (useAppliedRecommendations) : met à jour applied_recommendations par id sans
-- vérifier le propriétaire.
CREATE OR REPLACE FUNCTION public.calculate_recommendation_impact(rec_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  rec RECORD;
  impact JSONB;
  success_rate_before NUMERIC;
  success_rate_after NUMERIC;
  improvement NUMERIC;
BEGIN
  SELECT * INTO rec FROM public.applied_recommendations WHERE id = rec_id;

  IF FOUND
     AND rec.user_id IS DISTINCT FROM auth.uid()
     AND auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  IF rec.metrics_before IS NULL OR rec.metrics_after IS NULL THEN
    RETURN '{"error": "Missing metrics"}'::JSONB;
  END IF;

  -- Calculer les taux de succès
  success_rate_before := COALESCE((rec.metrics_before->>'successRate')::NUMERIC, 0);
  success_rate_after := COALESCE((rec.metrics_after->>'successRate')::NUMERIC, 0);
  improvement := success_rate_after - success_rate_before;

  impact := jsonb_build_object(
    'successRateImprovement', improvement,
    'successRateBefore', success_rate_before,
    'successRateAfter', success_rate_after,
    'totalBefore', COALESCE((rec.metrics_before->>'total')::INTEGER, 0),
    'totalAfter', COALESCE((rec.metrics_after->>'total')::INTEGER, 0),
    'volumeChange', COALESCE((rec.metrics_after->>'total')::INTEGER, 0) - COALESCE((rec.metrics_before->>'total')::INTEGER, 0),
    'impactScore', CASE
      WHEN improvement > 10 THEN 100
      WHEN improvement > 5 THEN 75
      WHEN improvement > 2 THEN 50
      WHEN improvement > 0 THEN 25
      ELSE 0
    END,
    'rating', CASE
      WHEN improvement > 10 THEN 'excellent'
      WHEN improvement > 5 THEN 'good'
      WHEN improvement > 2 THEN 'moderate'
      WHEN improvement > 0 THEN 'slight'
      ELSE 'no_improvement'
    END
  );

  -- Mettre à jour la recommandation
  UPDATE public.applied_recommendations
  SET
    impact_details = impact,
    impact_score = (impact->>'impactScore')::NUMERIC,
    impact_calculated = true,
    status = 'completed',
    updated_at = now()
  WHERE id = rec_id;

  RETURN impact;
END;
$function$;

-- Med MNG (useSubscription, via increment_music_usage) : lit l'usage mensuel d'un tiers.
-- increment_music_usage(user_uuid) délègue ici : le contrôle la couvre aussi.
CREATE OR REPLACE FUNCTION public.check_music_generation_quota(user_uuid uuid)
 RETURNS TABLE(can_generate boolean, current_usage integer, quota_limit integer, plan_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_month TEXT := to_char(now(), 'YYYY-MM');
  user_plan RECORD;
  usage_count INTEGER := 0;
BEGIN
  IF user_uuid IS DISTINCT FROM auth.uid()
     AND auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  -- Get user's subscription plan
  SELECT * INTO user_plan FROM public.get_user_subscription(user_uuid);

  -- Count current month usage from music_tracks table
  SELECT COUNT(*) INTO usage_count
  FROM public.music_tracks
  WHERE user_id = user_uuid
  AND to_char(created_at, 'YYYY-MM') = current_month;

  -- Return quota info
  RETURN QUERY
  SELECT
    (usage_count < COALESCE(user_plan.monthly_quota, 3))::BOOLEAN as can_generate,
    usage_count::INTEGER as current_usage,
    COALESCE(user_plan.monthly_quota, 3)::INTEGER as quota_limit,
    COALESCE(user_plan.plan_name, 'Gratuit')::TEXT as plan_name;
END;
$function$;

-- EmotionsCare (useWellnessStreak) : crée/modifie la série d'un tiers.
CREATE OR REPLACE FUNCTION public.check_wellness_streak(p_user_id uuid)
 RETURNS TABLE(current_streak integer, streak_broken boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_last_checkin DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_frozen_until TIMESTAMP WITH TIME ZONE;
  v_streak_broken BOOLEAN := false;
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid()
     AND auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  SELECT last_checkin_date, user_wellness_streak.current_streak, longest_streak, streak_frozen_until
  INTO v_last_checkin, v_current_streak, v_longest_streak, v_frozen_until
  FROM public.user_wellness_streak
  WHERE user_id = p_user_id;

  -- Si pas de record, créer
  IF NOT FOUND THEN
    INSERT INTO public.user_wellness_streak (user_id, current_streak, longest_streak, last_checkin_date, total_checkins)
    VALUES (p_user_id, 1, 1, CURRENT_DATE, 1);
    RETURN QUERY SELECT 1, false;
    RETURN;
  END IF;

  -- Si frozen (streak saver actif), ignorer la vérification
  IF v_frozen_until IS NOT NULL AND v_frozen_until > now() THEN
    -- Juste update la date sans casser le streak
    UPDATE public.user_wellness_streak
    SET last_checkin_date = CURRENT_DATE, total_checkins = total_checkins + 1
    WHERE user_id = p_user_id;
    RETURN QUERY SELECT v_current_streak, false;
    RETURN;
  END IF;

  -- Vérifier si le streak est cassé
  IF CURRENT_DATE - v_last_checkin > 1 THEN
    v_streak_broken := true;
    v_current_streak := 1;
  ELSIF CURRENT_DATE - v_last_checkin = 1 THEN
    v_current_streak := v_current_streak + 1;
  ELSIF CURRENT_DATE = v_last_checkin THEN
    -- Même jour, pas de changement
    RETURN QUERY SELECT v_current_streak, false;
    RETURN;
  END IF;

  -- Update
  UPDATE public.user_wellness_streak
  SET
    current_streak = v_current_streak,
    longest_streak = GREATEST(longest_streak, v_current_streak),
    last_checkin_date = CURRENT_DATE,
    total_checkins = total_checkins + 1,
    streak_frozen_until = NULL
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT v_current_streak, v_streak_broken;
END;
$function$;

-- EmotionsCare (fonction Edge notifications-send, clé de service) : un utilisateur pouvait
-- insérer une notification arbitraire chez n'importe qui (hameçonnage interne).
CREATE OR REPLACE FUNCTION public.create_notification_from_template(template_name text, target_user_id uuid, template_variables jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  template_record notification_templates%ROWTYPE;
  notification_id UUID;
  final_title TEXT;
  final_message TEXT;
BEGIN
  IF target_user_id IS DISTINCT FROM auth.uid()
     AND auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO template_record
  FROM public.notification_templates
  WHERE name = template_name;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found: %', template_name;
  END IF;

  final_title := template_record.title_template;
  final_message := template_record.message_template;

  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    category,
    priority,
    delivery_method,
    metadata
  ) VALUES (
    target_user_id,
    final_title,
    final_message,
    template_record.category,
    template_record.default_priority,
    template_record.default_delivery_methods,
    template_variables
  ) RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$function$;

-- Med MNG (useEffectivenessScores) : statistiques de recommandations d'un tiers.
CREATE OR REPLACE FUNCTION public.get_category_effectiveness_scores(p_user_id uuid)
 RETURNS TABLE(category text, avg_impact_score numeric, total_applied integer, total_measured integer, avg_success_improvement numeric, effectiveness_score numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid()
     AND auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    ar.category,
    ROUND(AVG(ar.impact_score), 2) as avg_impact_score,
    COUNT(*) as total_applied,
    COUNT(*) FILTER (WHERE ar.status = 'completed') as total_measured,
    ROUND(AVG(
      CASE
        WHEN ar.metrics_after IS NOT NULL AND ar.metrics_before IS NOT NULL
        THEN (ar.metrics_after->>'successRate')::numeric - (ar.metrics_before->>'successRate')::numeric
        ELSE 0
      END
    ), 2) as avg_success_improvement,
    -- Score d'efficacité composite (0-100)
    ROUND(
      COALESCE(AVG(ar.impact_score), 0) * 0.6 +  -- 60% basé sur impact_score
      COALESCE(AVG(
        CASE
          WHEN ar.metrics_after IS NOT NULL AND ar.metrics_before IS NOT NULL
          THEN GREATEST(0, LEAST(100, (ar.metrics_after->>'successRate')::numeric - (ar.metrics_before->>'successRate')::numeric + 50))
          ELSE 50
        END
      ), 50) * 0.4,  -- 40% basé sur amélioration des métriques
      2
    ) as effectiveness_score
  FROM applied_recommendations ar
  WHERE ar.user_id = p_user_id
    AND ar.impact_score IS NOT NULL
  GROUP BY ar.category;
END;
$function$;

-- EmotionsCare (useB2BRole, identifiant de l'utilisateur connecté) : révélait le rôle B2B
-- de n'importe qui dans n'importe quelle organisation. Passage de sql à plpgsql pour lever.
CREATE OR REPLACE FUNCTION public.get_highest_b2b_role(_user_id uuid, _org_id uuid)
 RETURNS b2b_role
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF _user_id IS DISTINCT FROM auth.uid()
     AND auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  RETURN (
    SELECT bur.role
    FROM public.b2b_user_roles bur
    WHERE bur.user_id = _user_id
      AND bur.org_id = _org_id
      AND (bur.expires_at IS NULL OR bur.expires_at > now())
    ORDER BY
      CASE bur.role
        WHEN 'b2b_admin' THEN 1
        WHEN 'b2b_manager' THEN 2
        WHEN 'b2b_member' THEN 3
        WHEN 'b2b_viewer' THEN 4
      END
    LIMIT 1
  );
END;
$function$;

-- Med MNG (med-mng-api /quota, client au jeton de l'utilisateur) : lisait et créait le
-- quota d'un tiers.
CREATE OR REPLACE FUNCTION public.get_music_quota(p_user_id uuid DEFAULT auth.uid())
 RETURNS TABLE(remaining_credits integer, total_credits integer, credits_used_this_period integer, can_generate boolean, last_reset_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_quota_record RECORD;
  remaining INTEGER;
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid()
     AND auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  -- Get or create user quota record
  SELECT * INTO user_quota_record
  FROM public.user_quotas
  WHERE user_id = p_user_id;

  -- If no quota record exists, create one with defaults
  IF NOT FOUND THEN
    INSERT INTO public.user_quotas (
      user_id,
      subscription_type,
      monthly_music_quota,
      monthly_qcm_quota,
      monthly_chat_quota,
      monthly_music_used,
      monthly_qcm_used,
      monthly_chat_used,
      quota_reset_date
    ) VALUES (
      p_user_id,
      'standard',
      30,
      50,
      100,
      0,
      0,
      0,
      now()
    ) RETURNING * INTO user_quota_record;
  END IF;

  -- Calculate music-only quota
  remaining := GREATEST(user_quota_record.monthly_music_quota - user_quota_record.monthly_music_used, 0);

  -- Return music quota only
  RETURN QUERY SELECT
    remaining,
    user_quota_record.monthly_music_quota,
    user_quota_record.monthly_music_used,
    (remaining > 0) as can_generate,
    user_quota_record.quota_reset_date;
END;
$function$;

-- Med MNG (useIAQuota, sans paramètre) : lisait, créait et réinitialisait le quota d'un tiers.
CREATE OR REPLACE FUNCTION public.get_user_ai_quota(p_user_id uuid DEFAULT auth.uid())
 RETURNS TABLE(remaining_credits integer, total_credits integer, credits_used integer, reset_date timestamp with time zone, subscription_type text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  quota_record RECORD;
  current_user_id UUID;
BEGIN
  -- Get current authenticated user
  current_user_id := COALESCE(p_user_id, auth.uid());

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF current_user_id IS DISTINCT FROM auth.uid()
     AND auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  -- Get or create user quota record
  SELECT * INTO quota_record
  FROM public.user_quotas
  WHERE user_id = current_user_id;

  -- If no quota record exists, create one with default values
  IF NOT FOUND THEN
    INSERT INTO public.user_quotas (
      user_id,
      subscription_type,
      monthly_music_quota,
      monthly_qcm_quota,
      monthly_chat_quota,
      monthly_music_used,
      monthly_qcm_used,
      monthly_chat_used,
      quota_reset_date
    ) VALUES (
      current_user_id,
      'free',
      5,   -- 5 music generations for free tier
      25,  -- 25 QCM generations for free tier
      50,  -- 50 chat interactions for free tier
      0,
      0,
      0,
      date_trunc('month', now()) + interval '1 month'
    )
    RETURNING * INTO quota_record;
  END IF;

  -- Reset quotas if it's a new month
  IF quota_record.quota_reset_date <= now() THEN
    UPDATE public.user_quotas
    SET
      monthly_music_used = 0,
      monthly_qcm_used = 0,
      monthly_chat_used = 0,
      quota_reset_date = date_trunc('month', now()) + interval '1 month',
      updated_at = now()
    WHERE user_id = current_user_id
    RETURNING * INTO quota_record;
  END IF;

  -- Calculate totals
  DECLARE
    total_quota integer := quota_record.monthly_music_quota +
                          quota_record.monthly_qcm_quota +
                          quota_record.monthly_chat_quota;
    total_used integer := quota_record.monthly_music_used +
                         quota_record.monthly_qcm_used +
                         quota_record.monthly_chat_used;
    remaining integer := GREATEST(0, total_quota - total_used);
  BEGIN
    RETURN QUERY SELECT
      remaining,
      total_quota,
      total_used,
      quota_record.quota_reset_date,
      quota_record.subscription_type;
  END;
END;
$function$;

-- EmotionsCare (fonction Edge consent-manager, jeton de l'utilisateur) : consentements d'un tiers.
CREATE OR REPLACE FUNCTION public.get_user_consent_status(p_user_id uuid)
 RETURNS TABLE(channel_code text, channel_name text, purpose_code text, purpose_name text, consent_given boolean, consent_date timestamp with time zone, last_updated timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid()
     AND auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    cc.channel_code,
    cc.channel_name,
    cp.purpose_code,
    cp.purpose_name,
    COALESCE(ucp.consent_given, false) as consent_given,
    ucp.consent_date,
    ucp.updated_at as last_updated
  FROM public.consent_channels cc
  CROSS JOIN public.consent_purposes cp
  LEFT JOIN public.user_consent_preferences ucp
    ON ucp.channel_id = cc.id
    AND ucp.purpose_id = cp.id
    AND ucp.user_id = p_user_id
  WHERE cc.is_active = true AND cp.is_active = true
  ORDER BY cc.channel_code, cp.purpose_code;
END;
$function$;

-- EmotionsCare (useMusicListeningStats, history-service, musicApi) : historique d'écoute d'un tiers.
CREATE OR REPLACE FUNCTION public.get_user_listening_stats(p_user_id uuid)
 RETURNS TABLE(total_listens bigint, total_duration_seconds bigint, top_emotion text, unique_tracks bigint, streak_days integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid()
     AND auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_listens,
    COALESCE(SUM(COALESCE(listen_duration, 180)), 0)::BIGINT as total_duration_seconds,
    COALESCE(
      (SELECT mh.emotion
       FROM music_history mh
       WHERE mh.user_id = p_user_id AND mh.emotion IS NOT NULL
       GROUP BY mh.emotion
       ORDER BY COUNT(*) DESC
       LIMIT 1),
      'calm'
    ) as top_emotion,
    COUNT(DISTINCT track_id)::BIGINT as unique_tracks,
    (
      SELECT COUNT(DISTINCT DATE(played_at))::INT
      FROM music_history mh2
      WHERE mh2.user_id = p_user_id
        AND played_at >= CURRENT_DATE - INTERVAL '30 days'
    ) as streak_days
  FROM music_history
  WHERE user_id = p_user_id;
END;
$function$;

-- EmotionsCare (storage-service) : volume de fichiers d'un tiers.
CREATE OR REPLACE FUNCTION public.get_user_music_storage_usage(p_user_id uuid DEFAULT auth.uid())
 RETURNS TABLE(total_files bigint, total_size_bytes bigint, total_size_mb numeric, avg_file_size_mb numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid()
     AND auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_files,
    COALESCE(SUM(file_size), 0)::BIGINT as total_size_bytes,
    ROUND(COALESCE(SUM(file_size), 0)::DECIMAL / 1048576, 2) as total_size_mb,
    ROUND(COALESCE(AVG(file_size), 0)::DECIMAL / 1048576, 2) as avg_file_size_mb
  FROM public.music_uploads
  WHERE user_id = p_user_id
  AND status = 'completed';
END;
$function$;

-- EmotionsCare (useRoleAuditLogs, console admin) : historique des rôles d'un tiers, avec
-- l'e-mail des personnes ayant modifié le rôle.
CREATE OR REPLACE FUNCTION public.get_user_role_audit_history(p_user_id uuid)
 RETURNS TABLE(id uuid, old_role text, new_role text, changed_by uuid, changed_by_email text, reason text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid()
     AND auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT ral.id, ral.old_role, ral.new_role, ral.changed_by, p.email, ral.reason, ral.created_at
  FROM public.role_audit_logs ral
  LEFT JOIN public.profiles p ON ral.changed_by = p.id
  WHERE ral.user_id = p_user_id
  ORDER BY ral.created_at DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role_audit_history(p_user_id uuid, p_limit integer DEFAULT 50)
 RETURNS TABLE(id uuid, role text, action text, performed_by uuid, performed_by_email text, reason text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid()
     AND auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    ral.id,
    ral.role::text,
    ral.action,
    ral.performed_by,
    COALESCE(p.email, 'System') as performed_by_email,
    ral.reason,
    ral.created_at
  FROM public.role_audit_logs ral
  LEFT JOIN public.profiles p ON ral.performed_by = p.id
  WHERE ral.user_id = p_user_id
  ORDER BY ral.created_at DESC
  LIMIT p_limit;
END;
$function$;

-- Med MNG (contextual-ai-chat) : permettait d'écrire des échanges au nom d'un tiers.
CREATE OR REPLACE FUNCTION public.log_chat_interaction(p_user_id uuid, p_question text, p_response text, p_context_used jsonb DEFAULT NULL::jsonb, p_tokens_used integer DEFAULT 0, p_response_time_ms integer DEFAULT NULL::integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid()
     AND auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.med_mng_chat_interactions (
    user_id, question, response, context_used, tokens_used, response_time_ms
  ) VALUES (
    p_user_id, p_question, p_response, p_context_used, p_tokens_used, p_response_time_ms
  );
END;
$function$;

-- Med MNG (mm-garde / generer-paroles-item avec la clé de service ; mm_contenu_immersif_item
-- avec auth.uid()) : révélait si n'importe quel compte est Premium ou administrateur.
-- Règle d'accès inchangée ; passage de sql à plpgsql pour lever.
CREATE OR REPLACE FUNCTION public.mm_a_acces_premium(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid()
     AND auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  RETURN p_user_id IS NOT NULL AND (
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
END;
$function$;

-- Med MNG (useBKTKnowledge) : modifiait le modèle de connaissances d'un tiers.
CREATE OR REPLACE FUNCTION public.update_bkt_knowledge(p_user_id uuid, p_item_code text, p_concept_id text, p_is_correct boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_record bkt_student_knowledge%ROWTYPE;
  v_p_know_prior NUMERIC(5,4);
  v_p_know_posterior NUMERIC(5,4);
  v_p_correct NUMERIC(5,4);
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid()
     AND auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  -- Récupérer ou créer l'entrée
  SELECT * INTO v_record FROM bkt_student_knowledge
  WHERE user_id = p_user_id AND item_code = p_item_code AND concept_id = p_concept_id;

  IF NOT FOUND THEN
    INSERT INTO bkt_student_knowledge (user_id, item_code, concept_id, p_know, p_guess, p_slip, p_learn)
    VALUES (p_user_id, p_item_code, p_concept_id, 0.0, 0.25, 0.1, 0.3)
    RETURNING * INTO v_record;
  END IF;

  v_p_know_prior := v_record.p_know;

  -- Calcul BKT
  IF p_is_correct THEN
    -- P(correct) = P(know) * (1 - P(slip)) + (1 - P(know)) * P(guess)
    v_p_correct := v_p_know_prior * (1 - v_record.p_slip) + (1 - v_p_know_prior) * v_record.p_guess;
    -- P(know | correct) = P(know) * (1 - P(slip)) / P(correct)
    v_p_know_posterior := (v_p_know_prior * (1 - v_record.p_slip)) / NULLIF(v_p_correct, 0);
  ELSE
    -- P(incorrect) = P(know) * P(slip) + (1 - P(know)) * (1 - P(guess))
    v_p_correct := v_p_know_prior * v_record.p_slip + (1 - v_p_know_prior) * (1 - v_record.p_guess);
    -- P(know | incorrect) = P(know) * P(slip) / P(incorrect)
    v_p_know_posterior := (v_p_know_prior * v_record.p_slip) / NULLIF(v_p_correct, 0);
  END IF;

  -- Appliquer P(learn) : P(know) = P(know | obs) + (1 - P(know | obs)) * P(learn)
  v_p_know_posterior := COALESCE(v_p_know_posterior, 0) + (1 - COALESCE(v_p_know_posterior, 0)) * v_record.p_learn;
  v_p_know_posterior := LEAST(0.9999, GREATEST(0.0001, v_p_know_posterior));

  -- Mise à jour
  UPDATE bkt_student_knowledge
  SET
    p_know = v_p_know_posterior,
    total_attempts = total_attempts + 1,
    correct_attempts = correct_attempts + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    last_attempt_at = now(),
    mastery_reached = v_p_know_posterior >= 0.95,
    mastery_date = CASE WHEN v_p_know_posterior >= 0.95 AND NOT mastery_reached THEN now() ELSE mastery_date END,
    updated_at = now()
  WHERE user_id = p_user_id AND item_code = p_item_code AND concept_id = p_concept_id;

  RETURN jsonb_build_object(
    'p_know_prior', v_p_know_prior,
    'p_know_posterior', v_p_know_posterior,
    'mastery_reached', v_p_know_posterior >= 0.95
  );
END;
$function$;

-- =====================================================================================
-- (b) Données d'administration (toutes les lignes, tous les utilisateurs) sans contrôle :
--     réservées aux administrateurs et à la clé de service.
-- =====================================================================================

CREATE OR REPLACE FUNCTION public.calculate_risk_score()
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  total_score DECIMAL := 0;
  violation_count INTEGER;
  critical_count INTEGER;
  high_count INTEGER;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  -- Compter les violations actives
  SELECT COUNT(*) INTO violation_count
  FROM public.gdpr_violations
  WHERE status IN ('detected', 'investigating')
  AND detected_at > NOW() - INTERVAL '7 days';

  SELECT COUNT(*) INTO critical_count
  FROM public.gdpr_violations
  WHERE status IN ('detected', 'investigating')
  AND severity = 'critical'
  AND detected_at > NOW() - INTERVAL '7 days';

  SELECT COUNT(*) INTO high_count
  FROM public.gdpr_violations
  WHERE status IN ('detected', 'investigating')
  AND severity = 'high'
  AND detected_at > NOW() - INTERVAL '7 days';

  -- Calculer le score (0-100)
  total_score := LEAST(100, (critical_count * 25) + (high_count * 10) + (violation_count * 5));

  RETURN total_score;
END;
$function$;

-- Med MNG (performanceAnalyticsService, composant non routé) : écriture globale
-- (sla_metrics, performance_alerts) déclenchable par n'importe quel compte.
CREATE OR REPLACE FUNCTION public.calculate_sla_metrics()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  sla_record RECORD;
  calculated_value NUMERIC;
  new_status TEXT;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  -- Parcourir tous les SLA actifs
  FOR sla_record IN
    SELECT * FROM sla_metrics
    WHERE period_end > now()
    AND status = 'measuring'
  LOOP
    -- Calculer la valeur selon le type de métrique
    CASE sla_record.metric_name
      WHEN 'availability' THEN
        -- Calculer le pourcentage de disponibilité
        SELECT COALESCE(
          100.0 * COUNT(*) FILTER (WHERE status_code < 500) / NULLIF(COUNT(*), 0),
          0
        ) INTO calculated_value
        FROM operation_logs
        WHERE type = 'api_call'
        AND created_at BETWEEN sla_record.period_start AND now()
        AND meta->>'service' = sla_record.service_name;

      WHEN 'response_time' THEN
        -- Calculer le temps de réponse médian
        SELECT COALESCE(
          percentile_cont(0.5) WITHIN GROUP (ORDER BY (meta->>'duration')::numeric),
          0
        ) INTO calculated_value
        FROM operation_logs
        WHERE type = 'api_call'
        AND created_at BETWEEN sla_record.period_start AND now()
        AND meta->>'service' = sla_record.service_name;

      WHEN 'error_rate' THEN
        -- Calculer le taux d'erreur
        SELECT COALESCE(
          100.0 * COUNT(*) FILTER (WHERE status_code >= 400) / NULLIF(COUNT(*), 0),
          0
        ) INTO calculated_value
        FROM operation_logs
        WHERE type = 'api_call'
        AND created_at BETWEEN sla_record.period_start AND now()
        AND meta->>'service' = sla_record.service_name;

      ELSE
        calculated_value := 0;
    END CASE;

    -- Déterminer le nouveau statut
    IF calculated_value >= sla_record.target_value THEN
      new_status := 'met';
    ELSIF calculated_value >= sla_record.target_value * 0.9 THEN
      new_status := 'warning';
    ELSE
      new_status := 'breach';
    END IF;

    -- Mettre à jour la métrique SLA
    UPDATE sla_metrics
    SET
      current_value = calculated_value,
      status = new_status,
      breach_count = CASE WHEN new_status = 'breach' THEN breach_count + 1 ELSE breach_count END,
      last_calculated = now(),
      updated_at = now()
    WHERE id = sla_record.id;

    -- Créer une alerte si nécessaire
    IF new_status IN ('warning', 'breach') THEN
      INSERT INTO performance_alerts (
        alert_type,
        severity,
        title,
        description,
        metric_data
      ) VALUES (
        'sla_breach',
        CASE WHEN new_status = 'breach' THEN 'critical' ELSE 'warning' END,
        'SLA ' || new_status || ' - ' || sla_record.service_name,
        'SLA ' || sla_record.metric_name || ' pour ' || sla_record.service_name ||
        ' est ' || new_status || ': ' || calculated_value || ' (target: ' || sla_record.target_value || ')',
        jsonb_build_object(
          'service_name', sla_record.service_name,
          'metric_name', sla_record.metric_name,
          'current_value', calculated_value,
          'target_value', sla_record.target_value,
          'status', new_status
        )
      );
    END IF;
  END LOOP;
END;
$function$;

-- EmotionsCare (console admin, useActivityData) et Med MNG (UnifiedMonitoringDashboard,
-- non routé) : activité agrégée de tous les utilisateurs.
CREATE OR REPLACE FUNCTION public.get_activity_stats(p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS TABLE(activity_type text, total_count bigint, percentage numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_total BIGINT;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  -- Get the total count of activities
  SELECT COUNT(*) INTO v_total
  FROM user_activity_logs
  WHERE
    (p_start_date IS NULL OR timestamp >= p_start_date) AND
    (p_end_date IS NULL OR timestamp <= p_end_date);

  -- Return statistics
  RETURN QUERY
  SELECT
    activity_type,
    COUNT(*) as total_count,
    CASE
      WHEN v_total > 0 THEN (COUNT(*)::NUMERIC / v_total) * 100
      ELSE 0
    END as percentage
  FROM
    user_activity_logs
  WHERE
    (p_start_date IS NULL OR timestamp >= p_start_date) AND
    (p_end_date IS NULL OR timestamp <= p_end_date)
  GROUP BY
    activity_type
  ORDER BY
    total_count DESC;
END;
$function$;

-- EmotionsCare (console admin, useActivityData) : recherche ILIKE dans activity_details de
-- tous les utilisateurs (oracle sur le contenu des journaux d'autrui).
CREATE OR REPLACE FUNCTION public.get_anonymous_activity_logs(p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_activity_type text DEFAULT NULL::text, p_search_term text DEFAULT NULL::text, p_page integer DEFAULT 1, p_page_size integer DEFAULT 20)
 RETURNS TABLE(id uuid, activity_type text, category text, count bigint, timestamp_day date)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_offset INTEGER;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  v_offset := (p_page - 1) * p_page_size;

  RETURN QUERY
  WITH filtered_logs AS (
    SELECT
      user_activity_logs.activity_type,
      COALESCE(user_activity_logs.activity_details->>'category', 'Non catégorisé') as category,
      DATE_TRUNC('day', user_activity_logs.timestamp)::DATE as day,
      COUNT(*) as activity_count
    FROM
      user_activity_logs
    WHERE
      (p_start_date IS NULL OR user_activity_logs.timestamp >= p_start_date) AND
      (p_end_date IS NULL OR user_activity_logs.timestamp <= p_end_date) AND
      (p_activity_type IS NULL OR user_activity_logs.activity_type = p_activity_type) AND
      (p_search_term IS NULL OR
        user_activity_logs.activity_type ILIKE '%' || p_search_term || '%' OR
        user_activity_logs.activity_details::TEXT ILIKE '%' || p_search_term || '%')
    GROUP BY
      user_activity_logs.activity_type,
      category,
      DATE_TRUNC('day', user_activity_logs.timestamp)::DATE
  )
  SELECT
    gen_random_uuid() as id,
    filtered_logs.activity_type,
    filtered_logs.category,
    filtered_logs.activity_count as count,
    filtered_logs.day as timestamp_day
  FROM
    filtered_logs
  ORDER BY
    day DESC,
    activity_count DESC
  LIMIT p_page_size
  OFFSET v_offset;
END;
$function$;

-- EmotionsCare (pages /gdpr/cron-monitoring et /admin/cron-monitoring) : supervision interne.
CREATE OR REPLACE FUNCTION public.get_cron_job_history()
 RETURNS TABLE(job_name text, status text, last_run timestamp with time zone, next_run timestamp with time zone, execution_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    'scheduled-pdf-reports'::text as job_name,
    'completed'::text as status,
    MAX(generated_at) as last_run,
    (MAX(generated_at) + interval '1 hour')::timestamptz as next_run,
    COUNT(*)::bigint as execution_count
  FROM compliance_reports
  WHERE status = 'completed'

  UNION ALL

  SELECT
    'pdf-notifications'::text as job_name,
    'completed'::text as status,
    MAX(created_at) as last_run,
    (MAX(created_at) + interval '8 hours')::timestamptz as next_run,
    COUNT(*)::bigint as execution_count
  FROM realtime_notifications
  WHERE type = 'report_ready';
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_cron_jobs_list()
 RETURNS TABLE(jobid bigint, jobname text, schedule text, active boolean, last_run timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    1::bigint as jobid,
    'scheduled-pdf-reports'::text as jobname,
    '0 * * * *'::text as schedule,
    true as active,
    (SELECT MAX(generated_at) FROM compliance_reports) as last_run

  UNION ALL

  SELECT
    2::bigint as jobid,
    'pdf-notifications'::text as jobname,
    '0 8,16 * * *'::text as schedule,
    true as active,
    (SELECT MAX(created_at) FROM realtime_notifications WHERE type = 'report_ready') as last_run;
END;
$function$;

-- Lit cron.job_run_details (messages d'erreur internes). Appelée aussi par la fonction Edge
-- send-cron-alert avec la clé de service.
CREATE OR REPLACE FUNCTION public.get_gamification_cron_history()
 RETURNS TABLE(jobid bigint, job_name text, status text, return_message text, start_time timestamp with time zone, end_time timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    jrd.jobid,
    j.jobname as job_name,
    jrd.status,
    jrd.return_message,
    jrd.start_time,
    jrd.end_time
  FROM cron.job_run_details jrd
  JOIN cron.job j ON j.jobid = jrd.jobid
  WHERE j.jobname IN ('generate-daily-challenges-midnight', 'calculate-rankings-hourly')
  ORDER BY jrd.start_time DESC
  LIMIT 100;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_gamification_cron_jobs()
 RETURNS TABLE(jobid bigint, jobname text, schedule text, active boolean, database text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    j.jobid,
    j.jobname,
    j.schedule,
    j.active,
    j.database
  FROM cron.job j
  WHERE j.jobname IN ('generate-daily-challenges-midnight', 'calculate-rankings-hourly')
  ORDER BY j.jobname;
END;
$function$;

-- EmotionsCare (PseudonymizationManager) : statistiques RGPD globales.
CREATE OR REPLACE FUNCTION public.get_pseudonymization_statistics(p_rule_id uuid DEFAULT NULL::uuid, p_start_date date DEFAULT (CURRENT_DATE - '30 days'::interval), p_end_date date DEFAULT CURRENT_DATE)
 RETURNS TABLE(rule_id uuid, data_type text, field_name text, total_pseudonymized bigint, total_depseudonymized bigint, total_failed bigint, avg_processing_time numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    pr.id,
    pr.data_type,
    pr.field_name,
    COALESCE(SUM(ps.pseudonymized_count), 0) as total_pseudonymized,
    COALESCE(SUM(ps.depseudonymized_count), 0) as total_depseudonymized,
    COALESCE(SUM(ps.failed_count), 0) as total_failed,
    COALESCE(AVG(ps.avg_processing_time_ms), 0) as avg_processing_time
  FROM public.pseudonymization_rules pr
  LEFT JOIN public.pseudonymization_stats ps
    ON ps.rule_id = pr.id
    AND ps.date BETWEEN p_start_date AND p_end_date
  WHERE (p_rule_id IS NULL OR pr.id = p_rule_id)
  GROUP BY pr.id, pr.data_type, pr.field_name
  ORDER BY total_pseudonymized DESC;
END;
$function$;

-- Med MNG (page RLSDocumentation derrière AdminRoute ; security-metrics avec la clé de service) :
-- exposait le texte de toutes les politiques RLS à tout compte. Passage de sql à plpgsql.
CREATE OR REPLACE FUNCTION public.get_rls_policies()
 RETURNS TABLE(table_schema text, table_name text, policy_name text, policy_cmd text, policy_roles text[], policy_qual text, policy_with_check text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    n.nspname::text AS table_schema,
    c.relname::text AS table_name,
    pol.polname::text AS policy_name,
    CASE pol.polcmd
      WHEN 'r' THEN 'SELECT'
      WHEN 'a' THEN 'INSERT'
      WHEN 'w' THEN 'UPDATE'
      WHEN 'd' THEN 'DELETE'
      WHEN '*' THEN 'ALL'
    END AS policy_cmd,
    pol.polroles::regrole[]::text[] AS policy_roles,
    pg_get_expr(pol.polqual, pol.polrelid)::text AS policy_qual,
    pg_get_expr(pol.polwithcheck, pol.polrelid)::text AS policy_with_check
  FROM pg_policy pol
  JOIN pg_class c ON c.oid = pol.polrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
  ORDER BY n.nspname, c.relname, pol.polname;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_rls_table_summaries()
 RETURNS TABLE(table_name text, rls_enabled boolean, policy_count bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    c.relname::text AS table_name,
    c.relrowsecurity AS rls_enabled,
    COUNT(pol.polname) AS policy_count
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  LEFT JOIN pg_policy pol ON pol.polrelid = c.oid
  WHERE n.nspname = 'public' AND c.relkind = 'r'
  GROUP BY c.relname, c.relrowsecurity
  ORDER BY c.relname;
END;
$function$;

-- EmotionsCare (useViolationMonitoring ; generate-audit-pdf avec la clé de service) :
-- violations RGPD globales.
CREATE OR REPLACE FUNCTION public.get_violation_stats(days integer DEFAULT 30)
 RETURNS TABLE(total_violations bigint, critical_violations bigint, high_violations bigint, resolved_violations bigint, avg_resolution_time interval, trend_direction text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_violations,
    COUNT(*) FILTER (WHERE severity = 'critical')::BIGINT as critical_violations,
    COUNT(*) FILTER (WHERE severity = 'high')::BIGINT as high_violations,
    COUNT(*) FILTER (WHERE status = 'resolved')::BIGINT as resolved_violations,
    AVG(resolved_at - detected_at) FILTER (WHERE resolved_at IS NOT NULL) as avg_resolution_time,
    CASE
      WHEN COUNT(*) FILTER (WHERE detected_at > NOW() - INTERVAL '7 days') >
           COUNT(*) FILTER (WHERE detected_at BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days')
      THEN 'increasing'
      WHEN COUNT(*) FILTER (WHERE detected_at > NOW() - INTERVAL '14 days') <
           COUNT(*) FILTER (WHERE detected_at BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days')
      THEN 'decreasing'
      ELSE 'stable'
    END as trend_direction
  FROM public.gdpr_violations
  WHERE detected_at > NOW() - (days || ' days')::INTERVAL;
END;
$function$;
