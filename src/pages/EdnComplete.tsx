import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, BookOpen, Award, Users, TrendingUp, Filter, Grid, List, Eye,
  Music, Brain, Play, Headphones, CheckCircle, Sparkles, ArrowRight,
  Volume2, Gamepad2, Maximize2, Star, Target, Image, FileText, AlertTriangle,
  BarChart3, HelpCircle, RotateCcw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { EdnItemModal } from "@/components/edn/premium/EdnItemModal";
import { EdnItemCard } from "@/components/edn/premium/EdnItemCard";
import { LyricsCompletionStatus } from "@/components/LyricsCompletionStatus";
import { RevisionDashboard } from "@/components/revision/RevisionDashboard";
import { RevisionGuide } from "@/components/edn/RevisionGuide";
import { QuotaIndicator } from "@/components/quota/QuotaIndicator";
import { PricingPlans } from "@/components/med-mng/PricingPlans";
import { useIAQuota } from "@/hooks/useIAQuota";
import { useSubscription } from "@/hooks/useSubscription";
import { transformTableauToSections } from "@/utils/tableauTransformations";
import { TooltipInfo } from "@/components/ui/tooltip-info";
import { FaqSection } from "@/components/help/FaqSection";
import { useEdnFilters } from "@/hooks/useEdnFilters";

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
  completeness_score?: number;
  is_validated?: boolean;
  competences_oic_rang_a?: any;
  competences_oic_rang_b?: any;
}

