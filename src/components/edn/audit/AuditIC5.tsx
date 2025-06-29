
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info, Target, BookOpen, TrendingUp } from 'lucide-react';

export const AuditIC5 = () => {
  const auditResults = {
    conformiteELisa: {
      status: 'insuffisant',
      score: 70,
      details: [
        'Rang A: 12/20 concepts conformes (60% couverture)',
        'Rang B: 18/32 concepts experts selon E-LiSA',
        'Organisation hospitalière partiellement couverte',
        'Système de santé français incomplet'
      ]
    },
    completude: {
      status: 'insuffisant',
      score: 65,
      details: [
        'Parcours de soins: 3/7 étapes définies',
        'Acteurs santé: liste partielle',
        'Financement: bases acquises',
        'Gouvernance: aspects manquants'
      ]
    },
    pedagogie: {
      status: 'ameliorer',
      score: 75,
      details: [
        'Schémas organisationnels',
        'Études de cas sectoriels',
        'Simulation parcours patients',
        'Jeux de gestion simplifiés'
      ]
    },
    actualite: {
      status: 'insuffisant',
      score: 68,
      details: [
        'Transformation numérique santé',
        'Télémédecine et organisation',
        'IA et aide à la décision',
        'Réorganisation post-COVID'
      ]
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-300';
      case 'bon': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ameliorer': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'insuffisant': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'bon': return <Info className="h-5 w-5 text-blue-600" />;
      case 'ameliorer': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'insuffisant': return <AlertTriangle className="h-5 w-5 text-red-600" />;
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
          <Target className="h-6 w-6 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-800">Audit IC-5 : Organisation du système de santé</h2>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{scoreGlobal}%</div>
            <div className="text-sm text-gray-600">Score global</div>
          </div>
          <Badge className="bg-red-100 text-red-800 text-lg px-4 py-2">
            🚨 Incomplet
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(auditResults).map(([key, result]) => (
          <Card key={key} className="p-4 hover:shadow-lg transition-shadow border-l-4 border-red-300">
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
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{detail}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-800">Plan de Rattrapage IC-5 - URGENT</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-red-700 mb-2">🚨 Priorité Absolue</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Compléter 8 concepts Rang A manquants</li>
              <li>• Ajouter 14 concepts Rang B experts</li>
              <li>• Développer parcours de soins complet</li>
              <li>• Intégrer gouvernance et financement</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-orange-700 mb-2">📋 Actions Immédiates</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Cartographie acteurs santé</li>
              <li>• Réforme système post-COVID</li>
              <li>• Transformation numérique</li>
              <li>• Nouvelles organisations de soins</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
