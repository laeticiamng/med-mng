import React from 'react';
import { Sparkles } from 'lucide-react';
import { TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuotaIndicator } from "@/components/quota/QuotaIndicator";
import { PricingPlans } from "@/components/med-mng/PricingPlans";
import { RevisionDashboard } from "@/components/revision/RevisionDashboard";
import { RevisionGuide } from "@/components/edn/RevisionGuide";
import { LyricsCompletionStatus } from "@/components/LyricsCompletionStatus";
import { FaqSection } from "@/components/help/FaqSection";
import { EdnItemsGrid } from './EdnItemsGrid';
import type { EdnItemUnified } from '@/types/edn';

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
        <div className="space-y-6">
          <RevisionGuide />
          <RevisionDashboard />
        </div>
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
      </TabsContent>

      {/* Tab: Musiques */}
      <TabsContent value="music">
        <LyricsCompletionStatus />
      </TabsContent>

      {/* Tab: Premium/Subscription */}
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
                    <span className="text-sm font-medium">Plan</span>
                    <Badge variant={subscription?.is_premium ? "default" : "secondary"}>
                      {subscription?.is_premium ? "Premium ⭐" : "Gratuit"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Crédits IA</span>
                    <span className="text-sm text-muted-foreground">{quota || 80}/160</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Génération musique</span>
                    <Badge variant={subscription?.can_generate_music ? "default" : "destructive"}>
                      {subscription?.can_generate_music ? "✅ Actif" : "❌ Épuisé"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Plans */}
          <PricingPlans />
        </div>
      </TabsContent>
    </>
  );
};
