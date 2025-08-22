import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, Clock, Sparkles, Music } from 'lucide-react';
import { PremiumCard } from '@/components/ui/premium-card';

interface GenerationProgressProps {
  rang: 'A' | 'B' | 'AB';
  progress: number;
  attempts: number;
  maxAttempts: number;
  estimatedTimeRemaining: number;
  style?: string;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  rang,
  progress,
  attempts,
  maxAttempts,
  estimatedTimeRemaining,
  style
}) => {
  const getPhaseMessage = () => {
    if (progress < 20) return "Initialisation de l'IA Suno...";
    if (progress < 70) return "Composition musicale en cours...";
    if (progress < 90) return "Finalisation et mastering...";
    return "Génération presque terminée !";
  };

  const getEstimatedTime = () => {
    if (estimatedTimeRemaining > 60) {
      return `${Math.round(estimatedTimeRemaining / 60)}m ${estimatedTimeRemaining % 60}s`;
    }
    return `${estimatedTimeRemaining}s`;
  };

  return (
    <PremiumCard variant="glass" className="p-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center">
            <Music className="h-3 w-3 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Génération Rang {rang} - Style {style}
          </h3>
          <p className="text-sm text-gray-600 font-medium">{getPhaseMessage()}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Progression</span>
            <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
          </div>
          <Progress 
            value={progress} 
            className="h-3 bg-gray-200/50"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500">Tentative</div>
            <div className="text-lg font-bold text-gray-900">{attempts}/{maxAttempts}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500">Temps restant</div>
            <div className="text-lg font-bold text-blue-600 flex items-center justify-center gap-1">
              <Clock className="h-4 w-4" />
              {getEstimatedTime()}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500">Statut</div>
            <div className="text-lg font-bold text-emerald-600">En cours</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <p className="text-xs text-emerald-700 text-center">
            ⚡ Génération optimisée - Suno AI produit généralement votre musique en 30-90 secondes.
            {estimatedTimeRemaining > 0 && ` Encore ~${getEstimatedTime()} estimé.`}
          </p>
        </div>
      </div>
    </PremiumCard>
  );
};