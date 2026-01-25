import { Card } from '@/components/ui/card';
import {
    Brain,
    Headphones,
    Music,
    Repeat,
    Sparkles
} from 'lucide-react';
import React from 'react';

export const ReassuranceSection: React.FC = () => {
  const features = [
    {
      icon: Headphones,
      title: '🎧 Écoute passive',
      description: 'Tu écoutes. Ton cerveau mémorise. Sans effort conscient.',
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      icon: Music,
      title: '🎵 Paroles = Cours',
      description: 'Chaque chanson = un item EDN ou une situation ECOS. Précis.',
      color: 'text-accent-foreground',
      bg: 'bg-accent/10'
    },
    {
      icon: Repeat,
      title: '🔁 Refrain = Essentiel',
      description: 'Les points clés sont dans le refrain. Tu les retiens naturellement.',
      color: 'text-success',
      bg: 'bg-success/10'
    },
    {
      icon: Brain,
      title: '🧠 Mémoire long terme',
      description: 'La musique active l\'hippocampe. Rétention x3 vs lecture.',
      color: 'text-warning',
      bg: 'bg-warning/10'
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-3">
          🎓 Pourquoi ça marche ?
        </h2>
        <p className="text-lg text-muted-foreground">
          La musique transforme l'apprentissage en <span className="text-foreground font-semibold">habitude</span>.
          <br />
          Pas besoin de t'asseoir. Pas besoin d'être concentré.
        </p>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {features.map((feature, index) => (
          <Card 
            key={index}
            className="p-5 bg-card/30 border-border/20 text-center hover:bg-card/50 transition-colors"
          >
            <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mx-auto mb-4`}>
              <feature.icon className={`h-6 w-6 ${feature.color}`} />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {feature.description}
            </p>
          </Card>
        ))}
      </div>

      {/* Message de réassurance étudiant */}
      <div className="text-center pt-6 space-y-3">
        <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          Gratuit pour les révisions · Crédits IA pour générer tes propres musiques
        </div>
        <p className="text-sm text-muted-foreground/60 italic max-w-md mx-auto">
          "Le burnout étudiant vient du trop-plein d'effort. La musique rend l'effort invisible."
        </p>
      </div>
    </div>
  );
};

export default ReassuranceSection;
