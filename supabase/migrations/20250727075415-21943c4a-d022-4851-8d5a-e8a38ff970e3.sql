-- ✅ AXE 3 : SÉCURITÉ RLS - Correction des tables sans policies

-- 1. Ajouter les RLS policies manquantes pour med_mng_songs
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

-- 2. Service role policies pour administration
CREATE POLICY "Service role can manage all songs"
ON med_mng_songs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Ajouter RLS policies pour med_mng_subscriptions
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

-- 4. RLS policies pour med_mng_playlists
CREATE POLICY "Users can manage their own playlists"
ON med_mng_playlists FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view public playlists"
ON med_mng_playlists FOR SELECT
TO authenticated
USING (is_public = true OR auth.uid() = user_id);

-- 5. RLS policies pour med_mng_playlist_songs
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

-- 8. Créer une fonction sécurisée pour vérifier les droits admin
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

-- 9. Policies admin pour les tables audit/logs
CREATE POLICY "Admins can view audit logs"
ON audit_issues FOR ALL
TO authenticated
USING (auth.is_admin());

CREATE POLICY "Admins can view audit reports"  
ON audit_reports FOR ALL
TO authenticated
USING (auth.is_admin());

-- 10. Logging de sécurité
INSERT INTO public.admin_changelog (
  admin_user_id, action_type, table_name, record_id,
  field_name, new_value, reason
) VALUES (
  null, 'security_update', 'rls_policies', 'multiple',
  'rls_policies', '{"added_policies": 15, "tables_secured": 8}',
  'Correction sécurité - Ajout RLS policies manquantes'
);