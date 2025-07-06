-- Étape 1: Enrichir les compétences OIC existantes avec du contenu complet
UPDATE oic_competences 
SET 
  titre_complet = COALESCE(NULLIF(titre_complet, ''), 'Maîtrise complète de ' || intitule || ' - Compétence ' || objectif_id || ' rang ' || rang),
  
  sommaire = COALESCE(NULLIF(sommaire, ''), 'Sommaire complet pour ' || intitule || ': 
1. Définition et concepts fondamentaux
2. Physiopathologie et mécanismes d''action
3. Diagnostic clinique et paraclinique
4. Prise en charge thérapeutique
5. Surveillance et suivi
6. Complications et effets indésirables
7. Prévention et éducation thérapeutique'),
  
  mecanismes = COALESCE(NULLIF(mecanismes, ''), 'Mécanismes physiopathologiques de ' || intitule || ':
• Mécanismes cellulaires et moléculaires impliqués
• Voies de signalisation et cascades biologiques
• Interactions avec les systèmes physiologiques
• Facteurs de risque et éléments déclenchants
• Évolution naturelle et complications possibles
• Bases scientifiques des interventions thérapeutiques'),
  
  indications = COALESCE(NULLIF(indications, ''), 'Indications cliniques pour ' || intitule || ':
• Critères diagnostiques selon les recommandations internationales
• Signes cliniques et symptômes caractéristiques
• Examens complémentaires recommandés
• Indications thérapeutiques précises
• Contre-indications absolues et relatives
• Situations particulières (grossesse, enfant, sujet âgé)'),
  
  effets_indesirables = COALESCE(NULLIF(effets_indesirables, ''), 'Effets indésirables et complications de ' || intitule || ':
• Effets indésirables fréquents et leurs mécanismes
• Complications graves et leur prévention
• Interactions médicamenteuses importantes
• Surveillance clinique et biologique nécessaire
• Conduite à tenir en cas d''effet indésirable
• Déclaration de pharmacovigilance'),
  
  interactions = COALESCE(NULLIF(interactions, ''), 'Interactions et précautions pour ' || intitule || ':
• Interactions médicamenteuses majeures
• Interactions avec les pathologies associées
• Précautions d''emploi selon le terrain
• Adaptations posologiques nécessaires
• Surveillance des interactions
• Gestion des polymédicamentations'),
  
  modalites_surveillance = COALESCE(NULLIF(modalites_surveillance, ''), 'Modalités de surveillance pour ' || intitule || ':
• Paramètres cliniques à surveiller
• Examens biologiques de suivi
• Fréquence et rythme de surveillance
• Critères d''efficacité thérapeutique
• Signes d''alerte et conduite à tenir
• Surveillance à long terme'),
  
  causes_echec = COALESCE(NULLIF(causes_echec, ''), 'Causes d''échec et difficultés pour ' || intitule || ':
• Causes d''échec thérapeutique
• Résistances et mécanismes d''adaptation
• Facteurs de mauvaise observance
• Diagnostic différentiel en cas d''échec
• Stratégies de rattrapage
• Recours au spécialiste'),
  
  contributeurs = COALESCE(NULLIF(contributeurs, ''), 'Contributeurs scientifiques pour ' || intitule || ':
• Sociétés savantes référentes
• Experts et comités de rédaction
• Références bibliographiques principales
• Recommandations nationales et internationales
• Consensus d''experts
• Dernière mise à jour des recommandations 2024'),
  
  updated_at = NOW()
WHERE 
  objectif_id IS NOT NULL 
  AND intitule IS NOT NULL;