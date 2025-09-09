import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateRichAdvancedLyrics } from '@/utils/lyrics/generateRichAdvancedLyrics';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Music, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  TrendingUp,
  Award,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface GlobalStats {
  totalItems: number;
  itemsWithRangA: number;
  itemsWithRangB: number;
  itemsWithRangAB: number;
  completionPercentage: number;
  recentlyUpdated: number;
}

interface GenerationResult {
  processed: number;
  success: number;
  failed: number;
  errors: string[];
}

export const GlobalLyricsManager: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('edn_items_complete')
        .select('item_code, paroles_rang_a, paroles_rang_b, paroles_rang_ab, updated_at');

      if (error) throw error;

      const totalItems = data?.length || 0;
      const itemsWithRangA = data?.filter(item => item.paroles_rang_a && item.paroles_rang_a.length > 0).length || 0;
      const itemsWithRangB = data?.filter(item => item.paroles_rang_b && item.paroles_rang_b.length > 0).length || 0;
      const itemsWithRangAB = data?.filter(item => item.paroles_rang_ab && item.paroles_rang_ab.length > 0).length || 0;
      
      const recentlyUpdated = data?.filter(item => {
        const updated = new Date(item.updated_at);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return updated > dayAgo;
      }).length || 0;

      const completionPercentage = totalItems > 0 
        ? Math.round(((itemsWithRangA + itemsWithRangB + itemsWithRangAB) / (totalItems * 3)) * 100)
        : 0;

      setStats({
        totalItems,
        itemsWithRangA,
        itemsWithRangB,
        itemsWithRangAB,
        completionPercentage,
        recentlyUpdated
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible de charger les statistiques',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAllLyrics = async (mode: 'ALL' | 'MISSING' = 'ALL') => {
    setIsLoading(true);
    setGenerationResult(null);
    
    try {
      logger.info('Starting global rich lyrics generation', {
        component: 'GlobalLyricsManager',
        action: 'generate_all_lyrics',
        metadata: { mode }
      });
      
      // Utiliser la nouvelle Edge Function optimisée
      const { data, error } = await supabase.functions.invoke('generate-all-lyrics-rich', {
        body: { regenerateAll: mode === 'ALL' }
      });

      if (error) throw error;

      setGenerationResult(data);
      await loadStats();

      toast({
        title: '🎉 Génération OpenAI terminée',
        description: `${data.success} items traités avec paroles musicales de qualité`,
      });

    } catch (genError) {
      console.error('Erreur génération globale:', genError);
      toast({
        title: '❌ Erreur génération',
        description: 'Problème lors de la génération avec OpenAI',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

interface ItemData {
  item_code?: string;
}

interface Competence {
  description?: string;
  intitule?: string;
}

  // Fonction de génération locale des paroles
  const generateLocalLyrics = (itemData: ItemData, competences: Competence[], rang: 'A' | 'B' | 'AB'): string[] => {
    const lines: string[] = [];
    
    lines.push(`[Couplet 1]`);
    
    if (competences.length > 0) {
      competences.slice(0, 3).forEach((comp, i) => {
        const description = comp.description?.substring(0, 180) || comp.intitule || '';
        const cleanText = description.replace(/[<>=\[\]]/g, '').trim();
        lines.push(`${cleanText.split(' ').slice(0, 10).join(' ')}, concept médical essentiel`);
        
        if (i === 1) {
          lines.push(`Science et pratique s'harmonisent, mélodie du savoir`);
        }
      });
    } else {
      lines.push(`${itemData?.item_code || 'Item'} révèle sa science, méthode et rigueur`);
      lines.push(`Rang ${rang} structure la pensée, fondation solide`);
      lines.push(`Chaque notion s'inscrit, mémoire permanente`);
    }
    
    lines.push('');
    lines.push(`[Refrain]`);
    lines.push(`Flow médical, rythme et savoir convergent`);
    lines.push(`${rang === 'AB' ? 'Synthèse totale' : `Rang ${rang} maîtrisé`}, expertise émergente`);
    lines.push(`Dans ces vers ciselés, la connaissance danse`);
    lines.push(`QCM victorieux grâce à cette résonance`);
    
    lines.push('');
    lines.push(`[Couplet 2]`);
    
    if (competences.length > 3) {
      competences.slice(3, 6).forEach((comp) => {
        const cleanText = (comp.description || comp.intitule || '').replace(/[<>=\[\]]/g, '').substring(0, 140);
        lines.push(`${cleanText.split(' ').slice(0, 9).join(' ')}, pratique affirmée`);
      });
    } else {
      lines.push(`Diagnostic précis, thérapie ciblée`);
      lines.push(`Patient accompagné, humanité préservée`);
      lines.push(`Excellence clinique, objectif atteint`);
    }
    
    lines.push('');
    lines.push(`[Refrain Final]`);
    lines.push(`Flow médical, rythme et savoir convergent`);
    lines.push(`${rang === 'AB' ? 'Maîtrise complète' : `Rang ${rang} ancré`}, expertise permanente`);
    lines.push(`Ces paroles gravées, mémorisation assurée`);
    lines.push(`${itemData?.item_code || 'Item'} conquis, réussite programmée`);
    
    return lines.filter(line => line.length > 0);
  };

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    variant = 'default' 
  }: { 
    title: string; 
    value: string | number; 
    description: string; 
    icon: React.ComponentType<{ className?: string }>; 
    variant?: 'default' | 'success' | 'warning' | 'destructive';
  }) => (
    <Card className={`${
      variant === 'success' ? 'border-green-200 bg-green-50 dark:bg-green-950/20' :
      variant === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20' :
      variant === 'destructive' ? 'border-red-200 bg-red-50 dark:bg-red-950/20' :
      'border-blue-200 bg-blue-50 dark:bg-blue-950/20'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-6 w-6" />
            Gestionnaire Global de Paroles Musicales
          </CardTitle>
          <p className="text-muted-foreground">
            Génération et suivi des paroles médicales pour les 367 items EDN avec qualité optimale
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button
              onClick={() => generateAllLyrics('ALL')}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Régénérer Tout (367 Items)
            </Button>
            <Button
              onClick={() => generateAllLyrics('MISSING')}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Compléter Manquants
            </Button>
            <Button
              onClick={loadStats}
              disabled={isLoading}
              variant="outline"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Actualiser Stats
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="progress">Progression</TabsTrigger>
              <TabsTrigger value="quality">Qualité</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard
                    title="Items Totaux"
                    value={stats.totalItems}
                    description="Items EDN disponibles"
                    icon={Award}
                    variant="default"
                  />
                  <StatCard
                    title="Rang A Générés"
                    value={stats.itemsWithRangA}
                    description={`${Math.round((stats.itemsWithRangA / stats.totalItems) * 100)}% complétés`}
                    icon={CheckCircle}
                    variant="success"
                  />
                  <StatCard
                    title="Rang B Générés"
                    value={stats.itemsWithRangB}
                    description={`${Math.round((stats.itemsWithRangB / stats.totalItems) * 100)}% complétés`}
                    icon={CheckCircle}
                    variant="success"
                  />
                  <StatCard
                    title="Mix A+B Générés"
                    value={stats.itemsWithRangAB}
                    description={`${Math.round((stats.itemsWithRangAB / stats.totalItems) * 100)}% complétés`}
                    icon={TrendingUp}
                    variant="success"
                  />
                </div>
              )}

              {stats && (
                <Card>
                  <CardHeader>
                    <CardTitle>Progression Globale</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Complétude générale</span>
                          <span>{stats.completionPercentage}%</span>
                        </div>
                        <Progress value={stats.completionPercentage} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Rang A</span>
                            <span>{Math.round((stats.itemsWithRangA / stats.totalItems) * 100)}%</span>
                          </div>
                          <Progress value={(stats.itemsWithRangA / stats.totalItems) * 100} className="h-1" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Rang B</span>
                            <span>{Math.round((stats.itemsWithRangB / stats.totalItems) * 100)}%</span>
                          </div>
                          <Progress value={(stats.itemsWithRangB / stats.totalItems) * 100} className="h-1" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Mix A+B</span>
                            <span>{Math.round((stats.itemsWithRangAB / stats.totalItems) * 100)}%</span>
                          </div>
                          <Progress value={(stats.itemsWithRangAB / stats.totalItems) * 100} className="h-1" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="progress" className="mt-6">
              {generationResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>Résultats de Génération</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <StatCard
                        title="Traités"
                        value={generationResult.processed}
                        description="Items processés"
                        icon={BarChart3}
                      />
                      <StatCard
                        title="Réussis"
                        value={generationResult.success}
                        description="Générations réussies"
                        icon={CheckCircle}
                        variant="success"
                      />
                      <StatCard
                        title="Échecs"
                        value={generationResult.failed}
                        description="Générations échouées"
                        icon={AlertCircle}
                        variant={generationResult.failed > 0 ? "destructive" : "default"}
                      />
                    </div>
                    
                    {generationResult.errors.length > 0 && (
                      <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                        <CardHeader>
                          <CardTitle className="text-red-800 dark:text-red-200">
                            Erreurs de Génération
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {generationResult.errors.map((error, i) => (
                              <div key={i} className="text-sm text-red-700 dark:text-red-300">
                                {error}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="quality" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Critères de Qualité Musicale</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">🎵 Style & Structure</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          Phrases médicales structurées et rythméessystemy
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          Assonances et allitérations variées par strophe
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          Vocabulaire riche sans jargon gratuit
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          Structure complète: Couplets + Refrains
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">🎯 Contenu Médical</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          Toutes les compétences OIC intégrées
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          Exactitude terminologique médicale
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          Cohérence pédagogique pour mémorisation
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          Optimisé pour faciliter l'apprentissage
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      🏆 Objectif Note 20/20
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Chaque génération vise l'excellence pour garantir une mémorisation optimale et une maîtrise 
                      complète des compétences médicales. Le format musical permet une meilleure rétention grâce aux
                      associations créatives et aux structures rythmiques.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};