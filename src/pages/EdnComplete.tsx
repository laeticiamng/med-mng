import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { AppleStyleItemModalFixed } from "@/components/edn/premium/AppleStyleItemModalFixed";
import { EdnItemCard } from "@/components/edn/premium/EdnItemCard";
import { EdnItemGridSkeleton } from "@/components/edn/EdnItemSkeleton";
import { LyricsCompletionStatus } from "@/components/LyricsCompletionStatus";
import { RevisionDashboard } from "@/components/revision/RevisionDashboard";
// import { QuotaIndicator } from "@/components/quota/QuotaIndicator";
import { PricingPlans } from "@/components/med-mng/PricingPlans";
// Hooks temporairement commentés pour éviter les erreurs
// import { useIAQuota } from "@/hooks/useIAQuota";
// import { useSubscription } from "@/hooks/useSubscription";
import { GenerateAllLyricsButton } from "@/components/edn/GenerateAllLyricsButton";
import { LyricsGenerationManager } from "@/components/edn/LyricsGenerationManager";
import { CompetencesUpdateChecker } from "@/components/edn/CompetencesUpdateChecker";
import { useEdnItemsComplete, type EdnItemComplete } from "@/hooks/useEdnItemsComplete";
import EdnCompleteDetail from "./EdnCompleteDetail";

interface EdnItem extends EdnItemComplete {}

interface ItemStats {
  total: number;
  complete: number;
  validated: number;
  withMusic: number;
  avgScore: number;
}

