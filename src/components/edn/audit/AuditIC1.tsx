
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info, Target, BookOpen, TrendingUp } from 'lucide-react';

export const AuditIC1 = () => {
  const auditResults = {
    conformiteELisa: {
      status: 'bon',
      score: 88,
      details: [
        'Rang A: 18/20 concepts conformes (90% couverture)',
        'Rang B: 28/32 concepts experts selon E-LiSA',
        'Référentiels HAS et ordre médecins intégrés',
        'Aspects légaux et déontologiques couverts'
      ]
    },
    completude: {
      status: 'bon',
      score: 85,
      details: [
        'Communication thérapeutique: 6 dimensions',
        'Relation empathique et écoute active',
        'Gestion conflits et situations difficiles',
        'Annonce diagnostic et mauvaises nouvelles'
      ]
    },
    pedagogie: {
      status: 'excellent',
      score: 90,
      details: [
        'Jeux de rôle et mises en situation',
        'Grilles d\'évaluation relationnelle',
        'Cas cliniques authentiques',
        'Témoignages patients intégrés'
      ]
    },
    actualite: {
      status: 'ameliorer',
      score: 82,
      details: [
        'Télémédecine et relation à distance',
        'Intelligence artificielle en consultation',
        'Médecine personnalisée et génomique',
        'Réseaux sociaux et e-réputation médicale'
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
          <Target className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Audit IC-1 : Relation médecin-malade</h2>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{scoreGlobal}%</div>
            <div className="text-sm text-gray-600">Score global</div>
          </div>
          <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
            ✅ Bon niveau E-LiSA
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

      <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Synthèse IC-1</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-700 mb-2">✅ Points forts</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Excellence pédagogique (jeux de rôle)</li>
              <li>• Base relationnelle solide</li>
              <li>• Conformité déontologique</li>
              <li>• Approche empathique développée</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-yellow-700 mb-2">⚠️ À améliorer</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Intégration télémédecine</li>
              <li>• IA et outils numériques</li>
              <li>• Communication digitale</li>
              <li>• Compléter 2 concepts Rang A manquants</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
