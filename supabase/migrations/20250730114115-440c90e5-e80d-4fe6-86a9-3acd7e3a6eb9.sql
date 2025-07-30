-- Mise à jour des paroles IC-1 avec contenu médical réel
UPDATE edn_items_complete 
SET paroles_musicales = ARRAY[
  '[Couplet 1 - Rang A]',
  'Relation médecin-malade définie',
  'Approche paternaliste révolue',  
  'Empathie clinique développée',
  'Alliance thérapeutique construite',
  '',
  '[Refrain]',
  'IC-1 communication thérapeutique',
  'Représentation maladie comprise',
  'Ajustement stress accompagné', 
  'Rang A compétences maîtrisées',
  '',
  '[Couplet 2 - Rang A]',
  'Annonce mauvaise nouvelle structurée',
  'Facteurs communication identifiés',
  'Entretien motivationnel pratiqué',
  'Processus changement guidé',
  '',
  '[Refrain Final]',
  'IC-1 relation humaine centrale',
  'Quinze compétences OIC validées',
  'Communication soignant-soigné',
  'Excellence relationnelle atteinte'
]
WHERE slug = 'ic-1';