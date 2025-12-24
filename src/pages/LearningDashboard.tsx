import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LearningAnalytics } from '@/components/analytics/LearningAnalytics';
import { SmartRecommendations } from '@/components/recommendations/SmartRecommendations';
import { StreakDisplay } from '@/components/gamification/StreakDisplay';
import { useGamification } from '@/hooks/useGamification';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, Target, Lightbulb, Settings, Trophy, Flame, 
  CheckCircle, Plus, Trash2, Calendar, BookOpen
} from 'lucide-react';

interface LearningGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  completed: boolean;
  category: 'study' | 'music' | 'quiz' | 'flashcards' | 'general';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  completedAt?: string;
  streakDays: number;
}

interface UserSettings {
  studyNotifications: boolean;
  autoRecommendations: boolean;
  detailedAnalytics: boolean;
  adaptiveMode: boolean;
  dailyGoal: number;
  weeklyGoal: number;
  preferredTime: string;
  reminderTime: string;
}

export default function LearningDashboard() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [userId, setUserId] = useState<string | null>(null);
  const { stats, loading: gamificationLoading, loadStats } = useGamification();
  const { getStreak, getTodayStats } = useActivityTracking();
  const [streak, setStreak] = useState<{ current: number; longest: number }>({ current: 0, longest: 0 });
  const [todayStats, setTodayStats] = useState<any>(null);
  
  // Goals state
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalUnit, setNewGoalUnit] = useState('items');
  const [newGoalPriority, setNewGoalPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');

  // Settings state
  const [settings, setSettings] = useState<UserSettings>({
    studyNotifications: true,
    autoRecommendations: true,
    detailedAnalytics: true,
    adaptiveMode: true,
    dailyGoal: 10,
    weeklyGoal: 50,
    preferredTime: 'afternoon',
    reminderTime: '19:00'
  });
  const [settingsLoading, setSavingSettings] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await loadStats(user.id);
        const streakData = await getStreak();
        setStreak(streakData);
        const today = await getTodayStats();
        setTodayStats(today);
        
        // Load goals from Supabase
        const { data: goalsData } = await (supabase as any)
          .from('learning_goals')
          .select('*')
          .eq('user_id', user.id);
        
        if (goalsData) {
          setGoals(goalsData.map((g: any) => ({
            id: g.id,
            title: g.title,
            target: g.target_value,
            current: g.current_value,
            unit: g.goal_type || 'items',
            completed: g.completed,
            category: g.category || 'general',
            priority: g.priority || 'medium',
            createdAt: g.created_at || new Date().toISOString(),
            completedAt: g.completed_at,
            streakDays: g.streak_days || 0
          })));
        }

        // Load user settings
        const { data: settingsData } = await (supabase as any)
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (settingsData) {
          setSettings({
            studyNotifications: settingsData.study_notifications ?? true,
            autoRecommendations: settingsData.auto_recommendations ?? true,
            detailedAnalytics: settingsData.detailed_analytics ?? true,
            adaptiveMode: settingsData.adaptive_mode ?? true,
            dailyGoal: settingsData.daily_goal ?? 10,
            weeklyGoal: settingsData.weekly_goal ?? 50,
            preferredTime: settingsData.preferred_time ?? 'afternoon',
            reminderTime: settingsData.reminder_time ?? '19:00'
          });
        }
      }
    };
    init();
  }, [loadStats, getStreak, getTodayStats]);

  // Save settings to Supabase
  const saveSettings = async (newSettings: UserSettings) => {
    if (!userId) return;
    setSavingSettings(true);

    try {
      await (supabase as any)
        .from('user_preferences')
        .upsert({
          user_id: userId,
          study_notifications: newSettings.studyNotifications,
          auto_recommendations: newSettings.autoRecommendations,
          detailed_analytics: newSettings.detailedAnalytics,
          adaptive_mode: newSettings.adaptiveMode,
          daily_goal: newSettings.dailyGoal,
          weekly_goal: newSettings.weeklyGoal,
          preferred_time: newSettings.preferredTime,
          reminder_time: newSettings.reminderTime,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSavingSettings(false);
    }
  };

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const saveGoals = async (newGoals: LearningGoal[]) => {
    setGoals(newGoals);
    if (!userId) return;
    
    // Save to Supabase
    for (const goal of newGoals) {
      await (supabase as any)
        .from('learning_goals')
        .upsert({
          id: goal.id,
          user_id: userId,
          title: goal.title,
          target_value: goal.target,
          current_value: goal.current,
          goal_type: goal.unit,
          completed: goal.completed
        }, { onConflict: 'id' });
    }
  };

  const addGoal = () => {
    if (!newGoalTitle || !newGoalTarget) return;

    const newGoal: LearningGoal = {
      id: Date.now().toString(),
      title: newGoalTitle,
      target: parseInt(newGoalTarget),
      current: 0,
      unit: newGoalUnit,
      completed: false,
      category: 'general',
      priority: newGoalPriority,
      createdAt: new Date().toISOString(),
      streakDays: 0,
      deadline: newGoalDeadline || undefined
    };

    saveGoals([...goals, newGoal]);
    setNewGoalTitle('');
    setNewGoalTarget('');
    setNewGoalPriority('medium');
    setNewGoalDeadline('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-l-destructive';
      case 'medium': return 'border-l-4 border-l-warning';
      case 'low': return 'border-l-4 border-l-success';
      default: return '';
    }
  };

  const getGoalProgress = (goal: LearningGoal) => {
    return Math.min(100, Math.round((goal.current / goal.target) * 100));
  };

  const getDaysRemaining = (deadline?: string) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    const updated = goals.map(g => 
      g.id === goalId 
        ? { ...g, current: progress, completed: progress >= g.target }
        : g
    );
    saveGoals(updated);
  };

  const deleteGoal = (goalId: string) => {
    saveGoals(goals.filter(g => g.id !== goalId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Tableau de Bord d'Apprentissage
            </h1>
            <p className="text-muted-foreground">
              Suivez votre progression, analysez vos performances et découvrez des recommandations personnalisées
            </p>
          </div>
          
          {/* Quick stats */}
          {stats && (
            <div className="hidden md:block">
              <StreakDisplay stats={stats} compact />
            </div>
          )}
        </div>

        {/* Today's Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{streak.current}</p>
                <p className="text-xs text-muted-foreground">Jours de suite</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-success/10 to-success/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-full bg-success/20">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayStats?.totalActivities || 0}</p>
                <p className="text-xs text-muted-foreground">Activités aujourd'hui</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-full bg-warning/20">
                <Trophy className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.badges.length || 0}</p>
                <p className="text-xs text-muted-foreground">Badges obtenus</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-full bg-accent/20">
                <BookOpen className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">Niv. {stats?.level || 1}</p>
                <p className="text-xs text-muted-foreground">{stats?.totalPoints || 0} XP</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Recommandations
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Objectifs
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="analytics" className="space-y-6">
              <LearningAnalytics />
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <SmartRecommendations />
            </TabsContent>

            <TabsContent value="goals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Objectifs d'Apprentissage
                  </CardTitle>
                  <CardDescription>
                    Définissez et suivez vos objectifs d'étude personnalisés
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add new goal */}
                  <div className="flex gap-2 flex-wrap">
                    <Input 
                      placeholder="Titre de l'objectif..."
                      value={newGoalTitle}
                      onChange={(e) => setNewGoalTitle(e.target.value)}
                      className="flex-1 min-w-[200px]"
                    />
                    <Input 
                      type="number"
                      placeholder="Cible"
                      value={newGoalTarget}
                      onChange={(e) => setNewGoalTarget(e.target.value)}
                      className="w-24"
                    />
                    <select 
                      value={newGoalUnit}
                      onChange={(e) => setNewGoalUnit(e.target.value)}
                      className="px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="items">Items</option>
                      <option value="heures">Heures</option>
                      <option value="quiz">Quiz</option>
                      <option value="flashcards">Flashcards</option>
                    </select>
                    <Button onClick={addGoal} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Ajouter
                    </Button>
                  </div>

                  {/* Goals list */}
                  {goals.length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Aucun objectif défini</h3>
                      <p className="text-muted-foreground">
                        Créez votre premier objectif pour structurer votre apprentissage
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {goals.map((goal) => (
                        <div 
                          key={goal.id} 
                          className={`p-4 border rounded-lg ${goal.completed ? 'bg-success/5 border-success/30' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {goal.completed && <CheckCircle className="h-4 w-4 text-success" />}
                              <h4 className="font-medium">{goal.title}</h4>
                              {goal.completed && <Badge variant="outline" className="text-success">Complété</Badge>}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteGoal(goal.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{goal.current} / {goal.target} {goal.unit}</span>
                              <span>{Math.round((goal.current / goal.target) * 100)}%</span>
                            </div>
                            <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                          </div>
                          
                          {!goal.completed && (
                            <div className="flex gap-2 mt-3">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateGoalProgress(goal.id, goal.current + 1)}
                              >
                                +1
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateGoalProgress(goal.id, goal.current + 5)}
                              >
                                +5
                              </Button>
                              <Input 
                                type="number"
                                placeholder="Définir..."
                                className="w-24 h-8"
                                onBlur={(e) => {
                                  if (e.target.value) {
                                    updateGoalProgress(goal.id, parseInt(e.target.value));
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres d'Apprentissage</CardTitle>
                  <CardDescription>
                    Personnalisez votre expérience d'apprentissage {settingsLoading && '(Sauvegarde...)'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Notifications d'étude</h4>
                        <p className="text-sm text-muted-foreground">
                          Recevoir des rappels pour vos sessions d'étude
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.studyNotifications}
                        onChange={(e) => updateSetting('studyNotifications', e.target.checked)}
                        className="h-4 w-4 text-primary rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Recommandations automatiques</h4>
                        <p className="text-sm text-muted-foreground">
                          Activer les suggestions d'items basées sur vos performances
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.autoRecommendations}
                        onChange={(e) => updateSetting('autoRecommendations', e.target.checked)}
                        className="h-4 w-4 text-primary rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Analytics détaillées</h4>
                        <p className="text-sm text-muted-foreground">
                          Collecter des données détaillées sur votre progression
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.detailedAnalytics}
                        onChange={(e) => updateSetting('detailedAnalytics', e.target.checked)}
                        className="h-4 w-4 text-primary rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Mode adaptatif</h4>
                        <p className="text-sm text-muted-foreground">
                          Ajuster automatiquement la difficulté selon vos performances
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.adaptiveMode}
                        onChange={(e) => updateSetting('adaptiveMode', e.target.checked)}
                        className="h-4 w-4 text-primary rounded"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Objectifs Quotidiens</CardTitle>
                  <CardDescription>
                    Définissez vos objectifs d'apprentissage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Objectif quotidien</h4>
                        <p className="text-sm text-muted-foreground">
                          Nombre d'activités par jour
                        </p>
                      </div>
                      <Input
                        type="number"
                        value={settings.dailyGoal}
                        onChange={(e) => updateSetting('dailyGoal', parseInt(e.target.value) || 10)}
                        className="w-20"
                        min={1}
                        max={100}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Objectif hebdomadaire</h4>
                        <p className="text-sm text-muted-foreground">
                          Nombre d'activités par semaine
                        </p>
                      </div>
                      <Input
                        type="number"
                        value={settings.weeklyGoal}
                        onChange={(e) => updateSetting('weeklyGoal', parseInt(e.target.value) || 50)}
                        className="w-20"
                        min={1}
                        max={500}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Moment préféré</h4>
                        <p className="text-sm text-muted-foreground">
                          Quand étudiez-vous le mieux ?
                        </p>
                      </div>
                      <select
                        value={settings.preferredTime}
                        onChange={(e) => updateSetting('preferredTime', e.target.value)}
                        className="px-3 py-2 border rounded-md bg-background"
                      >
                        <option value="morning">Matin (6h-12h)</option>
                        <option value="afternoon">Après-midi (12h-18h)</option>
                        <option value="evening">Soir (18h-22h)</option>
                        <option value="night">Nuit (22h-6h)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Heure de rappel</h4>
                        <p className="text-sm text-muted-foreground">
                          Quand voulez-vous être notifié ?
                        </p>
                      </div>
                      <Input
                        type="time"
                        value={settings.reminderTime}
                        onChange={(e) => updateSetting('reminderTime', e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
