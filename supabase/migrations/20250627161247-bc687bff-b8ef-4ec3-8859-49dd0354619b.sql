
-- D'abord vérifier si l'item IC-5 existe déjà
-- Puis l'insérer seulement s'il n'existe pas
INSERT INTO edn_items_immersive (
  item_code,
  slug,
  title,
  subtitle,
  pitch_intro,
  tableau_rang_a,
  created_at,
  updated_at
)
SELECT 
  'IC-5',
  'ic-5-responsabilites-medicales',
  'Responsabilités médicale pénale, civile, administrative et disciplinaire',
  'La gestion des erreurs et des plaintes ; l''aléa thérapeutique',
  'Maîtrisez les différents types de responsabilités médicales, de la responsabilité pénale à la responsabilité disciplinaire, en passant par la gestion des erreurs et la compréhension de l''aléa thérapeutique.',
  '{
    "theme": "Responsabilités médicales et gestion des erreurs",
    "colonnes": ["Concept", "Définition", "Exemple", "Piège", "Mnémotechnique", "Subtilité", "Application", "Vigilance"],
    "lignes": [
      ["Responsabilité sanction/indemnisation", "Responsabilité recherchée à deux fins : sanction (pénale/disciplinaire) ou indemnisation (civile). Preuve nécessaire : dommage + fait générateur + lien causalité", "Assurance RCP obligatoire pour médecins et établissements", "Ne pas confondre sanction et indemnisation - finalités différentes", "DFLC : Dommage Fait Lien Causalité", "Lien causalité pas forcément direct ni exclusif", "Vérifier couverture assurance RCP, traçabilité", "Faute détachable du service = responsabilité personnelle"],
      ["Responsabilité pénale", "Fonction répressive, personnelle, concerne tous médecins. Infractions : contraventions/délits/crimes selon gravité", "Homicide involontaire, violation secret professionnel", "Pénale = toujours personnelle, même pour salariés", "PRP : Personnelle Répressive Publique", "Défaut information ≠ infraction pénale", "Respecter données acquises science, secret médical", "Faute qualifiée nécessaire si causalité indirecte"],
      ["Responsabilité civile", "Indemnisation devant juridictions judiciaires pour libéraux/privés. Employeur responsable pour salariés sauf faute détachable", "Médecin libéral : TGI, salarié : employeur responsable", "Salarié non responsable sauf si outrepasse mission", "JUGE : Judiciaire pour Civile", "Secteur libéral praticiens hospitaliers = responsabilité personnelle", "Vérifier cadre exercice, mission confiée", "Faute détachable = responsabilité personnelle même salarié"],
      ["Responsabilité administrative", "Établissements publics devant juridictions administratives. Faute de service vs faute personnelle détachable", "TA, CAA, Conseil d''État pour hôpitaux publics", "Administrative = public uniquement", "ADMIN : ADMinistratif pour public", "Faute détachable = responsabilité civile personnelle", "Identifier type faute : service ou personnelle", "Intention nuire ou gravité exceptionnelle = détachable"],
      ["Responsabilité disciplinaire", "Devant Ordre médecins, indépendante autres actions. Manquement déontologie, sanctions graduées", "Blâme, interdiction temporaire, radiation", "Disciplinaire indépendante du pénal/civil", "ORDRE : Organisation Responsabilité Déontologie", "Acte vie privée peut engager si atteinte honneur profession", "Respecter Code déontologie, conciliation préalable", "Faute disciplinaire ≠ infraction pénale"],
      ["Responsabilité sans faute", "Dommage lié soins sans manquement professionnel. Systèmes indemnisation spécifiques", "Infection nosocomiale", "Sans faute ≠ absence dommage", "SF : Sans Faute mais indemnisation", "Reconnaissance législative pour certains cas", "Connaître cas indemnisation sans faute", "Critères spécifiques selon type dommage"],
      ["Faute médicale", "Atteinte droits patient. Faute technique (violation données science) ou humanisme (information, secret)", "Violation connaissances avérées, défaut information", "Faute = atteinte droit patient prouvée", "TH : Technique + Humanisme", "Standard = connaissances au moment acte litigieux", "Respecter données acquises, information éclairée", "Preuve faute incombe au patient"],
      ["Erreur médicale", "Involontaire et évitable. Omission/commission/exécution. Violation = non-respect règle", "Action non faite, mal faite, ou inutile", "Erreur ≠ violation (intentionnelle)", "OCE : Omission Commission Exécution", "Organisation apprenante = analyse erreurs", "Signaler erreurs, analyse causale", "Erreur = occasion apprentissage"],
      ["Accident médical", "Événement indésirable avec dommage anormal. Erreur professionnelle ou aléa thérapeutique", "Complication imprévisible malgré soins conformes", "Accident ≠ toujours erreur", "AEA : Accident = Erreur ou Aléa", "Peut survenir en tout lieu soins", "Documentation circonstances, analyse causale", "Information patient obligatoire"],
      ["Affection iatrogène", "Effets néfastes traitement, distincts maladie initiale. Avec ou sans mauvais usage", "Effets secondaires médicament bien prescrit", "Iatrogène ≠ erreur médicale", "IATRO : Induit Acte ThéRapeutique", "Possible sans faute professionnelle", "Surveillance effets, information patient", "Déclaration pharmacovigilance si nécessaire"],
      ["Infection nosocomiale", "Infection contractée établissement santé, absente admission. >48h hospitalisation", "Infection urinaire sur sonde, pneumopathie", "Nosocomiale = acquise hôpital >48h", "NOSO : Nouvelle Origine SOins", "Délai 48h sauf incubation connue différente", "Prévention, surveillance, signalement", "Associée aux soins = concept plus large"],
      ["Aléa thérapeutique", "Risque accidentel inhérent acte médical, non maîtrisable, sans faute. Inévitable", "Effet secondaire rare médicament bien prescrit", "Aléa = inévitable vs erreur = évitable", "ALÉA : Accidentel sans faute", "Jurisprudence : risque inhérent non maîtrisable", "Information risques, consentement éclairé", "Indemnisation possible sans faute"]
    ]
  }'::jsonb,
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM edn_items_immersive WHERE item_code = 'IC-5'
);
