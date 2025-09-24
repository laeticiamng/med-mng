import { useEffect, useMemo, useState } from 'react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { useParams } from 'react-router-dom';
import { useEdnItem } from '@/hooks/useEdnItem';
import { TranslatedText } from '@/components/TranslatedText';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { ImmersiveEdnExperience } from '@/components/edn/immersive/ImmersiveEdnExperience';
import { EnhancedLearningExperience } from '@/components/edn/immersive/EnhancedLearningExperience';
import {
  AdvancedInteractionTracker,
  type InteractionData,
} from '@/components/edn/immersive/AdvancedInteractionTracker';
import { AdvancedEdnNavigation } from '@/components/edn/navigation/AdvancedEdnNavigation';
import { useCompetenceAnalyzer } from '@/components/edn/immersive/CompetenceAnalyzer';
import { AdvancedInteractionTracker } from '@/components/edn/immersive/AdvancedInteractionTracker';
import { useCompetenceAnalyzer } from '@/components/edn/immersive/CompetenceAnalyzer';
import { EnhancedTableauDisplay } from '@/components/edn/advanced/EnhancedTableauDisplay';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, BookOpen, Music2, Sparkles, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

type SectionType = 'tableau-a' | 'tableau-b' | 'scene' | 'bd' | 'music' | 'quiz';

type SectionProgressEntry = InteractionData & {
  sectionId: string;
};
interface SummarySection {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  sectionType?: SectionType;
}

