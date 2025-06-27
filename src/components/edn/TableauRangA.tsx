
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

  // Créer les lignes enrichies avec contenu pédagogique intelligent
  const lignesEnrichies = generateLignesRangAIntelligent(data);

  // Déterminer les colonnes pertinentes selon le contenu
  const colonnesUtiles = determinerColonnesUtiles(lignesEnrichies);

  console.log('TableauRangA: Rendering optimized table with', colonnesUtiles.length, 'columns and', lignesEnrichies.length, 'rows');
  
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
            <span className="font-medium">Pièges spécifiques</span>
          </div>
          <div className="flex items-center space-x-2 text-yellow-700">
            <Lightbulb className="h-5 w-5" />
            <span className="font-medium">Moyens mnémotechniques ciblés</span>
          </div>
          <div className="flex items-center space-x-2 text-purple-700">
            <Eye className="h-5 w-5" />
            <span className="font-medium">Subtilités critiques</span>
          </div>
          <div className="flex items-center space-x-2 text-teal-700">
            <Zap className="h-5 w-5" />
            <span className="font-medium">Applications concrètes</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-xl border border-gray-200">
        <div className="min-w-full">
          {/* En-têtes de colonnes dynamiques */}
          <div className={`grid gap-2 mb-2 p-2`} style={{gridTemplateColumns: `repeat(${colonnesUtiles.length}, 1fr)`}}>
            {colonnesUtiles.map((colonne, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg text-center font-bold text-sm text-white ${colonne.couleur} shadow-md`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>{colonne.nom}</span>
                  {colonne.icone}
                </div>
              </div>
            ))}
          </div>
          
          {/* Lignes de données optimisées */}
          {lignesEnrichies.map((ligne, ligneIndex) => (
            <div key={ligneIndex} className={`grid gap-2 mb-2 p-2`} style={{gridTemplateColumns: `repeat(${colonnesUtiles.length}, 1fr)`}}>
              {ligne.map((cellule, celluleIndex) => {
                if (!cellule || cellule.trim() === '') return null;
                
                return (
                  <Card
                    key={celluleIndex}
                    className={`p-4 border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] min-h-[120px] ${colonnesUtiles[celluleIndex].couleurCellule}`}
                  >
                    <div className={`text-sm leading-relaxed ${colonnesUtiles[celluleIndex].couleurTexte}`}>
                      <div className="space-y-2">
                        {cellule.split('\n').map((ligne, index) => (
                          <div key={index} className="leading-relaxed">
                            {ligne}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center bg-green-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <p className="text-lg text-green-700 font-bold">
            Tableau Rang A optimisé : {colonnesUtiles.length} colonnes × {lignesEnrichies.length} lignes
          </p>
        </div>
        <p className="text-sm text-green-600">
          📚 Structure adaptative pour maximiser l'efficacité d'apprentissage
        </p>
      </div>
    </div>
  );
};

// Configuration des colonnes possibles avec leurs propriétés
const COLONNES_CONFIG = [
  {
    nom: 'Concept Clé',
    icone: <BookOpen className="h-3 w-3 inline ml-1" />,
    couleur: 'bg-slate-600',
    couleurCellule: 'bg-slate-50 border-slate-300',
    couleurTexte: 'text-slate-800 font-bold',
    obligatoire: true
  },
  {
    nom: 'Définition Précise',
    icone: <Target className="h-3 w-3 inline ml-1" />,
    couleur: 'bg-blue-600',
    couleurCellule: 'bg-blue-50 border-blue-300',
    couleurTexte: 'text-blue-800',
    obligatoire: true
  },
  {
    nom: 'Exemple Concret',
    icone: <CheckCircle className="h-3 w-3 inline ml-1" />,
    couleur: 'bg-green-600',
    couleurCellule: 'bg-green-50 border-green-300',
    couleurTexte: 'text-green-800',
    obligatoire: false
  },
  {
    nom: 'Piège à Éviter',
    icone: <AlertTriangle className="h-3 w-3 inline ml-1" />,
    couleur: 'bg-red-600',
    couleurCellule: 'bg-red-50 border-red-300',
    couleurTexte: 'text-red-800 font-semibold',
    obligatoire: false
  },
  {
    nom: 'Moyen Mnémotechnique',
    icone: <Lightbulb className="h-3 w-3 inline ml-1" />,
    couleur: 'bg-yellow-600',
    couleurCellule: 'bg-yellow-50 border-yellow-300',
    couleurTexte: 'text-yellow-800 font-medium italic',
    obligatoire: false
  },
  {
    nom: 'Subtilité Importante',
    icone: <Eye className="h-3 w-3 inline ml-1" />,
    couleur: 'bg-purple-600',
    couleurCellule: 'bg-purple-50 border-purple-300',
    couleurTexte: 'text-purple-800 font-medium',
    obligatoire: false
  },
  {
    nom: 'Application Pratique',
    icone: <Zap className="h-3 w-3 inline ml-1" />,
    couleur: 'bg-teal-600',
    couleurCellule: 'bg-teal-50 border-teal-300',
    couleurTexte: 'text-teal-800 font-medium',
    obligatoire: false
  },
  {
    nom: 'Point de Vigilance',
    icone: <Shield className="h-3 w-3 inline ml-1" />,
    couleur: 'bg-orange-600',
    couleurCellule: 'bg-orange-50 border-orange-300',
    couleurTexte: 'text-orange-800 font-medium',
    obligatoire: false
  }
];

// Fonction pour déterminer les colonnes utiles selon le contenu
function determinerColonnesUtiles(lignes: string[][]): any[] {
  const colonnesUtiles = [];
  
  for (let colIndex = 0; colIndex < COLONNES_CONFIG.length; colIndex++) {
    const config = COLONNES_CONFIG[colIndex];
    
    // Toujours inclure les colonnes obligatoires
    if (config.obligatoire) {
      colonnesUtiles.push(config);
      continue;
    }
    
    // Pour les autres colonnes, vérifier s'il y a du contenu pertinent
    const aContenuPertinent = lignes.some(ligne => {
      const cellule = ligne[colIndex];
      return cellule && 
             cellule.trim() !== '' && 
             !cellule.includes('à définir') &&
             !cellule.includes('à compléter') &&
             !cellule.includes('à fournir') &&
             !cellule.includes('à retenir') &&
             !cellule.includes('à mémoriser') &&
             !cellule.includes('essentiel') &&
             cellule.length > 20; // Contenu substantiel
    });
    
    if (aContenuPertinent) {
      colonnesUtiles.push(config);
    }
  }
  
  return colonnesUtiles;
}

// Fonction pour générer les lignes enrichies de manière intelligente
function generateLignesRangAIntelligent(data: any): string[][] {
  const lignesBase = data.lignes || [];
  
  // Concepts médicaux fondamentaux avec contenu pédagogique ciblé
  const conceptsRangA = [
    {
      concept: "Colloque Singulier",
      definition: "Relation exclusive médecin-patient caractérisée par la confidentialité, le respect mutuel et l'individualisation des soins",
      exemple: "Consultation privée où le médecin adapte son approche selon l'âge, la culture et les besoins spécifiques du patient",
      piege: "Ne pas confondre avec colloque dual - le singulier implique l'unicité de la relation thérapeutique",
      mnemo: "SINGULIER = 'Seul Individu Nécessite Générosité Unique Liaison Individualisée Empathique Respectueuse'",
      subtilite: "Le colloque reste singulier même en présence de la famille - c'est l'attention portée au patient qui compte",
      application: "Personnaliser chaque consultation selon les caractéristiques bio-psycho-sociales du patient",
      vigilance: "Maintenir la confidentialité absolue même avec les proches du patient"
    },
    {
      concept: "Personne de Confiance",
      definition: "Personne majeure désignée par écrit par le patient pour l'accompagner dans ses démarches et faire valoir sa volonté",
      exemple: "Patient hospitalisé qui désigne par écrit son conjoint comme personne de confiance pour les décisions médicales",
      piege: "Ne pas confondre avec le tuteur légal - la personne de confiance n'a pas de pouvoir décisionnel légal",
      mnemo: "PC = 'Personne Choisie' par le patient, 'Parole Compte' en cas d'inconscience",
      subtilite: "Son témoignage sur la volonté du patient prévaut sur tous les autres avis de l'entourage",
      application: "Solliciter systématiquement la désignation lors de toute hospitalisation ou consultation importante",
      vigilance: "Vérifier l'identité et la désignation écrite formelle avant toute consultation"
    },
    {
      concept: "Démarche Éthique Médicale",
      definition: "Processus de réflexion structuré pour résoudre les dilemmes moraux en médecine, intégrant principes éthiques et contexte clinique",
      exemple: "Face à un refus de transfusion chez un Témoin de Jéhovah : respecter l'autonomie tout en évaluant les alternatives thérapeutiques",
      piege: "Ne pas appliquer automatiquement les principes - chaque situation nécessite une analyse contextuelle",
      mnemo: "ÉTHIQUE = 'Examiner Toutes Hypothèses Intelligemment Questionner Utilement Équilibrer'",
      subtilite: "L'éthique médicale n'est pas que déontologique - elle intègre aussi l'éthique du care et de la vertu",
      application: "Utiliser la grille des 4 principes (autonomie, bienfaisance, non-malfaisance, justice) pour analyser chaque dilemme",
      vigilance: "Ne jamais imposer ses propres valeurs morales au patient"
    },
    {
      concept: "Organisation des Soins",
      definition: "Structuration coordonnée des ressources humaines, matérielles et organisationnelles pour optimiser la prise en charge des patients",
      exemple: "Mise en place d'un parcours de soins coordonné entre médecin traitant, spécialistes et hôpital pour un patient diabétique",
      piege: "Ne pas confondre efficience organisationnelle et qualité des soins - l'une ne garantit pas l'autre",
      mnemo: "ORGANISATION = ✨Organisation Rationnelle Garantit Amélioration Noteworthy Individuelle Soins Appropriés Totalement Intégrés Optimisés Nécessaires✨",
      subtilite: "L'organisation doit s'adapter au patient et non l'inverse - personnalisation dans la standardisation",
      application: "Coordonner les interventions multiprofessionnelles en maintenant la continuité des soins",
      vigilance: "Éviter la fragmentation des soins par excès de spécialisation"
    }
  ];

  // Générer les lignes à partir des concepts avec contenu intelligent
  const lignes: string[][] = [];
  
  conceptsRangA.forEach(concept => {
    const ligne = [
      concept.concept,
      concept.definition,
      concept.exemple || '',
      concept.piege || '',
      concept.mnemo || '',
      concept.subtilite || '',
      concept.application || '',
      concept.vigilance || ''
    ];
    
    // Ne garder que les cellules avec du contenu pertinent
    lignes.push(ligne);
  });

  // Compléter avec les données originales si pertinentes
  if (lignesBase.length > 0) {
    lignesBase.forEach((ligne: string[]) => {
      const ligneComplete = [
        ligne[0] || '',
        ligne[1] || '',
        ligne[2] || '',
        getPiegeSpecifique(ligne[0] || ''),
        getMnemoIntelligent(ligne[0] || ''),
        getSubtiliteReelle(ligne[0] || ''),
        getApplicationConcrete(ligne[0] || ''),
        getVigilanceSpecifique(ligne[0] || '')
      ];
      
      // Vérifier si la ligne apporte de la valeur
      const aContenuPertinent = ligneComplete.some((cellule, index) => {
        if (index < 2) return true; // Toujours garder concept et définition
        return cellule && cellule.length > 20 && !cellule.includes('à définir');
      });
      
      if (aContenuPertinent) {
        lignes.push(ligneComplete);
      }
    });
  }

  return lignes;
}

// Fonctions utilitaires intelligentes qui ne renvoient du contenu que s'il est pertinent
function getPiegeSpecifique(concept: string): string {
  const piegesSpecifiques = {
    'colloque singulier': 'Ne pas confondre avec colloque dual - le singulier implique l'unicité de la relation',
    'personne de confiance': 'Ne pas confondre avec tuteur légal - pas de pouvoir décisionnel légal',
    'démarche éthique': 'Ne pas appliquer automatiquement les principes - analyse contextuelle nécessaire',
    'organisation des soins': 'Ne pas confondre efficience organisationnelle et qualité des soins'
  };
  
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(piegesSpecifiques)) {
    if (key.includes(k)) return v;
  }
  return '';
}

function getMnemoIntelligent(concept: string): string {
  const mnemosIntelligents = {
    'colloque singulier': 'SINGULIER = "Seul Individu Nécessite Générosité Unique Liaison Individualisée Empathique Respectueuse"',
    'personne de confiance': 'PC = "Personne Choisie" + "Parole Compte" en cas d\'inconscience',
    'démarche éthique': 'ÉTHIQUE = "Examiner Toutes Hypothèses Intelligemment Questionner Utilement Équilibrer"'
  };
  
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(mnemosIntelligents)) {
    if (key.includes(k)) return v;
  }
  return '';
}

function getSubtiliteReelle(concept: string): string {
  const subtilitesReelles = {
    'colloque singulier': 'Reste singulier même en présence de la famille - c\'est l\'attention au patient qui compte',
    'personne de confiance': 'Son témoignage sur la volonté du patient prévaut sur tous les autres avis',
    'démarche éthique': 'N\'est pas que déontologique - intègre aussi éthique du care et de la vertu',
    'organisation des soins': 'Doit s\'adapter au patient et non l\'inverse - personnalisation dans la standardisation'
  };
  
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(subtilitesReelles)) {
    if (key.includes(k)) return v;
  }
  return '';
}

function getApplicationConcrete(concept: string): string {
  const applicationsConcrates = {
    'colloque singulier': 'Personnaliser chaque consultation selon les caractéristiques bio-psycho-sociales',
    'personne de confiance': 'Solliciter systématiquement la désignation lors de toute hospitalisation importante',
    'démarche éthique': 'Utiliser la grille des 4 principes pour analyser chaque dilemme moral',
    'organisation des soins': 'Coordonner les interventions multiprofessionnelles en maintenant la continuité'
  };
  
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(applicationsConcrates)) {
    if (key.includes(k)) return v;
  }
  return '';
}

function getVigilanceSpecifique(concept: string): string {
  const vigilancesSpecifiques = {
    'colloque singulier': 'Maintenir la confidentialité absolue même avec les proches du patient',
    'personne de confiance': 'Vérifier l\'identité et la désignation écrite formelle avant consultation',
    'démarche éthique': 'Ne jamais imposer ses propres valeurs morales au patient',
    'organisation des soins': 'Éviter la fragmentation des soins par excès de spécialisation'
  };
  
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(vigilancesSpecifiques)) {
    if (key.includes(k)) return v;
  }
  return '';
}
