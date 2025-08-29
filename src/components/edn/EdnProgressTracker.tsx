import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, Target, Flame, Calendar, 
  BookOpen, Music, Brain, CheckCircle 
} from 'lucide-react';

interface StudySession {
  date: string;
  itemsStudied: number;
  timeSpent: number; // minutes
  score: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
  total: number;
}

export const EdnProgressTracker = () => {
  const [weeklyProgress, setWeeklyProgress] = useState(65);
  const [streak, setStreak] = useState(7);
  const [totalItemsStudied, setTotalItemsStudied] = useState(23);
  const [averageScore, setAverageScore] = useState(87);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const mockAchievements: Achievement[] = [
      {
        id: 'first-study',
        title: 'Premier Pas',
        description: 'Étudier votre premier item EDN',
        icon: <BookOpen className="h-4 w-4" />,
        unlocked: true,
        progress: 1,
        total: 1
      },
      {
        id: 'music-lover',
        title: 'Mélomane Médical',
        description: 'Générer 10 paroles musicales',
        icon: <Music className="h-4 w-4" />,
        unlocked: false,
        progress: 7,
        total: 10
      },
      {
        id: 'week-warrior',
        title: 'Guerrier Hebdomadaire',
        description: 'Étudier 7 jours consécutifs',
        icon: <Flame className="h-4 w-4" />,
        unlocked: true,
        progress: 7,
        total: 7
      },
      {
        id: 'score-master',
        title: 'Maître du Score',
        description: 'Obtenir 90% de moyenne',
        icon: <Trophy className="h-4 w-4" />,
        unlocked: false,
        progress: 87,
        total: 90
      }
    ];

    setAchievements(mockAchievements);
  }, []);

  const recentSessions: StudySession[] = [
    { date: '2024-01-15', itemsStudied: 3, timeSpent: 45, score: 92 },
    { date: '2024-01-14', itemsStudied: 2, timeSpent: 30, score: 85 },
    { date: '2024-01-13', itemsStudied: 4, timeSpent: 60, score: 88 },
  ];

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-300 mb-1">{totalItemsStudied}</div>
            <div className="text-xs text-blue-200">Items Étudiés</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-300 mb-1">{averageScore}%</div>
            <div className="text-xs text-green-200">Score Moyen</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center relative">
            <Flame className="absolute top-2 right-2 h-4 w-4 text-orange-400" />
            <div className="text-2xl font-bold text-orange-300 mb-1">{streak}</div>
            <div className="text-xs text-orange-200">Jours de Suite</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-300 mb-1">{weeklyProgress}%</div>
            <div className="text-xs text-purple-200">Objectif Semaine</div>
          </CardContent>
        </Card>
      </div>

      {/* Progression hebdomadaire */}
      <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-green-400" />
            Progression Hebdomadaire
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-300">
              <span>Objectif: 30 items par semaine</span>
              <span>{Math.round((weeklyProgress / 100) * 30)}/30</span>
            </div>
            <Progress value={weeklyProgress} className="h-3" />
            <div className="text-xs text-gray-400">
              Plus que {30 - Math.round((weeklyProgress / 100) * 30)} items pour atteindre votre objectif !
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Succès Débloqués
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                  achievement.unlocked
                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/30'
                    : 'bg-white/5 border-gray-600/30'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  achievement.unlocked 
                    ? 'bg-yellow-500/30 text-yellow-300' 
                    : 'bg-gray-600/30 text-gray-400'
                }`}>
                  {achievement.unlocked ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    achievement.icon
                  )}
                </div>
                
                <div className="flex-1">
                  <div className={`font-medium ${
                    achievement.unlocked ? 'text-yellow-300' : 'text-gray-300'
                  }`}>
                    {achievement.title}
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    {achievement.description}
                  </div>
                  {!achievement.unlocked && (
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(achievement.progress / achievement.total) * 100} 
                        className="h-1 flex-1" 
                      />
                      <span className="text-xs text-gray-400">
                        {achievement.progress}/{achievement.total}
                      </span>
                    </div>
                  )}
                </div>

                {achievement.unlocked && (
                  <Badge variant="outline" className="text-yellow-300 border-yellow-400/50">
                    Débloqué
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sessions récentes */}
      <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            Sessions Récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSessions.map((session, index) => (
              <div
                key={session.date}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div>
                  <div className="text-white font-medium">
                    {new Date(session.date).toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </div>
                  <div className="text-xs text-gray-400">
                    {session.itemsStudied} items • {session.timeSpent}min
                  </div>
                </div>
                
                <Badge 
                  variant={session.score >= 85 ? 'default' : 'secondary'}
                  className="font-medium"
                >
                  {session.score}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};