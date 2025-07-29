-- Table pour gérer le contenu unique/partagé BD/Roman/Poème
CREATE TABLE IF NOT EXISTS public.med_mng_content_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT NOT NULL UNIQUE,
  
  -- Contenu généré (stocké une seule fois pour tous)
  comic_data JSONB,
  novel_data JSONB, 
  poem_data JSONB,
  images_data JSONB,
  
  -- Métadonnées de génération
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  generation_version TEXT DEFAULT 'v1.0',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Stats d'utilisation
  views_count INTEGER DEFAULT 0,
  unique_viewers_count INTEGER DEFAULT 0,
  avg_reading_time INTEGER DEFAULT 0, -- en secondes
  
  -- Métadonnées qualité
  quality_score INTEGER DEFAULT 0, -- 0-100
  has_lyrics_sync BOOLEAN DEFAULT false,
  content_size_kb INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour tracker les consultations individuelles
CREATE TABLE IF NOT EXISTS public.med_mng_content_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  content_type TEXT NOT NULL CHECK (content_type IN ('comic', 'novel', 'poem', 'images')),
  
  -- Stats de consultation
  view_duration INTEGER DEFAULT 0, -- durée en secondes
  completed BOOLEAN DEFAULT false,
  completion_percentage INTEGER DEFAULT 0,
  
  -- Métadonnées
  device_type TEXT DEFAULT 'web',
  ip_address INET,
  user_agent TEXT,
  
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour performance
CREATE INDEX idx_content_master_item_id ON public.med_mng_content_master(item_id);
CREATE INDEX idx_content_views_item_user ON public.med_mng_content_views(item_id, user_id);
CREATE INDEX idx_content_views_type ON public.med_mng_content_views(content_type);
CREATE INDEX idx_content_views_date ON public.med_mng_content_views(viewed_at);

-- RLS Policies
ALTER TABLE public.med_mng_content_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_mng_content_views ENABLE ROW LEVEL SECURITY;

-- Contenu master : lecture publique, écriture admin seulement
CREATE POLICY "Allow public read access to master content" ON public.med_mng_content_master
  FOR SELECT USING (true);

CREATE POLICY "Allow admin write access to master content" ON public.med_mng_content_master
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Vues : insertion/lecture pour utilisateurs connectés
CREATE POLICY "Users can create their own content views" ON public.med_mng_content_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own content views" ON public.med_mng_content_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all content views" ON public.med_mng_content_views
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_content_master_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_master_updated_at
  BEFORE UPDATE ON public.med_mng_content_master
  FOR EACH ROW
  EXECUTE FUNCTION public.update_content_master_updated_at();

-- Trigger pour mettre à jour les stats après chaque vue
CREATE OR REPLACE FUNCTION public.update_content_stats_after_view()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour les compteurs dans content_master
  UPDATE public.med_mng_content_master 
  SET 
    views_count = views_count + 1,
    avg_reading_time = (
      SELECT COALESCE(AVG(view_duration), 0)::INTEGER
      FROM public.med_mng_content_views 
      WHERE item_id = NEW.item_id AND view_duration > 0
    ),
    updated_at = now()
  WHERE item_id = NEW.item_id;
  
  -- Mettre à jour unique_viewers_count
  UPDATE public.med_mng_content_master 
  SET unique_viewers_count = (
    SELECT COUNT(DISTINCT user_id)
    FROM public.med_mng_content_views 
    WHERE item_id = NEW.item_id AND user_id IS NOT NULL
  )
  WHERE item_id = NEW.item_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_stats_after_content_view
  AFTER INSERT ON public.med_mng_content_views
  FOR EACH ROW
  EXECUTE FUNCTION public.update_content_stats_after_view();

-- Fonction pour générer le contenu master d'un item
CREATE OR REPLACE FUNCTION public.generate_master_content(p_item_id TEXT)
RETURNS JSONB AS $$
DECLARE
  item_data RECORD;
  content_result JSONB := '{}';
BEGIN
  -- Récupérer les données de l'item
  SELECT * INTO item_data
  FROM public.edn_items_immersive
  WHERE item_code = p_item_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Item non trouvé');
  END IF;
  
  -- Créer ou mettre à jour le contenu master
  INSERT INTO public.med_mng_content_master (
    item_id,
    generated_at,
    quality_score
  ) VALUES (
    p_item_id,
    now(),
    85 -- Score de base
  )
  ON CONFLICT (item_id) DO UPDATE SET
    updated_at = now();
  
  RETURN jsonb_build_object(
    'success', true,
    'item_id', p_item_id,
    'message', 'Contenu master initialisé'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;