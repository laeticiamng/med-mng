/**
 * Goal Detail Page
 * View and manage a specific goal with progress tracking
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Target,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle2,
  Circle,
  Plus,
  Award,
  Pause,
  Play,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  useUpdateGoal,
  useDeleteGoal,
  useUpdateGoalProgress,
  useGoalMilestones,
  useCreateMilestone,
  useCompleteMilestone,
  UserGoal,
} from '@/hooks/useGoals';
import { format, differenceInDays, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface GoalActivity {
  id: string;
  activity_type: string;
  activity_data: any;
  created_at: string;
}

export const GoalDetail: React.FC = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [isMilestoneDialogOpen, setIsMilestoneDialogOpen] = useState(false);
  const [progressIncrement, setProgressIncrement] = useState(0);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDescription, setMilestoneDescription] = useState('');
  const [milestoneTarget, setMilestoneTarget] = useState(0);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTargetDate, setEditTargetDate] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const updateProgress = useUpdateGoalProgress();
  const createMilestone = useCreateMilestone();
  const completeMilestone = useCompleteMilestone();

  // Fetch goal
  const { data: goal, isLoading: loadingGoal } = useQuery<UserGoal>({
    queryKey: ['goal', goalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('id', goalId)
        .single();

      if (error) throw error;

      // Initialize edit form
      setEditTitle(data.title);
      setEditDescription(data.description || '');
      setEditTargetDate(data.target_date);
      setEditPriority(data.priority);

      return data;
    },
    enabled: !!goalId,
  });

  // Fetch milestones
  const { data: milestones = [] } = useGoalMilestones(goalId || '');

  // Fetch activity
  const { data: activities = [] } = useQuery<GoalActivity[]>({
    queryKey: ['goal-activity', goalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goal_activity_log')
        .select('*')
        .eq('goal_id', goalId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    enabled: !!goalId,
  });

  if (loadingGoal) {
    return (
      <div className="container max-w-6xl mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>Objectif non trouvé</AlertDescription>
        </Alert>
      </div>
    );
  }

  const daysRemaining = differenceInDays(new Date(goal.target_date), new Date());
  const isOverdue = daysRemaining < 0 && goal.status === 'active';
  const isNearDeadline = daysRemaining <= 7 && daysRemaining >= 0 && goal.status === 'active';

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      edn: '📚',
      quiz: '📝',
      study_time: '⏱️',
      streak: '🔥',
      badge: '🏆',
      custom: '🎯',
    };
    return icons[category] || '🎯';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, 'destructive' | 'default' | 'secondary'> = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary',
    };
    return colors[priority] || 'default';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
      active: 'default',
      completed: 'secondary',
      paused: 'outline',
      failed: 'destructive',
    };
    return colors[status] || 'outline';
  };

  const handleUpdate = async () => {
    await updateGoal.mutateAsync({
      goalId: goal.id,
      updates: {
        title: editTitle,
        description: editDescription,
        target_date: editTargetDate,
        priority: editPriority,
      },
    });
    setIsEditDialogOpen(false);
  };

  const handleDelete = async () => {
    await deleteGoal.mutateAsync(goal.id);
    navigate('/goals');
  };

  const handleStatusChange = async (newStatus: UserGoal['status']) => {
    await updateGoal.mutateAsync({
      goalId: goal.id,
      updates: { status: newStatus },
    });
  };

  const handleProgressUpdate = async () => {
    if (progressIncrement === 0) {
      toast({
        title: 'Validation',
        description: 'Veuillez entrer une progression',
        variant: 'destructive',
      });
      return;
    }

    await updateProgress.mutateAsync({
      goalId: goal.id,
      progressIncrement,
    });
    setIsProgressDialogOpen(false);
    setProgressIncrement(0);
  };

  const handleCreateMilestone = async () => {
    if (!milestoneTitle.trim()) {
      toast({
        title: 'Validation',
        description: 'Le titre est requis',
        variant: 'destructive',
      });
      return;
    }

    await createMilestone.mutateAsync({
      goal_id: goal.id,
      title: milestoneTitle,
      description: milestoneDescription || null,
      target_value: milestoneTarget,
      order_index: milestones.length,
    });

    setIsMilestoneDialogOpen(false);
    setMilestoneTitle('');
    setMilestoneDescription('');
    setMilestoneTarget(0);
  };

  const completedMilestones = milestones.filter(m => m.completed).length;
  const milestoneProgress = milestones.length > 0
    ? (completedMilestones / milestones.length) * 100
    : 0;

  return (
    <div className="container max-w-6xl mx-auto p-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/goals')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour aux objectifs
      </Button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-4 rounded-lg bg-purple-100 text-purple-600 text-4xl">
              {getCategoryIcon(goal.category)}
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{goal.title}</h1>
              {goal.description && (
                <p className="text-muted-foreground text-lg">{goal.description}</p>
              )}
              <div className="flex gap-2 mt-3">
                <Badge variant={getPriorityColor(goal.priority)}>
                  Priorité: {goal.priority}
                </Badge>
                <Badge variant={getStatusColor(goal.status)}>
                  {goal.status}
                </Badge>
                <Badge variant="outline">
                  <Calendar className="h-3 w-3 mr-1" />
                  Créé le {format(new Date(goal.created_at), 'dd MMM yyyy', { locale: fr })}
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsProgressDialogOpen(true)}>
                <Zap className="h-4 w-4 mr-2" />
                Mettre à jour la progression
              </DropdownMenuItem>
              {goal.status === 'active' && (
                <DropdownMenuItem onClick={() => handleStatusChange('paused')}>
                  <Pause className="h-4 w-4 mr-2" />
                  Mettre en pause
                </DropdownMenuItem>
              )}
              {goal.status === 'paused' && (
                <DropdownMenuItem onClick={() => handleStatusChange('active')}>
                  <Play className="h-4 w-4 mr-2" />
                  Reprendre
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Progression Globale</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progression</span>
              <span className="text-2xl font-bold">{goal.progress_percentage}%</span>
            </div>
            <Progress value={goal.progress_percentage} className="h-4" />
            <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
              <span>
                {goal.current_value} / {goal.target_value} {goal.unit || ''}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsProgressDialogOpen(true)}
              >
                <Zap className="h-3 w-3 mr-1" />
                Mettre à jour
              </Button>
            </div>
          </div>

          <Separator />

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <Calendar className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <div className="text-2xl font-bold">
                {format(new Date(goal.target_date), 'dd MMM', { locale: fr })}
              </div>
              <div className="text-xs text-muted-foreground">Échéance</div>
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <div className={`text-2xl font-bold ${
                isOverdue ? 'text-destructive' : isNearDeadline ? 'text-yellow-600' : ''
              }`}>
                {Math.abs(daysRemaining)}
              </div>
              <div className="text-xs text-muted-foreground">
                {isOverdue ? 'jours de retard' : 'jours restants'}
              </div>
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <TrendingUp className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <div className="text-2xl font-bold">{completedMilestones}/{milestones.length}</div>
              <div className="text-xs text-muted-foreground">Étapes complétées</div>
            </div>
          </div>

          {/* Completion Badge */}
          {goal.status === 'completed' && goal.completed_at && (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <div className="font-semibold text-green-600">Objectif atteint !</div>
                <div className="text-sm text-muted-foreground">
                  Complété le {format(new Date(goal.completed_at), 'dd MMMM yyyy', { locale: fr })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="milestones" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="milestones">
            Étapes ({milestones.length})
          </TabsTrigger>
          <TabsTrigger value="activity">
            Activité ({activities.length})
          </TabsTrigger>
        </TabsList>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Étapes Intermédiaires</CardTitle>
                  <CardDescription>
                    Découpez votre objectif en petites étapes réalisables
                  </CardDescription>
                </div>
                <Button onClick={() => setIsMilestoneDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une étape
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {milestones.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progression des étapes</span>
                    <span className="text-sm font-medium">{milestoneProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={milestoneProgress} />
                </div>
              )}

              {milestones.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Aucune étape définie</h3>
                  <p className="text-muted-foreground mb-4">
                    Ajoutez des étapes pour suivre votre progression de manière détaillée
                  </p>
                  <Button onClick={() => setIsMilestoneDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une étape
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {milestones.map((milestone) => (
                    <Card
                      key={milestone.id}
                      className={milestone.completed ? 'bg-muted/50' : ''}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => {
                              if (!milestone.completed) {
                                completeMilestone.mutate({
                                  milestoneId: milestone.id,
                                  goalId: goal.id,
                                });
                              }
                            }}
                            className={`mt-1 ${milestone.completed ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            {milestone.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                            )}
                          </button>
                          <div className="flex-1">
                            <h4 className={`font-semibold ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {milestone.title}
                            </h4>
                            {milestone.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {milestone.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                Cible: {milestone.target_value} {goal.unit || ''}
                              </Badge>
                              {milestone.completed && milestone.completed_at && (
                                <span className="text-xs text-muted-foreground">
                                  Complété {formatDistanceToNow(new Date(milestone.completed_at), {
                                    addSuffix: true,
                                    locale: fr
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique d'Activité</CardTitle>
              <CardDescription>
                Toutes les modifications et mises à jour de cet objectif
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Aucune activité</h3>
                  <p className="text-muted-foreground">
                    L'historique des modifications apparaîtra ici
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">{activity.activity_type}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.created_at), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'Objectif</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de votre objectif
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Titre</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Titre de l'objectif"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description..."
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date d'échéance</label>
              <Input
                type="date"
                value={editTargetDate}
                onChange={(e) => setEditTargetDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdate}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progress Update Dialog */}
      <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mettre à Jour la Progression</DialogTitle>
            <DialogDescription>
              Ajoutez à votre progression actuelle ({goal.current_value} {goal.unit || ''})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Incrément</label>
              <Input
                type="number"
                value={progressIncrement}
                onChange={(e) => setProgressIncrement(Number(e.target.value))}
                placeholder="0"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Nouvelle valeur: {goal.current_value + progressIncrement} / {goal.target_value}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProgressDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleProgressUpdate}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Milestone Dialog */}
      <Dialog open={isMilestoneDialogOpen} onOpenChange={setIsMilestoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une Étape</DialogTitle>
            <DialogDescription>
              Créez une étape intermédiaire pour cet objectif
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Titre *</label>
              <Input
                value={milestoneTitle}
                onChange={(e) => setMilestoneTitle(e.target.value)}
                placeholder="Ex: Compléter 25 items"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={milestoneDescription}
                onChange={(e) => setMilestoneDescription(e.target.value)}
                placeholder="Description de l'étape..."
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Valeur cible</label>
              <Input
                type="number"
                value={milestoneTarget}
                onChange={(e) => setMilestoneTarget(Number(e.target.value))}
                placeholder="25"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMilestoneDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateMilestone}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'Objectif</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{goal.title}" ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoalDetail;
