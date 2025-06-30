
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Target, AlertTriangle, Lightbulb } from 'lucide-react';

interface TableauRangAFooterIC4Props {
  colonnesCount: number;
  lignesCount: number;
}

export const TableauRangAFooterIC4: React.FC<TableauRangAFooterIC4Props> = ({
  colonnesCount,
  lignesCount
}) => {
  return (
    <div className="mt-8 space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center mb-2">
            <Target className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700">13</div>
          <div className="text-sm text-blue-600">Concepts fondamentaux</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-700">7</div>
          <div className="text-sm text-green-600">Dimensions qualité</div>
        </div>
        
        <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-700">5</div>
          <div className="text-sm text-orange-600">Niveaux gravité EIAS</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-center mb-2">
            <Lightbulb className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700">30</div>
          <div className="text-sm text-purple-600">Secondes SHA</div>
        </div>
      </div>

      {/* Points clés */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
        <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Points clés IC-4 - Qualité et sécurité des soins
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-amber-700 mb-3">🎯 Fondamentaux à retenir</h4>
            <ul className="space-y-2 text-sm text-amber-700">
              <li>• <strong>Qualité :</strong> 7 dimensions (SPEC-AEC)</li>
              <li>• <strong>EIAS :</strong> 40-50% évitables</li>
              <li>• <strong>SHA :</strong> 7 temps, 20-30 secondes</li>
              <li>• <strong>Antisepsie :</strong> tissus vivants</li>
              <li>• <strong>Asepsie :</strong> prévention contamination</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-amber-700 mb-3">⚠️ Pièges à éviter</h4>
            <ul className="space-y-2 text-sm text-amber-700">
              <li>• Confondre qualité et sécurité</li>
              <li>• EIAS ≠ complication attendue</li>
              <li>• Antisepsie ≠ désinfection</li>
              <li>• Gants ne dispensent pas SHA</li>
              <li>• Approche punitive vs culture juste</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Badges de compétences */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
          Démarche qualité
        </Badge>
        <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-300">
          Sécurité des soins
        </Badge>
        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
          Prévention EIAS
        </Badge>
        <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-300">
          Hygiène des mains
        </Badge>
        <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300">
          Antisepsie-Asepsie
        </Badge>
      </div>

      {/* Note de progression */}
      <div className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        📊 Tableau IC-4 : {lignesCount} concepts fondamentaux sur {colonnesCount} dimensions d'analyse
        <br />
        🎯 Passage au Rang B avec 22 concepts experts après maîtrise complète
      </div>
    </div>
  );
};
