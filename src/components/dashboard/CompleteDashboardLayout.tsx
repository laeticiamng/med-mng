import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Music, 
  BookOpen, 
  Brain, 
  Trophy, 
  Users, 
  TrendingUp,
  Target,
  Clock,
  Star,
  Play,
  ChevronRight,
  Activity,
  Award,
  Zap,
  Headphones
} from 'lucide-react';

interface DashboardStats {
  ednProgress: number;
  musicGenerated: number;
  studyTime: number;
  achievements: number;
  rank: string;
  nextGoal: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  path: string;
  color: string;
  isPremium?: boolean;
  isNew?: boolean;
}

const mockStats: DashboardStats = {
  ednProgress: 78,
  musicGenerated: 24,
  studyTime: 156,
  achievements: 12,
  rank: "Expert",
  nextGoal: "Maîtrise Cardiologie"
};

const quickActions: QuickAction[] = [
  {
    title: "Générer Musique IA",
    description: "Créez des mnémotechniques musicaux",
    icon: Music,
    path: "/generator",
    color: "from-purple-500 to-pink-600",
    isPremium: true,
    isNew: true
  },
  {
    title: "Items EDN",
    description: "367 items du référentiel officiel",
    icon: BookOpen,
    path: "/edn",
    color: "from-blue-500 to-cyan-600"
  },
  {
    title: "Assistant IA",
    description: "Support médical intelligent",
    icon: Brain,
    path: "/chat",
    color: "from-green-500 to-emerald-600",
    isNew: true
  },
  {
    title: "Studio Musical",
    description: "Créez et gérez vos créations",
    icon: Headphones,
    path: "/med-mng/create",
    color: "from-orange-500 to-red-600",
    isPremium: true
  },
  {
    title: "Communauté",
    description: "Connectez-vous avec d'autres étudiants",
    icon: Users,
    path: "/med-mng/community",
    color: "from-indigo-500 to-purple-600"
  },
  {
    title: "Analytics",
    description: "Analysez votre progression",
    icon: TrendingUp,
    path: "/analytics",
    color: "from-yellow-500 to-orange-600"
  }
];

export const CompleteDashboardLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-pink-900/20" />
        <div className="relative z-10 container mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Dashboard Immersif
              </h1>
            </div>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Votre plateforme d'apprentissage médical révolutionnaire avec IA générative
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge className="bg-green-500/20 border-green-500/40 text-green-400">
                <Activity className="w-3 h-3 mr-1" />
                100% Opérationnel
              </Badge>
              <Badge className="bg-purple-500/20 border-purple-500/40 text-purple-400">
                <Zap className="w-3 h-3 mr-1" />
                IA Avancée
              </Badge>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          >
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-blue-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{mockStats.ednProgress}%</div>
                  <div className="text-sm text-white/60">Progression EDN</div>
                </div>
              </div>
              <Progress value={mockStats.ednProgress} className="h-2" />
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <Music className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{mockStats.musicGenerated}</div>
                  <div className="text-sm text-white/60">Musiques Créées</div>
                </div>
              </div>
              <div className="text-xs text-purple-400">+3 cette semaine</div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{mockStats.studyTime}h</div>
                  <div className="text-sm text-white/60">Temps d'Étude</div>
                </div>
              </div>
              <div className="text-xs text-green-400">+12h ce mois</div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-600/10 border-yellow-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{mockStats.achievements}</div>
                  <div className="text-sm text-white/60">Succès</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-yellow-400">
                <Star className="w-3 h-3" />
                Rang {mockStats.rank}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">Actions Rapides</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => navigate('/features')}
            >
              Toutes les Fonctionnalités
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => navigate('/dashboard')}
            >
              Voir Dashboard Complet
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              
              return (
                <motion.div
                  key={action.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="p-6 bg-gradient-to-br from-white/5 to-white/10 border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300 cursor-pointer relative overflow-hidden"
                    onClick={() => navigate(action.path)}
                  >
                    {/* Premium Badge */}
                    {action.isPremium && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      </div>
                    )}

                    {/* New Badge */}
                    {action.isNew && !action.isPremium && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs">
                          Nouveau
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color}`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {action.title}
                        </h3>
                        <p className="text-white/60 text-sm">
                          {action.description}
                        </p>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-white/10 hover:bg-white/20 text-white border-0"
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Accéder
                    </Button>

                    {/* Decorative gradient */}
                    <div className={`absolute inset-0 opacity-5 bg-gradient-to-r ${action.color}`} />
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <Card className="p-8 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-indigo-400" />
                <div>
                  <h3 className="text-2xl font-bold text-white">Objectif Suivant</h3>
                  <p className="text-white/60">{mockStats.nextGoal}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-indigo-400">85%</div>
                <div className="text-sm text-white/60">Complété</div>
              </div>
            </div>
            
            <Progress value={85} className="h-3 mb-4" />
            
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>Progression cette semaine: +12%</span>
              <span>15 items restants</span>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};