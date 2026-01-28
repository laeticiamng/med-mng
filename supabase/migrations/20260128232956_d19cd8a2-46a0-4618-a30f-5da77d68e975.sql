-- =============================================
-- MIGRATION: Add demo ECOS content
-- =============================================

-- Insert demo ECOS situations for testing and demonstration
INSERT INTO public.ecos_situations_uness (sd_id, intitule_sd, competences_associees, contenu_complet_html, created_at)
VALUES 
  (1, 'Patient avec douleur thoracique aiguë', 
   ARRAY['Urgences', 'Cardiologie', 'Diagnostic différentiel'],
   '<h2>Situation de départ</h2><p>Monsieur Martin, 58 ans, se présente aux urgences pour une douleur thoracique d''apparition brutale depuis 2 heures. Il décrit une douleur rétrosternale constrictive irradiant vers le bras gauche.</p><h3>Antécédents</h3><ul><li>Hypertension artérielle traitée</li><li>Tabagisme actif 30 PA</li><li>Diabète de type 2</li></ul><h3>Examen clinique</h3><p>PA: 145/85 mmHg, FC: 95/min, SpO2: 96% en AA, T°: 37.2°C</p><p>Patient pâle, en sueurs.</p>',
   now()),
   
  (2, 'Enfant avec fièvre et éruption cutanée', 
   ARRAY['Pédiatrie', 'Dermatologie', 'Maladies infectieuses'],
   '<h2>Situation de départ</h2><p>Léa, 4 ans, est amenée par ses parents pour une fièvre à 39°C depuis 3 jours associée à une éruption cutanée généralisée apparue ce matin.</p><h3>Anamnèse</h3><ul><li>Vaccination à jour</li><li>Pas de voyage récent</li><li>Contage varicelle à la crèche</li></ul><h3>Examen clinique</h3><p>Éruption maculos-papuleuse polymorphe avec quelques vésicules sur le tronc.</p>',
   now()),
   
  (3, 'Personne âgée confuse aux urgences', 
   ARRAY['Gériatrie', 'Neurologie', 'Urgences'],
   '<h2>Situation de départ</h2><p>Madame Dupont, 82 ans, est amenée par sa fille qui la trouve "pas comme d''habitude" depuis 24 heures. Elle vit seule dans son appartement.</p><h3>Antécédents</h3><ul><li>HTA</li><li>Insuffisance cardiaque</li><li>Arthrose</li></ul><h3>Traitement actuel</h3><p>Ramipril, Furosémide, Paracétamol</p><h3>Examen</h3><p>Patiente désorientée dans le temps et l''espace, pas de déficit moteur.</p>',
   now()),
   
  (4, 'Femme enceinte avec contractions prématurées', 
   ARRAY['Obstétrique', 'Urgences', 'Gynécologie'],
   '<h2>Situation de départ</h2><p>Madame Lefebvre, 32 ans, primigeste à 28 SA, se présente aux urgences obstétricales pour des contractions douloureuses régulières depuis 2 heures.</p><h3>Grossesse actuelle</h3><ul><li>Grossesse spontanée</li><li>Échographies normales</li><li>Sérologies négatives</li></ul><h3>Examen clinique</h3><p>CU toutes les 5 minutes, col raccourci à 15mm, dilaté à 1 doigt.</p>',
   now()),
   
  (5, 'Adolescent avec idées suicidaires', 
   ARRAY['Psychiatrie', 'Pédiatrie', 'Urgences'],
   '<h2>Situation de départ</h2><p>Thomas, 16 ans, est amené par ses parents aux urgences psychiatriques après avoir exprimé des idées de mort. Ses parents ont trouvé des recherches internet sur les méthodes de suicide.</p><h3>Contexte</h3><ul><li>Résultats scolaires en baisse</li><li>Rupture amoureuse récente</li><li>Isolement social</li></ul><h3>Entretien</h3><p>Le patient verbalise un mal-être depuis plusieurs mois, évoque des idées noires.</p>',
   now()),
   
  (6, 'Patient diabétique avec pied infecté', 
   ARRAY['Diabétologie', 'Chirurgie vasculaire', 'Infectiologie'],
   '<h2>Situation de départ</h2><p>Monsieur Bernard, 67 ans, diabétique de type 2 depuis 15 ans, consulte pour une plaie du pied droit évoluant depuis 3 semaines.</p><h3>Antécédents</h3><ul><li>Diabète type 2 mal équilibré (HbA1c 9.5%)</li><li>Neuropathie périphérique connue</li><li>AOMI grade II</li></ul><h3>Examen local</h3><p>Plaie plantaire 3cm, fond fibrineux, écoulement purulent, inflammation périlésionnelle.</p>',
   now()),
   
  (7, 'Accident de la voie publique - polytraumatisé', 
   ARRAY['Urgences', 'Traumatologie', 'Réanimation'],
   '<h2>Situation de départ</h2><p>Homme d''environ 35 ans, victime d''un AVP moto contre voiture à 17h. Casque porté. Le patient est retrouvé inconscient sur les lieux.</p><h3>Bilan SMUR</h3><ul><li>GCS: 10 (Y2V3M5)</li><li>PA: 90/60 mmHg, FC: 120/min</li><li>SpO2: 92% sous O2</li><li>Déformation cuisse gauche</li></ul>',
   now()),
   
  (8, 'Syndrome coronarien aigu ST+', 
   ARRAY['Cardiologie', 'Urgences', 'USIC'],
   '<h2>Situation de départ</h2><p>Madame Garcia, 65 ans, douleur thoracique typique depuis 1h30. ECG réalisé en pré-hospitalier montre un sus-décalage ST en antérieur étendu.</p><h3>Antécédents</h3><ul><li>Tabagisme sevré il y a 5 ans</li><li>Dyslipidémie</li><li>Ménopause à 52 ans</li></ul><h3>Examen</h3><p>Patiente algique, stable sur le plan hémodynamique.</p>',
   now()),
   
  (9, 'Colique néphrétique hyperalgique', 
   ARRAY['Urologie', 'Urgences', 'Néphrologie'],
   '<h2>Situation de départ</h2><p>Monsieur Petit, 42 ans, douleur lombaire droite irradiant vers les OGE depuis 6h, EVA 9/10, agitation.</p><h3>Anamnèse</h3><ul><li>Pas d''antécédent lithiasique</li><li>Apports hydriques faibles</li><li>Alimentation riche en protéines</li></ul><h3>Examen</h3><p>Fosse lombaire droite sensible, pas de défense, BU: hématurie ++</p>',
   now()),
   
  (10, 'AVC ischémique en phase aiguë', 
   ARRAY['Neurologie', 'Urgences', 'Neuroradiologie'],
   '<h2>Situation de départ</h2><p>Monsieur Dubois, 72 ans, hémiplégie droite et aphasie d''installation brutale il y a 45 minutes. Sa femme décrit une chute au domicile.</p><h3>Antécédents</h3><ul><li>ACFA non anticoagulée</li><li>HTA</li><li>Dyslipidémie</li></ul><h3>Examen</h3><p>NIHSS 14, PA 175/95 mmHg, heure de début précise connue.</p>',
   now()),

  (11, 'Allergie alimentaire sévère chez l''enfant', 
   ARRAY['Pédiatrie', 'Allergologie', 'Urgences'],
   '<h2>Situation de départ</h2><p>Lucas, 3 ans, amené aux urgences pour urticaire généralisé et gêne respiratoire 15 minutes après ingestion de cacahuètes à l''école.</p><h3>Anamnèse</h3><ul><li>Première exposition connue</li><li>Pas d''allergie alimentaire connue</li><li>Eczéma atopique</li></ul><h3>Examen</h3><p>Urticaire diffus, œdème labial, wheezing bilatéral.</p>',
   now()),

  (12, 'Dépression du post-partum', 
   ARRAY['Psychiatrie', 'Obstétrique', 'Médecine générale'],
   '<h2>Situation de départ</h2><p>Madame Moreau, 29 ans, primipare, consulte à J21 du post-partum sur conseil de la sage-femme. Elle décrit une fatigue intense et un désintérêt pour son bébé.</p><h3>Anamnèse</h3><ul><li>Accouchement par voie basse eutocique</li><li>Allaitement maternel difficile</li><li>Isolement social</li></ul><h3>Entretien</h3><p>Pleurs faciles, troubles du sommeil, idées de culpabilité.</p>',
   now())
ON CONFLICT (sd_id) DO UPDATE SET
  intitule_sd = EXCLUDED.intitule_sd,
  competences_associees = EXCLUDED.competences_associees,
  contenu_complet_html = EXCLUDED.contenu_complet_html;