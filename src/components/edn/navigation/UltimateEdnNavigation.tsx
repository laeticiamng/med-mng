import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Target, 
  Eye, 
  ImageIcon, 
  Music, 
  Gamepad2,
  Sparkles,
  Trophy,
  Zap,
  Star,
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  Award,
  Heart,
  Brain,
  Flame,
  Crown,
  Rocket
} from 'lucide-react';

type SectionType = 'tableau-a' | 'tableau-b' | 'scene' | 'bd' | 'music' | 'quiz';

interface SectionProgress {
  sectionId: SectionType;
  completed: boolean;
  timeSpent: number;
  interactions: number;
  score?: number;
  lastVisited?: Date;
}

interface UltimateEdnNavigationProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
  competences: string[];
  itemTitle: string;
  itemCode: string;
  progress?: SectionProgress[];
  onProgressUpdate?: (progress: SectionProgress[]) => void;
}

interface Section {
  id: SectionType;
  title: string;
  description: string;
  detailedDescription: string;
  icon: React.ComponentType<any>;
  color: string;
  bgGradient: string;
  textColor: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert';
  estimatedTime: number; // en minutes
  prerequisites: SectionType[];
  rewards: {
    xp: number;
    badge: string;
    skill: string;
  };
  features: string[];
}

