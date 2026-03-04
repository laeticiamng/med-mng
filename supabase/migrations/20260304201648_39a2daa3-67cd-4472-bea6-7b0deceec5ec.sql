
-- Specialty Paths: defines each guided path
CREATE TABLE public.specialty_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT '🩺',
  color TEXT DEFAULT '#6366f1',
  estimated_hours INTEGER DEFAULT 10,
  difficulty TEXT DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Path Steps: ordered items within a path
CREATE TABLE public.specialty_path_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID REFERENCES public.specialty_paths(id) ON DELETE CASCADE NOT NULL,
  item_code TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_checkpoint BOOLEAN DEFAULT false,
  checkpoint_type TEXT CHECK (checkpoint_type IN ('quiz', 'flashcard', 'clinical_case', NULL)),
  min_score_percent INTEGER DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(path_id, step_order)
);

-- User Path Progress: tracks per-user advancement
CREATE TABLE public.user_path_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  path_id UUID REFERENCES public.specialty_paths(id) ON DELETE CASCADE NOT NULL,
  current_step_order INTEGER DEFAULT 1,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  is_certified BOOLEAN DEFAULT false,
  certificate_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, path_id)
);

-- User Step Progress: tracks per-step completion
CREATE TABLE public.user_step_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  step_id UUID REFERENCES public.specialty_path_steps(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in_progress', 'completed', 'failed')),
  score INTEGER,
  attempts INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, step_id)
);

-- RLS
ALTER TABLE public.specialty_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialty_path_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_path_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_step_progress ENABLE ROW LEVEL SECURITY;

-- Public read for paths and steps
CREATE POLICY "Anyone can read published paths" ON public.specialty_paths FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can read path steps" ON public.specialty_path_steps FOR SELECT USING (true);

-- User progress: own data only
CREATE POLICY "Users manage own path progress" ON public.user_path_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own step progress" ON public.user_step_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Seed specialty paths
INSERT INTO public.specialty_paths (name, slug, description, icon, color, estimated_hours, difficulty) VALUES
  ('Cardiologie', 'cardiologie', 'Maîtrisez les pathologies cardiovasculaires : insuffisance cardiaque, SCA, valvulopathies, troubles du rythme et HTA.', '❤️', '#ef4444', 12, 'intermediate'),
  ('Neurologie', 'neurologie', 'AVC, épilepsie, SEP, Parkinson, céphalées : devenez expert en neurosciences cliniques.', '🧠', '#8b5cf6', 14, 'advanced'),
  ('Pneumologie', 'pneumologie', 'Asthme, BPCO, pneumopathies, cancer bronchique et insuffisance respiratoire.', '🫁', '#3b82f6', 10, 'intermediate'),
  ('Gastro-entérologie', 'gastro-enterologie', 'RGO, MICI, hépatites, cirrhose, pancréatite et cancers digestifs.', '🏥', '#f59e0b', 11, 'intermediate'),
  ('Endocrinologie', 'endocrinologie', 'Diabète, dysthyroïdies, insuffisance surrénalienne et troubles métaboliques.', '⚡', '#10b981', 9, 'beginner'),
  ('Néphrologie', 'nephrologie', 'Insuffisance rénale, glomérulopathies, dialyse et transplantation rénale.', '🫘', '#06b6d4', 8, 'advanced'),
  ('Hématologie', 'hematologie', 'Anémies, leucémies, lymphomes, hémostase et transfusion sanguine.', '🩸', '#dc2626', 10, 'advanced'),
  ('Infectiologie', 'infectiologie', 'Antibiothérapie, VIH, infections nosocomiales, sepsis et vaccinations.', '🦠', '#84cc16', 11, 'intermediate'),
  ('Pédiatrie', 'pediatrie', 'Croissance, vaccinations, urgences pédiatriques et pathologies néonatales.', '👶', '#f472b6', 10, 'beginner'),
  ('Psychiatrie', 'psychiatrie', 'Dépression, schizophrénie, troubles anxieux, addictions et urgences psychiatriques.', '🧩', '#a855f7', 9, 'intermediate');

-- Seed some steps for Cardiologie as example
INSERT INTO public.specialty_path_steps (path_id, item_code, step_order, title, description, is_checkpoint, checkpoint_type, min_score_percent)
SELECT p.id, v.item_code, v.step_order, v.title, v.description, v.is_checkpoint, v.checkpoint_type, v.min_score_percent
FROM public.specialty_paths p
CROSS JOIN (VALUES
  ('232', 1, 'Insuffisance cardiaque', 'Physiopathologie, diagnostic et traitement de l''IC', false, NULL, 70),
  ('234', 2, 'Troubles de la conduction', 'BAV, blocs de branche et indications du pacemaker', false, NULL, 70),
  ('CHECKPOINT', 3, '🏁 Checkpoint 1', 'Validez vos connaissances sur IC et troubles de conduction', true, 'quiz', 75),
  ('230', 4, 'Douleur thoracique', 'Diagnostic différentiel et prise en charge urgente', false, NULL, 70),
  ('339', 5, 'SCA ST+', 'Infarctus du myocarde : diagnostic, traitement et suivi', false, NULL, 70),
  ('CHECKPOINT', 6, '🏁 Checkpoint 2', 'Validez vos connaissances sur SCA et douleur thoracique', true, 'quiz', 80),
  ('231', 7, 'Valvulopathies', 'RA, IM, IA, RM : diagnostic et indications chirurgicales', false, NULL, 70),
  ('221', 8, 'HTA', 'Bilan, traitement et suivi de l''hypertension artérielle', false, NULL, 70),
  ('236', 9, 'Fibrillation atriale', 'FA : anticoagulation, contrôle du rythme et de la fréquence', false, NULL, 70),
  ('CHECKPOINT', 10, '🏁 Certification Cardiologie', 'Examen final de certification en cardiologie', true, 'quiz', 85)
) AS v(item_code, step_order, title, description, is_checkpoint, checkpoint_type, min_score_percent)
WHERE p.slug = 'cardiologie';
