-- Nettoyer les descriptions corrompues contenant le texte de login UNESS
UPDATE backup_oic_competences 
SET description = NULL,
    completion_status = 'needs_extraction'
WHERE description LIKE '%lisa%Bienvenue%UNESS%LOGIN%'
   OR description LIKE '%Veuillez saisir votre adresse e-mail%'
   OR description LIKE '%LOGIN%UNESS%';

-- Mettre à jour également la table principale si elle existe
UPDATE oic_competences 
SET description = NULL,
    completion_status = 'needs_extraction'
WHERE description LIKE '%lisa%Bienvenue%UNESS%LOGIN%'
   OR description LIKE '%Veuillez saisir votre adresse e-mail%'
   OR description LIKE '%LOGIN%UNESS%';