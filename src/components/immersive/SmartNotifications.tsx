import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Sparkles,
  Music,
  Brain,
  Star,
  Gift,
  Zap,
  Heart
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/med-mng/AuthProvider';

interface SmartNotification {
  id: string;
  type: 'achievement' | 'reminder' | 'suggestion' | 'celebration' | 'milestone';
  title: string;
  message: string;
  icon: React.ComponentType<any>;
  color: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action?: {
    label: string;
    onClick: () => void;
  };
  autoClose?: number;
  sound?: boolean;
}

export const SmartNotifications: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Notifications personnalisées selon le contexte
  const generateContextualNotifications = () => {
    const hour = new Date().getHours();
    const contextualNotifs: SmartNotification[] = [];

    // Notification de temps d'étude optimal
    if (hour >= 9 && hour <= 11) {
      contextualNotifs.push({
        id: 'study-time',
        type: 'suggestion',
        title: '🧠 Moment idéal pour étudier !',
        message: 'Votre cerveau est au maximum de ses capacités. C\'est le moment parfait pour une session d\'apprentissage !',
        icon: Brain,
        color: 'from-blue-500 to-cyan-500',
        priority: 'medium',
        action: {
          label: 'Commencer une session',
          onClick: () => window.location.href = '/generator'
        },
        autoClose: 8000,
        sound: true
      });
    }

    // Félicitations de progression
    if (user) {
      contextualNotifs.push({
        id: 'progress-celebration',
        type: 'celebration',
        title: '🎉 Incroyable progression !',
        message: 'Vous avez maîtrisé 3 nouveaux items EDN cette semaine. Vous êtes sur la bonne voie !',
        icon: Star,
        color: 'from-yellow-400 to-orange-500',
        priority: 'high',
        action: {
          label: 'Voir mes stats',
          onClick: () => window.location.href = '/analytics'
        },
        autoClose: 10000,
        sound: true
      });
    }

    // Suggestion personnalisée
    contextualNotifs.push({
      id: 'personalized-tip',
      type: 'suggestion',
      title: '✨ Conseil personnalisé',
      message: 'Basé sur votre style d\'apprentissage, essayez le style Jazz pour votre prochain item de cardiologie !',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      priority: 'medium',
      action: {
        label: 'Essayer maintenant',
        onClick: () => window.location.href = '/generator?style=jazz&category=cardiology'
      },
      autoClose: 12000
    });

    return contextualNotifs;
  };

  // Ajouter des notifications contextuelles
  useEffect(() => {
    const timer = setTimeout(() => {
      const newNotifications = generateContextualNotifications();
      setNotifications(prev => [...prev, ...newNotifications.slice(0, 1)]);
    }, 3000);

    // Ajouter périodiquement de nouvelles notifications
    const interval = setInterval(() => {
      const contextual = generateContextualNotifications();
      if (contextual.length > 0 && notifications.length < 3) {
        const randomNotif = contextual[Math.floor(Math.random() * contextual.length)];
        setNotifications(prev => {
          const exists = prev.some(n => n.id === randomNotif.id);
          return exists ? prev : [...prev, randomNotif];
        });
      }
    }, 45000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [user, notifications.length]);

  // Auto-suppression des notifications
  useEffect(() => {
    notifications.forEach(notif => {
      if (notif.autoClose) {
        const timer = setTimeout(() => {
          removeNotification(notif.id);
        }, notif.autoClose);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationClick = (notification: SmartNotification) => {
    if (notification.action) {
      notification.action.onClick();
    }
    removeNotification(notification.id);
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'urgent': 
        return 'border-red-300 bg-red-50 animate-pulse';
      case 'high': 
        return 'border-orange-300 bg-orange-50 shadow-lg';
      case 'medium': 
        return 'border-blue-300 bg-blue-50';
      default: 
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string, IconComponent: React.ComponentType<any>) => {
    const baseClasses = "h-5 w-5";
    switch (type) {
      case 'achievement':
        return <Star className={`${baseClasses} text-yellow-500`} />;
      case 'celebration':
        return <Sparkles className={`${baseClasses} text-purple-500`} />;
      case 'reminder':
        return <Bell className={`${baseClasses} text-blue-500`} />;
      case 'milestone':
        return <Zap className={`${baseClasses} text-orange-500`} />;
      default:
        return <IconComponent className={`${baseClasses} text-gray-500`} />;
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 left-4 z-50 space-y-3 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: index * 0.1 
            }}
            layout
          >
            <Card 
              className={`
                relative overflow-hidden cursor-pointer 
                transition-all duration-300 hover:scale-105 
                ${getPriorityStyles(notification.priority)}
              `}
              onClick={() => handleNotificationClick(notification)}
            >
              {/* Barre de couleur */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${notification.color}`} />
              
              {/* Effet de brillance pour notifications importantes */}
              {notification.priority === 'high' || notification.priority === 'urgent' ? (
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 animate-pulse" />
              ) : null}
              
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full bg-gradient-to-r ${notification.color} text-white flex-shrink-0`}>
                    {getTypeIcon(notification.type, notification.icon)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1 leading-tight">
                      {notification.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      {notification.action && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            notification.action!.onClick();
                            removeNotification(notification.id);
                          }}
                        >
                          {notification.action.label}
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Barre de progression pour auto-close */}
                {notification.autoClose && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${notification.color}`}
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: notification.autoClose / 1000, ease: "linear" }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};