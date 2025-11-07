-- Créer la table pour les logs d'emails si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  recipients TEXT[] NOT NULL,
  report_data JSONB,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resend_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON public.email_logs(type);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON public.email_logs(sent_at DESC);

-- RLS pour la table email_logs (service-only)
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage email logs"
  ON public.email_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Configurer le cron job pour l'envoi hebdomadaire automatique
-- S'exécute tous les lundis à 9h00 UTC
SELECT cron.schedule(
  'weekly-alerts-report',
  '0 9 * * 1', -- Chaque lundi à 9h00
  $$
  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/send-weekly-alerts-report',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);

COMMENT ON TABLE public.email_logs IS 'Historique des emails envoyés automatiquement par le système';