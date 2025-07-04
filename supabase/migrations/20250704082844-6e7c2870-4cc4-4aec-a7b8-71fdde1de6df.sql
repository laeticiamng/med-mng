-- Mettre à jour tous les titres génériques restants avec des titres spécifiques appropriés
UPDATE edn_items_immersive 
SET title = CASE item_code
  WHEN 'IC-21' THEN 'Éthique médicale'
  WHEN 'IC-22' THEN 'Iatrogénie. Diagnostic et prévention'
  WHEN 'IC-23' THEN 'Douleur chez l''adulte et chez l''enfant'
  WHEN 'IC-24' THEN 'Troubles nutritionnels chez l''adulte et l''enfant'
  WHEN 'IC-25' THEN 'Trouble de l''humeur. Épisode dépressif'
  WHEN 'IC-26' THEN 'Troubles anxieux et troubles de l''adaptation'
  WHEN 'IC-27' THEN 'Troubles bipolaires'
  WHEN 'IC-28' THEN 'Schizophrénie'
  WHEN 'IC-29' THEN 'Trouble délirant'
  WHEN 'IC-30' THEN 'Troubles de la personnalité'
  ELSE title
END,
updated_at = now()
WHERE title LIKE '%Item EDN%' AND item_code IN ('IC-21', 'IC-22', 'IC-23', 'IC-24', 'IC-25', 'IC-26', 'IC-27', 'IC-28', 'IC-29', 'IC-30');