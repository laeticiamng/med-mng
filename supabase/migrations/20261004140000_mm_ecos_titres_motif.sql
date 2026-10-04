-- Décision CEO DC9 (04.10.2026) : titres des 12 situations ECOS.
--
-- CONSTAT : 8 titres sur 12 donnaient le diagnostic avant la station
-- (« Syndrome coronarien aigu ST+ », « AVC ischémique en phase aiguë »,
-- « Colique néphrétique hyperalgique », « Dépression du post-partum »,
-- « Allergie alimentaire sévère chez l'enfant », « Patient diabétique avec pied
-- infecté », « Accident de la voie publique - polytraumatisé », « Femme enceinte
-- avec contractions prématurées »). Une station ECOS commence par un motif de
-- consultation, pas par sa réponse.
--
-- Chaque titre devient le motif de consultation tiré mot pour mot de la
-- situation de départ déjà enregistrée (contenu_complet_html) : plainte
-- principale, sexe et âge du patient. Aucun contenu médical n'est ajouté.
-- Les 4 titres qui ne donnaient pas le diagnostic suivent le même format,
-- pour une liste homogène.
--
-- Idempotent : chaque mise à jour ne s'applique que si le titre d'origine est
-- encore en place. Les anciens titres sont sauvegardés (lecture : clé de
-- service uniquement, RLS sans politique).

CREATE TABLE IF NOT EXISTS public.mm_sauvegarde_ecos_titres (
  sd_id integer PRIMARY KEY,
  intitule_sd_origine text NOT NULL,
  sauvegarde_le timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mm_sauvegarde_ecos_titres ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mm_sauvegarde_ecos_titres FROM anon, authenticated;

INSERT INTO public.mm_sauvegarde_ecos_titres (sd_id, intitule_sd_origine)
SELECT sd_id, intitule_sd FROM public.ecos_situations_uness
WHERE sd_id BETWEEN 1 AND 12
ON CONFLICT (sd_id) DO NOTHING;

UPDATE public.ecos_situations_uness AS e
SET intitule_sd = v.nouveau
FROM (VALUES
  (1,  'Patient avec douleur thoracique aiguë',          'Douleur thoracique brutale chez un homme de 58 ans'),
  (2,  'Enfant avec fièvre et éruption cutanée',         'Fièvre et éruption cutanée chez une fillette de 4 ans'),
  (3,  'Personne âgée confuse aux urgences',             'Femme de 82 ans « pas comme d''habitude » depuis 24 heures'),
  (4,  'Femme enceinte avec contractions prématurées',   'Contractions douloureuses à 28 SA chez une femme de 32 ans'),
  (5,  'Adolescent avec idées suicidaires',              'Idées de mort chez un adolescent de 16 ans'),
  (6,  'Patient diabétique avec pied infecté',           'Plaie du pied depuis 3 semaines chez un homme diabétique de 67 ans'),
  (7,  'Accident de la voie publique - polytraumatisé',  'Accident de moto contre une voiture chez un homme d''environ 35 ans'),
  (8,  'Syndrome coronarien aigu ST+',                   'Douleur thoracique depuis 1 h 30 chez une femme de 65 ans'),
  (9,  'Colique néphrétique hyperalgique',               'Douleur lombaire droite depuis 6 heures chez un homme de 42 ans'),
  (10, 'AVC ischémique en phase aiguë',                  'Hémiplégie droite et aphasie brutales chez un homme de 72 ans'),
  (11, 'Allergie alimentaire sévère chez l''enfant',     'Urticaire généralisée et gêne respiratoire chez un garçon de 3 ans'),
  (12, 'Dépression du post-partum',                      'Fatigue et désintérêt pour son bébé à J21 du post-partum chez une femme de 29 ans')
) AS v(sd_id, ancien, nouveau)
WHERE e.sd_id = v.sd_id
  AND e.intitule_sd = v.ancien;
