-- ✅ SÉCURITÉ: Table pour stocker les tokens CSRF
-- Remplace le stockage en mémoire pour les Edge Functions

CREATE TABLE IF NOT EXISTS csrf_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Index pour recherche rapide
  CONSTRAINT csrf_token_unique UNIQUE (token)
);

-- Index pour nettoyage des tokens expirés
CREATE INDEX idx_csrf_tokens_expires_at ON csrf_tokens(expires_at);
CREATE INDEX idx_csrf_tokens_user_id ON csrf_tokens(user_id);

-- RLS: Seulement les admins peuvent gérer les tokens CSRF
ALTER TABLE csrf_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Les services avec service_role peuvent tout faire
CREATE POLICY "Service role can manage CSRF tokens"
  ON csrf_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fonction pour nettoyer les tokens expirés (exécutée périodiquement)
CREATE OR REPLACE FUNCTION clean_expired_csrf_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM csrf_tokens
  WHERE expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires
COMMENT ON TABLE csrf_tokens IS 'Stockage des tokens CSRF pour protection contre les attaques CSRF';
COMMENT ON COLUMN csrf_tokens.token IS 'Token CSRF unique généré pour chaque utilisateur';
COMMENT ON COLUMN csrf_tokens.expires_at IS 'Date d''expiration du token (24h par défaut)';
