import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Target,
  Award,
  Calendar,
  Users,
  Zap,
  Star,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  ChevronRight,
  Bell,
  Settings,
  Download
} from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';
import { useToast } from '@/hooks/use-toast';

interface LearningSession {
  id: string;
  itemId: string;
  itemTitle: string;
  startTime: string;
  endTime?: string;
  duration: number; // minutes
  completionRate: number;
  score?: number;
  modules: string[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress?: number;
  maxProgress?: number;
}

interface StudyGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  category: 'daily' | 'weekly' | 'monthly';
  isCompleted: boolean;
}

interface WeeklyStats {
  totalStudyTime: number;
  itemsCompleted: number;
  averageScore: number;
  streakDays: number;
  targetHours: number;
}

export const EdnDashboard: React.FC = () => {
  const { toast } = useToast();
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<LearningSession[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [studyGoals, setStudyGoals] = useState<StudyGoal[]>([]);
  const [isStudying, setIsStudying] = useState(false);
  const [studyTimer, setStudyTimer] = useState(0);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('today');

  // Simulation des données
  useEffect(() => {
    const mockWeeklyStats: WeeklyStats = {
      totalStudyTime: 485, // minutes
      itemsCompleted: 12,
      averageScore: 87.3,
      streakDays: 5,
      targetHours: 10
    };

    const mockRecentSessions: LearningSession[] = [
      {
        id: 's1',
        itemId: 'ic-001',
        itemTitle: 'Insuffisance cardiaque aiguë',
        startTime: '2024-01-15T10:30:00',
        endTime: '2024-01-15T11:15:00',
        duration: 45,
        completionRate: 100,
        score: 89,
        modules: ['tableau', 'quiz', 'musique']
      },
      {
        id: 's2',
        itemId: 'ic-002',
        itemTitle: 'Pneumonie communautaire',
        startTime: '2024-01-14T16:20:00',
        endTime: '2024-01-14T16:50:00',
        duration: 30,
        completionRate: 85,
        score: 92,
        modules: ['tableau', 'scene']
      }
    ];

    const mockAchievements: Achievement[] = [
      {
        id: 'a1',
        title: 'Premier pas',
        description: 'Terminé votre premier item EDN',
        icon: '🎯',
        unlockedAt: '2024-01-10',
        rarity: 'common'
      },
      {
        id: 'a2',
        title: 'Streak de feu',
        description: 'Étudié 5 jours consécutifs',
        icon: '🔥',
        unlockedAt: '2024-01-15',
        rarity: 'rare'
      },
      {
        id: 'a3',
        title: 'Perfectionniste',
        description: 'Obtenu 95%+ sur 3 quiz',
        icon: '⭐',
        unlockedAt: '',
        rarity: 'epic',
        progress: 2,
        maxProgress: 3
      }
    ];

    const mockStudyGoals: StudyGoal[] = [
      {
        id: 'g1',
        title: 'Objectif quotidien',
        description: 'Étudier 2 heures par jour',
        targetValue: 120,
        currentValue: 85,
        unit: 'minutes',
        deadline: new Date().toISOString(),
        category: 'daily',
        isCompleted: false
      },
      {
        id: 'g2',
        title: 'Items hebdomadaires',
        description: 'Compléter 5 items cette semaine',
        targetValue: 5,
        currentValue: 3,
        unit: 'items',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'weekly',
        isCompleted: false
      }
    ];

    setWeeklyStats(mockWeeklyStats);
    setRecentSessions(mockRecentSessions);
    setAchievements(mockAchievements);
    setStudyGoals(mockStudyGoals);
  }, []);

  // Timer pour session d'étude
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStudying) {
      interval = setInterval(() => {
        setStudyTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStudying]);

  const startStudySession = () => {
    setIsStudying(true);
    setStudyTimer(0);
    toast({
      title: "Session démarrée",
      description: "Bonne étude ! 📚"
    });
  };

  const pauseStudySession = () => {
    setIsStudying(false);
    toast({
      title: "Session en pause",
      description: `Temps écoulé: ${formatTimer(studyTimer)}`
    });
  };

  const endStudySession = () => {
    setIsStudying(false);
    const duration = Math.floor(studyTimer / 60);
    
    // Mise à jour des stats
    if (weeklyStats) {
      setWeeklyStats(prev => prev ? {
        ...prev,
        totalStudyTime: prev.totalStudyTime + duration
      } : null);
    }
    
    setStudyTimer(0);
    toast({
      title: "Session terminée",
      description: `Durée: ${duration} minutes. Excellent travail ! 🎉`
    });
  };

  const formatTimer = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (!weeklyStats) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-muted-foreground">Chargement du tableau de bord...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec session active */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer de session */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-blue-700 mb-2">
                {formatTimer(studyTimer)}
              </div>
              <div className="text-sm text-blue-600 mb-4">Session d'étude active</div>
              
              <div className="flex items-center justify-center gap-2">
                {!isStudying ? (
                  <Button onClick={startStudySession} className="flex items-center gap-2">
                    <PlayCircle className="h-4 w-4" />
                    Démarrer
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={pauseStudySession}>
                      <PauseCircle className="h-4 w-4" />
                    </Button>
                    <Button onClick={endStudySession} variant="destructive">
                      Terminer
                    </Button>
                  </>
                )}
                
                {studyTimer > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setStudyTimer(0)}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats rapides */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progression cette semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatDuration(weeklyStats.totalStudyTime)}
                </div>
                <div className="text-sm text-muted-foreground">Temps d'étude</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {weeklyStats.itemsCompleted}
                </div>
                <div className="text-sm text-muted-foreground">Items terminés</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {weeklyStats.averageScore}%
                </div>
                <div className="text-sm text-muted-foreground">Score moyen</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
                  🔥 {weeklyStats.streakDays}
                </div>
                <div className="text-sm text-muted-foreground">Jours consécutifs</div>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Objectif hebdomadaire</span>
                <span>{formatDuration(weeklyStats.totalStudyTime)} / {weeklyStats.targetHours}h</span>
              </div>
              <Progress 
                value={(weeklyStats.totalStudyTime / (weeklyStats.targetHours * 60)) * 100} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="goals">Objectifs</TabsTrigger>
          <TabsTrigger value="achievements">Succès</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Objectifs du jour */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Objectifs du jour
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studyGoals.filter(goal => goal.category === 'daily').map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{goal.title}</h4>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </div>
                      <Badge variant={goal.isCompleted ? "default" : "secondary"}>
                        {goal.currentValue}/{goal.targetValue} {goal.unit}
                      </Badge>
                    </div>
                    <Progress value={(goal.currentValue / goal.targetValue) * 100} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sessions récentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Sessions récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{session.itemTitle}</h4>
                        <div className="text-xs text-muted-foreground">
                          {formatDuration(session.duration)} • {new Date(session.startTime).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="flex gap-1 mt-1">
                          {session.modules.map((module) => (
                            <Badge key={module} variant="outline" className="text-xs">
                              {module}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {session.score && (
                        <div className="text-lg font-semibold text-green-600">
                          {session.score}%
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {session.completionRate}% terminé
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Objectifs quotidiens */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Objectifs quotidiens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {studyGoals.filter(goal => goal.category === 'daily').map((goal) => (
                  <div key={goal.id} className="space-y-3 p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{goal.title}</h4>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </div>
                      <Badge variant={goal.isCompleted ? "default" : "secondary"}>
                        {goal.isCompleted ? 'Terminé' : 'En cours'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progression</span>
                        <span>{goal.currentValue}/{goal.targetValue} {goal.unit}</span>
                      </div>
                      <Progress value={(goal.currentValue / goal.targetValue) * 100} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Objectifs hebdomadaires */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Objectifs hebdomadaires
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {studyGoals.filter(goal => goal.category === 'weekly').map((goal) => (
                  <div key={goal.id} className="space-y-3 p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{goal.title}</h4>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        Échéance: {new Date(goal.deadline).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progression</span>
                        <span>{goal.currentValue}/{goal.targetValue} {goal.unit}</span>
                      </div>
                      <Progress value={(goal.currentValue / goal.targetValue) * 100} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Succès débloqués
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <Card 
                    key={achievement.id} 
                    className={`${achievement.unlockedAt ? 'border-2' : 'opacity-60 border-dashed border-2'}`}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl mb-3">{achievement.icon}</div>
                      
                      <Badge className={getRarityColor(achievement.rarity)}>
                        {achievement.rarity}
                      </Badge>
                      
                      <h4 className="font-semibold mt-2 mb-1">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {achievement.description}
                      </p>
                      
                      {achievement.unlockedAt ? (
                        <div className="text-xs text-green-600">
                          Débloqué le {new Date(achievement.unlockedAt).toLocaleDateString('fr-FR')}
                        </div>
                      ) : achievement.progress !== undefined && achievement.maxProgress !== undefined ? (
                        <div className="space-y-1">
                          <Progress value={(achievement.progress / achievement.maxProgress) * 100} />
                          <div className="text-xs text-muted-foreground">
                            {achievement.progress}/{achievement.maxProgress}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          Non débloqué
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Historique détaillé
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="today">Aujourd'hui</option>
                    <option value="week">Cette semaine</option>
                    <option value="month">Ce mois</option>
                  </select>
                  
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <div key={session.id} className="border-l-4 border-l-blue-500 pl-4 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{session.itemTitle}</h4>
                        <div className="text-sm text-muted-foreground">
                          {new Date(session.startTime).toLocaleString('fr-FR')} • {formatDuration(session.duration)}
                        </div>
                        <div className="flex gap-1 mt-2">
                          {session.modules.map((module) => (
                            <Badge key={module} variant="outline" className="text-xs">
                              {module}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">
                            {session.score || 'N/A'}%
                          </div>
                          <div className="text-xs text-muted-foreground">Score</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">
                            {session.completionRate}%
                          </div>
                          <div className="text-xs text-muted-foreground">Terminé</div>
                        </div>
                      </div>
                    </div>
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