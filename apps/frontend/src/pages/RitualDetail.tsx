import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft, Edit, Trash2, Clock, Calendar, Flame, TrendingUp,
  CheckCircle, XCircle, Bell, Target, Sparkles
} from 'lucide-react';
import {
  useRituals,
  useRitualHistory,
  useUpdateRitual,
  useDeleteRitual,
  useCompleteRitual,
  useUncompleteRitual,
  RitualWithStats,
} from '@/hooks/useRituals';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format, subDays, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

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
}

export default function RitualDetail() {
  const { ritualId } = useParams<{ ritualId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: rituals, isLoading } = useRituals();
  const { data: history } = useRitualHistory(ritualId, 30);
  const updateRitual = useUpdateRitual();
  const deleteRitual = useDeleteRitual();
  const completeRitual = useCompleteRitual();
  const uncompleteRitual = useUncompleteRitual();

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState<RitualFormData>({
    name: '',
    description: '',
    time: '08:00',
    duration_minutes: 10,
    category: 'morning',
    icon: '🧘',
    reminder_enabled: true,
  });

  // Find the specific ritual
  const ritual = useMemo(() => {
    return rituals?.find((r) => r.id === ritualId);
  }, [rituals, ritualId]);

  // Calculate week history
  const weekHistory = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: today });

    return days.map((day) => {
      const completed = history?.some((h) =>
        isSameDay(new Date(h.completed_at), day)
      );
      return {
        date: day,
        dayName: format(day, 'EEE', { locale: fr }),
        completed: !!completed,
        isToday: isSameDay(day, today),
      };
    });
  }, [history]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!ritual) return [];

    const totalCompletions = history?.length || 0;
    const last30Days = 30;
    const completionRate = Math.round((totalCompletions / last30Days) * 100);

    return [
      {
        label: 'Série Actuelle',
        value: ritual.currentStreak,
        unit: 'jours',
        icon: Flame,
        color: 'text-orange-600',
      },
      {
        label: 'Total Complété',
        value: totalCompletions,
        unit: 'fois',
        icon: TrendingUp,
        color: 'text-green-600',
      },
      {
        label: 'Taux Réussite',
        value: Math.min(100, completionRate),
        unit: '%',
        icon: Target,
        color: 'text-blue-600',
      },
    ];
  }, [ritual, history]);

  const handleOpenEdit = () => {
    if (ritual) {
      setFormData({
        name: ritual.name,
        description: ritual.description || '',
        time: ritual.time,
        duration_minutes: ritual.duration_minutes,
        category: ritual.category,
        icon: ritual.icon || '🧘',
        reminder_enabled: ritual.reminder_enabled,
      });
      setShowEditDialog(true);
    }
  };

  const handleUpdate = async () => {
    if (!ritual || !formData.name.trim()) {
      toast.error('Veuillez entrer un nom');
      return;
    }

    try {
      await updateRitual.mutateAsync({
        id: ritual.id,
        updates: {
          name: formData.name,
          description: formData.description || undefined,
          time: formData.time,
          duration_minutes: formData.duration_minutes,
          category: formData.category,
          icon: formData.icon,
          reminder_enabled: formData.reminder_enabled,
        },
      });
      toast.success('Rituel mis à jour');
      setShowEditDialog(false);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async () => {
    if (!ritual) return;

    try {
      await deleteRitual.mutateAsync(ritual.id);
      toast.success('Rituel supprimé');
      navigate(ROUTE_PATHS.wellnessRituals);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleToggleToday = async () => {
    if (!ritual) return;

    try {
      if (ritual.completedToday) {
        await uncompleteRitual.mutateAsync(ritual.id);
        toast.info('Complétion annulée');
      } else {
        await completeRitual.mutateAsync({
          ritualId: ritual.id,
          durationMinutes: ritual.duration_minutes,
        });
        toast.success('Rituel complété !');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-10 w-40 mb-4" />
          <Skeleton className="h-48 mb-6" />
          <div className="grid grid-cols-3 gap-6 mb-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  // Not found state
  if (!ritual) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link to={ROUTE_PATHS.wellnessRituals}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux Rituels
            </Button>
          </Link>
          <Card>
            <CardContent className="py-12 text-center">
              <XCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">Rituel introuvable</h3>
              <p className="text-muted-foreground">
                Ce rituel n'existe pas ou a été supprimé.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const catConfig = categoryConfig[ritual.category];

  return (
    <>
      <Helmet>
        <title>{ritual.name} | Med-Mng</title>
        <meta name="description" content={ritual.description || ''} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link to={ROUTE_PATHS.wellnessRituals}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux Rituels
            </Button>
          </Link>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{ritual.icon || '🎯'}</div>
                  <div>
                    <CardTitle className="text-3xl mb-2">{ritual.name}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={catConfig.color}>{catConfig.label}</Badge>
                      {ritual.is_active ? (
                        <Badge variant="secondary">Actif</Badge>
                      ) : (
                        <Badge variant="outline">Inactif</Badge>
                      )}
                      {ritual.completedToday && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Fait aujourd'hui
                        </Badge>
                      )}
                    </div>
                    {ritual.description && (
                      <p className="text-muted-foreground">{ritual.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleOpenEdit}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {ritual.time}
                </span>
                <span>·</span>
                <span>{ritual.duration_minutes} min</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Bell className="w-3 h-3" />
                  Rappel {ritual.reminder_enabled ? 'activé' : 'désactivé'}
                </span>
              </div>

              <Button
                onClick={handleToggleToday}
                className={cn(
                  'w-full',
                  ritual.completedToday
                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    : 'bg-green-500 hover:bg-green-600'
                )}
              >
                {ritual.completedToday ? (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Annuler la complétion d'aujourd'hui
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marquer comme fait
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                      {stat.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${stat.color}`}>
                      {stat.value}
                      <span className="text-lg text-muted-foreground ml-1">{stat.unit}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Cette Semaine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-3">
                {weekHistory.map((day) => (
                  <div key={day.date.toISOString()} className="text-center">
                    <div className="text-sm text-muted-foreground mb-2 capitalize">
                      {day.dayName}
                    </div>
                    <div
                      className={cn(
                        'w-full aspect-square rounded-lg flex items-center justify-center text-lg font-medium',
                        day.completed
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                          : 'bg-gray-100 text-gray-400 dark:bg-gray-800',
                        day.isToday && 'ring-2 ring-primary'
                      )}
                    >
                      {day.completed ? '✓' : '—'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le rituel</DialogTitle>
            <DialogDescription>
              Modifiez les détails de votre rituel
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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

            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((d) => ({ ...d, description: e.target.value }))}
                rows={2}
              />
            </div>

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
                <Label htmlFor="duration">Durée (min)</Label>
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

            <div className="flex items-center justify-between">
              <Label>Rappel</Label>
              <Switch
                checked={formData.reminder_enabled}
                onCheckedChange={(checked) =>
                  setFormData((d) => ({ ...d, reminder_enabled: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdate} disabled={updateRitual.isPending}>
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce rituel ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données de complétion seront également supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
