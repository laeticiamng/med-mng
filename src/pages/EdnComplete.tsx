import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sparkles, AlertTriangle } from 'lucide-react';
import { Tabs } from "@/components/ui/tabs";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EdnItemModal } from "@/components/edn/premium/EdnItemModal";
import { EdnHeader } from "@/components/edn/EdnHeader";
import { EdnFilters } from "@/components/edn/EdnFilters";
import { EdnTabsContent } from "@/components/edn/EdnTabsContent";
import { useIAQuota } from "@/hooks/useIAQuota";
import { useSubscription } from "@/hooks/useSubscription";
import { useEdnFilters } from "@/hooks/useEdnFilters";
import { useEdnItems, usePrefetchFullItem } from "@/hooks/useEdnItems";
import { useEdnModal } from "@/hooks/useEdnModal";
import { calculateItemsStats } from "@/utils/completionScore";
import { useTrackSearch, useTrackItemView } from "@/hooks/useEdnAnalytics";
import { usePerformanceMetrics, usePageLoadTime } from "@/hooks/usePerformanceMetrics";
import { useTrendingDetection } from "@/hooks/useTrendingDetection";
import type { EdnItem, EdnItemUnified } from "@/types/edn";

export default function EdnComplete() {
  // ============================================
  // ÉTAT PRINCIPAL
  // ============================================
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('immersive');
  
  const { modalState, openModal, closeModal } = useEdnModal();
  const { quota } = useIAQuota();
  const { subscription } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  // ============================================
  // DATA FETCHING (React Query)
  // ============================================
  const { data: pageData, isLoading: loading, error: queryError } = useEdnItems(page);
  const prefetchItem = usePrefetchFullItem();
  
  // ============================================
  // ANALYTICS & PERFORMANCE
  // ============================================
  const trackSearchTerm = useTrackSearch();
  useTrackItemView(modalState.item?.item_code || null);
  usePageLoadTime('EdnComplete');
  usePerformanceMetrics();
  useTrendingDetection({
    checkInterval: 5 * 60 * 1000,
    viewThreshold: 10,
    searchThreshold: 5,
  });
  
  // ============================================
  // DONNÉES ET ÉTATS DÉRIVÉS
  // ============================================
  const unifiedItems = useMemo(() => {
    if (!pageData) return [];
    return pageData.items;
  }, [pageData]);
  
  const totalCount = pageData?.count || 0;
  const hasMore = unifiedItems.length < totalCount;
  const loadingError = queryError ? String(queryError) : null;
  const stats = calculateItemsStats(unifiedItems);

  // ============================================
  // FILTRES
  // ============================================
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    resetAllFilters,
    hasActiveFilters,
    filteredItems
  } = useEdnFilters(unifiedItems);
  
  // Tracker les recherches
  useEffect(() => {
    if (searchTerm.trim()) {
      trackSearchTerm(searchTerm, filteredItems.length);
    }
  }, [searchTerm, filteredItems.length, trackSearchTerm]);

  // ============================================
  // HANDLERS
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
  
  const handlePrefetchItem = useCallback((itemCode: string) => {
    prefetchItem(itemCode);
  }, [prefetchItem]);

  const handleLoadMore = () => setPage(prev => prev + 1);

  // Ouvrir automatiquement la modal si slug présent dans URL
  useEffect(() => {
    if (slug && unifiedItems.length > 0) {
      const normalizedSlug = slug.toLowerCase();
      const unifiedItem = unifiedItems.find(
        i => i.slug?.toLowerCase() === normalizedSlug || 
             i.item_code.toLowerCase() === normalizedSlug
      );
      if (unifiedItem) {
        fetchFullItem(unifiedItem.item_code);
      }
    }
  }, [slug, unifiedItems]);

  // ============================================
  // RENDU - LOADING
  // ============================================
  if (loading && page === 0) {
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

  // ============================================
  // RENDU PRINCIPAL
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="min-h-screen">
        {/* Header */}
        <EdnHeader 
          totalItems={stats.total} 
          completeItems={stats.complete} 
        />

        <div className="container mx-auto px-6 py-4">
          {/* Bannière informative */}
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

          {/* Filtres */}
          <EdnFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
            hasActiveFilters={hasActiveFilters}
            resetAllFilters={resetAllFilters}
          />

          {/* Contenu des tabs */}
          <EdnTabsContent
            filteredItems={filteredItems}
            onOpenItem={handleOpenItem}
            onPrefetch={handlePrefetchItem}
            hasMore={hasMore}
            loading={loading}
            onLoadMore={handleLoadMore}
            page={page}
            quota={quota}
            subscription={subscription}
          />
        </div>
      </Tabs>

      {/* Modal */}
      {modalState.isOpen && modalState.item && (
        <EdnItemModal
          item={modalState.item}
          isOpen={modalState.isOpen}
          onClose={closeModal}
          initialTab={modalState.activeTab}
        />
      )}
    </div>
  );
}
