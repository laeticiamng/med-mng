-- =============================================
-- MIGRATION: Add specialty and keywords columns for improved search
-- =============================================

-- Add missing columns for enhanced search functionality
ALTER TABLE public.edn_items_immersive 
ADD COLUMN IF NOT EXISTS specialite TEXT,
ADD COLUMN IF NOT EXISTS mots_cles TEXT[];

-- Create index for faster search
CREATE INDEX IF NOT EXISTS idx_edn_items_immersive_specialite ON public.edn_items_immersive(specialite);
CREATE INDEX IF NOT EXISTS idx_edn_items_immersive_mots_cles ON public.edn_items_immersive USING GIN(mots_cles);

-- Update specialty based on title patterns (medical specialties mapping)
UPDATE public.edn_items_immersive SET specialite = 'Éthique médicale'
WHERE (title ILIKE '%éthique%' OR title ILIKE '%relation médecin%' OR title ILIKE '%droits du patient%') AND specialite IS NULL;

UPDATE public.edn_items_immersive SET specialite = 'Santé publique'
WHERE (title ILIKE '%qualité%' OR title ILIKE '%sécurité des soins%' OR title ILIKE '%gestion des risques%') AND specialite IS NULL;

UPDATE public.edn_items_immersive SET specialite = 'Cardiologie'
WHERE (title ILIKE '%cardio%' OR title ILIKE '%infarctus%' OR title ILIKE '%insuffisance cardiaque%' OR title ILIKE '%arythmie%' OR title ILIKE '%hypertension%' OR title ILIKE '%coronar%' OR title ILIKE '%angine de poitrine%') AND specialite IS NULL;

UPDATE public.edn_items_immersive SET specialite = 'Pneumologie'
WHERE (title ILIKE '%pneumo%' OR title ILIKE '%pulmonaire%' OR title ILIKE '%asthme%' OR title ILIKE '%BPCO%' OR title ILIKE '%respirat%' OR title ILIKE '%dyspnée%' OR title ILIKE '%thorax%') AND specialite IS NULL;

UPDATE public.edn_items_immersive SET specialite = 'Neurologie'
WHERE (title ILIKE '%neuro%' OR title ILIKE '%AVC%' OR title ILIKE '%épilepsie%' OR title ILIKE '%céphal%' OR title ILIKE '%parkinson%' OR title ILIKE '%démence%' OR title ILIKE '%alzheimer%' OR title ILIKE '%sclérose%') AND specialite IS NULL;

UPDATE public.edn_items_immersive SET specialite = 'Gastro-entérologie'
WHERE (title ILIKE '%gastro%' OR title ILIKE '%digestif%' OR title ILIKE '%hépatique%' OR title ILIKE '%cirrhose%' OR title ILIKE '%hémorragie digestive%' OR title ILIKE '%diarrhée%' OR title ILIKE '%vomissement%') AND specialite IS NULL;

UPDATE public.edn_items_immersive SET specialite = 'Endocrinologie'
WHERE (title ILIKE '%diabète%' OR title ILIKE '%thyroïd%' OR title ILIKE '%hypoglycémie%' OR title ILIKE '%obésité%' OR title ILIKE '%métabol%' OR title ILIKE '%surrénale%') AND specialite IS NULL;

UPDATE public.edn_items_immersive SET specialite = 'Néphrologie'
WHERE (title ILIKE '%rein%' OR title ILIKE '%rénal%' OR title ILIKE '%dialyse%' OR title ILIKE '%insuffisance rénale%' OR title ILIKE '%glomérul%') AND specialite IS NULL;

UPDATE public.edn_items_immersive SET specialite = 'Rhumatologie'
WHERE (title ILIKE '%arthr%' OR title ILIKE '%rhumato%' OR title ILIKE '%polyarthrite%' OR title ILIKE '%spondyl%' OR title ILIKE '%ostéoporose%' OR title ILIKE '%articul%') AND specialite IS NULL;

UPDATE public.edn_items_immersive SET specialite = 'Dermatologie'
WHERE (title ILIKE '%dermato%' OR title ILIKE '%cutané%' OR title ILIKE '%peau%' OR title ILIKE '%eczéma%' OR title ILIKE '%psoriasis%' OR title ILIKE '%mélanome%') AND specialite IS NULL;

