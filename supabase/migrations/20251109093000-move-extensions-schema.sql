-- Créer le schéma dédié aux extensions
CREATE SCHEMA IF NOT EXISTS extensions;

DO $$
BEGIN
  -- Déplacer pg_cron hors du schéma public si possible
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    IF (SELECT extrelocatable FROM pg_extension WHERE extname = 'pg_cron') THEN
      ALTER EXTENSION pg_cron SET SCHEMA extensions;
    END IF;
  ELSE
    CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
  END IF;

  -- Déplacer pg_net hors du schéma public si possible
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    IF (SELECT extrelocatable FROM pg_extension WHERE extname = 'pg_net') THEN
      ALTER EXTENSION pg_net SET SCHEMA extensions;
    END IF;
  ELSE
    CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
  END IF;
END $$;
