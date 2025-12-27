import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { 
  Search, BookOpen, Award, Users, TrendingUp, Filter, Grid, List, Eye,
  Music, Brain, Play, Headphones, CheckCircle, Sparkles, ArrowRight,
  Volume2, Gamepad2, Maximize2, Star, Target, Image, FileText, AlertTriangle,
  BarChart3, HelpCircle, Flame
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
import { useGamification, XP_PER_LEVEL } from "@/hooks/useGamification";
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
  competences_oic_rang_a?: any;
  competences_oic_rang_b?: any;
}

export default function EdnComplete() {
  // État local pour les items
  const [ednItems, setEdnItems] = useState<EdnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'item_code' | 'completeness_score' | 'updated_at'>('item_code');
  
  const [selectedItem, setSelectedItem] = useState<EdnItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('immersive');
  const [showPricing, setShowPricing] = useState(false);
  const [selectedItemTab, setSelectedItemTab] = useState<string>('overview');
  
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
  // Hooks qui font des appels Supabase
  const { stats: gamificationStats } = useGamification();
  const { quota } = useIAQuota();
  const { subscription, canGenerateMusic } = useSubscription();
  
  // Alias pour compatibilité
  const immersiveItems = ednItems;
  const completeItems = ednItems;
  
  // Chargement initial des items - utilise fetch direct pour éviter les problèmes de typage
  useEffect(() => {
    let isMounted = true;
    
    const fetchItems = async () => {
      try {
        const response = await fetch(
          'https://yaincoxihiqdksxgrsrk.supabase.co/rest/v1/edn_items_immersive?select=id,item_code,title,subtitle,slug,updated_at,paroles_musicales,competences_count_rang_a,competences_count_rang_b&limit=500',
          {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
            }
          }
        );
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        if (isMounted) {
          setEdnItems(data || []);
          setLoading(false);
          setHasMore(false);
        }
      } catch (err: any) {
        console.error('Erreur chargement EDN:', err);
        if (isMounted) {
          setLoadingError(err.message || 'Erreur de chargement');
          setLoading(false);
        }
      }
    };
    
    fetchItems();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  const refresh = () => {
    setLoading(true);
    setLoadingError(null);
    fetch(
      'https://yaincoxihiqdksxgrsrk.supabase.co/rest/v1/edn_items_immersive?select=id,item_code,title,subtitle,slug,updated_at,paroles_musicales,competences_count_rang_a,competences_count_rang_b&limit=500',
      {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
        }
      }
    )
    .then(res => res.json())
    .then(data => {
      setEdnItems(data || []);
      setLoading(false);
    })
    .catch(err => {
      setLoadingError(err.message);
      setLoading(false);
    });
  };

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

  // Fonction pour extraire le numéro de l'item_code (ex: "IC-1" -> 1, "IC-10" -> 10)
  const getItemNumber = (itemCode: string): number => {
    const match = itemCode.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const allItems = useMemo(() => {
    const mergedItems = immersiveItems.map(immersive => {
      const complete = completeItems.find(c => c.item_code === immersive.item_code);
      return {
        ...immersive,
        ...complete,
        slug: immersive.slug,
      };
    });
    // Tri numérique par item_code
    return mergedItems.sort((a, b) => getItemNumber(a.item_code) - getItemNumber(b.item_code));
  }, [immersiveItems, completeItems]);

  const getCompletionPercentage = (item: EdnItem) => {
    // Calcul basé uniquement sur les données disponibles dans le fetch initial
    let score = 0;
    
    // Rang A (35%) - basé sur competences_count_rang_a
    if ((item.competences_count_rang_a || 0) > 0) score += 35;
    
    // Rang B (35%) - basé sur competences_count_rang_b
    if ((item.competences_count_rang_b || 0) > 0) score += 35;
    
    // Paroles musicales (30%) - vérifie si présentes
    if (item.paroles_musicales && item.paroles_musicales.length > 0) score += 30;
    
    return score;
  };

  const isItemComplete = (item: EdnItem) => {
    return getCompletionPercentage(item) >= 80;
  };

  const filteredItems = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    
    return allItems.filter(item => {
      // Recherche étendue : titre, code, mots-clés, spécialité
      const matchesSearch = 
        item.title.toLowerCase().includes(searchLower) ||
        item.item_code.toLowerCase().includes(searchLower) ||
        (item.specialite && item.specialite.toLowerCase().includes(searchLower)) ||
        (item.mots_cles && item.mots_cles.some(mot => mot.toLowerCase().includes(searchLower)));
      
      if (selectedCategory === 'all') return matchesSearch;
      
      const matchesCategory = (() => {
        switch (selectedCategory) {
          case 'complete':
            return (item.competences_count_rang_a || 0) > 0 && (item.competences_count_rang_b || 0) > 0;
          case 'withMusic':
            return item.paroles_musicales && item.paroles_musicales.length > 0;
          case 'rangA':
            return (item.competences_count_rang_a || 0) > 0;
          case 'rangB':
            return (item.competences_count_rang_b || 0) > 0;
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
  }, [allItems, searchTerm, selectedCategory, sortBy]);

  const calculateStats = () => {
    const total = immersiveItems.length;
    const complete = immersiveItems.filter(item => 
      (item.competences_count_rang_a || 0) > 0 && (item.competences_count_rang_b || 0) > 0
    ).length;
    const withMusic = immersiveItems.filter(item => 
      item.paroles_musicales && item.paroles_musicales.length > 0
    ).length;
    const avgScore = total > 0 ? Math.round(immersiveItems.reduce((sum, item) => 
      sum + getCompletionPercentage(item), 0) / total) : 0;
    
    return { total, complete, withMusic, avgScore };
  };

  const openItemModal = useCallback(async (item: EdnItem, tab?: string) => {
    // Ouvrir la modal immédiatement avec données partielles
    setSelectedItem(item);
    setSelectedItemTab(tab || 'overview');
    setIsModalOpen(true);
    
    // Puis fetch données complètes (tableaux, quiz, scène, etc.) via fetch direct
    try {
      const response = await fetch(
        `https://yaincoxihiqdksxgrsrk.supabase.co/rest/v1/edn_items_immersive?item_code=eq.${encodeURIComponent(item.item_code)}&select=*`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setSelectedItem({ ...item, ...data[0] });
        }
      }
    } catch (err) {
      // Silently ignore - partial data is still usable
    }
  }, []);
  

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
            onClick={refresh}
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
                  <BookOpen className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Avancer sur l'EDN</h1>
                  <p className="text-sm text-muted-foreground">
                    {stats.total} items • Choisis et maîtrise un bloc
                  </p>
                </div>
                {gamificationStats && (
                  <div className="hidden md:flex items-center gap-2 ml-4">
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Flame className="h-3 w-3 text-orange-500" />
                      {gamificationStats.currentStreak}j
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Star className="h-3 w-3 text-yellow-500" />
                      Niv. {gamificationStats.level}
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(ROUTE_PATHS.srsReview)}
                  className="gap-1.5 border-primary/30 hover:bg-primary/10"
                >
                  <Brain className="h-4 w-4" />
                  <span className="hidden lg:inline">SRS</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(ROUTE_PATHS.examMode)}
                  className="gap-1.5 border-accent/30 hover:bg-accent/10"
                >
                  <Target className="h-4 w-4" />
                  <span className="hidden lg:inline">Examen</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(ROUTE_PATHS.clinicalCases)}
                  className="gap-1.5 border-success/30 hover:bg-success/10"
                >
                  <Gamepad2 className="h-4 w-4" />
                  <span className="hidden lg:inline">Cas</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(ROUTE_PATHS.flashcards)}
                  className="gap-1.5 border-warning/30 hover:bg-warning/10"
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden lg:inline">Flash</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(ROUTE_PATHS.progressDashboard)}
                  className="gap-1.5"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden xl:inline">Stats</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(ROUTE_PATHS.smartStudyPlanner)}
                  className="gap-1.5"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden xl:inline">Planning IA</span>
                </Button>
                <QuotaIndicator compact />
                <TabsList className="bg-muted">
                  <TabsTrigger value="revision" className="text-xs">📊 Mon suivi</TabsTrigger>
                  <TabsTrigger value="complete" className="text-xs">📚 Choisir un item</TabsTrigger>
                  <TabsTrigger value="immersive" className="text-xs">🎯 Approfondir</TabsTrigger>
                  <TabsTrigger value="music" className="text-xs">🎵 Écouter</TabsTrigger>
                  <TabsTrigger value="subscription" className="text-xs">⭐ Premium</TabsTrigger>
                </TabsList>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-4">
        {/* Bannière informative sur l'accès gratuit */}
        <Alert className="mb-4 bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm text-foreground">
            <strong className="font-semibold">Accès gratuit illimité aux révisions EDN</strong>
            <div className="mt-1 space-y-1">
              <div>✅ Réviser les 367 items EDN : <strong>GRATUIT ♾️</strong></div>
              <div>✅ Lire tout le contenu (Rang A + B) : <strong>GRATUIT</strong></div>
              <div>✅ Faire les quiz : <strong>GRATUIT</strong></div>
              <div className="mt-2 pt-2 border-t border-primary/20 dark:border-primary/30">
                🎵 Les crédits ({quota || 80}/160) servent uniquement à <strong>générer des musiques IA personnalisées</strong>
              </div>
            </div>
          </AlertDescription>
        </Alert>

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
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous ({stats.total})</SelectItem>
                  <SelectItem value="complete">Complets ({stats.complete})</SelectItem>
                  <SelectItem value="rangA">Avec Rang A</SelectItem>
                  <SelectItem value="rangB">Avec Rang B</SelectItem>
                  <SelectItem value="withMusic">Avec musique ({stats.withMusic})</SelectItem>
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
                onClick={() => navigate(ROUTE_PATHS.learningDashboard)}
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

          <TabsContent value="immersive" className="mt-6">
            <div className="space-y-6">
              {filteredItems.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun item trouvé. Essayez de modifier vos filtres.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map(item => (
                  <EdnItemCard
                    key={item.id}
                    item={item}
                    completionPercentage={getCompletionPercentage(item)}
                    onOpen={(tab) => openItemModal(item, tab)}
                  />
                ))}
              </div>
              
              
              {loading && immersiveItems.length > 0 && (
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
                      completionPercentage={getCompletionPercentage(item)}
                      onOpen={(tab) => openItemModal(item, tab)}
                    />
                  ))}
                </div>
                
                
                {loading && immersiveItems.length > 0 && (
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
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Music className="h-5 w-5 text-primary" />
                        <span className="font-medium">Musique IA</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Générez des chansons mnémotechniques personnalisées
                      </p>
                      <p className="text-xs mt-2 text-primary">
                        Coût: 5 crédits par génération
                      </p>
                    </div>
                    
                    <div className="p-4 bg-success/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-5 w-5 text-success" />
                        <span className="font-medium">QCM IA</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Créez des QCM adaptatifs intelligents
                      </p>
                      <p className="text-xs mt-2 text-success">
                        Coût: 2 crédits par QCM
                      </p>
                    </div>
                    
                    <div className="p-4 bg-accent/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-accent-foreground" />
                        <span className="font-medium">Bandes Dessinées</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Transformez les concepts en BD éducatives
                      </p>
                      <p className="text-xs mt-2 text-accent-foreground">
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