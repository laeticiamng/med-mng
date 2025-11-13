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
import { useEdnItems, useFullEdnItem, usePrefetchFullItem, useRefreshEdnView } from "@/hooks/useEdnItems";
import { useEdnModal } from "@/hooks/useEdnModal";
import { getCompletionPercentage, calculateItemsStats } from "@/utils/completionScore";
import { 
  EdnItem, 
  EdnItemUnified, 
  EdnModalState, 
  INITIAL_MODAL_STATE 
} from "@/types/edn";

export default function EdnComplete() {
  // ============================================
  // État refactorisé (Quick Win #3 + Phase 2)
  // ============================================
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('immersive');
  const [showPricing, setShowPricing] = useState(false);
  
  // Modal refactorisé avec hook dédié (Quick Win #3)
  const { modalState, openModal, closeModal } = useEdnModal();
  
  const { quota } = useIAQuota();
  const { subscription, canGenerateMusic } = useSubscription();
  
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  // ============================================
  // React Query pour chargement optimisé (Phase 2)
  // ============================================
  const { data: pageData, isLoading: loading, error: queryError, refetch } = useEdnItems(page);
  const { mutate: refreshView } = useRefreshEdnView();
  const prefetchItem = usePrefetchFullItem();
  
  const unifiedItems = useMemo(() => {
    if (!pageData) return [];
    // Accumuler les pages précédentes si on pagine
    // Pour l'instant on retourne juste la page actuelle
    return pageData.items;
  }, [pageData]);
  
  const totalCount = pageData?.count || 0;
  const hasMore = unifiedItems.length < totalCount;
  const loadingError = queryError ? String(queryError) : null;

  // Ouvrir automatiquement la modal si un slug est présent dans l'URL
  useEffect(() => {
    if (slug && unifiedItems.length > 0) {
      const normalizedSlug = slug.toLowerCase();
      const unifiedItem = unifiedItems.find(
        i => i.slug?.toLowerCase() === normalizedSlug || 
             i.item_code.toLowerCase() === normalizedSlug
      );
      if (unifiedItem) {
        // Charger l'item complet depuis immersive puis ouvrir modal
        fetchFullItem(unifiedItem.item_code);
      }
    }
  }, [slug, unifiedItems]);

  // ============================================
  // Fonction pour charger un item complet (Quick Win #1 + #2)
  // ============================================
  const fetchFullItem = async (itemCode: string) => {
    try {
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .eq('item_code', itemCode)
        .single();
      
      if (error) throw error;
      if (data) {
        // Cast prudent: les types DB peuvent ne pas correspondre exactement
        openModal(data as unknown as EdnItem);
      }
    } catch (error) {
      console.error('[EDN] Error loading full item:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'item complet.",
        variant: "destructive"
      });
    }
  };

  // Pas besoin de fusionner immersiveItems et completeItems, on utilise directement unifiedItems
  const allItems = unifiedItems;

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

  const isItemComplete = (item: EdnItemUnified) => {
    return getCompletionPercentage(item) === 100;
  };

  const getOldCompletionPercentage = (item: EdnItemUnified) => {
    // Version simplifiée basée sur les compteurs disponibles
    return getCompletionPercentage(item);
  };

  const calculateStats = () => {
    return calculateItemsStats(unifiedItems);
  };

  // Callback pour les cartes: charger l'item complet puis ouvrir
  const handleOpenItem = useCallback(async (unifiedItem: EdnItemUnified, tab?: string) => {
    try {
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .eq('item_code', unifiedItem.item_code)
        .single();
      
      if (error) throw error;
      if (data) {
        openModal(data as unknown as EdnItem, tab);
      }
    } catch (error) {
      console.error('[EDN] Error loading full item:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'item complet.",
        variant: "destructive"
      });
    }
  }, [openModal, toast]);
  
  // ⚡ PREFETCH: Précharge l'item au survol pour ouverture instantanée
  const handlePrefetchItem = useCallback((itemCode: string) => {
    prefetchItem(itemCode);
  }, [prefetchItem]);

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
              {unifiedItems.length} / {totalCount || '...'} items
            </Badge>
            <span className="text-sm text-muted-foreground">
              {filteredItems.length !== unifiedItems.length && (
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
            Tous ({filteredItems.length})
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
                        item={item as any}
                        completionPercentage={getCompletionPercentage(item)}
                        onOpen={(tab) => handleOpenItem(item, tab)}
                        onPrefetch={handlePrefetchItem}
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
                      item={item as any}
                      completionPercentage={item.completeness_score || getCompletionPercentage(item)}
                      onOpen={(tab) => handleOpenItem(item, tab)}
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

        {/* Modal avec état refactorisé (Quick Win #3) */}
        <EdnItemModal
          item={modalState.item}
          isOpen={modalState.isOpen}
          onClose={closeModal}
          initialTab={modalState.activeTab}
        />
      </Tabs>
    </div>
  );
}