
-- Supprimer les politiques RLS trop permissives (service_role bypasse RLS de toute façon)

-- 1. ai_monitoring_errors
DROP POLICY IF EXISTS "Service role can insert errors" ON public.ai_monitoring_errors;

-- 2. b2b_anonymous_sessions - supprimer l'ancienne, garder la nouvelle avec validation
DROP POLICY IF EXISTS "b2b_sessions_insert" ON public.b2b_anonymous_sessions;

-- 3. compliance_recommendations
DROP POLICY IF EXISTS "Service role can update recommendations" ON public.compliance_recommendations;

-- 4. emotionscare_songs
DROP POLICY IF EXISTS "Service role can update songs" ON public.emotionscare_songs;

-- 5. executive_business_metrics
DROP POLICY IF EXISTS "Service role can insert executive metrics" ON public.executive_business_metrics;
DROP POLICY IF EXISTS "Service role can update executive metrics" ON public.executive_business_metrics;

-- 6. ml_predictions
DROP POLICY IF EXISTS "Service role can insert ML predictions" ON public.ml_predictions;

-- 7. monitoring_events
DROP POLICY IF EXISTS "Service role can insert monitoring events" ON public.monitoring_events;

-- 8. newsletter_subscribers - supprimer l'ancienne, garder la nouvelle avec validation email
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
