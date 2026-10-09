import React from 'react';
import { Link } from 'react-router-dom';
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
  /** Titre (affiché par le sélecteur ; conservé pour compatibilité). */
  titre?: string;
  slug?: string;
  /** Paroles stockées pour cet item, telles que chargées par le générateur. */
  parolesRangA?: string[] | null;
  parolesRangB?: string[] | null;
  parolesRangAB?: string[] | null;
}

export const ApercuItemSelectionne: React.FC<Props> = ({ itemCode, slug }) => {
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

  const pluriel = (n: number) => (n > 1 ? 's' : '');
  const resume =
    rangA.length > 0 && rangB.length > 0
      ? `${rangA.length} connaissance${pluriel(rangA.length)} de rang A · ${rangB.length} de rang B (programme officiel)`
      : rangA.length > 0
        ? `${rangA.length} connaissance${pluriel(rangA.length)} de rang A · pas de rang B au programme officiel`
        : `${rangB.length} connaissance${pluriel(rangB.length)} de rang B · pas de rang A au programme officiel`;

  // Le titre est déjà affiché dans le sélecteur : ici, seulement ce que l'item contient.
  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-xs text-muted-foreground"
      data-testid="apercu-item"
    >
      {chargement && (
        <span className="flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          Lecture des connaissances officielles…
        </span>
      )}

      {erreur && !chargement && (
        <span className="flex items-start gap-2 text-destructive">
          <AlertTriangle
            className="h-3.5 w-3.5 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          Compétences illisibles pour cet item : {erreur}
        </span>
      )}

      {!chargement && !erreur && rangA.length === 0 && rangB.length === 0 && (
        <span className="text-destructive">
          Le référentiel UNESS ne contient aucune compétence pour cet item :
          aucune chanson ne peut en être tirée.
        </span>
      )}

      {!chargement && !erreur && (rangA.length > 0 || rangB.length > 0) && (
        <span>{resume}</span>
      )}

      {slug && (
        <Link
          to={cheminItemEdn(slug)}
          className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
        >
          Fiche de l'item
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
};

export default ApercuItemSelectionne;
