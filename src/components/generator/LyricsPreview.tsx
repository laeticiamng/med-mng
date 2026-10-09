import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Loader2,
  Music,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOicCompetences } from '@/hooks/useOicCompetences';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LyricsPreviewProps {
  lyrics: string[] | string;
  title?: string;
  rang?: string;
  className?: string;
  /** Durée estimée de la chanson (déjà formatée, ex. « ≈ 3 min 51 »). */
  dureeAffichee?: string;
  /** Vrai si les paroles dépassent la limite du service et seront réellement coupées. */
  tronque?: boolean;
  lignesRetirees?: number;
  /** Emplacement pour un bouton d'export, affiché discrètement à côté de « Copier ». */
  exportSlot?: React.ReactNode;
  /** Item des paroles : affiche aussi les connaissances officielles dont elles sont tirées. */
  itemCode?: string;
}

interface Section {
  titre: string | null;
  lignes: string[];
}

/** Découpe les paroles en sections à partir des balises « [Couplet 1] », « [Refrain] »… */
export const decouperParoles = (texte: string): Section[] => {
  const sections: Section[] = [];
  let courante: Section = { titre: null, lignes: [] };
  for (const brute of texte.split('\n')) {
    const ligne = brute.trim();
    const balise = /^\[(.+)\]$/.exec(ligne);
    if (balise) {
      if (courante.titre !== null || courante.lignes.length > 0)
        sections.push(courante);
      courante = { titre: balise[1], lignes: [] };
    } else if (ligne) {
      courante.lignes.push(ligne);
    }
  }
  if (courante.titre !== null || courante.lignes.length > 0)
    sections.push(courante);
  return sections;
};

const libelleRang = (rang?: string) =>
  rang === 'AB' ? 'Rangs A + B' : rang ? `Rang ${rang}` : null;

/**
 * Paroles qui seront chantées, à côté du programme officiel dont elles sont
 * tirées : l'étudiant voit la source (connaissances LiSA/UNESS du rang choisi)
 * et sa transformation en paroles, avant de lancer la chanson.
 */
