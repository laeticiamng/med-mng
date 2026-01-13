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
  Brain,
  Target,
  Sparkles,
  ListMusic,
  Users,
  MessageSquare,
  Layers,
  Calendar,
  Trophy,
  HeartPulse,
  ShoppingBag,
  Library,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  // Actions principales (toujours visibles)
  const mainActions = [
    {
      id: 'edn',
      title: '📚 Items EDN',
      subtitle: '367 items - Rang A & B',
      duration: '15 min',
      icon: BookOpen,
      textColor: 'text-primary',
      bgLight: 'bg-primary/10',
      path: ROUTE_PATHS.ednComplete,
      cta: 'Explorer',
      highlight: true
    },
    {
      id: 'exam',
      title: '🧠 Mode Examen',
      subtitle: 'QCM & entraînement intensif',
      duration: '30 min',
      icon: Brain,
      textColor: 'text-accent-foreground',
      bgLight: 'bg-accent/10',
      path: ROUTE_PATHS.examMode,
      cta: "S'entraîner"
    },
    {
      id: 'ecos',
      title: '🎯 Simulations ECOS',
      subtitle: 'Entraînement clinique réaliste',
      duration: '25 min',
      icon: Target,
      textColor: 'text-success',
      bgLight: 'bg-success/10',
      path: ROUTE_PATHS.ecosIndex,
      cta: 'Démarrer'
    },
    {
      id: 'progress',
      title: '📊 Ma progression',
      subtitle: 'Stats, streaks & badges',
      duration: 'Live',
      icon: BarChart3,
      textColor: 'text-warning',
      bgLight: 'bg-warning/10',
      path: ROUTE_PATHS.progressDashboard,
      cta: 'Voir'
    },
  ];

  // Actions secondaires (grille plus compacte)
  const secondaryActions = [
    { id: 'flashcards', title: 'Flashcards', icon: Layers, path: ROUTE_PATHS.flashcards },
    { id: 'srs', title: 'Révision espacée', icon: Calendar, path: ROUTE_PATHS.srsReview },
    { id: 'clinical', title: 'Cas cliniques', icon: HeartPulse, path: ROUTE_PATHS.clinicalCases },
    { id: 'chat', title: 'Chat IA', icon: MessageSquare, path: ROUTE_PATHS.chat },
    { id: 'music', title: 'Musique médicale', icon: Music, path: ROUTE_PATHS.generator },
    { id: 'achievements', title: 'Succès', icon: Trophy, path: ROUTE_PATHS.achievements },
    { id: 'planner', title: 'Planning', icon: Calendar, path: ROUTE_PATHS.smartStudyPlanner },
    { id: 'community', title: 'Communauté', icon: Users, path: ROUTE_PATHS.community },
  ];

  // Ressources et outils
  const resourceActions = [
    { id: 'library', title: 'Bibliothèque', icon: Library, path: ROUTE_PATHS.library },
    { id: 'musicLib', title: 'Musiques EDN', icon: Headphones, path: ROUTE_PATHS.ednMusicLibrary },
    { id: 'store', title: 'Boutique', icon: ShoppingBag, path: ROUTE_PATHS.store },
    { id: 'stats', title: 'Statistiques', icon: BarChart3, path: ROUTE_PATHS.statistics },
  ];

  return (
    <div className="space-y-8 px-2 sm:px-4">
      {/* Section principale */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">
            🚀 Actions prioritaires
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Commence par là</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto">
          {mainActions.map((action) => (
            <Card 
              key={action.id}
              className={`p-4 sm:p-5 cursor-pointer transition-all hover:shadow-md border-border/40 bg-card/60 backdrop-blur-sm rounded-lg sm:rounded-xl ${
                action.highlight ? 'border-primary/30 ring-1 ring-primary/20' : ''
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
                      {action.duration === 'Live' ? (
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
      </div>

      {/* Section secondaire */}
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-md font-medium text-foreground">
            🛠️ Outils d'apprentissage
          </h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-3xl mx-auto">
          {secondaryActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className="h-auto py-3 px-3 flex flex-col items-center gap-2 hover:bg-secondary/80"
              onClick={() => navigate(action.path)}
            >
              <action.icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-medium">{action.title}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Section ressources */}
      <div className="space-y-3">
        <div className="text-center">
          <h3 className="text-md font-medium text-muted-foreground">
            📚 Ressources
          </h3>
        </div>
        
        <div className="flex justify-center gap-2 flex-wrap">
          {resourceActions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate(action.path)}
            >
              <action.icon className="h-4 w-4 mr-2" />
              {action.title}
            </Button>
          ))}
          <Button 
            variant="ghost" 
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => navigate(ROUTE_PATHS.medMngLibrary)}
          >
            <ListMusic className="h-4 w-4 mr-2" />
            Ma bibliothèque
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
