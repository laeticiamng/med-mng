-- Étape 3: Ajouter les compétences EDN rang B (IC-1 à IC-367)

WITH edn_items_b AS (
  SELECT 
    item_num,
    CASE item_num
      WHEN 1 THEN 'Communication complexe et situations difficiles'
      WHEN 2 THEN 'Éthique médicale approfondie et dilemmes'
      WHEN 3 THEN 'Décision partagée et incertitude diagnostique'
      WHEN 4 THEN 'Recherche clinique et méthodologie avancée'
      WHEN 5 THEN 'Analyse systémique des erreurs et amélioration continue'
      WHEN 6 THEN 'Organisation complexe et coordination multidisciplinaire'
      WHEN 7 THEN 'Défense des droits et advocacy patient'
      WHEN 8 THEN 'Bioéthique et éthique clinique avancée'
      WHEN 9 THEN 'Expertise médico-légale et procédures complexes'
      WHEN 10 THEN 'Prise en charge spécialisée des violences'
      WHEN 11 THEN 'Psychiatrie de liaison et comorbidités complexes'
      WHEN 12 THEN 'Thérapies cognitivo-comportementales avancées'
      WHEN 13 THEN 'Psychopathologie structurelle et dynamique'
      WHEN 14 THEN 'Addictologie spécialisée et comorbidités'
      WHEN 15 THEN 'Prise en charge multidisciplinaire des TCA'
      ELSE 'Item EDN ' || item_num || ' - Compétence médicale avancée rang B'
    END as titre_item_b,
    CASE 
      WHEN item_num BETWEEN 1 AND 10 THEN 'Fondamentaux avancés'
      WHEN item_num BETWEEN 11 AND 50 THEN 'Médecine générale expert'
      WHEN item_num BETWEEN 51 AND 100 THEN 'Spécialités expert'
      WHEN item_num BETWEEN 101 AND 150 THEN 'Chirurgie avancée'
      WHEN item_num BETWEEN 151 AND 200 THEN 'Pédiatrie spécialisée'
      WHEN item_num BETWEEN 201 AND 250 THEN 'Gynéco-obstétrique expert'
      WHEN item_num BETWEEN 251 AND 300 THEN 'Psychiatrie avancée'
      WHEN item_num BETWEEN 301 AND 350 THEN 'Urgences critiques'
      ELSE 'Expertise médicale'
    END as rubrique_b
  FROM generate_series(1, 367) as item_num
)
INSERT INTO oic_competences (
  objectif_id, intitule, item_parent, rang, rubrique, description, url_source,
  titre_complet, sommaire, mecanismes, indications, effets_indesirables,
  interactions, modalites_surveillance, causes_echec, contributeurs, ordre_affichage
)
SELECT 
  'IC-' || item_num || '-B' as objectif_id,
  titre_item_b as intitule,
  LPAD(item_num::text, 3, '0') as item_parent,
  'B' as rang,
  rubrique_b,
  'Compétences avancées et spécialisées pour l''item EDN ' || item_num || ' - Niveau expert et situations complexes' as description,
  'https://livret.uness.fr/lisa/IC-' || item_num || '-B' as url_source,
  'Expertise avancée de l''item EDN ' || item_num || ' - Compétences spécialisées rang B' as titre_complet,
  'Sommaire expert pour l''item EDN ' || item_num || ':
1. Physiopathologie complexe
2. Diagnostic différentiel avancé
3. Thérapeutiques de pointe
4. Gestion des complications
5. Situations particulières
6. Recherche et innovation
7. Enseignement et formation' as sommaire,
  'Mécanismes avancés de l''item EDN ' || item_num || ':
• Mécanismes moléculaires complexes
• Interactions systémiques
• Variabilité individuelle
• Résistances et adaptations
• Nouvelles découvertes
• Thérapies innovantes' as mecanismes,
  'Indications spécialisées pour l''item EDN ' || item_num || ':
• Cas complexes et atypiques
• Situations d''urgence
• Échecs thérapeutiques
• Thérapies de seconde ligne
• Protocoles de recherche
• Médecine personnalisée' as indications,
  'Effets indésirables rares et graves de l''item EDN ' || item_num || ':
• Effets indésirables rares
• Toxicités spécifiques
• Interactions complexes
• Surveillance spécialisée
• Gestion des urgences
• Déclarations d''événements' as effets_indesirables,
  'Interactions complexes pour l''item EDN ' || item_num || ':
• Interactions multi-médicamenteuses
• Interactions génétiques
• Facteurs environnementaux
• Comorbidités multiples
• Surveillance multiparamétrique
• Algorithmes décisionnels' as interactions,
  'Surveillance experte pour l''item EDN ' || item_num || ':
• Biomarqueurs spécialisés
• Techniques d''imagerie avancée
• Surveillance pharmacologique
• Prédiction des complications
• Évaluation de l''efficacité
• Monitoring continu' as modalites_surveillance,
  'Gestion d''échec complexe pour l''item EDN ' || item_num || ':
• Analyse des causes multiples
• Résistances thérapeutiques
• Facteurs psychosociaux
• Réseaux de soins
• Stratégies innovantes
• Recours multidisciplinaire' as causes_echec,
  'Experts internationaux pour l''item EDN ' || item_num || ':
• Leaders d''opinion
• Centres de référence
• Recherche internationale
• Guidelines mondiales
• Innovations thérapeutiques
• Mise à jour continue 2024' as contributeurs,
  item_num + 1000 as ordre_affichage
FROM edn_items_b
WHERE NOT EXISTS (
  SELECT 1 FROM oic_competences 
  WHERE objectif_id = 'IC-' || item_num || '-B'
);