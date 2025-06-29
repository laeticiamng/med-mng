
import { CheckCircle, Target, BookOpen, Award, Shield, AlertTriangle } from 'lucide-react';

interface TableauRangAFooterIC4Props {
  colonnesCount?: number;
  lignesCount?: number;
  isRangB?: boolean;
}

export const TableauRangAFooterIC4 = ({ colonnesCount = 0, lignesCount = 0, isRangB = false }: TableauRangAFooterIC4Props) => {
  const expectedCount = isRangB ? 22 : 13;
  const rangLabel = isRangB ? "B" : "A";
  const totalExpected = isRangB ? "22 connaissances expertes" : "13 connaissances fondamentales";
  const isComplete = lignesCount === expectedCount;
  
  return (
    <div className="space-y-6">
      {/* Validation conformité LiSA officielle */}
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
            IC-4 Rang {rangLabel} - Audit LiSA : {isComplete ? 'CONFORME PARFAIT' : 'NON-CONFORME'}
          </h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
          <div className="text-center">
            <div className="font-semibold text-blue-700">Connaissances LiSA</div>
            <div className={`text-3xl font-bold ${isComplete ? 'text-green-800' : 'text-red-800'}`}>
              {lignesCount}/{expectedCount}
            </div>
            <div className="text-xs text-gray-600 mt-1">Attendues selon LiSA officiel</div>
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
            <div className="text-xs text-gray-600 mt-1">Taux conformité LiSA</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-teal-700">Statut</div>
            <div className={`text-2xl font-bold ${isComplete ? 'text-green-800' : 'text-red-800'}`}>
              {isComplete ? '✅' : '❌'}
            </div>
            <div className="text-xs text-gray-600 mt-1">Validation LiSA</div>
          </div>
        </div>
      </div>

      {/* Détail des connaissances attendues selon LiSA */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h4 className="text-lg font-bold text-blue-800">
            Connaissances IC-4 Rang {rangLabel} selon LiSA officiel
          </h4>
        </div>
        
        {!isRangB ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-blue-700">
                <Shield className="h-4 w-4" />
                <span>1. Définir la Qualité</span>
              </div>
              <div className="flex items-center space-x-2 text-green-700">
                <Target className="h-4 w-4" />
                <span>2. Définir la Sécurité</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-700">
                <AlertTriangle className="h-4 w-4" />
                <span>3. Définir EIAS et gravité</span>
              </div>
              <div className="flex items-center space-x-2 text-orange-700">
                <Award className="h-4 w-4" />
                <span>4. Définition antisepsie</span>
              </div>
              <div className="flex items-center space-x-2 text-teal-700">
                <CheckCircle className="h-4 w-4" />
                <span>5. Modalités antisepsie</span>
              </div>
              <div className="flex items-center space-x-2 text-indigo-700">
                <Shield className="h-4 w-4" />
                <span>6. Définition et règles asepsie</span>
              </div>
              <div className="flex items-center space-x-2 text-red-700">
                <Target className="h-4 w-4" />
                <span>7. Définition et règles détersion</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-green-700">
                <Award className="h-4 w-4" />
                <span>8. Définition et règles désinfection</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-700">
                <CheckCircle className="h-4 w-4" />
                <span>9. Règles utilisation antiseptiques</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-700">
                <Shield className="h-4 w-4" />
                <span>10. Hygiène mains et SHA</span>
              </div>
              <div className="flex items-center space-x-2 text-orange-700">
                <Target className="h-4 w-4" />
                <span>11. Définition IAS</span>
              </div>
              <div className="flex items-center space-x-2 text-teal-700">
                <Award className="h-4 w-4" />
                <span>12. Ministère Affaires Sociales</span>
              </div>
              <div className="flex items-center space-x-2 text-indigo-700">
                <CheckCircle className="h-4 w-4" />
                <span>13. HAS missions qualité sécurité</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-green-700">
                <Award className="h-4 w-4" />
                <span>1. Impact économique EIAS</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-700">
                <Shield className="h-4 w-4" />
                <span>2. Mécanismes transmissibilité BMR</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-700">
                <Target className="h-4 w-4" />
                <span>3. Résistances transférables</span>
              </div>
              <div className="flex items-center space-x-2 text-orange-700">
                <CheckCircle className="h-4 w-4" />
                <span>4. Structures EIAS France</span>
              </div>
              <div className="flex items-center space-x-2 text-teal-700">
                <Award className="h-4 w-4" />
                <span>5. 3 grandes causes risques</span>
              </div>
              <div className="flex items-center space-x-2 text-indigo-700">
                <Shield className="h-4 w-4" />
                <span>6. Principe évaluation</span>
              </div>
              <div className="flex items-center space-x-2 text-red-700">
                <Target className="h-4 w-4" />
                <span>7. Principe précaution</span>
              </div>
              <div className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span>8. Principe indépendance</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-blue-700">
                <Award className="h-4 w-4" />
                <span>9. Principe transparence</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-700">
                <Shield className="h-4 w-4" />
                <span>10. Prévention a priori</span>
              </div>
              <div className="flex items-center space-x-2 text-orange-700">
                <Target className="h-4 w-4" />
                <span>11. Prévention a posteriori</span>
              </div>
              <div className="flex items-center space-x-2 text-teal-700">
                <CheckCircle className="h-4 w-4" />
                <span>12. Roue de Deming</span>
              </div>
              <div className="flex items-center space-x-2 text-indigo-700">
                <Award className="h-4 w-4" />
                <span>13. Culture sécurité</span>
              </div>
              <div className="flex items-center space-x-2 text-red-700">
                <Shield className="h-4 w-4" />
                <span>14. Certification établissements</span>
              </div>
              <div className="flex items-center space-x-2 text-green-700">
                <Target className="h-4 w-4" />
                <span>15. IQSS programmes nationaux</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-blue-700">
                <CheckCircle className="h-4 w-4" />
                <span>16. EPP méthodes</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-700">
                <Award className="h-4 w-4" />
                <span>17. Groupes pairs</span>
              </div>
              <div className="flex items-center space-x-2 text-orange-700">
                <Shield className="h-4 w-4" />
                <span>18. DPC</span>
              </div>
              <div className="flex items-center space-x-2 text-teal-700">
                <Target className="h-4 w-4" />
                <span>19. Microorganismes IAS</span>
              </div>
              <div className="flex items-center space-x-2 text-indigo-700">
                <CheckCircle className="h-4 w-4" />
                <span>20. Prévalence IAS</span>
              </div>
              <div className="flex items-center space-x-2 text-red-700">
                <Award className="h-4 w-4" />
                <span>21. Répartition microorganismes</span>
              </div>
              <div className="flex items-center space-x-2 text-green-700">
                <Shield className="h-4 w-4" />
                <span>22. Critères diagnostiques</span>
              </div>
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
              ? `✅ IC-4 Rang ${rangLabel} : CONFORMITÉ PARFAITE LiSA`
              : `❌ IC-4 Rang ${rangLabel} : RÉVISION NÉCESSAIRE LiSA`
            }
          </p>
        </div>
        
        <p className={`text-sm font-medium ${
          isComplete ? 'text-green-600' : 'text-red-600'
        }`}>
          {isComplete 
            ? `${totalExpected} parfaitement intégrées selon structure LiSA officielle`
            : `Seulement ${lignesCount}/${expectedCount} connaissances - Compléter selon LiSA`
          }
        </p>
        
        <p className={`text-xs italic mt-2 ${
          isComplete ? 'text-green-500' : 'text-red-500'
        }`}>
          {isComplete 
            ? '🏆 Excellence LiSA - Référence pour autres items IC'
            : '📝 Révision obligatoire pour conformité LiSA officielle'
          }
        </p>
      </div>
    </div>
  );
};