export const UltimateEdnNavigation = ({
  activeSection,
  onSectionChange,
  competences,
  itemTitle,
  itemCode,
  progress = [],
  onProgressUpdate
}: UltimateEdnNavigationProps) => {
  const { toast } = useToast();
  const [hoveredSection, setHoveredSection] = useState<SectionType | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const sections: Section[] = [
    {
      id: 'tableau-a',
      title: 'Compétences Rang A',
      description: 'Fondamentaux & Diagnostic',
      detailedDescription: 'Maîtrisez les concepts de base et les compétences diagnostiques essentielles',
      icon: BookOpen,
      color: 'from-blue-500 via-indigo-500 to-purple-500',
      bgGradient: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20',
      textColor: 'text-blue-700 dark:text-blue-300',
      difficulty: 'Débutant',
      estimatedTime: 15,
      prerequisites: [],
      rewards: {
        xp: 100,
        badge: '🎓 Fondations Solides',
        skill: 'Diagnostic médical'
      },
      features: ['Tableaux interactifs', 'Définitions contextuelles', 'Exemples cliniques', 'Auto-évaluation']
    },
    {
      id: 'tableau-b',
      title: 'Compétences Rang B',
      description: 'Expertise & Thérapeutique',
      detailedDescription: 'Approfondissez vos connaissances avec les compétences thérapeutiques avancées',
      icon: Target,
      color: 'from-emerald-500 via-teal-500 to-cyan-500',
      bgGradient: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      difficulty: 'Avancé',
      estimatedTime: 20,
      prerequisites: ['tableau-a'],
      rewards: {
        xp: 150,
        badge: '🎯 Expert Thérapeutique',
        skill: 'Prise en charge avancée'
      },
      features: ['Protocoles thérapeutiques', 'Cas complexes', 'Guidelines actualisées', 'Décisions cliniques']
    },
    {
      id: 'scene',
      title: 'Scène Immersive',
      description: 'Simulation 3D Interactive',
      detailedDescription: 'Vivez une expérience médicale immersive avec simulation 3D et interactions réalistes',
      icon: Eye,
      color: 'from-violet-500 via-purple-500 to-fuchsia-500',
      bgGradient: 'bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-900/20 dark:via-purple-900/20 dark:to-fuchsia-900/20',
      textColor: 'text-violet-700 dark:text-violet-300',
      difficulty: 'Expert',
      estimatedTime: 25,
      prerequisites: ['tableau-a', 'tableau-b'],
      rewards: {
        xp: 200,
        badge: '🌟 Maître Immersif',
        skill: 'Simulation clinique'
      },
      features: ['Environnement 3D', 'Interactions réalistes', 'Feedback immédiat', 'Scénarios multiples']
    },
    {
      id: 'bd',
      title: 'Bande Dessinée',
      description: 'Apprentissage Narratif',
      detailedDescription: 'Découvrez les concepts médicaux à travers une bande dessinée interactive et engageante',
      icon: ImageIcon,
      color: 'from-orange-500 via-red-500 to-pink-500',
      bgGradient: 'bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-900/20 dark:via-red-900/20 dark:to-pink-900/20',
      textColor: 'text-orange-700 dark:text-orange-300',
      difficulty: 'Débutant',
      estimatedTime: 12,
      prerequisites: [],
      rewards: {
        xp: 80,
        badge: '🎨 Narrateur Visuel',
        skill: 'Mémorisation créative'
      },
      features: ['Histoire interactive', 'Personnages attachants', 'Progression narrative', 'Concepts visuels']
    },
    {
      id: 'music',
      title: 'Génération Musicale',
      description: 'Mémorisation par IA',
      detailedDescription: 'Créez et écoutez des chansons pédagogiques générées par IA pour mémoriser efficacement',
      icon: Music,
      color: 'from-pink-500 via-rose-500 to-red-500',
      bgGradient: 'bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 dark:from-pink-900/20 dark:via-rose-900/20 dark:to-red-900/20',
      textColor: 'text-pink-700 dark:text-pink-300',
      difficulty: 'Intermédiaire',
      estimatedTime: 18,
      prerequisites: ['tableau-a'],
      rewards: {
        xp: 120,
        badge: '🎵 Compositeur Médical',
        skill: 'Mémorisation musicale'
      },
      features: ['IA générative', 'Paroles personnalisées', 'Rythmes entraînants', 'Export audio']
    },
    {
      id: 'quiz',
      title: 'Quiz Interactif',
      description: 'Évaluation Gamifiée',
      detailedDescription: 'Testez vos connaissances avec des quiz adaptatifs et des défis progressifs',
      icon: Gamepad2,
      color: 'from-amber-500 via-yellow-500 to-orange-500',
      bgGradient: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20',
      textColor: 'text-amber-700 dark:text-amber-300',
      difficulty: 'Intermédiaire',
      estimatedTime: 22,
      prerequisites: ['tableau-a'],
      rewards: {
        xp: 180,
        badge: '🏆 Champion Quiz',
        skill: 'Évaluation maîtrisée'
      },
      features: ['Questions adaptatives', 'Système de points', 'Classements', 'Feedback détaillé']
    }
  ];

  const getSectionProgress = (sectionId: SectionType) => {
    return progress.find(p => p.sectionId === sectionId);
  };

  const getTotalProgress = () => {
    if (progress.length === 0) return 0;
    const completedSections = progress.filter(p => p.completed).length;
    return (completedSections / sections.length) * 100;
  };

  const isUnlocked = (section: Section) => {
    if (section.prerequisites.length === 0) return true;
    return section.prerequisites.every(prereq => 
      progress.find(p => p.sectionId === prereq)?.completed
    );
  };

  const handleSectionChange = async (sectionId: SectionType) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section || !isUnlocked(section) || sectionId === activeSection) return;

    setIsAnimating(true);
    
    // Animation de transition
    await new Promise(resolve => setTimeout(resolve, 300));
    
    onSectionChange(sectionId);
    
    // Mise à jour du progrès
    const newProgress = [...progress];
    const existing = newProgress.find(p => p.sectionId === sectionId);
    
    if (existing) {
      existing.lastVisited = new Date();
    } else {
      newProgress.push({
        sectionId,
        completed: false,
        timeSpent: 0,
        interactions: 0,
        lastVisited: new Date()
      });
    }
    
    onProgressUpdate?.(newProgress);
    
    toast({
      title: `🚀 ${section.title}`,
      description: section.description,
      duration: 2000
    });
    
    setIsAnimating(false);
  };

  useEffect(() => {
    const completedXP = progress
      .filter(p => p.completed)
      .reduce((total, p) => {
        const section = sections.find(s => s.id === p.sectionId);
        return total + (section?.rewards.xp || 0);
      }, 0);
    
    setTotalXP(completedXP);
    
    // Débloquer des achievements
    const achievements: string[] = [];
    if (progress.filter(p => p.completed).length >= 3) achievements.push('🔥 Triple Maîtrise');
    if (progress.filter(p => p.completed).length === sections.length) achievements.push('👑 Maître Complet');
    if (progress.some(p => p.score && p.score >= 90)) achievements.push('⭐ Excellence');
    
    setUnlockedAchievements(achievements);
  }, [progress, sections]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}min`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'text-green-600 bg-green-100';
      case 'Intermédiaire': return 'text-orange-600 bg-orange-100';
      case 'Avancé': return 'text-red-600 bg-red-100';
      case 'Expert': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Premium avec statistiques */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Informations principales */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Crown className="h-8 w-8 text-yellow-300" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold">{itemTitle}</h1>
                    <p className="text-blue-100">Item {itemCode}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {competences.slice(0, 3).map((comp) => (
                    <Badge key={comp} variant="secondary" className="bg-white/20 text-white border-white/30">
                      {comp}
                    </Badge>
                  ))}
                  {competences.length > 3 && (
                    <Badge variant="outline" className="border-white/30 text-white">
                      +{competences.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Progression globale */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold">{Math.round(getTotalProgress())}%</div>
                  <div className="text-blue-100">Progression Globale</div>
                </div>
                <Progress value={getTotalProgress()} className="h-3 bg-white/20" />
                <div className="flex justify-between text-sm text-blue-100">
                  <span>{progress.filter(p => p.completed).length} complétés</span>
                  <span>{sections.length} modules</span>
                </div>
              </div>

              {/* Récompenses */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Trophy className="h-5 w-5 text-yellow-300" />
                      <span className="text-2xl font-bold">{totalXP}</span>
                    </div>
                    <div className="text-xs text-blue-100">Points XP</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Award className="h-5 w-5 text-yellow-300" />
                      <span className="text-2xl font-bold">{unlockedAchievements.length}</span>
                    </div>
                    <div className="text-xs text-blue-100">Achievements</div>
                  </div>
                </div>

                {unlockedAchievements.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {unlockedAchievements.map((achievement) => (
                      <motion.div
                        key={achievement}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-xs px-2 py-1 bg-white/20 rounded-full"
                      >
                        {achievement}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Grille des modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sections.map((section, index) => {
          const sectionProgress = getSectionProgress(section.id);
          const isActive = activeSection === section.id;
          const isCompleted = sectionProgress?.completed || false;
          const unlocked = isUnlocked(section);
          const IconComponent = section.icon;

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: unlocked ? 1.02 : 1 }}
              whileTap={{ scale: unlocked ? 0.98 : 1 }}
              onHoverStart={() => setHoveredSection(section.id)}
              onHoverEnd={() => setHoveredSection(null)}
            >
              <Card 
                className={`relative overflow-hidden transition-all duration-500 cursor-pointer ${
                  isActive 
                    ? 'ring-4 ring-primary ring-offset-2 shadow-2xl transform scale-105' 
                    : unlocked 
                      ? 'hover:shadow-xl hover:ring-2 hover:ring-primary/50' 
                      : 'opacity-60 cursor-not-allowed'
                } ${isCompleted ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : section.bgGradient}`}
                onClick={() => handleSectionChange(section.id)}
              >
                {/* Effet de brillance au survol */}
                <AnimatePresence>
                  {hoveredSection === section.id && unlocked && (
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      exit={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"
                    />
                  )}
                </AnimatePresence>

                <CardContent className="p-6 relative z-20">
                  {/* Header avec icône et statut */}
                  <div className="flex items-start justify-between mb-4">
                    <motion.div 
                      className={`p-3 rounded-2xl bg-gradient-to-br ${section.color} shadow-lg relative`}
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <IconComponent className="h-6 w-6 text-white" />
                      
                      {/* Particules d'animation */}
                      {isActive && (
                        <motion.div
                          className="absolute -inset-2"
                          animate={{ 
                            boxShadow: [
                              '0 0 0 0 rgba(59, 130, 246, 0.7)',
                              '0 0 0 10px rgba(59, 130, 246, 0)',
                              '0 0 0 0 rgba(59, 130, 246, 0)'
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.div>

                    <div className="flex flex-col items-end gap-2">
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-1 text-green-600"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs font-semibold">Complété</span>
                        </motion.div>
                      )}
                      
                      {!unlocked && (
                        <Badge variant="secondary" className="text-xs">
                          🔒 Verrouillé
                        </Badge>
                      )}
                      
                      {isActive && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-3 h-3 bg-green-500 rounded-full"
                        />
                      )}
                    </div>
                  </div>

                  {/* Contenu principal */}
                  <div className="space-y-3">
                    <div>
                      <h3 className={`font-bold text-lg ${section.textColor} mb-1`}>
                        {section.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        {section.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {section.detailedDescription}
                      </p>
                    </div>

                    {/* Métadonnées */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`text-xs ${getDifficultyColor(section.difficulty)}`}>
                        {section.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {section.estimatedTime}min
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        {section.rewards.xp} XP
                      </Badge>
                    </div>

                    {/* Fonctionnalités */}
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Fonctionnalités :</div>
                      <div className="flex flex-wrap gap-1">
                        {section.features.slice(0, 2).map((feature) => (
                          <span key={feature} className="text-xs px-2 py-1 bg-muted/50 rounded-full">
                            {feature}
                          </span>
                        ))}
                        {section.features.length > 2 && (
                          <span className="text-xs px-2 py-1 bg-muted/50 rounded-full">
                            +{section.features.length - 2}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progression de section */}
                    {sectionProgress && (
                      <div className="space-y-2 pt-3 border-t border-border/50">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(sectionProgress.timeSpent)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            <span>{sectionProgress.interactions} interactions</span>
                          </div>
                        </div>
                        
                        {sectionProgress.score !== undefined && (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span>Score</span>
                              <span className="font-semibold">{sectionProgress.score}%</span>
                            </div>
                            <Progress value={sectionProgress.score} className="h-1" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action button */}
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="pt-2"
                    >
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className={`w-full justify-between ${
                          isActive ? `bg-gradient-to-r ${section.color} text-white` : ''
                        }`}
                        disabled={!unlocked}
                      >
                        <span>
                          {isCompleted ? 'Réviser' : isActive ? 'En cours' : 'Commencer'}
                        </span>
                        {unlocked && <ArrowRight className="h-4 w-4" />}
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Overlay d'animation */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center bg-white/90 dark:bg-gray-900/90 p-8 rounded-2xl shadow-2xl"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-lg font-semibold">Chargement de l'expérience...</p>
              <p className="text-muted-foreground">Préparation de votre module d'apprentissage</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};