-- ===============================================
-- CORRECTION CRITIQUE SÉCURITÉ - VUE AUTH.USERS EXPOSÉE
-- ===============================================

-- Supprimer la vue qui expose auth.users (CRITIQUE)
DROP VIEW IF EXISTS public.medical_dashboard_view;

-- Créer une fonction sécurisée au lieu d'une vue
CREATE OR REPLACE FUNCTION public.get_medical_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
DECLARE
    current_user_id UUID;
    result JSONB;
BEGIN
    -- Authentification obligatoire
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Calculer les stats pour l'utilisateur connecté uniquement
    SELECT jsonb_build_object(
        'user_id', current_user_id,
        'studied_items', COUNT(DISTINCT mla.item_code),
        'completed_items', COUNT(DISTINCT CASE WHEN mla.action_type = 'completion' THEN mla.item_code END),
        'music_items', COUNT(DISTINCT CASE WHEN umg.status = 'completed' THEN umg.item_code END),
        'avg_quiz_score', COALESCE(AVG(mla.score) FILTER (WHERE mla.action_type = 'quiz'), 0),
        'total_study_time', COALESCE(SUM(mla.duration_seconds), 0),
        'last_activity', MAX(mla.created_at),
        'total_generations', COUNT(umg.id),
        'pending_generations', COUNT(umg.id) FILTER (WHERE umg.status = 'pending'),
        'progress_percentage', CASE 
            WHEN COUNT(DISTINCT mla.item_code) > 0 THEN 
                ROUND((COUNT(DISTINCT CASE WHEN mla.action_type = 'completion' THEN mla.item_code END)::NUMERIC / 367) * 100, 1)
            ELSE 0 
        END
    ) INTO result
    FROM public.medical_learning_analytics mla
    FULL OUTER JOIN public.unified_music_generation umg ON mla.user_id = umg.user_id
    WHERE mla.user_id = current_user_id OR umg.user_id = current_user_id;

    RETURN result;
END;
$$;