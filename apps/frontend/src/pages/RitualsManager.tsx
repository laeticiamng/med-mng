import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Plus,
  Sparkles,
  Clock,
  Calendar,
  TrendingUp,
  CheckCircle,
  Flame,
  MoreVertical,
  Edit,
  Trash2,
  Bell,
  BellOff,
  Target,
} from 'lucide-react';
import {
  useRituals,
  useRitualStats,
  useCreateRitual,
  useToggleRitual,
  useCompleteRitual,
  useUncompleteRitual,
  useDeleteRitual,
  RitualWithStats,
} from '@/hooks/useRituals';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const defaultIcons = ['🧘', '📝', '📚', '🧘‍♀️', '💧', '🚶', '🏃', '🎯', '💪', '🧠', '☕', '🌅', '🌙', '❤️'];

const categoryConfig = {
  morning: { label: 'Matin', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  afternoon: { label: 'Après-midi', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  evening: { label: 'Soir', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  anytime: { label: 'Flexible', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' },
};

interface RitualFormData {
  name: string;
  description: string;
  time: string;
  duration_minutes: number;
  category: 'morning' | 'afternoon' | 'evening' | 'anytime';
  icon: string;
  reminder_enabled: boolean;
  reminder_minutes_before: number;
}

const defaultFormData: RitualFormData = {
  name: '',
  description: '',
  time: '08:00',
  duration_minutes: 10,
  category: 'morning',
  icon: '🧘',
  reminder_enabled: true,
  reminder_minutes_before: 5,
};

export default function RitualsManager() {
  const { user } = useAuth();
  const { data: rituals, isLoading } = useRituals();
  const { data: stats } = useRitualStats();
  const createRitual = useCreateRitual();
  const toggleRitual = useToggleRitual();
  const completeRitual = useCompleteRitual();
  const uncompleteRitual = useUncompleteRitual();
  const deleteRitual = useDeleteRitual();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState<RitualFormData>(defaultFormData);

  const handleCreateRitual = async () => {
    if (!formData.name.trim()) {
      toast.error('Veuillez entrer un nom pour le rituel');
      return;
    }

    try {
      await createRitual.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        time: formData.time,
        duration_minutes: formData.duration_minutes,
        category: formData.category,
        icon: formData.icon,
        is_active: true,
        reminder_enabled: formData.reminder_enabled,
        reminder_minutes_before: formData.reminder_minutes_before,
      });
      toast.success('Rituel créé avec succès');
      setShowCreateDialog(false);
      setFormData(defaultFormData);
    } catch (error) {
      toast.error('Erreur lors de la création du rituel');
    }
  };

  const handleToggleRitual = async (ritual: RitualWithStats, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await toggleRitual.mutateAsync({ id: ritual.id, isActive: !ritual.is_active });
      toast.success(ritual.is_active ? 'Rituel désactivé' : 'Rituel activé');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleCompleteRitual = async (ritual: RitualWithStats, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (ritual.completedToday) {
        await uncompleteRitual.mutateAsync(ritual.id);
        toast.info('Complétion annulée');
      } else {
        await completeRitual.mutateAsync({
          ritualId: ritual.id,
          durationMinutes: ritual.duration_minutes,
        });
        toast.success('Rituel complété !', {
          description: `${ritual.name} - Série de ${ritual.currentStreak + 1} jours`,
        });
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteRitual = async (ritualId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await deleteRitual.mutateAsync(ritualId);
      toast.success('Rituel supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Calculate total daily time
  const totalDailyMinutes = rituals
    ?.filter((r) => r.is_active)
    .reduce((sum, r) => sum + r.duration_minutes, 0) || 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Connectez-vous pour gérer vos rituels</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Mes Rituels | Med-Mng</title>
        <meta name="description" content="Gérez vos habitudes et rituels quotidiens" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Link to={ROUTE_PATHS.wellness}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au Bien-être
            </Button>
          </Link>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Mes Rituels</h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Construisez des habitudes saines et durables
              </p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau Rituel
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Créer un nouveau rituel</DialogTitle>
                  <DialogDescription>
                    Définissez une nouvelle habitude quotidienne
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Icon selector */}
                  <div className="space-y-2">
                    <Label>Icône</Label>
                    <div className="flex flex-wrap gap-2">
                      {defaultIcons.map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setFormData((d) => ({ ...d, icon }))}
                          className={cn(
                            'text-2xl p-2 rounded-lg border-2 transition-colors',
                            formData.icon === icon
                              ? 'border-primary bg-primary/10'
                              : 'border-transparent hover:border-muted'
                          )}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du rituel</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Méditation matinale"
                      value={formData.name}
                      onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optionnel)</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez votre rituel..."
                      value={formData.description}
                      onChange={(e) => setFormData((d) => ({ ...d, description: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  {/* Time and Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="time">Heure</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData((d) => ({ ...d, time: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Durée (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min={1}
                        max={180}
                        value={formData.duration_minutes}
                        onChange={(e) =>
                          setFormData((d) => ({ ...d, duration_minutes: parseInt(e.target.value) || 10 }))
                        }
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: RitualFormData['category']) =>
                        setFormData((d) => ({ ...d, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reminder */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-muted-foreground" />
                      <Label>Rappel</Label>
                    </div>
                    <Switch
                      checked={formData.reminder_enabled}
                      onCheckedChange={(checked) =>
                        setFormData((d) => ({ ...d, reminder_enabled: checked }))
                      }
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateRitual} disabled={createRitual.isPending}>
                    Créer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Rituels Actifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {stats?.activeRituals || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  sur {stats?.totalRituals || 0} rituels
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Complétés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {stats?.completedToday || 0}
                </div>
                <p className="text-xs text-muted-foreground">aujourd'hui</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Temps Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{totalDailyMinutes}</div>
                <p className="text-xs text-muted-foreground">minutes/jour</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Flame className="w-4 h-4 text-orange-600" />
                  Série
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {stats?.currentStreak || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  jours (record: {stats?.longestStreak || 0})
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Rituals list */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Liste des Rituels
              </CardTitle>
              <CardDescription>
                Cliquez pour marquer comme complété, utilisez le switch pour activer/désactiver
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : rituals && rituals.length > 0 ? (
                <div className="space-y-3">
                  {rituals.map((ritual) => {
                    const catConfig = categoryConfig[ritual.category];

                    return (
                      <Card
                        key={ritual.id}
                        className={cn(
                          'transition-all cursor-pointer hover:shadow-md',
                          ritual.completedToday && 'bg-green-50 dark:bg-green-900/20 border-green-200'
                        )}
                        onClick={(e) => handleCompleteRitual(ritual, e)}
                      >
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div
                                className={cn(
                                  'text-4xl p-2 rounded-lg',
                                  ritual.completedToday
                                    ? 'bg-green-100 dark:bg-green-800'
                                    : 'bg-muted'
                                )}
                              >
                                {ritual.icon || '🎯'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">{ritual.name}</h3>
                                  {ritual.completedToday && (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  )}
                                  <Badge className={catConfig.color}>{catConfig.label}</Badge>
                                  {!ritual.is_active && (
                                    <Badge variant="outline">Inactif</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {ritual.time} · {ritual.duration_minutes} min
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Flame className="w-3 h-3 text-orange-500" />
                                    {ritual.currentStreak} jours
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Target className="w-3 h-3 text-blue-500" />
                                    {ritual.completionRate}%
                                  </span>
                                </div>
                                {/* Progress bar */}
                                <Progress
                                  value={ritual.completionRate}
                                  className="h-1 mt-2"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              <Switch
                                checked={ritual.is_active}
                                onClick={(e) => handleToggleRitual(ritual, e)}
                              />
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    {ritual.reminder_enabled ? (
                                      <>
                                        <BellOff className="w-4 h-4 mr-2" />
                                        Désactiver rappel
                                      </>
                                    ) : (
                                      <>
                                        <Bell className="w-4 h-4 mr-2" />
                                        Activer rappel
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={(e) => handleDeleteRitual(ritual.id, e)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Aucun rituel</h3>
                  <p className="text-muted-foreground mb-4">
                    Créez votre premier rituel pour commencer à construire de bonnes habitudes
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un rituel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly completion rate */}
          {stats && stats.totalRituals > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Taux de réussite
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-green-600">
                    {stats.completionRate}%
                  </div>
                  <div className="flex-1">
                    <Progress value={stats.completionRate} className="h-3" />
                    <p className="text-sm text-muted-foreground mt-1">
                      {stats.totalCompletions} rituels complétés ces 30 derniers jours
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
