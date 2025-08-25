import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity, 
  Clock,
  Users,
  Music,
  BookOpen,
  Target,
  Zap,
  Eye,
  Play,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const RealTimeAnalytics = () => {
  const [liveData, setLiveData] = useState({
    activeUsers: 147,
    songsPlaying: 23,
    studyingSessions: 89,
    completedItems: 12
  });

  const [trends, setTrends] = useState([
    { 
      metric: 'Temps d\'étude moyen', 
      value: '2h 34m', 
      change: +12, 
      trend: 'up',
      icon: Clock,
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      metric: 'Taux de réussite', 
      value: '87%', 
      change: +5, 
      trend: 'up',
      icon: Target,
      color: 'from-green-500 to-emerald-600'
    },
    { 
      metric: 'Musiques créées', 
      value: '156', 
      change: -3, 
      trend: 'down',
      icon: Music,
      color: 'from-purple-500 to-pink-600'
    },
    { 
      metric: 'Engagement utilisateur', 
      value: '94%', 
      change: +8, 
      trend: 'up',
      icon: Heart,
      color: 'from-red-500 to-pink-600'
    }
  ]);

  const recentActivities = [
    { type: 'study', user: 'Marie L.', action: 'a terminé IC-225', time: 'maintenant' },
    { type: 'music', user: 'Thomas K.', action: 'a créé "Pneumonie Beat"', time: 'il y a 2 min' },
    { type: 'achievement', user: 'Julie M.', action: 'a débloqué "Expert Cardio"', time: 'il y a 5 min' },
    { type: 'quiz', user: 'Pierre D.', action: 'score de 95% en Neurologie', time: 'il y a 8 min' }
  ];

  // Simulation des données en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10 - 5),
        songsPlaying: prev.songsPlaying + Math.floor(Math.random() * 6 - 3),
        studyingSessions: prev.studyingSessions + Math.floor(Math.random() * 8 - 4),
        completedItems: prev.completedItems + Math.floor(Math.random() * 3)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-400" />
                Analytics en Temps Réel
              </CardTitle>
              <CardDescription className="text-gray-300">
                Données mises à jour automatiquement
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">Live</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-500/20 rounded-full mx-auto mb-2">
                <Users className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{liveData.activeUsers}</p>
              <p className="text-xs text-gray-400">Utilisateurs actifs</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-500/20 rounded-full mx-auto mb-2">
                <Play className="h-4 w-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{liveData.songsPlaying}</p>
              <p className="text-xs text-gray-400">Musiques en cours</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="flex items-center justify-center w-8 h-8 bg-green-500/20 rounded-full mx-auto mb-2">
                <BookOpen className="h-4 w-4 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">{liveData.studyingSessions}</p>
              <p className="text-xs text-gray-400">Sessions d'étude</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="flex items-center justify-center w-8 h-8 bg-yellow-500/20 rounded-full mx-auto mb-2">
                <Target className="h-4 w-4 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-white">{liveData.completedItems}</p>
              <p className="text-xs text-gray-400">Items complétés/h</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendances */}
        <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendances Hebdomadaires
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trends.map((trend, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                <div className={`w-10 h-10 bg-gradient-to-br ${trend.color} rounded-lg flex items-center justify-center`}>
                  <trend.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{trend.metric}</p>
                  <p className="text-2xl font-bold text-white">{trend.value}</p>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 ${
                    trend.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trend.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">{Math.abs(trend.change)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activité en Direct */}
        <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Activité en Direct
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'study' ? 'bg-blue-500/20' :
                  activity.type === 'music' ? 'bg-purple-500/20' :
                  activity.type === 'achievement' ? 'bg-yellow-500/20' :
                  'bg-green-500/20'
                }`}>
                  {activity.type === 'study' && <BookOpen className="h-4 w-4 text-white" />}
                  {activity.type === 'music' && <Music className="h-4 w-4 text-white" />}
                  {activity.type === 'achievement' && <Zap className="h-4 w-4 text-white" />}
                  {activity.type === 'quiz' && <Target className="h-4 w-4 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-gray-400 text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Graphique de performance */}
      <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance par Spécialité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Cardiologie', completion: 85, performance: 92, color: 'bg-red-500' },
              { name: 'Neurologie', completion: 78, performance: 88, color: 'bg-blue-500' },
              { name: 'Pneumologie', completion: 72, performance: 85, color: 'bg-green-500' },
              { name: 'Gastroentérologie', completion: 65, performance: 79, color: 'bg-yellow-500' },
              { name: 'Endocrinologie', completion: 58, performance: 82, color: 'bg-purple-500' }
            ].map((specialty, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">{specialty.name}</span>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>Complété: {specialty.completion}%</span>
                    <span>Performance: {specialty.performance}%</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Progress value={specialty.completion} className="h-2" />
                  </div>
                  <div className="flex-1">
                    <Progress value={specialty.performance} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};