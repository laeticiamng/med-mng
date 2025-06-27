import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Lightbulb, Eye, Target, BookOpen, Zap, Shield, CheckCircle } from 'lucide-react';

interface TableauRangAProps {
  data: {
    theme: string;
    colonnes: string[];
    lignes: string[][];
  };
}

export const TableauRangA = ({ data }: TableauRangAProps) => {
  console.log('TableauRangA component - Received data:', data);
  
  // Vérifications de sécurité
  if (!data || !data.colonnes || !data.lignes) {
    console.error('TableauRangA: Invalid data structure', data);
    return (
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-serif text-amber-900">Tableau Rang A</h2>
        <p className="text-amber-700">Structure de données invalide</p>
      </div>
    );
  }

  // Structure claire avec 8 colonnes bien définies
  const colonnesClaires = [
    'Concept Clé',
    'Définition Précise',
    'Exemple Concret',
    'Piège à Éviter',
    'Moyen Mnémotechnique',
    'Subtilité Importante',
    'Application Pratique',
    'Point de Vigilance'
  ];

  // Icônes pour chaque colonne
  const icones = [
    <BookOpen className="h-3 w-3 inline ml-1" />,
    <Target className="h-3 w-3 inline ml-1" />,
    <CheckCircle className="h-3 w-3 inline ml-1" />,
    <AlertTriangle className="h-3 w-3 inline ml-1" />,
    <Lightbulb className="h-3 w-3 inline ml-1" />,
    <Eye className="h-3 w-3 inline ml-1" />,
    <Zap className="h-3 w-3 inline ml-1" />,
    <Shield className="h-3 w-3 inline ml-1" />
  ];

  // Couleurs pour chaque colonne
  const couleursHeaders = [
    'bg-slate-600',      // Concept - Gris foncé
    'bg-blue-600',       // Définition - Bleu
    'bg-green-600',      // Exemple - Vert
    'bg-red-600',        // Piège - Rouge
    'bg-yellow-600',     // Mnémotechnique - Jaune
    'bg-purple-600',     // Subtilité - Violet
    'bg-teal-600',       // Application - Turquoise
    'bg-orange-600'      // Vigilance - Orange
  ];

  const couleursCellules = [
    'bg-slate-50 border-slate-300',      // Concept
    'bg-blue-50 border-blue-300',        // Définition
    'bg-green-50 border-green-300',      // Exemple
    'bg-red-50 border-red-300',          // Piège
    'bg-yellow-50 border-yellow-300',    // Mnémotechnique
    'bg-purple-50 border-purple-300',    // Subtilité
    'bg-teal-50 border-teal-300',        // Application
    'bg-orange-50 border-orange-300'     // Vigilance
  ];

  const couleursTexte = [
    'text-slate-800 font-bold',      // Concept
    'text-blue-800',                 // Définition
    'text-green-800',                // Exemple
    'text-red-800 font-semibold',    // Piège
    'text-yellow-800 font-medium italic', // Mnémotechnique
    'text-purple-800 font-medium',   // Subtilité
    'text-teal-800 font-medium',     // Application
    'text-orange-800 font-medium'    // Vigilance
  ];

  // Créer les lignes enrichies avec contenu pédagogique clair
  const lignesEnrichies = generateLignesRangA(data);

  // S'assurer d'avoir au minimum 5 lignes
  while (lignesEnrichies.length < 5) {
    lignesEnrichies.push([
      'Concept supplémentaire',
      'Définition claire et précise à développer',
      'Exemple pratique illustrant le concept',
      'Attention particulière à porter',
      'Moyen mnémotechnique pour mémoriser',
      'Nuance importante à retenir',
      'Application concrète en pratique',
      'Point de surveillance essentiel'
    ]);
  }

  console.log('TableauRangA: Rendering table with', colonnesClaires.length, 'columns and', lignesEnrichies.length, 'rows');
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Badge variant="secondary" className="bg-green-100 text-green-800 mb-4 text-lg px-4 py-2">
          Rang A - Fondamentaux Essentiels
        </Badge>
        <h2 className="text-3xl font-serif text-amber-900 mb-2">{data.theme || 'Tableau Rang A'}</h2>
        <p className="text-amber-700 text-lg">Connaissances indispensables pour l'EDN - Note maximale garantie</p>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-amber-50 p-6 rounded-lg border border-green-200">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Pièges à éviter</span>
          </div>
          <div className="flex items-center space-x-2 text-yellow-700">
            <Lightbulb className="h-5 w-5" />
            <span className="font-medium">Moyens mnémotechniques</span>
          </div>
          <div className="flex items-center space-x-2 text-purple-700">
            <Eye className="h-5 w-5" />
            <span className="font-medium">Subtilités importantes</span>
          </div>
          <div className="flex items-center space-x-2 text-teal-700">
            <Zap className="h-5 w-5" />
            <span className="font-medium">Applications pratiques</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-xl border border-gray-200">
        <div className="min-w-full">
          {/* En-têtes de colonnes */}
          <div className="grid grid-cols-8 gap-2 mb-2 p-2">
            {colonnesClaires.map((colonne, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg text-center font-bold text-sm text-white ${couleursHeaders[index]} shadow-md`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>{colonne}</span>
                  {icones[index]}
                </div>
              </div>
            ))}
          </div>
          
          {/* Lignes de données */}
          {lignesEnrichies.map((ligne, ligneIndex) => (
            <div key={ligneIndex} className="grid grid-cols-8 gap-2 mb-2 p-2">
              {ligne.map((cellule, celluleIndex) => (
                <Card
                  key={celluleIndex}
                  className={`p-4 border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] min-h-[140px] ${couleursCellules[celluleIndex]}`}
                >
                  <div className={`text-sm leading-relaxed ${couleursTexte[celluleIndex]}`}>
                    <div className="space-y-2">
                      {cellule && cellule.split('\n').map((ligne, index) => (
                        <div key={index} className="leading-relaxed">
                          {ligne}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center bg-green-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <p className="text-lg text-green-700 font-bold">
            Tableau Rang A optimisé : {colonnesClaires.length} × {lignesEnrichies.length} = {colonnesClaires.length * lignesEnrichies.length} éléments
          </p>
        </div>
        <p className="text-sm text-green-600">
          📚 Structure claire et ergonomique pour maximiser la rétention et garantir 20/20
        </p>
      </div>
    </div>
  );
};

// Fonction pour générer les lignes enrichies du Rang A
function generateLignesRangA(data: any): string[][] {
  const lignesBase = data.lignes || [];
  
  // Concepts médicaux fondamentaux avec contenu pédagogique structuré
  const conceptsRangA = [
    {
      concept: "Médecine Basée sur les Preuves (EBM)",
      definition: "Utilisation consciencieuse, explicite et judicieuse des meilleures preuves actuelles dans la prise de décision pour les soins de chaque patient.",
      exemple: "Pour traiter un patient diabétique, combiner les études cliniques récentes, l'expérience du médecin et les préférences du patient.",
      piege: "Ne pas confondre avec 'médecine fondée sur les faits' - l'EBM intègre TOUJOURS les 3 dimensions.",
      mnemo: "EBM = 'Expérience + Bonnes études + Malades' (3 piliers essentiels)",
      subtilite: "L'EBM n'est pas que les études : elle intègre preuves scientifiques + expertise clinique + valeurs du patient.",
      application: "Avant chaque prescription, se demander : Que disent les études ? Quelle est mon expérience ? Que veut le patient ?",
      vigilance: "Toujours vérifier la validité et l'applicabilité des études utilisées."
    },
    {
      concept: "Démarche PICOT",
      definition: "Méthode de formulation d'une question clinique : Patient/Population, Intervention, Comparaison, Outcome/Résultat, Temps.",
      exemple: "Chez les patients diabétiques de type 2 (P), la metformine (I) vs placebo (C) réduit-elle l'HbA1c (O) à 3 mois (T) ?",
      piege: "Ne pas oublier de définir clairement chaque élément - une question mal posée = recherche inefficace.",
      mnemo: "PICOT = 'Patient Intervention Comparaison Outcome Temps' (acronyme à retenir absolument)",
      subtilite: "Le T peut signifier 'Time' (durée) ou 'Type d'étude' selon le contexte clinique.",
      application: "Utiliser PICOT pour toute recherche bibliographique ou analyse d'étude clinique.",
      vigilance: "Adapter la question PICOT à la situation clinique spécifique du patient."
    },
    {
      concept: "Styles de Raisonnement Médical",
      definition: "Différentes approches cognitives pour résoudre un problème clinique : reconnaissance de formes, hypothético-déductif, exhaustif, et archétypal.",
      exemple: "Douleur thoracique chez un homme de 50 ans → reconnaissance immédiate du pattern 'infarctus possible'.",
      piege: "Ne pas se limiter à un seul style - adapter selon l'expertise et la complexité du cas.",
      mnemo: "4 styles = 'RAHE' (Reconnaissance, Archétypal, Hypothético-déductif, Exhaustif)",
      subtilite: "Le choix du style dépend de l'expertise du médecin et de la complexité de la situation.",
      application: "Novice : style exhaustif. Expert : reconnaissance de formes. Cas complexe : hypothético-déductif.",
      vigilance: "Éviter les biais cognitifs en diversifiant les approches de raisonnement."
    },
    {
      concept: "Examens Complémentaires",
      definition: "Tests diagnostiques prescrits pour confirmer ou infirmer une hypothèse clinique, classés en 4 catégories : imagerie, analyses, endoscopie, explorations fonctionnelles.",
      exemple: "Suspicion de fracture → radiographie standard avant scanner (principe de gradation).",
      piege: "Ne pas prescrire systématiquement - toujours justifier par une hypothèse clinique précise.",
      mnemo: "4 types = 'IAEF' (Imagerie, Analyses, Endoscopie, Fonctionnelles)",
      subtilite: "Prescription basée sur la probabilité post-test et le rapport bénéfice/risque.",
      application: "Évaluer la probabilité pré-test, choisir l'examen le plus approprié, interpréter selon le contexte.",
      vigilance: "Respecter strictement les indications et contre-indications de chaque examen."
    },
    {
      concept: "Décision Partagée",
      definition: "Processus de prise de décision collaborative entre le médecin et le patient, intégrant les preuves scientifiques et les préférences personnelles.",
      exemple: "Cancer du sein : expliquer les options (chirurgie, chimiothérapie, radiothérapie) et laisser la patiente choisir selon ses valeurs.",
      piege: "Ne pas imposer sa décision ni abandonner complètement la décision au patient.",
      mnemo: "Décision partagée = 'Information + Délibération + Décision' (3 étapes obligatoires)",
      subtilite: "Alternative équilibrée entre modèle paternaliste et modèle autonomiste pur.",
      application: "Informer clairement, discuter des options, respecter le choix éclairé du patient.",
      vigilance: "S'assurer de la compréhension réelle du patient avant toute décision importante."
    }
  ];

  // Générer les lignes à partir des concepts ou des données existantes
  const lignes: string[][] = [];
  
  if (conceptsRangA.length > 0) {
    conceptsRangA.forEach(concept => {
      lignes.push([
        concept.concept,
        concept.definition,
        concept.exemple,
        concept.piege,
        concept.mnemo,
        concept.subtilite,
        concept.application,
        concept.vigilance
      ]);
    });
  }

  // Compléter avec les données originales si disponibles
  if (lignesBase.length > 0) {
    lignesBase.forEach((ligne: string[]) => {
      const ligneComplete = [
        ligne[0] || 'Concept à définir',
        ligne[1] || 'Définition précise à compléter',
        ligne[2] || 'Exemple concret à fournir',
        getPiegeAEviter(ligne[0] || ''),
        getMoyenMnemotechnique(ligne[0] || ''),
        getSubtilite(ligne[0] || ''),
        getExempleConcret(ligne[0] || ''),
        getPointVigilance(ligne[0] || '')
      ];
      lignes.push(ligneComplete);
    });
  }

  return lignes;
}

// Fonctions utilitaires pour enrichir le contenu pédagogique
function getPiegeAEviter(concept: string): string {
  const pieges = {
    'médecine basée sur les preuves': 'Ne pas confondre avec "médecine fondée sur les faits"',
    'démarche ebm': 'Ne pas oublier les préférences du patient',
    'styles de raisonnement': 'Ne pas se limiter à un seul style',
    'examens complémentaires': 'Ne pas prescrire systématiquement',
    'décision partagée': 'Ne pas imposer sa décision',
    'personne de confiance': 'Ne pas confondre avec tuteur légal'
  };
  
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(pieges)) {
    if (key.includes(k)) return v;
  }
  return 'Attention aux nuances terminologiques';
}

function getMoyenMnemotechnique(concept: string): string {
  const mnemos = {
    'médecine basée sur les preuves': 'EBM = "Expérience + Bonnes études + Malades"',
    'démarche ebm': 'PICOT = "Patient Intervention Comparaison Outcome Temps"',
    'styles de raisonnement': '4 styles = "RAHD" (Reconnaissance Archétypale Hypothético Déductif)',
    'examens complémentaires': '4 types = "IAEF" (Imagerie Analyses Endoscopie Fonctionnelles)',
    'décision partagée': 'Partage = "Information + Délibération + Décision"',
    'personne de confiance': 'PC = "Personne Choisie" (par le patient)'
  };
  
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(mnemos)) {
    if (key.includes(k)) return v;
  }
  return 'Créer un acronyme personnalisé';
}

function getSubtilite(concept: string): string {
  const subtilites = {
    'médecine basée sur les preuves': 'Intègre TOUJOURS les 3 dimensions : preuves + expérience + patient',
    'démarche ebm': 'Le T de PICOT peut être "Time" ou "Type d\'étude"',
    'styles de raisonnement': 'Le choix dépend de l\'expertise et du contexte',
    'examens complémentaires': 'Prescription basée sur probabilité post-test',
    'décision partagée': 'Alternative au modèle paternaliste ET autonomiste',
    'personne de confiance': 'Son témoignage PRÉVAUT sur les autres avis'
  };
  
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(subtilites)) {
    if (key.includes(k)) return v;
  }
  return 'Nuance importante à retenir';
}

function getExempleConcret(concept: string): string {
  const exemples = {
    'médecine basée sur les preuves': 'Prescription d\'antibiotique : études + expérience + acceptation patient',
    'démarche ebm': 'Patient diabétique, intervention metformine, vs placebo, HbA1c, 3 mois',
    'styles de raisonnement': 'Douleur thoracique → reconnaissance pattern infarctus',
    'examens complémentaires': 'Suspicion fracture → Radio avant scanner',
    'décision partagée': 'Cancer : expliquer options thérapeutiques et laisser choisir',
    'personne de confiance': 'Patient inconscient → consulter PC désignée'
  };
  
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(exemples)) {
    if (key.includes(k)) return v;
  }
  return 'Cas clinique type à mémoriser';
}

function getPointVigilance(concept: string): string {
  const vigilances = {
    'médecine basée sur les preuves': 'Toujours vérifier la validité des études',
    'démarche ebm': 'Adapter la question à la situation clinique',
    'styles de raisonnement': 'Éviter les biais cognitifs',
    'examens complémentaires': 'Respecter les indications et contre-indications',
    'décision partagée': 'S\'assurer de compréhension réelle du patient',
    'personne de confiance': 'Vérifier l\'identité et la désignation formelle'
  };
  
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(vigilances)) {
    if (key.includes(k)) return v;
  }
  return 'Point de contrôle essentiel';
}
