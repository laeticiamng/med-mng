
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Music, Clock, Loader2 } from 'lucide-react';

interface MusicGenerationProgressProps {
  rang: 'A' | 'B';
  progress: number;
  attempts: number;
  maxAttempts: number;
  estimatedTimeRemaining?: number;
  style?: string;
  isVisible: boolean;
  duration?: number; // Add duration prop
}

export const MusicGenerationProgress: React.FC<MusicGenerationProgressProps> = ({
  rang,
  progress,
  attempts,
  maxAttempts,
  estimatedTimeRemaining,
  style,
  isVisible,
  duration
}) => {
  if (!isVisible) return null;

  const colors = {
    A: {
      bg: 'bg-warning/10',
      border: 'border-warning/30',
      text: 'text-warning',
      progress: 'bg-warning'
    },
    B: {
      bg: 'bg-primary/10',
      border: 'border-primary/30',
      text: 'text-primary',
      progress: 'bg-primary'
    }
  };

  const colorStyle = colors[rang];

  // Format duration for display
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate realistic estimated time based on duration
  const getRealisticEstimatedTime = () => {
    if (estimatedTimeRemaining && estimatedTimeRemaining > 0) {
      return estimatedTimeRemaining;
    }
    // Base estimate on music duration - typically takes 2-3x the target duration
    const baseDuration = duration || 120;
    const estimatedTotal = Math.max(baseDuration * 2, 180); // Minimum 3 minutes
    const elapsed = (attempts / maxAttempts) * estimatedTotal;
    return Math.max(Math.round((estimatedTotal - elapsed) / 60), 1);
  };

  const realisticTimeRemaining = getRealisticEstimatedTime();

  // Generation steps for visual feedback
  const generationSteps = [
    { threshold: 0, label: 'Initialisation...' },
    { threshold: 10, label: 'Analyse des paroles...' },
    { threshold: 25, label: 'Composition musicale...' },
    { threshold: 50, label: 'Génération vocale...' },
    { threshold: 75, label: 'Mixage audio...' },
    { threshold: 90, label: 'Finalisation...' },
  ];
  
  const currentStep = generationSteps.filter(s => progress >= s.threshold).pop();

  return (
    <Card className={`${colorStyle.border} ${colorStyle.bg} border-2`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Loader2 className={`h-5 w-5 animate-spin ${colorStyle.text}`} />
              <Music className={`h-5 w-5 ${colorStyle.text}`} />
            </div>
            <div>
              <h3 className={`font-semibold ${colorStyle.text}`}>
                Génération Suno Rang {rang} en cours...
              </h3>
              {style && (
                <p className={`text-sm ${colorStyle.text} opacity-80`}>
                  Style: {style} {duration && `• Durée: ${formatDuration(duration)}`}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${colorStyle.text}`}>
                {currentStep?.label || 'Progression'}
              </span>
              <span className={`text-sm font-bold ${colorStyle.text}`}>
                {progress}%
              </span>
            </div>
            
            <Progress 
              value={progress} 
              className="h-3"
            />
            
            <div className="flex justify-between items-center text-xs opacity-75">
              <span className={colorStyle.text}>
                Tentative {attempts}/{maxAttempts}
              </span>
              <span className={`flex items-center gap-1 ${colorStyle.text}`}>
                <Clock className="h-3 w-3" />
                ~{realisticTimeRemaining} min restantes
              </span>
            </div>
          </div>

          {/* Visual step indicators */}
          <div className="flex justify-between gap-1">
            {generationSteps.map((step, idx) => (
              <div 
                key={idx}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  progress >= step.threshold ? colorStyle.progress : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className={`text-xs ${colorStyle.text} opacity-70 text-center`}>
            🎵 Suno AI génère votre musique avec paroles chantées...
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
