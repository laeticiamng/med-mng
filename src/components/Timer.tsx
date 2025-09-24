import React, { useEffect, useMemo, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type TimerProps = {
  /** Durée initiale en minutes */
  initialMinutes?: number;
  /** Texte affiché au-dessus du chronomètre */
  label?: string;
  className?: string;
};

const padTime = (value: number) => value.toString().padStart(2, '0');

export const Timer: React.FC<TimerProps> = ({
  initialMinutes = 8,
  label = "Minuterie",
  className,
}) => {
  const initialSeconds = useMemo(() => Math.max(0, Math.round(initialMinutes * 60)), [initialMinutes]);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setIsRunning(false);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    if (secondsLeft <= 0) {
      setIsRunning(false);
      return;
    }

    const interval = window.setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(interval);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const handleToggle = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(initialSeconds);
    }
    setIsRunning((previous) => !previous);
  };

  const handleReset = () => {
    setSecondsLeft(initialSeconds);
    setIsRunning(false);
  };

  const minutes = padTime(Math.floor(secondsLeft / 60));
  const seconds = padTime(secondsLeft % 60);
  const progressValue = secondsLeft === 0 ? 100 : ((initialSeconds - secondsLeft) / initialSeconds) * 100;

  return (
    <div
      className={cn(
        'rounded-2xl border border-primary/10 bg-white/80 p-5 shadow-sm backdrop-blur-md print:bg-white print:border-slate-300 print:shadow-none',
        className,
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide print:text-black">{label}</p>
        <span className="text-xs font-semibold text-primary/80 print:text-black">
          {initialMinutes.toString()} min
        </span>
      </div>
      <div className="flex items-baseline justify-center gap-1 text-5xl font-semibold text-primary tracking-tight print:text-black">
        <span className="tabular-nums">{minutes}</span>
        <span className="tabular-nums">:</span>
        <span className="tabular-nums">{seconds}</span>
      </div>
      <Progress value={progressValue} className="mt-4 h-2" aria-hidden />
      <div className="mt-4 flex gap-3">
        <Button
          type="button"
          onClick={handleToggle}
          variant={isRunning ? 'secondary' : 'default'}
          className="flex-1 flex items-center justify-center gap-2"
        >
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="text-sm font-semibold">
            {isRunning ? 'Pause' : secondsLeft === 0 ? 'Repartir' : 'Démarrer'}
          </span>
        </Button>
        <Button
          type="button"
          onClick={handleReset}
          variant="outline"
          className="flex-1 flex items-center justify-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="text-sm font-semibold">Reset</span>
        </Button>
      </div>
    </div>
  );
};

export default Timer;
