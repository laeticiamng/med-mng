
import { conceptsRangAIC4, conceptsRangBIC4 } from './TableauRangADataIC4';

export const generateLignesRangAIntelligentIC4 = (data: any): string[][] => {
  const lignes: string[][] = [];
  
  // Utiliser les données enrichies IC-4
  conceptsRangAIC4.forEach(concept => {
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
    
    lignes.push(ligne);
  });

  return lignes;
};

export const generateLignesRangBIntelligentIC4 = (data: any): string[][] => {
  const lignes: string[][] = [];
  
  // Utiliser les données expertes IC-4
  conceptsRangBIC4.forEach(concept => {
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

  return lignes;
};

export const determinerColonnesUtilesIC4 = (lignes: string[][]): any[] => {
  const COLONNES_CONFIG = [
    {
      nom: 'Concept',
      icone: '🎯',
      couleur: 'bg-blue-600',
      couleurCellule: 'bg-blue-50 border-blue-300',
      couleurTexte: 'text-blue-800 font-bold',
      obligatoire: true
    },
    {
      nom: 'Définition',
      icone: '📖',
      couleur: 'bg-green-600',
      couleurCellule: 'bg-green-50 border-green-300',
      couleurTexte: 'text-green-800',
      obligatoire: true
    },
    {
      nom: 'Exemple',
      icone: '💡',
      couleur: 'bg-amber-600',
      couleurCellule: 'bg-amber-50 border-amber-300',
      couleurTexte: 'text-amber-800',
      obligatoire: false
    },
    {
      nom: 'Piège',
      icone: '⚠️',
      couleur: 'bg-red-600',
      couleurCellule: 'bg-red-50 border-red-300',
      couleurTexte: 'text-red-800 font-semibold',
      obligatoire: false
    },
    {
      nom: 'Mnémotechnique',
      icone: '🧠',
      couleur: 'bg-purple-600',
      couleurCellule: 'bg-purple-50 border-purple-300',
      couleurTexte: 'text-purple-800 font-medium italic',
      obligatoire: false
    },
    {
      nom: 'Subtilité',
      icone: '🔍',
      couleur: 'bg-indigo-600',
      couleurCellule: 'bg-indigo-50 border-indigo-300',
      couleurTexte: 'text-indigo-800',
      obligatoire: false
    },
    {
      nom: 'Application',
      icone: '🎯',
      couleur: 'bg-teal-600',
      couleurCellule: 'bg-teal-50 border-teal-300',
      couleurTexte: 'text-teal-800 font-medium',
      obligatoire: false
    },
    {
      nom: 'Vigilance',
      icone: '🛡️',
      couleur: 'bg-orange-600',
      couleurCellule: 'bg-orange-50 border-orange-300',
      couleurTexte: 'text-orange-800 font-semibold',
      obligatoire: false
    }
  ];

  const colonnesUtiles = [];
  
  for (let colIndex = 0; colIndex < COLONNES_CONFIG.length; colIndex++) {
    const config = COLONNES_CONFIG[colIndex];
    
    if (config.obligatoire) {
      colonnesUtiles.push(config);
      continue;
    }
    
    const aContenuPertinent = lignes.some(ligne => {
      const cellule = ligne[colIndex];
      return cellule && 
             cellule.trim() !== '' && 
             cellule.length > 10;
    });
    
    if (aContenuPertinent) {
      colonnesUtiles.push(config);
    }
  }
  
  return colonnesUtiles;
};
