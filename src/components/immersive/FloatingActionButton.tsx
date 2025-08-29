import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Music, 
  Brain, 
  Stethoscope, 
  Sparkles, 
  Zap, 
  Heart,
  Star,
  Wand2,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface FloatingAction {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  description: string;
  route: string;
  color: string;
  badge?: string;
  requiresAuth?: boolean;
  special?: boolean;
}

export const FloatingActionButton: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [pulse, setPulse] = useState(false);

  const actions: FloatingAction[] = [
    {
      id: 'generate',
      icon: Wand2,
      label: 'Générateur IA',
      description: 'Créer une musique médicale',
      route: '/generator',
      color: 'from-purple-500 to-pink-500',
      badge: '✨ Magique',
      special: true
    },
    {
      id: 'chat',
      icon: MessageCircle,
      label: 'Assistant IA',
      description: 'Poser une question',
      route: '/med-chat',
      color: 'from-orange-500 to-red-500',
      badge: '🧠 Smart'
    },
    {
      id: 'ecos',
      icon: Stethoscope,
      label: 'Simulation ECOS',
      description: 'Cas clinique immersif',
      route: '/ecos',
      color: 'from-green-500 to-emerald-500',
      badge: '🎯 Pro'
    },
    {
      id: 'library',
      icon: Music,
      label: 'Ma Bibliothèque',
      description: 'Mes créations musicales',
      route: '/library',
      color: 'from-blue-500 to-cyan-500',
      requiresAuth: true
    }
  ];

  // Effet de pulsation périodique
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 1000);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleActionClick = (action: FloatingAction) => {
    if (action.requiresAuth && !user) {
      toast({
        title: "🔐 Connexion requise",
        description: `Connectez-vous pour accéder à ${action.label}`,
      });
      return;
    }

    navigate(action.route);
    setIsExpanded(false);

    // Animation de réussite
    toast({
      title: `✨ ${action.label}`,
      description: action.description,
    });
  };

  const mainButtonVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: 180, transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
    pulse: pulse ? { 
      scale: [1, 1.2, 1], 
      boxShadow: [
        "0 0 0 0 rgba(168, 85, 247, 0.4)",
        "0 0 0 20px rgba(168, 85, 247, 0)",
        "0 0 0 0 rgba(168, 85, 247, 0)"
      ],
      transition: { duration: 1 }
    } : {}
  };

  const actionVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0,
      y: 20,
      transition: { duration: 0.2 }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        type: "spring" as const,
        stiffness: 200,
        damping: 15
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Actions secondaires */}
      <AnimatePresence>
        {isExpanded && (
          <div className="absolute bottom-20 right-0 space-y-3">
            {actions.map((action, index) => (
                <motion.div
                key={action.id}
                variants={actionVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex items-center gap-3">
                  {/* Tooltip */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="bg-background/95 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-lg"
                  >
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{action.label}</h4>
                      {action.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </motion.div>

                  {/* Action Button */}
                  <motion.button
                    className={`
                      relative w-12 h-12 rounded-full p-0 overflow-hidden
                      bg-gradient-to-r ${action.color} 
                      hover:shadow-lg hover:shadow-purple-500/25
                      transition-all duration-300 border-none cursor-pointer
                      ${action.special ? 'ring-2 ring-purple-300 ring-opacity-50' : ''}
                    `}
                    onClick={() => handleActionClick(action)}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {action.special && (
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-pink-400/20 animate-pulse" />
                    )}
                    <action.icon className="h-5 w-5 text-white relative z-10" />
                    
                    {action.special && (
                      <div className="absolute -top-1 -right-1">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce">
                          <Sparkles className="h-2 w-2 text-yellow-700 m-0.5" />
                        </div>
                      </div>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Bouton principal */}
      <motion.div
        variants={mainButtonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        animate={pulse ? "pulse" : "initial"}
        className="relative"
      >
        <Button
          size="lg"
          className={`
            w-16 h-16 rounded-full p-0 shadow-2xl
            bg-gradient-to-r from-purple-600 to-pink-600
            hover:from-purple-700 hover:to-pink-700
            border-4 border-white/20
            transition-all duration-300
            ${isExpanded ? 'rotate-45' : ''}
          `}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="relative">
            <Plus className={`h-8 w-8 text-white transition-transform duration-300 ${isExpanded ? 'rotate-45' : ''}`} />
            
            {/* Effet brillant */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -skew-x-12 animate-shimmer" />
          </div>
        </Button>

        {/* Indicateur de notifications */}
        <div className="absolute -top-2 -right-2">
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce">
            3
          </div>
        </div>

        {/* Cercles d'animation */}
        <div className="absolute inset-0 rounded-full animate-ping bg-purple-400 opacity-20" />
        <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-r from-purple-400 to-pink-400 opacity-10" />
      </motion.div>

      {/* Message d'encouragement */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-12 right-0 bg-background/95 backdrop-blur-sm border rounded-lg px-3 py-1 shadow-lg pointer-events-none"
          >
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Heart className="h-3 w-3 text-red-400" />
              Créez quelque chose d'incroyable !
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};