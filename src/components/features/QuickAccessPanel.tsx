import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  BookOpen, 
  Music, 
  Users, 
  BarChart3,
  MessageSquare,
  Settings,
  Star,
  Clock,
  TrendingUp,
  Globe,
  ChevronRight,
  X
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ComponentType<any>;
  color: string;
  isNew?: boolean;
  isPremium?: boolean;
  isPopular?: boolean;
  category: 'frequent' | 'new' | 'premium';
  shortcut?: string;
}

const quickActions: QuickAction[] = [
  // Actions fréquentes
  {
    id: 'edn',
    title: 'Items EDN',
    description: 'Accéder aux 367 items de connaissances',
    path: '/edn',
    icon: BookOpen,
    color: 'from-blue-500 to-cyan-600',
    category: 'frequent',
    isPopular: true,
    shortcut: '1'
  },
  {
    id: 'generator',
    title: 'Générateur IA',
    description: 'Créer une musique éducative',
    path: '/generator',
    icon: Music,
    color: 'from-purple-500 to-pink-600',
    category: 'premium',
    isPremium: true,
    shortcut: '2'
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Vue d\'ensemble complète',
    path: '/dashboard',
    icon: BarChart3,
    color: 'from-green-500 to-emerald-600',
    category: 'frequent',
    shortcut: '3'
  },
  
  // Nouvelles fonctionnalités
  {
    id: 'chat',
    title: 'Assistant IA',
    description: 'Chat médical intelligent',
    path: '/chat',
    icon: MessageSquare,
    color: 'from-orange-500 to-red-600',
    category: 'new',
    isNew: true,
    shortcut: '4'
  },
  {
    id: 'community',
    title: 'Communauté',
    description: 'Rejoindre le réseau social',
    path: '/community',
    icon: Users,
    color: 'from-teal-500 to-cyan-600',
    category: 'frequent',
    shortcut: '5'
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Voir mes performances',
    path: '/analytics',
    icon: TrendingUp,
    color: 'from-indigo-500 to-purple-600',
    category: 'frequent',
    shortcut: '6'
  },
  
  // Premium
  {
    id: 'med-mng-create',
    title: 'Studio MED-MNG',
    description: 'Studio de création musicale',
    path: '/med-mng/create',
    icon: Music,
    color: 'from-yellow-500 to-orange-600',
    category: 'premium',
    isPremium: true,
    shortcut: '7'
  },
  {
    id: 'platform',
    title: 'Navigation Master',
    description: 'Toutes les fonctionnalités',
    path: '/platform',
    icon: Globe,
    color: 'from-cyan-500 to-blue-600',
    category: 'new',
    isNew: true,
    shortcut: '0'
  }
];

interface QuickAccessPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAccessPanel: React.FC<QuickAccessPanelProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleAction = (action: QuickAction) => {
    navigate(action.path);
    onClose();
  };

  const categories = {
    all: { label: 'Toutes', actions: quickActions },
    frequent: { label: 'Fréquentes', actions: quickActions.filter(a => a.category === 'frequent') },
    new: { label: 'Nouveautés', actions: quickActions.filter(a => a.category === 'new') },
    premium: { label: 'Premium', actions: quickActions.filter(a => a.category === 'premium') }
  };

  const currentActions = categories[selectedCategory as keyof typeof categories]?.actions || quickActions;

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      // Fermer avec Escape
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      
      // Raccourcis numériques
      const num = parseInt(e.key);
      if (num >= 0 && num <= 9) {
        const action = quickActions.find(a => a.shortcut === e.key);
        if (action) {
          handleAction(action);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl mx-4"
          >
            <Card className="bg-black/95 backdrop-blur-xl border-white/10 shadow-2xl">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-yellow-400" />
                    <h2 className="text-2xl font-bold text-white">Accès Rapide</h2>
                    <Badge className="bg-blue-500/20 border-blue-500/40 text-blue-300">
                      Raccourcis clavier
                    </Badge>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Filtres par catégorie */}
                <div className="flex gap-2 mb-6">
                  {Object.entries(categories).map(([key, category]) => (
                    <Button
                      key={key}
                      variant={selectedCategory === key ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedCategory(key)}
                      className={`${
                        selectedCategory === key 
                          ? 'bg-white/20 text-white' 
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {category.label}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {category.actions.length}
                      </Badge>
                    </Button>
                  ))}
                </div>

                <Separator className="bg-white/10 mb-6" />

                {/* Actions rapides */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentActions.map((action, index) => {
                    const IconComponent = action.icon;
                    
                    return (
                      <motion.div
                        key={action.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="ghost"
                          onClick={() => handleAction(action)}
                          className="h-auto p-4 w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
                        >
                          <div className="flex items-center gap-4 w-full">
                            {/* Icône avec gradient */}
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} shadow-lg`}>
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            
                            {/* Contenu */}
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-white">
                                  {action.title}
                                </h3>
                                
                                {/* Badges */}
                                <div className="flex gap-1">
                                  {action.isNew && (
                                    <Badge className="bg-green-500/20 border-green-500/40 text-green-400 text-xs">
                                      Nouveau
                                    </Badge>
                                  )}
                                  {action.isPremium && (
                                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs">
                                      Premium
                                    </Badge>
                                  )}
                                  {action.isPopular && (
                                    <Badge className="bg-pink-500/20 border-pink-500/40 text-pink-400 text-xs">
                                      <Star className="w-3 h-3 mr-1" />
                                      Populaire
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-white/60 text-sm mb-2">
                                {action.description}
                              </p>
                              
                              {/* Raccourci */}
                              {action.shortcut && (
                                <div className="flex items-center gap-1 text-xs text-white/50">
                                  <Clock className="w-3 h-3" />
                                  <span>Raccourci:</span>
                                  <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20">
                                    {action.shortcut}
                                  </kbd>
                                </div>
                              )}
                            </div>
                            
                            <ChevronRight className="w-5 h-5 text-white/40" />
                          </div>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Footer avec instructions */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm text-white/50">
                    <div className="flex items-center gap-4">
                      <span>💡 Utilisez les chiffres (0-9) pour un accès instantané</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Esc</kbd>
                      <span>pour fermer</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};