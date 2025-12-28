
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface GenerateButtonProps {
  rang: 'A' | 'B';
  isGenerating: boolean;
  isDisabled: boolean;
  musicDuration: number;
  buttonVariant: 'default' | 'secondary';
  onGenerate: () => void;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({ 
  rang, 
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
        aria-label={`Générer musique pour Rang ${rang}`}
        aria-busy={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Génération en cours...</span>
          </>
        ) : (
          `Générer Musique Rang ${rang} (${formatDuration(musicDuration)})`
        )}
      </Button>
    </div>
  );
};
