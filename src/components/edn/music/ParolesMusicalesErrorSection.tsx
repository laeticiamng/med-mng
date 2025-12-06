
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ParolesMusicalesErrorSectionProps {
  lastError: string;
}

export const ParolesMusicalesErrorSection: React.FC<ParolesMusicalesErrorSectionProps> = ({
  lastError
}) => {
  if (!lastError) return null;

  return (
    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-5 w-5" />
        <span className="font-semibold">Erreur de génération Suno</span>
      </div>
      <p className="text-destructive/80 mt-2">{lastError}</p>
    </div>
  );
};