export default function EdnComplete() {
  
  const [immersiveItems, setImmersiveItems] = useState<EdnItem[]>([]);
  const [completeItems, setCompleteItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const ITEMS_PER_PAGE = 50;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<EdnItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('immersive');
  const [showPricing, setShowPricing] = useState(false);
  
  const { quota } = useIAQuota();
  const { subscription, canGenerateMusic } = useSubscription();
  
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    // Timeout de sécurité: 10 secondes max
    const timeoutId = setTimeout(() => {
      setLoadingError('Le chargement prend trop de temps. Réessayez.');
      setLoading(false);
    }, 10000);
    
    fetchAllData()
      .then(() => clearTimeout(timeoutId))
      .catch(err => {
        clearTimeout(timeoutId);
        console.error('Error loading data:', err);
        setLoadingError('Erreur lors du chargement des données.');
        setLoading(false);
      });
    
    return () => clearTimeout(timeoutId);
  }, [page]);

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

  const fetchAllData = async () => {
    console.log('[EDN] Starting fetchAllData, page:', page);
    setLoading(true);
    setLoadingError(null);
    
    try {
      // PAGINATION: Charger seulement 50 items à la fois
      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      console.log('[EDN] Fetching items from', from, 'to', to);
      
      const { data: immersiveData, error: immersiveError, count } = await supabase
        .from('edn_items_immersive')
        .select(`
          id, item_code, title, subtitle, slug, updated_at,
          competences_count_rang_a, competences_count_rang_b, competences_count_total,
          tableau_rang_a, tableau_rang_b,
          paroles_musicales, scene_immersive, quiz_questions, audio_ambiance
        `, { count: 'exact' })
        .range(from, to);
      
      console.log('[EDN] Immersive data fetched:', {
        dataLength: immersiveData?.length,
        error: immersiveError,
        count
      });
      
      // Stocker le count total
      if (count !== null && count !== undefined) {
        setTotalCount(count);
      }
      
      setHasMore((immersiveData?.length || 0) === ITEMS_PER_PAGE && (count || 0) > to + 1);

      if (immersiveError) {
        console.error('[EDN] Immersive error:', immersiveError);
        setLoadingError(`Erreur: ${immersiveError.message}`);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données.",
          variant: "destructive"
        });
        return;
      }

      // OPTIMISATION CRITIQUE: Ne charger que les données complètes correspondant aux items paginés
      let completeData: any[] = [];
      if (immersiveData && immersiveData.length > 0) {
        const itemCodes = immersiveData.map(item => item.item_code);
        console.log('[EDN] Fetching complete data for codes:', itemCodes.slice(0, 5));
        
        const { data, error: completeError } = await supabase
          .from('edn_items_complete')
          .select('id, item_code, title, specialite, completeness_score, is_validated')
          .in('item_code', itemCodes);
          
        console.log('[EDN] Complete data fetched:', {
          dataLength: data?.length,
          error: completeError
        });
        
        completeData = data || [];
      }

      // Ajouter les nouveaux items (append pour pagination)
      const newImmersiveItems = page === 0 ? (immersiveData || []) : [...immersiveItems, ...(immersiveData || [])];
      const newCompleteItems = page === 0 ? (completeData || []) : [...completeItems, ...(completeData || [])];
      
      console.log('[EDN] Setting state:', {
        immersiveLength: newImmersiveItems.length,
        completeLength: newCompleteItems.length
      });
      
      setImmersiveItems(newImmersiveItems);
      setCompleteItems(newCompleteItems);
      
      // Ne pas afficher de toast à chaque pagination
      if (page === 0) {
        toast({
          title: "Interface EDN chargée",
          description: `${immersiveData?.length || 0} premiers items chargés (${count} au total)`,
        });
      }
    } catch (error) {
      console.error('[EDN] Error loading data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setLoadingError(errorMessage);
      toast({
        title: "❌ Erreur de chargement",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Afficher une alerte visible dans la console
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ ERREUR CRITIQUE EDN');
      console.error('Message:', errorMessage);
      console.error('Détails:', error);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } finally {
      console.log('[EDN] fetchAllData complete');
      setLoading(false);
    }
  };

  const allItems = useMemo(() => {
    return immersiveItems.map(immersive => {
      const complete = completeItems.find(c => c.item_code === immersive.item_code);
      return {
        ...immersive,
        ...complete,
        slug: immersive.slug,
        tableau_rang_a: immersive.tableau_rang_a,
        tableau_rang_b: immersive.tableau_rang_b,
        scene_immersive: immersive.scene_immersive,
        quiz_questions: immersive.quiz_questions,
        paroles_musicales: immersive.paroles_musicales
      };
    });
  }, [immersiveItems, completeItems]);

  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    quickFilter,
    setQuickFilter,
    sortBy,
    setSortBy,
    resetAllFilters,
    hasActiveFilters,
    filteredItems
  } = useEdnFilters(allItems);

  const isItemComplete = (item: EdnItem) => {
    return getCompletionPercentage(item) === 100;
  };

  const getCompletionPercentage = (item: EdnItem) => {
    // OPTIMISATION: Utiliser le score pré-calculé de la DB si disponible
    if (item.completeness_score != null) {
      return item.completeness_score;
    }
    
    // Fallback: estimation basée sur les compteurs seulement (métadonnées légères)
    // Impossible de vérifier les détails lourds qui ne sont pas chargés
    const hasRangA = (item.competences_count_rang_a || 0) > 0;
    const hasRangB = (item.competences_count_rang_b || 0) > 0;
    
    // Estimation grossière basée uniquement sur les compteurs
    let score = 0;
    if (hasRangA) score += 40; // Rang A = 40%
    if (hasRangB) score += 40; // Rang B = 40%
    // Les 20% restants (musique, scène, quiz) ne peuvent être vérifiés sans charger les détails
    
    return score;
  };

  const getOldCompletionPercentage = (item: EdnItem) => {
    // Version simplifiée basée sur les compteurs disponibles
    return getCompletionPercentage(item);
  };

  const calculateStats = () => {
    // Utiliser les items chargés pour les stats partielles
    const total = immersiveItems.length;
    const complete = immersiveItems.filter(item => 
      (item.competences_count_rang_a || 0) > 0 && (item.competences_count_rang_b || 0) > 0
    ).length;
    const validated = immersiveItems.filter(item => item.is_validated).length;
    const withMusic = immersiveItems.filter(item => 
      item.completeness_score ? item.completeness_score > 60 : false
    ).length;
    const avgScore = total > 0 ? Math.round(immersiveItems.reduce((sum, item) => 
      sum + (item.completeness_score || getCompletionPercentage(item)), 0) / total) : 0;
    
    return { total, complete, validated, withMusic, avgScore };
  };

  const openItemModal = useCallback((item: EdnItem, tab?: string) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    setSelectedItemTab(tab || 'overview');
  }, []);
  
  const [selectedItemTab, setSelectedItemTab] = useState<string>('overview');

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Chargement des items EDN...</p>
          {loadingError && (
            <Alert variant="destructive" className="max-w-md mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{loadingError}</AlertDescription>
            </Alert>
          )}
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Wrapper Tabs Principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="min-h-screen">
        {/* Header simplifié */}
        <div className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-40">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Interface EDN</h1>
                  <p className="text-sm text-muted-foreground">
                    {stats.total} items {stats.complete > 0 ? `• ${stats.complete} complets` : 'disponibles'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <QuotaIndicator compact />
                <TabsList className="bg-muted">
                  <TabsTrigger value="revision" className="text-xs">📊 Mon Suivi</TabsTrigger>
                  <TabsTrigger value="complete" className="text-xs">📚 Tous les items</TabsTrigger>
                  <TabsTrigger value="immersive" className="text-xs">🎯 Mode Visuel</TabsTrigger>
                  <TabsTrigger value="music" className="text-xs">🎵 Musiques</TabsTrigger>
                  <TabsTrigger value="subscription" className="text-xs">⭐ Premium</TabsTrigger>
                </TabsList>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-4">
        {/* Bannière informative sur l'accès gratuit */}
        <Alert className="mb-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
            <strong className="font-semibold">Accès gratuit illimité aux révisions EDN</strong>
            <div className="mt-1 space-y-1">
              <div>✅ Réviser les 367 items EDN : <strong>GRATUIT ♾️</strong></div>
              <div>✅ Lire tout le contenu (Rang A + B) : <strong>GRATUIT</strong></div>
              <div>✅ Faire les quiz : <strong>GRATUIT</strong></div>
              <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                🎵 Les crédits ({quota || 80}/160) servent uniquement à <strong>générer des musiques IA personnalisées</strong>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Indicateur de chargement */}
        <div className="mb-4 flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {immersiveItems.length} / {totalCount || '...'} items
            </Badge>
            <span className="text-sm text-muted-foreground">
              {filteredItems.length !== immersiveItems.length && (
                <span>({filteredItems.length} filtrés)</span>
              )}
            </span>
          </div>
          {hasMore && (
            <Badge variant="secondary" className="text-xs">
              Scroll pour charger plus
            </Badge>
          )}
        </div>

        {/* Filtres rapides */}
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <Badge 
            variant={quickFilter === 'all' ? 'default' : 'outline'}
            className="cursor-pointer transition-all hover:scale-105"
            onClick={() => setQuickFilter('all')}
          >
            Tous ({allItems.length})
          </Badge>
          <Badge 
            variant={quickFilter === 'complete' ? 'default' : 'outline'}
            className="cursor-pointer transition-all hover:scale-105"
            onClick={() => setQuickFilter('complete')}
          >
            ✅ Complets ({allItems.filter(i => (i.competences_count_rang_a || 0) > 0 && (i.competences_count_rang_b || 0) > 0).length})
          </Badge>
          <Badge 
            variant={quickFilter === 'incomplete' ? 'default' : 'outline'}
            className="cursor-pointer transition-all hover:scale-105"
            onClick={() => setQuickFilter('incomplete')}
          >
            ⏳ Incomplets ({allItems.filter(i => !((i.competences_count_rang_a || 0) > 0 && (i.competences_count_rang_b || 0) > 0)).length})
          </Badge>
          <Badge 
            variant={quickFilter === 'validated' ? 'default' : 'outline'}
            className="cursor-pointer transition-all hover:scale-105"
            onClick={() => setQuickFilter('validated')}
          >
            ⭐ Validés ({allItems.filter(i => i.is_validated).length})
          </Badge>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAllFilters}
              className="ml-auto gap-2 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" />
              Réinitialiser
            </Button>
          )}
        </div>

        {/* Contrôles */}
        <div className="flex flex-col gap-3 mb-6">
           <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher un item (ex: IC-1, Cardiologie...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 items-center justify-between">
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="complete">Complets</SelectItem>
                  <SelectItem value="withMusic">Avec musique</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="item_code">Code</SelectItem>
                  <SelectItem value="completeness_score">Score</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/learning-dashboard')}
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

          <TabsContent value="immersive">
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ 
                        duration: 0.3,
                        delay: Math.min(index * 0.03, 0.5),
                        ease: "easeOut"
                      }}
                      layout
                    >
                      <EdnItemCard
                        key={item.id}
                        item={item}
                        completionPercentage={getCompletionPercentage(item)}
                        onOpen={(tab) => openItemModal(item, tab)}
                      />
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
              
              {/* Bouton Charger Plus */}
              {hasMore && !loading && (
                <div className="flex justify-center pt-4">
                  <Button 
                    onClick={() => setPage(prev => prev + 1)}
                    variant="outline"
                    size="lg"
                    className="min-w-[200px]"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Charger plus d'items
                  </Button>
                </div>
              )}
              
              {loading && page > 0 && (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="complete">
            <div className="space-y-6">
              {/* FAQ Section */}
              <FaqSection />

              {/* Liste des items avec EdnItemCard premium */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map(item => (
                    <EdnItemCard
                      key={item.id}
                      item={item}
                      completionPercentage={item.completeness_score || getCompletionPercentage(item)}
                      onOpen={(tab) => openItemModal(item, tab)}
                    />
                  ))}
                </div>
                
                {/* Bouton Charger Plus */}
                {hasMore && !loading && (
                  <div className="flex justify-center pt-4">
                    <Button 
                      onClick={() => setPage(prev => prev + 1)}
                      variant="outline"
                      size="lg"
                      className="min-w-[200px]"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Charger plus d'items
                    </Button>
                  </div>
                )}
                
                {loading && page > 0 && (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
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
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Music className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Musique IA</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Générez des chansons mnémotechniques personnalisées
                      </p>
                      <p className="text-xs mt-2 text-blue-600">
                        Coût: 5 crédits par génération
                      </p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-5 w-5 text-green-600" />
                        <span className="font-medium">QCM IA</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Créez des QCM adaptatifs intelligents
                      </p>
                      <p className="text-xs mt-2 text-green-600">
                        Coût: 2 crédits par QCM
                      </p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">Bandes Dessinées</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Transformez les concepts en BD éducatives
                      </p>
                      <p className="text-xs mt-2 text-purple-600">
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

        {filteredItems.length === 0 && (
          <Card className="text-center py-8">
            <CardContent>
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Aucun résultat</h3>
              <p className="text-sm text-muted-foreground">
                Aucun item ne correspond à vos critères.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

        {/* Modal */}
        <EdnItemModal
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialTab={selectedItemTab}
        />
      </Tabs>
    </div>
  );
}