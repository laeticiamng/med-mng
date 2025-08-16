import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, BookOpen, Filter, Grid, List, Music, Brain, Zap, 
  TrendingUp, CheckCircle, Award, Users
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEdnItemsPaginated, useEdnStats, EdnItemLight } from '@/hooks/useEdnItemsPaginated';
import { EdnItemGrid } from '@/components/edn/EdnItemGrid';
import { useIsMobile } from "@/hooks/use-mobile";
import { GlobalLyricsManager } from '@/components/edn/GlobalLyricsManager';

// Composants lazy pour les onglets non-critiques
const LyricsCompletionStatus = React.lazy(() => 
  import("@/components/LyricsCompletionStatus").then(module => ({ default: module.LyricsCompletionStatus }))
);
const RevisionDashboard = React.lazy(() => 
  import("@/components/revision/RevisionDashboard").then(module => ({ default: module.RevisionDashboard }))
);
const PricingPlans = React.lazy(() => 
  import("@/components/med-mng/PricingPlans").then(module => ({ default: module.PricingPlans }))
);
const UpdateAllLyricsButton = React.lazy(() => 
  import("@/components/edn/UpdateAllLyricsButton").then(module => ({ default: module.UpdateAllLyricsButton }))
);
// SyncAllItemsButton supprimé - navigation globale gère maintenant les actions
const QuotaIndicator = React.lazy(() => 
  import("@/components/quota/QuotaIndicator").then(module => ({ default: module.QuotaIndicator }))
);

export default function EdnComplete() {
  // États principaux
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('immersive');
  const [selectedItem, setSelectedItem] = useState<EdnItemLight | null>(null);
  const [showLyricsManager, setShowLyricsManager] = useState(false);

  const isMobile = useIsMobile();
  const itemsPerPage = isMobile ? 8 : 20;

  // Hooks optimisés
  const { items, totalCount, loading, totalPages, refetch } = useEdnItemsPaginated(currentPage, itemsPerPage);
  const { stats, loading: statsLoading } = useEdnStats();

  // Gestion du clic sur un item
  const handleItemClick = (item: EdnItemLight) => {
    setSelectedItem(item);
    // Navigation directe vers l'item via react-router
    window.location.href = `/edn/${item.slug}`;
  };

  // Reset de la page lors des changements de filtre
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header Premium Style */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Interface EDN</h1>
                <p className="text-slate-600 font-medium">
                  {!statsLoading && `${stats.total} items • Page ${currentPage}/${totalPages}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <React.Suspense fallback={<div className="w-8 h-6 bg-slate-200 rounded animate-pulse"></div>}>
                <QuotaIndicator compact />
              </React.Suspense>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                 <TabsList className="bg-white/60 backdrop-blur-sm border border-white/30 shadow-lg rounded-xl p-1">
                   <TabsTrigger value="immersive" className="text-sm font-medium rounded-lg">Immersif</TabsTrigger>
                   <TabsTrigger value="music" className="text-sm font-medium rounded-lg">Paroles</TabsTrigger>
                   <TabsTrigger value="revision" className="text-sm font-medium rounded-lg">Révisions</TabsTrigger>
                   <TabsTrigger value="subscription" className="text-sm font-medium rounded-lg">Abonnement</TabsTrigger>
                 </TabsList>
               </Tabs>
                <Button 
                  onClick={() => setShowLyricsManager(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                  size="sm"
                >
                  <Music className="h-4 w-4 mr-2" />
                  Paroles Globales
                </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Statistiques rapides */}
        {!statsLoading && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-blue-700">Items Total</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.complete}</div>
                <div className="text-sm text-green-700">Complets</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.withMusic}</div>
                <div className="text-sm text-purple-700">Avec Paroles</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.validated}</div>
                <div className="text-sm text-orange-700">Validés</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600">{stats.avgScore}%</div>
                <div className="text-sm text-indigo-700">Score Moy.</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contrôles de filtrage */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher par titre ou code..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-white/80"
            />
          </div>

          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[140px] bg-white/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="complete">Complets</SelectItem>
                <SelectItem value="withMusic">Avec paroles</SelectItem>
                <SelectItem value="validated">Validés</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-1 border rounded-md bg-white/80">
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

        {/* Contenu des onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="immersive">
            <EdnItemGrid
              items={items}
              loading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onItemClick={handleItemClick}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
            />
          </TabsContent>
          
           <TabsContent value="music">
             <React.Suspense fallback={<div className="text-center py-8">Chargement...</div>}>
               <div className="space-y-6">
                 {showLyricsManager ? (
                   <div>
                     <Button 
                       onClick={() => setShowLyricsManager(false)}
                       variant="outline"
                       className="mb-4"
                     >
                       ← Retour aux paroles
                     </Button>
                     <GlobalLyricsManager />
                   </div>
                 ) : (
                   <>
                     <div className="flex gap-4 mb-6">
                       <Button 
                         onClick={() => setShowLyricsManager(true)}
                         className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                       >
                         <Music className="h-4 w-4 mr-2" />
                         Gestionnaire Paroles Global
                       </Button>
                     </div>
                     <UpdateAllLyricsButton />
                     <LyricsCompletionStatus />
                   </>
                 )}
               </div>
             </React.Suspense>
           </TabsContent>
          
          <TabsContent value="revision">
            <React.Suspense fallback={<div className="text-center py-8">Chargement...</div>}>
              <RevisionDashboard />
            </React.Suspense>
          </TabsContent>
          
          <TabsContent value="subscription">
            <React.Suspense fallback={<div className="text-center py-8">Chargement...</div>}>
              <PricingPlans />
            </React.Suspense>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}