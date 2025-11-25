import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  BookOpen,
  Star,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Brain,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  StudySession,
  useStartStudySession,
  useCompleteStudySession,
  useCancelStudySession,
  useDeleteStudySession,
} from '@/hooks/useStudySessions';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface StudySessionCardProps {
  session: StudySession;
  className?: string;
  variant?: 'compact' | 'full';
  onEdit?: (session: StudySession) => void;
}

const statusConfig = {
  planned: {
    label: 'Planifiée',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    icon: Calendar,
  },
  in_progress: {
    label: 'En cours',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: Play,
  },
  completed: {
    label: 'Terminée',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Annulée',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    icon: XCircle,
  },
};

export const StudySessionCard: React.FC<StudySessionCardProps> = ({
  session,
  className,
  variant = 'full',
  onEdit,
}) => {
  const startSession = useStartStudySession();
  const completeSession = useCompleteStudySession();
  const cancelSession = useCancelStudySession();
  const deleteSession = useDeleteStudySession();

  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completionData, setCompletionData] = useState({
    rating: 3,
    focusScore: 70,
    notes: '',
  });

  const status = statusConfig[session.status];
  const StatusIcon = status.icon;

  const isOverdue =
    session.status === 'planned' && session.scheduled_at && isPast(new Date(session.scheduled_at));

  const handleStart = async () => {
    try {
      await startSession.mutateAsync(session.id);
      toast.success('Session démarrée');
    } catch (error) {
      toast.error('Erreur lors du démarrage');
    }
  };

  const handleComplete = async () => {
    try {
      await completeSession.mutateAsync({
        sessionId: session.id,
        rating: completionData.rating,
        focusScore: completionData.focusScore,
        notes: completionData.notes || undefined,
      });
      setShowCompleteDialog(false);
      toast.success('Session terminée');
    } catch (error) {
      toast.error('Erreur lors de la complétion');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSession.mutateAsync(session.id);
      toast.info('Session annulée');
    } catch (error) {
      toast.error('Erreur lors de l\'annulation');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSession.mutateAsync(session.id);
      toast.success('Session supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card className={cn('group', className)}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  'p-2 rounded-lg shrink-0',
                  session.status === 'in_progress'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30'
                    : 'bg-muted'
                )}
              >
                <Brain
                  className={cn(
                    'w-4 h-4',
                    session.status === 'in_progress' ? 'text-yellow-600' : 'text-muted-foreground'
                  )}
                />
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{session.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{session.duration_minutes} min</span>
                  {session.topic && (
                    <>
                      <span>•</span>
                      <span className="truncate">{session.topic}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn('text-xs shrink-0', status.color)}>
                {status.label}
              </Badge>
              {session.status === 'planned' && (
                <Button size="sm" variant="ghost" onClick={handleStart}>
                  <Play className="w-4 h-4" />
                </Button>
              )}
              {session.status === 'in_progress' && (
                <Button size="sm" variant="ghost" onClick={() => setShowCompleteDialog(true)}>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <>
      <Card className={cn('group', isOverdue && 'border-red-200 dark:border-red-800', className)}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                {session.title}
              </CardTitle>
              {session.description && (
                <p className="text-sm text-muted-foreground">{session.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge className={status.color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {status.label}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(session)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                  )}
                  {session.status === 'planned' && (
                    <DropdownMenuItem onClick={handleCancel}>
                      <XCircle className="w-4 h-4 mr-2" />
                      Annuler
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{session.duration_minutes} minutes</span>
            </div>
            {session.topic && (
              <div className="flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="truncate">{session.topic}</span>
              </div>
            )}
            {session.scheduled_at && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>
                  {isToday(new Date(session.scheduled_at))
                    ? format(new Date(session.scheduled_at), 'HH:mm')
                    : format(new Date(session.scheduled_at), 'dd/MM HH:mm')}
                </span>
              </div>
            )}
            {session.item_numbers && session.item_numbers.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span>{session.item_numbers.length} items</span>
              </div>
            )}
          </div>

          {/* Completed session stats */}
          {session.status === 'completed' && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Durée réelle</span>
                <span className="font-medium">
                  {session.actual_duration_minutes || session.duration_minutes} min
                </span>
              </div>
              {session.rating && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Note</span>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'w-4 h-4',
                          i < session.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
              {session.focus_score !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Concentration</span>
                    <span className="font-medium">{session.focus_score}%</span>
                  </div>
                  <Progress value={session.focus_score} className="h-2" />
                </div>
              )}
              {session.notes && (
                <p className="text-sm text-muted-foreground italic">"{session.notes}"</p>
              )}
            </div>
          )}

          {/* Overdue warning */}
          {isOverdue && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-400">
              Session en retard de{' '}
              {formatDistanceToNow(new Date(session.scheduled_at!), { locale: fr })}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0">
          {session.status === 'planned' && (
            <Button className="w-full" onClick={handleStart} disabled={startSession.isPending}>
              <Play className="w-4 h-4 mr-2" />
              Commencer
            </Button>
          )}
          {session.status === 'in_progress' && (
            <Button
              className="w-full bg-green-500 hover:bg-green-600"
              onClick={() => setShowCompleteDialog(true)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Terminer la session
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Complete session dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminer la session</DialogTitle>
            <DialogDescription>Comment s'est passée cette session ?</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Rating */}
            <div className="space-y-2">
              <Label>Note globale</Label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => setCompletionData((d) => ({ ...d, rating: value }))}
                    className="p-1"
                  >
                    <Star
                      className={cn(
                        'w-8 h-8 transition-colors',
                        value <= completionData.rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300 hover:text-yellow-300'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Focus score */}
            <div className="space-y-2">
              <Label>Niveau de concentration: {completionData.focusScore}%</Label>
              <Slider
                value={[completionData.focusScore]}
                onValueChange={([value]) =>
                  setCompletionData((d) => ({ ...d, focusScore: value }))
                }
                min={0}
                max={100}
                step={5}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (optionnel)</Label>
              <Textarea
                placeholder="Comment s'est passée cette session ?"
                value={completionData.notes}
                onChange={(e) => setCompletionData((d) => ({ ...d, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleComplete} disabled={completeSession.isPending}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Terminer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudySessionCard;
