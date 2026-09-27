
import { GenerateButton } from './GenerateButton';
import { formatParoles, hasValidParoles } from './utils/parolesFormatter';
import { getCardStyling } from './utils/cardStyling';

interface MusicCardActionsProps {
  rang: 'A' | 'B';
  libelleRang?: string;
  /** Génération réservée (pas d'accès Premium, ou vérification en cours) : pas de bouton. */
  generationVerrouillee?: boolean;
  paroles: string;
  selectedStyle: string;
  musicDuration: number;
  isGenerating: boolean;
  isClicked: boolean;
  onGenerate: () => void;
}

export const MusicCardActions = ({
  rang,
  libelleRang,
  generationVerrouillee = false,
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

  if (generationVerrouillee) return null;

  return (
    <>
      <GenerateButton
        rang={rang}
        libelleRang={libelleRang}
        isGenerating={isGenerating}
        isDisabled={isButtonDisabled}
        musicDuration={musicDuration}
        buttonVariant={styling.buttonVariant}
        onGenerate={onGenerate}
      />
      
      {!hasValidParolesData && (
        <p className="text-center text-sm text-muted-foreground">
          Pas encore de paroles pour ce rang : la génération n'est pas disponible.
        </p>
      )}
    </>
  );
};
