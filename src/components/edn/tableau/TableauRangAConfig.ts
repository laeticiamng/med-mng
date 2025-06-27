
import { AlertTriangle, Lightbulb, Eye, Target, BookOpen, Zap, Shield, CheckCircle } from 'lucide-react';

export const COLONNES_CONFIG = [
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