UPDATE public.edn_items_immersive SET specialite = 'Pédiatrie'
WHERE (title ILIKE '%enfant%' OR title ILIKE '%pédiatr%' OR title ILIKE '%nourrisson%' OR title ILIKE '%nouveau-né%' OR title ILIKE '%adolescent%' OR title ILIKE '%croissance%') AND specialite IS NULL;

UPDATE public.edn_items_immersive SET specialite = 'Gynécologie-Obstétrique'
WHERE (title ILIKE '%grossesse%' OR title ILIKE '%gynéco%' OR title ILIKE '%obstétr%' OR title ILIKE '%accouchement%' OR title ILIKE '%contraception%' OR title ILIKE '%ménopause%') AND specialite IS NULL;

UPDATE public.edn_items_immersive SET specialite = 'Psychiatrie'
WHERE (title ILIKE '%psychiatr%' OR title ILIKE '%dépression%' OR title ILIKE '%anxiété%' OR title ILIKE '%schizo%' OR title ILIKE '%trouble bipolaire%' OR title ILIKE '%suicide%' OR title ILIKE '%addiction%') AND specialite IS NULL;

UPDATE public.edn_items_immersive SET specialite = 'Urgences'
WHERE (title ILIKE '%urgence%' OR title ILIKE '%réanimation%' OR title ILIKE '%choc%' OR title ILIKE '%arrêt%' OR title ILIKE '%polytrauma%' OR title ILIKE '%intoxication%') AND specialite IS NULL;

UPDATE public.edn_items_immersive SET specialite = 'Infectiologie'
WHERE (title ILIKE '%infect%' OR title ILIKE '%bactéri%' OR title ILIKE '%viral%' OR title ILIKE '%fièvre%' OR title ILIKE '%antibio%' OR title ILIKE '%sepsis%' OR title ILIKE '%VIH%') AND specialite IS NULL;

UPDATE public.edn_items_immersive SET specialite = 'Hématologie'
WHERE (title ILIKE '%hémato%' OR title ILIKE '%anémie%' OR title ILIKE '%leucémie%' OR title ILIKE '%lymphome%' OR title ILIKE '%coagulation%' OR title ILIKE '%transfusion%') AND specialite IS NULL;

UPDATE public.edn_items_immersive SET specialite = 'Oncologie'
WHERE (title ILIKE '%cancer%' OR title ILIKE '%tumeur%' OR title ILIKE '%oncolog%' OR title ILIKE '%chimio%' OR title ILIKE '%radiothérap%' OR title ILIKE '%néoplas%') AND specialite IS NULL;

UPDATE public.edn_items_immersive SET specialite = 'Gériatrie'
WHERE (title ILIKE '%gériatr%' OR title ILIKE '%personne âgée%' OR title ILIKE '%vieillissement%' OR title ILIKE '%chute%' AND title ILIKE '%âgé%') AND specialite IS NULL;

UPDATE public.edn_items_immersive SET specialite = 'Ophtalmologie'
WHERE (title ILIKE '%œil%' OR title ILIKE '%ophtalmol%' OR title ILIKE '%vision%' OR title ILIKE '%rétine%' OR title ILIKE '%glaucome%' OR title ILIKE '%cataracte%') AND specialite IS NULL;

UPDATE public.edn_items_immersive SET specialite = 'ORL'
WHERE (title ILIKE '%ORL%' OR title ILIKE '%oreille%' OR title ILIKE '%gorge%' OR title ILIKE '%nez%' OR title ILIKE '%audition%' OR title ILIKE '%vertiges%' OR title ILIKE '%surdité%') AND specialite IS NULL;

UPDATE public.edn_items_immersive SET specialite = 'Médecine légale'
WHERE (title ILIKE '%certificat%' OR title ILIKE '%décès%' OR title ILIKE '%légal%' OR title ILIKE '%mort%' OR title ILIKE '%législation%') AND specialite IS NULL;

UPDATE public.edn_items_immersive SET specialite = 'Chirurgie'
WHERE (title ILIKE '%chirurg%' OR title ILIKE '%opérat%' OR title ILIKE '%bloc%') AND specialite IS NULL;

UPDATE public.edn_items_immersive SET specialite = 'Douleur et soins palliatifs'
WHERE (title ILIKE '%douleur%' OR title ILIKE '%palliatif%' OR title ILIKE '%antalg%' OR title ILIKE '%fin de vie%') AND specialite IS NULL;

-- Set default specialty for remaining items
UPDATE public.edn_items_immersive SET specialite = 'Médecine générale'
WHERE specialite IS NULL;