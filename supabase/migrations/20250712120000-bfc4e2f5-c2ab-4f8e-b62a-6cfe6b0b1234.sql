-- Création des tables de contenus pédagogiques complémentaires

-- Table principale des items (meta)
CREATE TABLE IF NOT EXISTS public.med_mng_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  item_type TEXT,
  is_validated BOOLEAN DEFAULT FALSE,
  is_static BOOLEAN DEFAULT FALSE,
  last_checked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des vignettes de bande dessinée générées
CREATE TABLE IF NOT EXISTS public.comic_panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.med_mng_items(id) ON DELETE CASCADE,
  panel_number INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  prompt TEXT,
  is_static BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des versions de romans pédagogiques
CREATE TABLE IF NOT EXISTS public.roman_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.med_mng_items(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  source_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des pistes musicales liées aux items
CREATE TABLE IF NOT EXISTS public.music_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.med_mng_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  track_url TEXT NOT NULL,
  is_static BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des questions de quiz interactif
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.med_mng_items(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des journaux d'audit de vérification
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.med_mng_items(id) ON DELETE CASCADE,
  success BOOLEAN,
  report JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer la sécurité au niveau des lignes
ALTER TABLE public.med_mng_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comic_panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roman_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
