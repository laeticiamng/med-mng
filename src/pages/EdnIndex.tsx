
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Search, Filter, CheckCircle, Music, Users, Brain, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  updated_at: string;
}

const EdnIndex = () => {
  const [items, setItems] = useState<EdnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
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
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.subtitle && item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (selectedCategory === 'all') return matchesSearch;
    
    // Catégorisation basée sur le code d'item
    const itemNumber = parseInt(item.item_code.replace('IC-', '') || '0');
    switch (selectedCategory) {
      case 'foundation':
        return matchesSearch && itemNumber <= 3;
      case 'clinical':
        return matchesSearch && itemNumber >= 4 && itemNumber <= 7;
      case 'advanced':
        return matchesSearch && itemNumber >= 8;
      default:
        return matchesSearch;
    }
  });

  const getItemStatus = (item: EdnItem) => {
    const hasRangA = !!item.tableau_rang_a;
    const hasRangB = !!item.tableau_rang_b;
    const hasMusic = !!(item.paroles_musicales && item.paroles_musicales.length > 0);
    const hasScene = !!item.scene_immersive;
    const hasQuiz = !!item.quiz_questions;
    
    const completionCount = [hasRangA, hasRangB, hasMusic, hasScene, hasQuiz].filter(Boolean).length;
    
    if (completionCount === 5) return { status: 'Complet', color: 'bg-green-500', variant: 'default' as const };
    if (completionCount >= 3) return { status: 'Avancé', color: 'bg-blue-500', variant: 'secondary' as const };
    if (completionCount >= 1) return { status: 'Partiel', color: 'bg-yellow-500', variant: 'outline' as const };
    return { status: 'Basique', color: 'bg-gray-500', variant: 'outline' as const };
  };

  const getItemFeatures = (item: EdnItem) => {
    const features = [];
    if (item.tableau_rang_a) features.push({ icon: BookOpen, text: 'Rang A' });
    if (item.tableau_rang_b) features.push({ icon: BookOpen, text: 'Rang B' });
    if (item.paroles_musicales && item.paroles_musicales.length > 0) features.push({ icon: Music, text: 'Musique' });
    if (item.scene_immersive) features.push({ icon: Users, text: 'Scène' });
    if (item.quiz_questions) features.push({ icon: Brain, text: 'Quiz' });
    return features;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Chargement des items EDN...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Items EDN Immersifs</h1>
          <Sparkles className="h-6 w-6 text-yellow-500" />
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
          Découvrez nos {items.length} items de connaissance pour l'Examen National Dématérialisé, 
          enrichis de contenus interactifs, paroles musicales et scénarios immersifs.
        </p>
        <div className="flex items-center justify-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-sm text-green-600 font-medium">
            Contenus officiels corrigés et validés
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un item par titre, code ou contenu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="foundation">Base</TabsTrigger>
            <TabsTrigger value="clinical">Clinique</TabsTrigger>
            <TabsTrigger value="advanced">Avancé</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{items.length}</div>
            <div className="text-sm text-muted-foreground">Items Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {items.filter(item => getItemStatus(item).status === 'Complet').length}
            </div>
            <div className="text-sm text-muted-foreground">Complets</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">
              {items.filter(item => item.paroles_musicales && item.paroles_musicales.length > 0).length}
            </div>
            <div className="text-sm text-muted-foreground">Avec Musique</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">
              {items.filter(item => item.scene_immersive).length}
            </div>
            <div className="text-sm text-muted-foreground">Immersifs</div>
          </CardContent>
        </Card>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const itemStatus = getItemStatus(item);
          const features = getItemFeatures(item);
          
          return (
            <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className="text-xs font-mono">
                    {item.item_code}
                  </Badge>
                  <Badge variant={itemStatus.variant} className="text-xs">
                    {itemStatus.status}
                  </Badge>
                </div>
                <div>
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {item.title}
                  </CardTitle>
                  {item.subtitle && (
                    <CardDescription className="text-sm mt-2">
                      {item.subtitle}
                    </CardDescription>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {features.map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                      <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                        <IconComponent className="h-3 w-3" />
                        <span>{feature.text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Last updated */}
                <div className="text-xs text-muted-foreground">
                  Mis à jour: {new Date(item.updated_at).toLocaleDateString('fr-FR')}
                </div>

                <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
                  <Link to={`/edn/${item.slug}`} className="flex items-center justify-center gap-2">
                    Explorer l'item
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun item trouvé</h3>
          <p className="text-muted-foreground">
            Essayez de modifier vos critères de recherche ou de filtrage.
          </p>
        </div>
      )}
    </div>
  );
};

export default EdnIndex;
