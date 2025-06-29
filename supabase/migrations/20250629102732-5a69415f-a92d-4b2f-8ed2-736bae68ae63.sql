
-- Mise à jour complète de l'item IC-4 avec tous les concepts Rang A et Rang B basés sur les fiches E-LiSA
UPDATE edn_items_immersive 
SET 
  tableau_rang_a = '{
    "theme": "IC-4 : Qualité et sécurité des soins - Rang A",
    "sections": [
      {
        "title": "Démarche qualité et EIAS",
        "concepts": [
          {
            "concept": "Démarche qualité",
            "definition": "Améliorer en continu les pratiques professionnelles au bénéfice de la sécurité des patients. Certification des établissements de santé et accréditation des médecins. Gérée par cellule qualité et gestion des risques. Principes majeurs : traçabilité et respect des procédures",
            "exemple": "Certification HAS avec 7 dimensions : sécurité, pertinence, acceptabilité, accessibilité, continuité, efficacité, efficience",
            "piege": "Confondre qualité (global) et sécurité (une dimension)",
            "mnemo": "QUALITÉ = 7 dimensions SPEC-AEC : Sécurité Pertinence Efficacité Continuité - Acceptabilité Efficience Continuité",
            "subtilite": "La qualité englobe 7 dimensions dont la sécurité",
            "application": "Participer activement à la démarche qualité institutionnelle",
            "vigilance": "Traçabilité obligatoire de toutes les actions"
          },
          {
            "concept": "EIAS - Événements Indésirables Associés aux Soins",
            "definition": "Événement qui a/aurait pu entraîner un préjudice à un patient lors d''un acte de prévention, investigation ou traitement. Modèle du fromage suisse de Reason : échec de plusieurs verrous de sécurité empêchant que tous les trous s''alignent → EIAS",
            "exemple": "1 patient/2 jours en cabinet de médecine générale, 10% des patients en cours d''hospitalisation, 40-50% des EIAS seraient évitables",
            "piege": "Penser que les EIAS ne concernent que l''hôpital",
            "mnemo": "EIAS = Événements Indésirables Associés Soins (fromage suisse)",
            "subtilite": "40-50% évitables par amélioration du système",
            "application": "Signaler systématiquement tous les EIAS",
            "vigilance": "Analyse systémique plutôt que recherche de coupable"
          }
        ]
      },
      {
        "title": "Échelle de gravité et types d''EIAS",
        "concepts": [
          {
            "concept": "Échelle de gravité des EIAS",
            "definition": "5 niveaux : 1-Mineur (désagrément/insatisfaction), 2-Intermédiaire (impact sans mise en jeu sécurité), 3-Majeur (prise en charge spécifique), 4-Critique (interruption prise en charge), 5-Catastrophique (conséquences graves irréversibles)",
            "exemple": "Niveau 1: erreur rattrapée. Niveau 3: chute avec suture. Niveau 5: décès ou séquelles majeures",
            "piege": "Sous-estimer l''importance des EIAS mineurs",
            "mnemo": "1-Désagrément 2-Impact 3-Soins 4-Arrêt 5-Irréversible",
            "subtilite": "Même les EIAS mineurs révèlent des failles système",
            "application": "Classer systématiquement selon cette échelle",
            "vigilance": "EIAS 4-5 nécessitent signalement externe"
          },
          {
            "concept": "Aléa thérapeutique",
            "definition": "Dommage accidentel lors d''un acte médical, indépendante de toute faute évitable et ne correspondant pas à l''évolution de la maladie sous-jacente. En France, indemnisation possible depuis la loi du 4 mars 2002 par l''AMI, après expertise médicale soit par la CCI, soit par un tribunal compétent",
            "exemple": "Paralysie faciale après chirurgie de l''oreille malgré technique parfaite",
            "piege": "Confondre aléa thérapeutique et faute médicale",
            "mnemo": "ALÉA = Accident Lié Évolution Aléatoire (indemnisable)",
            "subtilite": "Indemnisation sans faute depuis 2002",
            "application": "Distinguer aléa des complications évitables",
            "vigilance": "Information préalable sur les aléas possibles"
          }
        ]
      },
      {
        "title": "Prévention des risques",
        "concepts": [
          {
            "concept": "3 grandes causes de risque lié aux soins",
            "definition": "1-Actes invasifs (4,3 EIG pour 1000 jours d''hospitalisation, 5% consultations, 5-10% hospitalisations) 2-EI médicamenteux (doses-dépendants fréquents, rares découverts après AMM, souvent évitables, hypoglycémie sous insuline) 3-Infections associées aux soins",
            "exemple": "Erreurs médicamenteuses évitables, hypoglycémie iatrogène, infections nosocomiales",
            "piege": "Négliger l''une des 3 causes principales",
            "mnemo": "3 CAUSES = Actes invasifs + EI médicamenteux + Infections",
            "subtilite": "Prévention spécifique pour chaque cause",
            "application": "Vigilance renforcée sur ces 3 domaines",
            "vigilance": "Formation continue sur la prévention"
          }
        ]
      }
    ]
  }',
  tableau_rang_b = '{
    "theme": "IC-4 : Qualité et sécurité des soins - Rang B Expert",
    "sections": [
      {
        "title": "Infections associées aux soins (IAS)",
        "concepts": [
          {
            "concept": "Définitions IAS",
            "definition": "IAS : infection au cours ou au décours d''une prise en charge diagnostique, thérapeutique, palliative, préventive ou éducative. Ni présente ni en incubation au début de la prise en charge. Dans un établissement de santé (infection nosocomiale) ou lors de soins à domicile, en EHPAD ou cabinet de médecine ambulatoire",
            "exemple": "Infection nosocomiale (IN) : IAS en établissement de santé, survenant > 48h après l''admission",
            "piege": "Confondre IAS et infections communautaires",
            "mnemo": "IAS = Infections Associées Soins (> 48h)",
            "subtilite": "Critère temporel : > 48h après admission",
            "application": "Surveillance active des IAS",
            "vigilance": "Déclaration obligatoire selon gravité"
          },
          {
            "concept": "Épidémiologie des IAS",
            "definition": "Coût global des IAS : 760 millions €/an. Coût médical par infection : 610-1370 €/an en Europe. 1/20 en médecine (infections urinaires +++), en chirurgie (ISO +++). 1% en réanimation, par ordre décroissant de fréquence : infections respiratoires (15 cas pour 1000 jours de ventilation), bactériémie +/- liée aux infections de cathéter",
            "exemple": "Infections respiratoires en réanimation, ISO en chirurgie, infections urinaires en médecine",
            "piege": "Sous-estimer l''impact économique",
            "mnemo": "IAS = 760M€/an, 1/20 médecine, 1% réanimation",
            "subtilite": "Coût élevé justifiant la prévention",
            "application": "Programmes de prévention ciblés",
            "vigilance": "Surveillance épidémiologique continue"
          }
        ]
      },
      {
        "title": "Résistances bactériennes",
        "concepts": [
          {
            "concept": "BMR et BHR",
            "definition": "BMR = bactéries multi-résistantes (BLSE, SARM). BHR = bactéries hautement résistantes (EPC, ERV). Réservoirs : Cutané (SARM), Digestif (BLSE, ERV, EPC). Voies de transmission : Contact manuportée ++, direct ou indirecte par objet/matériel souillé, Voie aéroportée (gouttelettes ou voie aérienne)",
            "exemple": "SARM cutané, BLSE digestives, transmission manuportée",
            "piege": "Confondre BMR et BHR",
            "mnemo": "BMR = Multi-résistantes, BHR = Hautement résistantes",
            "subtilite": "Réservoirs et voies de transmission spécifiques",
            "application": "Précautions adaptées selon le type",
            "vigilance": "Hygiène des mains cruciale"
          },
          {
            "concept": "Mécanismes de résistance aux antibiotiques",
            "definition": "Mutation chromosomique (rare, transfert vertical, stable, spontané) vs Plasmides ou transposons (fréquents 80-90%, transfert horizontal entre bactéries de même espèce ou d''espèces différentes, touche souvent plusieurs familles d''antibiotiques, instable, dépendant de la pression de sélection)",
            "exemple": "Résistance plasmidique fréquente et transférable entre bactéries",
            "piege": "Négliger l''aspect horizontal des résistances",
            "mnemo": "RÉSISTANCE = Rare chromosomique vs Fréquente plasmidique",
            "subtilite": "Pression de sélection favorise les résistances",
            "application": "Bon usage des antibiotiques",
            "vigilance": "Limiter la pression de sélection"
          }
        ]
      },
      {
        "title": "Précautions d''hygiène",
        "concepts": [
          {
            "concept": "Précautions d''hygiène standard",
            "definition": "Systématiques pour tout patient : Friction SHA +++, avant et après tout contact avec un patient ou environnement proche (20-30s, en 7 temps) > au lavage des mains sauf 2 exceptions (SHA + lavage au savon doux) : C. difficile, Gale. Si suspicion infection respiratoire (soignant + patient + visiteurs). Si risque de projection de liquides biologiques",
            "exemple": "SHA systématique, masque si toux, gants si contact liquides biologiques",
            "piege": "Exceptions C. difficile et gale résistent à SHA",
            "mnemo": "SHA = 7 temps 20-30s, Exceptions Gale + C. difficile",
            "subtilite": "SHA plus efficace que lavage sauf exceptions",
            "application": "Application systématique pour tous",
            "vigilance": "Gale et C. difficile nécessitent lavage"
          },
          {
            "concept": "Précautions d''hygiène complémentaires",
            "definition": "Sur prescription médicale (mise en place et levée) selon 3 types : ''Air'' (aérosols petites particules < 5μm), ''Gouttelettes'' (sécrétions oro-trachéo-bronchiques > 5μm), ''Contact'' (contact inter-humain manuporté). Indications spécifiques : Tuberculose, Rougeole, Varicelle (Air), Grippe, Coqueluche, VRS, SARS-CoV-2 (Gouttelettes), BMR SARM entérobactéries BLSE, autres entérites, C. difficile, Gale (Contact)",
            "exemple": "Chambre individuelle, masque FFP2 (Air), masque chirurgical (Gouttelettes), gants et surblouse (Contact)",
            "piege": "Mauvaise catégorisation des précautions",
            "mnemo": "3 TYPES = Air + Gouttelettes + Contact",
            "subtilite": "Prescription médicale obligatoire",
            "application": "Respect strict des indications",
            "vigilance": "Formation du personnel sur les 3 types"
          }
        ]
      }
    ]
  }',
  paroles_musicales = ARRAY[
    'Voici les concepts de qualité et sécurité des soins
    Sept dimensions pour la qualité des soins
    Sécurité pertinence efficacité
    Continuité acceptabilité
    Les EIAS sont des événements indésirables
    Associés aux soins qu''il faut prévenir
    Modèle du fromage suisse de Reason
    Plusieurs verrous pour la sécurité',
    'Cinq niveaux pour la gravité des EIAS
    Du mineur au catastrophique
    Infections associées aux soins
    Coût de sept cent soixante millions
    BMR et BHR résistances bactériennes
    Transmission manuportée à éviter
    Précautions standard systématiques
    SHA friction en sept temps précis'
  ]
