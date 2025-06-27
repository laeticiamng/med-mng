
import { CheckCircle, Target, BookOpen, Award, Scale, Users, Shield } from 'lucide-react';

interface TableauRangAFooterIC2Props {
  colonnesCount?: number;
  lignesCount?: number;
}

export const TableauRangAFooterIC2 = ({ colonnesCount = 0, lignesCount = 0 }: TableauRangAFooterIC2Props) => {
  return (
    <div className="space-y-4">
      {/* Résumé spécifique IC-2 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <Scale className="h-5 w-5 text-blue-600" />
          <h4 className="text-lg font-bold text-blue-800">Valeurs professionnelles maîtrisées</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-blue-700">Principes déontologiques</div>
            <div className="text-2xl font-bold text-blue-800">{lignesCount}</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-indigo-700">Dimensions étudiées</div>
            <div className="text-2xl font-bold text-indigo-800">{colonnesCount}</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-700">Niveau atteint</div>
            <div className="text-2xl font-bold text-green-800">Professionnel</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-purple-700">Éthique intégrée</div>
            <div className="text-2xl font-bold text-purple-800">✓</div>
          </div>
        </div>
      </div>

      {/* Section spéciale déontologie */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <Shield className="h-5 w-5 text-green-600" />
          <h4 className="text-lg font-bold text-green-800">Déontologie et éthique professionnelle</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-green-700">
            <Award className="h-4 w-4" />
            <span>Code déontologique maîtrisé</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-700">
            <Users className="h-4 w-4" />
            <span>Collaboration interprofessionnelle</span>
          </div>
          <div className="flex items-center space-x-2 text-purple-700">
            <Scale className="h-4 w-4" />
            <span>Équilibre éthique intégré</span>
          </div>
        </div>
      </div>

      {/* Statut de completion */}
      <div className="text-center bg-blue-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <CheckCircle className="h-6 w-6 text-blue-600" />
          <p className="text-lg text-blue-700 font-bold">
            Tableau Rang A IC-2 complet : {colonnesCount} colonnes × {lignesCount} concepts professionnels
          </p>
        </div>
        <div className="flex items-center justify-center space-x-2 mb-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <p className="text-sm text-blue-600 font-medium">
            ⚖️ Valeurs professionnelles et déontologie médicale parfaitement structurées
          </p>
        </div>
        <p className="text-xs text-blue-500 italic">
          ✅ Fondamentaux éthiques et déontologiques acquis - Prêt pour la pratique professionnelle
        </p>
      </div>
    </div>
  );
};
