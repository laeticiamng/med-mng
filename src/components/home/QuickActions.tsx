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
    <div className="space-y-6 px-4">
      {/* Section header - Studieux */}
      <div className="text-center mb-2">
        <h2 className="text-xl font-semibold text-foreground">
          Accès rapides
        </h2>
      </div>
      
      {/* Grid de cards - Espaces généreux, mobile-first */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {actions.map((action) => (
          <Card 
            key={action.id}
            className={`p-5 cursor-pointer transition-all hover:shadow-md border-border/40 bg-card/60 backdrop-blur-sm rounded-xl ${
              action.highlight ? 'border-primary/20' : ''
            }`}
            onClick={() => navigate(action.path)}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-lg ${action.bgLight}`}>
                <action.icon className={`h-5 w-5 ${action.textColor}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-sm mb-1">
                  {action.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {action.subtitle}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs py-0.5 px-2">
                    {action.duration === 'Passif' ? (
                      <Sparkles className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {action.duration}
                  </Badge>
                </div>
              </div>
              
              <ArrowRight className="h-4 w-4 text-muted-foreground/50 mt-1" />
            </div>
          </Card>
        ))}
      </div>

      {/* Lien bibliothèque - Discret */}
      <div className="flex justify-center pt-2">
        <Button 
          variant="ghost" 
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => navigate(ROUTE_PATHS.medMngLibrary)}
        >
          <ListMusic className="h-4 w-4 mr-2" />
          Ma bibliothèque musicale
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;
