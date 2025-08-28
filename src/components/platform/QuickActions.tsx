import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Music, BookOpen, Brain, MessageSquare, 
  Trophy, Target, Stethoscope, Users, BarChart3,
  PlusCircle, Play, Heart, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  variant?: 'default' | 'secondary' | 'premium';
  badge?: string;
}

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      id: 'generate-music',
      title: 'Générer une Musique',
      description: 'Créez une musique pédagogique avec l\'IA',
      icon: Music,
      action: () => navigate('/generator'),
      variant: 'premium',
      badge: 'IA'
    },
    {
      id: 'random-edn',
      title: 'Item EDN Aléatoire',
      description: 'Découvrez un item de connaissance au hasard',
      icon: BookOpen,
      action: () => navigate('/edn?random=true')
    },
    {
      id: 'daily-quiz',
      title: 'Quiz du Jour',
      description: 'Testez vos connaissances quotidiennement',
      icon: Trophy,
      action: () => navigate('/edn?tab=quiz&mode=daily')
    },
    {
      id: 'immersive-mode',
      title: 'Mode Immersif',
      description: 'Expérience d\'apprentissage immersive',
      icon: Brain,
      action: () => navigate('/edn?mode=immersive'),
      variant: 'premium'
    },
    {
      id: 'ask-ai',
      title: 'Question à l\'IA',
      description: 'Posez une question médicale à l\'assistant',
      icon: MessageSquare,
      action: () => navigate('/chat')
    },
    {
      id: 'ecos-practice',
      title: 'Entraînement ECOS',
      description: 'Préparez-vous aux examens cliniques',
      icon: Users,
      action: () => navigate('/ecos?mode=practice')
    },
    {
      id: 'my-progress',
      title: 'Ma Progression',
      description: 'Consultez vos statistiques d\'apprentissage',
      icon: BarChart3,
      action: () => navigate('/analytics')
    },
    {
      id: 'favorites',
      title: 'Mes Favoris',
      description: 'Accédez à vos contenus favoris',
      icon: Heart,
      action: () => navigate('/med-mng/library?filter=favorites')
    }
  ];

  const getVariantClass = (variant?: string) => {
    switch (variant) {
      case 'premium':
        return 'border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15';
      case 'secondary':
        return 'border-secondary/50 bg-secondary/5 hover:bg-secondary/10';
      default:
        return 'border-border/50 hover:border-border';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Actions Rapides
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className={`h-auto p-4 flex flex-col items-start gap-2 text-left transition-all hover:scale-105 ${getVariantClass(action.variant)}`}
              onClick={action.action}
            >
              <div className="flex items-center justify-between w-full">
                <action.icon className="w-5 h-5 text-primary" />
                {action.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {action.badge}
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-sm">{action.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {action.description}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};