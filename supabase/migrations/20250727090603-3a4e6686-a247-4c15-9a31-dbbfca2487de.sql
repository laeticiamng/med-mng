-- Mise à jour complète des paroles musicales pour chaque item EDN
-- Structure: Couplet 1 / Refrain / Couplet 2 / Refrain / Partie 3 / Refrain Final

-- Fonction pour générer des paroles structurées par item
CREATE OR REPLACE FUNCTION generate_structured_lyrics_for_item(
  p_item_code TEXT,
  p_title TEXT,
  p_competences_rang_a JSONB DEFAULT NULL,
  p_competences_rang_b JSONB DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  item_num INTEGER;
  paroles_rang_a TEXT[];
  paroles_rang_b TEXT[];
  paroles_mix TEXT[];
  competence_a_sample TEXT;
  competence_b_sample TEXT;
BEGIN
  -- Extraire le numéro d'item
  item_num := CAST(SUBSTRING(p_item_code FROM 'IC-([0-9]+)') AS INTEGER);
  
  -- Prendre un échantillon des compétences pour les paroles
  IF p_competences_rang_a IS NOT NULL AND jsonb_array_length(p_competences_rang_a->'sections') > 0 THEN
    competence_a_sample := COALESCE(
      p_competences_rang_a->'sections'->0->'title',
      '"Compétences fondamentales"'
    )::TEXT;
    competence_a_sample := REPLACE(competence_a_sample, '"', '');
  ELSE
    competence_a_sample := 'Connaissances de base';
  END IF;
  
  IF p_competences_rang_b IS NOT NULL AND jsonb_array_length(p_competences_rang_b->'sections') > 0 THEN
    competence_b_sample := COALESCE(
      p_competences_rang_b->'sections'->0->'title',
      '"Compétences expertes"'
    )::TEXT;
    competence_b_sample := REPLACE(competence_b_sample, '"', '');
  ELSE
    competence_b_sample := 'Expertise avancée';
  END IF;
  
  -- Générer paroles Rang A (structure complète)
  paroles_rang_a := ARRAY[
    '[Couplet 1 - Rang A]',
    'Item ' || p_item_code || ' je vais maîtriser',
    SUBSTRING(p_title FROM 1 FOR 40) || ' étudier',
    competence_a_sample || ' à retenir',
    'Les bases solides pour réussir',
    '',
    '[Refrain]',
    'EDN ' || p_item_code || ' chantons ensemble',
    'Compétences Rang A qui se rassemblent', 
    'Pour l''examen on se prépare',
    'Avec la musique tout devient plus claire',
    '',
    '[Couplet 2 - Rang A]',
    'Chaque concept je vais comprendre',
    'Les définitions bien apprendre',
    'Diagnostic et traitement savoir',
    'Pour mes patients tout donner',
    '',
    '[Refrain]',
    'EDN ' || p_item_code || ' chantons ensemble',
    'Compétences Rang A qui se rassemblent',
    'Pour l''examen on se prépare', 
    'Avec la musique tout devient plus claire',
    '',
    '[Partie 3 - Synthèse Rang A]',
    'Maintenant je maîtrise les bases',
    'De ' || SUBSTRING(p_title FROM 1 FOR 30) || ' les traces',
    'Rang A conquis avec assurance',
    'Place à l''excellence et à la performance',
    '',
    '[Refrain Final]',
    'Item ' || p_item_code || ' Rang A validé',
    'Connaissances solides intégrées',
    'Vers le rang B je vais progresser',
    'En musique médecine et réussite mélangées'
  ];
  
  -- Générer paroles Rang B (structure complète)
  paroles_rang_b := ARRAY[
    '[Couplet 1 - Rang B]',
    'Rang B de l''item ' || p_item_code || ' expert je deviens',
    SUBSTRING(p_title FROM 1 FOR 40) || ' je maîtrise enfin',
    competence_b_sample || ' à appliquer', 
    'Cas complexes je vais gérer',
    '',
    '[Refrain]',
    'Expertise ' || p_item_code || ' niveau supérieur',
    'Compétences avancées pour aller de l''avant',
    'Rang B c''est la maîtrise parfaite',
    'Excellence clinique qui se reflète',
    '',
    '[Couplet 2 - Rang B]',
    'Techniques pointues je développe',
    'Situations rares je n''échappe',
    'Innovation et précision',
    'Au service de ma mission',
    '',
    '[Refrain]',
    'Expertise ' || p_item_code || ' niveau supérieur',
    'Compétences avancées pour aller de l''avant',
    'Rang B c''est la maîtrise parfaite',
    'Excellence clinique qui se reflète',
    '',
    '[Partie 3 - Excellence Rang B]',
    'Spécialiste confirmé je suis',
    'De ' || SUBSTRING(p_title FROM 1 FOR 30) || ' l''esprit',
    'Rang B maîtrisé avec brio',
    'Expert reconnu, mission accomplie',
    '',
    '[Refrain Final]',
    'Item ' || p_item_code || ' expertise atteinte',
    'Rang B validé, compétence certaine',
    'Excellence clinique démontrée',
    'Médecine et musique réconciliées'
  ];
  
  -- Générer paroles Mix A+B (fusion des deux rangs)
  paroles_mix := ARRAY[
    '[Couplet 1 - Fusion A+B]',
    'Item ' || p_item_code || ' du rang A au rang B',
    'Parcours complet de A à Z',
    'Des bases jusqu''à l''expertise',
    'Maîtrise totale garantie',
    '',
    '[Refrain]',
    'A plus B égale excellence',
    'Compétences totales en évidence',
    'Fusion parfaite des savoirs',
    'Pour un succès sans égal',
    '',
    '[Couplet 2 - Complémentarité]',
    'Rang A donne les fondations',
    'Rang B apporte innovations',
    'Ensemble ils forment un tout',
    'Expertise sans aucun tabou',
    '',
    '[Refrain]',
    'A plus B égale excellence',
    'Compétences totales en évidence', 
    'Fusion parfaite des savoirs',
    'Pour un succès sans égal',
    '',
    '[Partie 3 - Synthèse Complète]',
    'De ' || SUBSTRING(p_title FROM 1 FOR 30) || ' je sais tout',
    'Compétences complètes partout',
    'A et B unis pour la réussite',
    'Médecin expert accompli',
    '',
    '[Refrain Final]',
    'Item ' || p_item_code || ' maîtrise totale',
    'A+B fusion magistrale',
    'Excellence complète atteinte',
    'Succès EDN mérité'
  ];
  
  RETURN jsonb_build_object(
    'rang_a', paroles_rang_a,
    'rang_b', paroles_rang_b,
    'rang_ab', paroles_mix
  );
END;
$$ LANGUAGE plpgsql;

-- Mettre à jour tous les items avec des paroles structurées
UPDATE edn_items_immersive 
SET paroles_musicales = (
  SELECT (generate_structured_lyrics_for_item(
    item_code, 
    title,
    tableau_rang_a,
    tableau_rang_b
  ))->>'rang_a'
)::TEXT[]
WHERE TRUE;

-- Ajouter colonnes pour stocker les paroles par rang
ALTER TABLE edn_items_immersive 
ADD COLUMN IF NOT EXISTS paroles_rang_a TEXT[],
ADD COLUMN IF NOT EXISTS paroles_rang_b TEXT[],
ADD COLUMN IF NOT EXISTS paroles_rang_ab TEXT[];

-- Remplir les nouvelles colonnes avec des paroles structurées pour chaque rang
UPDATE edn_items_immersive 
SET 
  paroles_rang_a = (generate_structured_lyrics_for_item(item_code, title, tableau_rang_a, tableau_rang_b))->>'rang_a',
  paroles_rang_b = (generate_structured_lyrics_for_item(item_code, title, tableau_rang_a, tableau_rang_b))->>'rang_b', 
  paroles_rang_ab = (generate_structured_lyrics_for_item(item_code, title, tableau_rang_a, tableau_rang_b))->>'rang_ab'
WHERE TRUE;