
import { CheckCircle, Target, BookOpen, Award, Shield } from 'lucide-react';

interface TableauRangAFooterIC4Props {
  colonnesCount?: number;
  lignesCount?: number;
}

export const TableauRangAFooterIC4 = ({ colonnesCount = 0, lignesCount = 0 }: TableauRangAFooterIC4Props) => {
  return (
    <div className="space-y-4">
      {/* Résumé spécifique IC-4 */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <Shield className="h-5 w-5 text-blue-600" />
          <h4 className="text-lg font-bold text-blue-800">IC-4 : Qualité et sécurité des soins - Maîtrise complète</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-blue-700">Concepts IC-4</div>
            <div className="text-2xl font-bold text-blue-800">{lignesCount}</div>
            <div className="text-xs text-blue-600">EIAS • BMR • Hygiène • Qualité</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-700">Dimensions couvertes</div>
            <div className="text-2xl font-bold text-green-800">{colonnesCount}</div>
            <div className="text-xs text-green-600">Définitions • Pièges • Applications</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-amber-700">Niveau atteint</div>
            <div className="text-2xl font-bold text-amber-800">EDN</div>
            <div className="text-xs text-amber-600">Prêt pour l'évaluation</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-purple-700">Spécialité</div>
            <div className="text-2xl font-bold text-purple-800">Transversal</div>
            <div className="text-xs text-purple-600">Tous services concernés</div>
          </div>
        </div>
      </div>

      {/* Points clés IC-4 */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <Award className="h-5 w-5 text-amber-600" />
          <h5 className="text-md font-bold text-amber-800">Points clés IC-4 maîtrisés</h5>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-green-700">EIAS : 5 niveaux de gravité</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-green-700">BMR/BHR : transmission et résistances</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-green-700">Hygiène des mains : SHA 7 temps</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-green-700">Précautions standard/complémentaires</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-green-700">Antisepsie/asepsie/désinfection</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-green-700">Démarche qualité et structures</span>
          </div>
        </div>
      </div>

      {/* Statut de completion */}
      <div className="text-center bg-green-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Target className="h-6 w-6 text-green-600" />
          <p className="text-lg text-green-700 font-bold">
            IC-4 Qualité et sécurité des soins : {colonnesCount} dimensions × {lignesCount} concepts fondamentaux
          </p>
        </div>
        <div className="flex items-center justify-center space-x-2 mb-2">
          <BookOpen className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-600 font-medium">
            🎯 Item transversal essentiel - Base de la sécurité patient
          </p>
        </div>
        <p className="text-xs text-green-500 italic">
          ✅ Maîtrise complète des fondamentaux qualité-sécurité - Prêt pour l'EDN
        </p>
      </div>
    </div>
  );
};
