import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Music, 
  BookOpen, 
  MessageSquare, 
  Users, 
  Play,
  Heart,
  Star,
  Zap,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActivityItem {
  id: string;
  type: 'music_generated' | 'edn_studied' | 'ecos_completed' | 'chat_session' | 'achievement';
  user: string;
  action: string;
  time: string;
  details?: string;
  icon: React.ComponentType<any>;
  color: string;
}

export const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'music_generated',
      user: 'Marie D.',
      action: 'a généré une musique pour IC-103 Vertige',
      time: 'Il y a 2 min',
      details: 'Style: Pop',
      icon: Music,
      color: 'text-purple-500'
    },
    {
      id: '2', 
      type: 'edn_studied',
      user: 'Thomas L.',
      action: 'a étudié IC-230 Insuffisance cardiaque',
      time: 'Il y a 5 min',
      details: 'Score: 95%',
      icon: BookOpen,
      color: 'text-blue-500'
    },
    {
      id: '3',
      type: 'ecos_completed',
      user: 'Sophie M.',
      action: 'a terminé le scénario Douleur thoracique',
      time: 'Il y a 8 min', 
      details: 'Score: 87%',
      icon: Users,
      color: 'text-green-500'
    },
    {
      id: '4',
      type: 'chat_session',
      user: 'Pierre R.',
      action: 'a posé une question sur la cardiologie',
      time: 'Il y a 12 min',
      details: 'Assistant IA',
      icon: MessageSquare,
      color: 'text-orange-500'
    },
    {
      id: '5',
      type: 'achievement',
      user: 'Emma B.',
      action: 'a débloqué "Maître EDN Cardiologie"',
      time: 'Il y a 15 min',
      details: '25 items complétés',
      icon: Star,
      color: 'text-yellow-500'
    }
  ]);

  // Simulation d'ajout d'activités en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        type: 'music_generated',
        user: ['Alice L.', 'Bob M.', 'Claire D.', 'David R.'][Math.floor(Math.random() * 4)],
        action: `a généré une musique pour IC-${Math.floor(Math.random() * 367 + 1).toString().padStart(3, '0')}`,
        time: 'À l\'instant',
        details: ['Pop', 'Rock', 'Jazz', 'Electronic'][Math.floor(Math.random() * 4)],
        icon: Music,
        color: 'text-purple-500'
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'music_generated': return 'bg-purple-100 text-purple-800';
      case 'edn_studied': return 'bg-blue-100 text-blue-800';
      case 'ecos_completed': return 'bg-green-100 text-green-800';
      case 'chat_session': return 'bg-orange-100 text-orange-800';
      case 'achievement': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-400" />
          Activité en temps réel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {activities.map((activity, index) => {
            const IconComponent = activity.icon;
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Avatar className="h-8 w-8 bg-white/20 backdrop-blur-sm">
                  <AvatarFallback className="text-xs text-white/80 bg-transparent">
                    {getInitials(activity.user)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent className={`h-4 w-4 ${activity.color}`} />
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getActivityColor(activity.type)} border-0`}
                    >
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-white/90 leading-tight">
                    <span className="font-medium">{activity.user}</span>{' '}
                    {activity.action}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-white/60 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </span>
                    {activity.details && (
                      <span className="text-xs text-white/60">
                        {activity.details}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};