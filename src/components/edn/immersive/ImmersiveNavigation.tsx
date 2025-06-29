
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    <div className="border-t border-amber-200 p-3 sm:p-6 bg-amber-50/50 sticky bottom-0 z-10">
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Indicateurs de progression - optimisés mobile */}
        <div className="flex gap-1.5 sm:gap-2 justify-center overflow-x-auto pb-1">
          {Array.from({ length: sectionsLength }, (_, index) => (
            <button
              key={index}
              onClick={() => onSetSection(index)}
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full transition-all duration-200 flex-shrink-0 ${
                index === currentSection
                  ? 'bg-amber-600 scale-110'
                  : index < currentSection
                  ? 'bg-amber-400 hover:bg-amber-500'
                  : 'bg-amber-200 hover:bg-amber-300'
              }`}
              aria-label={`Section ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Boutons de navigation - améliorés pour mobile */}
        <div className="flex justify-between items-center gap-3">
          <Button
            variant="outline"
            onClick={onPrevSection}
            disabled={currentSection === 0}
            className="border-amber-300 text-amber-700 hover:bg-amber-100 disabled:opacity-50 flex-1 sm:flex-none min-w-0"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 sm:mr-1" />
            <span className="hidden xs:inline">Précédent</span>
          </Button>
          
          {/* Indicateur de section actuelle - visible sur mobile */}
          <div className="text-sm font-medium text-amber-700 px-2 py-1 bg-amber-100 rounded-full whitespace-nowrap">
            {currentSection + 1} / {sectionsLength}
          </div>
          
          <Button
            onClick={onNextSection}
            disabled={currentSection === sectionsLength - 1}
            className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 flex-1 sm:flex-none min-w-0"
            size="sm"
          >
            <span className="hidden xs:inline">Suivant</span>
            <ChevronRight className="h-4 w-4 sm:ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
