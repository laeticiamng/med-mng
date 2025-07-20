
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
  conceptsLiSATotal: number;
  status: 'excellent' | 'bon' | 'ameliorer' | 'insuffisant';
}

export const AuditGeneral = () => {
  const auditItems: AuditItem[] = [
    {
      itemCode: 'IC-1',
      title: 'Relation médecin-malade et communication',
      conformiteELisa: 86,
      completude: 85,
      pedagogie: 90,
      actualite: 82,
      conceptsRangA: 14,
      conceptsRangB: 0,
      conceptsLiSATotal: 14,
      status: 'bon'
    },
    {
      itemCode: 'IC-2', 
      title: 'Valeurs professionnelles',
      conformiteELisa: 92,
      completude: 89,
      pedagogie: 87,
      actualite: 88,
      conceptsRangA: 7,
      conceptsRangB: 2,
      conceptsLiSATotal: 9,
      status: 'excellent'
    },
    {
      itemCode: 'IC-3',
      title: 'Raisonnement et décision en médecine (EBM)',
      conformiteELisa: 75,
      completude: 70,
      pedagogie: 78,
      actualite: 72,
      conceptsRangA: 14,
      conceptsRangB: 4,
      conceptsLiSATotal: 22,
      status: 'ameliorer'
    },
    {
      itemCode: 'IC-4',
      title: 'Qualité, sécurité et EIAS',
      conformiteELisa: 95,
      completude: 98,
      pedagogie: 92,
      actualite: 94,
      conceptsRangA: 20,
      conceptsRangB: 4,
      conceptsLiSATotal: 24,
      status: 'excellent'
    },
    {
      itemCode: 'IC-5',
      title: 'Responsabilités médicale et gestion des erreurs',
      conformiteELisa: 67,
      completude: 65,
      pedagogie: 72,
      actualite: 68,
      conceptsRangA: 10,
      conceptsRangB: 0,
      conceptsLiSATotal: 15,
      status: 'insuffisant'
    }
  ];

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

  const moyenneGenerale = Math.round(
    auditItems.reduce((sum, item) => sum + ((item.conformiteELisa + item.completude + item.pedagogie + item.actualite) / 4), 0) / auditItems.length
  );

  const totalConceptsLiSA = auditItems.reduce((sum, item) => sum + item.conceptsLiSATotal, 0);
  const totalRangA = auditItems.reduce((sum, item) => sum + item.conceptsRangA, 0);
  const totalRangB = auditItems.reduce((sum, item) => sum + item.conceptsRangB, 0);

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
      {/* En-tête général selon LiSA */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Award className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Audit Général Items IC selon référentiel LiSA</h1>
        </div>
        
        <div className="flex items-center justify-center space-x-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{moyenneGenerale}%</div>
            <div className="text-sm text-gray-600">Score Moyen</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{totalConceptsLiSA}</div>
            <div className="text-sm text-gray-600">Concepts LiSA Total</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">5</div>
            <div className="text-sm text-gray-600">Items IC</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">{totalRangA}/{totalRangB}</div>
            <div className="text-sm text-gray-600">Rang A/B</div>
          </div>
        </div>
      </div>

      {/* Graphique de synthèse */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Vue d'ensemble scores selon LiSA</h3>
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

      {/* Audit détaillé par item selon LiSA */}
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
                  <span>Conformité LiSA:</span>
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
                <span>Total LiSA: {item.conceptsLiSATotal}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Analyse stratégique selon LiSA */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Analyse Stratégique selon référentiel LiSA</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-green-700 mb-2">✅ Excellence LiSA</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• IC-4: Modèle parfait (95% - 24 concepts)</li>
              <li>• IC-2: Très bon niveau (89% - 9 concepts)</li>
              <li>• IC-1: Base solide (86% - 14 concepts)</li>
              <li>• 47/84 concepts LiSA maîtrisés (56%)</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-red-700 mb-2">🚨 Défaillances LiSA</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• IC-5: Critique (68% - 10/15 concepts)</li>
              <li>• IC-3: Insuffisant (74% - 18/22 concepts)</li>
              <li>• 37/84 concepts LiSA manquants (44%)</li>
              <li>• Écart important aux attendus LiSA</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-700 mb-2">🎯 Plan LiSA</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Compléter IC-5: 5 concepts Rang A</li>
              <li>• Rattraper IC-3: 4 concepts manquants</li>
              <li>• Atteindre 90% conformité LiSA</li>
              <li>• Harmoniser sur modèle IC-4</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Métriques LiSA officielles */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Métriques LiSA Officielles</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalConceptsLiSA}</div>
            <div className="text-sm text-gray-600">Total LiSA</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {auditItems.filter(i => i.status === 'excellent').length}
            </div>
            <div className="text-sm text-gray-600">Excellents</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {auditItems.filter(i => i.status === 'insuffisant').length}
            </div>
            <div className="text-sm text-gray-600">Insuffisants</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{totalRangA}</div>
            <div className="text-sm text-gray-600">Concepts Rang A</div>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">{totalRangB}</div>
            <div className="text-sm text-gray-600">Concepts Rang B</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
