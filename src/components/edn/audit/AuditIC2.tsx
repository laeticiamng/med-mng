
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Info, Target, TrendingUp } from 'lucide-react';

export const AuditIC2 = () => {
  const auditResults = {
    conformiteELisa: {
      status: 'excellent',
      score: 96,
      details: [
        'Rang A: 9/9 concepts LiSA conformes (100% couverture)',
        'Rang B: 2/2 concepts experts selon LiSA',
        'Déontologie médicale complètement intégrée',
        'Organisation profession médicale France'
      ]
    },
    completude: {
      status: 'excellent',
      score: 94,
      details: [
        'Définitions pratique et éthique médicale',
        'Normes et valeurs professionnelles',
        'EBM et responsabilité médicale',
        'Acteurs de santé et interactions'
      ]
    },
    pedagogie: {
      status: 'bon',
      score: 87,
      details: [
        'Études de cas déontologiques',
        'Analyse conflits valeurs/intérêts',
        'Simulation décisions éthiques',
        'Débats interprofessionnels'
      ]
    },
    actualite: {
      status: 'bon',
      score: 88,
      details: [
        'Évolution réglementaire ordres',
        'Nouvelles pratiques professionnelles',
        'Télémédecine et déontologie',
        'Intelligence artificielle et éthique'
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
          <Target className="h-6 w-6 text-success" />
          <h2 className="text-2xl font-bold text-foreground">Audit IC-2 : Valeurs professionnelles</h2>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-success">{scoreGlobal}%</div>
            <div className="text-sm text-muted-foreground">Score global</div>
          </div>
          <Badge className="bg-success/10 text-success text-lg px-4 py-2">
            ✅ 9 Rang A + 2 Rang B LiSA
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

      <Card className="p-6 bg-gradient-to-r from-success/5 to-primary/5">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-success" />
          <h3 className="text-lg font-semibold text-foreground">Synthèse IC-2 selon LiSA</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-success mb-2">✅ Rang A LiSA (9/9 concepts)</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Professionnels et compétences santé</li>
              <li>• Définition pratique médicale</li>
              <li>• Signification de l'éthique</li>
              <li>• Normes et valeurs professionnelles</li>
              <li>• Organisation et régulation profession</li>
              <li>• Médecine fondée sur preuves</li>
              <li>• Médecine basée sur responsabilité</li>
              <li>• Déontologie médicale</li>
              <li>• Acteurs santé et interactions</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-primary mb-2">🎯 Rang B LiSA (2/2 concepts)</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Organisation exercice professionnels France</li>
              <li>• Rôle des ordres professionnels</li>
            </ul>
            <h4 className="font-medium text-success mt-4 mb-2">📈 Total LiSA</h4>
            <div className="bg-success/10 p-3 rounded-lg">
              <div className="text-center font-bold text-success">11 connaissances</div>
              <div className="text-center text-sm text-success/80">Structure officielle E-LiSA</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
