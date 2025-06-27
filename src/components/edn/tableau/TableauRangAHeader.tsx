
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Lightbulb, Eye, Zap } from 'lucide-react';

interface TableauRangAHeaderProps {
  theme: string;
}

export const TableauRangAHeader = ({ theme }: TableauRangAHeaderProps) => {
  return (
    <>
      <div className="text-center">
        <Badge variant="secondary" className="bg-green-100 text-green-800 mb-4 text-lg px-4 py-2">
          Rang A - Fondamentaux Essentiels
        </Badge>
        <h2 className="text-3xl font-serif text-amber-900 mb-2">{theme || 'Tableau Rang A'}</h2>
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
    </>
  );
};
