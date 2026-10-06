import React from 'react';
import { noteActualisation } from '@/config/notesActualisation';
import { NoteActualisation } from './NoteActualisation';

interface AnnotationsCompetenceProps {
  objectifId: string | null | undefined;
  className?: string;
}

/**
 * Ce que Med MNG affiche SOUS le texte officiel d'une compétence, sans le
 * modifier : note d'actualisation (DC2). Rien n'est rendu sinon.
 */
export const AnnotationsCompetence: React.FC<AnnotationsCompetenceProps> = ({
  objectifId,
  className,
}) => {
  if (!noteActualisation(objectifId)) return null;
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <NoteActualisation objectifId={objectifId} />
    </div>
  );
};
