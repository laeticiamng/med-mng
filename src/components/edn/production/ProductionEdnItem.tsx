/**
 * 🚀 COMPOSANT ITEM EDN PRODUCTION
 * Affichage optimisé d'un item EDN individuel
 * ✅ Performance maximale
 * ✅ Intégration complète des APIs
 * ✅ Expérience utilisateur premium
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Play, Pause, Download, Share2, Heart,
  BookOpen, Music, Brain, Zap, CheckCircle, Award,
  Users, TrendingUp, Clock, Calendar
} from 'lucide-react';

// Import des composants avancés optimisés
import { AdvancedSceneImmersive } from '../advanced/AdvancedSceneImmersive';
import { AdvancedGenerationMusicale } from '../advanced/AdvancedGenerationMusicale';
import { AdvancedBandeDessinee } from '../advanced/AdvancedBandeDessinee';
import { AdvancedQuizInteractif } from '../advanced/AdvancedQuizInteractif';
import { EnhancedTableauDisplay } from '../advanced/EnhancedTableauDisplay';

interface ProductionEdnItemData {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  paroles_musicales?: string[];
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  scene_immersive?: any;
  quiz_questions?: any;
  competences_oic_rang_a?: any[];
  competences_oic_rang_b?: any[];
  completeness_score: number;
  is_validated: boolean;
  specialite?: string;
  created_at: string;
  updated_at: string;
  payload_v2?: any;
}

type SectionType = 'tableau-a' | 'tableau-b' | 'scene' | 'bd' | 'music' | 'quiz';

const ProductionEdnItem: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [item, setItem] = useState<ProductionEdnItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionType>('tableau-a');
  const [sectionProgress, setSectionProgress] = useState<Record<SectionType, number>>({
    'tableau-a': 0,
    'tableau-b': 0,
    'scene': 0,
    'bd': 0,
    'music': 0,
    'quiz': 0
  });

  // Chargement de l'item
  useEffect(() => {
    const fetchItem = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('edn_items_complete')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setError('Item EDN non trouvé');
          return;
        }

        const itemData: ProductionEdnItemData = {
          ...data,
          competences_oic_rang_a: Array.isArray(data.competences_oic_rang_a) ? data.competences_oic_rang_a : [],
          competences_oic_rang_b: Array.isArray(data.competences_oic_rang_b) ? data.competences_oic_rang_b : [],
          completeness_score: data.completeness_score || 0,
          is_validated: data.is_validated || false
        };

        setItem(itemData);

        toast({
          title: "✅ Item EDN chargé",
          description: `${itemData.item_code} - ${itemData.title}`,
          variant: "default"
        });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement';
        setError(errorMessage);
        toast({
          title: "❌ Erreur de chargement",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [slug, toast]);

  // Gestion du progrès des sections
  const handleSectionProgress = useCallback((section: SectionType, progress: number) => {
    setSectionProgress(prev => ({
      ...prev,
      [section]: progress
    }));
  }, []);

  // Calcul du progrès global
  const getOverallProgress = () => {
    const sections: SectionType[] = ['tableau-a', 'tableau-b', 'scene', 'bd', 'music', 'quiz'];
    const totalProgress = sections.reduce((sum, section) => sum + sectionProgress[section], 0);
    return Math.round(totalProgress / sections.length);
  };

  // Génération musicale
  const handleGenerateMusic = async () => {
    if (!item?.paroles_musicales?.length) {
      toast({
        title: "❌ Impossible de générer",
        description: "Aucunes paroles disponibles",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('suno-music-optimized', {
        body: {
          lyrics: item.paroles_musicales.join('\n'),
          title: `${item.item_code} - ${item.title}`,
          style: 'medical educational ambient',
          duration: 120,
          fastMode: true,
          optimized: true
        }
      });

      if (error) throw error;

      if (data?.audioUrl) {
        toast({
          title: "🎵 Musique générée",
          description: "Audio disponible",
          variant: "default"
        });
      }
    } catch (err) {
      toast({
        title: "❌ Erreur génération",
        description: "Impossible de générer la musique",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-2xl font-semibold text-foreground">Chargement de l'item EDN</h2>
          <p className="text-muted-foreground">Connexion aux données de production...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">❌ Erreur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error || 'Item EDN non trouvé'}</p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/edn-production')} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la liste EDN
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                Recharger la page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header de l'item */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link to="/edn-production">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  EDN Production
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{item.title}</h1>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="font-mono">
                      {item.item_code}
                    </Badge>
                    {item.is_validated && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        ✅ Validé
                      </Badge>
                    )}
                    {item.specialite && (
                      <Badge variant="secondary">
                        {item.specialite}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`text-lg font-bold ${item.completeness_score >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
                  {item.completeness_score}%
                </div>
                <div className="text-sm text-muted-foreground">Complétude</div>
              </div>
              <Progress value={item.completeness_score} className="w-24 h-2" />
            </div>
          </div>

          {/* Sous-titre et méta-informations */}
          {item.subtitle && (
            <p className="text-muted-foreground text-lg mb-4">{item.subtitle}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Mis à jour {new Date(item.updated_at).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>Étudiants EDN</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {item.paroles_musicales?.length && (
                <Button size="sm" onClick={handleGenerateMusic}>
                  <Music className="h-4 w-4 mr-2" />
                  Générer Musique
                </Button>
              )}
              <Button size="sm" variant="outline">
                <Heart className="h-4 w-4 mr-2" />
                Favoris
              </Button>
              <Button size="sm" variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal avec onglets */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as SectionType)}>
          <TabsList className="grid w-full grid-cols-6 max-w-4xl mx-auto mb-8">
            <TabsTrigger value="tableau-a" className="flex items-center space-x-2">
              <span>📊</span>
              <span className="hidden sm:inline">Tableau A</span>
              {sectionProgress['tableau-a'] >= 100 && <CheckCircle className="h-4 w-4 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="tableau-b" className="flex items-center space-x-2">
              <span>📈</span>
              <span className="hidden sm:inline">Tableau B</span>
              {sectionProgress['tableau-b'] >= 100 && <CheckCircle className="h-4 w-4 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="scene" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Scène</span>
              {sectionProgress['scene'] >= 100 && <CheckCircle className="h-4 w-4 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="bd" className="flex items-center space-x-2">
              <span>📚</span>
              <span className="hidden sm:inline">BD</span>
              {sectionProgress['bd'] >= 100 && <CheckCircle className="h-4 w-4 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="music" className="flex items-center space-x-2">
              <Music className="h-4 w-4" />
              <span className="hidden sm:inline">Musique</span>
              {sectionProgress['music'] >= 100 && <CheckCircle className="h-4 w-4 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Quiz</span>
              {sectionProgress['quiz'] >= 100 && <CheckCircle className="h-4 w-4 text-green-500" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tableau-a">
            <EnhancedTableauDisplay 
              item={item} 
              rang="A"
              onProgress={(progress) => handleSectionProgress('tableau-a', progress)}
            />
          </TabsContent>

          <TabsContent value="tableau-b">
            <EnhancedTableauDisplay 
              item={item} 
              rang="B"
              onProgress={(progress) => handleSectionProgress('tableau-b', progress)}
            />
          </TabsContent>

          <TabsContent value="scene">
            <AdvancedSceneImmersive 
              item={item}
              onProgress={(progress) => handleSectionProgress('scene', progress)}
            />
          </TabsContent>

          <TabsContent value="bd">
            <AdvancedBandeDessinee 
              item={item}
              onProgress={(progress) => handleSectionProgress('bd', progress)}
            />
          </TabsContent>

          <TabsContent value="music">
            <AdvancedGenerationMusicale 
              item={item}
              onProgress={(progress) => handleSectionProgress('music', progress)}
            />
          </TabsContent>

          <TabsContent value="quiz">
            <AdvancedQuizInteractif 
              item={item}
              onProgress={(progress) => handleSectionProgress('quiz', progress)}
            />
          </TabsContent>
        </Tabs>

        {/* Progrès global */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Progression globale</h3>
              <div className="text-2xl font-bold text-primary">
                {getOverallProgress()}%
              </div>
            </div>
            <Progress value={getOverallProgress()} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>Débutant</span>
              <span>Intermédiaire</span>
              <span>Expert</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductionEdnItem;