
CREATE TABLE IF NOT EXISTS public.verification_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_code text NOT NULL,
  item_title text NOT NULL,
  verification_type text NOT NULL DEFAULT 'full',
  title_match boolean,
  title_official text,
  title_notes text,
  rang_a_verified integer DEFAULT 0,
  rang_a_issues integer DEFAULT 0,
  rang_b_verified integer DEFAULT 0,
  rang_b_issues integer DEFAULT 0,
  issues jsonb DEFAULT '[]'::jsonb,
  sources jsonb DEFAULT '[]'::jsonb,
  overall_score numeric(3,1),
  verified_at timestamptz DEFAULT now(),
  batch_id text,
  raw_response text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.verification_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on verification_results"
  ON public.verification_results FOR SELECT USING (true);

CREATE POLICY "Allow service role insert on verification_results"
  ON public.verification_results FOR INSERT WITH CHECK (true);

CREATE INDEX idx_verification_results_item_code ON public.verification_results(item_code);
CREATE INDEX idx_verification_results_batch_id ON public.verification_results(batch_id);
