-- Fonction temporaire pour corriger le track principal actuel
CREATE OR REPLACE FUNCTION public.fix_stuck_track_audio()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Corriger le track principal en copiant les données du premier track avec audio
  UPDATE generated_music_tracks main
  SET 
    audio_url = (
      SELECT audio_url 
      FROM generated_music_tracks 
      WHERE task_id = main.task_id 
        AND audio_url IS NOT NULL 
        AND audio_url != ''
      ORDER BY created_at ASC
      LIMIT 1
    ),
    stream_url = (
      SELECT stream_url 
      FROM generated_music_tracks 
      WHERE task_id = main.task_id 
        AND audio_url IS NOT NULL 
      ORDER BY created_at ASC
      LIMIT 1
    ),
    image_url = (
      SELECT image_url 
      FROM generated_music_tracks 
      WHERE task_id = main.task_id 
        AND audio_url IS NOT NULL 
      ORDER BY created_at ASC
      LIMIT 1
    ),
    duration = (
      SELECT duration 
      FROM generated_music_tracks 
      WHERE task_id = main.task_id 
        AND audio_url IS NOT NULL 
      ORDER BY created_at ASC
      LIMIT 1
    ),
    generation_status = 'completed',
    updated_at = NOW()
  WHERE 
    main.task_id = main.suno_track_id -- C'est le track principal
    AND (main.audio_url IS NULL OR main.audio_url = '')
    AND main.generation_status != 'completed'
    AND EXISTS (
      SELECT 1 FROM generated_music_tracks 
      WHERE task_id = main.task_id 
        AND audio_url IS NOT NULL 
        AND audio_url != ''
    );
    
  RAISE NOTICE 'Tracks principaux corrigés';
END;
$$;

-- Exécuter la correction
SELECT fix_stuck_track_audio();

COMMENT ON FUNCTION public.fix_stuck_track_audio IS 
'Corrige les tracks principaux qui n''ont pas reçu les audio_url des callbacks.';