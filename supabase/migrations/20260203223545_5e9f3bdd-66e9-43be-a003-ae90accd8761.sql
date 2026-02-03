-- ============================================================================
-- AUDIT V9.6 - Corrections et enrichissements (schéma corrigé)
-- ============================================================================

-- 1. AJOUTER user_id à audio_transcriptions pour RLS cohérent
ALTER TABLE public.audio_transcriptions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. CORRECTION RLS audio_transcriptions avec user_id
DROP POLICY IF EXISTS "audio_transcriptions_insert_policy" ON public.audio_transcriptions;
DROP POLICY IF EXISTS "audio_transcriptions_update_policy" ON public.audio_transcriptions;
DROP POLICY IF EXISTS "audio_transcriptions_delete_policy" ON public.audio_transcriptions;
DROP POLICY IF EXISTS "audio_transcriptions_select_all" ON public.audio_transcriptions;

-- Audio transcriptions sont publiques en lecture (accessibilité)
CREATE POLICY "audio_transcriptions_select_all" ON public.audio_transcriptions
FOR SELECT TO authenticated USING (true);

CREATE POLICY "audio_transcriptions_insert_policy" ON public.audio_transcriptions 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "audio_transcriptions_update_policy" ON public.audio_transcriptions 
FOR UPDATE TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "audio_transcriptions_delete_policy" ON public.audio_transcriptions 
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 3. CORRECTION RLS medical_content_validations (utilise validator_id)
DROP POLICY IF EXISTS "medical_content_validations_insert_policy" ON public.medical_content_validations;
DROP POLICY IF EXISTS "medical_content_validations_update_policy" ON public.medical_content_validations;
DROP POLICY IF EXISTS "medical_content_validations_select_all" ON public.medical_content_validations;

-- Validations médicales lisibles par tous les authentifiés
CREATE POLICY "medical_content_validations_select_all" ON public.medical_content_validations
FOR SELECT TO authenticated USING (true);

CREATE POLICY "medical_content_validations_insert_policy" ON public.medical_content_validations 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = validator_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "medical_content_validations_update_policy" ON public.medical_content_validations 
FOR UPDATE TO authenticated 
USING (auth.uid() = validator_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

-- 4. CORRECTION RLS ai_content_feedback (user_id existe)
DROP POLICY IF EXISTS "ai_content_feedback_insert_policy" ON public.ai_content_feedback;
DROP POLICY IF EXISTS "ai_content_feedback_update_policy" ON public.ai_content_feedback;
DROP POLICY IF EXISTS "ai_content_feedback_delete_policy" ON public.ai_content_feedback;
DROP POLICY IF EXISTS "ai_content_feedback_select_all" ON public.ai_content_feedback;

CREATE POLICY "ai_content_feedback_select_all" ON public.ai_content_feedback
FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "ai_content_feedback_insert_policy" ON public.ai_content_feedback 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ai_content_feedback_update_policy" ON public.ai_content_feedback 
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "ai_content_feedback_delete_policy" ON public.ai_content_feedback 
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5. NOUVELLES TABLES pour enrichissement

-- Table: content_validation_queue (workflow validation médicale)
CREATE TABLE IF NOT EXISTS public.content_validation_queue (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('flashcard', 'quiz', 'clinical_case', 'ai_response', 'song_lyrics')),
    content_text TEXT NOT NULL,
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_validator UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'needs_revision')),
    validation_notes TEXT,
    medical_accuracy_score INTEGER CHECK (medical_accuracy_score >= 0 AND medical_accuracy_score <= 100),
    source_references TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    validated_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.content_validation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_validation_queue_select" ON public.content_validation_queue
FOR SELECT TO authenticated USING (
    auth.uid() = submitted_by 
    OR auth.uid() = assigned_validator 
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "content_validation_queue_insert" ON public.content_validation_queue
FOR INSERT TO authenticated WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "content_validation_queue_update" ON public.content_validation_queue
FOR UPDATE TO authenticated USING (
    auth.uid() = assigned_validator 
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Table: user_learning_preferences
CREATE TABLE IF NOT EXISTS public.user_learning_preferences (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    preferred_learning_style TEXT DEFAULT 'visual' CHECK (preferred_learning_style IN ('visual', 'auditory', 'reading', 'kinesthetic')),
    study_time_preference TEXT DEFAULT 'morning' CHECK (study_time_preference IN ('early_morning', 'morning', 'afternoon', 'evening', 'night')),
    session_duration_minutes INTEGER DEFAULT 25 CHECK (session_duration_minutes > 0 AND session_duration_minutes <= 180),
    daily_goal_minutes INTEGER DEFAULT 60 CHECK (daily_goal_minutes > 0 AND daily_goal_minutes <= 480),
    weekly_goal_items INTEGER DEFAULT 20 CHECK (weekly_goal_items > 0 AND weekly_goal_items <= 200),
    difficulty_preference TEXT DEFAULT 'adaptive' CHECK (difficulty_preference IN ('easy', 'medium', 'hard', 'adaptive')),
    notification_frequency TEXT DEFAULT 'daily' CHECK (notification_frequency IN ('never', 'daily', 'weekly', 'custom')),
    focus_areas TEXT[],
    weak_areas TEXT[],
    exam_date DATE,
    music_enabled BOOLEAN DEFAULT true,
    voice_enabled BOOLEAN DEFAULT false,
    gamification_enabled BOOLEAN DEFAULT true,
    accessibility_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_learning_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_learning_preferences_all" ON public.user_learning_preferences
FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Table: accessibility_settings
CREATE TABLE IF NOT EXISTS public.accessibility_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    high_contrast BOOLEAN DEFAULT false,
    reduce_motion BOOLEAN DEFAULT false,
    screen_reader_optimized BOOLEAN DEFAULT false,
    font_size_scale DECIMAL(3,2) DEFAULT 1.0 CHECK (font_size_scale >= 0.5 AND font_size_scale <= 3.0),
    dyslexia_friendly_font BOOLEAN DEFAULT false,
    color_blind_mode TEXT CHECK (color_blind_mode IS NULL OR color_blind_mode IN ('protanopia', 'deuteranopia', 'tritanopia')),
    keyboard_only_navigation BOOLEAN DEFAULT false,
    audio_descriptions BOOLEAN DEFAULT false,
    captions_enabled BOOLEAN DEFAULT true,
    focus_indicators_enhanced BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.accessibility_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accessibility_settings_all" ON public.accessibility_settings
FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_content_validation_queue_status ON public.content_validation_queue(status);
CREATE INDEX IF NOT EXISTS idx_content_validation_queue_priority ON public.content_validation_queue(priority);
CREATE INDEX IF NOT EXISTS idx_content_validation_queue_submitted_by ON public.content_validation_queue(submitted_by);
CREATE INDEX IF NOT EXISTS idx_user_learning_preferences_user_id ON public.user_learning_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_accessibility_settings_user_id ON public.accessibility_settings(user_id);

-- 7. TRIGGERS (vérifier si la fonction existe avant)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_content_validation_queue_updated_at') THEN
        CREATE TRIGGER update_content_validation_queue_updated_at
            BEFORE UPDATE ON public.content_validation_queue
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_learning_preferences_updated_at') THEN
        CREATE TRIGGER update_user_learning_preferences_updated_at
            BEFORE UPDATE ON public.user_learning_preferences
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_accessibility_settings_updated_at') THEN
        CREATE TRIGGER update_accessibility_settings_updated_at
            BEFORE UPDATE ON public.accessibility_settings
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END
$$;