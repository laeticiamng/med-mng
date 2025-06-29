
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info, Target, BookOpen, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export const AuditComprehensif = () => {
  const auditComplet = {
    'IC-1': {
      title: 'Relation médecin-malade',
      scoreGlobal: 86,
      conformiteELisa: 88,
      completude: 85,
      pedagogie: 90,
      actualite: 82,
      conceptsRangA: 18,
      conceptsRangB: 28,
      status: 'bon',
      priorite: 'Maintenir excellence',
      actions: [
        'Intégrer télémédecine',
        'Actualiser outils numériques',
        'Compléter 2 concepts Rang A'
      ]
    },
    'IC-2': {
      title: 'Valeurs professionnelles',
      scoreGlobal: 89,
      conformiteELisa: 92,
      completude: 89,
      pedagogie: 87,
      actualite: 88,
      conceptsRangA: 19,
      conceptsRangB: 30,
      status: 'excellent',
      priorite: 'Conserver avance',
      actions: [
        'Enrichir dimension sociétale',
        'Renforcer cas pratiques',
        'Finaliser concept Rang A manquant'
      ]
    },
    'IC-3': {
      title: 'Démarche scientifique',
      scoreGlobal: 74,
      conformiteELisa: 75,
      completude: 70,
      pedagogie: 78,
      actualite: 72,
      conceptsRangA: 14,
      conceptsRangB: 22,
      status: 'ameliorer',
      priorite: 'URGENT - Restructurer',
      actions: [
        'Compléter 6 concepts Rang A manquants',
        'Ajouter 10 concepts Rang B',
        'Renforcer biostatistiques',
        'Intégrer méthodologie complète'
      ]
    },
    'IC-4': {
      title: 'Qualité et sécurité des soins',
      scoreGlobal: 95,
      conformiteELisa: 95,
      completude: 98,
      pedagogie: 92,
      actualite: 94,
      conceptsRangA: 20,
      conceptsRangB: 32,
      status: 'excellent',
      priorite: 'Modèle de référence',
      actions: [
        'Diffuser bonnes pratiques',
        'Servir de référence pour autres items',
        'Maintenir niveau d\'excellence'
      ]
    },
    'IC-5': {
      title: 'Organisation du système de santé',
      scoreGlobal: 68,
      conformiteELisa: 70,
      completude: 65,
      pedagogie: 75,
      actualite: 68,
      conceptsRangA: 12,
      conceptsRangB: 18,
      status: 'incomplet',
      priorite: 'CRITIQUE - Refondre',
      actions: [
        'Compléter 8 concepts Rang A manquants',
        'Ajouter 14 concepts Rang B manquants',
        'Développer parcours de soins',
        'Intégrer réformes récentes'
      ]
    }
  };

  const metriquesGlobales = {
    scoreGlobalMoyen: Math.round(Object.values(auditComplet).reduce((sum, item) => sum + item.scoreGlobal, 0) / 5),
    conformiteElisaMoyenne: Math.round(Object.values(auditComplet).reduce((sum, item) => sum + item.conformiteELisa, 0) / 5),
    completudeMoyenne: Math.round(Object.values(auditComplet).reduce((sum, item) => sum + item.completude, 0) / 5),
    pedagogieMoyenne: Math.round(Object.values(auditComplet).reduce((sum, item) => sum + item.pedagogie, 0) / 5),
    actualiteMoyenne: Math.round(Object.values(auditComplet).reduce((sum, item) => sum + item.actualite, 0) / 5),
    totalConceptsRangA: Object.values(auditComplet).reduce((sum, item) => sum + item.conceptsRangA, 0),
    totalConceptsRangB: Object.values(auditComplet).reduce((sum, item) => sum + item.conceptsRangB, 0)
  };

  const totalConcepts = metriquesGlobales.totalConceptsRangA + metriquesGlobales.totalConceptsRangB;

  const dataDistribution = [
    { name: 'Excellent', value: Object.values(auditComplet).filter(i => i.status === 'excellent').length, color: '#10B981' },
    { name: 'Bon', value: Object.values(auditComplet).filter(i => i.status === 'bon').length, color: '#3B82F6' },
    { name: 'À améliorer', value: Object.values(auditComplet).filter(i => i.status === 'ameliorer').length, color: '#F59E0B' },
    { name: 'Incomplet', value: Object.values(auditComplet).filter(i => i.status === 'incomplet').length, color: '#EF4444' }
  ];

  const dataEvolution = Object.entries(auditComplet).map(([code, item]) => ({
    item: code,
    scoreActuel: item.scoreGlobal,
    objectifCible: code === 'IC-4' ? 95 : code === 'IC-2' ? 92 : code === 'IC-1' ? 88 : 85,
    ecartObjectif: item.scoreGlobal - (code === 'IC-4' ? 95 : code === 'IC-2' ? 92 : code === 'IC-1' ? 88 : 85)
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-300';
      case 'bon': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ameliorer': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'incomplet': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPrioriteColor = (priorite: string) => {
    if (priorite.includes('CRITIQUE')) return 'text-red-700';
    if (priorite.includes('URGENT')) return 'text-orange-700';
    return 'text-blue-700';
  };

  return (
    <div className="space-y-8 p-6">
      {/* En-tête avec métriques globales */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-2">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-800">Audit Compréhensif - Items IC E-LiSA</h1>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{metriquesGlobales.scoreGlobalMoyen}%</div>
            <div className="text-sm text-gray-600">Score Global Moyen</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{totalConcepts}</div>
            <div className="text-sm text-gray-600">Concepts Total</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{metriquesGlobales.conformiteElisaMoyenne}%</div>
            <div className="text-sm text-gray-600">Conformité E-LiSA</div>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <div className="text-3xl font-bold text-amber-600">{metriquesGlobales.completudeMoyenne}%</div>
            <div className="text-sm text-gray-600">Complétude Moyenne</div>
          </div>
          <div className="text-center p-4 bg-teal-50 rounded-lg">
            <div className="text-3xl font-bold text-teal-600">{metriquesGlobales.pedagogieMoyenne}%</div>
            <div className="text-sm text-gray-600">Pédagogie Moyenne</div>
          </div>
        </div>
      </div>

      {/* Graphiques de synthèse */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribution des Statuts</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dataDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {dataDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Scores par Item</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={Object.entries(auditComplet).map(([code, item]) => ({ item: code, score: item.scoreGlobal }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="item" />
              <YAxis domain={[60, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Analyse détaillée par item */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
          <Target className="h-6 w-6" />
          <span>Analyse Détaillée par Item</span>
        </h2>
        
        <div className="grid grid-cols-1 gap-4">
          {Object.entries(auditComplet).map(([code, item]) => (
            <Card key={code} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{code}</h3>
                    <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                    <div className="text-2xl font-bold text-gray-800">{item.scoreGlobal}%</div>
                  </div>
                  <p className="text-gray-600 mb-2">{item.title}</p>
                  <p className={`font-medium ${getPrioriteColor(item.priorite)}`}>{item.priorite}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Métriques Détaillées</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Conformité E-LiSA:</span>
                      <span className="font-medium">{item.conformiteELisa}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Complétude:</span>
                      <span className="font-medium">{item.completude}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pédagogie:</span>
                      <span className="font-medium">{item.pedagogie}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Actualité:</span>
                      <span className="font-medium">{item.actualite}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Concepts E-LiSA</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Rang A:</span>
                      <span className="font-medium">{item.conceptsRangA}/20</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rang B:</span>
                      <span className="font-medium">{item.conceptsRangB}/32</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-medium">{item.conceptsRangA + item.conceptsRangB}/52</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Complétude:</span>
                      <span className="font-medium">{Math.round(((item.conceptsRangA + item.conceptsRangB) / 52) * 100)}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Actions Prioritaires</h4>
                  <ul className="space-y-1 text-sm">
                    {item.actions.map((action, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Plan d'action stratégique */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-2 mb-4">
          <Award className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-800">Plan d'Action Stratégique</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-red-700 mb-3">🚨 Actions Critiques (0-3 mois)</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <strong>IC-5:</strong> Refondre complètement (8 concepts Rang A + 14 Rang B manquants)</li>
              <li>• <strong>IC-3:</strong> Restructurer méthodologie (6 concepts Rang A manquants)</li>
              <li>• Harmoniser sur le modèle IC-4 (95% excellence)</li>
              <li>• Actualiser contenus avec réformes récentes</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-orange-700 mb-3">⚠️ Actions Urgentes (3-6 mois)</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <strong>IC-1:</strong> Intégrer télémédecine et outils numériques</li>
              <li>• <strong>IC-2:</strong> Enrichir dimension sociétale</li>
              <li>• Développer innovations pédagogiques</li>
              <li>• Renforcer biostatistiques (IC-3)</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-700 mb-3">📈 Développement (6-12 mois)</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Diffuser bonnes pratiques IC-4</li>
              <li>• Atteindre 90% score moyen global</li>
              <li>• 95% conformité E-LiSA sur tous items</li>
              <li>• Certification qualité pédagogique</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Indicateurs de performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Indicateurs de Performance Clés</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">{Object.values(auditComplet).filter(i => i.status === 'excellent').length}/5</div>
            <div className="text-sm text-gray-600">Items Excellents</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">{metriquesGlobales.totalConceptsRangA}/100</div>
            <div className="text-sm text-gray-600">Concepts Rang A</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">{metriquesGlobales.totalConceptsRangB}/160</div>
            <div className="text-sm text-gray-600">Concepts Rang B</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">{Math.round(((metriquesGlobales.totalConceptsRangA + metriquesGlobales.totalConceptsRangB) / 260) * 100)}%</div>
            <div className="text-sm text-gray-600">Complétude E-LiSA</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
