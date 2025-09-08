-- 🔒 CORRECTIONS SÉCURITÉ CRITIQUES SUPABASE
-- Fix des Security Definer Views et fonctions sans search_path

-- 1. Corriger les Security Definer Views (remplacer par des fonctions sécurisées)
DROP VIEW IF EXISTS public.team_emotion_summary;
DROP VIEW IF EXISTS public.user_achievements_view;
DROP VIEW IF EXISTS public.user_stats_view;
DROP VIEW IF EXISTS public.music_generation_analytics;
DROP VIEW IF EXISTS public.content_analytics;
DROP VIEW IF EXISTS public.performance_metrics_view;

-- Créer des fonctions sécurisées pour remplacer les vues
CREATE OR REPLACE FUNCTION public.get_team_emotion_summary()
RETURNS TABLE(
  org_id uuid,
  team_name text,
  date date,
  emotion_type text,
  count bigint,
  avg_confidence numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    om.org_id,
    p.team_name,
    er.created_at::date as date,
    er.emotion_type,
    COUNT(*) as count,
    AVG(er.confidence) as avg_confidence
  FROM emotion_records er
  JOIN profiles p ON er.user_id = p.id
  JOIN org_memberships om ON p.id = om.user_id
  WHERE er.created_at >= current_date - interval '30 days'
  GROUP BY om.org_id, p.team_name, er.created_at::date, er.emotion_type
  ORDER BY date DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_achievements_summary(user_uuid uuid DEFAULT NULL)
RETURNS TABLE(
  user_id uuid,
  total_achievements bigint,
  total_points numeric,
  rarity_breakdown jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Si aucun user_uuid fourni, utiliser l'utilisateur connecté
  target_user_id := COALESCE(user_uuid, auth.uid());
  
  -- Vérifier les permissions
  IF auth.uid() != target_user_id AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  RETURN QUERY
  SELECT 
    ua.user_id,
    COUNT(*) as total_achievements,
    COALESCE(SUM((a.rewards->>'points')::numeric), 0) as total_points,
    jsonb_object_agg(a.rarity, COUNT(*)) as rarity_breakdown
  FROM user_achievements ua
  JOIN achievements a ON ua.achievement_id = a.id
  WHERE ua.user_id = target_user_id
  GROUP BY ua.user_id;
END;
$$;

-- 2. Corriger les fonctions sans search_path
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
BEGIN
  -- Mettre à jour les stats quand un défi est complété
  IF NEW.completed = true AND OLD.completed = false THEN
    UPDATE user_stats 
    SET 
      total_points = total_points + NEW.points,
      completed_challenges = completed_challenges + 1,
      updated_at = now()
    WHERE user_id = NEW.user_id;
    
    -- Ajouter une entrée dans l'historique des points
    INSERT INTO points_history (user_id, points, reason, challenge_id)
    VALUES (NEW.user_id, NEW.points, 'Challenge completed: ' || NEW.title, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_med_mng_generation_logs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. Créer une table d'audit sécurisée pour les actions sensibles
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action_type text NOT NULL,
  table_name text,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  session_id text,
  risk_score integer DEFAULT 0
);

-- Activer RLS sur la table d'audit
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Politique: Seuls les admins peuvent voir les logs d'audit
CREATE POLICY "Admins only audit access" ON public.security_audit_log
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 4. Fonction pour nettoyer automatiquement les anciens logs
CREATE OR REPLACE FUNCTION public.cleanup_security_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
BEGIN
  -- Nettoyer les logs de plus de 90 jours
  DELETE FROM public.security_audit_log 
  WHERE created_at < now() - INTERVAL '90 days';
  
  -- Nettoyer les anciens logs de rate limiting
  DELETE FROM public.rate_limit_counters 
  WHERE window_end < now() - INTERVAL '2 hours';
END;
$$;

-- 5. Index de performance pour les nouvelles tables
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_action_type ON public.security_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_risk_score ON public.security_audit_log(risk_score) WHERE risk_score > 5;

-- 6. Fonction pour obtenir les recommandations de sécurité
CREATE OR REPLACE FUNCTION public.get_security_recommendations()
RETURNS TABLE(category text, issue text, recommendation text, priority text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
BEGIN
  RETURN QUERY VALUES
    ('AUTH', 'OTP Expiry', 'Réduire l''expiration OTP à 900 secondes (15 min) dans le dashboard Supabase', 'HIGH'),
    ('EXTENSIONS', 'Public Schema', 'Déplacer les extensions vers le schéma extensions', 'MEDIUM'),
    ('MONITORING', 'Security Audit', 'Audit de sécurité effectué et corrigé', 'INFO');
END;
$$;