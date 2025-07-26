-- ✅ TICKET BACKEND COMPLETION - Tables manquantes

-- Table pour l'historique des modifications (changelog admin)
CREATE TABLE public.admin_changelog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('update', 'create', 'delete', 'correction')),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  field_name TEXT,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les tâches d'intégrité automatisées
CREATE TABLE public.data_integrity_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  check_type TEXT NOT NULL CHECK (check_type IN ('post_import', 'scheduled', 'manual')),
  batch_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'blocked')),
  tables_checked TEXT[] NOT NULL,
  issues_found INTEGER DEFAULT 0,
  critical_issues INTEGER DEFAULT 0,
  should_block BOOLEAN DEFAULT false,
  results JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les corrections manuelles en attente
CREATE TABLE public.pending_corrections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  field_name TEXT NOT NULL,
  current_value JSONB,
  proposed_value JSONB NOT NULL,
  correction_reason TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'applied')),
  requested_by UUID REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour performance
CREATE INDEX idx_admin_changelog_table_record ON public.admin_changelog(table_name, record_id);
CREATE INDEX idx_admin_changelog_created_at ON public.admin_changelog(created_at DESC);
CREATE INDEX idx_data_integrity_status ON public.data_integrity_checks(status);
CREATE INDEX idx_pending_corrections_status ON public.pending_corrections(status);

-- RLS Policies
ALTER TABLE public.admin_changelog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_integrity_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_corrections ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent accéder aux logs de modifications
CREATE POLICY "Admins can view changelog" ON public.admin_changelog
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert changelog" ON public.admin_changelog
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Policies pour les checks d'intégrité
CREATE POLICY "Admins can manage integrity checks" ON public.data_integrity_checks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Policies pour les corrections en attente
CREATE POLICY "Admins can manage pending corrections" ON public.pending_corrections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Fonction pour logger automatiquement les changements
CREATE OR REPLACE FUNCTION public.log_admin_change(
  p_table_name TEXT,
  p_record_id TEXT,
  p_field_name TEXT DEFAULT NULL,
  p_old_value JSONB DEFAULT NULL,
  p_new_value JSONB DEFAULT NULL,
  p_action_type TEXT DEFAULT 'update',
  p_reason TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  changelog_id UUID;
BEGIN
  INSERT INTO public.admin_changelog (
    admin_user_id, action_type, table_name, record_id, 
    field_name, old_value, new_value, reason
  ) VALUES (
    auth.uid(), p_action_type, p_table_name, p_record_id,
    p_field_name, p_old_value, p_new_value, p_reason
  ) RETURNING id INTO changelog_id;
  
  RETURN changelog_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;