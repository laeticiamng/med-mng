-- Stopper temporairement les cron jobs automatiques pour debug
SELECT cron.unschedule('extraction-oic-autonome');
SELECT cron.unschedule('extraction-oic-immediate');

-- Optionnel: stopper aussi le cleanup automatique
SELECT cron.unschedule('stop-immediate-trigger');