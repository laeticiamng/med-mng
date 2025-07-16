
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .order('item_code');

      if (error) {
        console.error('Erreur lors du chargement des items:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les items EDN.",
          variant: "destructive"
        });
        return;
      }

      setItems(data || []);
      toast({
        title: "✅ Interface EDN MED MNG",
        description: `${data?.length || 0} items EDN chargés • Tous les rangs complets`,
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Chargement MED MNG EDN
            </h2>
            <p className="text-gray-600">
              Préparation des 367 items avec compétences complètes...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header Unifié */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-purple-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Items EDN MED MNG • Interface Unifiée
                </h1>
                <p className="text-gray-600">367 items • Rangs A & B complets • Tous contenus pédagogiques</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-green-600 font-medium">
                100% des compétences UNESS intégrées • Interface premium unifiée
              </span>
            </div>
          </div>

          {/* Search and Filters Premium Mobile */}
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${isMobile ? 'h-5 w-5' : 'h-5 w-5'}`} />
              <Input
                placeholder={isMobile ? "Rechercher items..." : "Rechercher parmi les 367 items (titre, code IC-1, compétences, rangs...)"}
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
            
            {isMobile ? (
              // Filtres mobiles améliorés
              <div className="grid grid-cols-2 gap-2">
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
                      h-auto py-3 px-3 flex flex-col gap-1 transition-all duration-300 active:scale-95
                      ${selectedCategory === filter.value 
                        ? 'bg-purple-600 text-white shadow-lg transform scale-105' 
                        : 'bg-white/80 hover:bg-purple-50 hover:border-purple-300'
                      }
                    `}
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
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-white/70">
                  <TabsTrigger value="all">Tous (367)</TabsTrigger>
                  <TabsTrigger value="foundation">Base (1-100)</TabsTrigger>
                  <TabsTrigger value="clinical">Clinique (101-250)</TabsTrigger>
                  <TabsTrigger value="advanced">Avancé (251-367)</TabsTrigger>
                  <TabsTrigger value="complete">Complets 100%</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white/60 backdrop-blur-sm border-y border-purple-200/50 py-4">
        <div className="container mx-auto px-4">
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'} gap-2 mb-4`}>
            {[
              { title: "Items Total", value: stats.total, subtitle: "IC-1 à IC-367", icon: BookOpen, color: "text-blue-600", bgColor: "bg-blue-50" },
              { title: "Affichés", value: stats.displayed, subtitle: "Filtrés", icon: Target, color: "text-purple-600", bgColor: "bg-purple-50" },
              { title: "Complets", value: stats.complete, subtitle: `${stats.completion}%`, icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50" },
              { title: "Avec Musique", value: stats.withMusic, subtitle: "Paroles intégrées", icon: Music, color: "text-pink-600", bgColor: "bg-pink-50" },
              { title: "Scènes Immersives", value: stats.withScene, subtitle: "Expériences 3D", icon: Users, color: "text-orange-600", bgColor: "bg-orange-50" },
              { title: "Quiz Interactifs", value: stats.withQuiz, subtitle: "Évaluations", icon: Brain, color: "text-indigo-600", bgColor: "bg-indigo-50" }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className={`${stat.bgColor} border-2 hover:shadow-lg transition-all duration-300`}>
                  <CardContent className={`${isMobile ? 'p-2' : 'p-4'} text-center`}>
                    <IconComponent className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} ${stat.color} mx-auto mb-2`} />
                    <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold ${stat.color}`}>{stat.value}</div>
                    <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-700 mb-1`}>{isMobile ? stat.title.split(' ')[0] : stat.title}</div>
                    {!isMobile && <div className="text-xs text-gray-500">{stat.subtitle}</div>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Progression globale */}
          <div className="bg-white/80 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold text-gray-800">Progression Globale EDN</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.completion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.completion}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>0</span>
              <span>{stats.complete} items complets</span>
              <span>367</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun item trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos critères de recherche ou de filtrage.</p>
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
    </div>
  );
};

export default EdnIndex;
