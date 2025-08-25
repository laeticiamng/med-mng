import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle, 
  Trophy, 
  Music, 
  BookOpen, 
  Users,
  Settings,
  X,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const NotificationCenter = () => {
  const [notifications] = useState([
    {
      id: '1',
      type: 'achievement',
      title: 'Nouveau Badge Débloqué !',
      description: 'Félicitations ! Vous avez obtenu le badge "Maître de Cardiologie"',
      time: 'Il y a 5 minutes',
      priority: 'high',
      read: false,
      icon: Trophy
    },
    {
      id: '2',
      type: 'reminder',
      title: 'Session d\'étude recommandée',
      description: 'Il est temps de réviser ! Item IC-91 vous attend.',
      time: 'Il y a 30 minutes',
      priority: 'medium',
      read: false,
      icon: Clock
    }
  ]);

  return (
    <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Centre de Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map((notification) => (
          <div key={notification.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                <notification.icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm">{notification.title}</h4>
                <p className="text-gray-400 text-xs">{notification.description}</p>
                <span className="text-xs text-gray-500">{notification.time}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};