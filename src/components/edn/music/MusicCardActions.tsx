
import { GenerateButton } from './GenerateButton';
import { formatParoles, hasValidParoles } from './utils/parolesFormatter';
import { getCardStyling } from './utils/cardStyling';

interface MusicCardActionsProps {
  rang: 'A' | 'B';
  paroles: string;
  selectedStyle: string;
  musicDuration: number;
  isGenerating: boolean;
  isClicked: boolean;
  onGenerate: () => void;
}

export const MusicCardActions = ({
  rang,
  paroles,
  selectedStyle,
  musicDuration,
  isGenerating,
  isClicked,
  onGenerate
}: MusicCardActionsProps) => {
  const styling = getCardStyling(rang);
  const parolesArray = formatParoles(paroles);
  const hasValidParolesData = hasValidParoles(parolesArray);
  const isButtonDisabled = isGenerating || isClicked || !selectedStyle || !hasValidParolesData;

  return (
    <>
      <GenerateButton
        rang={rang}
        isGenerating={isGenerating}
        isDisabled={isButtonDisabled}
        musicDuration={musicDuration}
        buttonColor={styling.buttonColor}
        onGenerate={onGenerate}
      />
      
      {!hasValidParolesData && (
        <p className="text-center text-sm text-gray-600">
          La génération nécessite des paroles valides depuis la base de données Supabase.
        </p>
      )}
    </>
  );
};
