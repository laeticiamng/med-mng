
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
    <div className="border-t border-amber-200 p-6 bg-amber-50/50">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={onPrevSection}
          disabled={currentSection === 0}
          className="border-amber-300 text-amber-700 hover:bg-amber-100 disabled:opacity-50"
        >
          Précédent
        </Button>
        
        <div className="flex gap-2">
          {Array.from({ length: sectionsLength }, (_, index) => (
            <button
              key={index}
              onClick={() => onSetSection(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSection
                  ? 'bg-amber-600'
                  : index < currentSection
                  ? 'bg-amber-400'
                  : 'bg-amber-200'
              }`}
            />
          ))}
        </div>
        
        <Button
          onClick={onNextSection}
          disabled={currentSection === sectionsLength - 1}
          className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
        >
          Suivant
        </Button>
      </div>
    </div>
  );
};
