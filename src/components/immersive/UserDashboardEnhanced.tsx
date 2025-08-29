import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock, 
  Star, 
  Zap,
  BookOpen,
  Activity,
  Award,
  Calendar,
  Flame,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const UserDashboardEnhanced: React.FC = () => {
  const [currentStreak, setCurrentStreak] = useState(12);
  const [studyTime, setStudyTime] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [dailyGoalProgress, setDailyGoalProgress] = useState(68);

  // Simulate study timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive) {
      interval = setInterval(() => {
        setStudyTime(prev => prev + 1);
        setDailyGoalProgress(prev => Math.min(prev + 0.1, 100));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const achievements = [
    { 
      title: "Maître EDN", 
      description: "100 items EDN complétés", 
      progress: 73, 
      icon: BookOpen,
      color: "from-blue-500 to-purple-600",
      unlocked: false
    },
    {
      title: "ECOS Champion", 
      description: "50 simulations réussies", 
      progress: 100, 
      icon: Trophy,
      color: "from-yellow-500 to-orange-600",
      unlocked: true
    },
    {
      title: "Studieux", 
      description: "30 jours consécutifs", 
      progress: 40, 
      icon: Calendar,
      color: "from-green-500 to-teal-600",
      unlocked: false
    }
  ];

  const todayStats = [
    { label: "Temps d'étude", value: `${Math.floor(studyTime / 60)}:${(studyTime % 60).toString().padStart(2, '0')}`, icon: Clock, trend: "+15%" },
    { label: "Items complétés", value: "8", icon: CheckCircle2, trend: "+2" },
    { label: "Score moyen", value: "87%", icon: Star, trend: "+5%" },
    { label: "Série actuelle", value: `${currentStreak} jours`, icon: Flame, trend: "record!" }
  ];

  const weeklyGoals = [
    { title: "Items EDN", current: 45, target: 50, color: "bg-blue-500" },
    { title: "Simulations ECOS", current: 8, target: 10, color: "bg-green-500" },
    { title: "Temps d'étude", current: 12, target: 15, color: "bg-purple-500", unit: "h" }
  ];

  const recentActivity = [
    { action: "Complété EDN IC-245", time: "il y a 2h", score: 95, type: "success" },
    { action: "Simulation ECOS Cardiologie", time: "il y a 4h", score: 88, type: "success" },
    { action: "Quiz Neurologie", time: "hier", score: 72, type: "warning" },
    { action: "Révision Anatomie", time: "il y a 2 jours", score: 91, type: "success" }
  ];

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Header with Study Timer */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-white/10 p-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <motion.h1 
                className="text-4xl font-bold text-white mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Bonjour, Étudiant MED! 👋
              </motion.h1>
              <p className="text-purple-200 text-lg">
                Prêt pour une nouvelle session d'apprentissage ?
              </p>
              <div className="flex items-center gap-4 mt-4">
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                  <Flame className="h-4 w-4 mr-1" />
                  Série de {currentStreak} jours
                </Badge>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  <Target className="h-4 w-4 mr-1" />
                  Objectif quotidien: {dailyGoalProgress.toFixed(0)}%
                </Badge>
              </div>
            </div>
            
            {/* Study Timer */}
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-mono font-bold text-white">
                  {formatTime(studyTime)}
                </div>
                <p className="text-purple-200 text-sm">Session actuelle</p>
              </div>
              <Button
                onClick={() => setIsTimerActive(!isTimerActive)}
                className={`${isTimerActive 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
                } text-white font-semibold px-6`}
              >
                {isTimerActive ? 'Pause' : 'Commencer'}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Today's Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {todayStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <stat.icon className="h-5 w-5 text-purple-400" />
                    <Badge variant="outline" className="text-green-300 border-green-500/30">
                      {stat.trend}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <p className="text-gray-300 text-sm">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Weekly Goals & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Weekly Goals */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-green-400" />
                Objectifs de la semaine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {weeklyGoals.map((goal, index) => (
                <motion.div
                  key={goal.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">{goal.title}</span>
                    <span className="text-white font-semibold">
                      {goal.current}/{goal.target}{goal.unit || ''}
                    </span>
                  </div>
                  <Progress 
                    value={(goal.current / goal.target) * 100} 
                    className="h-2"
                  />
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-400" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.15 }}
                  className={`relative p-4 rounded-lg border ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30' 
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${achievement.color} flex items-center justify-center ${
                      achievement.unlocked ? '' : 'grayscale opacity-50'
                    }`}>
                      <achievement.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{achievement.title}</h4>
                      <p className="text-sm text-gray-300">{achievement.description}</p>
                      <div className="mt-2">
                        <Progress value={achievement.progress} className="h-1" />
                      </div>
                    </div>
                    {achievement.unlocked && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-yellow-400"
                      >
                        <Sparkles className="h-5 w-5" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-400' : 'bg-yellow-400'
                    }`} />
                    <div>
                      <p className="text-white font-medium">{activity.action}</p>
                      <p className="text-gray-400 text-sm">{activity.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${
                      activity.score >= 90 ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                      activity.score >= 75 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                      'bg-red-500/20 text-red-300 border-red-500/30'
                    }`}>
                      {activity.score}%
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};