-- Create study_plans table
CREATE TABLE public.study_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  progress INTEGER NOT NULL DEFAULT 0,
  sessions_completed INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

-- RLS policies for study_plans
CREATE POLICY "Users can view their own study plans"
ON public.study_plans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study plans"
ON public.study_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study plans"
ON public.study_plans FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study plans"
ON public.study_plans FOR DELETE
USING (auth.uid() = user_id);

-- Create plan_sessions table for individual sessions within plans
CREATE TABLE public.plan_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.study_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  completed BOOLEAN NOT NULL DEFAULT false,
  scheduled_date DATE NOT NULL,
  completed_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  item_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plan_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for plan_sessions
CREATE POLICY "Users can view their own plan sessions"
ON public.plan_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plan sessions"
ON public.plan_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plan sessions"
ON public.plan_sessions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plan sessions"
ON public.plan_sessions FOR DELETE
USING (auth.uid() = user_id);

-- Update trigger for study_plans
CREATE TRIGGER update_study_plans_updated_at
BEFORE UPDATE ON public.study_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();