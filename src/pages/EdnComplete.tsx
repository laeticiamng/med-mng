// @refresh reset
import { EdnItemCard } from "@/components/edn/premium/EdnItemCard";
import { EdnItemModal } from "@/components/edn/premium/EdnItemModal";
import { RevisionGuide } from "@/components/edn/RevisionGuide";
import { LyricsCompletionStatus } from "@/components/LyricsCompletionStatus";
import { MVPFooter } from "@/components/layout/MVPFooter";
import { PricingPlans } from "@/components/med-mng/PricingPlans";
import { SEOHead } from "@/components/seo/SEOHead";
import { QuotaIndicator } from "@/components/quota/QuotaIndicator";
import { RevisionDashboard } from "@/components/revision/RevisionDashboard";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTE_PATHS } from '@/config/routes';
import { useToast } from "@/hooks/use-toast";
import { useEdnFavorites } from "@/hooks/useEdnFavorites";
import { useEdnItemsOptimized } from "@/hooks/useEdnItemsOptimized";
import { useGamification } from "@/hooks/useGamification";
import { useIAQuota } from "@/hooks/useIAQuota";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import {
    AlertTriangle,
    BarChart3,
    BookOpen,
    Brain,
    FileText,
    Flame,
    Gamepad2,
    Grid, List,
    Music,
    Search,
    Sparkles,
    Star, Target
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

export default function EdnComplete() {
  // Utiliser le hook optimisé avec cache
  const { items: ednItems, stats: optimizedStats, loading, error: loadingError, refresh } = useEdnItemsOptimized();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'item_code' | 'completeness_score' | 'updated_at'>('item_code');
  
  const [selectedItem, setSelectedItem] = useState<EdnItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('immersive');
  const [showPricing, setShowPricing] = useState(false);
  const [selectedItemTab, setSelectedItemTab] = useState<string>('overview');
  
  const { toast: _toast } = useToast();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
  // Hooks qui font des appels Supabase
  const { stats: gamificationStats } = useGamification();
  const { quota } = useIAQuota();
  const { subscription } = useSubscription();
  const { isFavorite, toggleFavorite } = useEdnFavorites();
  
  // Alias pour compatibilité
  const immersiveItems = ednItems as EdnItem[];
  const completeItems = ednItems as EdnItem[];
  
  // Stats calculées depuis le hook optimisé
  const stats = useMemo(() => {
    // Totaux OIC officiels (from backup_oic_competences)
    const totalOicRangA = ednItems.reduce((sum, i) => sum + (i.competences_count_rang_a || 0), 0);
    const totalOicRangB = ednItems.reduce((sum, i) => sum + (i.competences_count_rang_b || 0), 0);
    
    return {
      total: optimizedStats.total,
      complete: optimizedStats.complete,
      withMusic: optimizedStats.withMusic,
      avgScore: optimizedStats.avgScore,
      withRangA: optimizedStats.withRangA,
      withRangB: optimizedStats.withRangB,
      totalOicRangA,
      totalOicRangB,
      totalOicCompetences: totalOicRangA + totalOicRangB,
    };
  }, [optimizedStats, ednItems]);

  // Ouvrir automatiquement la modal si un slug est présent dans l'URL
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
  }, [slug, immersiveItems]);

  // Fonction pour extraire le numéro de l'item_code (ex: "IC-1" -> 1, "IC-10" -> 10)
  const getItemNumber = (itemCode: string): number => {
    const match = itemCode.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const allItems = useMemo(() => {
    const mergedItems = immersiveItems.map(immersive => {
      const complete = completeItems.find(c => c.item_code === immersive.item_code);
      return {
        ...immersive,
        ...complete,
        slug: immersive.slug,
      };
    });
    // Tri numérique par item_code
    return mergedItems.sort((a, b) => getItemNumber(a.item_code) - getItemNumber(b.item_code));
  }, [immersiveItems, completeItems]);

  const getCompletionPercentage = (item: EdnItem) => {
    // Calcul basé sur les données OIC réelles de backup_oic_competences
    let score = 0;
    let maxScore = 0;
    
    // Rang A (40 points max) - basé sur competences_count_rang_a
    const rangACount = item.competences_count_rang_a || 0;
    maxScore += 40;
    if (rangACount > 0) {
      // Score proportionnel : 1-3 = 20pts, 4-7 = 30pts, 8+ = 40pts
      score += rangACount >= 8 ? 40 : rangACount >= 4 ? 30 : 20;
    }
    
    // Rang B (40 points max) - basé sur competences_count_rang_b  
    const rangBCount = item.competences_count_rang_b || 0;
    maxScore += 40;
    if (rangBCount > 0) {
      score += rangBCount >= 8 ? 40 : rangBCount >= 4 ? 30 : 20;
    }
    
    // Paroles musicales (20 points) - vérifie si présentes
    maxScore += 20;
    if (item.paroles_musicales && item.paroles_musicales.length > 0) {
      score += 20;
    }
    
    return Math.round((score / maxScore) * 100);
  };
  // Liste des spécialités médicales
  const SPECIALTIES = [
    'Cardiologie', 'Pneumologie', 'Neurologie', 'Gastro-entérologie', 'Endocrinologie',
    'Néphrologie', 'Rhumatologie', 'Dermatologie', 'Ophtalmologie', 'ORL', 'Pédiatrie', 
    'Gynécologie', 'Psychiatrie', 'Urgences', 'Infectiologie', 'Hématologie', 'Oncologie', 'Gériatrie'
  ];

  const filteredItems = useMemo(() => {
    // ✅ FIX: Normaliser la recherche (accents, casse) pour trouver "cardiologie" → "Cardiologie"
    const normalizeText = (text: string) => 
      text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    const searchNormalized = normalizeText(searchTerm);
    
    return allItems.filter(item => {
      // Recherche étendue : titre, code, subtitle, mots-clés, spécialité, objectifs OIC
      const matchesSearch = !searchNormalized || 
        normalizeText(item.title).includes(searchNormalized) ||
        normalizeText(item.item_code).includes(searchNormalized) ||
        (item.subtitle && normalizeText(item.subtitle).includes(searchNormalized)) ||
        (item.specialite && normalizeText(item.specialite).includes(searchNormalized)) ||
        (item.mots_cles && item.mots_cles.some(mot => normalizeText(mot).includes(searchNormalized))) ||
        // Recherche dans les objectifs OIC (format: "OIC-XXX" ou "objectif_id")
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
      
      // Filtre par spécialité (utilise normalizeText défini plus haut)
      const matchesSpecialty = selectedSpecialty === 'all' || 
        normalizeText(item.title).includes(normalizeText(selectedSpecialty)) ||
        (item.specialite && normalizeText(item.specialite).includes(normalizeText(selectedSpecialty))) ||
        (item.mots_cles && item.mots_cles.some(mot => normalizeText(mot).includes(normalizeText(selectedSpecialty))));
      
      if (!matchesSpecialty) return false;
      
      if (selectedCategory === 'all') return matchesSearch;
      
      const matchesCategory = (() => {
        const totalComp = (item.competences_count_rang_a || 0) + (item.competences_count_rang_b || 0);
        switch (selectedCategory) {
          case 'complete':
            return (item.competences_count_rang_a || 0) > 0 && (item.competences_count_rang_b || 0) > 0;
          case 'withMusic':
            return item.paroles_musicales && item.paroles_musicales.length > 0;
          case 'noMusic':
            return !item.paroles_musicales || item.paroles_musicales.length === 0;
          case 'rangA':
            return (item.competences_count_rang_a || 0) > 0;
          case 'rangB':
            return (item.competences_count_rang_b || 0) > 0;
          case 'highCompetences':
            return totalComp >= 10;
          case 'lowCompetences':
            return totalComp < 5;
          case 'favorites':
            return isFavorite(item.item_code);
          default:
            return true;
        }
      })();

      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'completeness_score':
          return getCompletionPercentage(b) - getCompletionPercentage(a);
        case 'updated_at':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        default:
          const numA = parseInt(a.item_code.replace('IC-', '') || '0');
          const numB = parseInt(b.item_code.replace('IC-', '') || '0');
          return numA - numB;
      }
    });
  }, [allItems, searchTerm, selectedCategory, selectedSpecialty, sortBy]);

  const openItemModal = useCallback(async (item: EdnItem, tab?: string) => {
    // Ouvrir la modal immédiatement avec données partielles
    setSelectedItem(item);
    setSelectedItemTab(tab || 'overview');
    setIsModalOpen(true);
    
    // Puis fetch données complètes (tableaux, quiz, scène, etc.) via supabase
    try {
      const { data } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .eq('item_code', item.item_code)
        .maybeSingle();

      if (data) {
        setSelectedItem({ ...item, ...data });
      }
    } catch (err) {
      // Silently ignore - partial data is still usable
    }
  }, []);

  if (loading && ednItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Chargement des items EDN...</p>
        </div>
      </div>
    );
  }

  if (loadingError && ednItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{loadingError}</AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={refresh}
            className="mt-4"
          >
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
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex flex-col">
        {/* Wrapper Tabs Principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        {/* Header simplifié - responsive */}
        <div className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-40">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            {/* Mobile: Stack layout / Desktop: Row layout */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
              {/* Left section: Title + Stats */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">Avancer sur l'EDN</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {stats.total} items • {(stats.totalOicRangA || 0) + (stats.totalOicRangB || 0)} compétences
                  </p>
                </div>
                {gamificationStats && gamificationStats.currentStreak !== undefined && (
                  <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 ml-2 sm:ml-4">
                    <Badge variant="outline" className="gap-1 text-[10px] sm:text-xs py-0.5">
                      <Flame className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-orange-500" />
                      {gamificationStats.currentStreak}j
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-[10px] sm:text-xs py-0.5">
                      <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-500" />
                      Niv. {gamificationStats.level ?? 1}
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Right section: Actions + Tabs */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                {/* Quick actions - scrollable on mobile */}
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(ROUTE_PATHS.srsReview)}
                    className="gap-1 sm:gap-1.5 border-primary/30 hover:bg-primary/10 h-8 px-2 sm:px-3 text-xs shrink-0"
                  >
                    <Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">SRS</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(ROUTE_PATHS.examMode)}
                    className="gap-1 sm:gap-1.5 border-accent/30 hover:bg-accent/10 h-8 px-2 sm:px-3 text-xs shrink-0"
                  >
                    <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Examen</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(ROUTE_PATHS.clinicalCases)}
                    className="gap-1 sm:gap-1.5 border-success/30 hover:bg-success/10 h-8 px-2 sm:px-3 text-xs shrink-0"
                  >
                    <Gamepad2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden lg:inline">Cas</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(ROUTE_PATHS.flashcards)}
                    className="gap-1 sm:gap-1.5 border-warning/30 hover:bg-warning/10 h-8 px-2 sm:px-3 text-xs shrink-0"
                  >
                    <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden lg:inline">Flash</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(ROUTE_PATHS.progressDashboard)}
                    className="gap-1 sm:gap-1.5 h-8 px-2 sm:px-3 text-xs shrink-0"
                  >
                    <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden xl:inline">Stats</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(ROUTE_PATHS.smartStudyPlanner)}
                    className="gap-1 sm:gap-1.5 h-8 px-2 sm:px-3 text-xs shrink-0"
                  >
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden xl:inline">Planning IA</span>
                  </Button>
                  <QuotaIndicator compact />
                </div>
                
                {/* Tabs - scrollable on mobile */}
                <div className="overflow-x-auto w-full sm:w-auto hide-scrollbar">
                  <TabsList className="bg-muted inline-flex w-auto">
                    <TabsTrigger value="revision" className="text-[10px] sm:text-xs px-2 sm:px-3">📊 Suivi</TabsTrigger>
                    <TabsTrigger value="complete" className="text-[10px] sm:text-xs px-2 sm:px-3">📚 Items</TabsTrigger>
                    <TabsTrigger value="immersive" className="text-[10px] sm:text-xs px-2 sm:px-3">🎯 Approfondir</TabsTrigger>
                    <TabsTrigger value="music" className="text-[10px] sm:text-xs px-2 sm:px-3">🎵 Écouter</TabsTrigger>
                    <TabsTrigger value="subscription" className="text-[10px] sm:text-xs px-2 sm:px-3">⭐ Premium</TabsTrigger>
                  </TabsList>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        {/* Bannière informative sur l'accès gratuit */}
        <Alert className="mb-4 bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm text-foreground">
            <strong className="font-semibold">Accès gratuit illimité aux révisions EDN</strong>
            <div className="mt-1 space-y-1">
              <div>✅ Réviser les 367 items EDN : <strong>GRATUIT ♾️</strong></div>
              <div>✅ Lire tout le contenu (Rang A + B) : <strong>GRATUIT</strong></div>
              <div>✅ Faire les quiz : <strong>GRATUIT</strong></div>
              <div className="mt-2 pt-2 border-t border-primary/20 dark:border-primary/30">
                🎵 Les crédits ({quota || 80}/160) servent uniquement à <strong>générer des musiques IA personnalisées</strong>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Contrôles */}
        <div className="flex flex-col gap-3 mb-6">
           <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher (IC-1, Cardiologie, OIC-XXX, compétence...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 items-center justify-between flex-wrap">
            <div className="flex gap-2 flex-wrap">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous ({stats.total})</SelectItem>
                  <SelectItem value="complete">Complets ({stats.complete})</SelectItem>
                  <SelectItem value="rangA">Avec Rang A ({stats.withRangA || 0})</SelectItem>
                  <SelectItem value="rangB">Avec Rang B ({stats.withRangB || 0})</SelectItem>
                  <SelectItem value="withMusic">Avec Musique ({stats.withMusic})</SelectItem>
                  <SelectItem value="highCompetences">+10 compétences</SelectItem>
                  <SelectItem value="lowCompetences">-5 compétences</SelectItem>
                  <SelectItem value="noMusic">Sans Musique</SelectItem>
                  <SelectItem value="favorites">⭐ Mes Favoris</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Spécialité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes spécialités</SelectItem>
                  {SPECIALTIES.map(spec => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="item_code">Par code</SelectItem>
                  <SelectItem value="completeness_score">Par score</SelectItem>
                  <SelectItem value="updated_at">Récents</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(ROUTE_PATHS.learningDashboard)}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>
              
              <div className="flex gap-1 border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

          {/* Contenu des onglets */}
        <TabsContent value="revision">
            <div className="space-y-6">
              <RevisionGuide />
              <RevisionDashboard />
            </div>
          </TabsContent>

          <TabsContent value="immersive" className="mt-6">
            <div className="space-y-6">
              {filteredItems.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun item trouvé. Essayez de modifier vos filtres.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map(item => (
                  <EdnItemCard
                    key={item.id}
                    item={item}
                    completionPercentage={getCompletionPercentage(item)}
                    onOpen={(tab) => openItemModal(item, tab)}
                    isFavorite={isFavorite(item.item_code)}
                    onToggleFavorite={() => toggleFavorite(item.item_code, item.title)}
                  />
                ))}
              </div>
              
              
              {loading && immersiveItems.length > 0 && (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="complete">
            <div className="space-y-6">
              {/* Stats OIC rapides */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="text-2xl font-bold text-primary">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Items EDN</div>
                </Card>
                <Card className="p-4 bg-success/5 border-success/20">
                  <div className="text-2xl font-bold text-success">{stats.totalOicRangA || 0}</div>
                  <div className="text-sm text-muted-foreground">Compétences Rang A</div>
                </Card>
                <Card className="p-4 bg-accent/5 border-accent/20">
                  <div className="text-2xl font-bold text-accent-foreground">{stats.totalOicRangB || 0}</div>
                  <div className="text-sm text-muted-foreground">Compétences Rang B</div>
                </Card>
                <Card className="p-4 bg-warning/5 border-warning/20">
                  <div className="text-2xl font-bold text-warning">{stats.withMusic}</div>
                  <div className="text-sm text-muted-foreground">Avec Musique</div>
                </Card>
              </div>

              {/* Liste des items */}
              {filteredItems.length === 0 && !loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun item trouvé. Modifiez vos filtres.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map(item => (
                    <EdnItemCard
                      key={item.id}
                      item={item}
                      completionPercentage={getCompletionPercentage(item)}
                      onOpen={(tab) => openItemModal(item, tab)}
                      isFavorite={isFavorite(item.item_code)}
                      onToggleFavorite={() => toggleFavorite(item.item_code, item.title)}
                    />
                  ))}
                </div>
              )}
              
              {loading && immersiveItems.length > 0 && (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="music">
            <LyricsCompletionStatus />
          </TabsContent>

          <TabsContent value="subscription">
            <div className="space-y-6">
              {/* Quota Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <QuotaIndicator showDetails />
                <Card>
                  <CardHeader>
                    <CardTitle>Plan actuel</CardTitle>
                    <CardDescription>Votre abonnement et fonctionnalités</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {subscription?.plan_name || 'Plan Gratuit'}
                        </span>
                        <Badge variant={subscription ? 'default' : 'secondary'}>
                          {subscription ? 'Actif' : 'Gratuit'}
                        </Badge>
                      </div>
                      {subscription && (
                        <div className="text-sm text-muted-foreground">
                          <p>Quota mensuel: {subscription.monthly_quota} crédits</p>
                          <p>Statut: {subscription.status}</p>
                        </div>
                      )}
                      {!subscription && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Vous utilisez le plan gratuit avec des fonctionnalités limitées.
                          </p>
                          <Button 
                            onClick={() => setShowPricing(true)}
                            className="w-full"
                          >
                            Découvrir nos plans
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pricing Plans */}
              {showPricing && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Choisissez votre plan</h3>
                  <PricingPlans 
                    onSelectPlan={(planId) => {
                      navigate(`/med-mng/subscribe/${planId}`);
                    }}
                  />
                </div>
              )}

              {/* Usage Stats */}
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
                        <Music className="h-5 w-5 text-primary" />
                        <span className="font-medium">Musique IA</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Générez des chansons mnémotechniques personnalisées
                      </p>
                      <p className="text-xs mt-2 text-primary">
                        Coût: 5 crédits par génération
                      </p>
                    </div>
                    
                    <div className="p-4 bg-success/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-5 w-5 text-success" />
                        <span className="font-medium">QCM IA</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Créez des QCM adaptatifs intelligents
                      </p>
                      <p className="text-xs mt-2 text-success">
                        Coût: 2 crédits par QCM
                      </p>
                    </div>
                    
                    <div className="p-4 bg-accent/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-accent-foreground" />
                        <span className="font-medium">Bandes Dessinées</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Transformez les concepts en BD éducatives
                      </p>
                      <p className="text-xs mt-2 text-accent-foreground">
                        Coût: 10 crédits par BD
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {quota <= 5 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Attention: Il vous reste seulement {quota} crédits. 
                    Considérez un abonnement pour continuer à utiliser nos fonctionnalités IA.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

      </div>

        {/* Modal */}
        <EdnItemModal
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialTab={selectedItemTab}
        />
      </Tabs>
      <MVPFooter />
    </div>
    </>
  );
}