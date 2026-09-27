
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface GenerateButtonProps {
  rang: 'A' | 'B';
  /** Libellé affiché (« A+B » pour la chanson combinée) ; défaut : le rang. */
  libelleRang?: string;
  isGenerating: boolean;
  isDisabled: boolean;
  musicDuration: number;
  buttonVariant: 'default' | 'secondary';
  onGenerate: () => void;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({ 
  rang, 
  libelleRang,
  isGenerating, 
  isDisabled, 
  musicDuration, 
  buttonVariant, 
  onGenerate 
}) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex justify-center">
      <Button
        variant={buttonVariant}
        onClick={onGenerate}
        disabled={isDisabled}
        className="px-6 py-3 min-h-[44px]"
        aria-label={`Générer la chanson du rang ${libelleRang ?? rang}`}
        aria-busy={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Génération en cours...</span>
          </>
        ) : (
          `Générer la chanson Rang ${libelleRang ?? rang} (${formatDuration(musicDuration)})`
        )}
      </Button>
    </div>
  );
};
