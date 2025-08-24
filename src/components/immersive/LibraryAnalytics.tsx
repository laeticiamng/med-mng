import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Clock, 
  Target, 
  Star,
  Music,
  Headphones,
  Calendar,
  Award
} from 'lucide-react';

interface AnalyticsData {
  totalListeningTime: number;
  averageRetention: number;
  favoriteGenre: string;
  studyStreak: number;
  completedTracks: number;
  learningEfficiency: number;
  weeklyProgress: number[];
  topSubjects: { name: string; score: number; count: number }[];
  recentAchievements: { title: string; date: string; icon: string }[];
}

interface LibraryAnalyticsProps {
  className?: string;
}

export const LibraryAnalytics: React.FC<LibraryAnalyticsProps> = ({ className }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalListeningTime: 847,
    averageRetention: 89,
    favoriteGenre: 'Lo-Fi Study',
    studyStreak: 12,
    completedTracks: 34,
    learningEfficiency: 94,
    weeklyProgress: [78, 82, 89, 76, 91, 88, 94],
    topSubjects: [
      { name: 'Cardiologie', score: 95, count: 8 },
      { name: 'Neurologie', score: 88, count: 6 },
      { name: 'Pneumologie', score: 92, count: 5 },
      { name: 'Endocrinologie', score: 85, count: 4 }
    ],
    recentAchievements: [
      { title: 'Maître de la Cardiologie', date: '2024-01-15', icon: 'heart' },
      { title: 'Série de 10 jours', date: '2024-01-12', icon: 'streak' },
      { title: 'Première chanson créée', date: '2024-01-10', icon: 'music' }
    ]
  });

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Métriques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-800">
              {formatTime(analytics.totalListeningTime)}
            </div>
            <div className="text-sm text-blue-600">Temps d'écoute</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-800">
              {analytics.averageRetention}%
            </div>
            <div className="text-sm text-green-600">Rétention moyenne</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <Music className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-800">
              {analytics.completedTracks}
            </div>
            <div className="text-sm text-purple-600">Musiques terminées</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-800">
              {analytics.studyStreak}
            </div>
            <div className="text-sm text-orange-600">Jours consécutifs</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="progress">Progression</TabsTrigger>
          <TabsTrigger value="subjects">Matières</TabsTrigger>
          <TabsTrigger value="achievements">Succès</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Efficacité d'apprentissage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Score global</span>
                  <Badge className={getEfficiencyColor(analytics.learningEfficiency)}>
                    {analytics.learningEfficiency}%
                  </Badge>
                </div>
                <Progress value={analytics.learningEfficiency} className="w-full" />
                
                <div className="text-sm text-gray-600">
                  <p>📈 +6% par rapport à la semaine dernière</p>
                  <p>🎯 Style préféré: {analytics.favoriteGenre}</p>
                  <p>⏰ Meilleure heure d'étude: 14h-16h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progression hebdomadaire</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end space-x-2 h-32">
                {analytics.weeklyProgress.map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t"
                      style={{ height: `${(value / 100) * 100}%` }}
                    />
                    <span className="text-xs text-gray-500 mt-1">
                      {['L', 'M', 'M', 'J', 'V', 'S', 'D'][index]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Performance par matière
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topSubjects.map((subject, index) => (
                  <div key={subject.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{subject.name}</p>
                        <p className="text-sm text-gray-500">{subject.count} musiques écoutées</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{subject.score}%</div>
                      <div className="text-xs text-gray-500">Score moyen</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Derniers succès
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      {achievement.icon === 'heart' && <Star className="h-5 w-5 text-white" />}
                      {achievement.icon === 'streak' && <Calendar className="h-5 w-5 text-white" />}
                      {achievement.icon === 'music' && <Music className="h-5 w-5 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{achievement.title}</p>
                      <p className="text-sm text-gray-600">{achievement.date}</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      Nouveau
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};