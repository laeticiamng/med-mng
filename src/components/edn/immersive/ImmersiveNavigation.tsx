
import { Button } from '@/components/ui/button';

interface ImmersiveNavigationProps {
  currentSection: number;
  sectionsLength: number;
  onPrevSection: () => void;
  onNextSection: () => void;
  onSetSection: (index: number) => void;
}

export const ImmersiveNavigation = ({
  currentSection,
  sectionsLength,
  onPrevSection,
  onNextSection,
  onSetSection
}: ImmersiveNavigationProps) => {
  return (
    <div className="border-t border-amber-200 p-4 sm:p-6 bg-amber-50/50">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button
          variant="outline"
          onClick={onPrevSection}
          disabled={currentSection === 0}
          className="border-amber-300 text-amber-700 hover:bg-amber-100 disabled:opacity-50 w-full sm:w-auto"
          size="sm"
        >
          Précédent
        </Button>
        
        <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
          {Array.from({ length: sectionsLength }, (_, index) => (
            <button
              key={index}
              onClick={() => onSetSection(index)}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors ${
                index === currentSection
                  ? 'bg-amber-600'
                  : index < currentSection
                  ? 'bg-amber-400'
                  : 'bg-amber-200'
              }`}
              aria-label={`Section ${index + 1}`}
            />
          ))}
        </div>
        
        <Button
          onClick={onNextSection}
          disabled={currentSection === sectionsLength - 1}
          className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 w-full sm:w-auto"
          size="sm"
        >
          Suivant
        </Button>
      </div>
    </div>
  );
};
