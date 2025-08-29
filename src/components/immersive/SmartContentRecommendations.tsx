import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Target, 
  Clock, 
  Star, 
  TrendingUp,
  BookOpen,
  Activity,
  Lightbulb,
  Zap,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trophy,
  Calendar
} from 'lucide-react';

interface Recommendation {
  id: string;
  title: string;
  type: 'edn' | 'ecos' | 'quiz' | 'revision';
  difficulty: 'facile' | 'moyen' | 'difficile';
  estimatedTime: number;
  score?: number;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  path: string;
  icon: React.ElementType;
  color: string;
  progress?: number;
}

export const SmartContentRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [userPreferences, setUserPreferences] = useState({
    focusAreas: ['cardiologie', 'neurologie'],
    preferredTime: 'morning',
    difficulty: 'moyen'
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();

  // Simulate AI-powered recommendations
  useEffect(() => {
    const generateRecommendations = () => {
      const mockRecommendations: Recommendation[] = [
        {
          id: '1',
          title: 'EDN IC-156: Insuffisance Cardiaque',
          type: 'edn',
          difficulty: 'moyen',
          estimatedTime: 25,
          priority: 'high',
          reason: 'Faible score récent en cardiologie',
          path: '/edn/ic-156',
          icon: BookOpen,
          color: 'from-red-500 to-pink-600',
          progress: 30
        },
        {
          id: '2',
          title: 'ECOS: Examen Neurologique',
          type: 'ecos',
          difficulty: 'difficile',
          estimatedTime: 45,
          score: 87,
          priority: 'high',
          reason: 'Domaine de forte performance',
          path: '/ecos/neuro-exam',
          icon: Activity,
          color: 'from-blue-500 to-cyan-600'
        },
        {
          id: '3',
          title: 'Quiz Rapide: Anatomie Cardiaque',
          type: 'quiz',
          difficulty: 'facile',
          estimatedTime: 10,
          priority: 'medium',
          reason: 'Révision recommandée',
          path: '/quiz/anatomie-cardiaque',
          icon: Zap,
          color: 'from-yellow-500 to-orange-600',
          progress: 70
        },
        {
          id: '4',
          title: 'Révision: Pharmacologie',
          type: 'revision',
          difficulty: 'moyen',
          estimatedTime: 30,
          priority: 'medium',
          reason: 'Planifié pour cette semaine',
          path: '/revision/pharmacologie',
          icon: Brain,
          color: 'from-purple-500 to-indigo-600'
        }
      ];

      setTimeout(() => {
        setRecommendations(mockRecommendations);
        setIsLoading(false);
      }, 1500);
    };

    generateRecommendations();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facile': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'moyen': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'difficile': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'low': return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      default: return null;
    }
  };

  const handleStartRecommendation = (recommendation: Recommendation) => {
    navigate(recommendation.path);
    
    // Track engagement
    console.log(`Starting recommended content: ${recommendation.title}`);
  };

  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400 animate-pulse" />
            Analyse de vos besoins...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-white/10 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-white/10 p-6"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Recommandations IA</h2>
              <p className="text-purple-200">Contenu personnalisé basé sur vos performances</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4">
            <Badge className="bg-white/10 text-white border-white/20">
              <Trophy className="h-3 w-3 mr-1" />
              85% de réussite moyenne
            </Badge>
            <Badge className="bg-white/10 text-white border-white/20">
              <Calendar className="h-3 w-3 mr-1" />
              3 sessions cette semaine
            </Badge>
            <Badge className="bg-white/10 text-white border-white/20">
              <Target className="h-3 w-3 mr-1" />
              2 domaines à améliorer
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {recommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer">
                <div className={`absolute inset-0 bg-gradient-to-br ${recommendation.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <CardHeader className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${recommendation.color} flex items-center justify-center`}>
                        <recommendation.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg group-hover:text-purple-200 transition-colors">
                          {recommendation.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {getPriorityIcon(recommendation.priority)}
                          <span className="text-gray-400 text-sm capitalize">
                            {recommendation.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Badge className={getDifficultyColor(recommendation.difficulty)}>
                      {recommendation.difficulty}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4">
                  {/* Reason */}
                  <div className="flex items-center gap-2 text-sm text-purple-200">
                    <Sparkles className="h-4 w-4" />
                    {recommendation.reason}
                  </div>

                  {/* Progress bar if applicable */}
                  {recommendation.progress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Progression</span>
                        <span className="text-white font-medium">{recommendation.progress}%</span>
                      </div>
                      <Progress value={recommendation.progress} className="h-2" />
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {recommendation.estimatedTime} min
                      </span>
                      {recommendation.score && (
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          {recommendation.score}%
                        </span>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => handleStartRecommendation(recommendation)}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-none group-hover:scale-105 transition-transform"
                      size="sm"
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Commencer
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Study Plan Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-400" />
              Plan d'étude personnalisé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-2xl font-bold text-white">Cette semaine</div>
                <p className="text-gray-300 text-sm">Focus: Cardiologie</p>
                <Progress value={68} className="mt-2" />
              </div>
              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-2xl font-bold text-white">Prochaine</div>
                <p className="text-gray-300 text-sm">Neurologie avancée</p>
                <Progress value={0} className="mt-2" />
              </div>
              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-2xl font-bold text-white">Révisions</div>
                <p className="text-gray-300 text-sm">Points faibles identifiés</p>
                <Progress value={35} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};