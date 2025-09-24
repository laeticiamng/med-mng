/**
 * 🚀 COMPOSANT ITEM EDN PRODUCTION
 * Affichage optimisé d'un item EDN individuel
 * ✅ Performance maximale
 * ✅ Intégration complète des APIs
 * ✅ Expérience utilisateur premium
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Share2,
  Heart,
  BookOpen,
  Music,
  Brain,
  Zap,
  CheckCircle,
  Users,
  Clock,
  Calendar,
  List,
  ArrowUp,
  Mic,
  Target
} from 'lucide-react';

// Import des composants avancés optimisés
import { AdvancedSceneImmersive } from '../advanced/AdvancedSceneImmersive';
import { AdvancedGenerationMusicale } from '../advanced/AdvancedGenerationMusicale';
import { AdvancedBandeDessinee } from '../advanced/AdvancedBandeDessinee';
import { AdvancedQuizInteractif } from '../advanced/AdvancedQuizInteractif';
import { EnhancedTableauDisplay } from '../advanced/EnhancedTableauDisplay';

interface ProductionEdnItemData {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  paroles_musicales?: string[];
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  scene_immersive?: any;
  quiz_questions?: any;
  competences_oic_rang_a?: any[];
  competences_oic_rang_b?: any[];
  completeness_score: number;
  is_validated: boolean;
  specialite?: string;
  created_at: string;
  updated_at: string;
  payload_v2?: any;
}

type SectionType = 'tableau-a' | 'tableau-b' | 'scene' | 'bd' | 'music' | 'quiz';
type ExperienceSection = 'scene' | 'bd' | 'music' | 'quiz';
type SummarySection = 'tableau-a' | 'tableau-b' | 'oic';

const ProductionEdnItem: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [item, setItem] = useState<ProductionEdnItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeExperience, setActiveExperience] = useState<ExperienceSection>('scene');
  const [sectionProgress, setSectionProgress] = useState<Record<SectionType, number>>({
    'tableau-a': 0,
    'tableau-b': 0,
    'scene': 0,
    'bd': 0,
    'music': 0,
    'quiz': 0
  });
  const [activeSummarySection, setActiveSummarySection] = useState<SummarySection>('tableau-a');

  const topRef = useRef<HTMLDivElement | null>(null);
  const tableauARef = useRef<HTMLElement | null>(null);
  const tableauBRef = useRef<HTMLElement | null>(null);
  const oicRef = useRef<HTMLElement | null>(null);
  const summarySectionOrder = useMemo<SummarySection[]>(() => ['tableau-a', 'tableau-b', 'oic'], []);
  const sectionRefs = useMemo<Record<SummarySection, React.RefObject<HTMLElement>>>(
    () => ({
      'tableau-a': tableauARef,
      'tableau-b': tableauBRef,
      oic: oicRef
    }),
    [tableauARef, tableauBRef, oicRef]
  );

  // Chargement de l'item
  useEffect(() => {
    const fetchItem = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('edn_items_complete')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setError('Item EDN non trouvé');
          return;
        }

        const itemData: ProductionEdnItemData = {
          ...data,
          competences_oic_rang_a: Array.isArray(data.competences_oic_rang_a) ? data.competences_oic_rang_a : [],
          competences_oic_rang_b: Array.isArray(data.competences_oic_rang_b) ? data.competences_oic_rang_b : [],
          completeness_score: data.completeness_score || 0,
          is_validated: data.is_validated || false
        };

        setItem(itemData);

        toast({
          title: "✅ Item EDN chargé",
          description: `${itemData.item_code} - ${itemData.title}`,
          variant: "default"
        });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement';
        setError(errorMessage);
        toast({
          title: "❌ Erreur de chargement",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [slug, toast]);

  const oicRangA = useMemo(() => (
    Array.isArray(item?.competences_oic_rang_a) ? item.competences_oic_rang_a : []
  ), [item?.competences_oic_rang_a]);

  const oicRangB = useMemo(() => (
    Array.isArray(item?.competences_oic_rang_b) ? item.competences_oic_rang_b : []
  ), [item?.competences_oic_rang_b]);

  const totalOic = oicRangA.length + oicRangB.length;

  const summarySections = useMemo(() => ([
    {
      id: 'tableau-a' as SummarySection,
      label: 'Tableau Rang A',
      description: `${oicRangA.length} compétence${oicRangA.length > 1 ? 's' : ''} OIC`,
      indicator: 'A'
    },
    {
      id: 'tableau-b' as SummarySection,
      label: 'Tableau Rang B',
      description: `${oicRangB.length} compétence${oicRangB.length > 1 ? 's' : ''} OIC`,
      indicator: 'B'
    },
    {
      id: 'oic' as SummarySection,
      label: 'Synthèse OIC',
      description: `${totalOic} compétence${totalOic > 1 ? 's' : ''} intégrée${totalOic > 1 ? 's' : ''}`,
      indicator: '🎯'
    }
  ]), [oicRangA.length, oicRangB.length, totalOic]);

  const topCompetencesA = useMemo(() => oicRangA.slice(0, 3), [oicRangA]);
  const topCompetencesB = useMemo(() => oicRangB.slice(0, 3), [oicRangB]);

  const formatCompetenceLabel = useCallback((competence: any) => {
    if (!competence || typeof competence !== 'object') {
      return 'Compétence OIC';
    }

    const objectif = typeof competence.objectif_id === 'string' ? competence.objectif_id : undefined;
    const intitule = typeof competence.intitule === 'string' ? competence.intitule : undefined;

    if (objectif && intitule) {
      return `${objectif} · ${intitule}`;
    }

    return objectif || intitule || 'Compétence OIC';
  }, []);

  const getCompetenceDescription = useCallback((competence: any) => {
    if (!competence || typeof competence !== 'object') {
      return 'Description en cours de synchronisation.';
    }

    const description = typeof competence.description === 'string' ? competence.description : '';

    if (!description) {
      return 'Description en cours de synchronisation.';
    }

    return description.length > 140 ? `${description.slice(0, 140)}…` : description;
  }, []);

  const scrollToSection = useCallback((section: SummarySection) => {
    const target = sectionRefs[section]?.current;
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSummarySection(section);

    requestAnimationFrame(() => {
      target.focus({ preventScroll: true });
    });
  }, [sectionRefs]);

  const handleSummaryClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>, section: SummarySection) => {
    event.preventDefault();
    scrollToSection(section);
  }, [scrollToSection]);

  const handleBackToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveSummarySection('tableau-a');

    requestAnimationFrame(() => {
      topRef.current?.focus({ preventScroll: true });
    });
  }, []);

  useEffect(() => {
    if (!item) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target?.id) {
        const sectionId = visible.target.id.replace('item-section-', '') as SummarySection;
        if (summarySectionOrder.includes(sectionId)) {
          setActiveSummarySection(sectionId);
        }
      }
    }, {
      threshold: [0.2, 0.4, 0.6],
      rootMargin: '-30% 0px -45% 0px'
    });

    summarySectionOrder.forEach((sectionId) => {
      const element = sectionRefs[sectionId]?.current;
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [item, sectionRefs, summarySectionOrder]);

  // Gestion du progrès des sections
  const handleSectionProgress = useCallback((section: SectionType, progress: number) => {
    setSectionProgress(prev => ({
      ...prev,
      [section]: progress
    }));
  }, []);

  // Calcul du progrès global
  const getOverallProgress = () => {
    const sections: SectionType[] = ['tableau-a', 'tableau-b', 'scene', 'bd', 'music', 'quiz'];
    const totalProgress = sections.reduce((sum, section) => sum + sectionProgress[section], 0);
    return Math.round(totalProgress / sections.length);
  };

  // Génération musicale
  const handleGenerateMusic = async () => {
    if (!item?.paroles_musicales?.length) {
      toast({
        title: "❌ Impossible de générer",
        description: "Aucunes paroles disponibles",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('suno-music-optimized', {
        body: {
          lyrics: item.paroles_musicales.join('\n'),
          title: `${item.item_code} - ${item.title}`,
          style: 'medical educational ambient',
          duration: 120,
          fastMode: true,
          optimized: true
        }
      });

      if (error) throw error;

      if (data?.audioUrl) {
        toast({
          title: "🎵 Musique générée",
          description: "Audio disponible",
          variant: "default"
        });
      }
    } catch (err) {
      toast({
        title: "❌ Erreur génération",
        description: "Impossible de générer la musique",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-2xl font-semibold text-foreground">Chargement de l'item EDN</h2>
          <p className="text-muted-foreground">Connexion aux données de production...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">❌ Erreur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error || 'Item EDN non trouvé'}</p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/edn-production')} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la liste EDN
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                Recharger la page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header de l'item */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link to="/edn-production">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  EDN Production
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{item.title}</h1>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="font-mono">
                      {item.item_code}
                    </Badge>
                    {item.is_validated && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        ✅ Validé
                      </Badge>
                    )}
                    {item.specialite && (
                      <Badge variant="secondary">
                        {item.specialite}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`text-lg font-bold ${item.completeness_score >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
                  {item.completeness_score}%
                </div>
                <div className="text-sm text-muted-foreground">Complétude</div>
              </div>
              <Progress value={item.completeness_score} className="w-24 h-2" />
            </div>
          </div>

          {/* Sous-titre et méta-informations */}
          {item.subtitle && (
            <p className="text-muted-foreground text-lg mb-4">{item.subtitle}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Mis à jour {new Date(item.updated_at).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>Étudiants EDN</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {item.paroles_musicales?.length && (
                <Button size="sm" onClick={handleGenerateMusic}>
                  <Music className="h-4 w-4 mr-2" />
                  Générer Musique
                </Button>
              )}
              <Button size="sm" variant="outline">
                <Heart className="h-4 w-4 mr-2" />
                Favoris
              </Button>
              <Button size="sm" variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal avec navigation résumée */}
      <div className="container mx-auto px-4 py-8">
        <div
          id="item-top"
          ref={topRef}
          tabIndex={-1}
          className="outline-none"
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-4 lg:sticky lg:top-32" aria-label="Sommaire de l'item EDN">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <List className="h-4 w-4 text-primary" />
                  Sommaire
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <nav aria-label="Navigation interne des sections">
                  <ul className="space-y-2">
                    {summarySections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#item-section-${section.id}`}
                          onClick={(event) => handleSummaryClick(event, section.id)}
                          className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                            activeSummarySection === section.id
                              ? 'border-primary bg-primary/10 text-primary shadow-sm'
                              : 'border-border hover:bg-muted/60'
                          }`}
                          aria-current={activeSummarySection === section.id ? 'true' : undefined}
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                            {section.indicator}
                          </span>
                          <span className="flex-1 text-left">
                            <span className="block font-medium">{section.label}</span>
                            <span className="block text-xs text-muted-foreground">{section.description}</span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={handleBackToTop}
                >
                  <ArrowUp className="h-4 w-4" />
                  Retour en haut
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-center gap-2"
                  disabled
                  aria-disabled="true"
                >
                  <Mic className="h-4 w-4" />
                  Karaoké / Lyrics A/B (bientôt)
                </Button>
              </CardContent>
            </Card>
          </aside>

          <div className="space-y-12">
            <section
              id="item-section-tableau-a"
              ref={sectionRefs['tableau-a']}
              tabIndex={-1}
              aria-labelledby="item-section-tableau-a-title"
              className="scroll-mt-32 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 id="item-section-tableau-a-title" className="flex items-center gap-2 text-2xl font-semibold">
                    <span role="img" aria-hidden="true">📊</span>
                    Tableau Rang A
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Fondamentaux de l'item — {oicRangA.length} compétence{oicRangA.length > 1 ? 's' : ''} OIC synchronisée{oicRangA.length > 1 ? 's' : ''}.
                  </p>
                </div>
                <Badge variant="secondary" className="w-fit">Rang A</Badge>
              </div>
              <EnhancedTableauDisplay
                item={item}
                rang="A"
                onProgress={(progress) => handleSectionProgress('tableau-a', progress)}
              />
            </section>

            <section
              id="item-section-tableau-b"
              ref={sectionRefs['tableau-b']}
              tabIndex={-1}
              aria-labelledby="item-section-tableau-b-title"
              className="scroll-mt-32 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 id="item-section-tableau-b-title" className="flex items-center gap-2 text-2xl font-semibold">
                    <span role="img" aria-hidden="true">📈</span>
                    Tableau Rang B
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Approfondissements et expertise — {oicRangB.length} compétence{oicRangB.length > 1 ? 's' : ''} OIC synchronisée{oicRangB.length > 1 ? 's' : ''}.
                  </p>
                </div>
                <Badge variant="secondary" className="w-fit">Rang B</Badge>
              </div>
              <EnhancedTableauDisplay
                item={item}
                rang="B"
                onProgress={(progress) => handleSectionProgress('tableau-b', progress)}
              />
            </section>

            <section
              id="item-section-oic"
              ref={sectionRefs['oic']}
              tabIndex={-1}
              aria-labelledby="item-section-oic-title"
              className="scroll-mt-32 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Card>
                <CardHeader>
                  <CardTitle id="item-section-oic-title" className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Synthèse des compétences OIC
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Référentiel officiel 2024 · {totalOic} compétence{totalOic > 1 ? 's' : ''} activée{totalOic > 1 ? 's' : ''} pour cet item.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-primary">Rang A</span>
                        <Badge variant="outline">{oicRangA.length}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Compétences fondamentales validées pour l'item {item.item_code}.
                      </p>
                    </div>
                    <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-secondary-foreground">Rang B</span>
                        <Badge variant="outline">{oicRangB.length}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Compétences avancées orientées thérapeutique et gestion de cas.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Focus Rang A</h3>
                      {topCompetencesA.length > 0 ? (
                        <ul className="mt-2 space-y-2 text-sm leading-relaxed">
                          {topCompetencesA.map((competence, index) => (
                            <li key={`oic-a-${index}`} className="rounded-lg border border-border/60 bg-muted/50 p-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">#{index + 1}</Badge>
                                <span className="font-medium">{formatCompetenceLabel(competence)}</span>
                              </div>
                              <p className="mt-2 text-xs text-muted-foreground">{getCompetenceDescription(competence)}</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Les compétences du rang A seront synchronisées automatiquement.
                        </p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Focus Rang B</h3>
                      {topCompetencesB.length > 0 ? (
                        <ul className="mt-2 space-y-2 text-sm leading-relaxed">
                          {topCompetencesB.map((competence, index) => (
                            <li key={`oic-b-${index}`} className="rounded-lg border border-border/60 bg-muted/50 p-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                                <span className="font-medium">{formatCompetenceLabel(competence)}</span>
                              </div>
                              <p className="mt-2 text-xs text-muted-foreground">{getCompetenceDescription(competence)}</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Les compétences du rang B seront synchronisées automatiquement.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>

        <div className="mt-16">
          <Tabs value={activeExperience} onValueChange={(value) => setActiveExperience(value as ExperienceSection)}>
            <TabsList className="mx-auto mb-8 grid w-full max-w-3xl grid-cols-4">
              <TabsTrigger value="scene" className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Scène</span>
                {sectionProgress['scene'] >= 100 && <CheckCircle className="h-4 w-4 text-green-500" />}
              </TabsTrigger>
              <TabsTrigger value="bd" className="flex items-center space-x-2">
                <span role="img" aria-hidden="true">📚</span>
                <span className="hidden sm:inline">BD</span>
                {sectionProgress['bd'] >= 100 && <CheckCircle className="h-4 w-4 text-green-500" />}
              </TabsTrigger>
              <TabsTrigger value="music" className="flex items-center space-x-2">
                <Music className="h-4 w-4" />
                <span className="hidden sm:inline">Musique</span>
                {sectionProgress['music'] >= 100 && <CheckCircle className="h-4 w-4 text-green-500" />}
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Quiz</span>
                {sectionProgress['quiz'] >= 100 && <CheckCircle className="h-4 w-4 text-green-500" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scene">
              <AdvancedSceneImmersive
                item={item}
                onProgress={(progress) => handleSectionProgress('scene', progress)}
              />
            </TabsContent>

            <TabsContent value="bd">
              <AdvancedBandeDessinee
                item={item}
                onProgress={(progress) => handleSectionProgress('bd', progress)}
              />
            </TabsContent>

            <TabsContent value="music">
              <AdvancedGenerationMusicale
                item={item}
                onProgress={(progress) => handleSectionProgress('music', progress)}
              />
            </TabsContent>

            <TabsContent value="quiz">
              <AdvancedQuizInteractif
                item={item}
                onProgress={(progress) => handleSectionProgress('quiz', progress)}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Progrès global */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Progression globale</h3>
              <div className="text-2xl font-bold text-primary">
                {getOverallProgress()}%
              </div>
            </div>
            <Progress value={getOverallProgress()} className="h-3" />
            <div className="mt-2 flex justify-between text-sm text-muted-foreground">
              <span>Débutant</span>
              <span>Intermédiaire</span>
              <span>Expert</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductionEdnItem;