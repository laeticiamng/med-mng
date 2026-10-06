import { PenLine } from 'lucide-react';
import React from 'react';
import { errataDeFond, type CorrectionLisa } from '@/config/errataLisa';

interface ErrataCompetenceProps {
  objectifId: string | null | undefined;
  corrections: ReadonlyArray<Partial<CorrectionLisa>> | null | undefined;
  className?: string;
}

/**
 * Errata de fond (CF-10 bis, décision CEO du 06.10.2026) : la correction
 * appliquée par Med MNG au texte LiSA est montrée en clair, avec le texte
 * d'origine et le motif. Rien n'est rendu pour une coquille.
 */
export const ErrataCompetence: React.FC<ErrataCompetenceProps> = ({
  objectifId,
  corrections,
  className,
}) => {
  const errata = errataDeFond(objectifId, corrections);
  if (errata.length === 0) return null;

  return (
    <aside
      role="note"
      aria-label={`Erratum Med MNG — ${objectifId}`}
      data-testid="erratum-med-mng"
      className={`rounded-lg border border-warning/40 bg-warning/5 p-3 text-sm text-foreground/90 ${className ?? ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start gap-2">
        <PenLine
          className="h-4 w-4 mt-0.5 shrink-0 text-warning"
          aria-hidden="true"
        />
        <div className="space-y-1 min-w-0">
          <p className="text-xs text-muted-foreground">
            Le texte affiché ci-dessus corrige le référentiel LiSA 2026 :
          </p>
          <ul className="space-y-1">
            {errata.map((c) => (
              <li key={c.avant}>
                {`Texte LiSA : « ${c.avant} » — erratum Med MNG : « ${c.apres} » (${c.motif})`}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
};
