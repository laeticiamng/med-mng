import React from 'react';
import { CheckCircle2, Crown, Star, Zap } from 'lucide-react';
import { useOicCompetences } from '@/hooks/useOicCompetences';
import { cn } from '@/lib/utils';

interface RangSelectorProps {
  selectedRang: string;
  setSelectedRang: (rang: string) => void;
  /** Item choisi : sert à lire le nombre réel de connaissances officielles par rang. */
  itemCode?: string;
  /**
   * Paroles rédigées disponibles par rang. Un rang sans paroles prêtes reste
   * sélectionnable : ses paroles sont alors rédigées depuis les connaissances
   * officielles de l'item au moment de la génération — SAUF si l'item n'a
   * aucune connaissance officielle de ce rang (état normal pour 13 items),
   * auquel cas le rang est désactivé avec la raison exacte.
   */
  lyricsAvailability?: {
    hasA: boolean;
    hasB: boolean;
    hasAB: boolean;
  };
  /** Paroles de l'item réservées à Med MNG Premium : pas de pastille « prêtes / à rédiger ». */
  verrouille?: boolean;
  /** Nombre de connaissances par rang (pour un parent qui les lit déjà). */
  onComptes?: (comptes: {
    nbA: number;
    nbB: number;
    chargement: boolean;
  }) => void;
}

const RANGS = [
  {
    value: 'A',
    titre: 'Essentiel',
    rang: 'Rang A',
    description: 'Connaissances attendues de tout étudiant en fin de 2e cycle',
    icon: Star,
  },
  {
    value: 'B',
    titre: 'Approfondissement',
    rang: 'Rang B',
    description:
      'Connaissances attendues au premier jour d’internat dans la spécialité',
    icon: Zap,
  },
  {
    value: 'AB',
    titre: 'Complet',
    rang: 'Rangs A + B',
    description: 'Tout l’item, rang A puis rang B',
    icon: Crown,
  },
] as const;

/** Raison exacte pour laquelle un rang n'est pas proposé (jamais un « manque » de contenu). */
export const raisonRangIndisponible = (
  rang: string,
  nbA: number,
  nbB: number
): string | null => {
  if (rang === 'A' && nbA === 0)
    return 'Pas de rang A au programme officiel de cet item';
  if (rang === 'B' && nbB === 0)
    return 'Pas de rang B au programme officiel de cet item';
  if (rang === 'AB' && nbB === 0 && nbA > 0)
    return 'Identique à Essentiel : cet item n’a que du rang A';
  if (rang === 'AB' && nbA === 0 && nbB > 0)
    return 'Identique à Approfondissement : cet item n’a que du rang B';
  if (rang === 'AB' && nbA === 0 && nbB === 0)
    return 'Aucune connaissance officielle pour cet item';
  return null;
};

export const RangSelector: React.FC<RangSelectorProps> = ({
  selectedRang,
  setSelectedRang,
  itemCode,
  lyricsAvailability,
  verrouille = false,
  onComptes,
}) => {
  // Nombre réel de connaissances officielles (LiSA/UNESS) par rang pour cet item.
  const { competences: competencesA, loading: chargeA } = useOicCompetences(
    itemCode || '',
    'A'
  );
  const { competences: competencesB, loading: chargeB } = useOicCompetences(
    itemCode || '',
    'B'
  );
  const chargement = Boolean(itemCode) && (chargeA || chargeB);
  const nbA = competencesA.length;
  const nbB = competencesB.length;

  React.useEffect(() => {
    onComptes?.({ nbA, nbB, chargement });
  }, [nbA, nbB, chargement, onComptes]);

  const raison = (rang: string) =>
    !itemCode || chargement ? null : raisonRangIndisponible(rang, nbA, nbB);

  const parolesPretes = (rang: string) =>
    rang === 'A'
      ? lyricsAvailability?.hasA
      : rang === 'B'
        ? lyricsAvailability?.hasB
        : lyricsAvailability?.hasAB;

  return (
    <div
      role="radiogroup"
      aria-label="Niveau de connaissances"
      className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3"
    >
      {RANGS.map((r) => {
        const Icon = r.icon;
        const indisponible = raison(r.value);
        const choisi = selectedRang === r.value && !indisponible;
        const pret = parolesPretes(r.value);
        return (
          <button
            key={r.value}
            type="button"
            role="radio"
            aria-checked={choisi}
            aria-disabled={Boolean(indisponible) || !itemCode}
            disabled={Boolean(indisponible) || !itemCode}
            onClick={() => setSelectedRang(r.value)}
            className={cn(
              'relative flex items-start gap-3 rounded-xl border p-3 text-left sm:flex-col sm:gap-1.5',
              'transition-[border-color,background-color,box-shadow] duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              choisi
                ? 'border-primary bg-primary/10 shadow-sm'
                : 'border-border bg-background/50 hover:border-primary/40 hover:bg-background/80',
              (indisponible || !itemCode) &&
                'cursor-not-allowed opacity-55 hover:border-border hover:bg-background/50'
            )}
          >
            <Icon
              className={cn(
                'mt-0.5 h-5 w-5 shrink-0',
                choisi ? 'text-primary' : 'text-muted-foreground'
              )}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {r.titre}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {r.rang}
                </span>
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                {indisponible ?? r.description}
              </span>
              {!indisponible &&
                itemCode &&
                !verrouille &&
                lyricsAvailability && (
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    {pret
                      ? 'Paroles déjà rédigées'
                      : 'Paroles rédigées au lancement, depuis le programme officiel'}
                  </span>
                )}
            </span>
            {choisi && (
              <CheckCircle2
                className="absolute right-2 top-2 h-4 w-4 text-primary"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
