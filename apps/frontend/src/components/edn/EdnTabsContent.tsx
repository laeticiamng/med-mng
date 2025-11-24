import React, { lazy, Suspense } from 'react';
import { Sparkles } from 'lucide-react';
import { TabsContent } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { EdnItemsGrid } from './EdnItemsGrid';
import { QuotaIndicator } from '@/components/quota/QuotaIndicator';
import type { EdnItemUnified } from '@shared/types/edn';

// 🚀 LAZY LOADING - Composants non-critiques chargés à la demande
const RevisionDashboard = lazy(() => import('@/components/revision/RevisionDashboard').then(m => ({ default: m.RevisionDashboard })));
const RevisionGuide = lazy(() => import('@/components/edn/RevisionGuide').then(m => ({ default: m.RevisionGuide })));
const FaqSection = lazy(() => import('@/components/help/FaqSection').then(m => ({ default: m.FaqSection })));
const LyricsCompletionStatus = lazy(() => import('@/components/LyricsCompletionStatus').then(m => ({ default: m.LyricsCompletionStatus })));
const PricingPlans = lazy(() => import('@/components/med-mng/PricingPlans').then(m => ({ default: m.PricingPlans })));

interface EdnTabsContentProps {
  filteredItems: EdnItemUnified[];
  onOpenItem: (item: EdnItemUnified, tab?: string) => void;
  onPrefetch?: (itemCode: string) => void;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  page: number;
  quota: number | null;
  subscription: any;
}

// Composant de chargement réutilisable
const TabLoadingFallback = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
);

export const EdnTabsContent: React.FC<EdnTabsContentProps> = ({
  filteredItems,
  onOpenItem,
  onPrefetch,
  hasMore,
  loading,
  onLoadMore,
  page,
  quota,
  subscription
}) => {
  return (
    <>
      {/* Tab: Révision */}
      <TabsContent value="revision">
        <Suspense fallback={<TabLoadingFallback />}>
          <div className="space-y-6">
            <RevisionGuide />
            <RevisionDashboard />
          </div>
        </Suspense>
      </TabsContent>

      {/* Tab: Mode Visuel (Immersive) */}
      <TabsContent value="immersive">
        <div className="space-y-6">
          <EdnItemsGrid
            items={filteredItems}
            onOpenItem={onOpenItem}
            onPrefetch={onPrefetch}
            hasMore={hasMore}
            loading={loading && page > 0}
            onLoadMore={onLoadMore}
            showAnimations={true}
          />
        </div>
      </TabsContent>

      {/* Tab: Tous les items (Complete) */}
      <TabsContent value="complete">
        <Suspense fallback={<TabLoadingFallback />}>
          <div className="space-y-6">
            <FaqSection />
            <EdnItemsGrid
              items={filteredItems}
              onOpenItem={onOpenItem}
              onPrefetch={onPrefetch}
              hasMore={hasMore}
              loading={loading && page > 0}
              onLoadMore={onLoadMore}
              showAnimations={false}
            />
          </div>
        </Suspense>
      </TabsContent>

      {/* Tab: Musiques */}
      <TabsContent value="music">
        <Suspense fallback={<TabLoadingFallback />}>
          <LyricsCompletionStatus />
        </Suspense>
      </TabsContent>

      {/* Tab: Premium/Subscription */}
      <TabsContent value="subscription">
        <Suspense fallback={<TabLoadingFallback />}>
          <div className="space-y-6">
            {/* Quota Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <QuotaIndicator showDetails />
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex flex-col space-y-1.5 p-6">
                  <h3 className="text-2xl font-semibold leading-none tracking-tight">Plan actuel</h3>
                  <p className="text-sm text-muted-foreground">Votre abonnement et fonctionnalités</p>
                </div>
                <div className="p-6 pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Plan</span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        subscription?.is_premium 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary text-secondary-foreground'
                      }`}>
                        {subscription?.is_premium ? "Premium ⭐" : "Gratuit"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Crédits IA</span>
                      <span className="text-sm text-muted-foreground">{quota || 80}/160</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Génération musique</span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        subscription?.can_generate_music
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-destructive text-destructive-foreground'
                      }`}>
                        {subscription?.can_generate_music ? "✅ Actif" : "❌ Épuisé"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Plans */}
            <PricingPlans />
          </div>
        </Suspense>
      </TabsContent>
    </>
  );
};
