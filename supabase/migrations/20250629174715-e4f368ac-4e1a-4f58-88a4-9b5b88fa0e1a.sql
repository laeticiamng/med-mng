
-- Vérifier d'abord les doublons dans la table
SELECT item_code, slug, title, COUNT(*) as count
FROM edn_items_immersive 
GROUP BY item_code, slug, title
HAVING COUNT(*) > 1;

-- Supprimer tous les doublons en gardant seulement le plus récent de chaque item
DELETE FROM edn_items_immersive 
WHERE id NOT IN (
  SELECT DISTINCT ON (item_code) id 
  FROM edn_items_immersive 
  ORDER BY item_code, created_at DESC
);

-- Vérifier que nous avons bien 5 items uniques
SELECT item_code, slug, title, created_at
FROM edn_items_immersive 
ORDER BY item_code;