export const LyricsPreview: React.FC<LyricsPreviewProps> = ({
  lyrics,
  title,
  rang,
  className = '',
  dureeAffichee,
  tronque = false,
  lignesRetirees,
  exportSlot,
  itemCode,
}) => {
  const [onglet, setOnglet] = useState<'paroles' | 'source'>('paroles');
  const [deplie, setDeplie] = useState(false);
  const [copie, setCopie] = useState(false);

  const texte = Array.isArray(lyrics) ? lyrics.join('\n') : lyrics;
  const sections = useMemo(() => decouperParoles(texte), [texte]);
  const nbLignes = sections.reduce((n, s) => n + s.lignes.length, 0);
  const sectionsVisibles = deplie ? sections : sections.slice(0, 2);
  const aPlus = sections.length > 2;

  const { competences: sourceA, loading: chargeA } = useOicCompetences(
    itemCode || '',
    'A'
  );
  const { competences: sourceB, loading: chargeB } = useOicCompetences(
    itemCode || '',
    'B'
  );
  const source =
    rang === 'A'
      ? sourceA
      : rang === 'B'
        ? sourceB
        : rang === 'AB'
          ? [...sourceA, ...sourceB]
          : [];
  const chargementSource = Boolean(itemCode) && (chargeA || chargeB);

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(texte);
      setCopie(true);
      toast.success('Paroles copiées');
      setTimeout(() => setCopie(false), 2000);
    } catch {
      toast.error('Copie impossible');
    }
  };

  if (!texte || texte.trim() === '') return null;

  return (
    <section
      className={cn(
        'rounded-2xl border border-border bg-card/70 p-4 sm:p-5',
        className
      )}
      aria-label={`Paroles${title ? ` – ${title}` : ''}`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div
          role="tablist"
          aria-label="Paroles et programme officiel"
          className="inline-flex rounded-lg bg-muted/50 p-1"
        >
          {(
            [
              ['paroles', 'Paroles', Music],
              ['source', 'Programme officiel', BookOpen],
            ] as const
          ).map(([cle, libelle, Icone]) => (
            <button
              key={cle}
              type="button"
              role="tab"
              aria-selected={onglet === cle}
              onClick={() => setOnglet(cle)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-200',
                onglet === cle
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icone className="h-3.5 w-3.5" aria-hidden="true" />
              {libelle}
              {cle === 'source' &&
                itemCode &&
                !chargementSource &&
                source.length > 0 && (
                  <span className="text-muted-foreground">
                    ({source.length})
                  </span>
                )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {exportSlot}
          <Button
            variant="ghost"
            size="sm"
            onClick={copier}
            className="h-8 px-2"
            aria-label={copie ? 'Paroles copiées' : 'Copier les paroles'}
          >
            {copie ? (
              <Check className="h-4 w-4 text-success" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {libelleRang(rang) && (
          <Badge variant="outline" className="text-xs">
            {libelleRang(rang)}
          </Badge>
        )}
        <span>{nbLignes} lignes chantées</span>
        {dureeAffichee && (
          <span aria-label={`Durée estimée ${dureeAffichee}`}>
            · durée estimée {dureeAffichee.replace(/^≈\s*/, '≈ ')}
          </span>
        )}
        {tronque && (
          <Badge
            variant="outline"
            className="border-warning text-xs text-warning"
            role="alert"
          >
            {lignesRetirees
              ? `${lignesRetirees} dernière${lignesRetirees > 1 ? 's' : ''} ligne${lignesRetirees > 1 ? 's' : ''} ne seront pas chantées`
              : 'Paroles raccourcies'}
          </Badge>
        )}
      </div>

      {onglet === 'paroles' ? (
        <>
          <div
            id="paroles-contenu"
            className={cn(
              'relative space-y-4 rounded-xl bg-muted/25 px-4 py-4 sm:px-6',
              deplie && 'max-h-[32rem] overflow-y-auto'
            )}
            tabIndex={0}
            aria-label="Paroles qui seront chantées"
          >
            {sectionsVisibles.map((s, i) => (
              <div key={i}>
                {s.titre && (
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary/80">
                    {s.titre}
                  </p>
                )}
                <div className="space-y-0.5">
                  {s.lignes.map((l, j) => (
                    <p
                      key={j}
                      className="text-[15px] leading-relaxed text-foreground/90"
                    >
                      {l}
                    </p>
                  ))}
                </div>
              </div>
            ))}
            {!deplie && aPlus && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 rounded-b-xl bg-gradient-to-t from-card/90 to-transparent" />
            )}
          </div>
          {aPlus && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeplie(!deplie)}
              className="mt-2 h-9 w-full"
              aria-expanded={deplie}
              aria-controls="paroles-contenu"
            >
              {deplie ? (
                <>
                  <ChevronUp className="mr-1 h-4 w-4" aria-hidden="true" />
                  Réduire
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-4 w-4" aria-hidden="true" />
                  Lire toutes les paroles ({sections.length} parties)
                </>
              )}
            </Button>
          )}
        </>
      ) : (
        <div className="rounded-xl bg-muted/25 px-4 py-4 sm:px-6">
          <p className="mb-3 text-xs text-muted-foreground">
            Connaissances officielles (LiSA/UNESS) dont les paroles sont tirées.
            Les paroles les reformulent pour être chantées ; en cas de doute,
            c'est ce texte qui fait foi.
          </p>
          {chargementSource ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Lecture du programme officiel…
            </p>
          ) : source.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Programme officiel indisponible pour ce choix.
            </p>
          ) : (
            <ol className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
              {source.map((c) => (
                <li key={c.objectif_id} className="text-sm leading-relaxed">
                  <span className="mr-2 font-mono text-[11px] text-muted-foreground">
                    {c.objectif_id}
                  </span>
                  <span className="font-medium text-foreground">
                    {c.intitule}
                  </span>
                  {c.description && c.description !== c.intitule && (
                    <span className="mt-0.5 block text-muted-foreground">
                      {c.description}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  );
};
