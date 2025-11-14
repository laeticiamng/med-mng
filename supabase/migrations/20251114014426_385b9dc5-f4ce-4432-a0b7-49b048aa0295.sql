-- Create user_edn_progress table to track individual EDN item progress
CREATE TABLE IF NOT EXISTS public.user_edn_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'mastered')),
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  time_spent_minutes INTEGER DEFAULT 0 CHECK (time_spent_minutes >= 0),
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_number)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_edn_progress_user_id ON public.user_edn_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_edn_progress_status ON public.user_edn_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_edn_progress_item ON public.user_edn_progress(item_number);

-- Enable Row Level Security
ALTER TABLE public.user_edn_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own progress"
  ON public.user_edn_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_edn_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_edn_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
  ON public.user_edn_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_edn_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_edn_progress_updated_at_trigger
  BEFORE UPDATE ON public.user_edn_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_edn_progress_updated_at();

-- Create function to get user progress summary
CREATE OR REPLACE FUNCTION public.get_user_edn_progress_summary(target_user_id UUID)
RETURNS TABLE (
  total_items BIGINT,
  completed_items BIGINT,
  in_progress_items BIGINT,
  mastered_items BIGINT,
  not_started_items BIGINT,
  total_time_spent BIGINT,
  average_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH progress_stats AS (
    SELECT 
      COUNT(CASE WHEN status = 'completed' OR status = 'mastered' THEN 1 END) as completed,
      COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
      COUNT(CASE WHEN status = 'mastered' THEN 1 END) as mastered,
      SUM(time_spent_minutes) as total_time,
      AVG(CASE WHEN score > 0 THEN score END) as avg_score
    FROM public.user_edn_progress
    WHERE user_id = target_user_id
  ),
  total_count AS (
    SELECT COUNT(*) as total FROM edn_items
  )
  SELECT 
    total_count.total,
    COALESCE(progress_stats.completed, 0),
    COALESCE(progress_stats.in_progress, 0),
    COALESCE(progress_stats.mastered, 0),
    (total_count.total - COALESCE(progress_stats.completed, 0) - COALESCE(progress_stats.in_progress, 0)),
    COALESCE(progress_stats.total_time, 0),
    COALESCE(progress_stats.avg_score, 0)
  FROM total_count, progress_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_user_edn_progress_summary(UUID) TO authenticated;

COMMENT ON TABLE public.user_edn_progress IS 'Tracks individual user progress on EDN items including completion status, score, and time spent';
COMMENT ON FUNCTION public.get_user_edn_progress_summary IS 'Returns aggregated progress statistics for a user across all EDN items';