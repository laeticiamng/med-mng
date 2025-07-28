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
import { LyricsCompletionStatus } from "@/components/LyricsCompletionStatus";

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
        .from('edn_items_immersive')
        .select(`
          id, item_code, title, subtitle, slug, 
          paroles_rang_a, paroles_rang_b, paroles_rang_ab,
          tableau_rang_a, tableau_rang_b, scene_immersive,
          quiz_questions, updated_at
        `)
        .order('item_code')
        .limit(50);

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
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-muted">
                <TabsTrigger value="immersive" className="text-xs">Immersif</TabsTrigger>
                <TabsTrigger value="complete" className="text-xs">Complet</TabsTrigger>
                <TabsTrigger value="music" className="text-xs">Paroles</TabsTrigger>
                <TabsTrigger value="unified" className="text-xs">Unifié</TabsTrigger>
              </TabsList>
            </Tabs>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map(item => (
                    <Card key={item.id} className="cursor-pointer hover:shadow-sm" onClick={() => openItemModal(item)}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{item.item_code}</h3>
                            <Badge variant="outline">{getCompletionPercentage(item)}%</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.title}</p>
                          <div className="flex gap-1 flex-wrap">
                            {item.scene_immersive && (
                              <Badge variant="secondary" className="text-xs">3D</Badge>
                            )}
                            {item.quiz_questions && (
                              <Badge variant="secondary" className="text-xs">Quiz</Badge>
                            )}
                            {item.paroles_musicales && item.paroles_musicales.length > 0 && (
                              <Badge variant="secondary" className="text-xs">Musique</Badge>
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
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{item.item_code}</h3>
                            <p className="text-sm text-muted-foreground">{item.title}</p>
                          </div>
                          <Badge variant="outline">{getCompletionPercentage(item)}%</Badge>
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

      {/* Modal */}
      <EdnItemModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}