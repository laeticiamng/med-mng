-- Table pour les logs d'accès au streaming sécurisé
CREATE TABLE IF NOT EXISTS public.streaming_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id UUID NOT NULL,
  session_token TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('session_created', 'stream_accessed')),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.streaming_access_logs ENABLE ROW LEVEL SECURITY;

-- Policies pour les logs de streaming
CREATE POLICY "Admin can view all streaming logs" 
ON public.streaming_access_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Service role can manage streaming logs" 
ON public.streaming_access_logs 
FOR ALL 
USING (true);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_streaming_logs_user_id ON public.streaming_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_streaming_logs_created_at ON public.streaming_access_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_streaming_logs_action ON public.streaming_access_logs(action);
CREATE INDEX IF NOT EXISTS idx_streaming_logs_session_token ON public.streaming_access_logs(session_token);

-- Function pour nettoyer les anciens logs automatiquement
CREATE OR REPLACE FUNCTION public.cleanup_old_streaming_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.streaming_access_logs 
  WHERE created_at < now() - INTERVAL '30 days';
END;
$$;