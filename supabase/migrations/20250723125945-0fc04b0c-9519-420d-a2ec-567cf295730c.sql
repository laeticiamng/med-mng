-- Fonction simple pour mettre à jour les paroles musicales manquantes
UPDATE edn_items_immersive 
SET paroles_musicales = ARRAY[
  'Item EDN - Formation médicale interactive',
  'Apprentissage par la musique et les sons',
  'Compétences médicales essentielles',
  'Rang A et B pour l''excellence',
  '[Refrain] EDN - Éducation musicale',
  'Mémorisation facilitée par le rythme',
  'Connaissances solides et durables',
  'Réussite aux examens garantie',
  'Expertise clinique développée',
  'Pratique médicale de qualité',
  'Soins patients optimisés',
  'Formation continue enrichie',
  '[Refrain Final] EDN réussite',
  'Médecine apprise avec plaisir',
  'Compétences acquises pour la vie',
  'Excellence médicale atteinte'
]
WHERE paroles_musicales IS NULL 
   OR array_length(paroles_musicales, 1) < 8;