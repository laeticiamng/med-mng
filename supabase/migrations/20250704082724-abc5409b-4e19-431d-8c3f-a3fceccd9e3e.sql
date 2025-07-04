-- Corriger les titres génériques des items EDN avec des titres spécifiques
UPDATE edn_items_immersive 
SET title = CASE item_code
  WHEN 'IC-6' THEN 'Connaissance et compréhension des grands systèmes (de la biologie fondamentale à la physiopathologie)'
  WHEN 'IC-7' THEN 'Anatomie et histologie des systèmes (de la biologie fondamentale à la physiopathologie)'
  WHEN 'IC-8' THEN 'Pharmacologie générale et clinique'
  WHEN 'IC-9' THEN 'Thérapeutique : prescription et surveillance des classes médicamenteuses'
  WHEN 'IC-10' THEN 'Prescription et surveillance des principales classes d''examens complémentaires'
  WHEN 'IC-11' THEN 'Urgences et défaillances viscérales aiguës'
  WHEN 'IC-12' THEN 'Soins palliatifs pluridisciplinaires chez un malade en fin de vie. Accompagnement d''un mourant et de son entourage'
  WHEN 'IC-13' THEN 'Médecine palliative : accompagnement, soins de support, soins palliatifs dans une maladie grave évolutive'
  WHEN 'IC-14' THEN 'Formation à la recherche'
  WHEN 'IC-15' THEN 'Organisation du système de soins. Sa régulation. Les indicateurs. Comparaisons internationales'
  WHEN 'IC-16' THEN 'Coordination pluri-professionnelle des soins, continuité des soins'
  WHEN 'IC-17' THEN 'Le système de santé français'
  WHEN 'IC-18' THEN 'Santé et numérique'
  WHEN 'IC-19' THEN 'Organisation et financement du système de soins'
  WHEN 'IC-20' THEN 'Économie de la santé'
  ELSE title
END
WHERE item_code IN ('IC-6', 'IC-7', 'IC-8', 'IC-9', 'IC-10', 'IC-11', 'IC-12', 'IC-13', 'IC-14', 'IC-15', 'IC-16', 'IC-17', 'IC-18', 'IC-19', 'IC-20');