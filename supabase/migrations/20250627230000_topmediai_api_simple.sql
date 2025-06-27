
-- Créer une table pour stocker les informations sur l'API TopMediAI (version simplifiée)
CREATE TABLE IF NOT EXISTS public.topmediai_api_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint_name TEXT NOT NULL,
  endpoint_url TEXT NOT NULL,
  method TEXT NOT NULL,
  description TEXT,
  parameters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer les informations des endpoints TopMediAI
INSERT INTO public.topmediai_api_config (endpoint_name, endpoint_url, method, description, parameters) VALUES
('submit_task', '/v2/submit', 'POST', 'Soumission de tache de generation musicale avec paroles', 
 '{"is_auto": 1, "prompt": "string", "lyrics": "string", "title": "string", "instrumental": 0, "model_version": "v3.5", "continue_at": 0}'),
('query_status', '/v2/query', 'GET', 'Interrogation du statut de generation de musique',
 '{"chanson_id": "string"}'),
('voices_list', '/v1/voices_list', 'GET', 'Liste des voix disponibles', '{}'),
('singers_list', '/v1/singers', 'GET', 'Liste des chanteurs disponibles', '{}');
