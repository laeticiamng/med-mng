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
      <Badge variant="default" className="bg-success/10 text-success border-success/20">
        <CheckCircle className="w-3 h-3 mr-1" />
        Rang {rang} prêt ! Cliquez pour écouter
      </Badge>
    );
  }

  if (isPolling || pollingCount > 0) {
    return (
      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        Génération Rang {rang} en cours... ({pollingCount} en attente)
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
      <Clock className="w-3 h-3 mr-1" />
      En attente de génération Rang {rang}
    </Badge>
  );
};