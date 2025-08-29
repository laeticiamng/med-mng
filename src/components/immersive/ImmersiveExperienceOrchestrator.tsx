import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Brain, 
  Music, 
  Users, 
  Target, 
  Trophy,
  Star,
  Zap,
  Play,
  ChevronRight,
  Clock,
  TrendingUp,
  BookOpen,
  Heart,
  Lightbulb,
  Headphones,
  Activity
} from 'lucide-react';
import { PersonalizedRecommendations } from './PersonalizedRecommendations';
import { SmartNotificationCenter } from './SmartNotificationCenter';
import { LiveCollaborationHub } from './LiveCollaborationHub';
import { AdvancedMusicPlayer } from './AdvancedMusicPlayer';
import { AchievementSystem } from './AchievementSystem';
import { toast } from 'sonner';

interface ImmersiveSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
  color: string;
  priority: number;
  isActive: boolean;
  progress?: number;
}

interface UserContext {
  studyStreak: number;
  totalStudyTime: number;
  currentGoal: string;
  nextMilestone: string;
  preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  strengths: string[];
  improvementAreas: string[];
}

const mockUserContext: UserContext = {
  studyStreak: 12,
  totalStudyTime: 156,
  currentGoal: 'Maîtriser Cardiologie',
  nextMilestone: 'Expert en Pathologies Cardiaques',
  preferredLearningStyle: 'mixed',
  strengths: ['Diagnostic différentiel', 'Mémorisation musicale', 'Travail collaboratif'],
  improvementAreas: ['Gestion du stress', 'Révisions systématiques', 'ECOS pratiques']
};

