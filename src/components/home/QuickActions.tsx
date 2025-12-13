import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Music, 
  Users, 
  MessageSquare,
  Clock,
  ArrowRight,
  Zap,
  Brain,
  Target,
  Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'edn',
      title: 'Maîtriser un item',
      subtitle: 'Action ciblée sur un point précis',
      duration: '15 min',
      icon: Target,
      color: 'bg-primary',
      textColor: 'text-primary',
      bgLight: 'bg-primary/10',
      path: ROUTE_PATHS.ednComplete,
      cta: 'Choisir un item'
    },
    {
      id: 'exam',
      title: 'QCM intensif',
      subtitle: 'Teste tes connaissances rapidement',
      duration: '10 min',
      icon: Zap,
      color: 'bg-warning',
      textColor: 'text-warning',
      bgLight: 'bg-warning/10',
      path: ROUTE_PATHS.examMode,
      cta: 'Lancer un QCM'
    },
    {
      id: 'ecos',
      title: 'Simulation ECOS',
      subtitle: 'Entraînement clinique réaliste',
      duration: '25 min',
      icon: Users,
      color: 'bg-success',
      textColor: 'text-success',
      bgLight: 'bg-success/10',
      path: ROUTE_PATHS.ecosIndex,
      cta: 'Démarrer'
    },
    {
      id: 'flashcards',
      title: 'Révision flash',
      subtitle: 'Pour les moments de fatigue',
      duration: '5 min',
      icon: Brain,
      color: 'bg-accent',
      textColor: 'text-accent-foreground',
      bgLight: 'bg-accent/10',
      path: ROUTE_PATHS.flashcards,
      cta: 'Réviser'
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Choisis ton action
        </h2>
        <p className="text-muted-foreground">
          Pas de catalogue. Juste ce qui compte.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {actions.map((action) => (
          <Card 
            key={action.id}
            className="p-6 bg-card/50 hover:bg-card/80 border-border/30 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group"
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
                    <Clock className="h-3 w-3 mr-1" />
                    {action.duration}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {action.subtitle}
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`p-0 h-auto ${action.textColor} group-hover:underline`}
                >
                  {action.cta}
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Secondary actions */}
      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <Button 
          variant="ghost" 
          className="text-muted-foreground"
          onClick={() => navigate(ROUTE_PATHS.generator)}
        >
          <Music className="h-4 w-4 mr-2" />
          Générer une musique
        </Button>
        <Button 
          variant="ghost" 
          className="text-muted-foreground"
          onClick={() => navigate(ROUTE_PATHS.chat)}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Poser une question à l'IA
        </Button>
        <Button 
          variant="ghost" 
          className="text-muted-foreground"
          onClick={() => navigate(ROUTE_PATHS.progressDashboard)}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Voir ma progression
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;
