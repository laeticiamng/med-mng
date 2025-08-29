import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Gift,
  Music,
  BookOpen,
  Users,
  Trophy,
  Star,
  Clock,
  ExternalLink,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface SmartNotification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'gift' | 'achievement' | 'social' | 'study';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  action?: {
    label: string;
    url: string;
  };
  metadata?: {
    progress?: number;
    category?: string;
    user?: string;
  };
}

const generateSmartNotifications = (): SmartNotification[] => {
  const now = new Date();
  
  return [
    {
      id: '1',
      type: 'achievement',
      title: '🏆 Nouveau Succès Débloqué !',
      message: 'Vous avez terminé 10 items EDN cette semaine. Objectif "Étudiant Assidu" atteint !',
      timestamp: new Date(now.getTime() - 5 * 60000), // 5 min ago
      isRead: false,
      priority: 'high',
      action: {
        label: 'Voir Succès',
        url: '/dashboard'
      },
      metadata: {
        progress: 100,
        category: 'Étude'
      }
    },
    {
      id: '2',
      type: 'study',
      title: '📚 Rappel Personnalisé',
      message: 'Il est temps de réviser IC-230 Insuffisance Cardiaque. Votre courbe d\'oubli indique un moment optimal.',
      timestamp: new Date(now.getTime() - 15 * 60000), // 15 min ago
      isRead: false,
      priority: 'high',
      action: {
        label: 'Réviser Maintenant',
        url: '/edn/IC-230'
      },
      metadata: {
        progress: 65,
        category: 'Cardiologie'
      }
    },
    {
      id: '3',
      type: 'social',
      title: '👥 Nouvelle Discussion',
      message: 'Marie Dubois a partagé une astuce sur "Diagnostic différentiel de la dyspnée" dans votre groupe.',
      timestamp: new Date(now.getTime() - 45 * 60000), // 45 min ago
      isRead: false,
      priority: 'medium',
      action: {
        label: 'Voir Discussion',
        url: '/med-mng/community'
      },
      metadata: {
        user: 'Marie D.',
        category: 'Pneumologie'
      }
    },
    {
      id: '4',
      type: 'gift',
      title: '🎁 Bonus Premium Gratuit',
      message: 'Félicitations ! Vous avez gagné 3 générations musicales bonus pour votre régularité.',
      timestamp: new Date(now.getTime() - 2 * 3600000), // 2h ago
      isRead: false,
      priority: 'medium',
      action: {
        label: 'Utiliser Bonus',
        url: '/generator'
      }
    },
    {
      id: '5',
      type: 'info',
      title: '🆕 Nouvelle Fonctionnalité',
      message: 'L\'assistant IA peut maintenant générer des fiches de révision personnalisées basées sur vos difficultés.',
      timestamp: new Date(now.getTime() - 4 * 3600000), // 4h ago
      isRead: true,
      priority: 'low',
      action: {
        label: 'Découvrir',
        url: '/chat'
      }
    },
    {
      id: '6',
      type: 'warning',
      title: '⚠️ Objectif en Retard',
      message: 'Votre objectif "20 ECOS ce mois" prend du retard. Il vous reste 12 jours pour 8 simulations.',
      timestamp: new Date(now.getTime() - 6 * 3600000), // 6h ago
      isRead: true,
      priority: 'medium',
      action: {
        label: 'Rattraper',
        url: '/ecos'
      },
      metadata: {
        progress: 60,
        category: 'Objectifs'
      }
    },
    {
      id: '7',
      type: 'success',
      title: '✅ Playlist Complétée',
      message: 'Vous avez écouté toutes les musiques de la playlist "Cardiologie Essentielle". Bravo !',
      timestamp: new Date(now.getTime() - 24 * 3600000), // 1 day ago
      isRead: true,
      priority: 'low',
      action: {
        label: 'Nouvelle Playlist',
        url: '/med-mng/playlists'
      },
      metadata: {
        progress: 100,
        category: 'Musique'
      }
    }
  ];
};

