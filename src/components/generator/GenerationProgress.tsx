
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Music, Loader2 } from 'lucide-react';
import { PremiumCard } from '@/components/ui/premium-card';

interface GenerationProgressProps {
  progress: number;
  isGenerating: boolean;
  message?: string;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  progress,
  isGenerating,
  message = "Génération en cours..."
}) => {
  if (!isGenerating) return null;

  const getStatusMessage = () => {
    if (progress < 10) return "🎵 Démarrage de la génération...";
    if (progress < 30) return "🎼 Analyse des paroles...";
    if (progress < 50) return "🎹 Composition musicale...";
    if (progress < 70) return "🎸 Arrangement instrumental...";
    if (progress < 90) return "🎧 Mixage final...";
    return "✨ Finalisation...";
  };

  return (
    <PremiumCard variant="gradient" className="p-6 mb-6 animate-pulse-slow">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center">
          <Music className="h-6 w-6 text-primary-foreground animate-bounce" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {getStatusMessage()}
          </h3>
          <p className="text-sm text-muted-foreground">
            {message} • {Math.round(progress)}%
          </p>
        </div>
      </div>
      
      <Progress value={progress} className="h-3" />
      
      <p className="text-xs text-muted-foreground mt-3 text-center">
        ⏱️ Durée estimée: 2-3 minutes • Ne fermez pas cette page
      </p>
    </PremiumCard>
  );
};
