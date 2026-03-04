
-- Karaoke Duels System
CREATE TABLE public.karaoke_duels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'matched', 'countdown', 'playing', 'finished', 'cancelled')),
  player1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  player2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id TEXT,
  item_code TEXT,
  round_count INTEGER NOT NULL DEFAULT 5,
  current_round INTEGER NOT NULL DEFAULT 0,
  player1_score INTEGER NOT NULL DEFAULT 0,
  player2_score INTEGER NOT NULL DEFAULT 0,
  winner_id UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.duel_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  duel_id UUID REFERENCES public.karaoke_duels(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL,
  item_code TEXT,
  time_limit_seconds INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.duel_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  duel_id UUID REFERENCES public.karaoke_duels(id) ON DELETE CASCADE NOT NULL,
  round_id UUID REFERENCES public.duel_rounds(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  selected_answer INTEGER,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  answer_time_ms INTEGER,
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(round_id, user_id)
);

-- RLS
ALTER TABLE public.karaoke_duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_answers ENABLE ROW LEVEL SECURITY;

-- Duels: players can see their own duels
CREATE POLICY "Users can view their duels" ON public.karaoke_duels
  FOR SELECT TO authenticated
  USING (player1_id = auth.uid() OR player2_id = auth.uid());

CREATE POLICY "Users can create duels" ON public.karaoke_duels
  FOR INSERT TO authenticated
  WITH CHECK (player1_id = auth.uid());

CREATE POLICY "Players can update their duels" ON public.karaoke_duels
  FOR UPDATE TO authenticated
  USING (player1_id = auth.uid() OR player2_id = auth.uid());

-- Allow anyone to see waiting duels for matchmaking
CREATE POLICY "Anyone can see waiting duels" ON public.karaoke_duels
  FOR SELECT TO authenticated
  USING (status = 'waiting');

-- Rounds: visible to duel participants
CREATE POLICY "Duel players can view rounds" ON public.duel_rounds
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.karaoke_duels d
    WHERE d.id = duel_id AND (d.player1_id = auth.uid() OR d.player2_id = auth.uid())
  ));

CREATE POLICY "System can insert rounds" ON public.duel_rounds
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.karaoke_duels d
    WHERE d.id = duel_id AND (d.player1_id = auth.uid() OR d.player2_id = auth.uid())
  ));

-- Answers: users can insert their own answers
CREATE POLICY "Users can insert their answers" ON public.duel_answers
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Duel players can view answers" ON public.duel_answers
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.karaoke_duels d
    WHERE d.id = duel_id AND (d.player1_id = auth.uid() OR d.player2_id = auth.uid())
  ));

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.karaoke_duels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.duel_answers;

-- Index for matchmaking
CREATE INDEX idx_karaoke_duels_status ON public.karaoke_duels(status) WHERE status = 'waiting';
CREATE INDEX idx_karaoke_duels_players ON public.karaoke_duels(player1_id, player2_id);
