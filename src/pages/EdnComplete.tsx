import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  Search, BookOpen, Award, Users, TrendingUp, Filter, Grid, List, Eye,
  Music, Brain, Play, Headphones, CheckCircle, Sparkles, ArrowRight,
  Volume2, Gamepad2, Maximize2, Star, Target, Image, FileText, AlertTriangle,
  BarChart3, HelpCircle
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
  // Logs de démarrage avec timestamp pour tracking
  const startTime = Date.now();
  console.log(`🎯 [${startTime}] EdnComplete component mounting...`);
  
  const [immersiveItems, setImmersiveItems] = useState<EdnItem[]>([]);
  const [completeItems, setCompleteItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'item_code' | 'completeness_score' | 'updated_at'>('item_code');
  const [selectedItem, setSelectedItem] = useState<EdnItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('immersive');
  const [showPricing, setShowPricing] = useState(false);
  
  const { quota } = useIAQuota();
  const { subscription, canGenerateMusic } = useSubscription();
  
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    const loadTime = Date.now();
    console.log(`🎯 [${loadTime}] useEffect firing, calling fetchAllData...`);
    
    // Timeout de sécurité: 10 secondes max
    const timeoutId = setTimeout(() => {
      console.error('⏱️ TIMEOUT: Chargement trop long (>10s), déblocage forcé');
      setLoadingError('Le chargement prend trop de temps. Réessayez.');
      setLoading(false);
    }, 10000);
    
    fetchAllData()
      .then(() => {
        clearTimeout(timeoutId);
        console.log(`✅ [${Date.now()}] fetchAllData terminé avec succès`);
      })
      .catch(err => {
        clearTimeout(timeoutId);
        console.error(`🔥 [${Date.now()}] CRITICAL ERROR in fetchAllData:`, err);
        setLoadingError('Erreur lors du chargement des données.');
        setLoading(false);
      });
    
    return () => clearTimeout(timeoutId);
  }, []);

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

  const fetchAllData = async () => {
    const funcStart = Date.now();
    console.log(`📊 [${funcStart}] fetchAllData called`);
    setLoading(true);
    setLoadingError(null);
    
    try {
      console.log(`🔄 [${Date.now()}] Début du chargement des données EDN...`);
      
      // Requête simplifiée avec timeout explicite
      console.log(`📡 [${Date.now()}] Fetching edn_items_immersive...`);
      
      const fetchPromise = supabase
        .from('edn_items_immersive')
        .select(`
          id, item_code, title, subtitle, slug, 
          paroles_rang_a, paroles_rang_b, paroles_rang_ab,
          tableau_rang_a, tableau_rang_b, scene_immersive,
          quiz_questions, updated_at,
          competences_count_rang_a, competences_count_rang_b, competences_count_total
        `)
        .order('item_code');

      const { data: immersiveData, error: immersiveError } = await fetchPromise;

      console.log(`📊 [${Date.now()}] Réponse reçue de edn_items_immersive`);

      if (immersiveError) {
        console.error(`❌ [${Date.now()}] Erreur chargement immersive:`, immersiveError);
        setLoadingError(`Erreur: ${immersiveError.message}`);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données.",
          variant: "destructive"
        });
        return;
      }

      console.log(`✅ [${Date.now()}] Données immersives chargées:`, immersiveData?.length);

      const { data: completeData } = await supabase
        .from('edn_items_complete')
        .select('id, item_code, title, specialite, completeness_score, is_validated')
        .order('item_code');

      console.log('✅ Données complètes chargées:', completeData?.length);

      // OPTIMISATION: Batch loading des compétences OIC en parallèle
      const itemNumbers = (immersiveData || []).map(item => 
        item.item_code.replace('IC-', '').padStart(3, '0')
      );
      
      console.log('🔄 Chargement des compétences OIC pour', itemNumbers.length, 'items...');

      // Diviser en lots de 50 et requêtes parallèles pour performance
      const batchSize = 50;
      const batchPromises = [];
      
      for (let i = 0; i < itemNumbers.length; i += batchSize) {
        const batch = itemNumbers.slice(i, i + batchSize);
        const promise = supabase
          .from('backup_oic_competences')
          .select('item_parent, rang, objectif_id, intitule, description, rubrique')
          .in('item_parent', batch)
          .then(({ data }) => {
            console.log(`  ↳ Lot ${Math.floor(i/batchSize) + 1}: ${data?.length || 0} compétences`);
            return data || [];
          });
        batchPromises.push(promise);
      }
      
      // Attendre toutes les requêtes en parallèle
      const batchResults = await Promise.all(batchPromises);
      const allOicCompetences = batchResults.flat();
      
      console.log('✅ Compétences OIC chargées:', allOicCompetences.length);

      // Indexer par item_parent et rang pour accès rapide
      const oicByItem = new Map<string, { A: any[], B: any[] }>();
      (allOicCompetences || []).forEach(comp => {
        if (!oicByItem.has(comp.item_parent)) {
          oicByItem.set(comp.item_parent, { A: [], B: [] });
        }
        oicByItem.get(comp.item_parent)![comp.rang as 'A' | 'B'].push(comp);
      });

      // Enrichir les données avec les compétences OIC
      const itemsWithOIC = (immersiveData || []).map((item) => {
        try {
          const itemNumber = item.item_code.replace('IC-', '').padStart(3, '0');
          const oicData = oicByItem.get(itemNumber) || { A: [], B: [] };
          const oicRangA = oicData.A;
          const oicRangB = oicData.B;

          // 1. TRANSFORMATION des données existantes (objectifs/competences_cles → sections)
          let transformedTableauA = transformTableauToSections(
            item.tableau_rang_a, 
            item.item_code, 
            item.title, 
            'A'
          );
          
          let transformedTableauB = transformTableauToSections(
            item.tableau_rang_b, 
            item.item_code, 
            item.title, 
            'B'
          );

          // 2. ENRICHISSEMENT avec OIC - TOUJOURS MERGER les compétences OIC
          const tableauA = transformedTableauA || item.tableau_rang_a || {};
          
          if (oicRangA && oicRangA.length > 0) {
            // Si sections existent déjà, ajouter les OIC en plus
            const existingSections = tableauA.sections || [];
            const oicSection = {
              title: `Compétences OIC Rang A (${oicRangA.length})`,
              competences: oicRangA.map(comp => ({
                competence_id: comp.objectif_id,
                concept: comp.intitule,
                definition: comp.description,
                rubrique: comp.rubrique
              }))
            };
            
            transformedTableauA = {
              ...tableauA,
              title: `${item.item_code} Rang A - ${item.title}`,
              sections: existingSections.length > 0 
                ? [...existingSections, oicSection] 
                : [oicSection]
            };
          }

          const tableauB = transformedTableauB || item.tableau_rang_b || {};
          
          if (oicRangB && oicRangB.length > 0) {
            // Si sections existent déjà, ajouter les OIC en plus
            const existingSections = tableauB.sections || [];
            const oicSection = {
              title: `Compétences OIC Rang B (${oicRangB.length})`,
              competences: oicRangB.map(comp => ({
                competence_id: comp.objectif_id,
                concept: comp.intitule,
                definition: comp.description,
                rubrique: comp.rubrique
              }))
            };
            
            transformedTableauB = {
              ...tableauB,
              title: `${item.item_code} Rang B - ${item.title}`,
              sections: existingSections.length > 0 
                ? [...existingSections, oicSection] 
                : [oicSection]
            };
          }

          return {
            ...item,
            tableau_rang_a: transformedTableauA,
            tableau_rang_b: transformedTableauB,
            competences_oic_rang_a: oicRangA,
            competences_oic_rang_b: oicRangB
          };
        } catch (error) {
          return item;
        }
      });

      setImmersiveItems(itemsWithOIC);
      setCompleteItems(completeData || []);
      
      const loadDuration = Date.now() - funcStart;
      console.log(`✅ [${Date.now()}] Chargement terminé en ${loadDuration}ms ! Total items:`, itemsWithOIC.length);
      
      toast({
        title: "Interface EDN",
        description: `${immersiveData?.length || 0} items chargés`,
      });
    } catch (error) {
      const errorTime = Date.now();
      console.error(`❌ [${errorTime}] Erreur critique lors du chargement:`, error);
      setLoadingError(error instanceof Error ? error.message : 'Erreur inconnue');
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement.",
        variant: "destructive"
      });
    } finally {
      console.log(`🏁 [${Date.now()}] Fin du chargement, setLoading(false)`);
      setLoading(false);
    }
  };

  const allItems = useMemo(() => {
    const mergedItems = immersiveItems.map(immersive => {
      const complete = completeItems.find(c => c.item_code === immersive.item_code);
      return {
        ...immersive,
        ...complete,
        slug: immersive.slug,
        tableau_rang_a: immersive.tableau_rang_a,
        tableau_rang_b: immersive.tableau_rang_b,
        scene_immersive: immersive.scene_immersive,
        quiz_questions: immersive.quiz_questions,
        paroles_musicales: immersive.paroles_musicales
      };
    });
    return mergedItems;
  }, [immersiveItems, completeItems]);

  const isItemComplete = (item: EdnItem) => {
    return getCompletionPercentage(item) === 100;
  };

  const getCompletionPercentage = (item: EdnItem) => {
    let score = 0;
    let maxScore = 0;

    // Rang A avec sections ou compétences (25 points)
    maxScore += 25;
    if (item.tableau_rang_a) {
      const rangA = item.tableau_rang_a;
      if (rangA.sections && rangA.sections.length > 0) {
        score += 25;
      } else if (rangA.objectifs || rangA.competences_cles || rangA.competences_cliniques) {
        score += 20;
      } else {
        score += 10;
      }
    }

    // Rang B avec sections ou compétences (25 points)
    maxScore += 25;
    if (item.tableau_rang_b) {
      const rangB = item.tableau_rang_b;
      if (rangB.sections && rangB.sections.length > 0) {
        score += 25;
      } else if (rangB.objectifs || rangB.competences_cles || rangB.competences_cliniques) {
        score += 20;
      } else {
        score += 10;
      }
    }

    // Paroles musicales (20 points)
    maxScore += 20;
    if (item.paroles_musicales && item.paroles_musicales.length > 0) {
      score += 20;
    } else if (item.paroles_rang_a || item.paroles_rang_b) {
      score += 15;
    }

    // Scène immersive (15 points)
    maxScore += 15;
    if (item.scene_immersive) {
      score += 15;
    }

    // Quiz (15 points)
    maxScore += 15;
    if (item.quiz_questions) {
      score += 15;
    }

    return Math.round((score / maxScore) * 100);
  };

  const getOldCompletionPercentage = (item: EdnItem) => {
    const features = [
      !!item.tableau_rang_a,
      !!item.tableau_rang_b,
      !!(item.paroles_musicales && item.paroles_musicales.length > 0),
      !!item.scene_immersive,
      !!item.quiz_questions
    ];
    return Math.round((features.filter(Boolean).length / features.length) * 100);
  };

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
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
  }, [allItems, searchTerm, selectedCategory, sortBy]);

  const calculateStats = () => {
    const total = allItems.length;
    const complete = allItems.filter(isItemComplete).length;
    const validated = allItems.filter(item => item.is_validated).length;
    const withMusic = allItems.filter(item => item.paroles_musicales && item.paroles_musicales.length > 0).length;
    const avgScore = total > 0 ? Math.round(allItems.reduce((sum, item) => 
      sum + (item.completeness_score || getCompletionPercentage(item)), 0) / total) : 0;
    
    return { total, complete, validated, withMusic, avgScore };
  };

  const openItemModal = useCallback((item: EdnItem, tab?: string) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    setSelectedItemTab(tab || 'overview');
    
    // Analytics: Track item opening
    console.log(`📊 Analytics: Item ${item.item_code} opened on tab ${tab || 'overview'}`);
  }, []);
  
  const [selectedItemTab, setSelectedItemTab] = useState<string>('overview');

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
    <div className="min-h-screen bg-background">
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
            <div className="grid gap-4">
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
            </div>
          </TabsContent>

          <TabsContent value="complete">
            <div className="space-y-6">
              {/* FAQ Section */}
              <FaqSection />

              {/* Liste des items avec EdnItemCard premium */}
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map(item => (
                    <EdnItemCard
                      key={item.id}
                      item={item}
                      completionPercentage={item.completeness_score || getCompletionPercentage(item)}
                      onOpen={(tab) => openItemModal(item, tab)}
                    />
                  ))}
                </div>
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