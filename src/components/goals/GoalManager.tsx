import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Target,
  Plus,
  Calendar,
  TrendingUp,
  Award,
  MoreVertical,
  Edit,
  Trash2,
  Pause,
  Play,
  CheckCircle2,
  Clock,
  Flag,
} from 'lucide-react';
import {
  useUserGoals,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
  useUpdateGoalProgress,
  UserGoal,
} from '@/hooks/useGoals';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export const GoalManager: React.FC = () => {
  const { data: goals = [], isLoading } = useUserGoals();
  const [selectedStatus, setSelectedStatus] = useState<'all' | UserGoal['status']>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingGoal, setEditingGoal] = useState<UserGoal | null>(null);

  const filteredGoals = selectedStatus === 'all'
    ? goals
    : goals.filter(g => g.status === selectedStatus);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Chargement de vos objectifs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mes Objectifs</h2>
          <p className="text-muted-foreground">
            Définissez et suivez vos objectifs d'apprentissage
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel objectif
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <GoalForm onClose={() => setIsCreating(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={selectedStatus} onValueChange={(value: any) => setSelectedStatus(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les objectifs</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="completed">Complétés</SelectItem>
            <SelectItem value="paused">En pause</SelectItem>
            <SelectItem value="failed">Échoués</SelectItem>
          </SelectContent>
        </Select>

        <div className="text-sm text-muted-foreground">
          {filteredGoals.length} objectif{filteredGoals.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={() => setEditingGoal(goal)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {selectedStatus === 'all' ? 'Aucun objectif' : `Aucun objectif ${selectedStatus}`}
            </h3>
            <p className="text-muted-foreground mb-4">
              Créez votre premier objectif pour commencer à suivre votre progression
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Créer un objectif
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      {editingGoal && (
        <Dialog open={!!editingGoal} onOpenChange={() => setEditingGoal(null)}>
          <DialogContent className="max-w-2xl">
            <GoalForm
              initialGoal={editingGoal}
              onClose={() => setEditingGoal(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

interface GoalCardProps {
  goal: UserGoal;
  onEdit: () => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit }) => {
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const updateProgress = useUpdateGoalProgress();

  const daysRemaining = differenceInDays(new Date(goal.target_date), new Date());
  const isOverdue = daysRemaining < 0 && goal.status === 'active';
  const isNearDeadline = daysRemaining <= 7 && daysRemaining >= 0 && goal.status === 'active';

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'edn': return '📚';
      case 'quiz': return '📝';
      case 'study_time': return '⏱️';
      case 'streak': return '🔥';
      case 'badge': return '🏆';
      default: return '🎯';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'paused': return 'outline';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const handleStatusChange = (newStatus: UserGoal['status']) => {
    updateGoal.mutate({
      goalId: goal.id,
      updates: { status: newStatus },
    });
  };

  const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) {
      deleteGoal.mutate(goal.id);
    }
  };

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
            <div>
              <CardTitle className="text-lg">{goal.title}</CardTitle>
              {goal.description && (
                <CardDescription className="mt-1">
                  {goal.description}
                </CardDescription>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              {goal.status === 'active' && (
                <DropdownMenuItem onClick={() => handleStatusChange('paused')}>
                  <Pause className="mr-2 h-4 w-4" />
                  Mettre en pause
                </DropdownMenuItem>
              )}
              {goal.status === 'paused' && (
                <DropdownMenuItem onClick={() => handleStatusChange('active')}>
                  <Play className="mr-2 h-4 w-4" />
                  Reprendre
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-2 mt-2">
          <Badge variant={getPriorityColor(goal.priority)}>
            {goal.priority}
          </Badge>
          <Badge variant={getStatusColor(goal.status)}>
            {goal.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-medium">{goal.progress_percentage}%</span>
          </div>
          <Progress value={goal.progress_percentage} className="w-full" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {goal.current_value} / {goal.target_value} {goal.unit || ''}
            </span>
          </div>
        </div>

        <Separator />

        {/* Timeline */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Échéance: {format(new Date(goal.target_date), 'dd MMM yyyy', { locale: fr })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {isOverdue ? (
              <span className="text-destructive font-medium">
                En retard de {Math.abs(daysRemaining)} jour{Math.abs(daysRemaining) > 1 ? 's' : ''}
              </span>
            ) : isNearDeadline ? (
              <span className="text-yellow-600 font-medium">
                {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant{daysRemaining > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-muted-foreground">
                {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant{daysRemaining > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Completion Badge */}
        {goal.status === 'completed' && goal.completed_at && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div className="text-sm">
              <div className="font-medium text-green-600">Objectif atteint !</div>
              <div className="text-muted-foreground">
                {format(new Date(goal.completed_at), 'dd MMM yyyy', { locale: fr })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface GoalFormProps {
  initialGoal?: UserGoal;
  onClose: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ initialGoal, onClose }) => {
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();

  const [formData, setFormData] = useState({
    title: initialGoal?.title || '',
    description: initialGoal?.description || '',
    category: initialGoal?.category || 'edn' as UserGoal['category'],
    goal_type: initialGoal?.goal_type || 'completion' as UserGoal['goal_type'],
    target_value: initialGoal?.target_value || 0,
    unit: initialGoal?.unit || '',
    target_date: initialGoal?.target_date || '',
    priority: initialGoal?.priority || 'medium' as UserGoal['priority'],
    reminder_enabled: initialGoal?.reminder_enabled ?? true,
    reminder_frequency: initialGoal?.reminder_frequency || 'daily' as UserGoal['reminder_frequency'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (initialGoal) {
      // Update existing goal
      await updateGoal.mutateAsync({
        goalId: initialGoal.id,
        updates: formData,
      });
    } else {
      // Create new goal
      await createGoal.mutateAsync({
        ...formData,
        start_date: new Date().toISOString().split('T')[0],
        status: 'active',
        metadata: {},
      } as any);
    }

    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {initialGoal ? 'Modifier l\'objectif' : 'Créer un nouvel objectif'}
        </DialogTitle>
        <DialogDescription>
          Définissez un objectif pour suivre votre progression
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div>
          <label className="text-sm font-medium">Titre *</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ex: Compléter 50 items EDN"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Décrivez votre objectif..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Catégorie *</label>
            <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="edn">📚 EDN</SelectItem>
                <SelectItem value="quiz">📝 Quiz</SelectItem>
                <SelectItem value="study_time">⏱️ Temps d'étude</SelectItem>
                <SelectItem value="streak">🔥 Streak</SelectItem>
                <SelectItem value="badge">🏆 Badges</SelectItem>
                <SelectItem value="custom">🎯 Personnalisé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Type *</label>
            <Select value={formData.goal_type} onValueChange={(value: any) => setFormData({ ...formData, goal_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completion">Complétion</SelectItem>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="time">Temps</SelectItem>
                <SelectItem value="streak">Streak</SelectItem>
                <SelectItem value="count">Compteur</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Objectif *</label>
            <Input
              type="number"
              value={formData.target_value}
              onChange={(e) => setFormData({ ...formData, target_value: Number(e.target.value) })}
              placeholder="100"
              min="1"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Unité</label>
            <Input
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="items, heures, %"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Priorité *</label>
            <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
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
          <label className="text-sm font-medium">Date d'échéance *</label>
          <Input
            type="date"
            value={formData.target_date}
            onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" disabled={createGoal.isPending || updateGoal.isPending}>
          {initialGoal ? 'Mettre à jour' : 'Créer'}
        </Button>
      </DialogFooter>
    </form>
  );
};
