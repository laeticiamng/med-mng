
import { AlertTriangle, Lightbulb, Eye, Target, BookOpen, Zap, Shield, CheckCircle } from 'lucide-react';

export const getColumnIcon = (columnName: string) => {
  switch (columnName) {
    case 'Concept Clé':
      return <BookOpen className="h-3 w-3 inline ml-1" />;
    case 'Définition Précise':
      return <Target className="h-3 w-3 inline ml-1" />;
    case 'Exemple Concret':
      return <CheckCircle className="h-3 w-3 inline ml-1" />;
    case 'Piège à Éviter':
      return <AlertTriangle className="h-3 w-3 inline ml-1" />;
    case 'Moyen Mnémotechnique':
      return <Lightbulb className="h-3 w-3 inline ml-1" />;
    case 'Subtilité Importante':
      return <Eye className="h-3 w-3 inline ml-1" />;
    case 'Application Pratique':
      return <Zap className="h-3 w-3 inline ml-1" />;
    case 'Point de Vigilance':
      return <Shield className="h-3 w-3 inline ml-1" />;
    default:
      return null;
  }
};
