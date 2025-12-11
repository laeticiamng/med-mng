import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  Clock,
  Target,
  BookOpen,
  Music,
  Brain,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Play,
  Flame,
  Star,
  Trophy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGamification } from '@/hooks/useGamification';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { supabase } from '@/integrations/supabase/client';
import { StreakDisplay } from '@/components/gamification/StreakDisplay';

interface StudySession {
  id: string;
  title: string;
  type: 'edn' | 'music' | 'quiz' | 'revision';
  duration: number;
  scheduled: Date;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  itemCode?: string;
}

interface StudyGoal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number;
  category: string;
  priority: 'low' | 'medium' | 'high';
}

const StudyPlanner = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('planning');
  const [user, setUser] = useState<any>(null);
  const { stats: gamificationStats, loadStats, addPoints } = useGamification();
  const { logActivity, getWeeklySummary } = useActivityTracking();
  const [weeklySummary, setWeeklySummary] = useState<any>(null);

  // Load user and stats
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadStats(user.id);
        const summary = await getWeeklySummary();
        setWeeklySummary(summary);
      }
    };
    init();
  }, [loadStats, getWeeklySummary]);
  
  // Sessions d'étude plannifiées
  const [studySessions] = useState<StudySession[]>([
    {
      id: '1',
      title: 'IC-1 Relation médecin-malade',
      type: 'edn',
      duration: 45,
      scheduled: new Date(Date.now() + 2 * 60 * 60 * 1000),
      completed: false,
      difficulty: 'medium',
      itemCode: 'IC-1'
    },
    {
      id: '2',
      title: 'Musique mnémotechnique - Cardiologie',
      type: 'music',
      duration: 30,
      scheduled: new Date(Date.now() + 4 * 60 * 60 * 1000),
      completed: false,
      difficulty: 'easy'
    },
    {
      id: '3',
      title: 'Quiz - Neurologie',
      type: 'quiz',
      duration: 20,
      scheduled: new Date(Date.now() + 6 * 60 * 60 * 1000),
      completed: true,
      difficulty: 'hard'
    }
  ]);

  // Objectifs d'étude
  const [studyGoals] = useState<StudyGoal[]>([
    {
      id: '1',
      title: 'Maîtriser les IC fondamentaux',
      description: 'Compléter et valider tous les items de connaissances de rang A (IC-1 à IC-10)',
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      progress: 70,
      category: 'EDN',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Cardiologie approfondie',
      description: 'Approfondir toutes les pathologies cardiovasculaires',
      targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      progress: 45,
      category: 'Spécialité',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Révisions générales',
      description: 'Réviser l\'ensemble du programme avant examens',
      targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      progress: 25,
      category: 'Révision',
      priority: 'low'
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'edn': return <BookOpen className="h-4 w-4" />;
      case 'music': return <Music className="h-4 w-4" />;
      case 'quiz': return <Brain className="h-4 w-4" />;
      case 'revision': return <Target className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'edn': return 'bg-primary/10 text-primary';
      case 'music': return 'bg-accent/10 text-accent';
      case 'quiz': return 'bg-success/10 text-success';
      case 'revision': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-success/10 text-success';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'hard': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'low': return 'bg-success/10 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const startSession = async (sessionId: string) => {
    if (user) {
      await logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { sessionId, action: 'start' }
      });
      await addPoints(user.id, 'dailyStreak');
      loadStats(user.id);
    }
    
    toast({
      title: "Session démarrée",
      description: "Votre session d'étude a commencé. Bon travail !",
    });
  };

  return (
    <>
      <Helmet>
        <title>Planificateur d'Études | MED-MNG</title>
        <meta name="description" content="Organisez et planifiez vos sessions d'étude avec des objectifs personnalisés" />
      </Helmet>

      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Planificateur d'Études</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Organisez votre apprentissage avec des sessions planifiées et des objectifs personnalisés
          </p>
        </div>

        {/* Gamification Stats Banner */}
        {gamificationStats && (
          <div className="max-w-3xl mx-auto">
            <StreakDisplay stats={gamificationStats} />
          </div>
        )}

        {/* Weekly Summary */}
        {weeklySummary && (
          <Card className="max-w-3xl mx-auto bg-gradient-to-r from-primary/5 via-background to-success/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{weeklySummary.totalActivities}</p>
                    <p className="text-xs text-muted-foreground">activités</p>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-success">{weeklySummary.totalTime || 0}</p>
                    <p className="text-xs text-muted-foreground">minutes</p>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-warning">{weeklySummary.averageScore || 0}%</p>
                    <p className="text-xs text-muted-foreground">score moy.</p>
                  </div>
                </div>
                <Badge variant={weeklySummary.trend >= 0 ? 'default' : 'destructive'} className="text-sm">
                  {weeklySummary.trend >= 0 ? '+' : ''}{weeklySummary.trend}% vs sem. dernière
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="planning" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Planning
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Objectifs
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Progrès
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planning" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Sessions Plannifiées</h2>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle Session
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studySessions.map((session) => (
                <Card key={session.id} className={`transition-all hover:shadow-md ${session.completed ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(session.type)}
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                      </div>
                      {session.completed && <CheckCircle className="h-5 w-5 text-success" />}
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getTypeColor(session.type)}>
                        {session.type.toUpperCase()}
                      </Badge>
                      <Badge className={getDifficultyColor(session.difficulty)}>
                        {session.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {session.duration} minutes
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {session.scheduled.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    {!session.completed && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => startSession(session.id)}
                          className="flex items-center gap-1"
                        >
                          <Play className="h-3 w-3" />
                          Commencer
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Objectifs d'Étude</h2>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouvel Objectif
              </Button>
            </div>

            <div className="space-y-4">
              {studyGoals.map((goal) => (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2">
                          {goal.title}
                          <Badge className={getPriorityColor(goal.priority)}>
                            {goal.priority}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{goal.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Progrès</span>
                        <span className="text-sm text-muted-foreground">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <Badge variant="outline">{goal.category}</Badge>
                      <span className="text-muted-foreground">
                        Échéance: {goal.targetDate.toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <h2 className="text-2xl font-semibold">Suivi des Progrès</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sessions Complétées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success">24</div>
                  <p className="text-sm text-muted-foreground">cette semaine</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Temps d'Étude</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">18h</div>
                  <p className="text-sm text-muted-foreground">cette semaine</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Objectifs Atteints</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">3/5</div>
                  <p className="text-sm text-muted-foreground">ce mois</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Répartition par Type d'Activité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Items EDN</span>
                    <span className="text-sm text-muted-foreground">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Musique</span>
                    <span className="text-sm text-muted-foreground">30%</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Quiz</span>
                    <span className="text-sm text-muted-foreground">25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-semibold">Analytics d'Apprentissage</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance par Difficulté</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-success rounded-full"></div>
                      Facile
                    </span>
                    <span className="font-semibold">95%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-warning rounded-full"></div>
                      Moyen
                    </span>
                    <span className="font-semibold">82%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-destructive rounded-full"></div>
                      Difficile
                    </span>
                    <span className="font-semibold">68%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommandations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Augmentez les révisions</p>
                      <p className="text-xs text-muted-foreground">Recommandé pour améliorer la rétention</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Excellent rythme</p>
                      <p className="text-xs text-muted-foreground">Maintenez ce niveau d'activité</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Focus cardiologie</p>
                      <p className="text-xs text-muted-foreground">Domaine à approfondir prioritairement</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default StudyPlanner;