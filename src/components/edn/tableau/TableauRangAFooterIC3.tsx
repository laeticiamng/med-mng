
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, TrendingUp, AlertTriangle } from 'lucide-react';

interface TableauRangAFooterIC3Props {
  colonnesCount: number;
  lignesCount: number;
  isRangB?: boolean;
}

export const TableauRangAFooterIC3 = ({ colonnesCount, lignesCount, isRangB = false }: TableauRangAFooterIC3Props) => {
  const expectedCount = isRangB ? 11 : 12;
  const completionRate = Math.round((lignesCount / expectedCount) * 100);
  
  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Synthèse IC-3 - {isRangB ? 'Rang B' : 'Rang A'}
          </h3>
        </div>
        <Badge variant="outline" className="text-blue-700 border-blue-300">
          {lignesCount}/{expectedCount} concepts E-LiSA
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
          <div className="text-2xl font-bold text-blue-600">{completionRate}%</div>
          <div className="text-sm text-gray-600">Conformité E-LiSA</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
          <div className="text-2xl font-bold text-indigo-600">{colonnesCount}</div>
          <div className="text-sm text-gray-600">Dimensions d'analyse</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
          <div className="text-2xl font-bold text-purple-600">{lignesCount}</div>
          <div className="text-sm text-gray-600">Concepts maîtrisés</div>
        </div>
      </div>

      {completionRate < 100 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="font-medium text-yellow-800">Attention</span>
          </div>
          <p className="text-sm text-yellow-700">
            {expectedCount - lignesCount} concepts E-LiSA manquants pour une conformité complète du {isRangB ? 'Rang B' : 'Rang A'}.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-blue-700 mb-2 flex items-center">
            <BookOpen className="h-4 w-4 mr-1" />
            {isRangB ? 'Expertise avancée' : 'Fondamentaux essentiels'}
          </h4>
          <ul className="text-sm text-gray-700 space-y-1">
            {isRangB ? (
              <>
                <li>• Supports au raisonnement clinique</li>
                <li>• Bases d'information médicale</li>
                <li>• Évaluation des pratiques</li>
                <li>• Analyse décisionnelle avancée</li>
              </>
            ) : (
              <>
                <li>• Médecine basée sur les preuves</li>
                <li>• Lecture critique d'articles</li>
                <li>• Biostatistiques médicales</li>
                <li>• Outils d'aide à la décision</li>
              </>
            )}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-indigo-700 mb-2 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            Objectifs pédagogiques
          </h4>
          <ul className="text-sm text-gray-700 space-y-1">
            {isRangB ? (
              <>
                <li>• Maîtriser les outils de raisonnement</li>
                <li>• Évaluer sa pratique professionnelle</li>
                <li>• Analyser les enjeux de santé publique</li>
                <li>• Développer l'esprit critique</li>
              </>
            ) : (
              <>
                <li>• Comprendre les principes de l'EBM</li>
                <li>• Savoir lire un article médical</li>
                <li>• Utiliser les outils d'aide à la décision</li>
                <li>• Intégrer incertitude et probabilités</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </Card>
  );
};
