
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings } from 'lucide-react';

interface MusicStyleSelectorProps {
  selectedStyle: string;
  onStyleChange: (style: string) => void;
  musicStyles: Array<{ value: string; label: string }>;
}

export const MusicStyleSelector = ({ selectedStyle, onStyleChange, musicStyles }: MusicStyleSelectorProps) => {
  return (
    <div className="max-w-md mx-auto mb-8">
      <div className="flex items-center gap-3 mb-3">
        <Settings className="h-5 w-5 text-amber-600" />
        <span className="font-medium text-amber-800">Style Musical</span>
      </div>
      <Select value={selectedStyle} onValueChange={onStyleChange}>
        <SelectTrigger className="border-amber-300 focus:border-amber-500">
          <SelectValue placeholder="Choisissez votre style musical" />
        </SelectTrigger>
        <SelectContent>
          {musicStyles.map((style) => (
            <SelectItem key={style.value} value={style.value}>
              {style.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
