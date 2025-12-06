
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Target, TrendingUp, AlertTriangle } from 'lucide-react';

interface TableauRangAFooterIC5Props {
  colonnesCount: number;
  lignesCount: number;
  isRangB?: boolean;
}

export const TableauRangAFooterIC5 = ({ colonnesCount, lignesCount, isRangB = false }: TableauRangAFooterIC5Props) => {
  const expectedCount = isRangB ? 10 : 20;
  const completionRate = Math.round((lignesCount / expectedCount) * 100);
  
  return (
    <Card className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Synthèse IC-5 - {isRangB ? 'Rang B' : 'Rang A'}
          </h3>
        </div>
        <Badge variant="outline" className="text-emerald-700 border-emerald-300">
          {lignesCount}/{expectedCount} concepts E-LiSA
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-white rounded-lg border border-emerald-100">
          <div className="text-2xl font-bold text-emerald-600">{completionRate}%</div>
          <div className="text-sm text-gray-600">Conformité E-LiSA</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-emerald-100">
          <div className="text-2xl font-bold text-teal-600">{colonnesCount}</div>
          <div className="text-sm text-gray-600">Dimensions d'analyse</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-emerald-100">
          <div className="text-2xl font-bold text-cyan-600">{lignesCount}</div>
          <div className="text-sm text-gray-600">Concepts maîtrisés</div>
        </div>
      </div>

      {completionRate < 100 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="font-medium text-orange-800">Attention</span>
          </div>
          <p className="text-sm text-orange-700">
            {expectedCount - lignesCount} concepts E-LiSA manquants pour une conformité complète du {isRangB ? 'Rang B' : 'Rang A'}.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-emerald-700 mb-2 flex items-center">
            <Building2 className="h-4 w-4 mr-1" />
            {isRangB ? 'Enjeux stratégiques' : 'Structure du système'}
          </h4>
          <ul className="text-sm text-gray-700 space-y-1">
            {isRangB ? (
              <>
                <li>• Démographie médicale</li>
                <li>• Innovation en santé</li>
                <li>• Coordination des soins</li>
                <li>• Gouvernance du système</li>
              </>
            ) : (
              <>
                <li>• Organisation générale du système</li>
                <li>• Structures hospitalières</li>
                <li>• Soins primaires et réseaux</li>
                <li>• Financement et tarification</li>
              </>
            )}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-teal-700 mb-2 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            Objectifs pédagogiques
          </h4>
          <ul className="text-sm text-gray-700 space-y-1">
            {isRangB ? (
              <>
                <li>• Analyser les enjeux stratégiques</li>
                <li>• Anticiper les évolutions</li>
                <li>• Développer une vision systémique</li>
                <li>• Participer à la gouvernance</li>
              </>
            ) : (
              <>
                <li>• Comprendre l'organisation du système</li>
                <li>• Maîtriser les circuits de soins</li>
                <li>• Connaître les modes de financement</li>
                <li>• S'orienter dans le système</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </Card>
  );
};
