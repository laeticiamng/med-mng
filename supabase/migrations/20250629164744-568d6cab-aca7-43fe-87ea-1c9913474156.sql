
-- Mettre à jour IC-4 avec la structure officielle LiSA : 13 Rang A + 22 Rang B
UPDATE edn_items_immersive SET
  tableau_rang_a = '{
    "theme": "IC-4 Rang A - Qualité et sécurité des soins (13 connaissances LiSA)",
    "sections": [
      {
        "title": "Définitions fondamentales",
        "concepts": [
          {
            "concept": "Définir la Qualité",
            "definition": "Démarche d''amélioration continue des pratiques professionnelles au bénéfice de la sécurité des patients. 7 dimensions : sécurité, pertinence, acceptabilité, accessibilité, continuité, efficacité, efficience",
            "exemple": "Certification HAS avec 7 dimensions SPEC-AEC",
            "piege": "Ne pas confondre qualité et sécurité - la sécurité n''est qu''une dimension",
            "mnemo": "SPEC-AEC : Sécurité Pertinence Efficacité Continuité - Acceptabilité Efficience Continuité",
            "subtilite": "La qualité englobe 7 dimensions dont la sécurité",
            "application": "Participer à la démarche qualité institutionnelle",
            "vigilance": "Traçabilité obligatoire de toutes les actions"
          },
          {
            "concept": "Définir la Sécurité",
            "definition": "Absence pour un patient d''atteinte inutile ou potentielle associée aux soins de santé (OMS 2009). Maximisation des bénéfices ET minimalisation des risques",
            "exemple": "Prévention chutes, erreurs médicamenteuses, infections nosocomiales",
            "piege": "Oublier que sécurité = maximisation bénéfices ET minimalisation risques",
            "mnemo": "SÉCURITÉ = Sans Erreur Contre Utilisateur Risque Inutile",
            "subtilite": "La sécurité parfaite n''existe pas - équilibrer bénéfice/risque",
            "application": "Évaluer systématiquement rapport bénéfice/risque",
            "vigilance": "Tout acte médical comporte des risques"
          },
          {
            "concept": "Définir EIAS et gravité",
            "definition": "Événements Indésirables Associés aux Soins : événement ayant entraîné ou aurait pu entraîner un préjudice patient. 5 niveaux gravité. Notion évitabilité (40-50%), événement porteur risque, aléa thérapeutique",
            "exemple": "Niveau 1: erreur rattrapée. Niveau 5: séquelles irréversibles",
            "piege": "Sous-estimer EIAS mineurs révélateurs failles système",
            "mnemo": "EIAS = 5 niveaux : Mineur Intermédiaire Majeur Critique catastrophiQue",
            "subtilite": "40-50% EIAS évitables par amélioration système",
            "application": "Classer et signaler selon niveau gravité",
            "vigilance": "EIAS 4-5 nécessitent signalement externe obligatoire"
          }
        ]
      },
      {
        "title": "Antisepsie et asepsie",
        "concepts": [
          {
            "concept": "Définition antisepsie",
            "definition": "Opération au résultat momentané permettant d''éliminer ou tuer microorganismes et/ou inactiver virus sur tissus vivants par application topique antiseptique",
            "exemple": "Bétadine, Dakin, Biseptine sur peau avant injection",
            "piege": "Confondre antisepsie (tissus vivants) et désinfection (surfaces inertes)",
            "mnemo": "ANTISEPSIE = Anti-Septique Peau Tissus Vivants",
            "subtilite": "Action momentané nécessitant renouvellement",
            "application": "Choisir antiseptique selon site anatomique",
            "vigilance": "Respecter temps contact et concentrations"
          },
          {
            "concept": "Modalités antisepsie peau saine/lésée/muqueuses",
            "definition": "Peau saine: alcool 70°, bétadine alcoolique. Peau lésée: bétadine dermique, Dakin. Muqueuses: bétadine gynécologique, chlorhexidine aqueuse",
            "exemple": "Injection IM: alcool 70°. Plaie: Dakin. Sondage: bétadine gynécologique",
            "piege": "Utiliser antiseptique alcoolique sur peau lésée (brûlure)",
            "mnemo": "SAINE-alcool, LÉSÉE-aqueux, MUQUEUSE-spécifique",
            "subtilite": "Alcool contre-indiqué sur peau lésée et muqueuses",
            "application": "Adapter antiseptique selon intégrité tissulaire",
            "vigilance": "Vérifier allergies avant application"
          },
          {
            "concept": "Définition et règles asepsie",
            "definition": "Ensemble moyens mis en œuvre pour empêcher tout apport exogène microorganismes ou virus au niveau site opératoire, dispositifs invasifs. Asepsie chirurgicale stricte",
            "exemple": "Bloc opératoire: champs stériles, instruments stérilisés, habillage stérile",
            "piege": "Confondre asepsie (prévention contamination) et antisepsie (élimination)",
            "mnemo": "ASEPSIE = Absence Septique Prévention Contamination",
            "subtilite": "Asepsie = méthode préventive, antisepsie = méthode curative",
            "application": "Respecter protocoles asepsie selon actes",
            "vigilance": "Rupture asepsie = recommencer procédure"
          }
        ]
      }
    ]
  }',
  tableau_rang_b = '{
    "theme": "IC-4 Rang B - Expertise qualité sécurité (22 connaissances LiSA)",
    "sections": [
      {
        "title": "Impact économique et structures",
        "concepts": [
          {
            "concept": "Impact économique EIAS",
            "definition": "Coût direct: prolongation séjour +7j, +5000€. Coût indirect: perte productivité, image. 760M€/an France. ROI prévention > coût EIAS",
            "exemple": "Infection nosocomiale: +7j hospitalisation, +5000€ coût direct",
            "piege": "Sous-estimer impact économique global dépassant coûts médicaux",
            "mnemo": "IMPACT = 760M€ France + Prolongation + Productivité",
            "subtilite": "Coûts indirects souvent > coûts directs",
            "application": "Calculer coût-bénéfice programmes prévention",
            "vigilance": "Intégrer dimension économique dans décisions"
          },
          {
            "concept": "Mécanismes transmissibilité BMR",
            "definition": "Bactéries Multi-Résistantes: transmission horizontale plasmides (80-90%), verticale chromosomique (rare). Réservoirs cutané (SARM), digestif (BLSE)",
            "exemple": "SARM transmission manuportée, BLSE digestives résistance plasmidique",
            "piege": "Négliger transmission horizontale plasmidique majoritaire",
            "mnemo": "BMR = 80% Plasmides horizontaux vs 20% Chromosomes verticaux",
            "subtilite": "Pression sélection antibiotique favorise résistances",
            "application": "Bon usage antibiotiques, hygiène mains++",
            "vigilance": "Précautions contact selon réservoirs"
          }
        ]
      }
    ]
  }',
  updated_at = now()
WHERE item_code = 'IC-4';
