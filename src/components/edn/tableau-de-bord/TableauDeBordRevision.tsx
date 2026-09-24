import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FORMULES_PREMIUM, NOMBRE_ITEMS_GRATUITS, NOMBRE_ITEMS_TOTAL, NOM_OFFRE_PREMIUM } from '@/config/offre';
import { ROUTE_PATHS } from '@/config/routes';
import type { MotifRecommandation, Recommandation } from '@/lib/recommandation';
import { AlertTriangle, ArrowRight, CalendarClock, Gift, History, Info, ListOrdered, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const ICONE_MOTIF: Record<MotifRecommandation, typeof CalendarClock> = {
  revision_echue: CalendarClock,
  item_en_cours: History,
  item_essai: Gift,
  prochain_item: ListOrdered,
};

export interface Indicateur {
  libelle: string;
  valeur: string;
}

interface TableauDeBordProps {
  chargement: boolean;
  erreur: string | null;
  onRecharger: () => void;
  recommandation: (Recommandation & { numero: number; titre: string }) | null;
  /** Aucune activité enregistrée (ni répétition espacée, ni quiz). */
  aucuneActivite: boolean;
  indicateurs: Indicateur[];
  onContinuer: () => void;
}

/** Carte « Continuer ma révision » + indicateurs réels, pour un compte connecté. */
export function TableauDeBordRevision({
  chargement,
  erreur,
  onRecharger,
  recommandation,
  aucuneActivite,
  indicateurs,
  onContinuer,
}: TableauDeBordProps) {
  if (chargement) {
    return (
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_16rem]" aria-busy="true" aria-live="polite">
        <span className="sr-only">Chargement de votre progression…</span>
        <div className="h-36 animate-pulse rounded-lg border bg-muted/50" />
        <div className="hidden h-36 animate-pulse rounded-lg border bg-muted/50 md:block" />
      </div>
    );
  }

  if (erreur) {
    return (
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
        <p className="flex-1 text-sm">{erreur} Les items restent accessibles ci-dessous.</p>
        <Button type="button" variant="outline" size="sm" onClick={onRecharger}>
          Réessayer
        </Button>
      </Card>
    );
  }

  const Icone = recommandation ? ICONE_MOTIF[recommandation.motif] : Info;

  return (
    <section aria-labelledby="titre-continuer" className="grid gap-3 md:grid-cols-[minmax(0,1fr)_16rem]">
      <Card className="relative overflow-hidden border-primary/30 p-4 sm:p-5">
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-accent to-primary" aria-hidden="true" />
        <h2 id="titre-continuer" className="text-xs font-semibold uppercase tracking-wide text-primary">
          {aucuneActivite ? 'Commencer ma révision' : 'Continuer ma révision'}
        </h2>
        {recommandation ? (
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="line-clamp-2 text-base font-semibold leading-snug text-foreground sm:text-lg" title={recommandation.titre}>
                {recommandation.numero}. {recommandation.titre}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Icone className="h-4 w-4 shrink-0" aria-hidden="true" />
                {recommandation.raison}
              </p>
            </div>
            <Button type="button" onClick={onContinuer} className="shrink-0 sm:min-w-[12rem]">
              {aucuneActivite ? 'Commencer' : 'Continuer ma session'}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Tous les items que vous avez travaillés sont maîtrisés et aucune révision n'est prévue aujourd'hui.
          </p>
        )}
      </Card>

      <Card className="p-4">
        <h2 className="sr-only">Vos indicateurs</h2>
        {indicateurs.length === 0 ? (
          <div className="flex h-full flex-col justify-center gap-1">
            <p className="text-sm font-medium text-foreground">Pas encore de révision</p>
            <p className="text-xs text-muted-foreground">
              Vos révisions et quiz terminés apparaîtront ici.
            </p>
          </div>
        ) : (
          <dl className="grid grid-cols-3 gap-2 md:grid-cols-1 md:gap-2.5">
            {indicateurs.map((i) => (
              <div key={i.libelle} className="flex flex-col md:flex-row md:items-baseline md:justify-between md:gap-2">
                <dt className="order-2 text-xs text-muted-foreground md:order-1">{i.libelle}</dt>
                <dd className="order-1 text-lg font-semibold tabular-nums text-foreground md:order-2 md:text-base">{i.valeur}</dd>
              </div>
            ))}
          </dl>
        )}
      </Card>
    </section>
  );
}

/** Bandeau court pour un visiteur non connecté. */
export function BandeauVisiteur({ onCommencer }: { onCommencer: () => void }) {
  return (
    <section aria-labelledby="titre-visiteur">
      <Card className="relative flex flex-col gap-3 overflow-hidden p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-accent to-primary" aria-hidden="true" />
        <div>
          <h2 id="titre-visiteur" className="text-base font-semibold text-foreground">
            Commencez par l'item 1 — gratuit
          </h2>
          <p className="text-sm text-muted-foreground">
            Fiche officielle et contenu complet (paroles, récit, planches, quiz), sans compte.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" onClick={onCommencer}>
            Commencer l'item 1
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
          <Button asChild variant="outline" className="h-auto whitespace-normal py-2 text-center">
            <Link to={ROUTE_PATHS.medMngSignup}>
              <UserPlus className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
              Créer un compte pour suivre votre progression
            </Link>
          </Button>
        </div>
      </Card>
    </section>
  );
}

/** « Ce qui est inclus », réduit à une ligne repliable (non affiché pour un abonné Premium). */
export function LigneOffre() {
  const annuel = FORMULES_PREMIUM.annuel;
  return (
    <div className="flex items-start gap-2 rounded-md border border-dashed px-3 py-1.5 text-xs text-muted-foreground">
      <Info className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <details className="group min-w-0 flex-1">
        <summary className="cursor-pointer list-none rounded-sm py-0.5 leading-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
          Fiches officielles gratuites · {NOMBRE_ITEMS_GRATUITS} items complets gratuits · Premium {annuel.prixAffiche}
          <span className="ml-1 underline underline-offset-2 group-open:hidden">Détails</span>
          <span className="ml-1 hidden underline underline-offset-2 group-open:inline">Masquer</span>
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-4 [&>li]:text-xs [&>li]:leading-normal">
          <li>Fiches officielles des {NOMBRE_ITEMS_TOTAL} items (compétences rang A et rang B) : gratuites.</li>
          <li>Paroles, récit, planches et quiz des items IC-1 à IC-{NOMBRE_ITEMS_GRATUITS} : gratuits.</li>
          <li>
            {NOM_OFFRE_PREMIUM} ({annuel.prixAffiche} ou {FORMULES_PREMIUM.mensuel.prixAffiche}) : contenu immersif des{' '}
            {NOMBRE_ITEMS_TOTAL} items et génération audio.
          </li>
        </ul>
      </details>
      <Link
        to={ROUTE_PATHS.medMngPricing}
        className="min-h-0 min-w-0 shrink-0 rounded-sm py-0.5 font-medium leading-normal text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Tarifs
      </Link>
    </div>
  );
}
