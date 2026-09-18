import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Brain, Loader2, Music, ExternalLink, AlertTriangle } from 'lucide-react';
import { useOicCompetences } from '@/hooks/useOicCompetences';
import { cheminItemEdn } from '@/pages/edn-item/ednItemTabs';
import { parolesSontRedigees } from '@/components/edn/music/utils/parolesFormatter';

/**
 * Ce que le générateur autonome affiche quand un item est choisi.
 *
 * Avant, il affichait « ✅ Paroles chargées automatiquement » — une affirmation
 * que rien ne vérifiait, alors que 345 items sur 367 n'ont en base qu'une suite
 * de mots-clés sans verbe ni ponctuation. La page annonçait donc des paroles
 * prêtes pour des items qui n'en avaient pas.
 *
 * Ici, on montre ce qui existe vraiment : les compétences officielles du
 * référentiel UNESS pour chaque rang, et l'état réel des paroles. Les mêmes
 * informations que sur la fiche de l'item, lues de la même façon.
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

const Pastille: React.FC<{ pret: boolean; label: string }> = ({ pret, label }) => (
  <span
    className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] ${
      pret ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-muted text-muted-foreground'
    }`}
  >
    <Music className="h-3 w-3" aria-hidden="true" />
    {label} {pret ? 'prêtes' : 'à générer'}
  </span>
);

export const ApercuItemSelectionne: React.FC<Props> = ({
  itemCode, titre, slug, parolesRangA, parolesRangB, parolesRangAB,
}) => {
  const { competences: rangA, loading: chargeA, error: erreurA } = useOicCompetences(itemCode, 'A');
  const { competences: rangB, loading: chargeB, error: erreurB } = useOicCompetences(itemCode, 'B');

  const chargement = chargeA || chargeB;
  const erreur = erreurA || erreurB;

  const redigees = (p?: string[] | null) => Array.isArray(p) && p.length > 0 && parolesSontRedigees(p);

  return (
    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg animate-fade-in space-y-2">
      <div className="flex items-start gap-2">
        <Badge className="bg-primary text-primary-foreground text-xs shrink-0">{itemCode}</Badge>
        <span className="text-sm font-medium text-foreground leading-snug">{titre}</span>
      </div>

      {chargement && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          Lecture des compétences officielles…
        </p>
      )}

      {erreur && !chargement && (
        <p className="flex items-start gap-2 text-xs text-destructive">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden="true" />
          Compétences illisibles pour cet item : {erreur}
        </p>
      )}

      {!chargement && !erreur && (
        <>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              Rang A : <strong className="text-foreground">{rangA.length}</strong> compétence{rangA.length > 1 ? 's' : ''}
            </span>
            <span className="inline-flex items-center gap-1">
              <Brain className="h-3.5 w-3.5" aria-hidden="true" />
              Rang B : <strong className="text-foreground">{rangB.length}</strong> compétence{rangB.length > 1 ? 's' : ''}
            </span>
          </div>

          {rangA.length === 0 && rangB.length === 0 && (
            <p className="text-xs text-destructive">
              Le référentiel UNESS ne contient aucune compétence pour cet item : aucune chanson ne peut en être tirée.
            </p>
          )}

          {(rangA.length > 0 || rangB.length > 0) && (
            <p className="text-xs text-muted-foreground">
              Première compétence : «&nbsp;{(rangA[0] ?? rangB[0])?.intitule}&nbsp;»
            </p>
          )}

          <div className="flex flex-wrap items-center gap-1.5">
            <Pastille pret={redigees(parolesRangA)} label="Rang A" />
            <Pastille pret={redigees(parolesRangB)} label="Rang B" />
            <Pastille pret={redigees(parolesRangAB)} label="A+B" />
          </div>

          <p className="text-xs text-muted-foreground">
            Les paroles « à générer » sont écrites à la demande à partir des compétences ci-dessus,
            par la même chaîne que depuis la fiche de l'item.
          </p>
        </>
      )}

      {slug && (
        <Link
          to={cheminItemEdn(slug)}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Ouvrir la fiche complète de l'item
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
};

export default ApercuItemSelectionne;
