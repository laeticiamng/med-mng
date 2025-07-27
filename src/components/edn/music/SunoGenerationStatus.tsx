import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, CheckCircle } from 'lucide-react';

interface SunoGenerationStatusProps {
  isPolling: boolean;
  pollingCount: number;
  hasAudio: boolean;
  rang: 'A' | 'B' | 'AB';
}

export const SunoGenerationStatus: React.FC<SunoGenerationStatusProps> = ({
  isPolling,
  pollingCount,
  hasAudio,
  rang
}) => {
  if (!isPolling && !hasAudio && pollingCount === 0) {
    return null; // Aucun status à afficher
  }

  if (hasAudio) {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Rang {rang} prêt ! Cliquez pour écouter
      </Badge>
    );
  }

  if (isPolling || pollingCount > 0) {
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        Génération Rang {rang} en cours... ({pollingCount} en attente)
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
      <Clock className="w-3 h-3 mr-1" />
      En attente de génération Rang {rang}
    </Badge>
  );
};