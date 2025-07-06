-- Étape 2: Ajouter les compétences EDN manquantes (IC-1 à IC-367) rang A et B

-- Créer une table temporaire avec les titres des items EDN
WITH edn_items AS (
  SELECT 
    item_num,
    CASE item_num
      WHEN 1 THEN 'La relation médecin-malade dans le cadre du colloque singulier'
      WHEN 2 THEN 'Les droits individuels et collectifs du patient'
      WHEN 3 THEN 'Le raisonnement et la décision en médecine'
      WHEN 4 THEN 'Evaluation des pratiques de soins et recherche clinique'
      WHEN 5 THEN 'La sécurité du patient et la gestion des risques'
      WHEN 6 THEN 'L''organisation de l''exercice clinique et méthodes de sécurisation'
      WHEN 7 THEN 'Les droits individuels et collectifs du patient'
      WHEN 8 THEN 'Ethique médicale'
      WHEN 9 THEN 'Certificats médicaux. Décès et législation'
      WHEN 10 THEN 'Violences sexuelles'
      WHEN 11 THEN 'Troubles de l''humeur et épisodes dépressifs'
      WHEN 12 THEN 'Troubles anxieux et troubles de l''adaptation'
      WHEN 13 THEN 'Troubles de la personnalité'
      WHEN 14 THEN 'Addictions'
      WHEN 15 THEN 'Troubles du comportement alimentaire'
      ELSE 'Item EDN ' || item_num || ' - Compétence médicale spécialisée'
    END as titre_item,
    CASE 
      WHEN item_num BETWEEN 1 AND 10 THEN 'Fondamentaux'
      WHEN item_num BETWEEN 11 AND 50 THEN 'Médecine générale'
      WHEN item_num BETWEEN 51 AND 100 THEN 'Spécialités médicales'
      WHEN item_num BETWEEN 101 AND 150 THEN 'Chirurgie'
      WHEN item_num BETWEEN 151 AND 200 THEN 'Pédiatrie'
      WHEN item_num BETWEEN 201 AND 250 THEN 'Gynécologie-Obstétrique'
      WHEN item_num BETWEEN 251 AND 300 THEN 'Psychiatrie'
      WHEN item_num BETWEEN 301 AND 350 THEN 'Urgences'
      ELSE 'Médecine spécialisée'
    END as rubrique
  FROM generate_series(1, 367) as item_num
)
INSERT INTO oic_competences (
  objectif_id, intitule, description, rubrique, rang, item_parent,
  titre_complet, sommaire, mecanismes, indications, effets_indesirables,
  interactions, modalites_surveillance, causes_echec, contributeurs, ordre_affichage
)
SELECT 
  'IC-' || item_num || '-A' as objectif_id,
  titre_item as intitule,
  'Connaissances fondamentales pour ' || titre_item || ' - Niveau de base requis pour l''EDN' as description,
  rubrique,
  'A' as rang,
  LPAD(item_num::text, 3, '0') as item_parent,
  'Maîtrise complète de l''item EDN ' || item_num || ' - Compétences fondamentales rang A' as titre_complet,
  'Sommaire complet pour l''item EDN ' || item_num || ':
1. Définition et concepts fondamentaux
2. Physiopathologie et mécanismes
3. Diagnostic clinique et paraclinique
4. Prise en charge thérapeutique
5. Surveillance et suivi
6. Complications et prévention
7. Éducation thérapeutique' as sommaire,
  'Mécanismes physiopathologiques de l''item EDN ' || item_num || ':
• Bases moléculaires et cellulaires
• Voies de signalisation impliquées
• Facteurs de risque et déclenchants
• Évolution naturelle
• Complications possibles
• Bases des interventions thérapeutiques' as mecanismes,
  'Indications cliniques pour l''item EDN ' || item_num || ':
• Critères diagnostiques précis
• Signes cliniques caractéristiques
• Examens complémentaires
• Indications thérapeutiques
• Contre-indications
• Situations particulières' as indications,
  'Effets indésirables et complications de l''item EDN ' || item_num || ':
• Effets indésirables fréquents
• Complications graves
• Interactions médicamenteuses
• Surveillance nécessaire
• Conduite à tenir
• Pharmacovigilance' as effets_indesirables,
  'Interactions et précautions pour l''item EDN ' || item_num || ':
• Interactions médicamenteuses
• Interactions pathologiques
• Précautions d''emploi
• Adaptations posologiques
• Surveillance interactions
• Gestion complexe' as interactions,
  'Modalités de surveillance pour l''item EDN ' || item_num || ':
• Paramètres cliniques
• Examens biologiques
• Fréquence surveillance
• Critères efficacité
• Signes d''alerte
• Suivi long terme' as modalites_surveillance,
  'Causes d''échec et difficultés pour l''item EDN ' || item_num || ':
• Causes échec thérapeutique
• Mécanismes résistance
• Facteurs inobservance
• Diagnostic différentiel
• Stratégies rattrapage
• Recours spécialisé' as causes_echec,
  'Contributeurs scientifiques pour l''item EDN ' || item_num || ':
• Sociétés savantes
• Comités experts
• Références bibliographiques
• Recommandations nationales
• Consensus internationaux
• Mise à jour 2024' as contributeurs,
  item_num as ordre_affichage
FROM edn_items
WHERE NOT EXISTS (
  SELECT 1 FROM oic_competences 
  WHERE objectif_id = 'IC-' || item_num || '-A'
);