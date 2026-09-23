import DOMPurify from 'dompurify';
import { ExternalLink } from 'lucide-react';
import React, { useMemo } from 'react';

/**
 * Contenu officiel d'une compétence OIC, tel que publié dans LiSA 2026 (UNESS) :
 * texte complet, listes, tableaux et figures. Le HTML est nettoyé à la
 * préparation puis repassé ici dans DOMPurify (liste blanche stricte).
 */

const BALISES = ['p', 'br', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
  'caption', 'b', 'strong', 'i', 'em', 'u', 'ins', 'sup', 'sub', 'h2', 'h3', 'h4', 'h5', 'a', 'img', 'figure',
  'figcaption', 'blockquote', 'pre', 'code', 'hr', 'div', 'small', 's', 'del', 'center', 'font'];
const ATTRIBUTS = ['href', 'target', 'rel', 'src', 'alt', 'width', 'height', 'loading', 'colspan', 'rowspan', 'start', 'type', 'class'];

export function nettoyerHtmlOIC(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: BALISES,
    ALLOWED_ATTR: ATTRIBUTS,
    ALLOWED_URI_REGEXP: /^https:\/\//i,
  }) as unknown as string;
}

interface ContenuOfficielOICProps {
  html?: string | null;
  texte?: string | null;
  urlSource?: string | null;
  majLisa?: string | null;
  compact?: boolean;
}

export const ContenuOfficielOIC: React.FC<ContenuOfficielOICProps> = ({ html, texte, urlSource, majLisa, compact = false }) => {
  const propre = useMemo(() => nettoyerHtmlOIC(html ?? ''), [html]);
  const date = majLisa ? new Date(majLisa) : null;

  return (
    <div>
      {propre ? (
        <div className={`contenu-lisa ${compact ? 'contenu-lisa--compact' : ''}`} dangerouslySetInnerHTML={{ __html: propre }} />
      ) : texte ? (
        <p className="whitespace-pre-line text-base leading-relaxed text-foreground/90">{texte}</p>
      ) : null}
      {!compact && (urlSource || date) && (
        <p className="mt-4 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span>Source : référentiel national LiSA 2026 (UNESS)</span>
          {date && !Number.isNaN(date.getTime()) && (
            <span>· fiche mise à jour le {date.toLocaleDateString('fr-FR')}</span>
          )}
          {urlSource && (
            <a href={urlSource} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-foreground">
              voir la fiche <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </p>
      )}
    </div>
  );
};
