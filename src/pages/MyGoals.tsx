import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  CheckCircle2, 
  Flag, 
  Plus, 
  Target, 
  Trash2, 
  Trophy,
  TrendingUp
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface UserGoal {
  id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  category: string;
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  is_completed: boolean;
}

const MyGoals = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_value: 100,
    category: 'study',
    priority: 'medium',
    deadline: '',
  });

  const [goals, setGoals] = useState<UserGoal[]>([
    {
      id: '1',
      title: 'Maîtriser 50 items EDN',
      description: 'Atteindre 80% de maîtrise sur 50 items prioritaires',
      target_value: 50,
      current_value: 32,
      category: 'study',
      priority: 'high',
      deadline: '2026-03-01',
      is_completed: false,
    },
    {
      id: '2',
      title: 'Score 15/20 aux QCM',
      description: 'Maintenir une moyenne de 15/20 sur les examens blancs',
      target_value: 100,
      current_value: 75,
      category: 'exam',
      priority: 'medium',
      deadline: '2026-02-15',
      is_completed: false,
    },
  ]);

  const createGoal = () => {
    const newGoal: UserGoal = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      target_value: formData.target_value,
      current_value: 0,
      category: formData.category,
      priority: formData.priority as 'low' | 'medium' | 'high',
      deadline: formData.deadline,
      is_completed: false,
    };
    setGoals(prev => [...prev, newGoal]);
    setIsDialogOpen(false);
    resetForm();
    toast.success('Objectif créé !');
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    toast.success('Objectif supprimé');
  };

  const completeGoal = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, is_completed: true } : g));
    toast.success('Objectif complété !');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      target_value: 100,
      category: 'study',
      priority: 'medium',
      deadline: '',
    });
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Haute</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-warning/20 text-warning">Moyenne</Badge>;
      case 'low':
        return <Badge variant="outline">Basse</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'study':
        return '📚';
      case 'exam':
        return '🎯';
      case 'music':
        return '🎵';
      case 'health':
        return '💪';
      default:
        return '⭐';
    }
  };

  const getDaysRemaining = (deadline: string) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const activeGoals = goals.filter(g => !g.is_completed);
  const completedGoals = goals.filter(g => g.is_completed);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Mes Objectifs</h1>
          </div>
          <p className="text-muted-foreground">
            Définissez et suivez vos objectifs d'apprentissage
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvel objectif
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un objectif</DialogTitle>
              <DialogDescription>
                Définissez un objectif clair et mesurable
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Maîtriser les 100 items EDN"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez votre objectif..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target">Cible</Label>
                  <Input
                    id="target"
                    type="number"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="study">📚 Étude</SelectItem>
                      <SelectItem value="exam">🎯 Examen</SelectItem>
                      <SelectItem value="music">🎵 Musique</SelectItem>
                      <SelectItem value="health">💪 Santé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priorité</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(v) => setFormData({ ...formData, priority: v })}
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
                <div className="space-y-2">
                  <Label htmlFor="deadline">Date limite</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={createGoal}
                disabled={!formData.title}
              >
                Créer l'objectif
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Objectifs actifs</p>
                <p className="text-2xl font-bold">{activeGoals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-success" />
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
                <p className="text-sm text-muted-foreground">Progression moyenne</p>
                <p className="text-2xl font-bold">
                  {activeGoals.length > 0
                    ? Math.round(
                        activeGoals.reduce((acc, g) => acc + (g.current_value / g.target_value) * 100, 0) /
                          activeGoals.length
                      )
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Goals */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Flag className="h-5 w-5 text-primary" />
          Objectifs en cours
        </h2>

        {activeGoals.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {activeGoals.map((goal) => {
              const progress = (goal.current_value / goal.target_value) * 100;
              const daysRemaining = getDaysRemaining(goal.deadline);

              return (
                <Card key={goal.id} className="relative overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                        <div>
                          <CardTitle className="text-lg">{goal.title}</CardTitle>
                          <CardDescription>{goal.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteGoal(goal.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getPriorityBadge(goal.priority)}
                      {daysRemaining !== null && (
                        <Badge variant="outline" className="gap-1">
                          <Calendar className="h-3 w-3" />
                          {daysRemaining > 0 ? `${daysRemaining}j restants` : 'Échéance passée'}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progression</span>
                        <span>{goal.current_value}/{goal.target_value}</span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>

                    {progress >= 100 && (
                      <Button 
                        className="w-full gap-2"
                        onClick={() => completeGoal(goal.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Marquer comme complété
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Aucun objectif actif pour le moment.
              </p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                Créer mon premier objectif
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-success" />
            Objectifs atteints
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {completedGoals.slice(0, 6).map((goal) => (
              <Card key={goal.id} className="bg-success/5 border-success/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">{goal.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {getCategoryIcon(goal.category)} {goal.category}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGoals;
