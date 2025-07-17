import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, BookOpen, Award, Users, TrendingUp, Filter, Grid, List, Eye,
  Music, Brain, Play, Headphones, CheckCircle, Sparkles, ArrowRight,
  Volume2, Gamepad2, Maximize2, Star, Target, Image, FileText
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

interface EdnItem {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  paroles_musicales?: string[];
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
  // États unifiés pour toutes les fonctionnalités EDN
  const [immersiveItems, setImmersiveItems] = useState<EdnItem[]>([]);
  const [completeItems, setCompleteItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'item_code' | 'completeness_score' | 'updated_at'>('item_code');
  const [selectedItem, setSelectedItem] = useState<EdnItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('immersive');
  
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Charger les items immersifs
      const { data: immersiveData, error: immersiveError } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .order('item_code');

      // Charger les items complets
      const { data: completeData, error: completeError } = await supabase
        .from('edn_items_complete')
        .select('*')
        .order('item_code');

      if (immersiveError || completeError) {
        console.error('Erreur lors du chargement:', { immersiveError, completeError });
        toast({
          title: "Erreur",
          description: "Impossible de charger les données EDN.",
          variant: "destructive"
        });
        return;
      }

      setImmersiveItems(immersiveData || []);
      setCompleteItems(completeData || []);
      
      toast({
        title: "✅ Interface EDN Unifiée",
        description: `${immersiveData?.length || 0} items immersifs + ${completeData?.length || 0} items complets chargés`,
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des données.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fusionner les données des deux tables
  const allItems = useMemo(() => {
    const mergedItems = immersiveItems.map(immersive => {
      const complete = completeItems.find(c => c.item_code === immersive.item_code);
      return {
        ...immersive,
        ...complete,
        // Garder les propriétés importantes de l'immersif
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

  // Filtrage unifié
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.subtitle && item.subtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (item.mots_cles?.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase())));
      
      if (selectedCategory === 'all') return matchesSearch;
      
      const itemNumber = parseInt(item.item_code.replace('IC-', '') || '0');
      const matchesCategory = (() => {
        switch (selectedCategory) {
          case 'foundation':
            return itemNumber <= 100;
          case 'clinical':
            return itemNumber >= 101 && itemNumber <= 250;
          case 'advanced':
            return itemNumber >= 251;
          case 'complete':
            return isItemComplete(item);
          case 'validated':
            return item.is_validated;
          case 'withMusic':
            return item.paroles_musicales && item.paroles_musicales.length > 0;
          default:
            return true;
        }
      })();

      const matchesSpecialty = selectedSpecialty === 'all' || item.specialite === selectedSpecialty;
      
      return matchesSearch && matchesCategory && matchesSpecialty;
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
  }, [allItems, searchTerm, selectedCategory, selectedSpecialty, sortBy]);

  const specialties = Array.from(new Set(allItems.map(item => item.specialite).filter(Boolean)));

  const calculateStats = () => {
    const total = allItems.length;
    const complete = allItems.filter(isItemComplete).length;
    const validated = allItems.filter(item => item.is_validated).length;
    const withMusic = allItems.filter(item => item.paroles_musicales && item.paroles_musicales.length > 0).length;
    const withScene = allItems.filter(item => !!item.scene_immersive).length;
    const withQuiz = allItems.filter(item => !!item.quiz_questions).length;
    const totalCompetences = allItems.reduce((sum, item) => sum + (item.competences_count_total || 0), 0);
    const avgScore = total > 0 ? Math.round(allItems.reduce((sum, item) => 
      sum + (item.completeness_score || getCompletionPercentage(item)), 0) / total) : 0;
    
    return { 
      total, complete, validated, withMusic, withScene, withQuiz, 
      totalCompetences, avgScore, displayed: filteredItems.length 
    };
  };

  const getCompletenessColor = (score?: number) => {
    if (!score) return 'bg-gray-200';
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCompletenessText = (score?: number) => {
    if (!score) return 'Non évalué';
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Bon';
    return 'À améliorer';
  };

  const openItemModal = (item: EdnItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Chargement Interface EDN Unifiée
            </h2>
            <p className="text-gray-600">
              Fusion des données immersives et complètes...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header Unifié Premium */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-purple-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Interface EDN Unifiée • 367 Items Complets
                </h1>
                <p className="text-gray-600">Immersif + Complet + Musique • Toutes fonctionnalités intégrées</p>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl mx-auto">
              <TabsList className="grid w-full grid-cols-4 bg-white/70">
                <TabsTrigger value="immersive">
                  <Brain className="h-4 w-4 mr-2" />
                  Immersif
                </TabsTrigger>
                <TabsTrigger value="complete">
                  <Award className="h-4 w-4 mr-2" />
                  Complet
                </TabsTrigger>
                <TabsTrigger value="music">
                  <Music className="h-4 w-4 mr-2" />
                  Musique
                </TabsTrigger>
                <TabsTrigger value="unified">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Unifié
                </TabsTrigger>
              </TabsList>

              <TabsContent value="immersive" className="mt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Mode Immersif</h3>
                  <p className="text-gray-600 text-sm">Explorez les items avec scènes 3D, quiz interactifs et expériences immersives</p>
                </div>
              </TabsContent>

              <TabsContent value="complete" className="mt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Mode Complet</h3>
                  <p className="text-gray-600 text-sm">Accédez aux données OIC complètes avec métriques de qualité et validation</p>
                </div>
              </TabsContent>

              <TabsContent value="music" className="mt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Mode Musical</h3>
                  <p className="text-gray-600 text-sm">Découvrez les items avec paroles musicales et contenu audio</p>
                </div>
              </TabsContent>

              <TabsContent value="unified" className="mt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Mode Unifié</h3>
                  <p className="text-gray-600 text-sm">Interface complète fusionnant toutes les fonctionnalités EDN</p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-center gap-2 mt-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-green-600 font-medium">
                100% des fonctionnalités EDN fusionnées • Interface premium unifiée
              </span>
            </div>
          </div>

          {/* Contrôles de recherche et filtrage */}
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${isMobile ? 'h-5 w-5' : 'h-5 w-5'}`} />
              <Input
                placeholder={isMobile ? "Rechercher items..." : "Rechercher parmi les 367 items unifiés (titre, code, compétences, rangs...)"}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 ${isMobile ? 'py-4 text-base rounded-xl' : 'py-3 text-lg'} border-purple-200 focus:border-purple-400 bg-white/70 transition-all duration-300 focus:shadow-lg focus:scale-[1.02]`}
              />
              {searchTerm && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-full"
                  onClick={() => setSearchTerm('')}
                >
                  ×
                </Button>
              )}
            </div>
            
            {/* Filtres catégories */}
            {isMobile ? (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'all', label: 'Tous', count: stats.total },
                  { value: 'complete', label: 'Complets', count: stats.complete },
                  { value: 'validated', label: 'Validés', count: stats.validated },
                  { value: 'withMusic', label: 'Avec Musique', count: stats.withMusic }
                ].map((filter) => (
                  <Button
                    key={filter.value}
                    variant={selectedCategory === filter.value ? "default" : "outline"}
                    className={`h-auto py-3 px-3 flex flex-col gap-1 transition-all duration-300 active:scale-95 ${
                      selectedCategory === filter.value 
                        ? 'bg-purple-600 text-white shadow-lg transform scale-105' 
                        : 'bg-white/80 hover:bg-purple-50 hover:border-purple-300'
                    }`}
                    onClick={() => setSelectedCategory(filter.value)}
                  >
                    <span className="text-sm font-semibold">{filter.label}</span>
                    <span className={`text-xs ${selectedCategory === filter.value ? 'text-purple-100' : 'text-gray-500'}`}>
                      {filter.count}
                    </span>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'all', label: 'Tous', count: stats.total },
                  { value: 'foundation', label: 'Base (1-100)', count: allItems.filter(item => parseInt(item.item_code.replace('IC-', '') || '0') <= 100).length },
                  { value: 'clinical', label: 'Clinique (101-250)', count: allItems.filter(item => { const num = parseInt(item.item_code.replace('IC-', '') || '0'); return num >= 101 && num <= 250; }).length },
                  { value: 'advanced', label: 'Avancé (251-367)', count: allItems.filter(item => parseInt(item.item_code.replace('IC-', '') || '0') >= 251).length },
                  { value: 'complete', label: 'Complets 100%', count: stats.complete },
                  { value: 'validated', label: 'Validés', count: stats.validated },
                  { value: 'withMusic', label: 'Avec Musique', count: stats.withMusic }
                ].map((filter) => (
                  <Button
                    key={filter.value}
                    variant={selectedCategory === filter.value ? "default" : "outline"}
                    className={`transition-all duration-300 ${
                      selectedCategory === filter.value 
                        ? 'bg-purple-600 text-white shadow-lg' 
                        : 'bg-white/80 hover:bg-purple-50'
                    }`}
                    onClick={() => setSelectedCategory(filter.value)}
                  >
                    {filter.label} ({filter.count})
                  </Button>
                ))}
              </div>
            )}

            {/* Contrôles additionnels */}
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="w-full md:w-48 bg-white/70">
                  <SelectValue placeholder="Spécialité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes spécialités</SelectItem>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full md:w-48 bg-white/70">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="item_code">Code Item</SelectItem>
                  <SelectItem value="completeness_score">Score de complétude</SelectItem>
                  <SelectItem value="updated_at">Dernière mise à jour</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="bg-white/70"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="bg-white/70"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar Unifié */}
      <div className="bg-white/60 backdrop-blur-sm border-y border-purple-200/50 py-4">
        <div className="container mx-auto px-4">
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-8'} gap-2 mb-4`}>
            {[
              { title: "Total", value: stats.total, subtitle: "Items unifiés", icon: BookOpen, color: "text-blue-600", bgColor: "bg-blue-50" },
              { title: "Affichés", value: stats.displayed, subtitle: "Filtrés", icon: Target, color: "text-purple-600", bgColor: "bg-purple-50" },
              { title: "Complets", value: stats.complete, subtitle: "100% prêts", icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50" },
              { title: "Validés", value: stats.validated, subtitle: "Certifiés", icon: Award, color: "text-yellow-600", bgColor: "bg-yellow-50" },
              { title: "Avec Musique", value: stats.withMusic, subtitle: "Mélodies", icon: Music, color: "text-pink-600", bgColor: "bg-pink-50" },
              { title: "Scènes 3D", value: stats.withScene, subtitle: "Immersives", icon: Gamepad2, color: "text-orange-600", bgColor: "bg-orange-50" },
              { title: "Quiz", value: stats.withQuiz, subtitle: "Interactifs", icon: Brain, color: "text-indigo-600", bgColor: "bg-indigo-50" },
              { title: "Score Moyen", value: `${stats.avgScore}%`, subtitle: "Qualité", icon: Star, color: "text-emerald-600", bgColor: "bg-emerald-50" }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className={`${stat.bgColor} border-2 hover:shadow-lg transition-all duration-300`}>
                  <CardContent className={`${isMobile ? 'p-2' : 'p-3'} text-center`}>
                    <IconComponent className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} ${stat.color} mx-auto mb-1`} />
                    <div className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold ${stat.color}`}>{stat.value}</div>
                    <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-700 mb-1`}>{isMobile ? stat.title.split(' ')[0] : stat.title}</div>
                    {!isMobile && <div className="text-xs text-gray-500">{stat.subtitle}</div>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Compétences totales */}
          <div className="bg-white/80 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="font-semibold text-gray-800">Compétences OIC Intégrées</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{stats.totalCompetences.toLocaleString()}</span>
            </div>
            <div className="text-sm text-gray-600">
              Toutes les compétences UNESS fusionnées dans l'interface unifiée
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">

        {/* Résultats */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {filteredItems.length} item{filteredItems.length > 1 ? 's' : ''} trouvé{filteredItems.length > 1 ? 's' : ''} sur {stats.total}
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun item trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos critères de recherche ou de filtrage.</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'}`}>
                {filteredItems.map((item) => (
                  <EdnItemCard
                    key={item.id}
                    item={item}
                    completionPercentage={item.completeness_score || getCompletionPercentage(item)}
                    onOpen={() => openItemModal(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <Badge variant="outline" className="font-mono">{item.item_code}</Badge>
                            <h3 className="text-lg font-semibold line-clamp-1">{item.title}</h3>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getCompletenessColor(item.completeness_score || getCompletionPercentage(item))}`} />
                              <span className="text-sm text-gray-600">
                                {item.completeness_score || getCompletionPercentage(item)}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                            {item.specialite && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{item.specialite}</span>}
                            <span>Rang A: {item.competences_count_rang_a || 0}</span>
                            <span>Rang B: {item.competences_count_rang_b || 0}</span>
                            <span>Total: {item.competences_count_total || 0} compétences</span>
                          </div>

                          <div className="flex gap-2 flex-wrap">
                            {item.paroles_musicales && item.paroles_musicales.length > 0 && (
                              <Badge variant="secondary" className="text-xs bg-pink-100 text-pink-700">
                                <Music className="h-3 w-3 mr-1" />
                                Musique
                              </Badge>
                            )}
                            {item.scene_immersive && (
                              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                                <Gamepad2 className="h-3 w-3 mr-1" />
                                3D
                              </Badge>
                            )}
                            {item.quiz_questions && (
                              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                <Brain className="h-3 w-3 mr-1" />
                                Quiz
                              </Badge>
                            )}
                            {item.is_validated && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Validé
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openItemModal(item)}
                          >
                            <Maximize2 className="h-4 w-4 mr-1" />
                            Mode Immersif
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => openItemModal(item)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Détails
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Item Modal */}
      <EdnItemModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
      />
    </div>
  );
}