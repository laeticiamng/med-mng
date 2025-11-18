-- ✅ SÉCURITÉ: Table pour stocker les tokens de confirmation de purge RGPD
-- Remplace le système de token prévisible PURGE_${user_id}_CONFIRMED

CREATE TABLE IF NOT EXISTS rgpd_purge_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,

  -- Un seul token actif par utilisateur
  CONSTRAINT one_active_token_per_user UNIQUE (user_id)
);

-- Index pour recherche rapide
CREATE INDEX idx_rgpd_purge_tokens_user_id ON rgpd_purge_tokens(user_id);
CREATE INDEX idx_rgpd_purge_tokens_token ON rgpd_purge_tokens(token);
CREATE INDEX idx_rgpd_purge_tokens_expires_at ON rgpd_purge_tokens(expires_at);

-- RLS: Seuls les admins et service_role peuvent gérer ces tokens
ALTER TABLE rgpd_purge_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage purge tokens"
  ON rgpd_purge_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fonction pour générer un token de purge RGPD sécurisé
CREATE OR REPLACE FUNCTION generate_rgpd_purge_token(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
BEGIN
  -- Supprimer les anciens tokens de cet utilisateur
  DELETE FROM rgpd_purge_tokens WHERE user_id = p_user_id;

  -- Générer un nouveau token sécurisé
  v_token := gen_random_uuid()::TEXT || '-' || encode(gen_random_bytes(32), 'base64');

  -- Insérer le nouveau token
  INSERT INTO rgpd_purge_tokens (user_id, token, expires_at)
  VALUES (p_user_id, v_token, NOW() + INTERVAL '1 hour');

  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour nettoyer les tokens expirés
CREATE OR REPLACE FUNCTION clean_expired_rgpd_purge_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM rgpd_purge_tokens
  WHERE expires_at < NOW() OR used_at IS NOT NULL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires
COMMENT ON TABLE rgpd_purge_tokens IS 'Tokens sécurisés pour confirmation de purge RGPD (Article 17)';
COMMENT ON COLUMN rgpd_purge_tokens.token IS 'Token unique et non-prévisible pour confirmer la purge';
COMMENT ON COLUMN rgpd_purge_tokens.expires_at IS 'Expiration du token (1h par défaut)';
COMMENT ON COLUMN rgpd_purge_tokens.used_at IS 'Date d''utilisation du token (NULL si non utilisé)';
