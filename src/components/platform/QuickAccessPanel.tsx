import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Music, 
  Brain, 
  Stethoscope, 
  BarChart3, 
  Settings, 
  FileText,
  Zap,
  Clock,
  Star,
  TrendingUp,
  Play,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/providers/AuthProvider';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  route: string;
  color: string;
  badge?: string;
  requiresAuth?: boolean;
  stats?: {
    label: string;
    value: string;
  };
}

export const QuickAccessPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickActions: QuickAction[] = [
    {
      id: 'generate',
      title: 'Générer Musique',
      description: 'Créez une nouvelle musique éducative IA',
      icon: Music,
      route: '/generator',
      color: 'from-purple-600 to-pink-600',
      badge: 'Populaire',
      stats: {
        label: 'Générations ce mois',
        value: user ? '47/100' : '2/5'
      }
    },
    {
      id: 'library',
      title: 'Ma Bibliothèque',
      description: 'Accédez à toutes vos créations',
      icon: Play,
      route: '/library',
      color: 'from-blue-600 to-cyan-600',
      requiresAuth: true,
      stats: {
        label: 'Musiques sauvées',
        value: '23'
      }
    },
    {
      id: 'ecos',
      title: 'Simulations ECOS',
      description: 'Entraînez-vous avec des cas cliniques',
      icon: Stethoscope,
      route: '/ecos',
      color: 'from-green-600 to-emerald-600',
      stats: {
        label: 'Scénarios disponibles',
        value: '127'
      }
    },
    {
      id: 'chat',
      title: 'Assistant IA',
      description: 'Posez vos questions médicales',
      icon: Brain,
      route: '/med-chat',
      color: 'from-orange-600 to-red-600',
      badge: 'Nouveau',
      stats: {
        label: 'Questions répondues',
        value: '1.2K'
      }
    },
    {
      id: 'analytics',
      title: 'Mes Statistiques',
      description: 'Suivez votre progression',
      icon: BarChart3,
      route: '/analytics',
      color: 'from-indigo-600 to-purple-600',
      requiresAuth: true,
      stats: {
        label: 'Score moyen',
        value: '87%'
      }
    },
    {
      id: 'edn-complete',
      title: 'Items EDN',
      description: 'Explorez les 367 items médicaux',
      icon: BookOpen,
      route: '/edn-complete',
      color: 'from-teal-600 to-blue-600',
      stats: {
        label: 'Items disponibles',
        value: '367'
      }
    }
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'generation',
      title: 'IC-103 Vertige - Style Jazz',
      time: '5 min',
      icon: Music,
      color: 'text-purple-600'
    },
    {
      id: '2',
      type: 'simulation',
      title: 'ECOS Cardiologie réussi',
      time: '12 min',
      icon: Stethoscope,
      color: 'text-green-600'
    },
    {
      id: '3',
      type: 'chat',
      title: 'Question sur l\'hypertension',
      time: '25 min',
      icon: Brain,
      color: 'text-orange-600'
    }
  ];

  const handleActionClick = (action: QuickAction) => {
    if (action.requiresAuth && !user) {
      navigate('/med-mng/login');
      return;
    }
    navigate(action.route);
  };

  return (
    <div className="space-y-6">
      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Actions Rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <div
                key={action.id}
                className="group relative overflow-hidden rounded-xl border bg-card hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => handleActionClick(action)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                
                <div className="relative p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} text-white`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    {action.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {action.description}
                  </p>
                  
                  {action.stats && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{action.stats.label}</span>
                      <span className="font-medium">{action.stats.value}</span>
                    </div>
                  )}
                  
                  {action.requiresAuth && !user && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        Connexion requise
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activité récente */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Activité Récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 bg-background rounded-lg">
                    <activity.icon className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Il y a {activity.time}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/analytics')}
              >
                Voir toute l'activité
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions personnalisées */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Recommandations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-yellow-200 bg-yellow-50">
              <h4 className="text-sm font-medium text-yellow-800 mb-1">
                Complétez votre apprentissage
              </h4>
              <p className="text-xs text-yellow-700 mb-2">
                Vous avez étudié IC-103, essayez maintenant IC-230 sur la cardiologie
              </p>
              <Button size="sm" variant="outline" className="text-yellow-700 border-yellow-300">
                Découvrir IC-230
              </Button>
            </div>
            
            <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
              <h4 className="text-sm font-medium text-blue-800 mb-1">
                Nouveau style musical
              </h4>
              <p className="text-xs text-blue-700 mb-2">
                Essayez le style Electronic pour vos prochaines générations
              </p>
              <Button size="sm" variant="outline" className="text-blue-700 border-blue-300">
                Essayer maintenant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};