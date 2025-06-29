
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info, Target, BookOpen, TrendingUp } from 'lucide-react';

export const AuditIC2 = () => {
  const auditResults = {
    conformiteELisa: {
      status: 'excellent',
      score: 92,
      details: [
        'Rang A: 7/7 concepts LiSA conformes (100% couverture)',
        'Rang B: 2/2 concepts experts selon LiSA',
        'Déontologie médicale complètement intégrée',
        'Organisation profession médicale France'
      ]
    },
    completude: {
      status: 'bon',
      score: 89,
      details: [
        'Définitions pratique et éthique médicale',
        'Normes et valeurs professionnelles',
        'EBM et responsabilité médicale',
        'Acteurs de santé et interactions'
      ]
    },
    pedagogie: {
      status: 'bon',
      score: 87,
      details: [
        'Études de cas déontologiques',
        'Analyse conflits valeurs/intérêts',
        'Simulation décisions éthiques',
        'Débats interprofessionnels'
      ]
    },
    actualite: {
      status: 'bon',
      score: 88,
      details: [
        'Évolution réglementaire ordres',
        'Nouvelles pratiques professionnelles',
        'Télémédecine et déontologie',
        'Intelligence artificielle et éthique'
      ]
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-300';
      case 'bon': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ameliorer': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'bon': return <Info className="h-5 w-5 text-blue-600" />;
      case 'ameliorer': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const scoreGlobal = Math.round(
    (auditResults.conformiteELisa.score + 
     auditResults.completude.score + 
     auditResults.pedagogie.score + 
     auditResults.actualite.score) / 4
  );

  return (
    <div className="space-y-6 p-4">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Target className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Audit IC-2 : Valeurs professionnelles</h2>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{scoreGlobal}%</div>
            <div className="text-sm text-gray-600">Score global</div>
          </div>
          <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
            ✅ 7 Rang A + 2 Rang B LiSA
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(auditResults).map(([key, result]) => (
          <Card key={key} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getStatusIcon(result.status)}
                <h3 className="font-semibold text-gray-800 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-800">{result.score}%</div>
                <Badge className={`text-xs ${getStatusColor(result.status)}`}>
                  {result.status}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              {result.details.map((detail, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{detail}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">Synthèse IC-2 selon LiSA</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-700 mb-2">✅ Rang A LiSA (7/7 concepts)</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Professionnels et compétences santé</li>
              <li>• Définitions pratique/éthique médicale</li>
              <li>• Normes et valeurs professionnelles</li>
              <li>• Régulation étatique profession</li>
              <li>• EBM et responsabilité</li>
              <li>• Déontologie et conflits</li>
              <li>• Acteurs santé et interactions</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-700 mb-2">🎯 Rang B LiSA (2/2 concepts)</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Organisation exercice professionnels France</li>
              <li>• Rôle des ordres professionnels</li>
            </ul>
            <h4 className="font-medium text-green-700 mt-4 mb-2">📈 Évolutions</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Télémédecine et déontologie</li>
              <li>• IA et nouvelles pratiques</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
