
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info, Target, BookOpen, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const AuditComprehensif = () => {
  const auditComplet = {
    'IC-1': {
      title: 'Relation médecin-malade et communication',
      scoreGlobal: 86,
      conformiteELisa: 86,
      completude: 85,
      pedagogie: 90,
      actualite: 82,
      conceptsRangA: 14,
      conceptsRangB: 0,
      conceptsLiSATotal: 14,
      status: 'bon',
      priorite: 'Maintenir niveau',
      actions: [
        'Intégrer télémédecine communication',
        'Actualiser outils numériques',
        'Maintenir excellence pédagogique'
      ]
    },
    'IC-2': {
      title: 'Valeurs professionnelles',
      scoreGlobal: 89,
      conformiteELisa: 92,
      completude: 89,
      pedagogie: 87,
      actualite: 88,
      conceptsRangA: 7,
      conceptsRangB: 2,
      conceptsLiSATotal: 9,
      status: 'excellent',
      priorite: 'Conserver excellence',
      actions: [
        'Maintenir niveau déontologique',
        'Actualiser évolutions ordres',
        'Enrichir cas pratiques'
      ]
    },
    'IC-3': {
      title: 'Raisonnement et décision en médecine (EBM)',
      scoreGlobal: 74,
      conformiteELisa: 75,
      completude: 70,
      pedagogie: 78,
      actualite: 72,
      conceptsRangA: 14,
      conceptsRangB: 4,
      conceptsLiSATotal: 22,
      status: 'ameliorer',
      priorite: 'URGENT - Rattraper',
      actions: [
        'Compléter 2 concepts Rang A manquants',
        'Ajouter 2 concepts Rang B manquants',
        'Renforcer TICE et aide décision',
        'Intégrer controverses santé'
      ]
    },
    'IC-4': {
      title: 'Qualité, sécurité et EIAS',
      scoreGlobal: 95,
      conformiteELisa: 95,
      completude: 98,
      pedagogie: 92,
      actualite: 94,
      conceptsRangA: 20,
      conceptsRangB: 4,
      conceptsLiSATotal: 24,
      status: 'excellent',
      priorite: 'Modèle de référence LiSA',
      actions: [
        'Servir de référence autres items',
        'Diffuser bonnes pratiques',
        'Maintenir excellence LiSA'
      ]
    },
    'IC-5': {
      title: 'Responsabilités médicale et gestion des erreurs',
      scoreGlobal: 68,
      conformiteELisa: 67,
      completude: 65,
      pedagogie: 72,
      actualite: 68,
      conceptsRangA: 10,
      conceptsRangB: 0,
      conceptsLiSATotal: 15,
      status: 'insuffisant',
      priorite: 'CRITIQUE - Refondre',
      actions: [
        'Compléter 5 concepts Rang A manquants',
        'Développer culture positive erreur',
        'Intégrer prévention et barrières',
        'Actualiser jurisprudence'
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
    totalConceptsRangB: Object.values(auditComplet).reduce((sum, item) => sum + item.conceptsRangB, 0),
    totalConceptsLiSA: Object.values(auditComplet).reduce((sum, item) => sum + item.conceptsLiSATotal, 0)
  };

  const dataDistribution = [
    { name: 'Excellent', value: Object.values(auditComplet).filter(i => i.status === 'excellent').length, color: '#10B981' },
    { name: 'Bon', value: Object.values(auditComplet).filter(i => i.status === 'bon').length, color: '#3B82F6' },
    { name: 'À améliorer', value: Object.values(auditComplet).filter(i => i.status === 'ameliorer').length, color: '#F59E0B' },
    { name: 'Insuffisant', value: Object.values(auditComplet).filter(i => i.status === 'insuffisant').length, color: '#EF4444' }
  ];

  const getPrioriteColor = (priorite: string) => {
    if (priorite.includes('CRITIQUE')) return 'text-red-700';
    if (priorite.includes('URGENT')) return 'text-orange-700';
    return 'text-blue-700';
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

  return (
    <div className="space-y-8 p-6">
      {/* En-tête avec métriques LiSA */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-2">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-800">Audit Compréhensif - Items IC selon référentiel LiSA</h1>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{metriquesGlobales.scoreGlobalMoyen}%</div>
            <div className="text-sm text-gray-600">Score Global</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{metriquesGlobales.totalConceptsLiSA}</div>
            <div className="text-sm text-gray-600">Total LiSA</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{metriquesGlobales.totalConceptsRangA}</div>
            <div className="text-sm text-gray-600">Rang A</div>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <div className="text-3xl font-bold text-amber-600">{metriquesGlobales.totalConceptsRangB}</div>
            <div className="text-sm text-gray-600">Rang B</div>
          </div>
          <div className="text-center p-4 bg-teal-50 rounded-lg">
            <div className="text-3xl font-bold text-teal-600">{metriquesGlobales.conformiteElisaMoyenne}%</div>
            <div className="text-sm text-gray-600">Conformité</div>
          </div>
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <div className="text-3xl font-bold text-indigo-600">5</div>
            <div className="text-sm text-gray-600">Items IC</div>
          </div>
        </div>
      </div>

      {/* Graphiques de synthèse */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribution des Statuts LiSA</h3>
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
          <h3 className="text-lg font-semibold mb-4">Scores par Item LiSA</h3>
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

      {/* Analyse détaillée par item selon LiSA */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
          <Target className="h-6 w-6" />
          <span>Analyse Détaillée par Item selon LiSA</span>
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
                  <h4 className="font-medium text-gray-700 mb-2">Métriques LiSA</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Conformité LiSA:</span>
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
                  <h4 className="font-medium text-gray-700 mb-2">Concepts LiSA Officiels</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Rang A:</span>
                      <span className="font-medium">{item.conceptsRangA}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rang B:</span>
                      <span className="font-medium">{item.conceptsRangB}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total LiSA:</span>
                      <span className="font-medium">{item.conceptsLiSATotal}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-blue-600">
                      <span>Conformité:</span>
                      <span>{Math.round((item.conformiteELisa/100) * item.conceptsLiSATotal)}/{item.conceptsLiSATotal}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Actions Prioritaires LiSA</h4>
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

      {/* Plan d'action stratégique selon LiSA */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-2 mb-4">
          <Award className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-800">Plan d'Action Stratégique selon LiSA</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-red-700 mb-3">🚨 Actions Critiques LiSA (0-3 mois)</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <strong>IC-5:</strong> Compléter 5 concepts Rang A manquants</li>
              <li>• <strong>IC-3:</strong> Ajouter 4 concepts LiSA manquants</li>
              <li>• Atteindre conformité LiSA minimale 80%</li>
              <li>• Harmoniser sur modèle IC-4 (référence)</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-orange-700 mb-3">⚠️ Actions Urgentes LiSA (3-6 mois)</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <strong>IC-1:</strong> Maintenir niveau et moderniser</li>
              <li>• <strong>IC-2:</strong> Conserver excellence déontologique</li>
              <li>• Actualiser tous contenus selon LiSA 2024</li>
              <li>• Développer innovations pédagogiques</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-700 mb-3">📈 Excellence LiSA (6-12 mois)</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Généraliser modèle IC-4 (95% excellence)</li>
              <li>• Atteindre 90% conformité LiSA globale</li>
              <li>• 84/84 concepts LiSA maîtrisés</li>
              <li>• Certification conformité LiSA</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Indicateurs LiSA */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Indicateurs de Performance LiSA</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">{Object.values(auditComplet).filter(i => i.status === 'excellent').length}/5</div>
            <div className="text-sm text-gray-600">Items Excellents</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">{metriquesGlobales.totalConceptsRangA}/65</div>
            <div className="text-sm text-gray-600">Concepts Rang A</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">{metriquesGlobales.totalConceptsRangB}/10</div>
            <div className="text-sm text-gray-600">Concepts Rang B</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">{Math.round((metriquesGlobales.totalConceptsLiSA / 84) * 100)}%</div>
            <div className="text-sm text-gray-600">Complétude LiSA</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