export const SmartNotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setNotifications(generateSmartNotifications());
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const getNotificationIcon = (type: SmartNotification['type']) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      case 'gift': return Gift;
      case 'achievement': return Trophy;
      case 'social': return Users;
      case 'study': return BookOpen;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: SmartNotification['type']) => {
    switch (type) {
      case 'success': return 'from-green-500 to-emerald-600';
      case 'warning': return 'from-orange-500 to-red-600';
      case 'info': return 'from-blue-500 to-cyan-600';
      case 'gift': return 'from-purple-500 to-pink-600';
      case 'achievement': return 'from-yellow-500 to-orange-600';
      case 'social': return 'from-indigo-500 to-purple-600';
      case 'study': return 'from-teal-500 to-blue-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification supprimée');
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('Toutes les notifications marquées comme lues');
  };

  const handleNotificationClick = (notification: SmartNotification) => {
    markAsRead(notification.id);
    if (notification.action) {
      navigate(notification.action.url);
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications.filter(n => n.type === filter);

  const typeFilters = [
    { key: 'all', label: 'Toutes', count: notifications.length },
    { key: 'unread', label: 'Non lues', count: unreadCount },
    { key: 'achievement', label: 'Succès', count: notifications.filter(n => n.type === 'achievement').length },
    { key: 'study', label: 'Études', count: notifications.filter(n => n.type === 'study').length },
    { key: 'social', label: 'Social', count: notifications.filter(n => n.type === 'social').length }
  ];

  if (!isExpanded) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="relative bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl backdrop-blur-sm"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[1.2rem] h-5 rounded-full flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-4 right-4 z-50"
    >
      <Card className="w-96 max-h-[80vh] bg-gradient-to-br from-black/95 to-gray-900/95 backdrop-blur-xl border-white/10 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Notifications Intelligentes</h3>
              <p className="text-xs text-white/60">{unreadCount} non lues</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={markAllAsRead}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(false)}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-3 border-b border-white/10">
          <div className="flex flex-wrap gap-1">
            {typeFilters.map((filterOption) => {
              const isSelected = filter === filterOption.key;
              
              return (
                <Button
                  key={filterOption.key}
                  variant={isSelected ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setFilter(filterOption.key)}
                  className={`text-xs ${isSelected 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {filterOption.label}
                  {filterOption.count > 0 && (
                    <Badge variant="outline" className="ml-1 text-xs bg-white/10 border-white/20">
                      {filterOption.count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Notifications */}
        <ScrollArea className="max-h-96">
          <div className="p-2">
            <AnimatePresence>
              {filteredNotifications.map((notification, index) => {
                const IconComponent = getNotificationIcon(notification.type);
                const color = getNotificationColor(notification.type);
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-xl mb-2 cursor-pointer transition-all duration-200 ${
                      notification.isRead 
                        ? 'bg-white/5 hover:bg-white/10' 
                        : 'bg-white/10 hover:bg-white/15 border border-white/20'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${color} flex-shrink-0`}>
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className={`font-medium text-sm ${
                            notification.isRead ? 'text-white/80' : 'text-white'
                          } truncate`}>
                            {notification.title}
                          </h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="h-6 w-6 p-0 text-white/40 hover:text-white/70"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <p className={`text-xs mb-2 ${
                          notification.isRead ? 'text-white/60' : 'text-white/80'
                        } line-clamp-2`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-white/50">
                            <Clock className="w-3 h-3" />
                            {notification.timestamp.toLocaleTimeString()}
                          </div>
                          
                          {notification.action && (
                            <Button
                              size="sm"
                              className="h-6 text-xs bg-white/10 hover:bg-white/20 text-white border-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(notification);
                              }}
                            >
                              {notification.action.label}
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                        </div>
                        
                        {notification.metadata?.progress && (
                          <div className="mt-2">
                            <div className="w-full bg-white/10 rounded-full h-1">
                              <div 
                                className={`h-1 rounded-full bg-gradient-to-r ${color}`}
                                style={{ width: `${notification.metadata.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {filteredNotifications.length === 0 && (
              <div className="text-center py-8 text-white/60">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune notification</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Footer */}
        <div className="p-3 border-t border-white/10">
          <Button
            size="sm"
            variant="ghost"
            className="w-full text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => navigate('/med-mng/settings')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Gérer les Notifications
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};