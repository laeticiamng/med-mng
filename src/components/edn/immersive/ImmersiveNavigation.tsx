
import { Button } from '@/components/ui/button';

interface ImmersiveNavigationProps {
  sections: string[];
  currentSection: number;
  onSectionChange: (index: number) => void;
  _progress: number;
  hasNext: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export const ImmersiveNavigation = ({
  sections,
  currentSection,
  onSectionChange,
  _progress,
  hasNext,
  hasPrev,
  onNext,
  onPrev
}: ImmersiveNavigationProps) => {
  return (
    <div className="bg-background/90 backdrop-blur-sm border border-warning/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={!hasPrev}
          className="border-warning/30 text-warning hover:bg-warning/10"
        >
          ← Précédent
        </Button>
        
        <div className="text-center">
          <div className="text-sm font-medium text-warning">
            {sections[currentSection] || 'Section inconnue'}
          </div>
          <div className="text-xs text-warning/70">
            {currentSection + 1} / {sections.length}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasNext}
          className="border-warning/30 text-warning hover:bg-warning/10"
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
                ? 'bg-warning' 
                : 'bg-warning/20 hover:bg-warning/40'
            }`}
            title={section}
          />
        ))}
      </div>
    </div>
  );
};
