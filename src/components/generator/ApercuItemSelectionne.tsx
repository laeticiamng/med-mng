import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink, AlertTriangle } from 'lucide-react';
import { useOicCompetences } from '@/hooks/useOicCompetences';
import { cheminItemEdn } from '@/pages/edn-item/ednItemTabs';

/**
 * Ce que le générateur autonome affiche quand un item est choisi.
 *
 * Compact à dessein : l'utilisateur est venu créer une chanson, pas relire la
 * fiche de l'item. Une seule ligne de résumé (compétences par rang) et un lien
 * vers la fiche complète pour qui veut le détail. L'état « paroles prêtes / à
 * générer » par rang vit maintenant dans le sélecteur de rang juste en
 * dessous : pas besoin de le répéter ici.
 *
 * Avant, ce bloc affichait tout ça en plus des pastilles de paroles et d'une
 * phrase d'explication : la même information que la fiche de l'item, en plus
 * dense, avant même que l'utilisateur ait choisi un rang.
 */

interface Props {
  itemCode: string;
  titre?: string;
  slug?: string;
  /** Paroles stockées pour cet item, telles que chargées par le générateur. */
  parolesRangA?: string[] | null;
  parolesRangB?: string[] | null;
  parolesRangAB?: string[] | null;
}

export const ApercuItemSelectionne: React.FC<Props> = ({
  itemCode,
  titre,
  slug,
}) => {
  const {
    competences: rangA,
    loading: chargeA,
    error: erreurA,
  } = useOicCompetences(itemCode, 'A');
  const {
    competences: rangB,
    loading: chargeB,
    error: erreurB,
  } = useOicCompetences(itemCode, 'B');

  const chargement = chargeA || chargeB;
  const erreur = erreurA || erreurB;

  return (
    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg animate-fade-in space-y-1.5">
      <div className="flex items-start gap-2">
        <Badge className="bg-primary text-primary-foreground text-xs shrink-0">
          {itemCode}
        </Badge>
        <span className="text-sm font-medium text-foreground leading-snug line-clamp-1">
          {titre}
        </span>
      </div>

      {chargement && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          Lecture des compétences officielles…
        </p>
      )}

      {erreur && !chargement && (
        <p className="flex items-start gap-2 text-xs text-destructive">
          <AlertTriangle
            className="h-3.5 w-3.5 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          Compétences illisibles pour cet item : {erreur}
        </p>
      )}

      {!chargement && !erreur && rangA.length === 0 && rangB.length === 0 && (
        <p className="text-xs text-destructive">
          Le référentiel UNESS ne contient aucune compétence pour cet item :
          aucune chanson ne peut en être tirée.
        </p>
      )}

      {!chargement && !erreur && (rangA.length > 0 || rangB.length > 0) && (
        <p className="text-xs text-muted-foreground">
          {rangA.length} compétence{rangA.length > 1 ? 's' : ''} Rang A ·{' '}
          {rangB.length} Rang B
        </p>
      )}

      {slug && (
        <Link
          to={cheminItemEdn(slug)}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Voir la fiche EDN complète
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
};

export default ApercuItemSelectionne;