export const ImmersiveExperienceOrchestrator: React.FC = () => {
  const navigate = useNavigate();
  const [userContext] = useState<UserContext>(mockUserContext);
  const [activeSection, setActiveSection] = useState<string>('recommendations');
  const [experienceLevel, setExperienceLevel] = useState(85);
  const [dailyProgress, setDailyProgress] = useState(67);

  const immersiveSections: ImmersiveSection[] = [
    {
      id: 'recommendations',
      title: 'Recommandations IA',
      description: 'Suggestions personnalisées basées sur vos performances',
      icon: Lightbulb,
      component: PersonalizedRecommendations,
      color: 'from-blue-500 to-purple-600',
      priority: 1,
      isActive: true,
      progress: 92
    },
    {
      id: 'collaboration',
      title: 'Hub Collaboration',
      description: 'Étudiez et créez avec d\'autres étudiants en temps réel',
      icon: Users,
      component: LiveCollaborationHub,
      color: 'from-green-500 to-teal-600',
      priority: 2,
      isActive: true
    },
    {
      id: 'music',
      title: 'Studio Musical Avancé',
      description: 'Créateur de mnémotechniques musicaux avec IA',
      icon: Music,
      component: AdvancedMusicPlayer,
      color: 'from-purple-500 to-pink-600',
      priority: 3,
      isActive: true
    },
    {
      id: 'achievements',
      title: 'Système de Succès',
      description: 'Débloquez des récompenses et suivez vos progrès',
      icon: Trophy,
      component: AchievementSystem,
      color: 'from-yellow-500 to-orange-600',
      priority: 4,
      isActive: true,
      progress: 78
    }
  ];

  const quickActions = [
    {
      title: 'Défi Flash',
      description: '5 questions EDN adaptées',
      icon: Zap,
      action: () => navigate('/chat'),
      color: 'from-orange-500 to-red-600',
      duration: '5 min'
    },
    {
      title: 'Création Express',
      description: 'Musique mnémotechnique rapide',
      icon: Headphones,
      action: () => navigate('/generator'),
      color: 'from-purple-500 to-pink-600',
      duration: '10 min'
    },
    {
      title: 'Session Groupe',
      description: 'Rejoindre une étude collaborative',
      icon: Users,
      action: () => setActiveSection('collaboration'),
      color: 'from-green-500 to-blue-600',
      duration: 'Variable'
    },
    {
      title: 'Révision Ciblée',
      description: 'Points faibles identifiés par l\'IA',
      icon: Target,
      action: () => navigate('/edn'),
      color: 'from-blue-500 to-indigo-600',
      duration: '15 min'
    }
  ];

  useEffect(() => {
    // Simulate dynamic progress updates
    const interval = setInterval(() => {
      setDailyProgress(prev => Math.min(prev + Math.random() * 2, 100));
      setExperienceLevel(prev => Math.min(prev + Math.random() * 0.5, 100));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const ActiveComponent = immersiveSections.find(s => s.id === activeSection)?.component || PersonalizedRecommendations;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Floating Notification Center */}
      <SmartNotificationCenter />

      {/* Header avec contexte utilisateur */}
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-xl border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Expérience Immersive MED-MNG
                </h1>
                <p className="text-white/70">
                  Interface intelligente adaptée à votre profil d'apprentissage
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">{userContext.studyStreak}</div>
                  <div className="text-sm text-white/60">jours consécutifs</div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Barres de progression */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/80">Progression Quotidienne</span>
                  <span className="text-sm text-white/80">{Math.round(dailyProgress)}%</span>
                </div>
                <Progress value={dailyProgress} className="h-2 mb-1" />
                <p className="text-xs text-white/60">Objectif: {userContext.currentGoal}</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/80">Niveau d'Expertise</span>
                  <span className="text-sm text-white/80">{Math.round(experienceLevel)}%</span>
                </div>
                <Progress value={experienceLevel} className="h-2 mb-1" />
                <p className="text-xs text-white/60">Prochain: {userContext.nextMilestone}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Actions Rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Actions Rapides Intelligentes</h2>
            <Badge variant="outline" className="bg-blue-500/20 border-blue-500/40 text-blue-400">
              <Brain className="w-3 h-3 mr-1" />
              Adaptées à votre profil
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="p-4 bg-gradient-to-br from-white/5 to-white/10 border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300 cursor-pointer h-full"
                    onClick={action.action}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color}`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{action.title}</h3>
                        <p className="text-sm text-white/70 line-clamp-2">{action.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-white/60">
                        <Clock className="w-3 h-3" />
                        {action.duration}
                      </div>
                      <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border-0">
                        <Play className="w-3 h-3 mr-1" />
                        Go
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Navigation des Sections */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 mb-6">
            {immersiveSections.map((section) => {
              const isActive = activeSection === section.id;
              const IconComponent = section.icon;
              
              return (
                <Button
                  key={section.id}
                  variant={isActive ? "secondary" : "ghost"}
                  onClick={() => setActiveSection(section.id)}
                  className={`${isActive 
                    ? `bg-gradient-to-r ${section.color} text-white` 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  } transition-all duration-300`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {section.title}
                  {section.progress && (
                    <Badge variant="outline" className="ml-2 text-xs bg-white/10 border-white/20">
                      {Math.round(section.progress)}%
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </motion.div>

        {/* Section Active */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>

        {/* Statistiques en temps réel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-xl border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Intelligence Adaptative</h3>
              <Badge className="bg-green-500/20 border-green-500/40 text-green-400">
                <Activity className="w-3 h-3 mr-1" />
                Temps Réel
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-400">{userContext.totalStudyTime}h</div>
                <div className="text-sm text-white/60">Temps Total</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">{userContext.strengths.length}</div>
                <div className="text-sm text-white/60">Points Forts</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-400">{userContext.improvementAreas.length}</div>
                <div className="text-sm text-white/60">À Améliorer</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-400 capitalize">{userContext.preferredLearningStyle}</div>
                <div className="text-sm text-white/60">Style d'Apprentissage</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {userContext.strengths.map((strength, idx) => (
                <Badge key={idx} className="bg-green-500/20 border-green-500/40 text-green-400">
                  <Star className="w-3 h-3 mr-1" />
                  {strength}
                </Badge>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};