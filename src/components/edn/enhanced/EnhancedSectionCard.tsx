import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Star, 
  Trophy, 
  Zap, 
  Users,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface EnhancedSectionCardProps {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;
  icon: React.ComponentType<any>;
  color: string;
  bgGradient: string;
  textColor: string;
  difficulty: string;
  estimatedTime: number;
  xpReward: number;
  features: string[];
  progress?: {
    completed: boolean;
    score?: number;
    timeSpent: number;
    interactions: number;
  };
  isActive: boolean;
  isUnlocked: boolean;
  onClick: () => void;
  className?: string;
}

export const EnhancedSectionCard = ({
  id,
  title,
  description,
  detailedDescription,
  icon: IconComponent,
  color,
  bgGradient,
  textColor,
  difficulty,
  estimatedTime,
  xpReward,
  features,
  progress,
  isActive,
  isUnlocked,
  onClick,
  className = ''
}: EnhancedSectionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Débutant': return 'from-green-400 to-green-600';
      case 'Intermédiaire': return 'from-orange-400 to-orange-600';
      case 'Avancé': return 'from-red-400 to-red-600';
      case 'Expert': return 'from-purple-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const cardVariants = {
    idle: {
      scale: 1,
      rotateY: 0,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    },
    hover: {
      scale: 1.03,
      rotateY: 5,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    active: {
      scale: 1.05,
      rotateY: 0,
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    }
  };

  const iconVariants = {
    idle: { rotate: 0, scale: 1 },
    hover: { rotate: [0, -10, 10, -10, 0], scale: 1.1 },
    active: { rotate: 360, scale: 1.2 }
  };

  const particleVariants = {
    idle: { scale: 0, opacity: 0 },
    active: { 
      scale: [0, 1, 0], 
      opacity: [0, 1, 0],
      transition: { 
        duration: 2, 
        repeat: Infinity,
        repeatDelay: 1
      }
    }
  };

  return (
    <motion.div
      className={`relative ${className}`}
      variants={cardVariants}
      initial="idle"
      animate={isActive ? "active" : isHovered ? "hover" : "idle"}
      whileTap={{ scale: isUnlocked ? 0.95 : 1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card 
        className={`relative overflow-hidden cursor-pointer transition-all duration-700 ${
          isActive 
            ? 'ring-4 ring-primary ring-offset-4 shadow-2xl' 
            : isUnlocked 
              ? 'hover:shadow-xl' 
              : 'opacity-60 cursor-not-allowed'
        } ${progress?.completed ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : bgGradient}`}
        onClick={isUnlocked ? onClick : undefined}
      >
        {/* Particules d'animation pour la section active */}
        <AnimatePresence>
          {isActive && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-primary rounded-full"
                  variants={particleVariants}
                  initial="idle"
                  animate="active"
                  style={{
                    left: `${20 + (i * 10)}%`,
                    top: `${10 + (i * 8)}%`,
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Effet de brillance au survol */}
        <AnimatePresence>
          {isHovered && isUnlocked && (
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: '100%', opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent z-10"
            />
          )}
        </AnimatePresence>

        <CardContent className="p-6 relative z-20">
          {/* Header avec icône et statut */}
          <div className="flex items-start justify-between mb-4">
            <motion.div 
              className={`relative p-3 rounded-2xl bg-gradient-to-br ${color} shadow-lg`}
              variants={iconVariants}
              initial="idle"
              animate={isActive ? "active" : isHovered ? "hover" : "idle"}
            >
              <IconComponent className="h-6 w-6 text-white relative z-10" />
              
              {/* Halo lumineux autour de l'icône pour la section active */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-50"
                  style={{ background: `linear-gradient(135deg, ${color.split(' ')[1]}, ${color.split(' ')[3]})` }}
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>

            <div className="flex flex-col items-end gap-2">
              {progress?.completed && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="flex items-center gap-1 text-green-600"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs font-semibold">Complété</span>
                </motion.div>
              )}
              
              {!isUnlocked && (
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Verrouillé
                  </Badge>
                </motion.div>
              )}
              
              {isActive && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-3 h-3 bg-green-500 rounded-full shadow-lg"
                />
              )}
            </div>
          </div>

          {/* Contenu principal */}
          <div className="space-y-3">
            <div>
              <motion.h3 
                className={`font-bold text-lg ${textColor} mb-1`}
                animate={{ 
                  color: isActive ? '#6366f1' : undefined 
                }}
              >
                {title}
              </motion.h3>
              <p className="text-muted-foreground text-sm mb-2">
                {description}
              </p>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-muted-foreground"
                  >
                    {detailedDescription}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Métadonnées avec animations */}
            <motion.div 
              className="flex flex-wrap gap-2"
              animate={{ scale: isHovered ? 1.05 : 1 }}
            >
              <Badge className={`text-xs bg-gradient-to-r ${getDifficultyColor(difficulty)} text-white`}>
                {difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {estimatedTime}min
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Trophy className="h-3 w-3 mr-1" />
                {xpReward} XP
              </Badge>
            </motion.div>

            {/* Fonctionnalités avec révélation progressive */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="h-auto p-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <span>Fonctionnalités</span>
                {isExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
              </Button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-wrap gap-1"
                  >
                    {features.map((feature, index) => (
                      <motion.span
                        key={feature}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-xs px-2 py-1 bg-muted/50 rounded-full"
                      >
                        {feature}
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Progression avec animations fluides */}
            {progress && (
              <motion.div 
                className="space-y-2 pt-3 border-t border-border/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between text-xs">
                  <motion.div 
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Clock className="h-3 w-3" />
                    <span>{Math.floor(progress.timeSpent / 60)}min</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Users className="h-3 w-3" />
                    <span>{progress.interactions} interactions</span>
                  </motion.div>
                </div>
                
                {progress.score !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span>Score</span>
                      <motion.span 
                        className="font-semibold"
                        animate={{ 
                          color: progress.score >= 80 ? '#10b981' : progress.score >= 60 ? '#f59e0b' : '#ef4444'
                        }}
                      >
                        {progress.score}%
                      </motion.span>
                    </div>
                    <Progress 
                      value={progress.score} 
                      className="h-1"
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* Bouton d'action avec état dynamique */}
            <motion.div
              whileHover={{ x: isUnlocked ? 5 : 0 }}
              className="pt-2"
            >
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={`w-full justify-between transition-all duration-300 ${
                  isActive 
                    ? `bg-gradient-to-r ${color} text-white shadow-lg` 
                    : isUnlocked 
                      ? 'hover:bg-primary/10' 
                      : 'opacity-50 cursor-not-allowed'
                }`}
                disabled={!isUnlocked}
              >
                <span>
                  {progress?.completed ? 'Réviser' : isActive ? 'En cours' : 'Commencer'}
                </span>
                {isUnlocked && (
                  <motion.div
                    animate={{ x: isHovered ? 5 : 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                )}
              </Button>
            </motion.div>
          </div>
        </CardContent>

        {/* Indicateur de progression en bas de carte */}
        {progress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/30">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${(progress.timeSpent / (estimatedTime * 60)) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        )}
      </Card>
    </motion.div>
  );
};