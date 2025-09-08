-- ===============================================
-- MIGRATION SÉCURITÉ CRITIQUES - CORRECTION IMMÉDIATE
-- ===============================================

-- 1. CORRECTION DES FONCTIONS SEARCH_PATH INSÉCURISÉES
ALTER FUNCTION public.update_integration_updated_at() SET search_path = 'public', 'extensions';
ALTER FUNCTION public.update_med_mng_generation_logs_updated_at() SET search_path = 'public', 'extensions';
ALTER FUNCTION public.update_user_stats() SET search_path = 'public', 'extensions';
ALTER FUNCTION public.update_oic_competences_updated_at() SET search_path = 'public', 'extensions';

-- 2. CRÉATION TABLE UNIFIÉE GÉNÉRATION MUSICALE SÉCURISÉE
CREATE TABLE IF NOT EXISTS public.unified_music_generation (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_code TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('rang_a', 'rang_b', 'mix')),
    paroles TEXT[] NOT NULL,
    style TEXT NOT NULL DEFAULT 'medical',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    suno_task_id TEXT,
    audio_url TEXT,
    duration INTEGER DEFAULT 240,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Activer RLS pour la sécurité
ALTER TABLE public.unified_music_generation ENABLE ROW LEVEL SECURITY;

-- Politiques RLS sécurisées
CREATE POLICY "Users can only access their own music generations"
ON public.unified_music_generation FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. TABLE ANALYTICS MÉDICALES UNIFIÉES
CREATE TABLE IF NOT EXISTS public.medical_learning_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_code TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('study', 'quiz', 'music_listen', 'completion')),
    score NUMERIC,
    duration_seconds INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.medical_learning_analytics ENABLE ROW LEVEL SECURITY;

-- Politique sécurisée
CREATE POLICY "Users can only access their own analytics"
ON public.medical_learning_analytics FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. INDEX PERFORMANCE CRITIQUES
CREATE INDEX IF NOT EXISTS idx_unified_music_generation_user_status 
ON public.unified_music_generation(user_id, status);

CREATE INDEX IF NOT EXISTS idx_unified_music_generation_item_code 
ON public.unified_music_generation(item_code);

CREATE INDEX IF NOT EXISTS idx_medical_learning_analytics_user_item 
ON public.medical_learning_analytics(user_id, item_code);

CREATE INDEX IF NOT EXISTS idx_medical_learning_analytics_action_type 
ON public.medical_learning_analytics(action_type, created_at);

-- 5. FONCTION SÉCURISÉE GÉNÉRATION MUSICALE
CREATE OR REPLACE FUNCTION public.secure_generate_music(
    p_item_code TEXT,
    p_type TEXT,
    p_paroles TEXT[],
    p_style TEXT DEFAULT 'medical'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
DECLARE
    generation_id UUID;
    current_user_id UUID;
BEGIN
    -- Vérification authentification
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Validation des paramètres
    IF p_item_code IS NULL OR p_type IS NULL OR p_paroles IS NULL OR array_length(p_paroles, 1) = 0 THEN
        RAISE EXCEPTION 'Invalid parameters: item_code, type, and paroles are required';
    END IF;

    -- Création de la demande de génération
    INSERT INTO public.unified_music_generation (
        user_id,
        item_code,
        type,
        paroles,
        style,
        status
    ) VALUES (
        current_user_id,
        p_item_code,
        p_type,
        p_paroles,
        p_style,
        'pending'
    ) RETURNING id INTO generation_id;

    -- Log de l'action
    INSERT INTO public.medical_learning_analytics (
        user_id,
        item_code,
        action_type,
        metadata
    ) VALUES (
        current_user_id,
        p_item_code,
        'music_generation_request',
        jsonb_build_object(
            'type', p_type,
            'style', p_style,
            'generation_id', generation_id
        )
    );

    RETURN generation_id;
END;
$$;

-- 6. FONCTION ANALYTICS SÉCURISÉE
CREATE OR REPLACE FUNCTION public.get_user_medical_stats(p_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
DECLARE
    target_user_id UUID;
    result JSONB;
BEGIN
    -- Si pas d'user_id fourni, utiliser l'utilisateur connecté
    target_user_id := COALESCE(p_user_id, auth.uid());
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    -- Sécurité : un utilisateur ne peut voir que ses propres stats
    IF auth.uid() != target_user_id THEN
        RAISE EXCEPTION 'Access denied: can only view own statistics';
    END IF;

    -- Calcul des statistiques
    SELECT jsonb_build_object(
        'total_study_time', COALESCE(SUM(duration_seconds), 0),
        'total_actions', COUNT(*),
        'quiz_average_score', COALESCE(AVG(score) FILTER (WHERE action_type = 'quiz'), 0),
        'music_generations', COUNT(*) FILTER (WHERE action_type = 'music_generation_request'),
        'completed_items', COUNT(DISTINCT item_code) FILTER (WHERE action_type = 'completion'),
        'last_activity', MAX(created_at)
    ) INTO result
    FROM public.medical_learning_analytics
    WHERE user_id = target_user_id;

    RETURN result;
END;
$$;

-- 7. TRIGGERS SÉCURISÉS
CREATE OR REPLACE FUNCTION public.update_unified_music_generation_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_unified_music_generation_updated_at
    BEFORE UPDATE ON public.unified_music_generation
    FOR EACH ROW
    EXECUTE FUNCTION public.update_unified_music_generation_updated_at();

-- 8. VUE SÉCURISÉE DASHBOARD MÉDICAL
CREATE OR REPLACE VIEW public.medical_dashboard_view AS
SELECT 
    u.id as user_id,
    u.email,
    COUNT(DISTINCT mla.item_code) as studied_items,
    COUNT(DISTINCT CASE WHEN mla.action_type = 'completion' THEN mla.item_code END) as completed_items,
    COUNT(DISTINCT CASE WHEN umg.status = 'completed' THEN umg.item_code END) as music_items,
    AVG(mla.score) FILTER (WHERE mla.action_type = 'quiz') as avg_quiz_score,
    SUM(mla.duration_seconds) as total_study_time,
    MAX(mla.created_at) as last_activity
FROM auth.users u
LEFT JOIN public.medical_learning_analytics mla ON u.id = mla.user_id
LEFT JOIN public.unified_music_generation umg ON u.id = umg.user_id
WHERE u.id = auth.uid()
GROUP BY u.id, u.email;

-- RLS sur la vue (sécurité supplémentaire)
ALTER VIEW public.medical_dashboard_view SET (security_barrier = true);

-- 9. POLITIQUE DE NETTOYAGE AUTOMATIQUE
CREATE OR REPLACE FUNCTION public.cleanup_failed_generations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
BEGIN
    -- Supprimer les générations échouées anciennes (> 24h)
    DELETE FROM public.unified_music_generation
    WHERE status = 'failed' 
    AND created_at < now() - INTERVAL '24 hours';

    -- Nettoyer les analytics anciennes (> 1 an) pour performance
    DELETE FROM public.medical_learning_analytics
    WHERE created_at < now() - INTERVAL '1 year';
END;
$$;