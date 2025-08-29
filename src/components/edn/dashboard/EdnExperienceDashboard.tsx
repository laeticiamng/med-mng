import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  Brain,
  Users,
  BookOpen,
  Lightbulb,
  Star,
  Calendar,
  BarChart3,
  Settings
} from 'lucide-react';

interface LearningMetrics {
  totalTimeSpent: number;
  completedSections: number;
  totalSections: number;
  averageScore: number;
  streakDays: number;
  competenciesMastered: number;
  interactionCount: number;
  lastActivity: Date;
}

interface CompetenceProgress {
  name: string;
  level: number;
  maxLevel: number;
  xp: number;
  nextLevelXp: number;
  category: string;
}

interface EdnExperienceDashboardProps {
  itemCode: string;
  competences: string[];
  currentProgress?: any;
  onRecommendationClick?: (recommendation: string) => void;
}

export const EdnExperienceDashboard = ({
  itemCode,
  competences,
  currentProgress,
  onRecommendationClick
}: EdnExperienceDashboardProps) => {
  const [metrics, setMetrics] = useState<LearningMetrics>({
    totalTimeSpent: 0,
    completedSections: 0,
    totalSections: 6,
    averageScore: 0,
    streakDays: 0,
    competenciesMastered: 0,
    interactionCount: 0,
    lastActivity: new Date()
  });

  const [competenceProgress, setCompetenceProgress] = useState<CompetenceProgress[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [dailyGoal, setDailyGoal] = useState(30); // minutes
  const [todayTime, setTodayTime] = useState(0);

  useEffect(() => {
    // Simuler la progression basée sur les compétences
    const progress = competences.map((comp, index) => ({
      name: comp,
      level: Math.floor(Math.random() * 5) + 1,
      maxLevel: 10,
      xp: Math.floor(Math.random() * 500) + 100,
      nextLevelXp: 1000,
      category: index < 2 ? 'Clinique' : index < 4 ? 'Théorique' : 'Pratique'
    }));
    setCompetenceProgress(progress);

    // Simuler des achievements
    const possibleAchievements = [
      'Premier Quiz Complété',
      'Scène Immersive Maîtrisée',
      'BD Interactive Explorée',
      'Musique Générée',
      'Streak de 3 jours',
      'Expert en Cardiologie'
    ];
    setAchievements(possibleAchievements.slice(0, Math.floor(Math.random() * 4) + 1));
  }, [competences]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const getCompetenceColor = (category: string) => {
    const colors = {
      'Clinique': 'from-blue-400 to-blue-600',
      'Théorique': 'from-green-400 to-green-600',
      'Pratique': 'from-purple-400 to-purple-600'
    };
    return colors[category as keyof typeof colors] || 'from-gray-400 to-gray-600';
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    if (metrics.completedSections === 0) {
      recommendations.push({
        title: 'Commencez votre parcours',
        description: 'Explorez les compétences Rang A pour établir vos bases',
        action: 'Démarrer',
        priority: 'high'
      });
    }
    
    if (metrics.averageScore < 70) {
      recommendations.push({
        title: 'Renforcez vos acquis',
        description: 'Revisitez les concepts avec la scène immersive',
        action: 'Réviser',
        priority: 'medium'
      });
    }
    
    if (todayTime < dailyGoal) {
      recommendations.push({
        title: 'Objectif quotidien',
        description: `Plus que ${dailyGoal - todayTime} minutes pour atteindre votre objectif`,
        action: 'Continuer',
        priority: 'low'
      });
    }
    
    return recommendations;
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec métrics principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Temps total</p>
              <p className="text-lg font-semibold">{formatTime(metrics.totalTimeSpent)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Progression</p>
              <p className="text-lg font-semibold">
                {Math.round((metrics.completedSections / metrics.totalSections) * 100)}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Score moyen</p>
              <p className="text-lg font-semibold">{metrics.averageScore}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Série</p>
              <p className="text-lg font-semibold">{metrics.streakDays} jours</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Objectif quotidien */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Objectif quotidien
            </h3>
            <Badge variant={todayTime >= dailyGoal ? "default" : "secondary"}>
              {formatTime(todayTime)} / {formatTime(dailyGoal)}
            </Badge>
          </div>
          
          <Progress value={(todayTime / dailyGoal) * 100} className="h-2" />
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Continuez comme ça !</span>
            <span>{Math.max(0, dailyGoal - todayTime)} min restantes</span>
          </div>
        </div>
      </Card>

      {/* Progression des compétences */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Progression des compétences
          </h3>
          
          <div className="space-y-3">
            {competenceProgress.slice(0, 4).map((comp) => (
              <div key={comp.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getCompetenceColor(comp.category)}`} />
                    <span className="font-medium text-sm">{comp.name}</span>
                    <Badge variant="outline" className="text-xs">
                      Niveau {comp.level}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {comp.xp} / {comp.nextLevelXp} XP
                  </span>
                </div>
                <Progress value={(comp.xp / comp.nextLevelXp) * 100} className="h-1" />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Achievements récents */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Star className="w-5 h-5" />
            Achievements récents
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg"
              >
                <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                  <Award className="w-3 h-3 text-yellow-600" />
                </div>
                <span className="text-sm font-medium">{achievement}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      {/* Recommandations personnalisées */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Recommandations pour vous
          </h3>
          
          <div className="space-y-3">
            {getRecommendations().map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
              >
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">{rec.title}</h4>
                  <p className="text-xs text-muted-foreground">{rec.description}</p>
                </div>
                <Button 
                  size="sm" 
                  variant={rec.priority === 'high' ? 'default' : 'outline'}
                  onClick={() => onRecommendationClick?.(rec.action)}
                >
                  {rec.action}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      {/* Analytics rapides */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Cette semaine
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-blue-600">12</p>
              <p className="text-xs text-muted-foreground">Quiz complétés</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-green-600">8</p>
              <p className="text-xs text-muted-foreground">Scènes explorées</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-purple-600">5</p>
              <p className="text-xs text-muted-foreground">BD lues</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-orange-600">3</p>
              <p className="text-xs text-muted-foreground">Musiques créées</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};