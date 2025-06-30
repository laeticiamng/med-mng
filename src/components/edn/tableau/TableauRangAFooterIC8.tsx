
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Target, AlertTriangle, Lightbulb } from 'lucide-react';

interface TableauRangAFooterIC8Props {
  colonnesCount: number;
  lignesCount: number;
  isRangB?: boolean;
}

export const TableauRangAFooterIC8: React.FC<TableauRangAFooterIC8Props> = ({
  colonnesCount,
  lignesCount,
  isRangB = false
}) => {
  const gradientClass = isRangB 
    ? "bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200"
    : "bg-gradient-to-r from-red-50 to-orange-50 border border-red-200";
  
  const titleColor = isRangB ? "text-indigo-800" : "text-red-800";
  const textColor = isRangB ? "text-indigo-700" : "text-red-700";

  return (
    <div className="mt-8 space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center justify-center mb-2">
            <Target className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-700">{isRangB ? '12' : '8'}</div>
          <div className="text-sm text-red-600">Éléments {isRangB ? 'expertise' : 'certificat'}</div>
        </div>
        
        <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-700">5</div>
          <div className="text-sm text-orange-600">Barèmes ITT</div>
        </div>
        
        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-700">0</div>
          <div className="text-sm text-yellow-600">Interprétation permise</div>
        </div>
        
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center mb-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700">48h</div>
          <div className="text-sm text-blue-600">Délai optimal</div>
        </div>
      </div>

      {/* Points clés */}
      <div className={`p-6 rounded-xl ${gradientClass}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${titleColor}`}>
          <Target className="h-5 w-5" />
          Points clés IC-8 - Certificats médicaux violences {isRangB ? '(Expert)' : ''}
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className={`font-medium mb-3 ${textColor}`}>
              🎯 {isRangB ? 'Expertise avancée' : 'Fondamentaux à retenir'}
            </h4>
            <ul className={`space-y-2 text-sm ${textColor}`}>
              {isRangB ? (
                <>
                  <li>• <strong>Expertise judiciaire :</strong> Mission magistrat spécialisée</li>
                  <li>• <strong>Rapport technique :</strong> Analyse médicale approfondie</li>
                  <li>• <strong>Limites rôle :</strong> Médical strict, pas culpabilité</li>
                  <li>• <strong>Procédure pénale :</strong> Cadre légal précis</li>
                  <li>• <strong>Déontologie :</strong> Neutralité et objectivité</li>
                </>
              ) : (
                <>
                  <li>• <strong>Certificat initial :</strong> Description objective lésions</li>
                  <li>• <strong>ITT :</strong> Incapacité activités habituelles</li>
                  <li>• <strong>Descriptif pur :</strong> Pas d'interprétation cause</li>
                  <li>• <strong>Documentation :</strong> Examen systématique</li>
                  <li>• <strong>Délai :</strong> Rédaction dans les 48h</li>
                </>
              )}
            </ul>
          </div>
          
          <div>
            <h4 className={`font-medium mb-3 ${textColor}`}>⚠️ Pièges à éviter</h4>
            <ul className={`space-y-2 text-sm ${textColor}`}>
              {isRangB ? (
                <>
                  <li>• Dépasser le rôle médical strict</li>
                  <li>• Déterminer la culpabilité</li>
                  <li>• Biais personnel dans l'expertise</li>
                  <li>• Confusion procédures civile/pénale</li>
                  <li>• Rapport non circonstancié</li>
                </>
              ) : (
                <>
                  <li>• Interpréter les lésions observées</li>
                  <li>• Confondre ITT et arrêt travail</li>
                  <li>• Mentionner cause supposée</li>
                  <li>• Examen incomplet ou bâclé</li>
                  <li>• Certificat de complaisance</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Badges de compétences */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-300">
          Certificat médical
        </Badge>
        <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300">
          ITT évaluation
        </Badge>
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
          Médecine légale
        </Badge>
        <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-300">
          Violences
        </Badge>
        {isRangB && (
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-300">
            Expertise judiciaire
          </Badge>
        )}
      </div>

      {/* Note de progression */}
      <div className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        📊 Tableau IC-8 : {lignesCount} concepts {isRangB ? 'experts' : 'fondamentaux'} sur {colonnesCount} dimensions d'analyse
        <br />
        🎯 {isRangB 
          ? 'Expertise pour missions judiciaires médico-légales'
          : 'Bases solides pour certificats dans contexte violences'
        }
      </div>
    </div>
  );
};
