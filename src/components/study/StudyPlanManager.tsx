import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Target, Book, Plus, Edit, Trash2, Flame, Star, Trophy, Loader2, RefreshCw, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { StreakDisplay } from '@/components/gamification/StreakDisplay';

interface StudyPlan {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_date: string;
  status: 'active' | 'completed' | 'paused';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  sessions_completed: number;
  total_sessions: number;
  created_at: string;
  updated_at: string;
}

interface StudySession {
  id: string;
  plan_id: string;
  user_id: string;
  title: string;
  duration_minutes: number;
  completed: boolean;
  scheduled_date: string;
  completed_date?: string;
  notes?: string;
  item_code?: string;
}

export const StudyPlanManager = () => {
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPlan, setEditingPlan] = useState<StudyPlan | null>(null);
  const [user, setUser] = useState<any>(null);
  const [newPlan, setNewPlan] = useState<{
    title: string;
    description: string;
    target_date: string;
    priority: 'low' | 'medium' | 'high';
    total_sessions: number;
  }>({
    title: '',
    description: '',
    target_date: '',
    priority: 'medium',
    total_sessions: 10
  });
  const { toast } = useToast();
  const { logActivity } = useActivityTracking();
  const { stats: gamificationStats, loadStats, addPoints } = useGamification();

  // Load user
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadStats(user.id);
      }
      setIsLoading(false);
    };
    init();
  }, [loadStats]);

  // Fetch study plans from localStorage
  const fetchStudyPlans = useCallback(async () => {
    if (!user?.id) return;

    try {
      const saved = localStorage.getItem(`study_plans_${user.id}`);
      if (saved) {
        setStudyPlans(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Error fetching study plans:', err);
    }
  }, [user?.id]);

  // Fetch sessions from localStorage
  const fetchSessions = useCallback(async () => {
    if (!user?.id) return;

    try {
      const saved = localStorage.getItem(`study_sessions_${user.id}`);
      if (saved) {
        setSessions(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchStudyPlans();
      fetchSessions();
    }
  }, [user?.id, fetchStudyPlans, fetchSessions]);

  // Save to localStorage as backup
  const saveToLocalStorage = useCallback((plans: StudyPlan[], userSessions: StudySession[]) => {
    if (user?.id) {
      localStorage.setItem(`study_plans_${user.id}`, JSON.stringify(plans));
      localStorage.setItem(`study_sessions_${user.id}`, JSON.stringify(userSessions));
    }
  }, [user?.id]);

  const createStudyPlan = async () => {
    if (!newPlan.title || !newPlan.target_date) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive'
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour créer un plan',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);

    try {
      const plan: StudyPlan = {
        id: `plan_${Date.now()}`,
        user_id: user.id,
        title: newPlan.title,
        description: newPlan.description,
        target_date: newPlan.target_date,
        priority: newPlan.priority,
        total_sessions: newPlan.total_sessions,
        status: 'active',
        progress: 0,
        sessions_completed: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save locally only (table doesn't exist)
      const updatedPlans = [...studyPlans, plan];
      setStudyPlans(updatedPlans);
      saveToLocalStorage(updatedPlans, sessions);

      // Log activity and add points
      logActivity({
        activity_type: 'study',
        metadata: { action: 'create_study_plan', plan_id: plan.id }
      });
      
      if (user?.id) {
        await addPoints(user.id, 'itemReviewed');
      }

      setNewPlan({
        title: '',
        description: '',
        target_date: '',
        priority: 'medium',
        total_sessions: 10
      });
      setIsCreating(false);

      toast({
        title: 'Plan créé',
        description: 'Votre plan d\'étude a été créé avec succès'
      });
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le plan d\'étude',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updatePlan = async (planId: string, updates: Partial<StudyPlan>) => {
    try {
      // Update locally only
      const updatedPlans = studyPlans.map(plan =>
        plan.id === planId ? { ...plan, ...updates, updated_at: new Date().toISOString() } : plan
      );
      setStudyPlans(updatedPlans);
      saveToLocalStorage(updatedPlans, sessions);

      toast({
        title: 'Plan mis à jour',
        description: 'Les modifications ont été enregistrées'
      });
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      // Delete locally only
      const updatedPlans = studyPlans.filter(plan => plan.id !== planId);
      const updatedSessions = sessions.filter(session => session.plan_id !== planId);
      setStudyPlans(updatedPlans);
      setSessions(updatedSessions);
      saveToLocalStorage(updatedPlans, updatedSessions);

      toast({
        title: 'Plan supprimé',
        description: 'Le plan d\'étude a été supprimé'
      });
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const completeSession = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    try {
      // Update locally only
      const updatedSessions = sessions.map(s =>
        s.id === sessionId ? { ...s, completed: true, completed_date: new Date().toISOString() } : s
      );
      setSessions(updatedSessions);

      // Update plan progress
      const planSessions = updatedSessions.filter(s => s.plan_id === session.plan_id);
      const completedCount = planSessions.filter(s => s.completed).length;
      const plan = studyPlans.find(p => p.id === session.plan_id);

      if (plan) {
        const progress = Math.round((completedCount / plan.total_sessions) * 100);
        await updatePlan(session.plan_id, {
          sessions_completed: completedCount,
          progress,
          status: progress >= 100 ? 'completed' : 'active'
        });
      }

      saveToLocalStorage(studyPlans, updatedSessions);

      // Gamification
      if (user?.id) {
        await addPoints(user.id, 'itemReviewed');
      }

      logActivity({
        activity_type: 'study',
        metadata: { action: 'complete_session', session_id: sessionId, duration: session.duration_minutes }
      });

      toast({
        title: 'Session terminée',
        description: 'Félicitations ! Session d\'étude complétée.'
      });
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'paused': return 'outline';
      default: return 'default';
    }
  };

  const getDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gamification Stats */}
      {gamificationStats && (
        <StreakDisplay stats={gamificationStats} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Plans d'étude</h2>
          <p className="text-muted-foreground">
            Organisez et suivez vos sessions d'apprentissage
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => { fetchStudyPlans(); fetchSessions(); }}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau plan
          </Button>
        </div>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Créer un nouveau plan d'étude</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Titre *</label>
              <Input
                value={newPlan.title}
                onChange={(e) => setNewPlan(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: EDN 2025 - Cardiologie"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newPlan.description}
                onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez votre plan d'étude..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date cible *</label>
                <Input
                  type="date"
                  value={newPlan.target_date}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, target_date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Priorité</label>
                <Select
                  value={newPlan.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') =>
                    setNewPlan(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Nombre de sessions prévues</label>
              <Input
                type="number"
                min={1}
                max={100}
                value={newPlan.total_sessions}
                onChange={(e) => setNewPlan(prev => ({ ...prev, total_sessions: parseInt(e.target.value) || 10 }))}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={createStudyPlan} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Créer
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {studyPlans.map((plan) => {
          const daysRemaining = getDaysRemaining(plan.target_date);
          const planSessions = sessions.filter(s => s.plan_id === plan.id);

          return (
            <Card key={plan.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{plan.title}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getPriorityColor(plan.priority)}>
                      {plan.priority === 'high' ? 'Haute' : plan.priority === 'medium' ? 'Moyenne' : 'Basse'}
                    </Badge>
                    <Badge variant={getStatusColor(plan.status)}>
                      {plan.status === 'active' ? 'Actif' : plan.status === 'completed' ? 'Terminé' : 'Pause'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(plan.target_date).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {daysRemaining > 0 ? `${daysRemaining} jours restants` : 'Échéance dépassée'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Book className="h-4 w-4" />
                    {plan.sessions_completed}/{plan.total_sessions} sessions
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression</span>
                    <span className="font-medium">{plan.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        plan.progress >= 100 ? 'bg-green-500' :
                        plan.progress >= 50 ? 'bg-primary' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.min(plan.progress, 100)}%` }}
                    />
                  </div>
                </div>

                {plan.status === 'completed' && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Plan terminé avec succès !</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingPlan(plan)}
                  >
                    <Edit className="mr-2 h-3 w-3" />
                    Modifier
                  </Button>
                  {plan.status === 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updatePlan(plan.id, { status: 'paused' })}
                    >
                      Pause
                    </Button>
                  )}
                  {plan.status === 'paused' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updatePlan(plan.id, { status: 'active' })}
                    >
                      Reprendre
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir supprimer ce plan ?')) {
                        deletePlan(plan.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {studyPlans.length === 0 && !isCreating && (
        <Card>
          <CardContent className="text-center py-12">
            <Book className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun plan d'étude</h3>
            <p className="text-muted-foreground mb-4">
              Créez votre premier plan d'étude pour organiser vos révisions
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Créer un plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
