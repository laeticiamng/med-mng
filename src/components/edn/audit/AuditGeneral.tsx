
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info, Target, BookOpen, TrendingUp, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AuditItem {
  itemCode: string;
  title: string;
  conformiteELisa: number;
  completude: number;
  pedagogie: number;
  actualite: number;
  conceptsRangA: number;
  conceptsRangB: number;
  status: 'excellent' | 'bon' | 'ameliorer' | 'incomplet';
}

export const AuditGeneral = () => {
  const auditItems: AuditItem[] = [
    {
      itemCode: 'IC-1',
      title: 'Relation médecin-malade',
      conformiteELisa: 88,
      completude: 85,
      pedagogie: 90,
      actualite: 82,
      conceptsRangA: 18,
      conceptsRangB: 28,
      status: 'bon'
    },
    {
      itemCode: 'IC-2', 
      title: 'Valeurs professionnelles',
      conformiteELisa: 92,
      completude: 89,
      pedagogie: 87,
      actualite: 88,
      conceptsRangA: 19,
      conceptsRangB: 30,
      status: 'excellent'
    },
    {
      itemCode: 'IC-3',
      title: 'Démarche scientifique',
      conformiteELisa: 75,
      completude: 70,
      pedagogie: 78,
      actualite: 72,
      conceptsRangA: 14,
      conceptsRangB: 22,
      status: 'ameliorer'
    },
    {
      itemCode: 'IC-4',
      title: 'Qualité et sécurité des soins',
      conformiteELisa: 95,
      completude: 98,
      pedagogie: 92,
      actualite: 94,
      conceptsRangA: 20,
      conceptsRangB: 32,
      status: 'excellent'
    },
    {
      itemCode: 'IC-5',
      title: 'Organisation du système de santé',
      conformiteELisa: 70,
      completude: 65,
      pedagogie: 75,
      actualite: 68,
      conceptsRangA: 12,
      conceptsRangB: 18,
      status: 'incomplet'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-300';
      case 'bon': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ameliorer': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'incomplet': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'bon': return <Info className="h-5 w-5 text-blue-600" />;
      case 'ameliorer': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'incomplet': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const moyenneGenerale = Math.round(
    auditItems.reduce((sum, item) => sum + ((item.conformiteELisa + item.completude + item.pedagogie + item.actualite) / 4), 0) / auditItems.length
  );

  const totalConcepts = auditItems.reduce((sum, item) => sum + item.conceptsRangA + item.conceptsRangB, 0);

  const graphData = auditItems.map(item => ({
    item: item.itemCode,
    score: Math.round((item.conformiteELisa + item.completude + item.pedagogie + item.actualite) / 4),
    conformite: item.conformiteELisa,
    completude: item.completude,
    pedagogie: item.pedagogie,
    actualite: item.actualite
  }));

  return (
    <div className="space-y-6 p-4">
      {/* En-tête général */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Award className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Audit Général Items IC</h1>
        </div>
        
        <div className="flex items-center justify-center space-x-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{moyenneGenerale}%</div>
            <div className="text-sm text-gray-600">Score Moyen</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{totalConcepts}</div>
            <div className="text-sm text-gray-600">Concepts Total</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">5</div>
            <div className="text-sm text-gray-600">Items Audités</div>
          </div>
        </div>
      </div>

      {/* Graphique de synthèse */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Vue d'ensemble des scores</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="item" />
            <YAxis domain={[60, 100]} />
            <Tooltip />
            <Bar dataKey="score" fill="#3B82F6" name="Score Global" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Audit détaillé par item */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {auditItems.map((item) => {
          const scoreGlobal = Math.round((item.conformiteELisa + item.completude + item.pedagogie + item.actualite) / 4);
          
          return (
            <Card key={item.itemCode} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(item.status)}
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.itemCode}</h3>
                    <p className="text-sm text-gray-600">{item.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-800">{scoreGlobal}%</div>
                  <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                    {item.status}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Conformité E-LiSA:</span>
                  <span className="font-medium">{item.conformiteELisa}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Complétude:</span>
                  <span className="font-medium">{item.completude}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pédagogie:</span>
                  <span className="font-medium">{item.pedagogie}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Actualité:</span>
                  <span className="font-medium">{item.actualite}%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <span>Rang A: {item.conceptsRangA}</span>
                <span>Rang B: {item.conceptsRangB}</span>
                <span>Total: {item.conceptsRangA + item.conceptsRangB}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Analyse stratégique */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Analyse Stratégique</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-green-700 mb-2">✅ Points Forts</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• IC-4: Excellence confirmée (95%)</li>
              <li>• IC-2: Valeurs bien intégrées (89%)</li>
              <li>• IC-1: Base solide relationnelle (86%)</li>
              <li>• Conformité E-LiSA globalement respectée</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-yellow-700 mb-2">⚠️ À Améliorer</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• IC-3: Démarche scientifique (74%)</li>
              <li>• IC-5: Organisation système (68%)</li>
              <li>• Actualisation contenu nécessaire</li>
              <li>• Enrichissement pédagogique IC-3/IC-5</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-700 mb-2">🎯 Recommandations</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Compléter IC-5 concepts manquants</li>
              <li>• Renforcer IC-3 aspects méthodologiques</li>
              <li>• Harmoniser qualité sur modèle IC-4</li>
              <li>• Intégrer innovations pédagogiques</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Métriques globales */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Métriques de Performance Globales</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalConcepts}</div>
            <div className="text-sm text-gray-600">Concepts Total</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {auditItems.filter(i => i.status === 'excellent').length}
            </div>
            <div className="text-sm text-gray-600">Items Excellents</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {auditItems.filter(i => i.status === 'ameliorer' || i.status === 'incomplet').length}
            </div>
            <div className="text-sm text-gray-600">À Améliorer</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{moyenneGenerale}%</div>
            <div className="text-sm text-gray-600">Score Moyen</div>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">
              {Math.round(auditItems.reduce((sum, item) => sum + item.conformiteELisa, 0) / auditItems.length)}%
            </div>
            <div className="text-sm text-gray-600">Conformité E-LiSA</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
