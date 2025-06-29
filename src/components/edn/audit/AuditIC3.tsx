
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info, Target, BookOpen, TrendingUp } from 'lucide-react';

export const AuditIC3 = () => {
  const auditResults = {
    conformiteELisa: {
      status: 'ameliorer',
      score: 75,
      details: [
        'Rang A: 14/16 concepts LiSA conformes (87% couverture)',
        'Rang B: 4/6 concepts experts selon LiSA',
        'EBM et niveaux de preuve intégrés',
        'Décision médicale et TICE partielles'
      ]
    },
    completude: {
      status: 'ameliorer',
      score: 70,
      details: [
        'Médecine basée preuves: définition et niveaux',
        'Raisonnement clinique et styles décision',
        'Décision partagée vs paternaliste',
        'TICE et aide décision clinique manquantes'
      ]
    },
    pedagogie: {
      status: 'ameliorer',
      score: 78,
      details: [
        'Exercices analyse critique',
        'Cas études méthodologiques',
        'Ateliers lecture critique',
        'Simulations décision médicale'
      ]
    },
    actualite: {
      status: 'ameliorer',
      score: 72,
      details: [
        'IA et aide à la décision',
        'Big data et médecine prédictive',
        'Open science et données ouvertes',
        'Systèmes experts médicaux'
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
          <Target className="h-6 w-6 text-yellow-600" />
          <h2 className="text-2xl font-bold text-gray-800">Audit IC-3 : Raisonnement et décision en médecine (EBM)</h2>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{scoreGlobal}%</div>
            <div className="text-sm text-gray-600">Score global</div>
          </div>
          <Badge className="bg-yellow-100 text-yellow-800 text-lg px-4 py-2">
            ⚠️ 16 Rang A + 6 Rang B LiSA
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
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{detail}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-800">Plan amélioration IC-3 selon LiSA</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-red-700 mb-2">🚨 Concepts Rang A manquants (2/16)</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• TICE et aide décision clinique</li>
              <li>• Controverse en santé</li>
            </ul>
            <h4 className="font-medium text-orange-700 mt-4 mb-2">📋 Concepts Rang B manquants (2/6)</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Systèmes d'aide à la décision</li>
              <li>• Architectures systèmes information</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-green-700 mb-2">✅ Concepts LiSA acquis</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• EBM et niveaux de preuve</li>
              <li>• Styles de raisonnement</li>
              <li>• Décision partagée/paternaliste</li>
              <li>• Recommandations médicales</li>
              <li>• Efficacité/effectivité/efficience</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
