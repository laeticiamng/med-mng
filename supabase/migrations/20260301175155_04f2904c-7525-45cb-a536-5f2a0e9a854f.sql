
-- Ajouter une contrainte unique sur objectif_id pour permettre les upserts
ALTER TABLE public.backup_oic_competences 
ADD CONSTRAINT backup_oic_competences_objectif_id_unique UNIQUE (objectif_id);
