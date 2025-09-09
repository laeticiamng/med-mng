import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  X, 
  ChevronRight, 
  BookOpen, 
  Target, 
  Zap,
  Brain,
  Clock,
  Trophy,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '@/lib/logger';

interface Hint {
  id: string;
  type: 'tip' | 'strategy' | 'shortcut' | 'insight' | 'warning';
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  section: string;
  trigger: 'time' | 'interaction' | 'performance' | 'manual';
  icon: React.ElementType;
  actionLabel?: string;
  onAction?: () => void;
}

interface SmartHintsProps {
  currentSection: string;
  timeSpentInSection: number;
  interactionCount: number;
  performanceScore: number;
  itemCode: string;
}

export const SmartHints: React.FC<SmartHintsProps> = ({
  currentSection,
  timeSpentInSection,
  interactionCount,
  performanceScore,
  itemCode
}) => {
  const [activeHints, setActiveHints] = useState<Hint[]>([]);
  const [dismissedHints, setDismissedHints] = useState<Set<string>>(new Set());
  const [showHintManager, setShowHintManager] = useState(false);

  // Base de données des hints contextuels
  const hintDatabase: Hint[] = [
    {
      id: 'tableau-time-tip',
      type: 'tip',
      title: 'Optimisation du temps',
      content: 'Vous passez beaucoup de temps sur ce tableau. Essayez de survoler les concepts pour voir les détails rapidement.',
      priority: 'medium',
      section: 'tableau-a',
      trigger: 'time',
      icon: Clock,
      actionLabel: 'Mode Focus',
      onAction: () => logger.info('Focus mode activated', { 
        component: 'SmartHints',
        action: 'focus_mode_activation' 
      })
    },
    {
      id: 'tableau-strategy',
      type: 'strategy',
      title: 'Stratégie d\'apprentissage',
      content: 'Pour les tableaux Rang A, concentrez-vous d\'abord sur les concepts marqués comme "essentiel". Ils constituent la base.',
      priority: 'high',
      section: 'tableau-a',
      trigger: 'manual',
      icon: Target
    },
    {
      id: 'scene-immersion',
      type: 'insight',
      title: 'Immersion maximale',
      content: 'La scène immersive est plus efficace avec le son activé et en mode plein écran. Plongez-vous complètement !',
      priority: 'medium',
      section: 'scene',
      trigger: 'interaction',
      icon: Brain,
      actionLabel: 'Mode Immersif',
      onAction: () => document.documentElement.requestFullscreen()
    },
    {
      id: 'music-learning',
      type: 'tip',
      title: 'Apprentissage musical',
      content: 'Les paroles musicales renforcent la mémorisation. Écoutez d\'abord, puis chantez mentalement les concepts.',
      priority: 'medium',
      section: 'music',
      trigger: 'manual',
      icon: Zap
    },
    {
      id: 'quiz-performance',
      type: 'warning',
      title: 'Performance à améliorer',
      content: 'Votre score au quiz suggère de revoir les sections précédentes. La révision active améliore la rétention.',
      priority: 'high',
      section: 'quiz',
      trigger: 'performance',
      icon: Trophy,
      actionLabel: 'Réviser',
      onAction: () => logger.info('Review sections requested', { 
        component: 'SmartHints',
        action: 'review_sections_requested' 
      })
    },
    {
      id: 'bd-visual',
      type: 'insight',
      title: 'Apprentissage visuel',
      content: 'La BD utilise la mémoire visuelle. Associez chaque case à un concept clé pour une mémorisation optimale.',
      priority: 'low',
      section: 'bd',
      trigger: 'interaction',
      icon: BookOpen
    },
    {
      id: 'general-progress',
      type: 'tip',
      title: 'Progression recommandée',
      content: 'Pour une assimilation optimale, alternez entre sections théoriques (tableaux) et pratiques (scène, quiz).',
      priority: 'medium',
      section: 'all',
      trigger: 'time',
      icon: ArrowRight
    }
  ];

  // Logique d'activation des hints
  useEffect(() => {
    const relevantHints = hintDatabase.filter(hint => {
      if (dismissedHints.has(hint.id)) return false;
      if (hint.section !== 'all' && hint.section !== currentSection) return false;

      switch (hint.trigger) {
        case 'time':
          return timeSpentInSection > 300; // 5 minutes
        case 'interaction':
          return interactionCount > 10;
        case 'performance':
          return performanceScore < 60;
        case 'manual':
          return true;
        default:
          return false;
      }
    });

    // Trier par priorité
    const sortedHints = relevantHints.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    setActiveHints(sortedHints.slice(0, 2)); // Maximum 2 hints actifs
  }, [currentSection, timeSpentInSection, interactionCount, performanceScore, dismissedHints]);

  const dismissHint = (hintId: string) => {
    setDismissedHints(prev => new Set([...prev, hintId]));
    setActiveHints(prev => prev.filter(hint => hint.id !== hintId));
  };

  const getTypeColor = (type: Hint['type']) => {
    switch (type) {
      case 'tip': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'strategy': return 'bg-green-50 border-green-200 text-green-800';
      case 'shortcut': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'insight': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'warning': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getTypeIcon = (type: Hint['type']) => {
    switch (type) {
      case 'tip': return '💡';
      case 'strategy': return '🎯';
      case 'shortcut': return '⚡';
      case 'insight': return '🧠';
      case 'warning': return '⚠️';
      default: return '💡';
    }
  };

  const HintCard = ({ hint }: { hint: Hint }) => (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ duration: 0.3 }}
      className="mb-3"
    >
      <Card className={`relative overflow-hidden ${getTypeColor(hint.type)} border-l-4`}>
        <CardContent className="p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dismissHint(hint.id)}
            className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-black/10"
          >
            <X className="h-3 w-3" />
          </Button>

          <div className="pr-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getTypeIcon(hint.type)}</span>
              <h4 className="font-semibold text-sm">{hint.title}</h4>
              <Badge variant="secondary" className="text-xs px-2 py-0">
                {hint.type}
              </Badge>
            </div>

            <p className="text-sm mb-3 leading-relaxed">
              {hint.content}
            </p>

            {hint.actionLabel && hint.onAction && (
              <Button
                size="sm"
                variant="outline"
                onClick={hint.onAction}
                className="text-xs h-7"
              >
                {hint.actionLabel}
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <>
      {/* Hints flottants */}
      <AnimatePresence>
        {activeHints.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-20 right-4 z-40 w-80 max-w-sm"
          >
            <div className="space-y-3">
              {activeHints.map(hint => (
                <HintCard key={hint.id} hint={hint} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton pour ouvrir le gestionnaire de hints */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2 }}
        className="fixed bottom-20 left-4 z-40"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHintManager(!showHintManager)}
          className="rounded-full shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white"
          title="Conseils d'apprentissage"
        >
          <Lightbulb className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Gestionnaire de hints */}
      <AnimatePresence>
        {showHintManager && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-4 z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowHintManager(false)} />
            
            <Card className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Assistant d'Apprentissage
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowHintManager(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <CardContent className="p-6">
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Conseils pour {currentSection}</h4>
                  <div className="grid gap-3">
                    {hintDatabase
                      .filter(hint => hint.section === currentSection || hint.section === 'all')
                      .map(hint => (
                        <div key={hint.id} className={`p-3 rounded-lg ${getTypeColor(hint.type)}`}>
                          <div className="flex items-start gap-3">
                            <span className="text-lg">{getTypeIcon(hint.type)}</span>
                            <div className="flex-1">
                              <h5 className="font-medium text-sm mb-1">{hint.title}</h5>
                              <p className="text-sm opacity-80">{hint.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Statistiques d'apprentissage</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{Math.floor(timeSpentInSection / 60)}m</div>
                      <div className="text-xs text-blue-600">Temps passé</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{interactionCount}</div>
                      <div className="text-xs text-green-600">Interactions</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{performanceScore}%</div>
                      <div className="text-xs text-purple-600">Performance</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};