export default function EdnComplete() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  // Si on a un slug, rediriger vers la page de détail
  useEffect(() => {
    if (slug) {
      navigate(`/edn/${slug}`, { replace: true });
    }
  }, [slug]); // Suppression de navigate pour éviter la boucle
  
  // Hook principal pour charger les données
  const { items, loading, error } = useEdnItemsComplete();
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
  
  // Hooks temporairement désactivés pour éviter les erreurs
  // const { quota } = useIAQuota();
  // const { subscription, canGenerateMusic } = useSubscription();
  const quota = 0;
  const canGenerateMusic = false;
  
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Fonctions utilitaires
  const getCompletionPercentage = (item: EdnItem): number => {
    let score = 0;
    if (item.tableau_rang_a) score += 25;
    if (item.tableau_rang_b) score += 25;
    if (item.quiz_questions && Array.isArray(item.quiz_questions) && item.quiz_questions.length >= 2) score += 25;
    if (item.paroles_musicales && item.paroles_musicales.length > 0) score += 10;
    if (item.scene_immersive) score += 15;
    return Math.min(score, 100);
  };

  const isItemComplete = (item: EdnItem): boolean => {
    return getCompletionPercentage(item) >= 80;
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
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
          return (b.completeness_score || getCompletionPercentage(b)) - (a.completeness_score || getCompletionPercentage(a));
        case 'updated_at':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        default:
          const numA = parseInt(a.item_code.replace('IC-', '') || '0');
          const numB = parseInt(b.item_code.replace('IC-', '') || '0');
          return numA - numB;
      }
    });
  }, [items, searchTerm, selectedCategory, sortBy]);

  const calculateStats = (): ItemStats => {
    const total = items.length;
    const complete = items.filter(isItemComplete).length;
    const validated = items.filter(item => item.is_validated).length;
    const withMusic = items.filter(item => item.paroles_musicales && item.paroles_musicales.length > 0).length;
    const avgScore = total > 0 ? Math.round(items.reduce((sum, item) => 
      sum + (item.completeness_score || getCompletionPercentage(item)), 0) / total) : 0;
    
    return { total, complete, validated, withMusic, avgScore };
  };

  const stats = calculateStats();
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleItemClick = (item: EdnItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        {/* Header skeleton */}
        <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 shadow-sm">
          <div className="container mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <div>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
              <Skeleton className="w-64 h-10 rounded-xl" />
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-6 py-4">
          {/* Controls skeleton */}
          <div className="flex flex-col gap-3 mb-6">
            <Skeleton className="h-10 w-full" />
            <div className="flex gap-2 items-center justify-between">
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
          
          {/* Grid skeleton */}
          <EdnItemGridSkeleton count={12} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erreur de chargement: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Interface EDN
                </h1>
                <p className="text-slate-600">
                  {stats.total} items • Page {currentPage}/{Math.max(1, totalPages)} • {currentItems.length} affichés
                </p>
              </div>
            </div>
            {/* <QuotaIndicator /> */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-4">
        {/* Tabs */}
        <Tabs defaultValue="immersive" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/50 backdrop-blur-sm border border-white/20">
            <TabsTrigger value="immersive" className="gap-2">
              <Eye className="w-4 h-4" />
              Immersif
            </TabsTrigger>
            <TabsTrigger value="complete" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Complet
            </TabsTrigger>
            <TabsTrigger value="lyrics" className="gap-2">
              <Music className="w-4 h-4" />
              Paroles
            </TabsTrigger>
            <TabsTrigger value="competences" className="gap-2">
              <Target className="w-4 h-4" />
              Compétences
            </TabsTrigger>
            <TabsTrigger value="revision" className="gap-2">
              <Brain className="w-4 h-4" />
              Révisions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="immersive" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card className="bg-white/60 backdrop-blur-sm border-white/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                      <p className="text-sm text-slate-600">Items total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-white/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stats.complete}</p>
                      <p className="text-sm text-slate-600">Complets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-white/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stats.validated}</p>
                      <p className="text-sm text-slate-600">Validés</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-white/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                      <Music className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stats.withMusic}</p>
                      <p className="text-sm text-slate-600">Avec musique</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-white/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stats.avgScore}%</p>
                      <p className="text-sm text-slate-600">Score moyen</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rechercher un item EDN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 backdrop-blur-sm border-white/30"
                />
              </div>

              <div className="flex gap-2 items-center justify-between">
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40 bg-white/50 backdrop-blur-sm border-white/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="complete">Complets</SelectItem>
                      <SelectItem value="withMusic">Avec musique</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-40 bg-white/50 backdrop-blur-sm border-white/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="item_code">Code</SelectItem>
                      <SelectItem value="completeness_score">Score</SelectItem>
                      <SelectItem value="updated_at">Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Items Grid */}
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
            }>
              {currentItems.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-white/60 backdrop-blur-sm border-white/30"
                  onClick={() => handleItemClick(item)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {item.item_code.replace('IC-', '')}
                        </div>
                        <div>
                          <Badge variant="secondary" className="mb-1 text-xs">
                            {item.item_code}
                          </Badge>
                          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                            {item.title}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={getCompletionPercentage(item) >= 80 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {getCompletionPercentage(item)}%
                        </Badge>
                        {item.is_validated && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Validé
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {item.tableau_rang_a && (
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                        {item.paroles_musicales && item.paroles_musicales.length > 0 && (
                          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                            <Music className="w-4 h-4 text-orange-600" />
                          </div>
                        )}
                        {item.scene_immersive && (
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Eye className="w-4 h-4 text-purple-600" />
                          </div>
                        )}
                        {item.quiz_questions && (
                          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                            <Brain className="w-4 h-4 text-green-600" />
                          </div>
                        )}
                      </div>
                      <Button size="sm" variant="ghost">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="complete">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Mode Complet</h3>
              <p className="text-muted-foreground">Fonctionnalité en cours de développement</p>
            </div>
          </TabsContent>

          <TabsContent value="lyrics">
            <LyricsGenerationManager />
          </TabsContent>

          <TabsContent value="competences">
            <CompetencesUpdateChecker />
          </TabsContent>

          <TabsContent value="revision">
            <RevisionDashboard />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Simple */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedItem.item_code}</h2>
                <p className="text-slate-600">{selectedItem.title}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                ×
              </Button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Aperçu de l'item</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <BookOpen className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                      <p className="text-sm font-medium">Tableaux</p>
                      <p className="text-xs text-slate-500">
                        {(selectedItem.tableau_rang_a ? 1 : 0) + (selectedItem.tableau_rang_b ? 1 : 0)}/2
                      </p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <Music className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                      <p className="text-sm font-medium">Musique</p>
                      <p className="text-xs text-slate-500">
                        {selectedItem.paroles_musicales?.length || 0} paroles
                      </p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <Eye className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                      <p className="text-sm font-medium">Scène</p>
                      <p className="text-xs text-slate-500">
                        {selectedItem.scene_immersive ? 'Disponible' : 'Non disponible'}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <Brain className="w-8 h-8 mx-auto text-green-600 mb-2" />
                      <p className="text-sm font-medium">Quiz</p>
                      <p className="text-xs text-slate-500">
                        {Array.isArray(selectedItem.quiz_questions) ? selectedItem.quiz_questions.length : 0} questions
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Link
                    to={`/edn/${selectedItem.slug}`}
                    className="flex-1"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <Button className="w-full">
                      Ouvrir l'item complet
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Fermer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {showPricing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Plans d'abonnement</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowPricing(false)}>
                ×
              </Button>
            </div>
            <div className="p-6">
              <PricingPlans />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}