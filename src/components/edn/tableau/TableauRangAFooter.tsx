
import { CheckCircle, Target, BookOpen } from 'lucide-react';

interface TableauRangAFooterProps {
  colonnesCount?: number;
  lignesCount?: number;
}

export const TableauRangAFooter = ({ colonnesCount = 0, lignesCount = 0 }: TableauRangAFooterProps) => {
  return (
    <div className="space-y-4">
      {/* Résumé des apprentissages */}
      <div className="bg-gradient-to-r from-green-50 to-amber-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <Target className="h-5 w-5 text-green-600" />
          <h4 className="text-lg font-bold text-green-800">Objectifs d'apprentissage atteints</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-green-700">Concepts maîtrisés</div>
            <div className="text-2xl font-bold text-green-800">{lignesCount}</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-amber-700">Dimensions étudiées</div>
            <div className="text-2xl font-bold text-amber-800">{colonnesCount}</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-700">Niveau de préparation</div>
            <div className="text-2xl font-bold text-blue-800">EDN</div>
          </div>
        </div>
      </div>

      {/* Statut de completion */}
      <div className="text-center bg-green-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <p className="text-lg text-green-700 font-bold">
            Tableau Rang A optimisé et complet : {colonnesCount} colonnes × {lignesCount} concepts
          </p>
        </div>
        <div className="flex items-center justify-center space-x-2 mb-2">
          <BookOpen className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-600 font-medium">
            📚 Structure adaptative pour maximiser l'efficacité d'apprentissage EDN
          </p>
        </div>
        <p className="text-xs text-green-500 italic">
          ✅ Tous les fondamentaux essentiels sont couverts - Prêt pour l'évaluation
        </p>
      </div>
    </div>
  );
};
