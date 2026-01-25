
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Info, Target, TrendingUp } from 'lucide-react';

export const AuditIC1 = () => {
  const auditResults = {
    conformiteELisa: {
      status: 'bon',
      score: 86,
      details: [
        'Rang A: 14/14 concepts LiSA conformes (100% couverture)',
        'Communication médecin-malade complète',
        'Approche centrée patient intégrée',
        'Alliance thérapeutique et empathie clinique'
      ]
    },
    completude: {
      status: 'bon',
      score: 85,
      details: [
        'Relation médecin-malade: définition et déterminants',
        'Représentations et ajustement au stress',
        'Entretien motivationnel et processus changement', 
        'Annonce mauvaise nouvelle: étapes et modalités'
      ]
    },
    pedagogie: {
      status: 'excellent',
      score: 90,
      details: [
        'Jeux de rôle communication',
        'Simulations annonce diagnostique',
        'Cas cliniques relationnels',
        'Évaluation compétences communicationnelles'
      ]
    },
    actualite: {
      status: 'ameliorer',
      score: 82,
      details: [
        'Télémédecine et relation à distance',
        'Outils numériques communication',
        'Intelligence artificielle conversationnelle',
        'Réseaux sociaux et e-réputation médicale'
      ]
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-success/10 text-success border-success/30';
      case 'bon': return 'bg-primary/10 text-primary border-primary/30';
      case 'ameliorer': return 'bg-warning/10 text-warning border-warning/30';
      default: return 'bg-muted text-muted-foreground border-muted';
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
          <Target className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Audit IC-1 : Relation médecin-malade et communication</h2>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{scoreGlobal}%</div>
            <div className="text-sm text-muted-foreground">Score global</div>
          </div>
          <Badge className="bg-primary/10 text-primary text-lg px-4 py-2">
            ✅ 14 concepts Rang A LiSA
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
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{detail}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-gradient-to-r from-primary/10 to-success/10">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Synthèse IC-1 selon LiSA</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-success mb-2">✅ Concepts LiSA maîtrisés (14/14)</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Définition relation médecin-malade</li>
              <li>• Approche centrée patient</li>
              <li>• Alliance thérapeutique et empathie</li>
              <li>• Entretien motivationnel</li>
              <li>• Annonce mauvaise nouvelle</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-warning mb-2">📈 Modernisation nécessaire</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Télémédecine et communication</li>
              <li>• Outils numériques relationnels</li>
              <li>• IA conversationnelle médicale</li>
              <li>• Communication digitale patients</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
