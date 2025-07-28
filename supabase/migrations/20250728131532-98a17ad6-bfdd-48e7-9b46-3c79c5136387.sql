-- CORRECTION DU PROBLÈME RLS/USER_ID (version corrigée)

-- 1. Diagnostic des tracks existants
SELECT 
    COUNT(*) as total_tracks,
    COUNT(CASE WHEN generation_status = 'completed' THEN 1 END) as completed_tracks,
    COUNT(CASE WHEN audio_url IS NOT NULL THEN 1 END) as with_audio_url
FROM generated_music_tracks;

-- 2. CORRECTION: Supprimer les policies restrictives existantes
DROP POLICY IF EXISTS "Users can only see their own tracks" ON generated_music_tracks;
DROP POLICY IF EXISTS "Users can only insert their own tracks" ON generated_music_tracks;
DROP POLICY IF EXISTS "Users can only update their own tracks" ON generated_music_tracks;

-- 3. Créer des policies permissives pour le développement
CREATE POLICY "dev_read_all_tracks" ON generated_music_tracks
    FOR SELECT
    USING (
        -- Permettre l'accès aux tracks anonymes
        user_id = '00000000-0000-0000-0000-000000000000'::uuid
        OR 
        -- Permettre l'accès aux tracks de l'utilisateur connecté
        auth.uid() = user_id
        OR
        -- En mode développement, permettre tout accès si pas d'utilisateur connecté
        auth.uid() IS NULL
    );

CREATE POLICY "dev_insert_tracks" ON generated_music_tracks
    FOR INSERT
    WITH CHECK (
        -- Utiliser l'user_id fourni ou anonyme par défaut
        user_id = COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
    );

CREATE POLICY "dev_update_tracks" ON generated_music_tracks
    FOR UPDATE
    USING (
        user_id = '00000000-0000-0000-0000-000000000000'::uuid
        OR 
        auth.uid() = user_id
        OR
        auth.uid() IS NULL
    );

-- 4. Normaliser les user_id existants (corrigé)
UPDATE generated_music_tracks 
SET user_id = '00000000-0000-0000-0000-000000000000'::uuid
WHERE user_id IS NULL;

-- 5. Fonction helper pour debug
CREATE OR REPLACE FUNCTION get_all_music_tracks()
RETURNS TABLE (
    id uuid,
    title text,
    generation_status text,
    audio_url text,
    user_id uuid,
    created_at timestamp with time zone
) 
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gmt.id,
        gmt.title,
        gmt.generation_status,
        gmt.audio_url,
        gmt.user_id,
        gmt.created_at
    FROM generated_music_tracks gmt
    WHERE gmt.generation_status = 'completed'
    AND gmt.audio_url IS NOT NULL
    ORDER BY gmt.created_at DESC;
END;
$$ LANGUAGE plpgsql;