import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Lightbulb, Eye, Target, BookOpen, Zap, Shield, CheckCircle, Star, Crown } from 'lucide-react';

interface TableauRangBProps {
  data: {
    theme: string;
    colonnes: string[];
    lignes: string[][];
  };
}

export const TableauRangB = ({ data }: TableauRangBProps) => {
  console.log('TableauRangB component - Received data:', data);
  
  // Vérifications de sécurité
  if (!data || !data.colonnes || !data.lignes) {
    console.error('TableauRangB: Invalid data structure', data);
    return (
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-serif text-amber-900">Tableau Rang B</h2>
        <p className="text-amber-700">Structure de données invalide</p>
      </div>
    );
  }

  // Structure claire avec 8 colonnes bien définies pour le niveau Expert
  const colonnesExpertes = [
    'Concept Avancé',
    'Analyse Détaillée',
    'Cas Expert',
    'Écueil Spécialisé',
    'Mémorisation Experte',
    'Nuance Critique',
    'Maîtrise Technique',
    'Excellence Requise'
  ];

  // Icônes pour chaque colonne (niveau expert)
  const iconesExpertes = [
    <Crown className="h-3 w-3 inline ml-1" />,
    <Target className="h-3 w-3 inline ml-1" />,
    <Star className="h-3 w-3 inline ml-1" />,
    <AlertTriangle className="h-3 w-3 inline ml-1" />,
    <Lightbulb className="h-3 w-3 inline ml-1" />,
    <Eye className="h-3 w-3 inline ml-1" />,
    <Zap className="h-3 w-3 inline ml-1" />,
    <Shield className="h-3 w-3 inline ml-1" />
  ];

  // Couleurs pour chaque colonne (palette plus sophistiquée)
  const couleursHeadersB = [
    'bg-indigo-600',     // Concept - Indigo
    'bg-blue-600',       // Analyse - Bleu
    'bg-emerald-600',    // Cas - Émeraude
    'bg-red-600',        // Écueil - Rouge
    'bg-amber-600',      // Mémorisation - Ambre
    'bg-purple-600',     // Nuance - Violet
    'bg-teal-600',       // Maîtrise - Turquoise
    'bg-slate-600'       // Excellence - Ardoise
  ];

  const couleursCellulesB = [
    'bg-indigo-50 border-indigo-300',     // Concept
    'bg-blue-50 border-blue-300',         // Analyse
    'bg-emerald-50 border-emerald-300',   // Cas
    'bg-red-50 border-red-300',           // Écueil
    'bg-amber-50 border-amber-300',       // Mémorisation
    'bg-purple-50 border-purple-300',     // Nuance
    'bg-teal-50 border-teal-300',         // Maîtrise
    'bg-slate-50 border-slate-300'        // Excellence
  ];

  const couleursTexteB = [
    'text-indigo-800 font-bold',      // Concept
    'text-blue-800 font-medium',      // Analyse
    'text-emerald-800',               // Cas
    'text-red-800 font-semibold',     // Écueil
    'text-amber-800 font-medium italic', // Mémorisation
    'text-purple-800 font-medium',    // Nuance
    'text-teal-800 font-semibold',    // Maîtrise
    'text-slate-800 font-bold'        // Excellence
  ];

  // Créer les lignes enrichies avec contenu expert
  const lignesExpertes = generateLignesRangB(data);

  // S'assurer d'avoir au minimum 5 lignes
  while (lignesExpertes.length < 5) {
    lignesExpertes.push([
      'Concept complexe avancé',
      'Analyse approfondie et méthodique',
      'Cas d\'expertise spécialisée',
      'Risque de niveau expert',
      'Technique de mémorisation avancée',
      'Distinction critique essentielle',
      'Compétence technique pointue',
      'Standard d\'excellence professionnel'
    ]);
  }

  console.log('TableauRangB: Rendering expert table with', colonnesExpertes.length, 'columns and', lignesExpertes.length, 'rows');
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 mb-4 text-lg px-4 py-2">
          Rang B - Maîtrise Experte
        </Badge>
        <h2 className="text-3xl font-serif text-amber-900 mb-2">{data.theme || 'Tableau Rang B'}</h2>
        <p className="text-amber-700 text-lg">Approfondissement expert pour l'excellence - Différenciation garantie</p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Écueils spécialisés</span>
          </div>
          <div className="flex items-center space-x-2 text-amber-700">
            <Lightbulb className="h-5 w-5" />
            <span className="font-medium">Mémorisation experte</span>
          </div>
          <div className="flex items-center space-x-2 text-purple-700">
            <Eye className="h-5 w-5" />
            <span className="font-medium">Nuances critiques</span>
          </div>
          <div className="flex items-center space-x-2 text-teal-700">
            <Crown className="h-5 w-5" />
            <span className="font-medium">Excellence technique</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-xl border border-gray-200">
        <div className="min-w-full">
          {/* En-têtes de colonnes expertes */}
          <div className="grid grid-cols-8 gap-2 mb-2 p-2">
            {colonnesExpertes.map((colonne, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg text-center font-bold text-sm text-white ${couleursHeadersB[index]} shadow-md`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>{colonne}</span>
                  {iconesExpertes[index]}
                </div>
              </div>
            ))}
          </div>
          
          {/* Lignes de données expertes */}
          {lignesExpertes.map((ligne, ligneIndex) => (
            <div key={ligneIndex} className="grid grid-cols-8 gap-2 mb-2 p-2">
              {ligne.map((cellule, celluleIndex) => (
                <Card
                  key={celluleIndex}
                  className={`p-4 border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] min-h-[140px] ${couleursCellulesB[celluleIndex]}`}
                >
                  <div className={`text-sm leading-relaxed ${couleursTexteB[celluleIndex]}`}>
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

      <div className="text-center bg-blue-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Crown className="h-6 w-6 text-blue-600" />
          <p className="text-lg text-blue-700 font-bold">
            Tableau Rang B expert : {colonnesExpertes.length} × {lignesExpertes.length} = {colonnesExpertes.length * lignesExpertes.length} éléments
          </p>
        </div>
        <p className="text-sm text-blue-600">
          🎯 Structure experte pour l'excellence et la différenciation maximale
        </p>
      </div>
    </div>
  );
};

// Fonction pour générer les lignes enrichies du Rang B (niveau expert)
function generateLignesRangB(data: any): string[][] {
  const lignesBase = data.lignes || [];
  
  // Concepts médicaux avancés avec contenu expert
  const conceptsRangB = [
    {
      concept: "Supports au Raisonnement Clinique",
      analyse: "Outils et méthodes pour optimiser la démarche diagnostique et thérapeutique, incluant les guides de bonnes pratiques, les algorithmes décisionnels et les systèmes d'aide à la décision.",
      cas: "Consultation complexe avec multiple pathologies : utiliser les arbres décisionnels HAS pour prioriser les interventions vitales.",
      ecueil: "Ne pas multiplier les consultations inutiles - garder une approche synthétique et ciblée.",
      memorisation: "Prévention quaternaire = 'Primum non nocere' - Ne pas nuire avant tout",
      nuance: "Motifs multiples en consultation (moyenne 2,6 par consultation) nécessitent une hiérarchisation rigoureuse.",
      maitrise: "Savoir utiliser les outils d'aide sans perdre l'autonomie de jugement clinique.",
      excellence: "Intégrer harmonieusement les supports technologiques dans la relation médecin-patient."
    },
    {
      concept: "Bases d'Information Médicale",
      analyse: "Sources de données scientifiques validées pour la pratique clinique : HAS, SFMG, Cochrane, recommandations internationales, avec évaluation critique de leur qualité.",
      cas: "Utilisation des fiches HAS pour construire un argumentaire thérapeutique solide lors d'une consultation spécialisée.",
      ecueil: "Ne pas se fier aux sources non validées ou aux informations obsolètes trouvées sur internet.",
      memorisation: "HAS + SFMG = 'Références françaises validées' pour la pratique quotidienne",
      nuance: "SMR (Service Médical Rendu) ≠ ASMR (Amélioration du Service Médical Rendu) - distinction fondamentale.",
      maitrise: "Connaître et utiliser efficacement les principales bases de données médicales françaises.",
      excellence: "Évaluation critique permanente de la qualité et de l'actualité des sources utilisées."
    },
    {
      concept: "Logique Thérapeutique Intégrée",
      analyse: "Approche globale de la prescription intégrant les données scientifiques, l'expérience clinique, les caractéristiques du patient et les contraintes environnementales.",
      cas: "Prescription personnalisée chez un patient âgé polymédiqué : adapter les doses, surveiller les interactions, évaluer l'observance.",
      ecueil: "Éviter la standardisation excessive qui ignore les spécificités individuelles du patient.",
      memorisation: "Triple alliance thérapeutique : 'Situation clinique + Patient + Médecin' (3 dimensions indissociables)",
      nuance: "Décision thérapeutique négociée ≠ décision thérapeutique imposée - nuance fondamentale.",
      maitrise: "Maîtriser l'art de l'alliance thérapeutique pour optimiser l'adhésion aux soins.",
      excellence: "Personnalisation maximale du traitement selon les caractéristiques bio-psycho-sociales."
    },
    {
      concept: "Efficacité Thérapeutique Multi-dimensionnelle",
      analyse: "Distinction entre efficacité théorique (efficacy), efficacité pratique (effectiveness) et efficacité économique, avec leurs implications cliniques respectives.",
      cas: "Évaluation médico-économique d'une intervention : coût par QALY gagné, impact budgétaire, acceptabilité sociale.",
      ecueil: "Ne pas confondre les 3 types d'efficacité - chacune répond à une question différente.",
      memorisation: "3E thérapeutiques = 'Efficacité théorique/pratique/Économique' (triangle de l'évaluation)",
      nuance: "Effectiveness (conditions réelles) vs Efficacy (conditions contrôlées) - distinction cruciale pour la pratique.",
      maitrise: "Savoir utiliser et interpréter les 3 types d'efficacité selon le contexte décisionnel.",
      excellence: "Intégration optimale des dimensions scientifique, pratique et économique dans la décision."
    },
    {
      concept: "Analyse Décisionnelle Avancée",
      analyse: "Méthodes quantitatives d'aide à la décision médicale : arbres de décision, analyses de Markov, modélisation des incertitudes et des préférences.",
      cas: "Construction d'un arbre décisionnel pour le choix thérapeutique dans une pathologie complexe avec multiple options.",
      ecueil: "Attention aux biais dans l'estimation des probabilités et des utilités - validation nécessaire.",
      memorisation: "Arbre décisionnel = 'Probabilités × Utilités' (formule de base de l'analyse de décision)",
      nuance: "Modélisation mathématique ≠ réalité clinique - toujours garder l'esprit critique.",
      maitrise: "Savoir construire, analyser et interpréter les arbres décisionnels en pratique clinique.",
      excellence: "Utilisation experte des outils d'analyse décisionnelle pour les cas complexes."
    }
  ];

  // Générer les lignes à partir des concepts experts
  const lignes: string[][] = [];
  
  if (conceptsRangB.length > 0) {
    conceptsRangB.forEach(concept => {
      lignes.push([
        concept.concept,
        concept.analyse,
        concept.cas,
        concept.ecueil,
        concept.memorisation,
        concept.nuance,
        concept.maitrise,
        concept.excellence
      ]);
    });
  }

  // Compléter avec les données originales si disponibles
  if (lignesBase.length > 0) {
    lignesBase.forEach((ligne: string[]) => {
      const ligneComplete = [
        ligne[0] || 'Concept avancé à définir',
        ligne[1] || 'Analyse approfondie à développer',
        ligne[2] || 'Cas expert à illustrer',
        getEcueilAEviter(ligne[0] || ''),
        getAideMemoire(ligne[0] || ''),
        getNuanceCritique(ligne[0] || ''),
        getApplicationExperte(ligne[0] || ''),
        getMaitriseRequise(ligne[0] || '')
      ];
      lignes.push(ligneComplete);
    });
  }

  return lignes;
}

// Fonctions utilitaires pour enrichir le contenu pédagogique Rang B
function getEcueilAEviter(concept: string): string {
  const ecueilsRangB = {
    'supports au raisonnement': 'Ne pas multiplier les consultations inutiles',
    'bases d\'information': 'Ne pas se fier aux sources non validées',
    'logique thérapeutique': 'Éviter la standardisation excessive',
    'efficacité': 'Ne pas confondre les 3 types d\'efficacité',
    'analyse décisionnelle': 'Attention aux biais dans les probabilités',
    'dynamiques décisionnelles': 'Éviter les extrêmes paternalisme/autonomisme',
    'systèmes d\'aide': 'Ne pas remplacer le jugement clinique'
  };
  
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(ecueilsRangB)) {
    if (key.includes(k)) return v;
  }
  return 'Piège de niveau expert à éviter';
}

function getAideMemoire(concept: string): string {
  const aidesRangB = {
    'supports au raisonnement': 'Prévention quaternaire = "Primum non nocere"',
    'bases d\'information': 'HAS + SFMG = "Référentiels français validés"',
    'logique thérapeutique': 'Triple alliance : Situation + Patient + Médecin',
    'efficacité': '3E = "Efficacité théorique/pratique/Économique"',
    'analyse décisionnelle': 'Arbre = "Probabilités × Utilités"',
    'dynamiques décisionnelles': 'Équilibre = "Art + Science + Préférences"',
    'systèmes d\'aide': 'SADM = "Support À Décision Médicale"'
  };
  
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(aidesRangB)) {
    if (key.includes(k)) return v;
  }
  return 'Mémorisation niveau expertise';
}

function getNuanceCritique(concept: string): string {
  const nuancesRangB = {
    'supports au raisonnement': 'Motifs multiples (moyenne 2,6 par consultation)',
    'bases d\'information': 'SMR = Service Médical Rendu (différent d\'ASMR)',
    'logique thérapeutique': 'Décision négociée ≠ décision imposée',
    'efficacité': 'Effectiveness (pratique) vs Efficacy (théorique)',
    'analyse décisionnelle': 'Modélisation ≠ réalité clinique',
    'dynamiques décisionnelles': 'Éviter scientisme ET négligence des preuves',
    'systèmes d\'aide': 'Information filtrée au BON moment'
  };
  
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(nuancesRangB)) {
    if (key.includes(k)) return v;
  }
  return 'Distinction fine essentielle';
}

function getApplicationExperte(concept: string): string {
  const applicationsRangB = {
    'supports au raisonnement': 'Consultation complexe : trier les priorités vitales',
    'bases d\'information': 'Utiliser fiches HAS pour argumentaire thérapeutique',
    'logique thérapeutique': 'Adapter la prescription aux spécificités du patient',
    'efficacité': 'Évaluation médico-économique des interventions',
    'analyse décisionnelle': 'Arbre décisionnel pour choix thérapeutiques complexes',
    'dynamiques décisionnelles': 'Médiation entre données scientifiques et vécu patient',
    'systèmes d\'aide': 'Intégration SADM dans workflow clinique'
  };
  
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(applicationsRangB)) {
    if (key.includes(k)) return v;
  }
  return 'Usage expert en situation complexe';
}

function getMaitriseRequise(concept: string): string {
  const maitrises = {
    'supports au raisonnement': 'Savoir prioriser et synthétiser efficacement',
    'bases d\'information': 'Connaître les sources de référence françaises',
    'logique thérapeutique': 'Maîtriser l\'alliance thérapeutique',
    'efficacité': 'Distinguer et utiliser les 3 types d\'efficacité',
    'analyse décisionnelle': 'Construire et interpréter les arbres décisionnels',
    'dynamiques décisionnelles': 'Équilibrer les 3 piliers de la décision médicale',
    'systèmes d\'aide': 'Utiliser sans dépendre des outils d\'aide'
  };
  
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(maitrises)) {
    if (key.includes(k)) return v;
  }
  return 'Compétence experte attendue';
}
