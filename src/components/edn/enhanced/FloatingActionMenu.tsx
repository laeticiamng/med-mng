import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Lightbulb, 
  Settings, 
  Bookmark, 
  Share2, 
  Download,
  RefreshCw,
  Zap
} from 'lucide-react';

interface FloatingActionMenuProps {
  onAction?: (action: string) => void;
  soundEnabled?: boolean;
  onSoundToggle?: () => void;
  className?: string;
}

export const FloatingActionMenu = ({
  onAction,
  soundEnabled = true,
  onSoundToggle,
  className = ''
}: FloatingActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const { toast } = useToast();

  const actions = [
    {
      id: 'bookmark',
      label: 'Marquer',
      icon: Bookmark,
      color: 'from-yellow-400 to-orange-500',
      description: 'Marquer comme favori'
    },
    {
      id: 'share',
      label: 'Partager',
      icon: Share2,
      color: 'from-blue-400 to-cyan-500',
      description: 'Partager ce module'
    },
    {
      id: 'download',
      label: 'Télécharger',
      icon: Download,
      color: 'from-green-400 to-emerald-500',
      description: 'Télécharger le contenu'
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: BookOpen,
      color: 'from-purple-400 to-violet-500',
      description: 'Prendre des notes'
    },
    {
      id: 'help',
      label: 'Aide',
      icon: Lightbulb,
      color: 'from-amber-400 to-yellow-500',
      description: 'Obtenir de l\'aide'
    },
    {
      id: 'refresh',
      label: 'Actualiser',
      icon: RefreshCw,
      color: 'from-indigo-400 to-blue-500',
      description: 'Actualiser le contenu'
    }
  ];

  const handleAction = (actionId: string) => {
    setActiveAction(actionId);
    
    // Animation de feedback
    setTimeout(() => setActiveAction(null), 200);
    
    // Exécuter l'action
    onAction?.(actionId);
    
    const action = actions.find(a => a.id === actionId);
    if (action) {
      toast({
        title: `${action.label}`,
        description: action.description,
        duration: 2000
      });
    }
    
    // Fermer le menu après l'action
    setTimeout(() => setIsOpen(false), 500);
  };

  const mainButtonVariants = {
    closed: { 
      rotate: 0,
      scale: 1
    },
    open: { 
      rotate: 45,
      scale: 1.1
    }
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      scale: 0,
      transition: {
        duration: 0.2
      }
    },
    open: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        type: "spring" as const,
        stiffness: 300,
        damping: 25
      }
    }
  };

  const actionButtonVariants = {
    closed: { 
      scale: 0,
      y: 20,
      opacity: 0
    },
    open: (i: number) => ({
      scale: 1,
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.05,
        type: "spring" as const,
        stiffness: 300,
        damping: 20
      }
    })
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Menu des actions */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="absolute bottom-20 right-0 origin-bottom-right"
          >
            <Card className="p-4 bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
              <div className="space-y-3">
                {/* Contrôle du son */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSoundToggle}
                    className="w-full justify-start gap-3 h-12"
                  >
                    {soundEnabled ? (
                      <Volume2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">
                      Son {soundEnabled ? 'activé' : 'désactivé'}
                    </span>
                  </Button>
                </motion.div>

                <div className="border-t border-border/50 pt-3">
                  <div className="grid grid-cols-2 gap-2">
                    {actions.map((action, index) => {
                      const IconComponent = action.icon;
                      const isActive = activeAction === action.id;
                      
                      return (
                        <motion.div
                          key={action.id}
                          custom={index}
                          variants={actionButtonVariants}
                          initial="closed"
                          animate="open"
                          exit="closed"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(action.id)}
                            className={`w-full h-16 flex flex-col gap-1 p-2 relative overflow-hidden ${
                              isActive ? 'bg-primary/10' : ''
                            }`}
                          >
                            <motion.div
                              className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}
                              animate={isActive ? { 
                                scale: [1, 1.2, 1],
                                rotate: [0, 360, 0]
                              } : {}}
                              transition={{ duration: 0.5 }}
                            >
                              <IconComponent className="h-4 w-4 text-white" />
                            </motion.div>
                            <span className="text-xs font-medium">
                              {action.label}
                            </span>

                            {/* Effet de pulsation pour l'action active */}
                            {isActive && (
                              <motion.div
                                className="absolute inset-0 bg-primary/20 rounded-lg"
                                animate={{ 
                                  scale: [0, 1, 0],
                                  opacity: [0, 0.5, 0]
                                }}
                                transition={{ duration: 0.6 }}
                              />
                            )}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Raccourcis clavier */}
                <div className="border-t border-border/50 pt-3">
                  <div className="text-xs text-muted-foreground text-center mb-2">
                    Raccourcis clavier
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    <Badge variant="outline" className="text-xs">
                      <span className="font-mono">Esc</span> - Fermer
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <span className="font-mono">?</span> - Aide
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton principal */}
      <motion.div
        variants={mainButtonVariants}
        animate={isOpen ? "open" : "closed"}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          size="lg"
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-primary via-purple-600 to-pink-600 hover:from-primary/90 hover:via-purple-600/90 hover:to-pink-600/90 shadow-2xl border-0"
        >
          <Plus className="h-6 w-6 text-white" />
        </Button>
      </motion.div>

      {/* Indicateur de notifications */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center"
      >
        <Zap className="h-3 w-3 text-white" />
      </motion.div>

      {/* Effet de pulsation périodique */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-purple-600/20 to-pink-600/20"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0, 0.5]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};