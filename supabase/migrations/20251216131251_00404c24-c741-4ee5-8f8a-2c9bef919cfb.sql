-- Add missing columns to pwa_metrics table
ALTER TABLE public.pwa_metrics ADD COLUMN IF NOT EXISTS browser TEXT;
ALTER TABLE public.pwa_metrics ADD COLUMN IF NOT EXISTS os TEXT;
ALTER TABLE public.pwa_metrics ADD COLUMN IF NOT EXISTS screen_width INTEGER;
ALTER TABLE public.pwa_metrics ADD COLUMN IF NOT EXISTS screen_height INTEGER;
ALTER TABLE public.pwa_metrics ADD COLUMN IF NOT EXISTS page_views INTEGER DEFAULT 0;