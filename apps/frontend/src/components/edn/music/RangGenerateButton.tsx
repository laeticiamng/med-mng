
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface RangGenerateButtonProps {
  rang: 'A' | 'B';
  musicDuration: number;
  isGenerating: boolean;
  buttonColor: string;
  onGenerate: () => void;
}

export const RangGenerateButton: React.FC<RangGenerateButtonProps> = ({
  rang,
  musicDuration,
  isGenerating,
  buttonColor,
  onGenerate
}) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const buttonVariant = rang === 'A' ? 'default' : 'secondary';
  
  return (
    <Button 
      variant={buttonVariant}
      onClick={onGenerate}
      disabled={isGenerating}
      className="min-h-[44px]"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Génération Suno en cours...
        </>
      ) : (
        `Générer avec Suno Rang ${rang} (${formatDuration(musicDuration)})`
      )}
    </Button>
  );
};
