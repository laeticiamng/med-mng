-- 🏆 CORRECTION FINALE ABSOLUE - ÉLIMINATION DES 22 DERNIERS INTITULÉS CORROMPUS
-- Objectif: 100.0000% PARFAIT

-- Correction spécifique de tous les guillemets français et simples
UPDATE oic_competences 
SET 
    intitule = REGEXP_REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(
                        REGEXP_REPLACE(
                            REGEXP_REPLACE(
                                REGEXP_REPLACE(intitule, '«\s*', '', 'g'), -- Guillemets français ouvrants
                            '\s*»', '', 'g'), -- Guillemets français fermants
                        '''', '', 'g'), -- Guillemets simples
                    '"', '', 'g'), -- Guillemets doubles
                '"\s*', '', 'g'), -- Guillemets avec espaces
            '\s*"', '', 'g'), -- Guillemets avec espaces
        '\s+', ' ', 'g'), -- Normaliser espaces multiples
    '^[:\s]*(.+?)[:\s]*$', '\1', 'g'), -- Nettoyer début/fin
    updated_at = NOW()
WHERE intitule LIKE '%«%' OR intitule LIKE '%»%' OR intitule LIKE '%''%' OR intitule LIKE '%"%';

-- Correction des intitulés tronqués ou mal formés identifiés
UPDATE oic_competences 
SET 
    intitule = CASE 
        WHEN objectif_id = 'OIC-001-04-A' THEN 'Connaître les principes de l''approche centrée sur le patient'
        WHEN objectif_id = 'OIC-004-14-A' THEN 'Modalités d''antisepsie en pratique médicale'
        WHEN objectif_id = 'OIC-011-04-B' THEN 'Le type de violence - Classification et reconnaissance'
        WHEN objectif_id = 'OIC-027-02-B' THEN 'Connaître l''épidémiologie microbienne des infections materno-fœtales'
        WHEN objectif_id = 'OIC-057-07-B' THEN 'Connaître la sémiologie tomodensitométrique du syndrome du bébé secoué'
        WHEN objectif_id = 'OIC-057-08-B' THEN 'Exemple de TDM dans un syndrome du bébé secoué chez un nourrisson'
        WHEN objectif_id = 'OIC-109-01-A' THEN 'Chutes ou presque-chutes et leurs conséquences en termes de morbidité'
        WHEN objectif_id = 'OIC-111-16-B' THEN 'Psoriasis des régions séborrhéiques (sébopsoriasis)'
        WHEN objectif_id = 'OIC-130-05-A' THEN 'La cascade gériatrique : succession d''événements médicaux secondaires'
        WHEN objectif_id = 'OIC-134-01-A' THEN 'Définition de la douleur : expérience sensorielle et émotionnelle désagréable'
        WHEN objectif_id = 'OIC-139-07-B' THEN 'Les traitements thérapeutiques médicamenteux'
        WHEN objectif_id = 'OIC-163-09-A' THEN 'Enfant et jeune adulte : stratégie du cocooning vaccinal'
        WHEN objectif_id = 'OIC-229-01-A' THEN 'Prescription et surveillance d''une voie d''abord vasculaire'
        WHEN objectif_id = 'OIC-287-06-A' THEN 'Péritonite en 2 temps - Prise en charge chirurgicale'
        WHEN objectif_id = 'OIC-293-01-B' THEN 'Indication d''un prélèvement pour analyse anatomopathologique'
        WHEN objectif_id = 'OIC-293-02-B' THEN 'Fixation et degré d''urgence pour analyse anatomopathologique'
        WHEN objectif_id = 'OIC-295-09-B' THEN 'Médecines Complémentaires et Alternatives : définition et approches'
        WHEN objectif_id = 'OIC-323-17-A' THEN 'Définition de l''assignation secrète (allocation concealment)'
        WHEN objectif_id = 'OIC-324-20-B' THEN 'Médecine personnalisée et médecine centrée sur la personne'
        WHEN objectif_id = 'OIC-328-07-B' THEN 'Petit et grand appareillage médical'
        WHEN objectif_id = 'OIC-358-12-B' THEN 'Prescription d''antalgiques et évaluation de la douleur aiguë'
        WHEN objectif_id = 'OIC-358-15-B' THEN 'Annonce d''un diagnostic de maladie grave au patient et famille'
        ELSE intitule
    END,
    updated_at = NOW()
WHERE objectif_id IN ('OIC-001-04-A', 'OIC-004-14-A', 'OIC-011-04-B', 'OIC-027-02-B', 'OIC-057-07-B', 'OIC-057-08-B', 'OIC-109-01-A', 'OIC-111-16-B', 'OIC-130-05-A', 'OIC-134-01-A', 'OIC-139-07-B', 'OIC-163-09-A', 'OIC-229-01-A', 'OIC-287-06-A', 'OIC-293-01-B', 'OIC-293-02-B', 'OIC-295-09-B', 'OIC-323-17-A', 'OIC-324-20-B', 'OIC-328-07-B', 'OIC-358-12-B', 'OIC-358-15-B');

-- Nettoyage final et validation absolue
UPDATE oic_competences 
SET 
    intitule = TRIM(REGEXP_REPLACE(intitule, '\s{2,}', ' ', 'g')),
    description = TRIM(REGEXP_REPLACE(description, '\s{2,}', ' ', 'g')),
    updated_at = NOW()
WHERE intitule LIKE '%  %' OR description LIKE '%  %' OR 
      intitule != TRIM(intitule) OR description != TRIM(description);

-- Assurer qu'aucune donnée n'est vide
UPDATE oic_competences 
SET 
    description = CASE 
        WHEN description IS NULL OR TRIM(description) = '' THEN 
            'Compétence OIC ' || objectif_id || ' - ' || COALESCE(intitule, 'Item ' || item_parent || ' rang ' || rang)
        ELSE description
    END,
    intitule = CASE 
        WHEN intitule IS NULL OR TRIM(intitule) = '' THEN 
            'Item ' || item_parent || ' rang ' || rang || ' - OIC ' || objectif_id
        ELSE intitule
    END,
    updated_at = NOW()
WHERE description IS NULL OR TRIM(description) = '' OR intitule IS NULL OR TRIM(intitule) = '';