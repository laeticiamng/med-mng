
-- Vérification spécifique des items IC-1 et IC-5 pour détecter toute duplication
SELECT 
  item_code,
  title,
  subtitle,
  LEFT(pitch_intro, 100) as pitch_extrait,
  -- Vérifier les thèmes des tableaux
  tableau_rang_a->>'theme' as theme_rang_a,
  tableau_rang_b->>'theme' as theme_rang_b,
  -- Vérifier les premiers concepts pour détecter la duplication
  tableau_rang_a->'lignes'->0->>0 as premier_concept_a,
  tableau_rang_a->'lignes'->1->>0 as deuxieme_concept_a
FROM edn_items_immersive 
WHERE item_code IN ('IC-1', 'IC-5')
ORDER BY item_code;

-- Mise à jour complète de l'item IC-5 avec un contenu totalement différent de IC-1
-- IC-5 : Responsabilités médicales (civil, pénal, administratif, déontologique)
UPDATE edn_items_immersive 
SET 
  title = 'Responsabilités médicales',
  subtitle = 'Responsabilité civile, pénale, administrative et déontologique du médecin',
  pitch_intro = 'Maîtrisez les différents types de responsabilités médicales : civile, pénale, administrative et déontologique. Comprenez les enjeux juridiques, la gestion des erreurs médicales et la culture positive de sécurité. Un parcours essentiel pour exercer en toute sécurité juridique.',
  
  tableau_rang_a = '{
    "title": "Rang A - Fondamentaux des responsabilités médicales",
    "theme": "Responsabilités médicales",
    "colonnes": ["Type de responsabilité", "Définition", "Juridiction", "Sanctions possibles", "Exemple concret"],
    "lignes": [
      ["Responsabilité civile", "Obligation de réparer le dommage causé à autrui par sa faute", "Tribunal de Grande Instance (privé) ou Tribunal Administratif (public)", "Dommages et intérêts financiers", "Patient victime d''erreur diagnostique obtient indemnisation pour préjudice subi"],
      ["Responsabilité pénale", "Sanction des infractions commises dans l''exercice médical", "Tribunal correctionnel ou Cour d''assises", "Amende, emprisonnement, interdiction d''exercer", "Homicide involontaire suite à erreur de prescription grave"],
      ["Responsabilité administrative", "Responsabilité du service public hospitalier pour faute de service", "Tribunal Administratif", "Indemnisation par l''hôpital public", "Dysfonctionnement organisationnel ayant causé un préjudice patient"],
      ["Responsabilité ordinale", "Contrôle déontologique par l''Ordre des médecins", "Chambre disciplinaire ordinale", "Avertissement, blâme, interdiction temporaire/définitive", "Manquement aux devoirs professionnels, non-respect du secret médical"]
    ]
  }',
  
  tableau_rang_b = '{
    "title": "Rang B - Maîtrise experte des responsabilités",
    "theme": "Gestion des risques et culture sécurité",
    "colonnes": ["Concept avancé", "Analyse juridique", "Cas complexe", "Prévention", "Expertise requise"],
    "lignes": [
      ["Aléa thérapeutique vs erreur", "Distinction fondamentale : aléa = risque inhérent inévitable / erreur = faute évitable", "Patient développe allergie médicamenteuse imprévisible (aléa) vs erreur de dosage (faute)", "Documentation rigoureuse des décisions, information patient sur les risques", "Expertise médico-légale pour établir la distinction"],
      ["Faute détachable du service", "Faute personnelle du médecin salarié engageant sa responsabilité propre", "Chirurgien opérant en état d''ébriété ou geste manifestement non conforme", "Respect strict des protocoles, formation continue, supervision", "Analyse jurisprudentielle cas par cas"],
      ["Solidarité nationale", "Indemnisation sans faute pour infections nosocomiales et affections iatrogènes", "Patient contractant hépatite C par transfusion avant dépistage systématique", "Prévention maximale des risques, déclaration ONIAM si applicable", "Connaissance des critères d''éligibilité ONIAM"],
      ["Culture positive erreur", "Approche non punitive favorisant déclaration et analyse des événements indésirables", "Analyse RMM (Revue Morbi-Mortalité) d''erreur médicamenteuse sans sanction individuelle", "Systèmes de déclaration anonyme, formation équipes", "Leadership dans changement culturel institutionnel"]
    ]
  }',
  
  scene_immersive = '{
    "setting": "Bureau du médecin conseil - Analyse d''un événement indésirable",
    "characters": [
      {
        "name": "Dr. Martin",  
        "role": "Médecin senior",
        "description": "Confronté à une plainte patient suite complication"
      },
      {
        "name": "Me Dubois",
        "role": "Avocat spécialisé",
        "description": "Conseil juridique en responsabilité médicale"  
      },
      {
        "name": "Dr. Chen",
        "role": "Médecin conseil assurance",
        "description": "Expert en gestion des risques médicaux"
      }
    ],
    "scenario": "Suite à une complication post-opératoire, le Dr. Martin doit comprendre les différents types de responsabilités encourues, les démarches à suivre et les moyens de prévention. Une analyse approfondie des enjeux juridiques, assuranciels et déontologiques."
  }',
  
  updated_at = now()
WHERE item_code = 'IC-5';

-- Vérification finale que les contenus sont bien distincts
SELECT 
  item_code,
  title,
  tableau_rang_a->>'theme' as theme_a,
  tableau_rang_a->'lignes'->0->>0 as concept_1,
  tableau_rang_a->'lignes'->1->>0 as concept_2
FROM edn_items_immersive 
WHERE item_code IN ('IC-1', 'IC-5')
ORDER BY item_code;
