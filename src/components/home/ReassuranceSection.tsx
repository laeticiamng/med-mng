import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  Target, 
  Brain, 
  Zap, 
  Shield,
  TrendingDown,
  CheckCircle2
} from 'lucide-react';

export const ReassuranceSection: React.FC = () => {
  const principles = [
    {
      icon: Zap,
      title: 'Décision avant contenu',
      description: 'On te dit quoi faire. Tu n\'as pas à chercher.',
      color: 'text-warning',
      bg: 'bg-warning/10'
    },
    {
      icon: Target,
      title: 'Clarté avant exhaustivité',
      description: 'Mieux vaut savoir peu et bien, que tout et mal.',
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      icon: Brain,
      title: 'Action avant compréhension',
      description: 'Commence. La motivation viendra après.',
      color: 'text-success',
      bg: 'bg-success/10'
    },
    {
      icon: TrendingDown,
      title: 'Charge mentale réduite',
      description: 'Moins de choix. Moins de stress. Plus d\'efficacité.',
      color: 'text-accent-foreground',
      bg: 'bg-accent/10'
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Tu n'as pas besoin de tout savoir
        </h2>
        <p className="text-lg text-muted-foreground">
          Tu as besoin d'être <span className="text-foreground font-semibold">prêt</span>.
          <br />
          Med-MNG t'entraîne sur ce qui tombe vraiment.
        </p>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {principles.map((principle, index) => (
          <Card 
            key={index}
            className="p-5 bg-card/30 border-border/20 text-center"
          >
            <div className={`w-12 h-12 rounded-xl ${principle.bg} flex items-center justify-center mx-auto mb-4`}>
              <principle.icon className={`h-6 w-6 ${principle.color}`} />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              {principle.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {principle.description}
            </p>
          </Card>
        ))}
      </div>

      {/* Micro-copy motivationnel */}
      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground/60 italic">
          "Les étudiants ne manquent pas de ressources. Ils manquent de clarté quand la pression monte."
        </p>
      </div>
    </div>
  );
};

export default ReassuranceSection;
