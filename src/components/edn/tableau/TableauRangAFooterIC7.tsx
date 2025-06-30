
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Target, AlertTriangle, Lightbulb } from 'lucide-react';

interface TableauRangAFooterIC7Props {
  colonnesCount: number;
  lignesCount: number;
  isRangB?: boolean;
}

export const TableauRangAFooterIC7: React.FC<TableauRangAFooterIC7Props> = ({
  colonnesCount,
  lignesCount,
  isRangB = false
}) => {
  const gradientClass = isRangB 
    ? "bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200"
    : "bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200";
  
  const titleColor = isRangB ? "text-purple-800" : "text-rose-800";
  const textColor = isRangB ? "text-purple-700" : "text-rose-700";

  return (
    <div className="mt-8 space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-rose-50 rounded-lg border border-rose-200">
          <div className="flex items-center justify-center mb-2">
            <Target className="h-5 w-5 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700">{isRangB ? '25' : '18'}</div>
          <div className="text-sm text-rose-600">Critères {isRangB ? 'intersectionnels' : 'discriminants'}</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-700">2</div>
          <div className="text-sm text-green-600">Types discrimination</div>
        </div>
        
        <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-700">0</div>
          <div className="text-sm text-orange-600">Tolérance acceptée</div>
        </div>
        
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center mb-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700">100%</div>
          <div className="text-sm text-blue-600">Égalité visée</div>
        </div>
      </div>

      {/* Points clés */}
      <div className={`p-6 rounded-xl ${gradientClass}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${titleColor}`}>
          <Target className="h-5 w-5" />
          Points clés IC-7 - Les discriminations {isRangB ? '(Expert)' : ''}
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className={`font-medium mb-3 ${textColor}`}>
              🎯 {isRangB ? 'Expertise avancée' : 'Fondamentaux à retenir'}
            </h4>
            <ul className={`space-y-2 text-sm ${textColor}`}>
              {isRangB ? (
                <>
                  <li>• <strong>Intersectionnalité :</strong> Cumul discriminations multiples</li>
                  <li>• <strong>Vulnérabilités :</strong> Évaluation globale patient</li>
                  <li>• <strong>Systémique :</strong> Analyse des structures</li>
                  <li>• <strong>Prévention :</strong> Politiques institutionnelles</li>
                  <li>• <strong>Formation :</strong> Sensibilisation continue équipes</li>
                </>
              ) : (
                <>
                  <li>• <strong>Directe :</strong> Traitement défavorable intentionnel</li>
                  <li>• <strong>Indirecte :</strong> Pratique neutre, effet discriminant</li>
                  <li>• <strong>Biais :</strong> Conscients et inconscients</li>
                  <li>• <strong>Égalité :</strong> Même qualité soins pour tous</li>
                  <li>• <strong>Adaptation :</strong> Services aux diversités</li>
                </>
              )}
            </ul>
          </div>
          
          <div>
            <h4 className={`font-medium mb-3 ${textColor}`}>⚠️ Pièges à éviter</h4>
            <ul className={`space-y-2 text-sm ${textColor}`}>
              {isRangB ? (
                <>
                  <li>• Traitement isolé vs approche intersectionnelle</li>
                  <li>• Hiérarchisation des discriminations</li>
                  <li>• Solutions individuelles vs changement systémique</li>
                  <li>• Formation ponctuelle vs culture continue</li>
                  <li>• Déni des discriminations indirectes</li>
                </>
              ) : (
                <>
                  <li>• Minimiser l'impact des discriminations</li>
                  <li>• Ignorer les biais inconscients</li>
                  <li>• Pratiques discriminantes non identifiées</li>
                  <li>• Absence d'adaptation culturelle</li>
                  <li>• Confusion égalité/équité</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Badges de compétences */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Badge variant="secondary" className="bg-rose-100 text-rose-700 border-rose-300">
          Non-discrimination
        </Badge>
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
          Égalité soins
        </Badge>
        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
          Diversité culturelle
        </Badge>
        <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300">
          Lutte préjugés
        </Badge>
        {isRangB && (
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-300">
            Approche intersectionnelle
          </Badge>
        )}
      </div>

      {/* Note de progression */}
      <div className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        📊 Tableau IC-7 : {lignesCount} concepts {isRangB ? 'experts' : 'fondamentaux'} sur {colonnesCount} dimensions d'analyse
        <br />
        🎯 {isRangB 
          ? 'Expertise pour transformation institutionnelle anti-discriminatoire'
          : 'Fondamentaux pour soins équitables et respectueux'
        }
      </div>
    </div>
  );
};
