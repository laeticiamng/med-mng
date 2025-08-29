import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Menu, 
  X, 
  Star, 
  Clock, 
  TrendingUp,
  Zap,
  Heart,
  Target,
  Award,
  Activity
} from 'lucide-react';

export const EnhancedNavigation: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentPages, setRecentPages] = useState<string[]>([]);
  const [userProgress, setUserProgress] = useState(78);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Track visited pages for smart suggestions
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath !== '/' && !recentPages.includes(currentPath)) {
      setRecentPages(prev => [currentPath, ...prev.slice(0, 4)]);
    }
  }, [location.pathname]);

  const quickActions = [
    { 
      title: "Générateur IA", 
      path: "/generator", 
      icon: Zap, 
      color: "from-yellow-500 to-orange-600",
      priority: "high",
      description: "Créer du contenu médical intelligent"
    },
    { 
      title: "EDN Complet", 
      path: "/edn", 
      icon: Target, 
      color: "from-blue-500 to-purple-600",
      priority: "high",
      description: "Items 1-367 avec parcours adaptatif"
    },
    { 
      title: "ECOS Simulation", 
      path: "/ecos", 
      icon: Activity, 
      color: "from-green-500 to-teal-600",
      priority: "medium",
      description: "Examens cliniques immersifs"
    },
    { 
      title: "Analytics Pro", 
      path: "/analytics", 
      icon: TrendingUp, 
      color: "from-pink-500 to-red-600",
      priority: "medium",
      description: "Suivi de performance avancé"
    }
  ];

  const achievements = [
    { title: "Explorateur", count: 12, icon: Star },
    { title: "Assidu", count: 28, icon: Clock },
    { title: "Excellence", count: 5, icon: Award }
  ];

  const handleQuickNavigation = (path: string) => {
    navigate(path);
    setIsSearchOpen(false);
    
    // Add subtle vibration on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  return (
    <>
      {/* Enhanced Search Trigger */}
      <motion.div
        className="fixed top-4 right-4 z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setIsSearchOpen(true)}
          className="relative bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
          size="lg"
        >
          <Search className="h-5 w-5 mr-2" />
          Navigation rapide
          <Badge className="ml-2 bg-white/20 hover:bg-white/30">
            Ctrl+K
          </Badge>
        </Button>
      </motion.div>

      {/* Enhanced Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
            onClick={(e) => e.target === e.currentTarget && setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              className="w-full max-w-2xl mx-4"
            >
              <Card className="border-none shadow-2xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl">
                <CardContent className="p-0">
                  {/* Search Header */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Rechercher une page, fonctionnalité ou contenu..."
                          className="pl-12 pr-4 py-3 text-lg bg-white/5 border-white/20 focus:border-purple-400 focus:ring-purple-400/20"
                          autoFocus
                        />
                      </div>
                      <Button
                        onClick={() => setIsSearchOpen(false)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* User Progress Bar */}
                  <div className="px-6 py-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Progression globale</span>
                      <span className="text-sm font-semibold text-purple-300">{userProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${userProgress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-400" />
                      Actions rapides
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {quickActions.map((action, index) => (
                        <motion.div
                          key={action.path}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Button
                            onClick={() => handleQuickNavigation(action.path)}
                            variant="ghost"
                            className="w-full justify-start p-4 h-auto hover:bg-white/5 group"
                          >
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mr-3 group-hover:scale-110 transition-transform`}>
                              <action.icon className="h-5 w-5 text-white" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-white">{action.title}</div>
                              <div className="text-sm text-gray-400">{action.description}</div>
                            </div>
                            {action.priority === 'high' && (
                              <Badge className="ml-auto bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                Priorité
                              </Badge>
                            )}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="px-6 pb-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-gold-400" />
                      Réalisations
                    </h3>
                    <div className="flex gap-4">
                      {achievements.map((achievement, index) => (
                        <motion.div
                          key={achievement.title}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2"
                        >
                          <achievement.icon className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm text-gray-300">{achievement.title}</span>
                          <Badge variant="outline" className="text-yellow-300 border-yellow-500/30">
                            {achievement.count}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Keyboard Shortcut */}
      <div className="sr-only">
        <div
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
              e.preventDefault();
              setIsSearchOpen(true);
            }
          }}
          tabIndex={-1}
        />
      </div>
    </>
  );
};