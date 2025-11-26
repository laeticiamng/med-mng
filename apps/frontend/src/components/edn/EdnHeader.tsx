import React from 'react';
import { BookOpen } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuotaIndicator } from '@/components/quota/QuotaIndicator';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface EdnHeaderProps {
  totalItems: number;
  completeItems: number;
  /**
   * When true (default), the component provides its own Tabs context so it can be
   * rendered in isolation (tests, standalone usage). When false, it expects to be
   * rendered inside an existing <Tabs> provider (e.g. the main EDN page).
   */
  withTabsProvider?: boolean;
}

export const EdnHeader: React.FC<EdnHeaderProps> = ({
  totalItems,
  completeItems,
  withTabsProvider = true,
}) => {
  const content = (
    <div
      data-testid="edn-header"
      className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-40"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Interface EDN</h1>
              <p className="text-sm text-muted-foreground">
                {totalItems} items{' '}
                {completeItems > 0 ? `• ${completeItems} complets` : 'disponibles'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <QuotaIndicator compact />
            <TabsList className="bg-muted">
              <TabsTrigger value="revision" className="text-xs">
                📊 Mon Suivi
              </TabsTrigger>
              <TabsTrigger value="complete" className="text-xs">
                📚 Tous les items
              </TabsTrigger>
              <TabsTrigger value="immersive" className="text-xs">
                🎯 Mode Visuel
              </TabsTrigger>
              <TabsTrigger value="music" className="text-xs">
                🎵 Musiques
              </TabsTrigger>
              <TabsTrigger value="subscription" className="text-xs">
                ⭐ Premium
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
      </div>
    </div>
  );

  if (!withTabsProvider) {
    return content;
  }

  return (
    <Tabs defaultValue="complete" className="w-full">
      {content}
    </Tabs>
  );
};
