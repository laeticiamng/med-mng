-- Add table for IA task cancellations and increment quota function

CREATE TABLE public.ia_task_cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  provider TEXT,
  reason TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ia_task_cancellations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages cancellations" ON public.ia_task_cancellations
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to refund a credit when a task is cancelled
CREATE OR REPLACE FUNCTION public.med_mng_increment_quota()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.med_mng_subscriptions
  SET credits_left = credits_left + 1,
      updated_at = now()
  WHERE user_id = auth.uid();
END;
$$;

