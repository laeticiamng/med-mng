import React from 'react';
import {
  MENTION_CONTENU_IA,
  type TypeContenuSignale,
} from '@/config/mentionsContenu';
import { SignalerErreur } from './SignalerErreur';

interface MentionContenuIAProps {
  itemCode: string;
  typeContenu: Exclude<TypeContenuSignale, 'competence'>;
  /** Partie affichée (chapitre, planche…), jointe au signalement. */
  reference?: string | null;
  /** Précision propre au contenu, affichée après la mention commune. */
  complement?: string;
  className?: string;
}

/**
 * Mention commune du contenu rédigé par IA (récit, planches, paroles) et
 * bouton « Signaler une erreur » — CF-10, décision CEO du 06.10.2026.
 */
export const MentionContenuIA: React.FC<MentionContenuIAProps> = ({
  itemCode,
  typeContenu,
  reference,
  complement,
  className,
}) => (
  <div
    className={`flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between ${className ?? ''}`}
    data-testid="mention-contenu-ia"
  >
    <p className="text-xs text-muted-foreground">
      {MENTION_CONTENU_IA}
      {complement ? ` ${complement}` : ''}
    </p>
    <div className="shrink-0">
      <SignalerErreur
        itemCode={itemCode}
        typeContenu={typeContenu}
        reference={reference}
      />
    </div>
  </div>
);
