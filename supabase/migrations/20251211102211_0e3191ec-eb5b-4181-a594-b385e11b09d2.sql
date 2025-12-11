-- Add SRS columns to existing flashcards table
ALTER TABLE public.flashcards ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE public.flashcards ADD COLUMN IF NOT EXISTS correct_count INTEGER DEFAULT 0;
ALTER TABLE public.flashcards ADD COLUMN IF NOT EXISTS last_reviewed TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.flashcards ADD COLUMN IF NOT EXISTS next_review TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.flashcards ADD COLUMN IF NOT EXISTS ease_factor NUMERIC(4,2) DEFAULT 2.5;
ALTER TABLE public.flashcards ADD COLUMN IF NOT EXISTS interval_days INTEGER DEFAULT 0;

-- Add index for SRS queries
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON public.flashcards(next_review);