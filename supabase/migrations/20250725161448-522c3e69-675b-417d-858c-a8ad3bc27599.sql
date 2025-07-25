-- Create onboarding_steps table for contextual help and onboarding
CREATE TABLE IF NOT EXISTS public.onboarding_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  title JSONB NOT NULL DEFAULT '{}',
  body JSONB NOT NULL DEFAULT '{}',
  type TEXT NOT NULL DEFAULT 'onboarding' CHECK (type IN ('onboarding', 'tooltip', 'help')),
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.onboarding_steps ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Onboarding steps are publicly readable" 
ON public.onboarding_steps 
FOR SELECT 
USING (true);

-- Create policy for service role write access
CREATE POLICY "Service role can manage onboarding steps" 
ON public.onboarding_steps 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_onboarding_steps_updated_at
BEFORE UPDATE ON public.onboarding_steps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample onboarding steps
INSERT INTO public.onboarding_steps (key, title, body, type, version) VALUES
('welcome', 
 '{"en": "Welcome to EDN Medical Platform", "fr": "Bienvenue sur la Plateforme Médicale EDN"}',
 '{"en": "Discover how to generate your first medical songs and organize your learning content.", "fr": "Découvrez comment générer vos premières chansons médicales et organiser vos contenus d''apprentissage."}',
 'onboarding', 1),

('music-generation', 
 '{"en": "AI Music Generation", "fr": "Génération Musicale IA"}',
 '{"en": "Transform your EDN content into personalized songs with artificial intelligence. Choose your specialty, rank, and musical style.", "fr": "Transformez vos contenus EDN en chansons personnalisées avec l''intelligence artificielle. Choisissez votre spécialité, rang et style musical."}',
 'onboarding', 1),

('library-management', 
 '{"en": "Your Medical Library", "fr": "Votre Bibliothèque Médicale"}',
 '{"en": "Save, organize and access your musical creations. Create favorites and filter by specialty or style.", "fr": "Sauvegardez, organisez et accédez à vos créations musicales. Créez vos favoris et filtrez par spécialité ou style."}',
 'onboarding', 1),

('edn-navigation', 
 '{"en": "EDN Content Navigation", "fr": "Navigation des Contenus EDN"}',
 '{"en": "Browse through EDN items organized by specialty (IC-1 to IC-5) and rank (A or B) for structured learning.", "fr": "Parcourez les items EDN organisés par spécialité (IC-1 à IC-5) et rang (A ou B) pour un apprentissage structuré."}',
 'onboarding', 1);

-- Insert contextual help tooltips
INSERT INTO public.onboarding_steps (key, title, body, type, version) VALUES
('generator-style-help', 
 '{"en": "Choose Your Learning Style", "fr": "Choisissez Votre Style d''Apprentissage"}',
 '{"en": "Select the musical style that best suits your learning preferences:<br/>• <strong>Lo-Fi Piano</strong>: Relaxing and meditative<br/>• <strong>Afrobeat</strong>: Energetic and rhythmic<br/>• <strong>Modern Jazz</strong>: Sophisticated and smooth", "fr": "Sélectionnez le style musical qui convient le mieux à vos préférences d''apprentissage:<br/>• <strong>Lo-Fi Piano</strong> : relaxant et méditatif<br/>• <strong>Afrobeat</strong> : énergique et rythmé<br/>• <strong>Jazz Moderne</strong> : sophistiqué et smooth"}',
 'tooltip', 1),

('library-filters-help', 
 '{"en": "Filter Your Creations", "fr": "Filtrez Vos Créations"}',
 '{"en": "Use filters to quickly find your musical content by specialty, style, or creation date. This helps organize your learning materials efficiently.", "fr": "Utilisez les filtres pour retrouver rapidement vos contenus musicaux par spécialité, style ou date de création. Cela aide à organiser efficacement vos supports d''apprentissage."}',
 'tooltip', 1),

('edn-rank-help', 
 '{"en": "Understanding EDN Ranks", "fr": "Comprendre les Rangs EDN"}',
 '{"en": "EDN content is organized by ranks:<br/>• <strong>Rank A</strong>: Essential knowledge for your specialty<br/>• <strong>Rank B</strong>: Advanced and complementary content", "fr": "Les contenus EDN sont organisés par rangs:<br/>• <strong>Rang A</strong> : connaissances essentielles pour votre spécialité<br/>• <strong>Rang B</strong> : contenus avancés et complémentaires"}',
 'tooltip', 1);