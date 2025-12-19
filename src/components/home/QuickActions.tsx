import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Headphones, 
  Music, 
  BookOpen,
  Clock,
  ArrowRight,
  Play,
  Brain,
  Target,
  Sparkles,
  ListMusic
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'playlist',
      title: '🎧 Ma playlist de révision',
      subtitle: 'Écoute et mémorise - sans effort',
      duration: 'Passif',
      icon: Headphones,
      color: 'bg-primary',
      textColor: 'text-primary',
      bgLight: 'bg-gradient-to-br from-primary/15 to-primary/5',
      path: ROUTE_PATHS.generator,
      cta: 'Générer une musique',
      highlight: true
    },
    {
      id: 'edn',
      title: '📚 Mes items EDN',
      subtitle: '367 items - Rang A & B',
      duration: '15 min',
      icon: BookOpen,
      color: 'bg-accent',
      textColor: 'text-accent-foreground',
      bgLight: 'bg-accent/10',
      path: ROUTE_PATHS.ednComplete,
      cta: 'Explorer'
    },
    {
      id: 'ecos',
      title: '🎯 Simulations ECOS',
      subtitle: 'Entraînement clinique réaliste',
      duration: '25 min',
      icon: Target,
      color: 'bg-success',
      textColor: 'text-success',
      bgLight: 'bg-success/10',
      path: ROUTE_PATHS.ecosIndex,
      cta: 'Démarrer'
    },
    {
      id: 'progress',
      title: '🧠 Ma progression',
      subtitle: 'Stats, streaks & badges',
      duration: 'Live',
      icon: Brain,
      color: 'bg-warning',
      textColor: 'text-warning',
      bgLight: 'bg-warning/10',
      path: ROUTE_PATHS.progressDashboard,
      cta: 'Voir'
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          🎵 Comment tu veux réviser ?
        </h2>
        <p className="text-muted-foreground">
          La musique d'abord. Le reste suivra.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {actions.map((action) => (
          <Card 
            key={action.id}
            className={`p-6 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 group ${
              action.highlight 
                ? 'bg-gradient-to-br from-primary/10 via-card/80 to-accent/10 border-primary/30 hover:border-primary/50' 
                : 'bg-card/50 hover:bg-card/80 border-border/30'
            }`}
            onClick={() => navigate(action.path)}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${action.bgLight}`}>
                <action.icon className={`h-6 w-6 ${action.textColor}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-foreground">
                    {action.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {action.duration === 'Passif' ? (
                      <Sparkles className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {action.duration}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {action.subtitle}
                </p>
                <Button 
                  variant={action.highlight ? "default" : "ghost"}
                  size="sm" 
                  className={`${action.highlight ? 'bg-primary hover:bg-primary/90' : `p-0 h-auto ${action.textColor}`} group-hover:underline`}
                >
                  {action.highlight && <Play className="h-4 w-4 mr-1" />}
                  {action.cta}
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Bibliothèque musicale - lien secondaire prominent */}
      <div className="flex justify-center pt-4">
        <Button 
          variant="outline" 
          size="lg"
          className="border-primary/30 hover:bg-primary/10 hover:border-primary/50"
          onClick={() => navigate(ROUTE_PATHS.medMngLibrary)}
        >
          <ListMusic className="h-5 w-5 mr-2 text-primary" />
          Accéder à ma bibliothèque musicale
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;
