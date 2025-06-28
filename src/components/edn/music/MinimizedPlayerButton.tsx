
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
        className={`${rang === 'A' ? 'border-amber-300 text-amber-600 hover:bg-amber-50' : 'border-blue-300 text-blue-600 hover:bg-blue-50'}`}
      >
        <Minimize2 className="h-4 w-4 mr-2" />
        Lecteur minimisé - Continuer l'écoute
      </Button>
    </div>
  );
};
