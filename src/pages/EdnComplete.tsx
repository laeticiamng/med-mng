import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, BookOpen, Award, Users, TrendingUp, Filter, Grid, List, Eye,
  Music, Brain, Play, Headphones, CheckCircle, Sparkles, ArrowRight,
  Volume2, Gamepad2, Maximize2, Star, Target, Image, FileText, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

// Lazy loading pour les composants moins critiques
const AppleStyleItemModalFixed = React.lazy(() => 
  import("@/components/edn/premium/AppleStyleItemModalFixed").then(module => ({ default: module.AppleStyleItemModalFixed }))
);
const EdnItemCard = React.lazy(() => 
  import("@/components/edn/premium/EdnItemCard").then(module => ({ default: module.EdnItemCard }))
);
const LyricsCompletionStatus = React.lazy(() => 
  import("@/components/LyricsCompletionStatus").then(module => ({ default: module.LyricsCompletionStatus }))
);
const RevisionDashboard = React.lazy(() => 
  import("@/components/revision/RevisionDashboard").then(module => ({ default: module.RevisionDashboard }))
);
const QuotaIndicator = React.lazy(() => 
  import("@/components/quota/QuotaIndicator").then(module => ({ default: module.QuotaIndicator }))
);
const PricingPlans = React.lazy(() => 
  import("@/components/med-mng/PricingPlans").then(module => ({ default: module.PricingPlans }))
);
const GenerateAllLyricsButton = React.lazy(() => 
  import("@/components/edn/GenerateAllLyricsButton").then(module => ({ default: module.GenerateAllLyricsButton }))
);
const LyricsGenerationManager = React.lazy(() => 
  import("@/components/edn/LyricsGenerationManager").then(module => ({ default: module.LyricsGenerationManager }))
);

// Import direct des hooks essentiels
import { useIAQuota } from "@/hooks/useIAQuota";
import { useSubscription } from "@/hooks/useSubscription";

