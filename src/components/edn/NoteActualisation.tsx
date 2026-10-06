import { ExternalLink, Info } from 'lucide-react';
import React from 'react';
import { noteActualisation } from '@/config/notesActualisation';

interface NoteActualisationProps {
  objectifId: string | null | undefined;
  /** Phrase d'introduction facultative (ex. sous un chapitre du récit). */
  introduction?: string;
  className?: string;
}

/**
 * Note d'actualisation d'une compétence (src/config/notesActualisation.ts),
 * affichée sous le texte LiSA, qui reste inchangé. Rien n'est rendu si la
 * compétence n'a pas de note.
 */
export const NoteActualisation: React.FC<NoteActualisationProps> = ({
  objectifId,
  introduction,
  className,
}) => {
  const note = noteActualisation(objectifId);
  if (!note) return null;

  return (
    <aside
      role="note"
      aria-label={`Note d'actualisation — ${objectifId}`}
      data-testid="note-actualisation"
      className={`rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm text-foreground/90 ${className ?? ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start gap-2">
        <Info
          className="h-4 w-4 mt-0.5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <div className="space-y-2 min-w-0">
          {introduction && (
            <p className="text-xs text-muted-foreground">{introduction}</p>
          )}
          <p className="leading-relaxed">
            {note.segments.map((s, i) =>
              s.gras ? (
                <strong key={i}>{s.texte}</strong>
              ) : s.italique ? (
                <em key={i}>{s.texte}</em>
              ) : (
                <React.Fragment key={i}>{s.texte}</React.Fragment>
              )
            )}
          </p>
          <ul className="space-y-1 text-xs">
            {note.sources.map((src) => (
              <li key={src.url}>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-1 underline underline-offset-2 hover:text-foreground break-words"
                >
                  {src.libelle}
                  <ExternalLink
                    className="h-3 w-3 mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
};
