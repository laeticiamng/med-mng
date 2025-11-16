
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { musicStyles } from './MusicStylesData';

interface ParolesMusicalesControlsProps {
  selectedStyle: string;
  musicDuration: number;
  onStyleChange: (style: string) => void;
  onDurationChange: (duration: number) => void;
}

export const ParolesMusicalesControls: React.FC<ParolesMusicalesControlsProps> = ({
  selectedStyle,
  musicDuration,
  onStyleChange,
  onDurationChange
}) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-2">Style musical Suno :</label>
        <Select value={selectedStyle} onValueChange={onStyleChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {musicStyles.map((style) => (
              <SelectItem key={style.value} value={style.value}>
                {style.label} - {style.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Durée :</label>
        <Select value={musicDuration.toString()} onValueChange={(value) => onDurationChange(parseInt(value))}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="120">2:00 - Court</SelectItem>
            <SelectItem value="180">3:00 - Standard</SelectItem>
            <SelectItem value="240">4:00 - Long</SelectItem>
            <SelectItem value="300">5:00 - Étendu</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
