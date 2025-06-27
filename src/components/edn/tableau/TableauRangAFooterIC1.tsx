
import { CheckCircle, Heart, Users, MessageCircle, Shield, Brain, Target, AlertTriangle } from 'lucide-react';

interface TableauRangAFooterIC1Props {
  colonnesCount?: number;
  lignesCount?: number;
}

export const TableauRangAFooterIC1 = ({ colonnesCount = 0, lignesCount = 0 }: TableauRangAFooterIC1Props) => {
  const expectedCount = 15;
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
            IC-1 Rang A - Audit E-LiSA : {isComplete ? 'CONFORME' : 'NON-CONFORME'}
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

      {/* Détail des 15 connaissances attendues selon E-LiSA */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Heart className="h-5 w-5 text-blue-600" />
          <h4 className="text-lg font-bold text-blue-800">
            15 Connaissances IC-1 selon E-LiSA officielle
          </h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center space-x-1 text-blue-700">
            <Target className="h-3 w-3" />
            <span>1. Définition relation médecin-malade</span>
          </div>
          <div className="flex items-center space-x-1 text-green-700">
            <Users className="h-3 w-3" />
            <span>2. Déterminants de la relation</span>
          </div>
          <div className="flex items-center space-x-1 text-purple-700">
            <Brain className="h-3 w-3" />
            <span>3. Corrélats cliniques</span>
          </div>
          <div className="flex items-center space-x-1 text-orange-700">
            <Heart className="h-3 w-3" />
            <span>4. Approche centrée patient</span>
          </div>
          <div className="flex items-center space-x-1 text-teal-700">
            <MessageCircle className="h-3 w-3" />
            <span>5. Représentations maladie</span>
          </div>
          <div className="flex items-center space-x-1 text-indigo-700">
            <Shield className="h-3 w-3" />
            <span>6. Facteurs information patient</span>
          </div>
          <div className="flex items-center space-x-1 text-red-700">
            <Target className="h-3 w-3" />
            <span>7. Ajustement au stress</span>
          </div>
          <div className="flex items-center space-x-1 text-pink-700">
            <Brain className="h-3 w-3" />
            <span>8. Mécanismes de défense</span>
          </div>
          <div className="flex items-center space-x-1 text-cyan-700">
            <Heart className="h-3 w-3" />
            <span>9. Empathie clinique</span>
          </div>
          <div className="flex items-center space-x-1 text-lime-700">
            <Users className="h-3 w-3" />
            <span>10. Alliance thérapeutique</span>
          </div>
          <div className="flex items-center space-x-1 text-amber-700">
            <MessageCircle className="h-3 w-3" />
            <span>11. Processus changement</span>
          </div>
          <div className="flex items-center space-x-1 text-violet-700">
            <Shield className="h-3 w-3" />
            <span>12. Entretien motivationnel</span>
          </div>
          <div className="flex items-center space-x-1 text-rose-700">
            <Heart className="h-3 w-3" />
            <span>13. Se montrer empathique</span>
          </div>
          <div className="flex items-center space-x-1 text-sky-700">
            <MessageCircle className="h-3 w-3" />
            <span>14. Communication adaptée</span>
          </div>
          <div className="flex items-center space-x-1 text-emerald-700">
            <AlertTriangle className="h-3 w-3" />
            <span>15. Annonce mauvaise nouvelle</span>
          </div>
        </div>
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
              ? '✅ IC-1 : PARFAITEMENT CONFORME E-LiSA'
              : '❌ IC-1 : NÉCESSITE CORRECTION E-LiSA'
            }
          </p>
        </div>
        
        <p className={`text-sm font-medium ${
          isComplete ? 'text-green-600' : 'text-red-600'
        }`}>
          {isComplete 
            ? '15 connaissances fondamentales parfaitement intégrées selon fiche officielle E-LiSA'
            : `Seulement ${lignesCount}/15 connaissances - Compléter selon E-LiSA`
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
