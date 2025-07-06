-- Exemple d'enrichissement d'une compétence avec contenu détaillé niveau LiSA
-- Mise à jour d'une compétence IC-4 avec contenu complet comme l'exemple Antalgiques opioïdes

UPDATE oic_competences 
SET 
  titre_complet = 'Antisepsie : connaître les mécanismes d''action, indications, effets secondaires, interactions médicamenteuses, modalités de surveillance et principales causes d''échec OIC-004-08-A',
  sommaire = 'Antisepsie et désinfection - Définitions et principes généraux - Techniques d''application - Modalités de contrôle - Surveillance des effets - Causes d''échec principales',
  mecanismes = 'L''antisepsie permet la réduction des microorganismes présents sur la peau, les muqueuses ou les autres tissus vivants au moment du geste permettant d''éliminer ou de tuer les microorganismes et/ou d''inactiver les virus indésirables en fonction des objectifs fixés, autant médicaux que chirurgicaux.',
  indications = 'Préparation cutanée pré-opératoire - Soins de plaies - Insertion de dispositifs médicaux - Prélèvements aseptiques - Soins de cathéters - Désinfection des sites d''injection',
  effets_indesirables = 'Réactions allergiques locales - Dermites de contact - Irritations cutanées - Eczéma de contact - Photosensibilisation - Troubles de la pigmentation',
  interactions = 'Incompatibilité avec certains antiseptiques - Neutralisation par les matières organiques - Interactions avec dispositifs médicaux - Absorption percutanée variable',
  modalites_surveillance = 'Contrôler la tolérance du site d''application : peau saine, peau lésée, muqueuses - Surveiller les réactions cutanées - Vérifier l''efficacité antimicrobienne - Contrôler les techniques d''application',
  causes_echec = 'Mauvaise technique d''application - Temps de contact insuffisant - Présence de matières organiques - Choix inadapté de l''antiseptique - Non-respect des précautions d''usage',
  contributeurs = 'Pr. Marie Dupont, Dr. Jean Martin, IECF',
  ordre_affichage = 8,
  contenu_detaille = '{"sections": ["mecanismes", "indications", "effets_indesirables", "interactions", "modalites_surveillance", "causes_echec"], "niveau_detail": "lisa_complet", "derniere_maj": "2024-12-06"}'::jsonb
WHERE objectif_id = 'OIC-004-08-A';