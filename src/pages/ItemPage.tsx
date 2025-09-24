import { useMemo, type FC, type ReactNode } from 'react';
import * as HelmetAsync from 'react-helmet-async';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ItemData,
  buildItemStructuredData,
  getAllItemIds,
  getItemById,
} from '../data/ednItemStaticData.ts';

const BASE_URL = 'https://med-mng.com';

const resolveHelmetExport = () => {
  const module = HelmetAsync as {
    Helmet?: typeof import('react-helmet-async').Helmet;
    default?: { Helmet?: typeof import('react-helmet-async').Helmet };
  };
  return module.Helmet ?? module.default?.Helmet;
};

const Helmet = resolveHelmetExport() ?? (({ children }: { children?: ReactNode }) => <>{children}</>);

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

interface ItemPageViewProps {
  item: ItemData;
  showNavigation?: boolean;
}

const Section: FC<{ title: string; subtitle?: string; children: ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <section className="rounded-3xl border border-border/60 bg-background/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur">
    <header className="mb-4">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </header>
    <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
      {children}
    </div>
  </section>
);

const StatCard: FC<{ label: string; value: string; accent?: string }> = ({
  label,
  value,
  accent = 'bg-primary/15 text-primary',
}) => (
  <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background/70 p-4">
    <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
      {label}
    </span>
    <span className={`text-lg font-semibold ${accent}`}>{value}</span>
  </div>
);

const BulletList: FC<{ items: string[] }> = ({ items }) => (
  <ul className="space-y-3">
    {items.map((entry, index) => (
      <li key={index} className="flex gap-3">
        <span className="mt-1 inline-flex h-2.5 w-2.5 flex-none rounded-full bg-primary/70" aria-hidden="true" />
        <span className="text-foreground/90">{entry}</span>
      </li>
    ))}
  </ul>
);

