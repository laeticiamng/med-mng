-- Seed data pour daily_challenges avec les valeurs valides selon les contraintes
INSERT INTO public.daily_challenges (title, description, type, objective, target_value, reward_xp, difficulty, challenge_date, reward_type, reward_value, emotional_profile) VALUES
  ('Premier pas du jour', 'Visitez la plateforme aujourd''hui', 'visit', 'daily_visit', 1, 50, 'easy', CURRENT_DATE, 'badge_boost', '{"boost": 1.5}'::jsonb, 'all'),
  ('Série gagnante', 'Maintenez votre streak de connexion', 'streak', 'maintain_streak', 3, 75, 'easy', CURRENT_DATE, 'badge_boost', '{"boost": 2}'::jsonb, 'energy'),
  ('Explorateur de zone', 'Complétez une zone d''étude', 'zone_complete', 'complete_zone', 1, 100, 'medium', CURRENT_DATE, 'theme_unlock', '{"theme": "medical_blue"}'::jsonb, 'creativity'),
  ('Marathonien', 'Passez 30 minutes sur la plateforme', 'time_spent', 'study_time', 30, 150, 'medium', CURRENT_DATE, 'avatar_unlock', '{"avatar": "scholar"}'::jsonb, 'calm'),
  ('Esprit social', 'Interagissez avec la communauté', 'social', 'community_interaction', 1, 200, 'hard', CURRENT_DATE, 'theme_unlock', '{"theme": "community_gold"}'::jsonb, 'social')
ON CONFLICT DO NOTHING;

-- Ajouter les colonnes manquantes à user_gamification_stats
ALTER TABLE public.user_gamification_stats 
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS weekly_points INTEGER DEFAULT 0;

-- Fonction pour rafraîchir le leaderboard
CREATE OR REPLACE FUNCTION public.refresh_leaderboard_entries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  rank_counter INTEGER := 1;
BEGIN
  DELETE FROM leaderboard_entries;
  
  FOR user_record IN
    SELECT 
      gs.user_id,
      COALESCE(gs.total_points, 0) as total_xp,
      COALESCE(gs.weekly_points, 0) as weekly_xp,
      COALESCE(gs.current_streak, 0) as streak_days,
      COALESCE(p.name, split_part(COALESCE(p.email, 'user'), '@', 1), 'Utilisateur') as display_name,
      p.avatar_url,
      GREATEST(FLOOR(COALESCE(gs.total_points, 0) / 1000) + 1, 1) as level
    FROM user_gamification_stats gs
    LEFT JOIN profiles p ON p.id = gs.user_id
    WHERE COALESCE(gs.total_points, 0) > 0
    ORDER BY gs.total_points DESC NULLS LAST
    LIMIT 100
  LOOP
    INSERT INTO leaderboard_entries (
      user_id, rank, total_xp, weekly_xp, monthly_xp, 
      streak_days, display_name, avatar_url, level
    ) VALUES (
      user_record.user_id, rank_counter, user_record.total_xp, user_record.weekly_xp, 
      user_record.weekly_xp, user_record.streak_days, user_record.display_name, 
      user_record.avatar_url, user_record.level::INTEGER
    );
    rank_counter := rank_counter + 1;
  END LOOP;
END;
$$;