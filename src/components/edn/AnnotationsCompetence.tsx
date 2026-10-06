import React from 'react';
import { errataDeFond, type CorrectionLisa } from '@/config/errataLisa';
import { noteActualisation } from '@/config/notesActualisation';
import { ErrataCompetence } from './ErrataCompetence';
import { NoteActualisation } from './NoteActualisation';

interface AnnotationsCompetenceProps {
  objectifId: string | null | undefined;
  /** `contenu_detaille.corrections` de la compétence (seules les corrections de fond sont montrées). */
  corrections?: ReadonlyArray<Partial<CorrectionLisa>> | null;
  className?: string;
}

/**
 * Ce que Med MNG affiche SOUS le texte officiel d'une compétence : erratum de
 * fond appliqué au texte LiSA (CF-10 bis) et note d'actualisation (DC2).
 * Rien n'est rendu sinon.
 */
export const AnnotationsCompetence: React.FC<AnnotationsCompetenceProps> = ({
  objectifId,
  corrections,
  className,
}) => {
  const aErrata = errataDeFond(objectifId, corrections).length > 0;
  const aNote = Boolean(noteActualisation(objectifId));
  if (!aErrata && !aNote) return null;
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      {aErrata && (
        <ErrataCompetence objectifId={objectifId} corrections={corrections} />
      )}
      {aNote && <NoteActualisation objectifId={objectifId} />}
    </div>
  );
};