export const ItemPageView: FC<ItemPageViewProps> = ({ item, showNavigation = true }) => {
  const canonical = `${BASE_URL}/item/${item.id}`;
  const metaTitle = `${item.code} · ${item.specialty} – ${item.theme.replace(/^(\w)/, (c) => c.toUpperCase())}`;
  const metaDescription = `${item.summary.slice(0, 145)}…`;
  const structuredDataJson = useMemo(() => {
    const json = JSON.stringify(buildItemStructuredData(item));
    return json
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');
  }, [item]);

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        <meta property="og:locale" content="fr_FR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
      </Helmet>
      <Helmet
        script={[
          {
            type: 'application/ld+json',
            innerHTML: structuredDataJson,
          },
        ]}
      />

      <article className="relative min-h-screen bg-gradient-to-b from-background via-background to-muted/20 py-12">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-gradient-to-b from-primary/10 via-background to-transparent" aria-hidden="true" />

        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4">
          <header className="rounded-3xl border border-border/60 bg-background/90 p-8 shadow-[0_40px_100px_rgba(15,23,42,0.18)] backdrop-blur">
            <div className="mb-6 flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Item {item.id}</span>
              <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">{item.specialty}</span>
              <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">Rang A & B</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {item.code} · {item.theme.charAt(0).toUpperCase() + item.theme.slice(1)}
            </h1>
            <p className="mt-4 max-w-3xl text-base text-muted-foreground">
              {item.summary}
            </p>

            <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Spécialité" value={item.specialty} />
              <StatCard label="Difficulté" value={item.difficulty} accent="bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300" />
              <StatCard label="Temps d'étude" value={`${item.estimatedStudyTimeMinutes} min`} accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" />
              <StatCard label="Mise à jour" value={formatDate(item.lastUpdated)} accent="bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300" />
            </dl>
          </header>

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-3">
              <Section title="Objectifs pédagogiques" subtitle="Compétences attendues pour la validation EDN">
                <BulletList items={item.objectives} />
              </Section>

              <Section title="Compétences Rang A" subtitle="Savoirs fondamentaux à maîtriser">
                <BulletList items={item.rankACompetences} />
              </Section>

              <Section title="Compétences Rang B" subtitle="Prise en charge experte et approfondissements">
                <BulletList items={item.rankBCompetences} />
              </Section>

              <Section title="Scénario clinique de référence" subtitle="Situation type travaillée dans la plateforme">
                <p>{item.scenario}</p>
                <div className="mt-4 rounded-2xl border border-border/60 bg-muted/50 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground/90">Checklist de mise en œuvre :</p>
                  <BulletList items={item.keySteps} />
                </div>
              </Section>
            </div>

            <aside className="space-y-6 lg:col-span-2">
              <Section title="Indicateurs d'évaluation" subtitle="Volumes de questions et taux de réussite">
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-center">
                    <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">QCM</dt>
                    <dd className="mt-2 text-2xl font-semibold text-foreground">{item.evaluation.qcm}</dd>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-center">
                    <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Dossiers progressifs</dt>
                    <dd className="mt-2 text-2xl font-semibold text-foreground">{item.evaluation.dossiers}</dd>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-center">
                    <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">ECOS</dt>
                    <dd className="mt-2 text-2xl font-semibold text-foreground">{item.evaluation.ecos}</dd>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-center">
                    <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Taux de réussite</dt>
                    <dd className="mt-2 text-2xl font-semibold text-emerald-500">{item.evaluation.successRate}%</dd>
                  </div>
                </dl>
              </Section>

              <Section title="Clinical pearls" subtitle="Points clés à ne pas manquer">
                <BulletList items={item.clinicalPearls} />
              </Section>

              <Section title="Red flags" subtitle="Situations nécessitant une alerte immédiate">
                <BulletList items={item.redFlags} />
              </Section>

              <Section title="Ressources recommandées" subtitle="Supports pour aller plus loin">
                <ul className="space-y-3">
                  {item.recommendedResources.map((resource) => (
                    <li key={resource.url} className="group flex items-start gap-3 rounded-2xl border border-border/60 bg-background/60 p-4 transition hover:border-primary/60 hover:shadow-[0_12px_40px_rgba(59,130,246,0.25)]">
                      <span className="mt-1 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary/10 text-sm font-semibold uppercase text-primary">
                        {resource.type.slice(0, 2)}
                      </span>
                      <div>
                        <p className="font-medium text-foreground/90">{resource.label}</p>
                        <a
                          href={resource.url}
                          className="text-sm text-primary transition group-hover:text-primary/80"
                        >
                          Consulter la ressource →
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Mots-clés pédagogiques" subtitle="Indexation SEO et recherche interne">
                <div className="flex flex-wrap gap-2">
                  {item.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center rounded-full border border-border/60 bg-muted/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </Section>
            </aside>
          </div>

          {showNavigation && (
            <nav className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/60 bg-background/80 p-6 text-sm">
              <ItemNavigation id={item.id} direction="previous" />
              <div className="flex-1" />
              <ItemNavigation id={item.id} direction="next" />
            </nav>
          )}
        </div>
      </article>
    </>
  );
};

type ItemNavigationProps = {
  id: string;
  direction: 'previous' | 'next';
};

const ItemNavigation: FC<ItemNavigationProps> = ({ id, direction }) => {
  const ids = getAllItemIds();
  const currentIndex = ids.indexOf(id);

  const adjacentIndex = direction === 'previous' ? currentIndex - 1 : currentIndex + 1;
  if (adjacentIndex < 0 || adjacentIndex >= ids.length) {
    return <span className="text-muted-foreground/70">{direction === 'previous' ? 'Début de la collection' : 'Fin de la collection'}</span>;
  }

  const targetId = ids[adjacentIndex];
  const adjacentItem = getItemById(targetId);
  if (!adjacentItem) {
    return null;
  }

  const label = direction === 'previous' ? 'Item précédent' : 'Item suivant';

  return (
    <Link
      to={`/item/${targetId}`}
      className="group inline-flex flex-col rounded-2xl border border-border/50 bg-muted/40 px-4 py-3 text-left transition hover:border-primary/40 hover:text-primary"
    >
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span className="mt-1 text-sm font-semibold text-foreground group-hover:text-primary">
        {adjacentItem.code} · {adjacentItem.specialty}
      </span>
    </Link>
  );
};

const ItemNotFound: FC<{ id?: string }> = ({ id }) => (
  <>
    <Helmet>
      <title>Item introuvable – MED‑MNG</title>
      <meta name="robots" content="noindex" />
      <meta name="description" content="L'item demandé n'existe pas ou n'est pas encore publié." />
    </Helmet>
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">Item EDN</p>
        <h1 className="text-3xl font-bold text-foreground">
          {id ? `Item ${id} indisponible` : "Item non trouvé"}
        </h1>
        <p className="text-muted-foreground">
          L'item que vous recherchez n'est pas encore présent dans la collection statique. Vérifiez le code ou revenez à la page d'accueil.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/" className="rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition hover:border-primary/60 hover:text-primary">
            Retour à l'accueil
          </Link>
          <Link to="/edn" className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
            Explorer les items EDN
          </Link>
        </div>
      </div>
    </div>
  </>
);

const ItemPage: FC = () => {
  const params = useParams();
  const id = params.id ?? '';

  const item = useMemo(() => getItemById(id), [id]);

  if (!id) {
    return <Navigate to="/edn" replace />;
  }

  if (!item) {
    return <ItemNotFound id={id} />;
  }

  return <ItemPageView item={item} />;
};

export default ItemPage;

