-- ✅ AXE 3 : SÉCURITÉ RLS - Version corrigée

-- 1. Ajouter colonne user_id à med_mng_songs si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'med_mng_songs' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE med_mng_songs 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. RLS policies pour med_mng_songs
CREATE POLICY "Users can create their own songs"
ON med_mng_songs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own songs"  
ON med_mng_songs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own songs"
ON med_mng_songs FOR UPDATE  
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own songs"
ON med_mng_songs FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 3. Service role policies
CREATE POLICY "Service role can manage all songs"
ON med_mng_songs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. RLS policies pour med_mng_subscriptions
CREATE POLICY "Users can view their own subscription"
ON med_mng_subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON med_mng_subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions"
ON med_mng_subscriptions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 5. RLS policies pour med_mng_playlists
CREATE POLICY "Users can manage their own playlists"
ON med_mng_playlists FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view public playlists"
ON med_mng_playlists FOR SELECT
TO authenticated
USING (is_public = true OR auth.uid() = user_id);

-- 6. RLS policies pour med_mng_song_likes
CREATE POLICY "Users can manage their own likes"
ON med_mng_song_likes FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. RLS policies pour med_mng_user_songs
CREATE POLICY "Users can manage their library"
ON med_mng_user_songs FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 8. Fonction sécurisée pour droits admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;