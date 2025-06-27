
import { CheckCircle } from 'lucide-react';

interface TableauRangAFooterProps {
  colonnesCount: number;
  lignesCount: number;
}

export const TableauRangAFooter = ({ colonnesCount, lignesCount }: TableauRangAFooterProps) => {
  return (
    <div className="text-center bg-green-50 p-6 rounded-lg border border-green-200">
      <div className="flex items-center justify-center space-x-2 mb-2">
        <CheckCircle className="h-6 w-6 text-green-600" />
        <p className="text-lg text-green-700 font-bold">
          Tableau Rang A optimisé : {colonnesCount} colonnes × {lignesCount} lignes
        </p>
      </div>
      <p className="text-sm text-green-600">
        📚 Structure adaptative pour maximiser l'efficacité d'apprentissage
      </p>
    </div>
  );
};
