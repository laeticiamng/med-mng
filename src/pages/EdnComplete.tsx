import React, { useState, useEffect, useMemo } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { AppleStyleItemModalFixed } from "@/components/edn/premium/AppleStyleItemModalFixed";
import { EdnItemCard } from "@/components/edn/premium/EdnItemCard";
import { LyricsCompletionStatus } from "@/components/LyricsCompletionStatus";
import { RevisionDashboard } from "@/components/revision/RevisionDashboard";
import { QuotaIndicator } from "@/components/quota/QuotaIndicator";
import { PricingPlans } from "@/components/med-mng/PricingPlans";
import { useIAQuota } from "@/hooks/useIAQuota";
import { useSubscription } from "@/hooks/useSubscription";

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
  const [immersiveItems, setImmersiveItems] = useState<EdnItem[]>([]);
  const [completeItems, setCompleteItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const { data: immersiveData, error: immersiveError } = await supabase
        .from('edn_items_complete')
        .select(`
          id, item_code, title, subtitle, slug, 
          paroles_musicales, tableau_rang_a, tableau_rang_b, scene_immersive,
          quiz_questions, updated_at, competences_oic_rang_a, competences_oic_rang_b,
          completeness_score, is_validated, competences_count_rang_a, competences_count_rang_b
        `)
        .order('item_code');

      if (immersiveError) {
        console.error('Erreur immersive:', immersiveError);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données.",
          variant: "destructive"
        });
        return;
      }

      const { data: completeData } = await supabase
        .from('edn_items_complete')
        .select('id, item_code, title, specialite, completeness_score, is_validated')
        .order('item_code');

      setImmersiveItems(immersiveData || []);
      setCompleteItems(completeData || []);
      
      toast({
        title: "Interface EDN",
        description: `${immersiveData?.length || 0} items chargés`,
      });
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
        paroles_musicales: immersive.paroles_musicales,
        paroles_rang_a: immersive.paroles_rang_a,
        paroles_rang_b: immersive.paroles_rang_b,
        paroles_rang_ab: immersive.paroles_rang_ab
      };
    });
    return mergedItems;
  }, [immersiveItems, completeItems]);

  const isItemComplete = (item: EdnItem) => {
    const hasRangA = !!item.tableau_rang_a;
    const hasRangB = !!item.tableau_rang_b;
    const hasMusic = !!(item.paroles_musicales && item.paroles_musicales.length > 0);
    const hasScene = !!item.scene_immersive;
    const hasQuiz = !!item.quiz_questions;
    return hasRangA && hasRangB && hasMusic && hasScene && hasQuiz;
  };

  const getCompletionPercentage = (item: EdnItem) => {
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

  const openItemModal = (item: EdnItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const stats = calculateStats();

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
    <div className="min-h-screen bg-background">
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
                <p className="text-sm text-muted-foreground">{stats.total} items • {stats.complete} complets</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <QuotaIndicator compact />
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-muted">
                  <TabsTrigger value="immersive" className="text-xs">Immersif</TabsTrigger>
                  <TabsTrigger value="complete" className="text-xs">Complet</TabsTrigger>
                  <TabsTrigger value="music" className="text-xs">Paroles</TabsTrigger>
                  <TabsTrigger value="revision" className="text-xs">Révisions</TabsTrigger>
                  <TabsTrigger value="subscription" className="text-xs">Abonnement</TabsTrigger>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredItems.map(item => (
                    <Card 
                      key={item.id} 
                      className="group cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-0 bg-gradient-to-br from-white via-slate-50 to-gray-50 overflow-hidden"
                      onClick={() => openItemModal(item)}
                    >
                      <CardContent className="p-0">
                        <div className="p-6 space-y-4">
                          {/* Header avec numéro item */}
                          <div className="flex items-center justify-between">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-sm">{item.item_code.replace('IC-', '')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getCompletionPercentage(item) === 100 ? 'bg-green-500' : getCompletionPercentage(item) > 70 ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
                              <Badge variant="outline" className="text-xs font-medium">
                                {getCompletionPercentage(item)}%
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Titre */}
                          <div>
                            <h3 className="font-bold text-slate-800 text-lg mb-1">{item.item_code}</h3>
                            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{item.title}</p>
                          </div>
                          
                          {/* Badges fonctionnalités */}
                          <div className="flex gap-2 flex-wrap">
                            {item.scene_immersive && (
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">3D</Badge>
                            )}
                            {item.quiz_questions && (
                              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Quiz</Badge>
                            )}
                            {item.paroles_musicales && item.paroles_musicales.length > 0 && (
                              <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">Musique</Badge>
                            )}
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                getCompletionPercentage(item) === 100 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                getCompletionPercentage(item) > 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                'bg-gradient-to-r from-gray-400 to-gray-500'
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
                  {filteredItems.map(item => (
                    <Card 
                      key={item.id} 
                      className="group cursor-pointer hover:shadow-lg hover:bg-slate-50 transition-all duration-200 border border-slate-200"
                      onClick={() => openItemModal(item)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-xs">{item.item_code.replace('IC-', '')}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-800">{item.item_code}</h3>
                              <p className="text-sm text-slate-600">{item.title}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              {item.scene_immersive && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                              {item.quiz_questions && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                              {item.paroles_musicales && item.paroles_musicales.length > 0 && <div className="w-2 h-2 bg-purple-500 rounded-full"></div>}
                            </div>
                            <Badge variant="outline" className="font-medium">{getCompletionPercentage(item)}%</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="complete">
            <div className="grid gap-4">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map(item => (
                    <Card key={item.id} className="cursor-pointer hover:shadow-sm" onClick={() => openItemModal(item)}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{item.item_code}</h3>
                            <Badge variant={item.is_validated ? 'default' : 'outline'}>
                              {item.is_validated ? 'Validé' : 'En attente'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.title}</p>
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="text-xs">
                              Score: {item.completeness_score || getCompletionPercentage(item)}%
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredItems.map(item => (
                    <Card key={item.id} className="cursor-pointer hover:shadow-sm" onClick={() => openItemModal(item)}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{item.item_code}</span>
                              <span className="text-sm text-muted-foreground truncate">{item.title}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              {item.completeness_score || getCompletionPercentage(item)}%
                            </Badge>
                            {item.is_validated && (
                              <Badge variant="default" className="text-xs">Validé</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="music">
            <LyricsCompletionStatus />
          </TabsContent>

          <TabsContent value="revision">
            <RevisionDashboard />
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

          <TabsContent value="unified">
            <div className="grid gap-4">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map(item => (
                    <Card key={item.id} className="cursor-pointer hover:shadow-sm" onClick={() => openItemModal(item)}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{item.item_code}</h3>
                            <Badge variant="outline">{getCompletionPercentage(item)}%</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.title}</p>
                          <div className="flex gap-1 flex-wrap">
                            {item.tableau_rang_a && (
                              <Badge variant="secondary" className="text-xs">Rang A</Badge>
                            )}
                            {item.tableau_rang_b && (
                              <Badge variant="secondary" className="text-xs">Rang B</Badge>
                            )}
                            {item.paroles_musicales && item.paroles_musicales.length > 0 && (
                              <Badge variant="secondary" className="text-xs">Musique</Badge>
                            )}
                            {item.scene_immersive && (
                              <Badge variant="secondary" className="text-xs">3D</Badge>
                            )}
                            {item.quiz_questions && (
                              <Badge variant="secondary" className="text-xs">Quiz</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredItems.map(item => (
                    <Card key={item.id} className="cursor-pointer hover:shadow-sm" onClick={() => openItemModal(item)}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{item.item_code}</span>
                              <span className="text-sm text-muted-foreground truncate">{item.title}</span>
                            </div>
                            <div className="flex gap-1">
                              {item.tableau_rang_a && <Badge variant="secondary" className="text-xs px-1">A</Badge>}
                              {item.tableau_rang_b && <Badge variant="secondary" className="text-xs px-1">B</Badge>}
                              {item.paroles_musicales && item.paroles_musicales.length > 0 && <Badge variant="secondary" className="text-xs px-1">M</Badge>}
                              {item.scene_immersive && <Badge variant="secondary" className="text-xs px-1">3D</Badge>}
                              {item.quiz_questions && <Badge variant="secondary" className="text-xs px-1">Q</Badge>}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {getCompletionPercentage(item)}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

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

      {/* Modal avec nouveau design Apple */}
      {selectedItem && (
        <AppleStyleItemModalFixed
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}