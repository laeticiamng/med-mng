-- Table pour l'idempotence des callbacks et opérations critiques
CREATE TABLE IF NOT EXISTS public.idempotency_records (
  operation_key TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  result JSONB,
  CONSTRAINT idempotency_ttl CHECK (created_at > NOW() - INTERVAL '1 hour')
);

CREATE INDEX IF NOT EXISTS idx_idempotency_created_at ON public.idempotency_records(created_at);
CREATE INDEX IF NOT EXISTS idx_idempotency_user_id ON public.idempotency_records(user_id) WHERE user_id IS NOT NULL;

-- RLS pour sécurité
ALTER TABLE public.idempotency_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own idempotency records" ON public.idempotency_records;
CREATE POLICY "Users can view own idempotency records" ON public.idempotency_records
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

-- Fonction helper pour créer la table (appelée par le code si besoin)
CREATE OR REPLACE FUNCTION public.create_idempotency_table()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 1; -- Table créée dans la migration
$$;

COMMENT ON TABLE public.idempotency_records IS 
'Enregistrements pour garantir l''idempotence des callbacks et opérations critiques.';