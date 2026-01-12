import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Timer, 
  Zap,
  Coffee,
  Brain,
  Target
} from 'lucide-react';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useToast } from '@/hooks/use-toast';

interface StudySessionTimerProps {
  className?: string;
  defaultDuration?: number; // in minutes
  onSessionComplete?: (duration: number) => void;
  itemCode?: string;
  compact?: boolean;
}

type TimerMode = 'focus' | 'break' | 'idle';

const POMODORO_FOCUS = 25 * 60; // 25 minutes
const POMODORO_BREAK = 5 * 60; // 5 minutes
const POMODORO_LONG_BREAK = 15 * 60; // 15 minutes

export const StudySessionTimer: React.FC<StudySessionTimerProps> = ({
  className = '',
  defaultDuration = 25,
  onSessionComplete,
  itemCode,
  compact = false
}) => {
  const [timeRemaining, setTimeRemaining] = useState(defaultDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>('idle');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  
  const { logActivity } = useActivityTracking();
  const { toast } = useToast();

  // Timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSessionEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeRemaining]);

  const handleSessionEnd = useCallback(() => {
    setIsRunning(false);
    
    if (mode === 'focus') {
      const duration = startTimeRef.current 
        ? Math.round((Date.now() - startTimeRef.current) / 1000)
        : defaultDuration * 60;
      
      setTotalStudyTime((prev) => prev + duration);
      setSessionsCompleted((prev) => prev + 1);
      
      // Log activity
      logActivity({
        activity_type: 'study',
        duration_seconds: duration,
        metadata: { itemCode, mode: 'pomodoro' }
      });

      onSessionComplete?.(duration);

      toast({
        title: '🎉 Session terminée !',
        description: `Bravo ! Tu as étudié pendant ${Math.round(duration / 60)} minutes.`,
      });

      // Start break
      const isLongBreak = (sessionsCompleted + 1) % 4 === 0;
      setTimeRemaining(isLongBreak ? POMODORO_LONG_BREAK : POMODORO_BREAK);
      setMode('break');
    } else if (mode === 'break') {
      toast({
        title: '☕ Pause terminée !',
        description: 'Prêt pour une nouvelle session ?',
      });
      setTimeRemaining(POMODORO_FOCUS);
      setMode('idle');
    }
  }, [mode, defaultDuration, logActivity, onSessionComplete, itemCode, sessionsCompleted, toast]);

  const startTimer = () => {
    if (mode === 'idle') {
      setMode('focus');
      setTimeRemaining(POMODORO_FOCUS);
    }
    startTimeRef.current = Date.now();
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = () => {
    if (isRunning && mode === 'focus' && startTimeRef.current) {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (duration > 60) {
        setTotalStudyTime((prev) => prev + duration);
        logActivity({
          activity_type: 'study',
          duration_seconds: duration,
          metadata: { itemCode, mode: 'pomodoro', interrupted: true }
        });
      }
    }
    setIsRunning(false);
    setMode('idle');
    setTimeRemaining(defaultDuration * 60);
    startTimeRef.current = null;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeRemaining(mode === 'focus' ? POMODORO_FOCUS : mode === 'break' ? POMODORO_BREAK : defaultDuration * 60);
    startTimeRef.current = null;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'focus' 
    ? ((POMODORO_FOCUS - timeRemaining) / POMODORO_FOCUS) * 100
    : mode === 'break'
    ? ((POMODORO_BREAK - timeRemaining) / POMODORO_BREAK) * 100
    : 0;

  const getModeColor = () => {
    switch (mode) {
      case 'focus': return 'text-primary';
      case 'break': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'focus': return <Brain className="h-5 w-5" />;
      case 'break': return <Coffee className="h-5 w-5" />;
      default: return <Timer className="h-5 w-5" />;
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className={`font-mono text-lg font-bold ${getModeColor()}`}>
          {formatTime(timeRemaining)}
        </div>
        <div className="flex gap-1">
          {!isRunning ? (
            <Button size="icon" variant="ghost" onClick={startTimer} className="h-8 w-8">
              <Play className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="icon" variant="ghost" onClick={pauseTimer} className="h-8 w-8">
              <Pause className="h-4 w-4" />
            </Button>
          )}
          <Button size="icon" variant="ghost" onClick={stopTimer} className="h-8 w-8">
            <Square className="h-4 w-4" />
          </Button>
        </div>
        {sessionsCompleted > 0 && (
          <Badge variant="secondary" className="text-xs">
            {sessionsCompleted} 🍅
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={`border-border/30 ${className}`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {getModeIcon()}
            <span className="font-medium">
              {mode === 'focus' ? 'Focus' : mode === 'break' ? 'Pause' : 'Pomodoro Timer'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {sessionsCompleted > 0 && (
              <Badge variant="outline" className="gap-1">
                <Target className="h-3 w-3" />
                {sessionsCompleted} session{sessionsCompleted > 1 ? 's' : ''}
              </Badge>
            )}
            {totalStudyTime > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Zap className="h-3 w-3" />
                {Math.round(totalStudyTime / 60)}min
              </Badge>
            )}
          </div>
        </div>

        {/* Timer display */}
        <div className="text-center mb-6">
          <div className={`text-6xl font-mono font-bold mb-4 ${getModeColor()}`}>
            {formatTime(timeRemaining)}
          </div>
          
          {/* Progress bar */}
          {mode !== 'idle' && (
            <Progress 
              value={progress} 
              className="h-2 mb-2"
            />
          )}
          
          <p className="text-sm text-muted-foreground">
            {mode === 'focus' 
              ? 'Concentre-toi sur ta révision'
              : mode === 'break'
              ? 'Prends une pause méritée'
              : 'Prêt à commencer une session de 25 minutes'
            }
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isRunning ? (
            <Button 
              size="lg" 
              onClick={startTimer}
              className="gap-2"
            >
              <Play className="h-5 w-5" />
              {mode === 'idle' ? 'Commencer' : 'Reprendre'}
            </Button>
          ) : (
            <Button 
              size="lg" 
              variant="secondary"
              onClick={pauseTimer}
              className="gap-2"
            >
              <Pause className="h-5 w-5" />
              Pause
            </Button>
          )}
          
          <Button 
            size="lg" 
            variant="outline" 
            onClick={resetTimer}
            className="gap-2"
          >
            <RotateCcw className="h-5 w-5" />
            Reset
          </Button>
          
          {mode !== 'idle' && (
            <Button 
              size="lg" 
              variant="ghost" 
              onClick={stopTimer}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Square className="h-5 w-5" />
              Stop
            </Button>
          )}
        </div>

        {/* Item context */}
        {itemCode && (
          <div className="mt-4 pt-4 border-t border-border/50 text-center">
            <Badge variant="outline" className="text-xs">
              Item actuel: {itemCode}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudySessionTimer;
