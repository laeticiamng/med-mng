-- Créer la table edn_items_immersive avec toutes les colonnes nécessaires
CREATE TABLE public.edn_items_immersive (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_code text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  slug text UNIQUE,
  pitch_intro text,
  tableau_rang_a jsonb,
  tableau_rang_b jsonb,
  quiz_questions jsonb,
  scene_immersive jsonb,
  paroles_musicales text[],
  paroles_rang_a text[],
  paroles_rang_b text[],
  paroles_rang_ab text[],
  competences_count_rang_a integer DEFAULT 0,
  competences_count_rang_b integer DEFAULT 0,
  competences_count_total integer DEFAULT 0,
  competences_oic_rang_a jsonb DEFAULT '[]'::jsonb,
  competences_oic_rang_b jsonb DEFAULT '[]'::jsonb,
  visual_ambiance jsonb,
  audio_ambiance jsonb,
  interaction_config jsonb,
  reward_messages jsonb,
  payload_v2 jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Copier les données de edn_items_complete vers edn_items_immersive
INSERT INTO public.edn_items_immersive (
  item_code,
  title,
  subtitle,
  slug,
  pitch_intro,
  tableau_rang_a,
  tableau_rang_b,
  quiz_questions,
  scene_immersive,
  paroles_musicales,
  competences_count_rang_a,
  competences_count_rang_b,
  competences_count_total,
  competences_oic_rang_a,
  competences_oic_rang_b,
  visual_ambiance,
  audio_ambiance,
  interaction_config,
  reward_messages,
  payload_v2,
  created_at,
  updated_at
)
SELECT 
  item_code,
  title,
  subtitle,
  slug,
  pitch_intro,
  tableau_rang_a,
  tableau_rang_b,
  quiz_questions,
  scene_immersive,
  paroles_musicales,
  competences_count_rang_a,
  competences_count_rang_b,
  competences_count_total,
  competences_oic_rang_a,
  competences_oic_rang_b,
  visual_ambiance,
  audio_ambiance,
  interaction_config,
  reward_messages,
  payload_v2,
  created_at,
  updated_at
FROM public.edn_items_complete;

-- Activer RLS
ALTER TABLE public.edn_items_immersive ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique
CREATE POLICY "Allow public read access to EDN items immersive" 
ON public.edn_items_immersive 
FOR SELECT 
USING (true);

-- Politique pour permettre les mises à jour par les fonctions service
CREATE POLICY "Service role can manage EDN items immersive" 
ON public.edn_items_immersive 
FOR ALL 
USING (true);

-- Créer un trigger pour updated_at
CREATE TRIGGER update_edn_items_immersive_updated_at
BEFORE UPDATE ON public.edn_items_immersive
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();