-- ============================================
-- MIGRATION CORRIGÉE: Leaderboard, Community, Index
-- ============================================

-- 1. FONCTION de calcul automatique du leaderboard (corrigée)
CREATE OR REPLACE FUNCTION public.refresh_leaderboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vider et recalculer le leaderboard
  DELETE FROM leaderboard_entries WHERE 1=1;
  
  INSERT INTO leaderboard_entries (
    id, user_id, rank, total_xp, weekly_xp, monthly_xp, streak_days, display_name, level, created_at
  )
  SELECT 
    gen_random_uuid(),
    g.user_id,
    ROW_NUMBER() OVER (ORDER BY g.total_points DESC)::integer,
    COALESCE(g.total_points, 0),
    COALESCE((
      SELECT SUM(points_earned)::integer 
      FROM gamification_activities 
      WHERE user_id = g.user_id 
      AND created_at >= date_trunc('week', CURRENT_DATE)
    ), 0),
    COALESCE((
      SELECT SUM(points_earned)::integer 
      FROM gamification_activities 
      WHERE user_id = g.user_id 
      AND created_at >= date_trunc('month', CURRENT_DATE)
    ), 0),
    COALESCE(g.longest_streak, 0),
    COALESCE(p.name, split_part(p.email, '@', 1), 'Utilisateur'),
    GREATEST(1, FLOOR(COALESCE(g.total_points, 0) / 1000) + 1)::integer, -- Calcul niveau
    now()
  FROM user_gamification_stats g
  LEFT JOIN profiles p ON p.id = g.user_id
  WHERE g.total_points > 0
  ORDER BY g.total_points DESC
  LIMIT 500;
END;
$$;

-- 2. INDEX pour performances
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_rank ON leaderboard_entries(rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_total_xp ON leaderboard_entries(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(challenge_date);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date ON mood_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gamification_activities_user_created ON gamification_activities(user_id, created_at);

-- 3. TABLE pour community_events si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'webinar',
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  max_participants INTEGER DEFAULT 0,
  current_participants INTEGER DEFAULT 0,
  created_by UUID,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS pour community_events
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active events" ON community_events;
CREATE POLICY "Anyone can view active events"
  ON community_events FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can create events" ON community_events;
CREATE POLICY "Authenticated users can create events"
  ON community_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- 4. TABLE pour event registrations
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES community_events(id) ON DELETE CASCADE,
  user_id UUID,
  registered_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'registered',
  UNIQUE(event_id, user_id)
);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own registrations" ON event_registrations;
CREATE POLICY "Users can view own registrations"
  ON event_registrations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can register for events" ON event_registrations;
CREATE POLICY "Users can register for events"
  ON event_registrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own registrations" ON event_registrations;
CREATE POLICY "Users can delete own registrations"
  ON event_registrations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Seed data pour community_events
INSERT INTO community_events (title, description, event_type, event_date, location, max_participants)
VALUES 
  ('Webinaire: Nouvelles Approches Pédagogiques', 'Découvrez les dernières innovations en pédagogie médicale', 'webinar', now() + interval '3 days', 'En ligne', 500),
  ('Atelier Pratique: Mémorisation Musicale', 'Session pratique pour créer des mnémotechniques', 'workshop', now() + interval '7 days', 'Paris, Faculté de Médecine', 30),
  ('Concours: Meilleure Chanson EDN', 'Participez au concours de création musicale. Prix: 500€!', 'competition', now() + interval '14 days', NULL, 0),
  ('Meetup Étudiants Médecine', 'Rencontre informelle entre étudiants', 'meetup', now() + interval '5 days', 'Lyon', 50)
ON CONFLICT DO NOTHING;

-- 6. Refresh initial du leaderboard
SELECT public.refresh_leaderboard();