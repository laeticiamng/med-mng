import React from 'react';
import { PremiumCard } from '@/components/ui/premium-card';
import { TranslatedText } from '@/components/TranslatedText';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Star, Zap, Crown } from 'lucide-react';
import { useOicCompetences } from '@/hooks/useOicCompetences';

interface RangSelectorProps {
  selectedRang: string;
  setSelectedRang: (rang: string) => void;
  /** Item choisi : sert à lire le nombre réel de compétences officielles par rang. */
  itemCode?: string;
  /**
   * Paroles rédigées disponibles par rang. Un rang sans paroles prêtes reste
   * sélectionnable : ses paroles sont alors reconstruites depuis les
   * compétences OIC officielles de l'item au moment de la génération —
   * SAUF si l'item n'a tout simplement aucune compétence officielle pour ce
   * rang (rangACount / rangBCount ci-dessous), auquel cas rien ne peut être
   * reconstruit et le rang est désactivé plutôt que de proposer un choix vide.
   */
  lyricsAvailability?: {
    hasA: boolean;
    hasB: boolean;
    hasAB: boolean;
  };
}

const rangConfig = [
  {
    value: 'A',
    title: 'Rang A',
    subtitle: 'Essentiel',
    description: "Notions fondamentales - incontournables pour l'examen",
    tip: "80% des questions de l'examen",
    icon: Star,
    colorClass: 'ring-primary shadow-primary/20',
    iconColor: 'text-primary',
    badgeVariant: 'default' as const,
  },
  {
    value: 'B',
    title: 'Rang B',
    subtitle: 'Approfondissement',
    description: 'Connaissances avancées pour différencier les meilleurs',
    tip: "Pour viser l'excellence",
    icon: Zap,
    colorClass: 'ring-accent shadow-accent/20',
    iconColor: 'text-accent',
    badgeVariant: 'secondary' as const,
  },
  {
    value: 'AB',
    title: 'Rang A+B',
    subtitle: 'Complet',
    description:
      'Maîtrise totale - combine A et B pour une préparation optimale',
    tip: 'Recommandé pour révisions finales',
    icon: Crown,
    colorClass: 'ring-warning shadow-warning/20',
    iconColor: 'text-warning',
    badgeVariant: 'outline' as const,
  },
];

export const RangSelector: React.FC<RangSelectorProps> = ({
  selectedRang,
  setSelectedRang,
  itemCode,
  lyricsAvailability,
}) => {
  // Nombre réel de compétences officielles UNESS par rang pour cet item :
  // c'est le seul signal fiable de « rien à en tirer », les paroles pouvant
  // toujours être reconstruites depuis ces compétences à la génération.
  const { competences: competencesA, loading: chargeA } = useOicCompetences(
    itemCode || '',
    'A'
  );
  const { competences: competencesB, loading: chargeB } = useOicCompetences(
    itemCode || '',
    'B'
  );
  const chargementCompetences = Boolean(itemCode) && (chargeA || chargeB);
  const nbA = competencesA.length;
  const nbB = competencesB.length;

  const isAvailable = (rang: string) => {
    if (!itemCode) return true;
    // Tant que le compte des compétences n'est pas encore là, on ne désactive
    // rien (mieux vaut un rang provisoirement actif qu'un flash de rangs grisés).
    if (chargementCompetences) return true;
    switch (rang) {
      case 'A':
        return nbA > 0;
      case 'B':
        return nbB > 0;
      // A+B n'a de sens que si les deux rangs existent réellement ; sinon
      // c'est une copie exacte du rang A présentée comme un second choix.
      case 'AB':
        return nbA > 0 && nbB > 0;
      default:
        return true;
    }
  };

  const paroleesPretes = (rang: string) => {
    if (!lyricsAvailability) return false;
    switch (rang) {
      case 'A':
        return lyricsAvailability.hasA;
      case 'B':
        return lyricsAvailability.hasB;
      case 'AB':
        return lyricsAvailability.hasAB;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-base sm:text-lg font-semibold text-foreground">
          <TranslatedText text="Niveau" />
        </label>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {rangConfig.map((rang) => {
          const Icon = rang.icon;
          const available = isAvailable(rang.value);
          const pret = paroleesPretes(rang.value);
          const isSelected = selectedRang === rang.value;

          return (
            <PremiumCard
              key={rang.value}
              variant={isSelected ? 'elevated' : 'default'}
              className={`transition-all duration-300 p-2 sm:p-3 text-center relative overflow-hidden min-h-[72px] sm:min-h-[92px] ${
                !available
                  ? 'cursor-not-allowed opacity-45'
                  : `cursor-pointer hover-scale ${isSelected ? `ring-2 ${rang.colorClass}` : 'hover:shadow-lg'}`
              }`}
              onClick={() => available && setSelectedRang(rang.value)}
              role="button"
              aria-disabled={!available}
            >
              {isSelected && available && (
                <div className="absolute top-1 right-1">
                  <CheckCircle2 className={`h-4 w-4 ${rang.iconColor}`} />
                </div>
              )}

              <Icon
                className={`h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 ${available ? rang.iconColor : 'text-muted-foreground'}`}
              />
              <h3 className="text-sm sm:text-base font-bold text-foreground mb-0.5">
                {rang.subtitle}
              </h3>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                {rang.title}
              </p>

              {!available && (
                <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 leading-tight">
                  Aucun contenu disponible pour cet item
                </p>
              )}
              {available && lyricsAvailability && (
                <Badge
                  variant={pret ? rang.badgeVariant : 'secondary'}
                  className={`mt-1 text-[10px] sm:text-xs ${!pret ? 'bg-muted text-muted-foreground' : ''}`}
                  title={
                    pret
                      ? 'Paroles rédigées disponibles'
                      : 'Paroles reconstruites depuis les compétences OIC à la génération'
                  }
                >
                  {pret ? '✓ prêtes' : 'à générer'}
                </Badge>
              )}
            </PremiumCard>
          );
        })}
      </div>
    </div>
  );
};
