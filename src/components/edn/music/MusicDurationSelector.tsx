
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface MusicDurationSelectorProps {
  duration: number;
  onDurationChange: (duration: number) => void;
  disabled?: boolean;
}

export const MusicDurationSelector = ({ 
  duration, 
  onDurationChange, 
  disabled = false 
}: MusicDurationSelectorProps) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-700">
        Durée de la musique : {formatDuration(duration)}
      </Label>
      <div className="px-2">
        <Slider
          value={[duration]}
          onValueChange={(values) => onDurationChange(values[0])}
          min={60}
          max={600}
          step={30}
          disabled={disabled}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1:00</span>
          <span>5:00</span>
          <span>10:00</span>
        </div>
      </div>
    </div>
  );
};
