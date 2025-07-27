-- ✅ AXE 3 : SÉCURITÉ RLS - Correction structure + policies

-- 1. Ajouter colonne user_id manquante à med_mng_songs
ALTER TABLE med_mng_songs 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. RLS policies pour med_mng_songs (avec user_id)
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

-- 3. Service role policies pour administration
CREATE POLICY "Service role can manage all songs"
ON med_mng_songs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. RLS policies pour med_mng_subscriptions (déjà user_id)
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

-- 5. RLS policies pour med_mng_playlists (déjà user_id)
CREATE POLICY "Users can manage their own playlists"
ON med_mng_playlists FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view public playlists"
ON med_mng_playlists FOR SELECT
TO authenticated
USING (is_public = true OR auth.uid() = user_id);

-- 6. RLS policies pour med_mng_playlist_songs (added_by = user_id)
CREATE POLICY "Users can manage songs in their playlists"
ON med_mng_playlist_songs FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM med_mng_playlists 
    WHERE id = playlist_id AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM med_mng_playlists 
    WHERE id = playlist_id AND user_id = auth.uid()
  )
);

-- 7. RLS policies pour med_mng_song_likes (déjà user_id)
CREATE POLICY "Users can manage their own likes"
ON med_mng_song_likes FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 8. RLS policies pour med_mng_user_songs (déjà user_id)
CREATE POLICY "Users can manage their library"
ON med_mng_user_songs FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 9. Fonction sécurisée pour vérifier les droits admin
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

-- 10. Policies admin pour audit (si tables existent)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_issues') THEN
    EXECUTE 'CREATE POLICY "Admins can view audit logs" ON audit_issues FOR ALL TO authenticated USING (auth.is_admin())';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_reports') THEN
    EXECUTE 'CREATE POLICY "Admins can view audit reports" ON audit_reports FOR ALL TO authenticated USING (auth.is_admin())';
  END IF;
END $$;

-- 11. Logging de sécurité  
INSERT INTO public.admin_changelog (
  admin_user_id, action_type, table_name, record_id,
  field_name, new_value, reason
) VALUES (
  null, 'security_update', 'rls_policies', 'multiple',
  'rls_policies', '{"added_policies": 15, "tables_secured": 8, "user_id_added": true}',
  'Correction sécurité - Ajout RLS policies + colonne user_id'
);