// Lazy loading du composant de synchronisation
const SyncEdnButton = React.lazy(() => 
  import("@/components/edn/SyncEdnButton").then(module => ({ default: module.SyncEdnButton }))
);
const SyncAllItemsButton = React.lazy(() => 
  import("@/components/edn/SyncAllItemsButton").then(module => ({ default: module.SyncAllItemsButton }))
);
const UpdateAllLyricsButton = React.lazy(() => 
  import("@/components/edn/UpdateAllLyricsButton").then(module => ({ default: module.UpdateAllLyricsButton }))
);

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
  // États essentiels seulement
  const [immersiveItems, setImmersiveItems] = useState<EdnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'item_code' | 'completeness_score' | 'updated_at'>('item_code');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [selectedItem, setSelectedItem] = useState<EdnItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('immersive');
  const [showPricing, setShowPricing] = useState(false);
  
  // Hooks optimisés avec chargement différé
  const { quota } = useIAQuota();
  const { subscription, canGenerateMusic } = useSubscription();
  
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();


  // Charger tous les items en une seule fois pour éviter les duplications
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);

      // Requête pour charger TOUS les items en une seule fois
      const { data, error } = await supabase
        .from('edn_items_complete')
        .select(`
          id, item_code, title, subtitle, slug,
          paroles_musicales, scene_immersive, quiz_questions,
          tableau_rang_a, tableau_rang_b,
          completeness_score, updated_at, specialite,
          competences_count_rang_a, competences_count_rang_b,
          competences_count_total, is_validated, mots_cles
        `)
        .order('item_code');

      if (error) {
        console.error('Erreur:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données.",
          variant: "destructive"
        });
        return;
      }

      console.log(`✅ ${data?.length || 0} items EDN chargés`);
      setImmersiveItems(data || []);
      
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Chargement initial unique
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Fonctions de calcul optimisées avec memoization
  const isItemComplete = useCallback((item: EdnItem) => {
    const hasRangA = !!item.tableau_rang_a;
    const hasRangB = !!item.tableau_rang_b;
    const hasMusic = !!(item.paroles_musicales && item.paroles_musicales.length > 0);
    const hasScene = !!item.scene_immersive;
    const hasQuiz = !!item.quiz_questions;
    return hasRangA && hasRangB && hasMusic && hasScene && hasQuiz;
  }, []);

  const getCompletionPercentage = useCallback((item: EdnItem) => {
    if (item.completeness_score) return item.completeness_score;
    
    const features = [
      !!item.tableau_rang_a,
      !!item.tableau_rang_b,
      !!(item.paroles_musicales && item.paroles_musicales.length > 0),
      !!item.scene_immersive,
      !!item.quiz_questions
    ];
    return Math.round((features.filter(Boolean).length / features.length) * 100);
  }, []);

  // Filtrage optimisé avec useMemo
  const filteredItems = useMemo(() => {
    return immersiveItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.item_code.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (selectedCategory === 'all') return matchesSearch;
      
      const matchesCategory = (() => {
        switch (selectedCategory) {
          case 'complete':
            return isItemComplete(item);
          case 'withMusic':
            return item.paroles_musicales && item.paroles_musicales.length > 0;
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
  }, [immersiveItems, searchTerm, selectedCategory, sortBy, isItemComplete, getCompletionPercentage]);

  // Pagination optimisée
  const { totalPages, paginatedItems } = useMemo(() => {
    const total = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filteredItems.slice(startIndex, endIndex);
    
    return { totalPages: total, paginatedItems: paginated };
  }, [filteredItems, currentPage, itemsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  // Stats optimisées
  const stats = useMemo(() => {
    const total = immersiveItems.length;
    const complete = immersiveItems.filter(isItemComplete).length;
    const validated = immersiveItems.filter(item => item.is_validated).length;
    const withMusic = immersiveItems.filter(item => item.paroles_musicales && item.paroles_musicales.length > 0).length;
    const avgScore = total > 0 ? Math.round(immersiveItems.reduce((sum, item) => 
      sum + getCompletionPercentage(item), 0) / total) : 0;
    
    return { total, complete, validated, withMusic, avgScore };
  }, [immersiveItems, isItemComplete, getCompletionPercentage]);

  const openItemModal = useCallback((item: EdnItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header Premium Style Apple */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Interface EDN</h1>
                <p className="text-slate-600 font-medium">{stats.total} items • Page {currentPage}/{totalPages} • {paginatedItems.length} affichés</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <React.Suspense fallback={<div className="w-8 h-6 bg-slate-200 rounded animate-pulse"></div>}>
                <QuotaIndicator compact />
              </React.Suspense>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-white/60 backdrop-blur-sm border border-white/30 shadow-lg rounded-xl p-1">
                  <TabsTrigger value="immersive" className="text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">Immersif</TabsTrigger>
                  <TabsTrigger value="complete" className="text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">Complet</TabsTrigger>
                  <TabsTrigger value="music" className="text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">Paroles</TabsTrigger>
                  <TabsTrigger value="revision" className="text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">Révisions</TabsTrigger>
                  <TabsTrigger value="subscription" className="text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">Abonnement</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-4">
        {/* Contrôles */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher..."
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

        {/* Contenu des onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="immersive">
            <div className="grid gap-4">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                  {paginatedItems.map(item => (
                    <Card 
                      key={item.id} 
                      className="group cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden hover:-translate-y-2"
                      onClick={() => openItemModal(item)}
                    >
                      <CardContent className="p-0">
                        <div className="p-8 space-y-6">
                          {/* Header avec numéro item style Apple */}
                          <div className="flex items-center justify-between">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-500">
                              <span className="text-white font-bold text-lg">{item.item_code.replace('IC-', '')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full shadow-sm ${
                                getCompletionPercentage(item) === 100 ? 'bg-emerald-500' : 
                                getCompletionPercentage(item) > 70 ? 'bg-amber-500' : 'bg-slate-400'
                              }`}></div>
                              <Badge variant="outline" className="text-sm font-semibold bg-white/60 backdrop-blur-sm border-white/30 rounded-xl px-3 py-1">
                                {getCompletionPercentage(item)}%
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Titre style Apple */}
                          <div>
                            <h3 className="font-bold text-slate-900 text-xl mb-2 tracking-tight">{item.item_code}</h3>
                            <p className="text-slate-600 line-clamp-3 leading-relaxed text-base">{item.title}</p>
                          </div>
                          
                          {/* Badges fonctionnalités style Apple */}
                          <div className="flex gap-3 flex-wrap">
                            {item.scene_immersive && (
                              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 text-sm font-semibold rounded-full px-4 py-2 shadow-lg">3D</Badge>
                            )}
                            {item.quiz_questions && (
                              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 text-sm font-semibold rounded-full px-4 py-2 shadow-lg">Quiz</Badge>
                            )}
                            {item.paroles_musicales && item.paroles_musicales.length > 0 && (
                              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-sm font-semibold rounded-full px-4 py-2 shadow-lg">Musique</Badge>
                            )}
                          </div>
                          
                          {/* Progress bar style Apple */}
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 rounded-full ${
                                getCompletionPercentage(item) === 100 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                                getCompletionPercentage(item) > 70 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                                'bg-gradient-to-r from-slate-400 to-slate-500'
                              }`}
                              style={{ width: `${getCompletionPercentage(item)}%` }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedItems.map(item => (
                    <Card 
                      key={item.id} 
                      className="group cursor-pointer hover:shadow-lg hover:bg-slate-50 transition-all duration-200 border border-slate-200"
                      onClick={() => openItemModal(item)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{item.item_code.replace('IC-', '')}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900 mb-1">{item.item_code}</h3>
                              <p className="text-slate-600 text-sm line-clamp-1">{item.title}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                              {item.scene_immersive && <Badge variant="secondary" className="text-xs">3D</Badge>}
                              {item.quiz_questions && <Badge variant="secondary" className="text-xs">Quiz</Badge>}
                              {item.paroles_musicales && item.paroles_musicales.length > 0 && <Badge variant="secondary" className="text-xs">Musique</Badge>}
                            </div>
                            <Badge variant="outline" className="font-medium">
                              {getCompletionPercentage(item)}%
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Autres onglets avec lazy loading */}
          <TabsContent value="complete">
            <React.Suspense fallback={<div className="text-center py-8">Chargement...</div>}>
              <div className="space-y-6">
                <SyncAllItemsButton />
                <SyncEdnButton onSyncComplete={loadAllData} />
                <div>Contenu complet chargé</div>
              </div>
            </React.Suspense>
          </TabsContent>

          <TabsContent value="music">
            <React.Suspense fallback={<div className="text-center py-8">Chargement...</div>}>
              <div className="space-y-6">
                <UpdateAllLyricsButton />
                <LyricsCompletionStatus />
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
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Abonnement actuel</CardTitle>
                    <CardDescription>Gérez votre plan et vos crédits IA</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold mb-2">Plan Gratuit</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Fonctionnalités de base avec limitations
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Crédits restants:</span>
                          <Badge variant="outline">{quota || 0}</Badge>
                        </div>
                      </div>
                      
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

                {showPricing && (
                  <PricingPlans 
                    onSelectPlan={(planId) => {
                      navigate(`/med-mng/subscribe/${planId}`);
                    }}
                  />
                )}
              </div>
            </React.Suspense>
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4"
            >
              Précédent
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10 h-10 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4"
            >
              Suivant
            </Button>
          </div>
        )}

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

      {/* Modal avec lazy loading */}
      {selectedItem && (
        <React.Suspense fallback={null}>
          <AppleStyleItemModalFixed
            item={selectedItem}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedItem(null);
            }}
          />
        </React.Suspense>
      )}
    </div>
  );
}