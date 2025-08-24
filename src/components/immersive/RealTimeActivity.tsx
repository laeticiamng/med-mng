import React, { useState, useEffect } from 'react';
import { Activity, Users, Headphones, Clock, TrendingUp, Star } from 'lucide-react';
import { ImmersiveCard } from './ImmersiveCard';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ActivityItem {
  id: string;
  type: 'listen' | 'complete' | 'share' | 'achievement';
  user: {
    name: string;
    avatar?: string;
    level: number;
  };
  content: {
    title: string;
    category?: string;
  };
  timestamp: Date;
  metadata?: {
    duration?: number;
    score?: number;
    streak?: number;
  };
}

interface RealTimeActivityProps {
  activities: ActivityItem[];
  maxItems?: number;
  showLiveIndicator?: boolean;
  className?: string;
}

export const RealTimeActivity: React.FC<RealTimeActivityProps> = ({
  activities,
  maxItems = 10,
  showLiveIndicator = true,
  className = ''
}) => {
  const [visibleActivities, setVisibleActivities] = useState<ActivityItem[]>([]);
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setLiveCount(prev => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setVisibleActivities(activities.slice(0, maxItems));
  }, [activities, maxItems]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'listen': return <Headphones className="h-4 w-4 text-blue-400" />;
      case 'complete': return <Star className="h-4 w-4 text-green-400" />;
      case 'share': return <Users className="h-4 w-4 text-purple-400" />;
      case 'achievement': return <TrendingUp className="h-4 w-4 text-orange-400" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActivityMessage = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'listen':
        return `écoute "${activity.content.title}"`;
      case 'complete':
        return `a terminé "${activity.content.title}"`;
      case 'share':
        return `a partagé "${activity.content.title}"`;
      case 'achievement':
        return `a débloqué un achievement sur "${activity.content.title}"`;
      default:
        return `interagit avec "${activity.content.title}"`;
    }
  };

  const getRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'listen': return 'border-blue-400/30 bg-blue-500/10';
      case 'complete': return 'border-green-400/30 bg-green-500/10';
      case 'share': return 'border-purple-400/30 bg-purple-500/10';
      case 'achievement': return 'border-orange-400/30 bg-orange-500/10';
      default: return 'border-gray-400/30 bg-gray-500/10';
    }
  };

  return (
    <div className={className}>
      <ImmersiveCard 
        variant="glass" 
        glow="blue"
        className="max-h-96 overflow-hidden"
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activité en temps réel
            </h3>
            
            {showLiveIndicator && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-medium">
                  Live ({liveCount} utilisateurs)
                </span>
              </div>
            )}
          </div>

          {/* Activities List */}
          <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
            {visibleActivities.map((activity, index) => (
              <div
                key={activity.id}
                className={`p-3 rounded-lg border ${getActivityColor(activity.type)} hover:bg-white/5 transition-all duration-200 animate-slide-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <Avatar className="w-8 h-8">
                      {activity.user.avatar ? (
                        <img 
                          src={activity.user.avatar} 
                          alt={activity.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
                          {activity.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium text-sm truncate">
                        {activity.user.name}
                      </span>
                      <Badge variant="outline" className="text-xs bg-white/10 border-white/20">
                        Niv. {activity.user.level}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {getActivityMessage(activity)}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getRelativeTime(activity.timestamp)}
                        </span>
                        
                        {activity.content.category && (
                          <span className="px-2 py-0.5 bg-white/10 rounded-full">
                            {activity.content.category}
                          </span>
                        )}
                      </div>
                      
                      {/* Metadata */}
                      {activity.metadata && (
                        <div className="flex items-center gap-2 text-xs">
                          {activity.metadata.duration && (
                            <span className="text-blue-400">
                              {Math.floor(activity.metadata.duration / 60)}min
                            </span>
                          )}
                          {activity.metadata.score && (
                            <span className="text-green-400">
                              {activity.metadata.score}%
                            </span>
                          )}
                          {activity.metadata.streak && (
                            <span className="text-orange-400">
                              🔥{activity.metadata.streak}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {activities.length > maxItems && (
            <div className="text-center pt-2 border-t border-white/10">
              <span className="text-xs text-gray-400">
                Et {activities.length - maxItems} autres activités...
              </span>
            </div>
          )}
        </div>
      </ImmersiveCard>
    </div>
  );
};