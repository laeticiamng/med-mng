import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  
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
    // Navigation SPA optimisée avec React Router
    navigate(`/edn/${item.slug}`);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-indigo-900/95 relative">
      {/* Suno-style aura effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header Suno-inspired */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 shadow-2xl shadow-purple-500/10">
        <div className="container mx-auto px-6 py-6 relative">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50 relative">
                <BookOpen className="h-8 w-8 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-3xl blur animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-2">
                  EDN Interface Musicale
                </h1>
                <p className="text-gray-300 text-lg">
                  {!statsLoading && `${stats.total} items médicaux • Page ${currentPage}/${totalPages} • Génération IA`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-green-400/30">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-green-300 text-sm font-medium">Interface Complète Active</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-purple-400/30">
                <Music className="h-4 w-4 text-purple-400" />
                <span className="text-purple-300 text-sm font-medium">Génération Musicale IA</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <React.Suspense fallback={<div className="w-8 h-6 bg-white/10 rounded animate-pulse"></div>}>
                <QuotaIndicator compact />
              </React.Suspense>
            </div>
            
            <div className="flex items-center gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-black/40 backdrop-blur-sm border border-white/20 shadow-2xl rounded-2xl p-1">
                  <TabsTrigger value="immersive" className="text-sm font-medium rounded-xl text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
                    🎵 Immersif
                  </TabsTrigger>
                  <TabsTrigger value="music" className="text-sm font-medium rounded-xl text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
                    🎼 Paroles
                  </TabsTrigger>
                  <TabsTrigger value="revision" className="text-sm font-medium rounded-xl text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
                    📚 Révisions
                  </TabsTrigger>
                  <TabsTrigger value="subscription" className="text-sm font-medium rounded-xl text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
                    ⭐ Premium
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button 
                onClick={() => setShowLyricsManager(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-2xl shadow-purple-500/50 border border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                size="sm"
              >
                <Music className="h-4 w-4 mr-2" />
                Paroles Globales
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 relative">
        {/* Statistiques style Suno */}
        {!statsLoading && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-white/10 backdrop-blur-sm border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 shadow-xl shadow-blue-500/20 group">
              <CardContent className="p-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-3xl font-bold text-blue-400 mb-1">{stats.total}</div>
                  <div className="text-sm text-blue-300">Items Total</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border border-green-400/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105 shadow-xl shadow-green-500/20 group">
              <CardContent className="p-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-3xl font-bold text-green-400 mb-1">{stats.complete}</div>
                  <div className="text-sm text-green-300">Complets</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 shadow-xl shadow-purple-500/20 group">
              <CardContent className="p-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-3xl font-bold text-purple-400 mb-1">{stats.withMusic}</div>
                  <div className="text-sm text-purple-300">Avec Paroles</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border border-orange-400/30 hover:border-orange-400/50 transition-all duration-300 hover:scale-105 shadow-xl shadow-orange-500/20 group">
              <CardContent className="p-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-3xl font-bold text-orange-400 mb-1">{stats.validated}</div>
                  <div className="text-sm text-orange-300">Validés</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border border-indigo-400/30 hover:border-indigo-400/50 transition-all duration-300 hover:scale-105 shadow-xl shadow-indigo-500/20 group">
              <CardContent className="p-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-3xl font-bold text-indigo-400 mb-1">{stats.avgScore}%</div>
                  <div className="text-sm text-indigo-300">Score Moy.</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contrôles de filtrage style Suno */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Rechercher par titre ou code medical..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-12 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 h-12 text-lg rounded-xl"
            />
          </div>

          <div className="flex gap-3">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[160px] bg-white/10 border-white/20 text-white h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/20 backdrop-blur-xl">
                <SelectItem value="all" className="text-white hover:bg-white/10">🎯 Tous</SelectItem>
                <SelectItem value="complete" className="text-white hover:bg-white/10">✅ Complets</SelectItem>
                <SelectItem value="withMusic" className="text-white hover:bg-white/10">🎵 Avec paroles</SelectItem>
                <SelectItem value="validated" className="text-white hover:bg-white/10">⭐ Validés</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-1 border border-white/20 rounded-xl bg-white/10">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`rounded-r-none h-12 px-4 ${viewMode === 'grid' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`rounded-l-none h-12 px-4 ${viewMode === 'list' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
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