import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { useListeningModes, type ListeningMode } from '@/hooks/useListeningModes';
import { supabase } from '@/integrations/supabase/client';
import {
    Brain,
    Flame,
    Music,
    Pause,
    Play,
    Settings,
    Square,
    Star,
    Timer,
    Trophy
} from 'lucide-react';
import { useEffect, useState } from 'react';
const getModeColor = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-primary/10 text-primary border-primary/20',
    orange: 'bg-warning/10 text-warning-foreground border-warning/20',
    purple: 'bg-accent/10 text-accent-foreground border-accent/20',
    green: 'bg-success/10 text-success border-success/20',
    red: 'bg-destructive/10 text-destructive border-destructive/20',
    pink: 'bg-accent/10 text-accent border-accent/20'
  };
  
  return colorMap[color] || colorMap.blue;
};

export const ListeningModesPanel = () => {
  const {
    predefinedModes,
    activeMode,
    timeRemaining,
    isSessionActive,
    startMode,
    endSession,
    pauseSession,
    resumeSession,
  } = useListeningModes();

  const { loadStats, stats: gamificationStats, addPoints } = useGamification();
  const { logActivity } = useActivityTracking();
  const [user, setUser] = useState<any>(null);
  const [selectedMode, setSelectedMode] = useState<ListeningMode | null>(null);

  // Load user and gamification stats
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await loadStats(user.id);
      }
    };
    init();
  }, [loadStats]);

  const handleStartMode = async (mode: ListeningMode) => {
    startMode(mode);
    if (user) {
      await logActivity({ 
        activity_type: 'music_generation', 
        metadata: { action: 'listening_mode_started', mode: mode.name } 
      });
    }
  };

  const handleEndSession = async () => {
    endSession();
    if (user) {
      await logActivity({ 
        activity_type: 'music_generation', 
        metadata: { action: 'listening_session_completed', duration_minutes: activeMode?.duration_minutes || 0 }
      });
      await addPoints(user.id, 'itemReviewed');
      await loadStats(user.id);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = activeMode 
    ? ((activeMode.duration_minutes * 60 - timeRemaining) / (activeMode.duration_minutes * 60)) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Gamification Stats */}
      {user && gamificationStats && (
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Statistiques de Session</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-warning">
                  <Flame className="h-4 w-4" />
                  <span className="font-bold">{gamificationStats.currentStreak}</span>
                  <span className="text-xs text-muted-foreground">jours</span>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <Star className="h-4 w-4" />
                  <span className="font-bold">Niv. {gamificationStats.level}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-warning" />
                  <Badge variant="secondary">{gamificationStats.badges.length}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session active */}
      {activeMode && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-2xl">{activeMode.icon}</div>
                <div>
                  <h3 className="font-semibold">{activeMode.name}</h3>
                  <p className="text-sm text-muted-foreground">Session en cours</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono">{formatTime(timeRemaining)}</div>
                <div className="text-xs text-muted-foreground">restant</div>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Progress value={progressPercentage} className="h-2" />
            
            <div className="flex gap-2">
              {isSessionActive ? (
                <Button variant="outline" size="sm" onClick={pauseSession}>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={resumeSession}>
                  <Play className="h-4 w-4 mr-1" />
                  Reprendre
                </Button>
              )}
              
              <Button variant="destructive" size="sm" onClick={handleEndSession}>
                <Square className="h-4 w-4 mr-1" />
                Terminer
              </Button>
              
              <Button variant="ghost" size="sm">
                <Music className="h-4 w-4 mr-1" />
                Playlist adaptée
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sélection des modes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Modes d'Écoute Spécialisés
          </CardTitle>
          <CardDescription>
            Choisissez un mode optimisé pour votre objectif d'apprentissage
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {predefinedModes.map((mode) => {
              const isSelected = selectedMode?.id === mode.id;
              
              return (
                <Card 
                  key={mode.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedMode(isSelected ? null : mode)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="text-xl">{mode.icon}</div>
                        <div>
                          <h4 className="font-medium text-sm">{mode.name}</h4>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Timer className="h-3 w-3" />
                            {mode.duration_minutes}min
                          </div>
                        </div>
                      </div>
                      
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getModeColor(mode.color)}`}
                      >
                        {mode.playlist_criteria.energy_level * 100}%
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3">
                      {mode.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {mode.playlist_criteria.mood.slice(0, 2).map(mood => (
                          <Badge key={mood} variant="outline" className="text-xs">
                            {mood}
                          </Badge>
                        ))}
                      </div>
                      
                      {isSelected && (
                        <div className="pt-2 border-t">
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div>Tempo: {mode.playlist_criteria.tempo_range.join('-')} BPM</div>
                            <div>Pauses: toutes les {mode.effects.break_intervals}min</div>
                            <div>Ambiance: {mode.effects.background_sounds}</div>
                          </div>
                          
                          <Button 
                            size="sm" 
                            className="w-full mt-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartMode(mode);
                            }}
                            disabled={!!activeMode}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Commencer la session
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Historique des sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Historique des Sessions</span>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              Personnaliser
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Vos sessions d'écoute apparaîtront ici</p>
            <p className="text-sm">Commencez votre première session !</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};