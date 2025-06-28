
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface GenerateButtonProps {
  rang: 'A' | 'B';
  isGenerating: boolean;
  isDisabled: boolean;
  musicDuration: number;
  buttonColor: string;
  onGenerate: () => void;
}

export const GenerateButton = ({ 
  rang, 
  isGenerating, 
  isDisabled, 
  musicDuration, 
  buttonColor, 
  onGenerate 
}: GenerateButtonProps) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex justify-center">
      <Button
        onClick={onGenerate}
        disabled={isDisabled}
        className={`${buttonColor} text-white px-6 py-3 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Génération en cours...
          </>
        ) : (
          `Générer Musique Rang ${rang} (${formatDuration(musicDuration)})`
        )}
      </Button>
    </div>
  );
};
