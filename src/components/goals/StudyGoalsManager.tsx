import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useStudyGoals, StudyGoal } from '@/hooks/useStudyGoals';
import { 
  Calendar, 
  CheckCircle2, 
  Flag, 
  Loader2, 
  Plus, 
  Target, 
  Trash2,
  TrendingUp
} from 'lucide-react';
import { useState } from 'react';

const GOAL_TYPES = [
  { value: 'items_reviewed', label: 'Items révisés' },
  { value: 'songs_listened', label: 'Chansons écoutées' },
  { value: 'quizzes_completed', label: 'QCM complétés' },
  { value: 'pomodoro_sessions', label: 'Sessions Pomodoro' },
  { value: 'clinical_cases', label: 'Cas cliniques' },
  { value: 'streak_days', label: 'Jours de série' },
];

const PRIORITIES = [
  { value: 'low', label: 'Basse', color: 'bg-muted text-muted-foreground' },
  { value: 'medium', label: 'Moyenne', color: 'bg-warning/20 text-warning' },
  { value: 'high', label: 'Haute', color: 'bg-destructive/20 text-destructive' },
];

export function StudyGoalsManager() {
  const { 
    activeGoals, 
    completedGoals, 
    completionRate,
    isLoading, 
    createGoal, 
    updateGoal,
    deleteGoal,
    isCreating 
  } = useStudyGoals();

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target_type: 'items_reviewed',
    target_value: 10,
    deadline: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const handleCreate = () => {
    if (!newGoal.title.trim()) return;
    
    createGoal({
      title: newGoal.title,
      description: newGoal.description || null,
      target_type: newGoal.target_type,
      target_value: newGoal.target_value,
      deadline: newGoal.deadline || null,
      priority: newGoal.priority,
    });
    
    setShowNewDialog(false);
    setNewGoal({
      title: '',
      description: '',
      target_type: 'items_reviewed',
      target_value: 10,
      deadline: '',
      priority: 'medium',
    });
  };

  const getPriorityBadge = (priority: string) => {
    const p = PRIORITIES.find(pr => pr.value === priority);
    return (
      <Badge className={p?.color || ''}>
        <Flag className="h-3 w-3 mr-1" />
        {p?.label || priority}
      </Badge>
    );
  };

  const getProgressColor = (goal: StudyGoal) => {
    const progress = (goal.current_value / goal.target_value) * 100;
    if (progress >= 100) return 'bg-success';
    if (progress >= 50) return 'bg-primary';
    return 'bg-warning';
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
      {/* Header avec stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Mes Objectifs
          </h2>
          <p className="text-muted-foreground">
            {activeGoals.length} objectif{activeGoals.length > 1 ? 's' : ''} en cours
          </p>
        </div>

        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvel objectif
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un objectif</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Titre</Label>
                <Input
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Réviser tous les items de cardiologie"
                />
              </div>

              <div className="space-y-2">
                <Label>Description (optionnel)</Label>
                <Textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Détails supplémentaires..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newGoal.target_type}
                    onValueChange={(v) => setNewGoal(prev => ({ ...prev, target_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GOAL_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Objectif</Label>
                  <Input
                    type="number"
                    min={1}
                    value={newGoal.target_value}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, target_value: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Échéance (optionnel)</Label>
                  <Input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Priorité</Label>
                  <Select
                    value={newGoal.priority}
                    onValueChange={(v) => setNewGoal(prev => ({ ...prev, priority: v as 'low' | 'medium' | 'high' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map(p => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleCreate} className="w-full" disabled={isCreating || !newGoal.title.trim()}>
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Créer l'objectif
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En cours</p>
                <p className="text-2xl font-bold">{activeGoals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Complétés</p>
                <p className="text-2xl font-bold">{completedGoals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taux de réussite</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active goals */}
      <Card>
        <CardHeader>
          <CardTitle>Objectifs actifs</CardTitle>
          <CardDescription>Suivez votre progression</CardDescription>
        </CardHeader>
        <CardContent>
          {activeGoals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun objectif en cours</p>
              <p className="text-sm">Créez votre premier objectif pour commencer !</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeGoals.map((goal) => (
                <div key={goal.id} className="p-4 rounded-lg border bg-card space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{goal.title}</h4>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(goal.priority)}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteGoal(goal.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{goal.current_value} / {goal.target_value}</span>
                      <span>{Math.round((goal.current_value / goal.target_value) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(goal.current_value / goal.target_value) * 100} 
                      className="h-2"
                    />
                  </div>

                  {goal.deadline && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Échéance: {new Date(goal.deadline).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Objectifs atteints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completedGoals.slice(0, 5).map((goal) => (
                <div 
                  key={goal.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20"
                >
                  <span className="font-medium">{goal.title}</span>
                  <Badge variant="outline" className="text-success border-success">
                    ✅ Complété
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default StudyGoalsManager;
