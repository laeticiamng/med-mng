import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
  Coffee,
  Brain,
  Target,
  Clock,
  CheckCircle,
  Flame,
  SkipForward,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import logger from '@/lib/logger';

type SessionType = 'focus' | 'short_break' | 'long_break';

interface PomodoroSettings {
  focusDuration: number; // minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
}

interface SessionStats {
  totalFocusTime: number; // minutes
  completedSessions: number;
  currentStreak: number;
}

const defaultSettings: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundEnabled: true,
};

const sessionTypeConfig = {
  focus: {
    label: 'Focus',
    icon: Brain,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    description: 'Temps de concentration',
  },
  short_break: {
    label: 'Pause courte',
    icon: Coffee,
    color: 'text-green-500',
    bgColor: 'bg-green-500',
    description: 'Petite pause',
  },
  long_break: {
    label: 'Pause longue',
    icon: Coffee,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500',
    description: 'Grande pause',
  },
};

interface PomodoroTimerProps {
  className?: string;
  variant?: 'compact' | 'full';
  studyTopic?: string;
  onSessionComplete?: (type: SessionType, duration: number) => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  className,
  variant = 'full',
  studyTopic,
  onSessionComplete,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // State
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    const stored = localStorage.getItem('pomodoro-settings');
    return stored ? JSON.parse(stored) : defaultSettings;
  });
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [timeRemaining, setTimeRemaining] = useState(settings.focusDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalFocusTime: 0,
    completedSessions: 0,
    currentStreak: 0,
  });

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-settings', JSON.stringify(settings));
  }, [settings]);

  // Get duration for current session type
  const getDuration = useCallback((type: SessionType): number => {
    switch (type) {
      case 'focus':
        return settings.focusDuration * 60;
      case 'short_break':
        return settings.shortBreakDuration * 60;
      case 'long_break':
        return settings.longBreakDuration * 60;
    }
  }, [settings]);

  // Record session to database
  const recordSession = useMutation({
    mutationFn: async ({ type, duration }: { type: SessionType; duration: number }) => {
      if (!user) return;

      const { error } = await (supabase as any)
        .from('focus_sessions')
        .insert({
          user_id: user.id,
          session_type: type,
          duration_minutes: Math.round(duration / 60),
          completed: true,
          topic: studyTopic || null,
          started_at: new Date(Date.now() - duration * 1000).toISOString(),
          ended_at: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['study-stats'] });
    },
    onError: (error) => {
      logger.error('Error recording session:', error);
    },
  });

  // Play notification sound
  const playSound = useCallback(() => {
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, [settings.soundEnabled]);

  // Handle session completion
  const handleSessionComplete = useCallback(() => {
    playSound();
    const duration = getDuration(sessionType);

    if (sessionType === 'focus') {
      const newCompleted = completedSessions + 1;
      setCompletedSessions(newCompleted);
      setSessionStats((prev) => ({
        ...prev,
        totalFocusTime: prev.totalFocusTime + settings.focusDuration,
        completedSessions: prev.completedSessions + 1,
      }));

      recordSession.mutate({ type: 'focus', duration });
      onSessionComplete?.('focus', duration);

      // Determine next break type
      if (newCompleted % settings.sessionsUntilLongBreak === 0) {
        setSessionType('long_break');
        setTimeRemaining(settings.longBreakDuration * 60);
      } else {
        setSessionType('short_break');
        setTimeRemaining(settings.shortBreakDuration * 60);
      }

      if (settings.autoStartBreaks) {
        setIsRunning(true);
      } else {
        setShowCompletionDialog(true);
      }

      toast.success('Session de focus terminée !', {
        description: `${settings.focusDuration} minutes de concentration`,
      });
    } else {
      // Break completed
      setSessionType('focus');
      setTimeRemaining(settings.focusDuration * 60);

      if (settings.autoStartFocus) {
        setIsRunning(true);
      }

      toast.info('Pause terminée !', {
        description: 'Prêt pour une nouvelle session',
      });
    }
  }, [
    sessionType,
    completedSessions,
    settings,
    playSound,
    getDuration,
    recordSession,
    onSessionComplete,
  ]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, handleSessionComplete]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progress = ((getDuration(sessionType) - timeRemaining) / getDuration(sessionType)) * 100;

  // Control functions
  const toggleTimer = () => setIsRunning((prev) => !prev);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeRemaining(getDuration(sessionType));
  };

  const skipSession = () => {
    setIsRunning(false);
    handleSessionComplete();
  };

  const switchSessionType = (type: SessionType) => {
    setIsRunning(false);
    setSessionType(type);
    setTimeRemaining(getDuration(type));
  };

  const config = sessionTypeConfig[sessionType];
  const Icon = config.icon;

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-full', `${config.bgColor}/10`)}>
                <Icon className={cn('w-5 h-5', config.color)} />
              </div>
              <div>
                <p className="text-2xl font-mono font-bold">{formatTime(timeRemaining)}</p>
                <p className="text-xs text-muted-foreground">{config.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isRunning ? 'destructive' : 'default'}
                size="icon"
                onClick={toggleTimer}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={resetTimer}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Progress value={progress} className="mt-3 h-1" />
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <>
      {/* Hidden audio element for notifications */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/notification.mp3" type="audio/mpeg" />
        <source src="/sounds/notification.ogg" type="audio/ogg" />
      </audio>

      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Pomodoro Timer
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
              >
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Session type selector */}
          <div className="flex justify-center gap-2">
            {(Object.keys(sessionTypeConfig) as SessionType[]).map((type) => {
              const typeConfig = sessionTypeConfig[type];
              return (
                <Button
                  key={type}
                  variant={sessionType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => switchSessionType(type)}
                  className={cn(sessionType === type && typeConfig.bgColor)}
                >
                  {typeConfig.label}
                </Button>
              );
            })}
          </div>

          {/* Timer display */}
          <div className="text-center py-8">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/20"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={553}
                  strokeDashoffset={553 - (553 * progress) / 100}
                  className={config.color}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Icon className={cn('w-8 h-8 mb-2', config.color)} />
                <span className="text-5xl font-mono font-bold">{formatTime(timeRemaining)}</span>
                <span className="text-sm text-muted-foreground mt-1">{config.description}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            <Button variant="outline" size="icon" onClick={resetTimer}>
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              className={cn('w-32', isRunning ? 'bg-red-500 hover:bg-red-600' : config.bgColor)}
              onClick={toggleTimer}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 mr-2" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" /> Start
                </>
              )}
            </Button>
            <Button variant="outline" size="icon" onClick={skipSession}>
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Study topic */}
          {studyTopic && (
            <div className="text-center text-sm text-muted-foreground">
              <Target className="w-4 h-4 inline mr-1" />
              En train d'étudier: <strong>{studyTopic}</strong>
            </div>
          )}

          {/* Session stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                <Flame className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold">{completedSessions}</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold">{sessionStats.totalFocusTime}</p>
              <p className="text-xs text-muted-foreground">Minutes</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                <Target className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold">
                {completedSessions}/{settings.sessionsUntilLongBreak}
              </p>
              <p className="text-xs text-muted-foreground">Cycle</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paramètres Pomodoro</DialogTitle>
            <DialogDescription>Personnalisez votre timer</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Durée Focus: {settings.focusDuration} min
              </label>
              <Slider
                value={[settings.focusDuration]}
                onValueChange={([value]) =>
                  setSettings((s) => ({ ...s, focusDuration: value }))
                }
                min={5}
                max={60}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Pause courte: {settings.shortBreakDuration} min
              </label>
              <Slider
                value={[settings.shortBreakDuration]}
                onValueChange={([value]) =>
                  setSettings((s) => ({ ...s, shortBreakDuration: value }))
                }
                min={1}
                max={15}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Pause longue: {settings.longBreakDuration} min
              </label>
              <Slider
                value={[settings.longBreakDuration]}
                onValueChange={([value]) =>
                  setSettings((s) => ({ ...s, longBreakDuration: value }))
                }
                min={10}
                max={30}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sessions avant pause longue</label>
              <Select
                value={settings.sessionsUntilLongBreak.toString()}
                onValueChange={(value) =>
                  setSettings((s) => ({ ...s, sessionsUntilLongBreak: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} sessions
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session Complete Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Session terminée !
            </DialogTitle>
            <DialogDescription>
              Vous avez complété {settings.focusDuration} minutes de concentration.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 text-center">
            <p className="text-4xl font-bold text-green-500 mb-2">{completedSessions}</p>
            <p className="text-muted-foreground">sessions complétées aujourd'hui</p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowCompletionDialog(false);
                setIsRunning(true);
              }}
            >
              <Coffee className="w-4 h-4 mr-2" />
              Prendre une pause
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setShowCompletionDialog(false);
                setSessionType('focus');
                setTimeRemaining(settings.focusDuration * 60);
                setIsRunning(true);
              }}
            >
              <Brain className="w-4 h-4 mr-2" />
              Continuer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PomodoroTimer;
