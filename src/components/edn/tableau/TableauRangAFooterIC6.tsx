
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Target, AlertTriangle, Lightbulb } from 'lucide-react';

interface TableauRangAFooterIC6Props {
  colonnesCount: number;
  lignesCount: number;
  isRangB?: boolean;
}

export const TableauRangAFooterIC6: React.FC<TableauRangAFooterIC6Props> = ({
  colonnesCount,
  lignesCount,
  isRangB = false
}) => {
  const gradientClass = isRangB 
    ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
    : "bg-gradient-to-r from-green-50 to-teal-50 border border-green-200";
  
  const titleColor = isRangB ? "text-blue-800" : "text-green-800";
  const textColor = isRangB ? "text-blue-700" : "text-green-700";

  return (
    <div className="mt-8 space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-center mb-2">
            <Target className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-700">{isRangB ? '8' : '5'}</div>
          <div className="text-sm text-green-600">Étapes {isRangB ? 'avancées' : 'essentielles'}</div>
        </div>
        
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700">4</div>
          <div className="text-sm text-blue-600">Acteurs coordination</div>
        </div>
        
        <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-700">3</div>
          <div className="text-sm text-orange-600">Risques majeurs</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-center mb-2">
            <Lightbulb className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700">24h</div>
          <div className="text-sm text-purple-600">Délai coordination</div>
        </div>
      </div>

      {/* Points clés */}
      <div className={`p-6 rounded-xl ${gradientClass}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${titleColor}`}>
          <Target className="h-5 w-5" />
          Points clés IC-6 - Organisation de l'exercice clinique {isRangB ? '(Expert)' : ''}
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className={`font-medium mb-3 ${textColor}`}>
              🎯 {isRangB ? 'Expertise avancée' : 'Fondamentaux à retenir'}
            </h4>
            <ul className={`space-y-2 text-sm ${textColor}`}>
              {isRangB ? (
                <>
                  <li>• <strong>Gestion risques :</strong> Approche systémique proactive</li>
                  <li>• <strong>Check-lists :</strong> Sécurisation des procédures</li>
                  <li>• <strong>Culture sécurité :</strong> Formation équipe continue</li>
                  <li>• <strong>Événements indésirables :</strong> Déclaration systématique</li>
                  <li>• <strong>Amélioration :</strong> Cycles PDCA intégrés</li>
                </>
              ) : (
                <>
                  <li>• <strong>Coordination :</strong> Communication synchronisée</li>
                  <li>• <strong>Parcours :</strong> Trajectoire organisée patient</li>
                  <li>• <strong>RCP :</strong> Concertation pluridisciplinaire</li>
                  <li>• <strong>Liaison :</strong> Protocoles ville-hôpital</li>
                  <li>• <strong>Personnalisation :</strong> Adaptation au patient</li>
                </>
              )}
            </ul>
          </div>
          
          <div>
            <h4 className={`font-medium mb-3 ${textColor}`}>⚠️ Pièges à éviter</h4>
            <ul className={`space-y-2 text-sm ${textColor}`}>
              {isRangB ? (
                <>
                  <li>• Risques évidents uniquement vs analyse systémique</li>
                  <li>• Réaction vs prévention</li>
                  <li>• Formation ponctuelle vs culture continue</li>
                  <li>• Déclaration punitive vs apprentissage</li>
                  <li>• Amélioration isolée vs approche globale</li>
                </>
              ) : (
                <>
                  <li>• Coordination = transmission d'infos</li>
                  <li>• Parcours = succession consultations</li>
                  <li>• Rupture communication entre pros</li>
                  <li>• Standardisation excessive</li>
                  <li>• Négligence spécificités patient</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Badges de compétences */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
          Coordination soins
        </Badge>
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
          Parcours patient
        </Badge>
        <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300">
          Gestion risques
        </Badge>
        <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-300">
          Sécurisation
        </Badge>
        {isRangB && (
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-300">
            Culture sécurité
          </Badge>
        )}
      </div>

      {/* Note de progression */}
      <div className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        📊 Tableau IC-6 : {lignesCount} concepts {isRangB ? 'experts' : 'fondamentaux'} sur {colonnesCount} dimensions d'analyse
        <br />
        🎯 {isRangB 
          ? 'Maîtrise experte pour leadership organisationnel'
          : 'Base solide pour coordination des soins efficace'
        }
      </div>
    </div>
  );
};
