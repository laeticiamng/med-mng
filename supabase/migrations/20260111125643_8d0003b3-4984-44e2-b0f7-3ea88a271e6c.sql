-- =====================================================
-- AUDIT SECURITY FIX PART 3: Corriger les dernières policies
-- =====================================================

-- auto_detected_skills
DROP POLICY IF EXISTS "System can insert auto-detected skills" ON public.auto_detected_skills;

-- blockchain_backups  
DROP POLICY IF EXISTS "Service role can insert backups" ON public.blockchain_backups;
DROP POLICY IF EXISTS "Service role can update backups" ON public.blockchain_backups;

-- edn_items_audit
DROP POLICY IF EXISTS "Allow authenticated users to insert audit results" ON public.edn_items_audit;
DROP POLICY IF EXISTS "Allow authenticated users to update audit results" ON public.edn_items_audit;

-- exchange_leaderboards
DROP POLICY IF EXISTS "System can manage leaderboards" ON public.exchange_leaderboards;

-- in_app_notifications
DROP POLICY IF EXISTS "Service can insert notifications" ON public.in_app_notifications;

-- med_mng_content_ai
DROP POLICY IF EXISTS "med_mng_content_ai_update" ON public.med_mng_content_ai;

-- med_mng_recommendations
DROP POLICY IF EXISTS "recommendations_insert" ON public.med_mng_recommendations;

-- med_mng_synchronized_lyrics
DROP POLICY IF EXISTS "med_mng_synchronized_lyrics_update" ON public.med_mng_synchronized_lyrics;

-- ml_assignment_history
DROP POLICY IF EXISTS "System can insert ML assignment history" ON public.ml_assignment_history;

-- music_fragments
DROP POLICY IF EXISTS "Service role can insert music fragments" ON public.music_fragments;

-- music_notifications
DROP POLICY IF EXISTS "System can create notifications" ON public.music_notifications;

-- newsletter_subscribers - garder mais avec anon/authenticated au lieu de public
DROP POLICY IF EXISTS "Permettre l'inscription à la newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscribers 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);