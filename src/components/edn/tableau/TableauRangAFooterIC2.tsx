
import { CheckCircle, Target, BookOpen, Award, Scale, Users, Shield } from 'lucide-react';

interface TableauRangAFooterIC2Props {
  colonnesCount?: number;
  lignesCount?: number;
  isRangB?: boolean;
}

export const TableauRangAFooterIC2 = ({ colonnesCount = 0, lignesCount = 0, isRangB = false }: TableauRangAFooterIC2Props) => {
  const expectedCount = isRangB ? 2 : 7;
  const rangLabel = isRangB ? "B" : "A";
  const totalExpected = isRangB ? "2 connaissances spécialisées" : "7 connaissances fondamentales";
  
  return (
    <div className="space-y-4">
      {/* Validation des connaissances attendues */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <Scale className="h-5 w-5 text-blue-600" />
          <h4 className="text-lg font-bold text-blue-800">
            IC-2 Rang {rangLabel} : {totalExpected}
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-blue-700">Connaissances traitées</div>
            <div className={`text-2xl font-bold ${lignesCount === expectedCount ? 'text-green-800' : 'text-orange-800'}`}>
              {lignesCount}/{expectedCount}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-indigo-700">Dimensions analysées</div>
            <div className="text-2xl font-bold text-indigo-800">{colonnesCount}</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-700">Conformité E-LiSA</div>
            <div className={`text-2xl font-bold ${lignesCount === expectedCount ? 'text-green-800' : 'text-orange-800'}`}>
              {lignesCount === expectedCount ? '✓' : '⚠️'}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-purple-700">Optimisation</div>
            <div className="text-2xl font-bold text-purple-800">100%</div>
          </div>
        </div>
      </div>

      {/* Section spéciale valeurs professionnelles */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <Shield className="h-5 w-5 text-green-600" />
          <h4 className="text-lg font-bold text-green-800">
            Valeurs professionnelles {isRangB ? "approfondies" : "fondamentales"}
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {!isRangB ? (
            <>
              <div className="flex items-center space-x-2 text-green-700">
                <Users className="h-4 w-4" />
                <span>Professionnels et acteurs</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-700">
                <Target className="h-4 w-4" />
                <span>Pratique médicale définie</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-700">
                <Scale className="h-4 w-4" />
                <span>Éthique intégrée</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2 text-green-700">
                <Award className="h-4 w-4" />
                <span>Organisation professionnelle</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-700">
                <Shield className="h-4 w-4" />
                <span>Ordres professionnels</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-700">
                <Target className="h-4 w-4" />
                <span>Régulation avancée</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Statut de conformité */}
      <div className={`text-center p-6 rounded-lg border ${
        lignesCount === expectedCount 
          ? 'bg-green-50 border-green-200' 
          : 'bg-orange-50 border-orange-200'
      }`}>
        <div className="flex items-center justify-center space-x-2 mb-2">
          <CheckCircle className={`h-6 w-6 ${
            lignesCount === expectedCount ? 'text-green-600' : 'text-orange-600'
          }`} />
          <p className={`text-lg font-bold ${
            lignesCount === expectedCount ? 'text-green-700' : 'text-orange-700'
          }`}>
            IC-2 Rang {rangLabel} : {lignesCount === expectedCount ? 'CONFORME' : 'À AJUSTER'}
          </p>
        </div>
        <div className="flex items-center justify-center space-x-2 mb-2">
          <BookOpen className={`h-5 w-5 ${
            lignesCount === expectedCount ? 'text-green-600' : 'text-orange-600'
          }`} />
          <p className={`text-sm font-medium ${
            lignesCount === expectedCount ? 'text-green-600' : 'text-orange-600'
          }`}>
            {lignesCount === expectedCount 
              ? `✅ ${expectedCount} connaissances attendues parfaitement traitées`
              : `⚠️ ${expectedCount} connaissances attendues - ${lignesCount} traitées`
            }
          </p>
        </div>
        <p className={`text-xs italic ${
          lignesCount === expectedCount ? 'text-green-500' : 'text-orange-500'
        }`}>
          {lignesCount === expectedCount 
            ? '✅ Parfaitement optimisé selon les exigences E-LiSA'
            : '📝 Ajustement nécessaire pour conformité complète'
          }
        </p>
      </div>
    </div>
  );
};
