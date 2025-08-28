import React, { useState, useEffect } from 'react';
import { 
  Clock, Music, BookOpen, Trophy, Brain, MessageSquare,
  TrendingUp, Award, Target, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Activity {
  id: string;
  type: 'music_generation' | 'edn_study' | 'quiz_completed' | 'achievement' | 'chat_session';
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ComponentType<any>;
  badge?: string;
  metadata?: any;
}

export const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulation des activités récentes
  useEffect(() => {
    const simulatedActivities: Activity[] = [
      {
        id: '1',
        type: 'music_generation',
        title: 'Musique générée',
        description: 'IC-331 - Arrêt cardio-circulatoire (Rang A)',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
        icon: Music,
        badge: 'IA'
      },
      {
        id: '2',
        type: 'quiz_completed',
        title: 'Quiz terminé',
        description: 'Quiz EDN - Score: 85% (17/20)',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
        icon: Trophy,
        badge: '85%'
      },
      {
        id: '3',
        type: 'edn_study',
        title: 'Item étudié',
        description: 'IC-290 - Épidémiologie des cancers',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4h ago
        icon: BookOpen
      },
      {
        id: '4',
        type: 'achievement',
        title: 'Nouveau badge',
        description: 'Badge "Apprenant Assidu" débloqué',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        icon: Award,
        badge: 'Nouveau'
      },
      {
        id: '5',
        type: 'chat_session',
        title: 'Session IA',
        description: 'Discussion sur les pathologies cardiovasculaires',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        icon: MessageSquare
      }
    ];

    setTimeout(() => {
      setActivities(simulatedActivities);
      setLoading(false);
    }, 500);
  }, []);

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'music_generation':
        return 'text-purple-600 bg-purple-100';
      case 'quiz_completed':
        return 'text-green-600 bg-green-100';
      case 'edn_study':
        return 'text-blue-600 bg-blue-100';
      case 'achievement':
        return 'text-yellow-600 bg-yellow-100';
      case 'chat_session':
        return 'text-indigo-600 bg-indigo-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Activité Récente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Activité Récente
        </CardTitle>
        <Button variant="ghost" size="sm">
          Voir tout
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                <activity.icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm truncate">{activity.title}</h4>
                  {activity.badge && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {activity.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(activity.timestamp, { 
                    addSuffix: true, 
                    locale: fr 
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};