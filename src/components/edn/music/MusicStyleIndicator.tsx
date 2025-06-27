
import { Music } from 'lucide-react';

interface MusicStyleIndicatorProps {
  selectedStyle: string;
  musicStyles: Array<{ value: string; label: string }>;
}

export const MusicStyleIndicator = ({ selectedStyle, musicStyles }: MusicStyleIndicatorProps) => {
  if (!selectedStyle) return null;

  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full">
        <Music className="h-4 w-4" />
        <span className="font-medium">
          Style sélectionné : {musicStyles.find(s => s.value === selectedStyle)?.label} - Durée: 4 minutes
        </span>
      </div>
    </div>
  );
};
