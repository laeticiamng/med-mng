
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, BookOpen, Music, Users, Brain, 
  Play, Headphones, Image, FileText, CheckCircle,
  Sparkles, ArrowRight, Volume2, Gamepad2,
  Maximize2, Eye, Star, Target, Award
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { EdnItemModal } from "@/components/edn/premium/EdnItemModal";
import { EdnItemCard } from "@/components/edn/premium/EdnItemCard";
import { ConsistentBackground } from "@/components/layout/ConsistentBackground";
import { PageHeader } from "@/components/layout/PageHeader";

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
}

const EdnIndex = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<EdnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<EdnItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchAllItems();
  }, []);

  const fetchAllItems = async () => {
    try {
      setLoading(true);
      // Use Supabase direct query instead of broken endpoint
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('edn_items_complete')
        .select('*')
        .order('item_code');

      if (fallbackError) {
        console.error('Erreur lors du chargement des items:', fallbackError);
        toast({
          title: "Erreur",
          description: "Impossible de charger les items EDN.",
          variant: "destructive"
        });
        return;
      }

      setItems(fallbackData || []);
      toast({
        title: "✅ Interface EDN MED MNG",
        description: `${fallbackData?.length || 0} items EDN chargés • Tous les rangs complets`,
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

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
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.subtitle && item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (selectedCategory === 'all') return matchesSearch;
      
      const itemNumber = parseInt(item.item_code.replace('IC-', '') || '0');
      switch (selectedCategory) {
        case 'foundation':
          return matchesSearch && itemNumber <= 100;
        case 'clinical':
          return matchesSearch && itemNumber >= 101 && itemNumber <= 250;
        case 'advanced':
          return matchesSearch && itemNumber >= 251;
        case 'complete':
          return matchesSearch && isItemComplete(item);
        default:
          return matchesSearch;
      }
    }).sort((a, b) => {
      const numA = parseInt(a.item_code.replace('IC-', '') || '0');
      const numB = parseInt(b.item_code.replace('IC-', '') || '0');
      return numA - numB;
    });
  }, [items, searchTerm, selectedCategory]);

  const calculateStats = () => {
    const total = items.length;
    const displayed = filteredItems.length;
    
    const complete = items.filter(isItemComplete).length;
    const withMusic = items.filter(item => 
      item.paroles_musicales && item.paroles_musicales.length > 0
    ).length;
    const withScene = items.filter(item => !!item.scene_immersive).length;
    const withQuiz = items.filter(item => !!item.quiz_questions).length;
    const completion = Math.round((complete / total) * 100);
    
    return { total, displayed, complete, withMusic, withScene, withQuiz, completion };
  };

  const openItemModal = (item: EdnItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <ConsistentBackground variant="secondary">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6 relative z-10">
            <div className="w-20 h-20 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Chargement MED MNG EDN
              </h2>
              <p className="text-gray-300 text-lg">
                Préparation des 367 items avec compétences complètes...
              </p>
            </div>
          </div>
        </div>
      </ConsistentBackground>
    );
  }

  return (
    <ConsistentBackground variant="secondary">
      <PageHeader 
        title="Items EDN MED MNG • Interface Musicale" 
        subtitle="367 items • Rangs A & B complets • Génération IA avancée" 
        backTo="/" 
      />
      
      {/* Header Suno-inspired */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 shadow-2xl shadow-purple-500/10">
        <div className="container mx-auto px-4 py-6 relative">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50 relative">
                <BookOpen className="h-8 w-8 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-3xl blur animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-green-400/30">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-green-300 text-sm font-medium">100% des compétences UNESS intégrées</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-purple-400/30">
                <Music className="h-4 w-4 text-purple-400" />
                <span className="text-purple-300 text-sm font-medium">Interface premium unifiée</span>
              </div>
            </div>
          </div>

          {/* Search and Filters Premium */}
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 ${isMobile ? 'h-5 w-5' : 'h-5 w-5'}`} />
              <Input
                placeholder={isMobile ? "Rechercher items..." : "Rechercher parmi les 367 items (titre, code IC-1, compétences, rangs...)"}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-12 pr-4 ${isMobile ? 'py-4 text-base rounded-xl' : 'py-3 text-lg'} bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 focus:shadow-lg focus:scale-[1.02]`}
              />
              {searchTerm && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-full text-gray-400 hover:text-white"
                  onClick={() => setSearchTerm('')}
                >
                  ×
                </Button>
              )}
            </div>
            
            {isMobile ? (
              // Filtres mobiles style Suno
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'all', label: 'Tous', count: stats.total },
                  { value: 'complete', label: 'Complets', count: stats.complete },
                  { value: 'foundation', label: 'Base', count: items.filter(item => parseInt(item.item_code.replace('IC-', '') || '0') <= 100).length },
                  { value: 'clinical', label: 'Clinique', count: items.filter(item => { const num = parseInt(item.item_code.replace('IC-', '') || '0'); return num >= 101 && num <= 250; }).length }
                ].map((filter) => (
                  <Button
                    key={filter.value}
                    variant={selectedCategory === filter.value ? "default" : "outline"}
                    className={`
                      h-auto py-4 px-4 flex flex-col gap-1 transition-all duration-300 active:scale-95 rounded-2xl
                      ${selectedCategory === filter.value 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl shadow-purple-500/50 transform scale-105 border-purple-400/50' 
                        : 'bg-white/10 backdrop-blur-sm text-gray-300 hover:text-white hover:bg-white/20 border-white/20 hover:border-purple-400/50 hover:shadow-lg'
                      }
                    `}
                    onClick={() => setSelectedCategory(filter.value)}
                  >
                    <span className="text-sm font-semibold">{filter.label}</span>
                    <span className={`text-xs ${selectedCategory === filter.value ? 'text-purple-100' : 'text-gray-400'}`}>
                      {filter.count}
                    </span>
                  </Button>
                ))}
              </div>
            ) : (
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-black/40 backdrop-blur-sm border border-white/20 rounded-2xl">
                  <TabsTrigger value="all" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 rounded-xl">Tous (367)</TabsTrigger>
                  <TabsTrigger value="foundation" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 rounded-xl">Base (1-100)</TabsTrigger>
                  <TabsTrigger value="clinical" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 rounded-xl">Clinique (101-250)</TabsTrigger>
                  <TabsTrigger value="advanced" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 rounded-xl">Avancé (251-367)</TabsTrigger>
                  <TabsTrigger value="complete" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 rounded-xl">Complets 100%</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar Suno-style */}
      <div className="bg-black/20 backdrop-blur-xl border-y border-white/10 py-6 relative">
        <div className="container mx-auto px-4">
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'} gap-4 mb-6`}>
            {[
              { title: "Items Total", value: stats.total, subtitle: "IC-1 à IC-367", icon: BookOpen, color: "text-blue-400", bgColor: "bg-blue-500/20", borderColor: "border-blue-400/30" },
              { title: "Affichés", value: stats.displayed, subtitle: "Filtrés", icon: Target, color: "text-purple-400", bgColor: "bg-purple-500/20", borderColor: "border-purple-400/30" },
              { title: "Complets", value: stats.complete, subtitle: `${stats.completion}%`, icon: CheckCircle, color: "text-green-400", bgColor: "bg-green-500/20", borderColor: "border-green-400/30" },
              { title: "Avec Musique", value: stats.withMusic, subtitle: "Paroles intégrées", icon: Music, color: "text-pink-400", bgColor: "bg-pink-500/20", borderColor: "border-pink-400/30" },
              { title: "Scènes Immersives", value: stats.withScene, subtitle: "Expériences 3D", icon: Users, color: "text-orange-400", bgColor: "bg-orange-500/20", borderColor: "border-orange-400/30" },
              { title: "Quiz Interactifs", value: stats.withQuiz, subtitle: "Évaluations", icon: Brain, color: "text-indigo-400", bgColor: "bg-indigo-500/20", borderColor: "border-indigo-400/30" }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className={`${stat.bgColor} backdrop-blur-sm border ${stat.borderColor} hover:border-opacity-70 hover:shadow-2xl transition-all duration-300 hover:scale-105 group`}>
                  <CardContent className={`${isMobile ? 'p-3' : 'p-4'} text-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <IconComponent className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} ${stat.color} mx-auto mb-2`} />
                      <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold ${stat.color} mb-1`}>{stat.value}</div>
                      <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-300 mb-1`}>{isMobile ? stat.title.split(' ')[0] : stat.title}</div>
                      {!isMobile && <div className="text-xs text-gray-400">{stat.subtitle}</div>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Progression globale style Suno */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-yellow-400" />
                <span className="font-semibold text-white text-lg">Progression Globale EDN</span>
              </div>
              <span className="text-2xl font-bold text-green-400">{stats.completion}%</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-4 mb-2">
              <div 
                className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 h-4 rounded-full transition-all duration-1000 shadow-lg shadow-green-500/50"
                style={{ width: `${stats.completion}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>0</span>
              <span className="text-green-400 font-medium">{stats.complete} items complets</span>
              <span>367</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-2xl max-w-md mx-auto">
              <BookOpen className="h-20 w-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-3">Aucun item trouvé</h3>
              <p className="text-gray-300">Essayez de modifier vos critères de recherche ou de filtrage.</p>
            </div>
          </div>
        ) : (
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'}`}>
            {filteredItems.map((item) => (
              <EdnItemCard
                key={item.id}
                item={item}
                completionPercentage={getCompletionPercentage(item)}
                onOpen={() => openItemModal(item)}
              />
            ))}
          </div>
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
    </ConsistentBackground>
  );
};

export default EdnIndex;
