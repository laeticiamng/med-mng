
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
      case 'excellent': return 'bg-success/10 text-success border-success/30';
      case 'bon': return 'bg-primary/10 text-primary border-primary/30';
      case 'ameliorer': return 'bg-warning/10 text-warning border-warning/30';
      case 'insuffisant': return 'bg-destructive/10 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'bon': return <Info className="h-5 w-5 text-primary" />;
      case 'ameliorer': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'insuffisant': return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default: return <Info className="h-5 w-5 text-muted-foreground" />;
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
          <Award className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Audit Général Items IC selon référentiel LiSA</h1>
        </div>
        
        <div className="flex items-center justify-center space-x-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{moyenneGenerale}%</div>
            <div className="text-sm text-muted-foreground">Score Moyen</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success">{totalConceptsLiSA}</div>
            <div className="text-sm text-muted-foreground">Concepts LiSA Total</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">5</div>
            <div className="text-sm text-muted-foreground">Items IC</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning">{totalRangA}/{totalRangB}</div>
            <div className="text-sm text-muted-foreground">Rang A/B</div>
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
            <Bar dataKey="score" fill="hsl(var(--primary))" name="Score Global" />
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
                    <h3 className="font-semibold text-foreground">{item.itemCode}</h3>
                    <p className="text-sm text-muted-foreground">{item.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-foreground">{scoreGlobal}%</div>
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
              
              <div className="flex justify-between items-center text-xs text-muted-foreground bg-muted p-2 rounded">
                <span>Rang A: {item.conceptsRangA}</span>
                <span>Rang B: {item.conceptsRangB}</span>
                <span>Total LiSA: {item.conceptsLiSATotal}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Analyse stratégique selon LiSA */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-success/5">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Analyse Stratégique selon référentiel LiSA</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-success mb-2">✅ Excellence LiSA</h4>
            <ul className="space-y-1 text-sm text-foreground/80">
              <li>• IC-4: Modèle parfait (95% - 24 concepts)</li>
              <li>• IC-2: Très bon niveau (89% - 9 concepts)</li>
              <li>• IC-1: Base solide (86% - 14 concepts)</li>
              <li>• 47/84 concepts LiSA maîtrisés (56%)</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-destructive mb-2">🚨 Défaillances LiSA</h4>
            <ul className="space-y-1 text-sm text-foreground/80">
              <li>• IC-5: Critique (68% - 10/15 concepts)</li>
              <li>• IC-3: Insuffisant (74% - 18/22 concepts)</li>
              <li>• 37/84 concepts LiSA manquants (44%)</li>
              <li>• Écart important aux attendus LiSA</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-primary mb-2">🎯 Plan LiSA</h4>
            <ul className="space-y-1 text-sm text-foreground/80">
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
        <h3 className="text-lg font-semibold text-foreground mb-4">Métriques LiSA Officielles</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">{totalConceptsLiSA}</div>
            <div className="text-sm text-muted-foreground">Total LiSA</div>
          </div>
          <div className="text-center p-3 bg-success/5 rounded-lg">
            <div className="text-2xl font-bold text-success">
              {auditItems.filter(i => i.status === 'excellent').length}
            </div>
            <div className="text-sm text-muted-foreground">Excellents</div>
          </div>
          <div className="text-center p-3 bg-destructive/5 rounded-lg">
            <div className="text-2xl font-bold text-destructive">
              {auditItems.filter(i => i.status === 'insuffisant').length}
            </div>
            <div className="text-sm text-muted-foreground">Insuffisants</div>
          </div>
          <div className="text-center p-3 bg-accent/5 rounded-lg">
            <div className="text-2xl font-bold text-accent">{totalRangA}</div>
            <div className="text-sm text-muted-foreground">Concepts Rang A</div>
          </div>
          <div className="text-center p-3 bg-warning/5 rounded-lg">
            <div className="text-2xl font-bold text-warning">{totalRangB}</div>
            <div className="text-sm text-muted-foreground">Concepts Rang B</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
