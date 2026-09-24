// @refresh reset
import { EdnItemCard } from "@/components/edn/premium/EdnItemCard";
import { cheminItemEdn, segmentDepuisOngletLegacy } from "@/pages/edn-item/ednItemTabs";
import { OfflineStatusBar } from "@/components/edn/OfflineStatusBar";
import { RevisionGuide } from "@/components/edn/RevisionGuide";
import { LyricsCompletionStatus } from "@/components/LyricsCompletionStatus";
import { EdnItemSkeletonGrid } from "@/components/edn/EdnItemSkeleton";
import { CreditsIA, NavigationModes, type OngletEdn } from "@/components/edn/tableau-de-bord/NavigationModes";
import {
  BandeauVisiteur,
  LigneOffre,
  TableauDeBordRevision,
  type Indicateur,
} from "@/components/edn/tableau-de-bord/TableauDeBordRevision";
import { MVPFooter } from "@/components/layout/MVPFooter";
import { SEOHead } from "@/components/seo/SEOHead";
import { RevisionDashboard } from "@/components/revision/RevisionDashboard";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { estItemGratuit, normaliserCodeItem, NOMBRE_ITEMS_TOTAL } from '@/config/offre';
import { ROUTE_PATHS } from '@/config/routes';
import { useAccesPremium } from "@/hooks/useAccesPremium";
import { useEdnFavorites } from "@/hooks/useEdnFavorites";
import { useEdnItemsOptimized } from "@/hooks/useEdnItemsOptimized";
import { useEdnNotes } from "@/hooks/useEdnNotes";
import { useEdnOffline } from "@/hooks/useEdnOffline";
import { useIAQuota } from "@/hooks/useIAQuota";
import { useProgressionEdn } from "@/hooks/useProgressionEdn";
import { ProfileSubscription } from "@/components/med-mng/profile/ProfileSubscription";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import {
  construireEtats,
  joursEcoules,
  libelleIlYa,
  recommander,
  revisionsEchues,
  type StatutItem,
} from '@/lib/recommandation';
import {
    AlertTriangle,
    BookOpen,
    Brain,
    FileText,
    Music,
    Search,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface EdnItem {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  paroles_musicales?: string[];
  paroles_rang_a?: string[];
  paroles_rang_b?: string[];
  paroles_rang_ab?: string[];
  scene_immersive?: any;
  quiz_questions?: any;
  audio_ambiance?: any;
  visual_ambiance?: any;
  payload_v2?: any;
  updated_at: string;
  specialite?: string;
  mots_cles?: string[];
  competences_count_rang_a?: number;
  competences_count_rang_b?: number;
  competences_count_total?: number;
  competences_oic_rang_a?: any;
  competences_oic_rang_b?: any;
}

type FiltreStatut = 'all' | StatutItem | 'favorites';
type FiltreRang = 'all' | 'rangA' | 'rangB' | 'complete';
type FiltreContenu = 'all' | 'withMusic' | 'noMusic' | 'highCompetences' | 'lowCompetences';
type Tri = 'item_code' | 'competences' | 'updated_at' | 'derniere_revision';

const ITEMS_PER_PAGE = 30;
const MAX_A_REVOIR = 4;

// Liste des spécialités médicales
const SPECIALTIES = [
  'Cardiologie', 'Pneumologie', 'Neurologie', 'Gastro-entérologie', 'Endocrinologie',
  'Néphrologie', 'Rhumatologie', 'Dermatologie', 'Ophtalmologie', 'ORL', 'Pédiatrie',
  'Gynécologie', 'Psychiatrie', 'Urgences', 'Infectiologie', 'Hématologie', 'Oncologie', 'Gériatrie'
];

// Fonction pour extraire le numéro de l'item_code (ex: "IC-1" -> 1, "IC-10" -> 10)
const getItemNumber = (itemCode: string): number => {
  const match = itemCode.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

// Normaliser la recherche (accents, casse) pour trouver "cardiologie" → "Cardiologie"
const normalizeText = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const totalCompetences = (item: EdnItem) =>
  (item.competences_count_rang_a || 0) + (item.competences_count_rang_b || 0);

/** Libellé visible au-dessus d'un filtre (reste affiché quelle que soit la valeur choisie). */
const Filtre = ({ id, libelle, children }: { id: string; libelle: string; children: ReactNode }) => (
  <div className="flex min-w-0 flex-col gap-1">
    <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">{libelle}</Label>
    {children}
  </div>
);

export default function EdnComplete() {
  // Utiliser le hook optimisé avec cache
  const { items: ednItems, loading, error: loadingError, refresh } = useEdnItemsOptimized();

  const [searchTerm, setSearchTerm] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<FiltreStatut>('all');
  const [filtreRang, setFiltreRang] = useState<FiltreRang>('all');
  const [filtreContenu, setFiltreContenu] = useState<FiltreContenu>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [sortBy, setSortBy] = useState<Tri>('item_code');

  const [activeTab, setActiveTab] = useState<OngletEdn>('items');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const bibliothequeRef = useRef<HTMLElement>(null);

  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  // Hooks qui font des appels Supabase
  const { quota } = useIAQuota();
  const { aAccesPremium, chargement: chargementAcces, connecte } = useAccesPremium();
  const progression = useProgressionEdn();
  const { isFavorite, toggleFavorite } = useEdnFavorites();
  // Une seule lecture des notes pour toute la page (et non une par carte).
  const { hasNote } = useEdnNotes();
  const { isAvailableOffline, isDownloading, downloadItem, removeItem, downloadedCount, syncProgress } = useEdnOffline();
  const { isOnline, pendingCount } = useOfflineSync();
  const immersiveItems = ednItems as EdnItem[];

  // Totaux du référentiel (compétences OIC officielles)
  const stats = useMemo(() => {
    const totalOicRangA = ednItems.reduce((sum, i) => sum + (i.competences_count_rang_a || 0), 0);
    const totalOicRangB = ednItems.reduce((sum, i) => sum + (i.competences_count_rang_b || 0), 0);
    const withMusic = ednItems.filter(i => i.paroles_musicales && i.paroles_musicales.length > 0).length;
    return { total: ednItems.length, totalOicRangA, totalOicRangB, withMusic };
  }, [ednItems]);

  // La fiche d'un item n'est plus une modale à neuf onglets montés d'un coup :
  // c'est une route avec une sous-page par écran (cf. src/pages/edn-item/).
  // Les anciens identifiants d'onglet (« music », « bd »…) sont traduits en
  // segments d'URL par segmentDepuisOngletLegacy.
  const openItemModal = useCallback((item: Pick<EdnItem, 'slug' | 'item_code'>, tab?: string) => {
    const slug = item.slug || item.item_code?.toLowerCase();
    if (!slug) return;
    navigate(cheminItemEdn(slug, segmentDepuisOngletLegacy(tab)));
  }, [navigate]);

  // Ouvrir automatiquement la fiche si un slug est présent dans l'URL
  useEffect(() => {
    if (slug && immersiveItems.length > 0) {
      const normalizedSlug = slug.toLowerCase();
      const item = immersiveItems.find(
        i => i.slug?.toLowerCase() === normalizedSlug ||
             i.item_code.toLowerCase() === normalizedSlug
      );
      if (item) {
        openItemModal(item);
      }
    }
  }, [slug, immersiveItems, openItemModal]);

  const allItems = useMemo(
    () => [...immersiveItems].sort((a, b) => getItemNumber(a.item_code) - getItemNumber(b.item_code)),
    [immersiveItems]
  );

  const itemParCode = useMemo(() => {
    const m = new Map<string, EdnItem>();
    allItems.forEach(i => m.set(normaliserCodeItem(i.item_code), i));
    return m;
  }, [allItems]);

  // ---- Progression réelle de l'utilisateur -------------------------------
  // « Maintenant » est recalculé à chaque nouveau chargement de la progression.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const maintenant = useMemo(() => new Date(), [progression.progressions, progression.historique]);
  const etats = useMemo(
    () => construireEtats(progression.progressions, progression.historique, maintenant),
    [progression.progressions, progression.historique, maintenant]
  );
  const suiviDisponible = connecte && progression.pret;
  const statutItem = useCallback(
    (code: string): StatutItem | undefined =>
      suiviDisponible ? etats.get(normaliserCodeItem(code))?.statut ?? 'non_commence' : undefined,
    [etats, suiviDisponible]
  );
  const derniereRevision = useCallback((code: string): string | null => {
    const d = etats.get(normaliserCodeItem(code))?.derniereActivite;
    return d ? libelleIlYa(joursEcoules(d, maintenant)) : null;
  }, [etats, maintenant]);

  const echues = useMemo(() => (suiviDisponible ? revisionsEchues(etats) : []), [etats, suiviDisponible]);

  const recommandation = useMemo(() => {
    if (!suiviDisponible || chargementAcces || allItems.length === 0) return null;
    const r = recommander({
      etats,
      codesOrdonnes: allItems.map(i => i.item_code),
      premium: aAccesPremium,
      maintenant,
    });
    if (!r) return null;
    const item = itemParCode.get(r.code);
    return { ...r, numero: getItemNumber(r.code), titre: item?.title ?? r.code };
  }, [suiviDisponible, chargementAcces, allItems, etats, aAccesPremium, maintenant, itemParCode]);

  const indicateurs = useMemo((): Indicateur[] => {
    if (etats.size === 0) return [];
    const total = allItems.length || NOMBRE_ITEMS_TOTAL;
    const liste: Indicateur[] = [
      { libelle: "Révisions dues aujourd'hui", valeur: String(echues.length) },
      { libelle: 'Items travaillés', valeur: `${etats.size} / ${total}` },
    ];
    const maitrises = [...etats.values()].filter(e => e.statut === 'maitrise').length;
    if (maitrises > 0) liste.push({ libelle: 'Items maîtrisés', valeur: String(maitrises) });
    return liste;
  }, [etats, echues.length, allItems.length]);

  const continuer = useCallback(() => {
    if (!recommandation) return;
    if (recommandation.motif === 'revision_echue') {
      // La file de la répétition espacée commence par la révision la plus en retard.
      navigate(ROUTE_PATHS.srsReview);
      return;
    }
    const item = itemParCode.get(recommandation.code);
    openItemModal(item ?? { slug: '', item_code: recommandation.code });
  }, [recommandation, itemParCode, navigate, openItemModal]);

  const commencerItem1 = useCallback(() => {
    const item = itemParCode.get('IC-1');
    openItemModal(item ?? { slug: 'ic-1', item_code: 'IC-1' });
  }, [itemParCode, openItemModal]);

  // ---- Bibliothèque : filtres et tri --------------------------------------
  const filteredItems = useMemo(() => {
    const searchNormalized = normalizeText(searchTerm);

    return allItems.filter(item => {
      // Recherche étendue : titre, code, subtitle, mots-clés, spécialité, objectifs OIC
      const matchesSearch = !searchNormalized ||
        normalizeText(item.title).includes(searchNormalized) ||
        normalizeText(item.item_code).includes(searchNormalized) ||
        String(getItemNumber(item.item_code)) === searchNormalized ||
        (item.subtitle && normalizeText(item.subtitle).includes(searchNormalized)) ||
        (item.specialite && normalizeText(item.specialite).includes(searchNormalized)) ||
        (item.mots_cles && item.mots_cles.some(mot => normalizeText(mot).includes(searchNormalized))) ||
        (item.competences_oic_rang_a && Array.isArray(item.competences_oic_rang_a) &&
          item.competences_oic_rang_a.some((c: any) =>
            (c?.objectif_id && normalizeText(c.objectif_id).includes(searchNormalized)) ||
            (c?.intitule && normalizeText(c.intitule).includes(searchNormalized))
          )) ||
        (item.competences_oic_rang_b && Array.isArray(item.competences_oic_rang_b) &&
          item.competences_oic_rang_b.some((c: any) =>
            (c?.objectif_id && normalizeText(c.objectif_id).includes(searchNormalized)) ||
            (c?.intitule && normalizeText(c.intitule).includes(searchNormalized))
          ));
      if (!matchesSearch) return false;

      const matchesSpecialty = selectedSpecialty === 'all' ||
        normalizeText(item.title).includes(normalizeText(selectedSpecialty)) ||
        (item.specialite && normalizeText(item.specialite).includes(normalizeText(selectedSpecialty))) ||
        (item.mots_cles && item.mots_cles.some(mot => normalizeText(mot).includes(normalizeText(selectedSpecialty))));
      if (!matchesSpecialty) return false;

      const a = item.competences_count_rang_a || 0;
      const b = item.competences_count_rang_b || 0;
      if (filtreRang === 'rangA' && a === 0) return false;
      if (filtreRang === 'rangB' && b === 0) return false;
      if (filtreRang === 'complete' && !(a > 0 && b > 0)) return false;

      const aMusique = Boolean(item.paroles_musicales && item.paroles_musicales.length > 0);
      if (filtreContenu === 'withMusic' && !aMusique) return false;
      if (filtreContenu === 'noMusic' && aMusique) return false;
      if (filtreContenu === 'highCompetences' && a + b < 10) return false;
      if (filtreContenu === 'lowCompetences' && a + b >= 5) return false;

      if (filtreStatut === 'favorites') return isFavorite(item.item_code);
      if (filtreStatut !== 'all') return statutItem(item.item_code) === filtreStatut;
      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'competences':
          return totalCompetences(b) - totalCompetences(a);
        case 'updated_at':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'derniere_revision': {
          const da = etats.get(normaliserCodeItem(a.item_code))?.derniereActivite?.getTime() ?? 0;
          const db = etats.get(normaliserCodeItem(b.item_code))?.derniereActivite?.getTime() ?? 0;
          return db - da || getItemNumber(a.item_code) - getItemNumber(b.item_code);
        }
        default:
          return getItemNumber(a.item_code) - getItemNumber(b.item_code);
      }
    });
  }, [allItems, searchTerm, filtreStatut, filtreRang, filtreContenu, selectedSpecialty, sortBy, isFavorite, statutItem, etats]);

  // Sans compte, les statuts et favoris ne sont pas calculables : on revient à « Tous ».
  useEffect(() => {
    if (!connecte) {
      setFiltreStatut('all');
      setSortBy(prev => (prev === 'derniere_revision' ? 'item_code' : prev));
    }
  }, [connecte]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchTerm, filtreStatut, filtreRang, filtreContenu, selectedSpecialty, sortBy]);

  const visibleItems = useMemo(() => filteredItems.slice(0, visibleCount), [filteredItems, visibleCount]);
  const hasMore = visibleCount < filteredItems.length;

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredItems.length));
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, filteredItems.length]);

  const voirToutesLesRevisions = () => {
    setFiltreStatut('a_revoir');
    bibliothequeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filtresActifs = searchTerm || filtreStatut !== 'all' || filtreRang !== 'all' || filtreContenu !== 'all' || selectedSpecialty !== 'all';
  const reinitialiserFiltres = () => {
    setSearchTerm('');
    setFiltreStatut('all');
    setFiltreRang('all');
    setFiltreContenu('all');
    setSelectedSpecialty('all');
  };

  const afficherLigneOffre = !chargementAcces && !aAccesPremium;

  const renderCarte = (item: EdnItem) => (
    <EdnItemCard
      key={item.id}
      item={item}
      onOpen={(tab) => openItemModal(item, tab)}
      isFavorite={isFavorite(item.item_code)}
      onToggleFavorite={() => toggleFavorite(item.item_code, item.title)}
      isOfflineAvailable={isAvailableOffline(item.item_code)}
      isDownloading={isDownloading === item.item_code}
      onDownloadOffline={downloadItem}
      onRemoveOffline={removeItem}
      statut={statutItem(item.item_code)}
      derniereRevision={suiviDisponible ? derniereRevision(item.item_code) : null}
      hasNotes={hasNote(item.item_code)}
      estEssaiGratuit={!chargementAcces && !aAccesPremium && estItemGratuit(item.item_code)}
    />
  );

  const GRILLE = "grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4";

  if (loading && ednItems.length === 0) {
    return (
      <div className="-mt-16 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-foreground mb-2">Chargement des items EDN...</h1>
            <p className="text-muted-foreground text-sm">{NOMBRE_ITEMS_TOTAL} items en cours de récupération</p>
          </div>
          <EdnItemSkeletonGrid count={12} />
        </div>
      </div>
    );
  }

  if (loadingError && ednItems.length === 0) {
    return (
      <div className="-mt-16 min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Impossible de charger les cours</h2>
          <p className="text-muted-foreground text-sm">
            {loadingError.includes('timeout') || loadingError.includes('trop long')
              ? 'La connexion au serveur est lente. Vérifiez votre réseau et réessayez.'
              : 'Une erreur est survenue lors du chargement des items EDN. Réessayez dans quelques secondes.'}
          </p>
          <Button onClick={refresh} className="mt-4">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Items EDN"
        description="Maîtrisez les 367 items EDN grâce à la musique IA. Tableaux Rang A/B, compétences OIC et chansons pédagogiques."
        keywords="EDN, items, médecine, révision, musique, apprentissage"
        canonical="/edn-complete"
      />
      {/* -mt-16 : la navigation principale est « sticky » (dans le flux) alors que
          <main> ajoute un pt-16 prévu pour une barre « fixed » : sans cette
          compensation, une bande vide de 64 px apparaît sous l'en-tête. */}
      <div className="-mt-16 min-h-screen bg-background flex flex-col">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as OngletEdn)} className="flex-1">
          {/* Barre compacte : titre + modes regroupés + crédits */}
          <div className="border-b bg-card/80">
            <div className="container mx-auto flex flex-col gap-2 px-3 py-2 sm:px-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary" aria-hidden="true">
                  <BookOpen className="h-4 w-4 text-primary-foreground" />
                </div>
                <h1 className="text-base font-semibold text-foreground sm:text-lg">Avancer sur l'EDN</h1>
                <OfflineStatusBar
                  isOnline={isOnline}
                  downloadedCount={downloadedCount}
                  pendingSync={pendingCount}
                  onSync={syncProgress}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <NavigationModes onglet={activeTab} onOnglet={setActiveTab} />
                <CreditsIA connecte={connecte} />
              </div>
            </div>
          </div>

          <div className="container mx-auto px-3 py-4 sm:px-4 lg:px-6">
            <TabsContent value="items" className="mt-0 space-y-6">
              {/* 1. Que réviser maintenant ? */}
              <div className="space-y-3">
                {chargementAcces ? (
                  <div className="h-24 animate-pulse rounded-lg border bg-muted/50" aria-hidden="true" />
                ) : connecte ? (
                  <TableauDeBordRevision
                    chargement={progression.chargement && !progression.pret}
                    erreur={progression.erreur}
                    onRecharger={progression.recharger}
                    recommandation={recommandation}
                    aucuneActivite={etats.size === 0}
                    indicateurs={indicateurs}
                    onContinuer={continuer}
                  />
                ) : (
                  <BandeauVisiteur onCommencer={commencerItem1} />
                )}
                {afficherLigneOffre && <LigneOffre />}
              </div>

              {/* 2. À revoir aujourd'hui (répétition espacée échue) */}
              {echues.length > 0 && (
                <section aria-labelledby="titre-a-revoir" className="space-y-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 id="titre-a-revoir" className="text-lg font-semibold text-foreground">
                      À revoir aujourd'hui <span className="text-sm font-normal text-muted-foreground">({echues.length})</span>
                    </h2>
                    <div className="flex gap-2">
                      {echues.length > MAX_A_REVOIR && (
                        <Button type="button" variant="ghost" size="sm" onClick={voirToutesLesRevisions}>
                          Voir les {echues.length}
                        </Button>
                      )}
                      <Button type="button" variant="outline" size="sm" onClick={() => navigate(ROUTE_PATHS.srsReview)}>
                        <Brain className="mr-1.5 h-4 w-4" aria-hidden="true" />
                        Lancer la répétition espacée
                      </Button>
                    </div>
                  </div>
                  <div className={GRILLE}>
                    {echues
                      .slice(0, MAX_A_REVOIR)
                      .map(e => itemParCode.get(e.code))
                      .filter((i): i is EdnItem => Boolean(i))
                      .map(renderCarte)}
                  </div>
                </section>
              )}

              {/* 3. Bibliothèque */}
              <section ref={bibliothequeRef} aria-labelledby="titre-bibliotheque" className="scroll-mt-20 space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h2 id="titre-bibliotheque" className="text-lg font-semibold text-foreground">Tous les items</h2>
                  <p className="text-xs text-muted-foreground">
                    {stats.total} items · {stats.totalOicRangA + stats.totalOicRangB} compétences du référentiel
                    (rang A {stats.totalOicRangA} · rang B {stats.totalOicRangB}) · {stats.withMusic} avec musique
                  </p>
                </div>

                <div className="space-y-3 rounded-lg border bg-card p-3">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="recherche-item" className="text-xs font-medium text-muted-foreground">
                      Rechercher un item EDN (numéro, titre, discipline)
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="recherche-item"
                        type="search"
                        placeholder="Ex. 1, IC-230, insuffisance cardiaque, cardiologie"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
                    <Filtre id="filtre-discipline" libelle="Discipline">
                      <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                        <SelectTrigger id="filtre-discipline" className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes</SelectItem>
                          {SPECIALTIES.map(spec => (
                            <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Filtre>

                    {connecte && (
                      <Filtre id="filtre-statut" libelle="Statut">
                        <Select value={filtreStatut} onValueChange={(v) => setFiltreStatut(v as FiltreStatut)}>
                          <SelectTrigger id="filtre-statut" className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            {suiviDisponible && (
                              <>
                                <SelectItem value="non_commence">Non commencé</SelectItem>
                                <SelectItem value="en_cours">En cours</SelectItem>
                                <SelectItem value="a_revoir">À revoir</SelectItem>
                                <SelectItem value="maitrise">Maîtrisé</SelectItem>
                              </>
                            )}
                            <SelectItem value="favorites">Favoris</SelectItem>
                          </SelectContent>
                        </Select>
                      </Filtre>
                    )}

                    <Filtre id="filtre-rang" libelle="Rang">
                      <Select value={filtreRang} onValueChange={(v) => setFiltreRang(v as FiltreRang)}>
                        <SelectTrigger id="filtre-rang" className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous</SelectItem>
                          <SelectItem value="rangA">Avec rang A</SelectItem>
                          <SelectItem value="rangB">Avec rang B</SelectItem>
                          <SelectItem value="complete">Rang A et rang B</SelectItem>
                        </SelectContent>
                      </Select>
                    </Filtre>

                    <Filtre id="filtre-contenu" libelle="Contenu">
                      <Select value={filtreContenu} onValueChange={(v) => setFiltreContenu(v as FiltreContenu)}>
                        <SelectTrigger id="filtre-contenu" className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tout</SelectItem>
                          <SelectItem value="withMusic">Avec musique</SelectItem>
                          <SelectItem value="noMusic">Sans musique</SelectItem>
                          <SelectItem value="highCompetences">10 compétences ou plus</SelectItem>
                          <SelectItem value="lowCompetences">Moins de 5 compétences</SelectItem>
                        </SelectContent>
                      </Select>
                    </Filtre>

                    <Filtre id="filtre-tri" libelle="Tri">
                      <Select value={sortBy} onValueChange={(v) => setSortBy(v as Tri)}>
                        <SelectTrigger id="filtre-tri" className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="item_code">Numéro d'item</SelectItem>
                          <SelectItem value="competences">Nombre de compétences</SelectItem>
                          <SelectItem value="updated_at">Mis à jour récemment</SelectItem>
                          {suiviDisponible && <SelectItem value="derniere_revision">Dernière révision</SelectItem>}
                        </SelectContent>
                      </Select>
                    </Filtre>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground" aria-live="polite">
                    <span>{filteredItems.length} item{filteredItems.length > 1 ? 's' : ''}</span>
                    {filtresActifs && (
                      <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs" onClick={reinitialiserFiltres}>
                        Réinitialiser les filtres
                      </Button>
                    )}
                  </div>
                </div>

                {filteredItems.length === 0 && !loading && (
                  <div className="py-8 text-center text-muted-foreground">
                    Aucun item trouvé. Essayez de modifier vos filtres.
                  </div>
                )}

                {filteredItems.length > 0 && (
                  <>
                    <div className={GRILLE}>{visibleItems.map(renderCarte)}</div>
                    {hasMore && (
                      <div ref={loadMoreRef} className="flex flex-col items-center gap-2 py-6">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
                        <p className="text-xs text-muted-foreground">
                          {visibleCount} / {filteredItems.length} items affichés
                        </p>
                      </div>
                    )}
                  </>
                )}

                {loading && immersiveItems.length > 0 && (
                  <div className="flex justify-center py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
                  </div>
                )}
              </section>
            </TabsContent>

            <TabsContent value="revision" className="mt-0">
              <div className="space-y-6">
                <RevisionGuide />
                <RevisionDashboard />
              </div>
            </TabsContent>

            <TabsContent value="music" className="mt-0">
              <LyricsCompletionStatus />
            </TabsContent>

            <TabsContent value="subscription" className="mt-0">
              <div className="space-y-6">
                {/* Abonnement : même source et même vue que le profil */}
                <ProfileSubscription />

                <Card>
                  <CardHeader>
                    <CardTitle>Utilisation des fonctionnalités</CardTitle>
                    <CardDescription>
                      Découvrez comment optimiser votre apprentissage avec nos outils IA
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Music className="h-5 w-5 text-primary" aria-hidden="true" />
                          <span className="font-medium">Musique IA</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Générez des chansons mnémotechniques personnalisées
                        </p>
                        <p className="text-xs mt-2 text-primary">
                          Coût : 5 crédits par génération
                        </p>
                      </div>

                      <div className="p-4 bg-success/5 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-5 w-5 text-success" aria-hidden="true" />
                          <span className="font-medium">QCM IA</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Créez des QCM adaptatifs intelligents
                        </p>
                        <p className="text-xs mt-2 text-success">
                          Coût : 2 crédits par QCM
                        </p>
                      </div>

                      <div className="p-4 bg-accent/10 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-5 w-5 text-accent-foreground" aria-hidden="true" />
                          <span className="font-medium">Bandes dessinées</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Transformez les concepts en BD éducatives
                        </p>
                        <p className="text-xs mt-2 text-accent-foreground">
                          Coût : 10 crédits par BD
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {connecte && quota <= 5 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    <AlertDescription>
                      Attention : il vous reste seulement {quota} crédits.
                      Envisagez un abonnement pour continuer à utiliser les fonctionnalités IA.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
        <MVPFooter />
      </div>
    </>
  );
}
