
-- Corriger la politique b2b_anonymous_sessions avec le bon nom de colonne
DROP POLICY IF EXISTS "b2b_sessions_insert_v2" ON public.b2b_anonymous_sessions;
CREATE POLICY "b2b_sessions_insert_v2" ON public.b2b_anonymous_sessions
FOR INSERT WITH CHECK (
  session_hash IS NOT NULL AND
  LENGTH(session_hash) >= 10
);

-- Ré-ajouter la politique newsletter si elle a été supprimée
DROP POLICY IF EXISTS "newsletter_subscribe_valid_email" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_subscribe_valid_email" ON public.newsletter_subscribers
FOR INSERT WITH CHECK (
  email IS NOT NULL AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);
