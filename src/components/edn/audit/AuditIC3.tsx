
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info, Target, BookOpen, TrendingUp } from 'lucide-react';

export const AuditIC3 = () => {
  const auditResults = {
    conformiteELisa: {
      status: 'ameliorer',
      score: 78,
      details: [
        'Rang A: 13/15 concepts LiSA conformes (87% couverture)',
        'Rang B: 6/8 concepts experts selon LiSA',
        'EBM et niveaux de preuve intégrés',
        'Décision médicale et TICE partielles'
      ]
    },
    completude: {
      status: 'ameliorer',
      score: 73,
      details: [
        'Médecine basée preuves: définition et niveaux',
        'Raisonnement clinique et styles décision',
        'Décision partagée vs paternaliste',
        'TICE et aide décision clinique manquantes'
      ]
    },
    pedagogie: {
      status: 'ameliorer',
      score: 76,
      details: [
        'Exercices analyse critique',
        'Cas études méthodologiques',
        'Ateliers lecture critique',
        'Simulations décision médicale'
      ]
    },
    actualite: {
      status: 'ameliorer',
      score: 74,
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
      case 'excellent': return 'bg-success/10 text-success border-success/30';
      case 'bon': return 'bg-primary/10 text-primary border-primary/30';
      case 'ameliorer': return 'bg-warning/10 text-warning border-warning/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'bon': return <Info className="h-5 w-5 text-primary" />;
      case 'ameliorer': return <AlertTriangle className="h-5 w-5 text-warning" />;
      default: return <Info className="h-5 w-5 text-muted-foreground" />;
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
          <Target className="h-6 w-6 text-warning" />
          <h2 className="text-2xl font-bold text-foreground">Audit IC-3 : Raisonnement et décision en médecine (EBM)</h2>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-warning">{scoreGlobal}%</div>
            <div className="text-sm text-muted-foreground">Score global</div>
          </div>
          <Badge className="bg-warning/10 text-warning text-lg px-4 py-2">
            ⚠️ 15 Rang A + 8 Rang B LiSA
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(auditResults).map(([key, result]) => (
          <Card key={key} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getStatusIcon(result.status)}
                <h3 className="font-semibold text-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-foreground">{result.score}%</div>
                <Badge className={`text-xs ${getStatusColor(result.status)}`}>
                  {result.status}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              {result.details.map((detail, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{detail}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-gradient-to-r from-warning/5 to-warning/10">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <h3 className="text-lg font-semibold text-foreground">Plan amélioration IC-3 selon LiSA</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-destructive mb-2">🚨 Concepts Rang A manquants (2/15)</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• TICE et aide décision clinique</li>
              <li>• Particularités controverse en santé</li>
            </ul>
            <h4 className="font-medium text-warning mt-4 mb-2">📋 Concepts Rang B manquants (2/8)</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Modèle dynamiques décisionnelles</li>
              <li>• Architectures systèmes information</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-success mb-2">✅ Concepts LiSA acquis</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• EBM et niveaux de preuve</li>
              <li>• Styles de raisonnement</li>
              <li>• Décision partagée/paternaliste</li>
              <li>• Recommandations médicales</li>
              <li>• Efficacité/effectivité/efficience</li>
              <li>• Supports au raisonnement</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
