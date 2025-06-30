
import { CheckCircle, Target, BookOpen, Award, Scale, Users, Shield, AlertTriangle, Heart, Brain } from 'lucide-react';

interface TableauRangAFooterIC2Props {
  colonnesCount?: number;
  lignesCount?: number;
  isRangB?: boolean;
}

export const TableauRangAFooterIC2 = ({ colonnesCount = 0, lignesCount = 0, isRangB = false }: TableauRangAFooterIC2Props) => {
  const expectedCount = isRangB ? 2 : 9; // EXACTEMENT 9 pour Rang A
  const rangLabel = isRangB ? "B" : "A";
  const totalExpected = isRangB ? "2 connaissances approfondies" : "9 connaissances fondamentales";
  const isComplete = lignesCount === expectedCount;
  
  return (
    <div className="space-y-6">
      {/* Validation conformité E-LiSA officielle */}
      <div className={`bg-gradient-to-r p-6 rounded-lg border-2 ${
        isComplete 
          ? 'from-green-50 to-emerald-50 border-green-300' 
          : 'from-orange-50 to-red-50 border-orange-300'
      }`}>
        <div className="flex items-center justify-center space-x-3 mb-4">
          {isComplete ? (
            <CheckCircle className="h-6 w-6 text-green-600" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          )}
          <h4 className={`text-xl font-bold ${
            isComplete ? 'text-green-800' : 'text-orange-800'
          }`}>
            IC-2 Rang {rangLabel} - Audit E-LiSA : {isComplete ? 'CONFORME' : 'NON-CONFORME'}
          </h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
          <div className="text-center">
            <div className="font-semibold text-blue-700">Connaissances E-LiSA</div>
            <div className={`text-3xl font-bold ${isComplete ? 'text-green-800' : 'text-red-800'}`}>
              {lignesCount}/{expectedCount}
            </div>
            <div className="text-xs text-gray-600 mt-1">Attendues selon fiche officielle</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-indigo-700">Dimensions analysées</div>
            <div className="text-3xl font-bold text-indigo-800">{colonnesCount}</div>
            <div className="text-xs text-gray-600 mt-1">Colonnes pédagogiques</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-purple-700">Conformité</div>
            <div className={`text-3xl font-bold ${isComplete ? 'text-green-800' : 'text-red-800'}`}>
              {Math.round((lignesCount / expectedCount) * 100)}%
            </div>
            <div className="text-xs text-gray-600 mt-1">Taux de conformité E-LiSA</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-teal-700">Statut</div>
            <div className={`text-2xl font-bold ${isComplete ? 'text-green-800' : 'text-red-800'}`}>
              {isComplete ? '✅' : '❌'}
            </div>
            <div className="text-xs text-gray-600 mt-1">Validation officielle</div>
          </div>
        </div>
      </div>

      {/* Détail des connaissances attendues selon E-LiSA */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h4 className="text-lg font-bold text-blue-800">
            Connaissances IC-2 Rang {rangLabel} selon E-LiSA officielle
          </h4>
        </div>
        
        {!isRangB ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center space-x-2 text-blue-700">
              <Users className="h-4 w-4" />
              <span>1. Identifier professionnels et compétences</span>
            </div>
            <div className="flex items-center space-x-2 text-green-700">
              <Target className="h-4 w-4" />
              <span>2. Définition pratique médicale</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-700">
              <Heart className="h-4 w-4" />
              <span>3. Signification de l'éthique</span>
            </div>
            <div className="flex items-center space-x-2 text-orange-700">
              <Scale className="h-4 w-4" />
              <span>4. Normes et valeurs professionnelles</span>
            </div>
            <div className="flex items-center space-x-2 text-teal-700">
              <Shield className="h-4 w-4" />
              <span>5. Organisation et régulation</span>
            </div>
            <div className="flex items-center space-x-2 text-indigo-700">
              <Award className="h-4 w-4" />
              <span>6. Médecine fondée sur preuves</span>
            </div>
            <div className="flex items-center space-x-2 text-red-700">
              <CheckCircle className="h-4 w-4" />
              <span>7. Déontologie médicale</span>
            </div>
            <div className="flex items-center space-x-2 text-green-700">
              <Heart className="h-4 w-4" />
              <span>8. Responsabilité et expérience patient</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-700">
              <Brain className="h-4 w-4" />
              <span>9. Acteurs santé et interactions</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-green-700">
              <Award className="h-4 w-4" />
              <span>1. Organisation exercice et statuts professionnels</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-700">
              <Shield className="h-4 w-4" />
              <span>2. Rôle des ordres professionnels</span>
            </div>
          </div>
        )}
      </div>

      {/* Message de conformité finale */}
      <div className={`text-center p-6 rounded-lg border-2 ${
        isComplete 
          ? 'bg-green-50 border-green-300' 
          : 'bg-red-50 border-red-300'
      }`}>
        <div className="flex items-center justify-center space-x-2 mb-3">
          {isComplete ? (
            <CheckCircle className="h-8 w-8 text-green-600" />
          ) : (
            <AlertTriangle className="h-8 w-8 text-red-600" />
          )}
          <p className={`text-xl font-bold ${
            isComplete ? 'text-green-700' : 'text-red-700'
          }`}>
            {isComplete 
              ? `✅ IC-2 Rang ${rangLabel} : PARFAITEMENT CONFORME E-LiSA`
              : `❌ IC-2 Rang ${rangLabel} : NÉCESSITE CORRECTION E-LiSA`
            }
          </p>
        </div>
        
        <p className={`text-sm font-medium ${
          isComplete ? 'text-green-600' : 'text-red-600'
        }`}>
          {isComplete 
            ? `${totalExpected} parfaitement intégrées selon fiche officielle E-LiSA`
            : `Seulement ${lignesCount}/${expectedCount} connaissances - Compléter selon E-LiSA`
          }
        </p>
        
        <p className={`text-xs italic mt-2 ${
          isComplete ? 'text-green-500' : 'text-red-500'
        }`}>
          {isComplete 
            ? '🎯 Optimisation parfaite - Prêt pour apprentissage E-LiSA'
            : '📝 Révision nécessaire pour conformité E-LiSA officielle'
          }
        </p>
      </div>
    </div>
  );
};