WHERE slug = 'ic4-qualite-securite-soins';

-- Vérification que l'item existe, sinon le créer
INSERT INTO edn_items_immersive (
  item_code, 
  title, 
  subtitle, 
  slug,
  tableau_rang_a,
  tableau_rang_b,
  paroles_musicales
) 
SELECT 
  'IC-4',
  'Qualité et sécurité des soins',
  'Sécurité du patient - Gestion des risques - EIAS - Démarche qualité et évaluation des démarches professionnelles',
  'ic4-qualite-securite-soins',
  '{
    "theme": "IC-4 : Qualité et sécurité des soins - Rang A",
    "sections": [
      {
        "title": "Démarche qualité et EIAS",
        "concepts": [
          {
            "concept": "Démarche qualité",
            "definition": "Améliorer en continu les pratiques professionnelles au bénéfice de la sécurité des patients. Certification des établissements de santé et accréditation des médecins. Gérée par cellule qualité et gestion des risques. Principes majeurs : traçabilité et respect des procédures",
            "exemple": "Certification HAS avec 7 dimensions : sécurité, pertinence, acceptabilité, accessibilité, continuité, efficacité, efficience",
            "piege": "Confondre qualité (global) et sécurité (une dimension)",
            "mnemo": "QUALITÉ = 7 dimensions SPEC-AEC",
            "subtilite": "La qualité englobe 7 dimensions dont la sécurité",
            "application": "Participer activement à la démarche qualité",
            "vigilance": "Traçabilité obligatoire de toutes les actions"
          }
        ]
      }
    ]
  }',
  '{
    "theme": "IC-4 : Qualité et sécurité des soins - Rang B Expert",
    "sections": [
      {
        "title": "Infections associées aux soins",
        "concepts": [
          {
            "concept": "Définitions IAS",
            "definition": "Infection au cours ou au décours d''une prise en charge. Critère temporel > 48h après admission",
            "exemple": "Infection nosocomiale en établissement",
            "piege": "Confondre IAS et infections communautaires",
            "mnemo": "IAS = Infections Associées Soins",
            "subtilite": "Surveillance active nécessaire",
            "application": "Déclaration selon gravité",
            "vigilance": "Critère temporel important"
          }
        ]
      }
    ]
  }',
  ARRAY[
    'Concepts de qualité et sécurité des soins, Sept dimensions qualité, EIAS événements indésirables',
    'Infections associées aux soins, BMR BHR résistances, Précautions hygiène standard'
  ]
WHERE NOT EXISTS (
  SELECT 1 FROM edn_items_immersive WHERE slug = 'ic4-qualite-securite-soins'
);
