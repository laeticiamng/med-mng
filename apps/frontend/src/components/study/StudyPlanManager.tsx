import logger from '@/lib/logger';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Target, Book, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StudyPlan {
  id: string;
  user_id?: string; // Optional as it's managed by Supabase
  title: string;
  description: string;
  target_date: string;
  status: 'active' | 'completed' | 'paused';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  sessions_completed: number;
  total_sessions: number;
  created_at: string;
}

interface StudySession {
  id: string;
  plan_id: string;
  user_id?: string; // Optional as it's managed by Supabase
  title: string;
  duration_minutes: number;
  completed: boolean;
  scheduled_date: string;
  notes?: string;
}

export const StudyPlanManager = () => {
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState<StudyPlan | null>(null);
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    target_date: '',
    priority: 'medium' as const,
    total_sessions: 10
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStudyPlans();
    fetchSessions();
  }, []);

  const fetchStudyPlans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching study plans:', error);
        return;
      }

      setStudyPlans(data || []);
    } catch (error) {
      logger.error('Error fetching study plans:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: true });

      if (error) {
        logger.error('Error fetching study sessions:', error);
        return;
      }

      setSessions(data || []);
    } catch (error) {
      logger.error('Error fetching study sessions:', error);
    }
  };

  const createStudyPlan = async () => {
    if (!newPlan.title || !newPlan.target_date) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Erreur',
          description: 'Vous devez être connecté pour créer un plan',
          variant: 'destructive'
        });
        return;
      }

      const { data, error } = await supabase
        .from('study_plans')
        .insert({
          user_id: user.id,
          ...newPlan
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setStudyPlans(prev => [...prev, data]);
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
      logger.error('Error creating study plan:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le plan d\'étude',
        variant: 'destructive'
      });
    }
  };

  const updatePlanProgress = async (planId: string) => {
    const planSessions = sessions.filter(s => s.plan_id === planId);
    const completedSessions = planSessions.filter(s => s.completed).length;
    const progress = Math.round((completedSessions / planSessions.length) * 100);

    setStudyPlans(prev => prev.map(plan => 
      plan.id === planId 
        ? { ...plan, sessions_completed: completedSessions, progress }
        : plan
    ));
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Plans d'étude</h2>
          <p className="text-muted-foreground">
            Organisez et suivez vos sessions d'apprentissage
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau plan
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Créer un nouveau plan d'étude</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Titre</label>
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
                <label className="text-sm font-medium">Date cible</label>
                <Input
                  type="date"
                  value={newPlan.target_date}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, target_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Nombre de sessions</label>
                <Input
                  type="number"
                  value={newPlan.total_sessions}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, total_sessions: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={createStudyPlan}>Créer</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {studyPlans.map((plan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{plan.title}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant={getPriorityColor(plan.priority)}>
                    {plan.priority}
                  </Badge>
                  <Badge variant={getStatusColor(plan.status)}>
                    {plan.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(plan.target_date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Book className="h-4 w-4" />
                  {plan.sessions_completed}/{plan.total_sessions} sessions
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression</span>
                  <span>{plan.progress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${plan.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Edit className="mr-2 h-3 w-3" />
                  Modifier
                </Button>
                <Button size="sm" variant="outline">
                  <Target className="mr-2 h-3 w-3" />
                  Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
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