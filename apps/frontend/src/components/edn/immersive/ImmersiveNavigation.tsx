
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImmersiveNavigationProps {
  sections: string[];
  currentSection: number;
  onSectionChange: (index: number) => void;
  progress: number;
  hasNext: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export const ImmersiveNavigation = ({
  sections,
  currentSection,
  onSectionChange,
  progress,
  hasNext,
  hasPrev,
  onNext,
  onPrev
}: ImmersiveNavigationProps) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={!hasPrev}
          className="border-amber-300 text-amber-700 hover:bg-amber-50"
        >
          ← Précédent
        </Button>
        
        <div className="text-center">
          <div className="text-sm font-medium text-amber-800">
            {sections[currentSection] || 'Section inconnue'}
          </div>
          <div className="text-xs text-amber-600">
            {currentSection + 1} / {sections.length}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasNext}
          className="border-amber-300 text-amber-700 hover:bg-amber-50"
        >
          Suivant →
        </Button>
      </div>
      
      <div className="flex gap-1 justify-center">
        {sections.map((section, index) => (
          <button
            key={index}
            onClick={() => onSectionChange(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSection 
                ? 'bg-amber-600' 
                : 'bg-amber-200 hover:bg-amber-300'
            }`}
            title={section}
          />
        ))}
      </div>
    </div>
  );
};
