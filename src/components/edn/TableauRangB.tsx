
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

  // Créer les lignes enrichies avec contenu expert intelligent
  const lignesExpertes = generateLignesRangBIntelligent(data);

  // Déterminer les colonnes pertinentes selon le contenu expert
  const colonnesUtiles = determinerColonnesUtilesB(lignesExpertes);

  console.log('TableauRangB: Rendering optimized expert table with', colonnesUtiles.length, 'columns and', lignesExpertes.length, 'rows');
  
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
            <span className="font-medium">Écueils experts</span>
          </div>
          <div className="flex items-center space-x-2 text-amber-700">
            <Lightbulb className="h-5 w-5" />
            <span className="font-medium">Techniques avancées</span>
          </div>
          <div className="flex items-center space-x-2 text-purple-700">
            <Eye className="h-5 w-5" />
            <span className="font-medium">Distinctions fines</span>
          </div>
          <div className="flex items-center space-x-2 text-teal-700">
            <Crown className="h-5 w-5" />
            <span className="font-medium">Maîtrise technique</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {lignesExpertes.map((ligne, ligneIndex) => (
          <div key={ligneIndex} className="space-y-4">
            {/* Titre principal du concept */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-blue-900 mb-2">{ligne[0]}</h3>
              <p className="text-lg text-blue-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
                {ligne[1]}
              </p>
            </div>
            
            {/* Grille de cartes pour les autres informations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ligne.slice(2).map((cellule, celluleIndex) => {
                if (!cellule || cellule.trim() === '') return null;
                
                const colonneIndex = celluleIndex + 2;
                const colonne = colonnesUtiles[colonneIndex];
                
                if (!colonne) return null;
                
                return (
                  <Card
                    key={celluleIndex}
                    className={`p-4 border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${colonne.couleurCellule}`}
                  >
                    <div className="mb-3">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${colonne.couleur}`}>
                        {colonne.icone}
                        <span className="ml-2">{colonne.nom}</span>
                      </div>
                    </div>
                    <div className={`text-sm leading-relaxed ${colonne.couleurTexte}`}>
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
          </div>
        ))}
      </div>

      <div className="text-center bg-blue-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Crown className="h-6 w-6 text-blue-600" />
          <p className="text-lg text-blue-700 font-bold">
            Tableau Rang B expert optimisé : {colonnesUtiles.length} colonnes × {lignesExpertes.length} lignes
          </p>
        </div>
        <p className="text-sm text-blue-600">
          🎯 Structure adaptative experte pour l'excellence et la différenciation maximale
        </p>
      </div>
    </div>
  );
};

// Configuration des colonnes expertes possibles
const COLONNES_CONFIG_B = [
  {
    nom: 'Concept Avancé',
    icone: <Crown className="h-3 w-3 inline ml-1" />,
    couleur: 'bg-indigo-600',
    couleurCellule: 'bg-indigo-50 border-indigo-300',
    couleurTexte: 'text-indigo-800 font-bold',
    obligatoire: true
  },
  {
    nom: 'Analyse Experte',
    icone: <Target className="h-3 w-3 inline ml-1" />,
    couleur: 'bg-blue-600',
    couleurCellule: 'bg-blue-50 border-blue-300',
    couleurTexte: 'text-blue-800 font-medium',
    obligatoire: true
  },
  {
    nom: 'Cas Complexe',
    icone: <Star className="h-3 w-3 inline ml-1" />,
    couleur: 'bg-emerald-600',
    couleurCellule: 'bg-emerald-50 border-emerald-300',
    couleurTexte: 'text-emerald-800',
    obligatoire: false
  },
  {
    nom: 'Écueil Expert',
    icone: <AlertTriangle className="h-3 w-3 inline ml-1" />,
    couleur: 'bg-red-600',
    couleurCellule: 'bg-red-50 border-red-300',
    couleurTexte: 'text-red-800 font-semibold',
    obligatoire: false
  },
  {
    nom: 'Technique Avancée',
    icone: <Lightbulb className="h-3 w-3 inline ml-1" />,
    couleur: 'bg-amber-600',
    couleurCellule: 'bg-amber-50 border-amber-300',
    couleurTexte: 'text-amber-800 font-medium italic',
    obligatoire: false
  },
  {
    nom: 'Distinction Fine',
    icone: <Eye className="h-3 w-3 inline ml-1" />,
    couleur: 'bg-purple-600',
    couleurCellule: 'bg-purple-50 border-purple-300',
    couleurTexte: 'text-purple-800 font-medium',
    obligatoire: false
  },
  {
    nom: 'Maîtrise Technique',
    icone: <Zap className="h-3 w-3 inline ml-1" />,
    couleur: 'bg-teal-600',
    couleurCellule: 'bg-teal-50 border-teal-300',
    couleurTexte: 'text-teal-800 font-semibold',
    obligatoire: false
  },
  {
    nom: 'Excellence Requise',
    icone: <Shield className="h-3 w-3 inline ml-1" />,
    couleur: 'bg-slate-600',
    couleurCellule: 'bg-slate-50 border-slate-300',
    couleurTexte: 'text-slate-800 font-bold',
    obligatoire: false
  }
];

// Fonction pour déterminer les colonnes utiles selon le contenu expert
function determinerColonnesUtilesB(lignes: string[][]): any[] {
  const colonnesUtiles = [];
  
  for (let colIndex = 0; colIndex < COLONNES_CONFIG_B.length; colIndex++) {
    const config = COLONNES_CONFIG_B[colIndex];
    
    // Toujours inclure les colonnes obligatoires
    if (config.obligatoire) {
      colonnesUtiles.push(config);
      continue;
    }
    
    // Pour les autres colonnes, vérifier s'il y a du contenu expert pertinent
    const aContenuExpertPertinent = lignes.some(ligne => {
      const cellule = ligne[colIndex];
      return cellule && 
             cellule.trim() !== '' && 
             !cellule.includes('à définir') &&
             !cellule.includes('à développer') &&
             !cellule.includes('niveau expert') &&
             !cellule.includes('avancé à') &&
             cellule.length > 25; // Contenu plus substantiel pour le niveau expert
    });
    
    if (aContenuExpertPertinent) {
      colonnesUtiles.push(config);
    }
  }
  
  return colonnesUtiles;
}

// Fonction pour générer les lignes expertes de manière intelligente
function generateLignesRangBIntelligent(data: any): string[][] {
  const lignesBase = data.lignes || [];
  
  // Concepts médicaux avancés avec contenu expert ciblé
  const conceptsRangB = [
    {
      concept: "Analyse Décisionnelle Multi-critères",
      analyse: "Méthode structurée d'aide à la décision médicale intégrant les dimensions clinique, éthique, économique et organisationnelle dans un processus formalisé",
      cas: "Choix thérapeutique complexe chez un patient âgé polymorbide : pondérer efficacité thérapeutique, qualité de vie, coûts et préférences familiales",
      ecueil: "Éviter la paralysie décisionnelle par excès d'analyse - garder le pragmatisme clinique",
      technique: "Matrice décisionnelle pondérée : critères × poids × scores = aide objective au choix",
      distinction: "Décision partagée ≠ Analyse multi-critères : l'une est relationnelle, l'autre est méthodologique",
      maitrise: "Savoir construire et utiliser des grilles d'aide à la décision adaptées au contexte clinique",
      excellence: "Intégration harmonieuse de l'analyse formelle et de l'intuition clinique experte"
    },
    {
      concept: "Régulation Avancée des Pratiques",
      analyse: "Ensemble des mécanismes institutionnels et professionnels visant à optimiser la qualité, la sécurité et l'efficience des soins par l'autorégulation et l'évaluation continue",
      cas: "Mise en place d'un système de revue de morbi-mortalité (RMM) pluridisciplinaire avec analyse des événements indésirables",
      ecueil: "Ne pas transformer la régulation en contrôle punitif - privilégier l'amélioration continue",
      technique: "Cycle PDCA médical : Plan-Do-Check-Act adapté aux spécificités de la pratique clinique",
      distinction: "Autorégulation professionnelle vs Régulation externe : logiques complémentaires mais distinctes",
      maitrise: "Maîtriser les outils d'évaluation des pratiques et d'amélioration continue de la qualité",
      excellence: "Leadership professionnel dans la promotion d'une culture sécurité et qualité"
    },
    {
      concept: "Éthique Procédurale Complexe",
      analyse: "Application des principes éthiques dans les situations complexes nécessitant une approche procédurale formalisée, notamment en cas de conflits de valeurs ou d'intérêts multiples",
      cas: "Conflit éthique en réanimation : désaccord famille-équipe sur limitation des thérapeutiques actives nécessitant médiation éthique",
      ecueil: "Éviter le formalisme excessif qui paralyse la décision clinique urgente",
      technique: "Grille d'analyse éthique structurée : identification des enjeux, des parties prenantes, des options et de leurs conséquences",
      distinction: "Éthique de situation vs Éthique procédurale : adaptation contextuelle vs cadre méthodologique",
      maitrise: "Savoir mener une consultation d'éthique clinique et animer une réflexion éthique pluridisciplinaire",
      excellence: "Facilitation experte des processus de résolution des dilemmes éthiques complexes"
    }
  ];

  // Générer les lignes à partir des concepts experts avec contenu intelligent
  const lignes: string[][] = [];
  
  conceptsRangB.forEach(concept => {
    const ligne = [
      concept.concept,
      concept.analyse,
      concept.cas || '',
      concept.ecueil || '',
      concept.technique || '',
      concept.distinction || '',
      concept.maitrise || '',
      concept.excellence || ''
    ];
    
    lignes.push(ligne);
  });

  // Compléter avec les données originales si elles apportent de la valeur experte
  if (lignesBase.length > 0) {
    lignesBase.forEach((ligne: string[]) => {
      const ligneComplete = [
        ligne[0] || '',
        ligne[1] || '',
        ligne[2] || '',
        getEcueilExpert(ligne[0] || ''),
        getTechniqueAvancee(ligne[0] || ''),
        getDistinctionFine(ligne[0] || ''),
        getMaitriseExpertise(ligne[0] || ''),
        getExcellenceRequise(ligne[0] || '')
      ];
      
      // Vérifier si la ligne apporte de la valeur experte
      const aContenuExpert = ligneComplete.some((cellule, index) => {
        if (index < 2) return true; // Toujours garder concept et analyse
        return cellule && cellule.length > 25 && !cellule.includes('niveau expert');
      });
      
      if (aContenuExpert) {
        lignes.push(ligneComplete);
      }
    });
  }

  return lignes;
}

// Fonctions utilitaires intelligentes pour le niveau expert
function getEcueilExpert(concept: string): string {
  const ecueilsExperts = {
    'analyse décisionnelle': 'Éviter la paralysie décisionnelle par excès d\'analyse formelle',
    'régulation des pratiques': 'Ne pas transformer la régulation en contrôle punitif',
    'éthique procédurale': 'Éviter le formalisme excessif qui paralyse la décision clinique',
    'supports au raisonnement': 'Ne pas substituer l\'outil au raisonnement clinique expert'
  };
  
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(ecueilsExperts)) {
    if (key.includes(k)) return v;
  }
  return '';
}

function getTechniqueAvancee(concept: string): string {
  const techniquesAvancees = {
    'analyse décisionnelle': 'Matrice décisionnelle pondérée : critères × poids × scores = aide objective',
    'régulation des pratiques': 'Cycle PDCA médical : Plan-Do-Check-Act adapté à la pratique clinique',
    'éthique procédurale': 'Grille d\'analyse éthique : enjeux → parties → options → conséquences'
  };
  
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(techniquesAvancees)) {
    if (key.includes(k)) return v;
  }
  return '';
}

function getDistinctionFine(concept: string): string {
  const distinctionsFines = {
    'analyse décisionnelle': 'Décision partagée ≠ Analyse multi-critères : relationnelle vs méthodologique',
    'régulation des pratiques': 'Autorégulation vs Régulation externe : logiques complémentaires distinctes',
    'éthique procédurale': 'Éthique de situation vs Éthique procédurale : contextuelle vs méthodologique'
  };
  
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(distinctionsFines)) {
    if (key.includes(k)) return v;
  }
  return '';
}

function getMaitriseExpertise(concept: string): string {
  const maitrises = {
    'analyse décisionnelle': 'Savoir construire et utiliser des grilles d\'aide à la décision adaptées',
    'régulation des pratiques': 'Maîtriser les outils d\'évaluation et d\'amélioration continue de la qualité',
    'éthique procédurale': 'Savoir mener une consultation d\'éthique et animer la réflexion pluridisciplinaire'
  };
  
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(maitrises)) {
    if (key.includes(k)) return v;
  }
  return '';
}

function getExcellenceRequise(concept: string): string {
  const excellences = {
    'analyse décisionnelle': 'Intégration harmonieuse de l\'analyse formelle et de l\'intuition clinique',
    'régulation des pratiques': 'Leadership professionnel dans la promotion d\'une culture sécurité-qualité',
    'éthique procédurale': 'Facilitation experte des processus de résolution des dilemmes complexes'
  };
  
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(excellences)) {
    if (key.includes(k)) return v;
  }
  return '';
}
