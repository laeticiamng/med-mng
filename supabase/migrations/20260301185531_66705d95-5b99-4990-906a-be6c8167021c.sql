-- Add missing Rang A objectives for IC-30 and IC-142
UPDATE edn_items_immersive SET 
  competences_oic_rang_a = '[
    {"code": "IC-30-A-001", "intitule": "Connaître la définition de la prématurité et ses différents stades (extrême, grande, moyenne, tardive)", "rang": "A"},
    {"code": "IC-30-A-002", "intitule": "Connaître les principaux facteurs de risque de prématurité (infectieux, utérins, placentaires, maternels)", "rang": "A"},
    {"code": "IC-30-A-003", "intitule": "Connaître la définition et les critères diagnostiques du retard de croissance intra-utérin (RCIU)", "rang": "A"},
    {"code": "IC-30-A-004", "intitule": "Connaître les principales causes de RCIU (vasculaires, infectieuses, génétiques, toxiques)", "rang": "A"},
    {"code": "IC-30-A-005", "intitule": "Connaître les complications néonatales immédiates de la prématurité (détresse respiratoire, hypothermie, hypoglycémie)", "rang": "A"},
    {"code": "IC-30-A-006", "intitule": "Connaître les principes de prévention de la prématurité (corticothérapie anténatale, tocolyse, transfert in utero)", "rang": "A"},
    {"code": "IC-30-A-007", "intitule": "Connaître les principes de surveillance de la croissance fœtale et le dépistage du RCIU", "rang": "A"}
  ]'::jsonb,
  competences_count_rang_a = 7,
  competences_count_total = 7 + competences_count_rang_b
WHERE item_code = 'IC-30';

UPDATE edn_items_immersive SET 
  competences_oic_rang_a = '[
    {"code": "IC-142-A-001", "intitule": "Connaître les spécificités des soins palliatifs en pédiatrie par rapport à l adulte", "rang": "A"},
    {"code": "IC-142-A-002", "intitule": "Connaître le cadre légal et éthique de la fin de vie chez l enfant (loi Léonetti-Claeys)", "rang": "A"},
    {"code": "IC-142-A-003", "intitule": "Connaître les principes d évaluation et de prise en charge de la douleur chez l enfant en soins palliatifs", "rang": "A"},
    {"code": "IC-142-A-004", "intitule": "Connaître les principes d accompagnement de l enfant et de sa famille en situation palliative", "rang": "A"},
    {"code": "IC-142-A-005", "intitule": "Connaître les principales pathologies pédiatriques relevant de soins palliatifs (oncologie, neurologie, métabolique)", "rang": "A"},
    {"code": "IC-142-A-006", "intitule": "Connaître les ressources disponibles pour les soins palliatifs pédiatriques (équipes mobiles, réseaux)", "rang": "A"}
  ]'::jsonb,
  competences_count_rang_a = 6,
  competences_count_total = 6 + competences_count_rang_b
WHERE item_code = 'IC-142';