import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Activity, User, BookOpen, Music, Trophy, Heart,
  MessageSquare, Share, Clock, TrendingUp, Zap,
  CheckCircle, AlertTriangle, Info, Star
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface ActivityItem {
  id: string;
  type: 'achievement' | 'learning' | 'social' | 'system' | 'creation' | 'milestone';
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  metadata?: {
    points?: number;
    badge?: string;
    category?: string;
    difficulty?: string;
    progress?: number;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionable?: boolean;
  relatedItems?: string[];
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  showFilter?: boolean;
  maxItems?: number;
  compact?: boolean;
  realTime?: boolean;
}

/**
 * Flux d'activité en temps réel pour engagement utilisateur - Données Supabase
 */
export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities: initialActivities,
  showFilter = true,
  maxItems = 20,
  compact = false,
  realTime = true
}) => {
  const [activities, setActivities] = useState(initialActivities);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Charger les activités réelles depuis Supabase
  useEffect(() => {
    const loadRealActivities = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: activityLogs, error } = await supabase
          .from('user_activity_log')
          .select('id, action_type, action_details, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(maxItems);

        if (error || !activityLogs) return;

        const mappedActivities: ActivityItem[] = activityLogs.map((log: any) => {
          const details = log.action_details || {};
          return {
            id: log.id,
            type: mapActionTypeToActivityType(log.action_type),
            title: mapActionTypeToTitle(log.action_type),
            description: details.description || `Action: ${log.action_type}`,
            timestamp: new Date(log.created_at),
            priority: details.priority || 'medium',
            metadata: {
              points: details.points,
              badge: details.badge,
              category: details.category
            },
            actionable: false
          };
        });

        if (mappedActivities.length > 0) {
          setActivities(mappedActivities);
        }
      } catch (error) {
        console.error('Erreur chargement activités:', error);
      }
    };

    loadRealActivities();

    // Abonnement temps réel aux nouvelles activités
    if (realTime) {
      const channel = supabase
        .channel('activity-feed')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'user_activity_log'
        }, (payload) => {
          const log = payload.new;
          const details = (log as any).action_details || {};
          const newActivity: ActivityItem = {
            id: log.id,
            type: mapActionTypeToActivityType((log as any).action_type),
            title: mapActionTypeToTitle((log as any).action_type),
            description: details.description || `Action: ${(log as any).action_type}`,
            timestamp: new Date((log as any).created_at),
            priority: details.priority || 'medium',
            metadata: { points: details.points, badge: details.badge, category: details.category },
            actionable: false
          };
          setActivities(prev => [newActivity, ...prev.slice(0, maxItems - 1)]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [realTime, maxItems]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'achievement': return Trophy;
      case 'learning': return BookOpen;
      case 'social': return MessageSquare;
      case 'system': return Info;
      case 'creation': return Music;
      case 'milestone': return Star;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'text-warning';
      case 'learning': return 'text-primary';
      case 'social': return 'text-success';
      case 'system': return 'text-muted-foreground';
      case 'creation': return 'text-accent';
      case 'milestone': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  }).slice(0, maxItems);

  const filterOptions = [
    { value: 'all', label: 'Toutes', icon: Activity },
    { value: 'achievement', label: 'Succès', icon: Trophy },
    { value: 'learning', label: 'Apprentissage', icon: BookOpen },
    { value: 'social', label: 'Social', icon: MessageSquare },
    { value: 'creation', label: 'Créations', icon: Music }
  ];

  return (
    <Card className="medical-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activité Récente
            {realTime && (
              <Badge variant="outline" className="ml-2">
                <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse" />
                En direct
              </Badge>
            )}
          </CardTitle>
          
          {showFilter && (
            <div className="flex gap-1">
              {filterOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={filter === option.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(option.value)}
                    className="h-8"
                  >
                    <IconComponent className="w-3 h-3 mr-1" />
                    {!compact && option.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Aucune activité récente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              
              return (
                <div
                  key={activity.id}
                  className={`flex gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                    activity.priority === 'urgent' ? 'border-destructive/50 bg-destructive/5' : ''
                  }`}
                >
                  {/* Avatar ou icône */}
                  <div className="flex-shrink-0">
                    {activity.user ? (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback>
                          {activity.user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${getActivityColor(activity.type)}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {activity.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.description}
                        </p>
                        
                        {/* Métadonnées */}
                        {activity.metadata && (
                          <div className="flex items-center gap-2 mt-2">
                            {activity.metadata.points && (
                              <Badge variant="secondary" className="text-xs">
                                +{activity.metadata.points} pts
                              </Badge>
                            )}
                            {activity.metadata.badge && (
                              <Badge variant="outline" className="text-xs">
                                🏆 {activity.metadata.badge}
                              </Badge>
                            )}
                            {activity.metadata.category && (
                              <Badge variant="outline" className="text-xs">
                                {activity.metadata.category}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={getPriorityVariant(activity.priority)} className="text-xs">
                          {activity.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(activity.timestamp, { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    {activity.actionable && (
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="h-6 text-xs">
                          <Heart className="w-3 h-3 mr-1" />
                          Réagir
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 text-xs">
                          <Share className="w-3 h-3 mr-1" />
                          Partager
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredActivities.length > 0 && (
          <div className="text-center pt-4 border-t">
            <Button variant="ghost" size="sm" className="text-xs">
              Voir plus d'activités
              <TrendingUp className="w-3 h-3 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Fonctions utilitaires pour mapper les types d'action
function mapActionTypeToActivityType(actionType: string): ActivityItem['type'] {
  const typeMap: Record<string, ActivityItem['type']> = {
    'badge_earned': 'achievement',
    'item_completed': 'learning',
    'quiz_completed': 'learning',
    'music_generated': 'creation',
    'content_created': 'creation',
    'post_liked': 'social',
    'comment_added': 'social',
    'milestone_reached': 'milestone',
    'system_notification': 'system'
  };
  return typeMap[actionType] || 'system';
}

function mapActionTypeToTitle(actionType: string): string {
  const titleMap: Record<string, string> = {
    'badge_earned': 'Nouveau badge débloqué !',
    'item_completed': 'Item EDN complété',
    'quiz_completed': 'Quiz terminé',
    'music_generated': 'Musique générée',
    'content_created': 'Contenu créé',
    'post_liked': 'Nouveau like reçu',
    'comment_added': 'Nouveau commentaire',
    'milestone_reached': 'Objectif atteint !',
    'system_notification': 'Notification système'
  };
  return titleMap[actionType] || 'Activité';
}