const EdnItem = () => {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading } = useEdnItem(slug);
  const [activeSection, setActiveSection] = useState<SectionType>('tableau-a');
  const [sectionProgress, setSectionProgress] = useState<SectionProgressEntry[]>([]);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const meta = useMemo(() => {
    if (!item) {
      return null;
    }

    const ogImageUrl = origin
      ? `${origin}/og/item/${item.item_code}.png`
      : `/og/item/${item.item_code}.png`;
    const title = `${item.item_code} · ${item.title}`;
    const description = item.subtitle ?? "Contenu pédagogique complet de l'item EDN";

    return { ogImageUrl, title, description };
  }, [item, origin]);

  const summarySections = useMemo<SummarySection[]>(
    () => [
      {
        id: 'item-section-rang-a',
        label: 'Rang A',
        description: 'Compétences fondamentales et diagnostics essentiels',
        icon: BookOpen,
        sectionType: 'tableau-a',
      },
      {
        id: 'item-section-rang-b',
        label: 'Rang B',
        description: 'Prise en charge avancée et thérapeutique',
        icon: Target,
        sectionType: 'tableau-b',
      },
      {
        id: 'item-section-oic',
        label: 'Sommaire OIC',
        description: 'Synthèse des compétences clés identifiées',
        icon: Sparkles,
      },
    ],
    []
  );

  const [activeAnchor, setActiveAnchor] = useState<string>(
    summarySections[0]?.id ?? ''
  );
  const summaryNavRef = useRef<HTMLElement | null>(null);
  const siteUrl = ((import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://medmng.app').replace(/\/$/, '');
  const canonicalUrl = slug ? `${siteUrl}/edn-production/${slug}` : `${siteUrl}/edn-production`;

  const baseDescription = item
    ? `Découvrez ${item.item_code} – ${item.title} sur MED-MNG avec tableaux, scènes immersives et quiz pour maîtriser l'EDN.`
    : "Explorez les items EDN MED-MNG : contenus immersifs, tableaux clairs et quiz interactifs pour réviser l'examen.";

  const metaDescription = baseDescription.length > 160
    ? `${baseDescription.slice(0, 157)}...`
    : baseDescription;

  const metaTitle = item
    ? `${item.item_code} – ${item.title} | MED-MNG`
    : 'Item EDN | MED-MNG';

  const defaultOgImage = `${siteUrl}/lovable-uploads/5de8d99e-d7d8-41b8-b318-b4f51265648b.png`;

  const helmet = (
    <Helmet>
      <title>{metaTitle}</title>
      <link rel="canonical" href={canonicalUrl} />
      <meta name="description" content={metaDescription} />
      <meta property="og:type" content="article" />
      <meta property="og:site_name" content="MED-MNG" />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={defaultOgImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={defaultOgImage} />
    </Helmet>
  );

  // Analyser les compétences de l'item

  const { competences, primaryCompetence, totalCount } = useCompetenceAnalyzer({
    itemCode: item?.item_code || '',
    title: item?.title || '',
    tableau_rang_a: item?.tableau_rang_a,
    tableau_rang_b: item?.tableau_rang_b,
    competences_oic_rang_a: item?.competences_oic_rang_a,
    competences_oic_rang_b: item?.competences_oic_rang_b,
  });

  const handleSectionChange = useCallback((section: SectionType) => {
    setActiveSection(section);

    if (section === 'tableau-a') {
      setActiveAnchor('item-section-rang-a');
    } else if (section === 'tableau-b') {
      setActiveAnchor('item-section-rang-b');
    }
  }, []);

  const handleProgressUpdate = (sectionId: string, data: InteractionData) => {
    setSectionProgress(prev => {
      const existingIndex = prev.findIndex(progress => progress.sectionId === sectionId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...data };
        return updated;
      } else {
        return [...prev, { sectionId, ...data }];
      }
    });
  };

  const navigateToSection = useCallback(
    (section: SummarySection) => {
      const element = document.getElementById(section.id);
      if (!element) {
        return;
      }

      if (section.sectionType) {
        handleSectionChange(section.sectionType);
      }

      setActiveAnchor(section.id);

      element.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if ('focus' in element && typeof (element as HTMLElement).focus === 'function') {
        (element as HTMLElement).focus({ preventScroll: true });
      }
    },
    [handleSectionChange]
  );

  const handleAnchorClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, section: SummarySection) => {
      event.preventDefault();
      navigateToSection(section);
    },
    [navigateToSection]
  );

  const handleAnchorKeyDown = useCallback(
    (event: KeyboardEvent<HTMLAnchorElement>, section: SummarySection) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        navigateToSection(section);
      }
    },
    [navigateToSection]
  );

  const handleBackToTop = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setTimeout(() => {
      summaryNavRef.current?.focus({ preventScroll: true });
    }, 300);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );

        if (visible.length === 0) {
          return;
        }

        const newActiveId = visible[0].target.id;

        if (!summarySections.some(section => section.id === newActiveId)) {
          return;
        }

        setActiveAnchor(prev => (prev === newActiveId ? prev : newActiveId));

        const matchedSection = summarySections.find(
          section => section.id === newActiveId
        );

        if (matchedSection?.sectionType) {
          setActiveSection(prev =>
            prev === matchedSection.sectionType
              ? prev
              : matchedSection.sectionType
          );
        }
      },
      {
        rootMargin: '-45% 0px -45% 0px',
        threshold: [0.2, 0.4, 0.6],
      }
    );

    const elements: HTMLElement[] = [];

    summarySections.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
        elements.push(element);
      }
    });

    return () => {
      elements.forEach(element => observer.unobserve(element));
      observer.disconnect();
    };
  }, [item?.id, summarySections]);

  useEffect(() => {
    if (summarySections[0]) {
      setActiveAnchor(summarySections[0].id);
    }
  }, [slug, summarySections]);

  const trackerSectionId = useMemo(
    () => activeAnchor || activeSection,
    [activeAnchor, activeSection]
  );

  const getCompetenceCount = (value: unknown) => {
    if (Array.isArray(value)) {
      return value.length;
    }

    if (value && typeof value === 'object') {
      return Object.keys(value as Record<string, unknown>).length;
    }

    return 0;
  };

  const oicRangACount = getCompetenceCount(item?.competences_oic_rang_a);
  const oicRangBCount = getCompetenceCount(item?.competences_oic_rang_b);
  const totalOicCount = oicRangACount + oicRangBCount;

  if (loading) {
    return (
      <ConsistentBackground variant="secondary">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center relative z-10">
            <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-3xl font-bold text-foreground mb-3">
              <TranslatedText text="Chargement de l'item EDN" />
            </h2>
            <p className="text-muted-foreground text-lg">
              <TranslatedText text="Préparation du contenu pédagogique complet..." />
            </p>
          </div>
        </ConsistentBackground>
      </>
    );
  }

  if (!item) {
    return (
      <>
        {helmet}
        <ConsistentBackground variant="secondary">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center relative z-10">
              <h1 className="text-3xl font-bold text-foreground mb-6">
                <TranslatedText text="Item EDN non trouvé" />
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                <TranslatedText text="L'item demandé n'existe pas ou n'est pas disponible." />
              </p>
            </div>
          </div>
        </ConsistentBackground>
      </>
    );
  }

  return (
      <ConsistentBackground variant="secondary">
      <div className="min-h-screen">
        {meta && (
          <Helmet>
            <title>{`${meta.title} | Med MNG`}</title>
            <meta name="description" content={meta.description} />
            <meta property="og:title" content={meta.title} />
            <meta property="og:description" content={meta.description} />
            <meta property="og:image" content={meta.ogImageUrl} />
            <meta property="og:type" content="article" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={meta.title} />
            <meta name="twitter:description" content={meta.description} />
            <meta name="twitter:image" content={meta.ogImageUrl} />
          </Helmet>
        )}
        <EnhancedLearningExperience
          itemCode={item.item_code}
          currentSection={activeSection}
          onSectionChange={handleSectionChange}
        >
          <AdvancedInteractionTracker
            sectionId={activeSection}
            onDataUpdate={data => handleProgressUpdate(activeSection, data)}
            sectionId={trackerSectionId}
            onDataUpdate={(data) => handleProgressUpdate(trackerSectionId, data)}
          >
            <ImmersiveEdnExperience
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              item={item}
            >
              <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Navigation latérale */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-8">
                      <AdvancedEdnNavigation
                        activeSection={activeSection}
                        onSectionChange={handleSectionChange}
                        competences={competences}
                        itemTitle={item.title}
                        progress={sectionProgress}
                      />
                    </div>
                  </div>

                  {/* Contenu principal */}
                  <div className="lg:col-span-3">
                    <EdnItemContent activeSection={activeSection} item={item} />
                  <aside className="lg:col-span-1">
                    <nav
                      ref={summaryNavRef}
                      aria-label="Sommaire de l'item"
                      className="sticky top-32 space-y-4"
                      tabIndex={-1}
                    >
                      <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            <Sparkles className="h-4 w-4" aria-hidden="true" />
                            Sommaire
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <ul className="space-y-2" role="list">
                            {summarySections.map(section => {
                              const isActive = activeAnchor === section.id;
                              const Icon = section.icon;
                              const progress = sectionProgress.find(
                                entry => entry.sectionId === section.id
                              );

                              return (
                                <li key={section.id}>
                                  <a
                                    href={`#${section.id}`}
                                    onClick={event => handleAnchorClick(event, section)}
                                    onKeyDown={event => handleAnchorKeyDown(event, section)}
                                    className={`flex items-start gap-3 rounded-lg border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                                      isActive
                                        ? 'border-primary bg-primary/10 shadow-sm'
                                        : 'border-border hover:border-primary/40 hover:bg-muted/60'
                                    }`}
                                    aria-current={isActive ? 'location' : undefined}
                                  >
                                    <Icon
                                      className={`mt-1 h-4 w-4 ${
                                        isActive
                                          ? 'text-primary'
                                          : 'text-muted-foreground'
                                      }`}
                                      aria-hidden="true"
                                    />
                                    <div className="flex-1 space-y-1">
                                      <p className="text-sm font-medium text-foreground">
                                        {section.label}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {section.description}
                                      </p>
                                    </div>
                                    {progress?.timeSpent && (
                                      <span className="text-[11px] text-muted-foreground" aria-label={`Temps passé ${Math.round(progress.timeSpent)} secondes`}>
                                        {Math.round(progress.timeSpent)}s
                                      </span>
                                    )}
                                    {isActive && (
                                      <span className="sr-only">(section actuelle)</span>
                                    )}
                                  </a>
                                </li>
                              );
                            })}
                          </ul>

                          <div className="space-y-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full justify-start gap-2 text-left cursor-not-allowed opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                              aria-disabled="true"
                              title="Fonctionnalité Karaoké à venir"
                              onClick={event => event.preventDefault()}
                              onKeyDown={event => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                }
                              }}
                            >
                              <Music2 className="h-4 w-4" aria-hidden="true" />
                              Karaoké / Lyrics A/B
                              <span className="ml-auto text-xs text-muted-foreground">
                                Bientôt
                              </span>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full justify-start gap-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                              onClick={handleBackToTop}
                              aria-label="Revenir en haut de la page"
                            >
                              <ArrowUp className="h-4 w-4" aria-hidden="true" />
                              Retour en haut
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </nav>
                  </aside>

                  <div className="lg:col-span-3 space-y-12">
                    <section
                      id="item-section-rang-a"
                      tabIndex={-1}
                      aria-labelledby="item-section-rang-a-title"
                      className="scroll-mt-40 focus:outline-none"
                    >
                      <div className="mb-6 space-y-2">
                        <h2
                          id="item-section-rang-a-title"
                          className="text-2xl font-semibold text-foreground"
                        >
                          Rang A – compétences fondamentales
                        </h2>
                        <p className="text-muted-foreground">
                          Diagnostic, sémiologie et bases indispensables pour l'item {item.item_code}.
                        </p>
                      </div>
                      <EnhancedTableauDisplay item={item} rang="A" />
                    </section>

                    <section
                      id="item-section-rang-b"
                      tabIndex={-1}
                      aria-labelledby="item-section-rang-b-title"
                      className="scroll-mt-40 focus:outline-none"
                    >
                      <div className="mb-6 space-y-2">
                        <h2
                          id="item-section-rang-b-title"
                          className="text-2xl font-semibold text-foreground"
                        >
                          Rang B – prise en charge avancée
                        </h2>
                        <p className="text-muted-foreground">
                          Stratégies thérapeutiques, suivi et approfondissements pour maîtriser l'item.
                        </p>
                      </div>
                      <EnhancedTableauDisplay item={item} rang="B" />
                    </section>

                    <section
                      id="item-section-oic"
                      tabIndex={-1}
                      aria-labelledby="item-section-oic-title"
                      className="scroll-mt-40 focus:outline-none"
                    >
                      <div className="mb-6 space-y-2">
                        <h2
                          id="item-section-oic-title"
                          className="text-2xl font-semibold text-foreground"
                        >
                          Sommaire des compétences OIC
                        </h2>
                        <p className="text-muted-foreground">
                          Vision d'ensemble des objectifs issus de la base OIC pour {item.item_code}.
                        </p>
                      </div>

                      <Card className="border-l-4 border-l-primary">
                        <CardHeader>
                          <CardTitle className="flex flex-wrap items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
                            Focus compétences prioritaires
                            {primaryCompetence && (
                              <Badge variant="secondary" className="text-xs">
                                {primaryCompetence}
                              </Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {totalCount > 0
                              ? `${totalCount} axes d'apprentissage identifiés pour guider votre révision.`
                              : "Analyse en cours – les compétences seront affichées dès qu'elles seront disponibles."}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                              <p className="text-xs font-semibold uppercase text-primary">
                                Rang A
                              </p>
                              <p className="mt-2 text-2xl font-bold text-foreground">
                                {oicRangACount}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Compétences officielles identifiées
                              </p>
                            </div>
                            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                              <p className="text-xs font-semibold uppercase text-primary">
                                Rang B
                              </p>
                              <p className="mt-2 text-2xl font-bold text-foreground">
                                {oicRangBCount}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Axes thérapeutiques et approfondissements
                              </p>
                            </div>
                            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                              <p className="text-xs font-semibold uppercase text-primary">
                                Total OIC
                              </p>
                              <p className="mt-2 text-2xl font-bold text-foreground">
                                {totalOicCount}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Objectifs consolidés A & B
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-foreground">
                              Compétences mises en avant
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {competences.length > 0 ? (
                                competences.map(competence => (
                                  <Badge
                                    key={competence}
                                    variant="outline"
                                    className="bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                  >
                                    {competence}
                                  </Badge>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  Aucune compétence prioritaire n'a encore été identifiée pour cet item.
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 text-sm text-primary">
                            Utilisez les ancres ci-dessus pour naviguer rapidement entre les rangs A et B, puis revenez ici pour vérifier la cohérence globale des compétences OIC.
                          </div>
                        </CardContent>
                      </Card>
                    </section>
                  </div>
                </div>
              </div>
            </ImmersiveEdnExperience>
          </AdvancedInteractionTracker>
        </EnhancedLearningExperience>
      </div>
      </ConsistentBackground>
    </>
  );
};

export default EdnItem;
