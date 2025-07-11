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
  Maximize2, Eye, Star
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EdnItemModal } from "@/components/edn/premium/EdnItemModal";
import { VirtualizedGrid } from "@/components/edn/premium/VirtualizedGrid";
import { EdnItemCard } from "@/components/edn/premium/EdnItemCard";
import { EdnStatsBar } from "@/components/edn/premium/EdnStatsBar";

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

const EdnPremiumDashboard = () => {
  const [items, setItems] = useState<EdnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<EdnItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

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
        title: "✅ Chargement terminé",
        description: `${data?.length || 0} items EDN chargés avec succès`,
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur système",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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

  const openItemModal = (item: EdnItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Chargement de la plateforme premium
            </h2>
            <p className="text-gray-600">
              Préparation des 367 items EDN avec tous leurs contenus...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header Premium */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-purple-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  EDN Premium Dashboard
                </h1>
                <p className="text-gray-600">367 items • Accès complet • Interface immersive</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
              <CheckCircle className="h-4 w-4 mr-1" />
              100% Contenus
            </Badge>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Rechercher parmi les 367 items (titre, code IC-1, compétences, mots-clés...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg border-purple-200 focus:border-purple-400 bg-white/70"
              />
            </div>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full lg:w-auto">
              <TabsList className="grid w-full grid-cols-5 bg-white/70">
                <TabsTrigger value="all">Tous (367)</TabsTrigger>
                <TabsTrigger value="foundation">Base (1-100)</TabsTrigger>
                <TabsTrigger value="clinical">Clinique (101-250)</TabsTrigger>
                <TabsTrigger value="advanced">Avancé (251-367)</TabsTrigger>
                <TabsTrigger value="complete">Complets</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <EdnStatsBar items={items} filteredItems={filteredItems} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun item trouvé</h3>
            <p className="text-gray-600">
              Essayez de modifier vos critères de recherche ou de filtrage.
            </p>
          </div>
        ) : (
          <VirtualizedGrid
            items={filteredItems}
            renderItem={(item) => (
              <EdnItemCard
                key={item.id}
                item={item}
                completionPercentage={getCompletionPercentage(item)}
                onOpen={() => openItemModal(item)}
              />
            )}
            itemHeight={400}
            gap={24}
          />
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

export default EdnPremiumDashboard;