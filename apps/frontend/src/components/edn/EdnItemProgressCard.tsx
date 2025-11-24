import logger from '@/lib/logger';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  Star, 
  Award, 
  Play, 
  Pause,
  StickyNote,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { useUpdateItemProgress } from '@/hooks/useEdnProgress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EdnItemProgressCardProps {
  itemNumber: string;
  itemTitle?: string;
  className?: string;
}

export const EdnItemProgressCard: React.FC<EdnItemProgressCardProps> = ({
  itemNumber,
  itemTitle,
  className = '',
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const updateProgress = useUpdateItemProgress();
  
  const [notes, setNotes] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Fetch current progress for this item
  const { data: progress, isLoading } = useQuery({
    queryKey: ['item-progress', user?.id, itemNumber],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await (supabase as any)
        .from('user_edn_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_number', itemNumber)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Error fetching progress:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user,
  });

  // Load notes from progress
  useEffect(() => {
    if (progress?.notes) {
      setNotes(progress.notes);
    }
  }, [progress]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTracking && startTime) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, startTime]);

  const handleStartTracking = () => {
    setIsTracking(true);
    setStartTime(Date.now());
  };

  const handleStopTracking = async () => {
    if (!startTime) return;
    
    const timeSpentMinutes = Math.floor((Date.now() - startTime) / 60000);
    
    if (timeSpentMinutes > 0) {
      await updateProgress.mutateAsync({
        itemNumber,
        status: progress?.status || 'in_progress',
        timeSpentMinutes,
      });
    }
    
    setIsTracking(false);
    setStartTime(null);
    setElapsedSeconds(0);
  };

  const handleStatusChange = async (status: 'not_started' | 'in_progress' | 'completed' | 'mastered') => {
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour suivre votre progression',
        variant: 'destructive',
      });
      return;
    }

    await updateProgress.mutateAsync({
      itemNumber,
      status,
      notes: notes || undefined,
    });
  };

  const handleSaveNotes = async () => {
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour enregistrer des notes',
        variant: 'destructive',
      });
      return;
    }

    await updateProgress.mutateAsync({
      itemNumber,
      status: progress?.status || 'in_progress',
      notes,
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'completed': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'in_progress': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mastered': return Award;
      case 'completed': return CheckCircle;
      case 'in_progress': return TrendingUp;
      default: return Clock;
    }
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Progression</CardTitle>
          <CardDescription>
            Connectez-vous pour suivre votre progression et ajouter des notes
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const StatusIcon = getStatusIcon(progress?.status || 'not_started');

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Ma Progression</CardTitle>
          </div>
          <Badge variant="outline">Item {itemNumber}</Badge>
        </div>
        {itemTitle && (
          <CardDescription className="line-clamp-1">{itemTitle}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Buttons */}
        <div>
          <p className="text-sm font-medium mb-2">Statut :</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant={progress?.status === 'in_progress' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('in_progress')}
              className="gap-2"
              disabled={updateProgress.isPending}
            >
              <TrendingUp className="h-4 w-4" />
              En cours
            </Button>
            <Button
              size="sm"
              variant={progress?.status === 'completed' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('completed')}
              className="gap-2"
              disabled={updateProgress.isPending}
            >
              <CheckCircle className="h-4 w-4" />
              Complété
            </Button>
            <Button
              size="sm"
              variant={progress?.status === 'mastered' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('mastered')}
              className="gap-2 col-span-2"
              disabled={updateProgress.isPending}
            >
              <Award className="h-4 w-4" />
              Maîtrisé
            </Button>
          </div>
        </div>

        {/* Time Tracker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Temps de révision :</p>
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              {progress?.time_spent_minutes || 0} min
            </Badge>
          </div>
          
          {isTracking ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <span className="text-sm font-medium text-primary">
                  En cours: {formatTime(elapsedSeconds)}
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleStopTracking}
                  className="gap-2"
                >
                  <Pause className="h-3 w-3" />
                  Arrêter
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleStartTracking}
              className="w-full gap-2"
            >
              <Play className="h-4 w-4" />
              Démarrer le chronomètre
            </Button>
          )}
        </div>

        {/* Score */}
        {progress?.score !== undefined && progress?.score > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Score :</p>
              <Badge variant="secondary">
                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                {progress.score}/100
              </Badge>
            </div>
            <Progress value={progress.score} className="h-2" />
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Mes notes :</p>
          </div>
          <Textarea
            placeholder="Ajoutez vos notes personnelles sur cet item..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          <Button
            size="sm"
            onClick={handleSaveNotes}
            disabled={updateProgress.isPending || notes === progress?.notes}
            className="w-full"
          >
            {updateProgress.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <StickyNote className="h-4 w-4 mr-2" />
                Enregistrer les notes
              </>
            )}
          </Button>
        </div>

        {/* Last Activity */}
        {progress?.last_reviewed_at && (
          <div className="text-xs text-muted-foreground border-t pt-3">
            Dernière révision : {new Date(progress.last_reviewed_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
