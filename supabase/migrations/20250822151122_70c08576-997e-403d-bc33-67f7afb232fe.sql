-- Nettoyer les descriptions corrompues contenant le texte de login UNESS dans backup_oic_competences seulement
UPDATE backup_oic_competences 
SET description = NULL
WHERE description LIKE '%lisa%Bienvenue%UNESS%LOGIN%'
   OR description LIKE '%Veuillez saisir votre adresse e-mail%'
   OR description LIKE '%LOGIN%UNESS%';

-- Vérifier le résultat du nettoyage
SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN description IS NOT NULL THEN 1 END) as with_description,
  COUNT(CASE WHEN description LIKE '%lisa%Bienvenue%UNESS%LOGIN%' THEN 1 END) as still_corrupted
FROM backup_oic_competences;