import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Clock, Pause, Play, RotateCcw, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface EcosRealTimeTimerProps {
  durationMinutes?: number; // Default 7 min per ECOS station
  onTimeUp?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  autoStart?: boolean;
}

export const EcosRealTimeTimer = ({
  durationMinutes = 7,
  onTimeUp,
  onPause,
  onResume,
  autoStart = false,
}: EcosRealTimeTimerProps) => {
  const totalSeconds = durationMinutes * 60;
  const [timeRemaining, setTimeRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const warningPlayedRef = useRef(false);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          
          // Warning at 1 minute remaining
          if (newTime === 60 && !warningPlayedRef.current) {
            warningPlayedRef.current = true;
            playWarningSound();
          }
          
          // Time's up
          if (newTime === 0) {
            setIsComplete(true);
            setIsRunning(false);
            playEndSound();
            onTimeUp?.();
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, onTimeUp]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage (inverted - starts at 100%)
  const progressPercent = (timeRemaining / totalSeconds) * 100;

  // Get color based on remaining time
  const getTimeColor = () => {
    if (timeRemaining <= 60) return 'text-destructive';
    if (timeRemaining <= 120) return 'text-warning';
    return 'text-primary';
  };

  const getProgressColor = () => {
    if (timeRemaining <= 60) return 'bg-destructive';
    if (timeRemaining <= 120) return 'bg-warning';
    return 'bg-primary';
  };

  // Audio feedback
  const playWarningSound = () => {
    // Create a simple beep sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 500);
    } catch (error) {
      console.debug('Audio not supported');
    }
  };

  const playEndSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 440;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.5;
      
      // Play 3 beeps
      oscillator.start();
      setTimeout(() => {
        oscillator.frequency.value = 520;
      }, 200);
      setTimeout(() => {
        oscillator.frequency.value = 660;
      }, 400);
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 600);
    } catch (error) {
      console.debug('Audio not supported');
    }
  };

  // Controls
  const handleStart = () => {
    setIsRunning(true);
    onResume?.();
  };

  const handlePause = () => {
    setIsRunning(false);
    onPause?.();
  };

  const handleReset = () => {
    setTimeRemaining(totalSeconds);
    setIsRunning(false);
    setIsComplete(false);
    warningPlayedRef.current = false;
  };

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${
      timeRemaining <= 60 ? 'border-destructive/50 shadow-lg shadow-destructive/20' :
      timeRemaining <= 120 ? 'border-warning/50' : 'border-primary/30'
    }`}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Timer display */}
          <div className="relative">
            <div className={`text-6xl font-mono font-bold ${getTimeColor()} transition-colors`}>
              {formatTime(timeRemaining)}
            </div>
            {timeRemaining <= 60 && !isComplete && (
              <div className="absolute -top-2 -right-2 animate-pulse">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full space-y-2">
            <Progress 
              value={progressPercent} 
              className={`h-3 ${getProgressColor()}`}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Début</span>
              <span>{durationMinutes} min</span>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              Station ECOS
            </Badge>
            {isRunning && (
              <Badge variant="default" className="animate-pulse">
                En cours
              </Badge>
            )}
            {isComplete && (
              <Badge variant="destructive">
                Temps écoulé
              </Badge>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {!isComplete && (
              <>
                {!isRunning ? (
                  <Button onClick={handleStart} size="lg" className="gap-2">
                    <Play className="h-5 w-5" />
                    {timeRemaining === totalSeconds ? 'Démarrer' : 'Reprendre'}
                  </Button>
                ) : (
                  <Button onClick={handlePause} variant="outline" size="lg" className="gap-2">
                    <Pause className="h-5 w-5" />
                    Pause
                  </Button>
                )}
              </>
            )}
            
            <Button onClick={handleReset} variant="ghost" size="lg" className="gap-2">
              <RotateCcw className="h-5 w-5" />
              Réinitialiser
            </Button>
          </div>

          {/* Warning message */}
          {timeRemaining <= 60 && !isComplete && (
            <div className="flex items-center gap-2 text-destructive text-sm font-medium animate-pulse">
              <Volume2 className="h-4 w-4" />
              Dernière minute !
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
