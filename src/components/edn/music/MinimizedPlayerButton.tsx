
import { Button } from '@/components/ui/button';
import { Minimize2 } from 'lucide-react';

interface MinimizedPlayerButtonProps {
  rang: 'A' | 'B';
  isVisible: boolean;
  onMinimize: () => void;
}

export const MinimizedPlayerButton = ({ rang, isVisible, onMinimize }: MinimizedPlayerButtonProps) => {
  if (!isVisible) return null;

  return (
    <div className="text-center">
      <Button
        onClick={onMinimize}
        variant="outline"
        className={`${rang === 'A' ? 'border-warning/50 text-warning hover:bg-warning/10' : 'border-primary/50 text-primary hover:bg-primary/10'}`}
      >
        <Minimize2 className="h-4 w-4 mr-2" />
        Lecteur minimisé - Continuer l'écoute
      </Button>
    </div>
  );
};
