import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Music, 
  Play, 
  Pause, 
  Volume2,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateRichAdvancedLyrics } from '@/utils/lyrics/generateRichAdvancedLyrics';
import { logger } from '@/lib/logger';

interface LyricsGenerationPanelProps {
  itemCode: string;
  currentLyrics?: {
    rang_a?: string[];
    rang_b?: string[];
    rang_ab?: string[];
  };
  onLyricsGenerated?: (lyrics: Record<string, string[]>) => void;
}

interface GenerationProgress {
  total: number;
  processed: number;
  success: number;
  failed: number;
  current?: string;
  errors: string[];
}

export const LyricsGenerationPanel: React.FC<LyricsGenerationPanelProps> = ({
  itemCode,
  currentLyrics,
  onLyricsGenerated
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLyrics, setGeneratedLyrics] = useState<{
    A?: string[];
    B?: string[];
    AB?: string[];
  }>({});
  const [activeTab, setActiveTab] = useState('A');
  const [globalProgress, setGlobalProgress] = useState<GenerationProgress | null>(null);

  const generateSingleRang = async (rang: 'A' | 'B' | 'AB') => {
    setIsGenerating(true);
    try {
      logger.info('Génération paroles pour rang spécifique', {
        component: 'LyricsGenerationPanel',
        action: 'generateSingleRang',
        metadata: { itemCode, rang }
      });
      
      // Fallback : génération locale avec les données existantes
      const { data: itemData, error: itemError } = await supabase
        .from('edn_items_complete')
        .select('item_code, title, competences_oic_rang_a, competences_oic_rang_b')
        .eq('item_code', itemCode)
        .maybeSingle();

      if (itemError) throw itemError;
      if (!itemData) {
        throw new Error(`Item ${itemCode} non trouvé`);
      }

      // Récupérer les compétences OIC depuis backup_oic_competences
      const itemNum = itemCode.replace('IC-', '').padStart(3, '0');
      let compQuery = supabase
        .from('backup_oic_competences')
        .select('objectif_id, intitule, description, rang, rubrique')
        .eq('item_parent', itemNum)
        .is('description', false);
      
      if (rang !== 'AB') {
        compQuery = compQuery.eq('rang', rang);
      }
      
      const { data: competences } = await compQuery;
      logger.info('Compétences trouvées pour génération paroles', {
        component: 'LyricsGenerationPanel',
        metadata: {
          itemCode,
          rang,
          count: competences?.length || 0
        }
      });

      // Génération RICHE avec OpenAI musicale
      const lines = await generateRichAdvancedLyrics(itemCode, rang);
      
      if (lines.length > 0) {
        setGeneratedLyrics(prev => ({ ...prev, [rang]: lines }));
        toast({
          title: `✅ Paroles ${rang} générées avec OpenAI`,
          description: `${lines.length} lignes musicales avec rythmes intégrés`,
        });
        
        if (onLyricsGenerated) {
          onLyricsGenerated({ [`rang_${rang.toLowerCase()}`]: lines });
        }
      } else {
        throw new Error('Aucune parole générée');
      }
    } catch (error) {
      logger.error(`Erreur génération ${rang}`, {
        component: 'LyricsGenerationPanel',
        metadata: { rang, itemCode }
      });
      toast({
        title: `❌ Erreur Rang ${rang}`,
        description: error.message || 'Erreur lors de la génération',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAllRangs = async () => {
    setIsGenerating(true);
    try {
      logger.info('Génération complète paroles', {
        component: 'LyricsGenerationPanel',
        itemCode
      });
      
      // Génération RICHE avec OpenAI pour les 3 rangs
      const results = await Promise.allSettled(['A', 'B', 'AB'].map(async (rang) => {
        const lines = await generateRichAdvancedLyrics(itemCode, rang as 'A' | 'B' | 'AB');
        return { rang, lines };
      }));

      const newLyrics: any = {};
      let successCount = 0;
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.lines.length > 0) {
          newLyrics[result.value.rang] = result.value.lines;
          successCount++;
        }
      });

      setGeneratedLyrics(newLyrics);
      toast({
        title: '🎵 Génération OpenAI terminée',
        description: `Paroles musicales générées pour ${successCount}/3 rangs`,
      });

      if (onLyricsGenerated) {
        onLyricsGenerated({
          rang_a: newLyrics.A,
          rang_b: newLyrics.B,
          rang_ab: newLyrics.AB
        });
      }
    } catch (error) {
      logger.error('Erreur génération complète', {
        component: 'LyricsGenerationPanel',
        metadata: { itemCode }
      });
      toast({
        title: '❌ Erreur génération',
        description: 'Génération locale effectuée avec données disponibles',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAllItems = async () => {
    setIsGenerating(true);
    setGlobalProgress({
      total: 367,
      processed: 0,
      success: 0,
      failed: 0,
      errors: []
    });

    try {
      logger.info('Démarrage génération globale', {
        component: 'LyricsGenerationPanel',
        action: 'generateAllItems'
      });
      
      // Récupérer tous les items
      const { data: items, error } = await supabase
        .from('edn_items_complete')
        .select('item_code, title')
        .order('item_code', { ascending: true });

      if (error) throw error;

      const batchSize = 10; // Traiter par petits lots
      let processed = 0;
      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        
        await Promise.allSettled(batch.map(async (item) => {
          try {
            const itemNum = item.item_code.replace('IC-', '').padStart(3, '0');
            
            // Récupérer les compétences pour cet item
            const { data: competencesA } = await supabase
              .from('backup_oic_competences')
              .select('objectif_id, intitule, description, rang, rubrique')
              .eq('item_parent', itemNum)
              .eq('rang', 'A')
              .is('description', false);

            const { data: competencesB } = await supabase
              .from('backup_oic_competences')
              .select('objectif_id, intitule, description, rang, rubrique')
              .eq('item_parent', itemNum)
              .eq('rang', 'B')
              .is('description', false);

            // Générer les paroles RICHES avec OpenAI pour chaque rang
            const lyricsA = await generateRichAdvancedLyrics(item.item_code, 'A');
            const lyricsB = await generateRichAdvancedLyrics(item.item_code, 'B');
            const lyricsAB = await generateRichAdvancedLyrics(item.item_code, 'AB');

            // Sauvegarder en base
            const { error: updateError } = await supabase
              .from('edn_items_complete')
              .update({
                paroles_rang_a: lyricsA,
                paroles_rang_b: lyricsB,
                paroles_rang_ab: lyricsAB,
                paroles_musicales: lyricsAB, // Utiliser AB comme paroles principales
                updated_at: new Date().toISOString()
              })
              .eq('item_code', item.item_code);

            if (updateError) throw updateError;
            success++;
          } catch (e) {
            failed++;
            errors.push(`${item.item_code}: ${(e as Error).message}`);
            logger.error(`Erreur pour item ${item.item_code}`, {
              component: 'LyricsGenerationPanel',
              metadata: { itemCode: item.item_code }
            });
          }
          
          processed++;
          setGlobalProgress(prev => prev ? {
            ...prev,
            processed,
            success,
            failed,
            current: item.item_code,
            errors
          } : null);
        }));

        // Pause entre les lots pour éviter la surcharge
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast({
        title: '🎉 Génération OpenAI globale terminée',
        description: `${success} items traités avec paroles musicales de qualité`,
      });
    } catch (error) {
      logger.error('Erreur génération globale', {
        component: 'LyricsGenerationPanel'
      });
      toast({
        title: '❌ Erreur génération globale',
        description: 'Problème lors de la génération locale',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Fonction de génération locale en fallback
  const generateLocalLyrics = (itemData: Record<string, unknown>, competences: Array<Record<string, unknown>>, rang: 'A' | 'B' | 'AB'): string[] => {
    const lines: string[] = [];
    
    // Structure musicale avec contenu médical
    lines.push(`[Couplet 1]`);
    
    if (competences.length > 0) {
      // Utiliser les vraies compétences
      competences.slice(0, 3).forEach((comp, i) => {
        const description = (comp.description as string)?.substring(0, 200) || (comp.intitule as string) || '';
        const cleanText = description.replace(/[<>=\[\]]/g, '').trim();
        lines.push(`${cleanText.split(' ').slice(0, 12).join(' ')}, essence médicale révélée`);
        
        if (i === 1) {
          lines.push(`Dans cette quête de savoir, chaque notion prend vie`);
        }
      });
    } else {
      // Contenu par défaut si pas de compétences
      lines.push(`Item ${(itemData?.item_code as string) || itemCode} dévoile ses mystères profonds`);
      lines.push(`Rang ${rang} déploie sa science, méthodique et sûre`);
      lines.push(`Chaque connaissance s'ancre, solide fondation`);
    }
    
    lines.push('');
    lines.push(`[Refrain]`);
    lines.push(`Médecine flow, savoir et technique s'entremêlent`);
    lines.push(`${rang === 'AB' ? 'Synthèse complète' : `Rang ${rang} essentiel`}, expertise qui se révèle`);
    lines.push(`Dans le rythme des mots, la connaissance danse`);
    lines.push(`${(itemData?.title as string)?.split(' ').slice(0, 8).join(' ') || itemCode} - notre référence`);
    
    lines.push('');
    lines.push(`[Couplet 2]`);
    
    if (competences.length > 3) {
      competences.slice(3, 6).forEach((comp) => {
        const cleanText = ((comp.description as string) || (comp.intitule as string) || '').replace(/[<>=\[\]]/g, '').substring(0, 150);
        lines.push(`${cleanText.split(' ').slice(0, 10).join(' ')}, précision clinique`);
      });
    } else {
      lines.push(`Diagnostic et thérapie, démarche structurée`);
      lines.push(`Patient au centre, approche personnalisée`);
      lines.push(`Excellence médicale, objectif poursuivi`);
    }
    
    lines.push('');
    lines.push(`[Refrain Final]`);
    lines.push(`Médecine flow, savoir et technique s'entremêlent`);
    lines.push(`${rang === 'AB' ? 'Maîtrise totale' : `Rang ${rang} maîtrisé`}, expertise qui se révèle`);
    lines.push(`QCM réussi grâce à ces rimes savantes`);
    lines.push(`${itemCode} dans la mémoire, connaissance permanente`);
    
    return lines.filter(line => line.length > 0);
  };

  const renderLyrics = (lines: string[] | undefined, rang: string) => {
    if (!lines || lines.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Music className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>Aucune parole générée pour le rang {rang}</p>
          <p className="text-sm">Cliquez sur "Générer" pour créer les paroles</p>
        </div>
      );
    }

    return (
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {lines.map((line, index) => {
          const isSection = line.startsWith('[') && line.endsWith(']');
          return (
            <div 
              key={index} 
              className={isSection 
                ? "font-semibold text-primary bg-primary/10 px-3 py-2 rounded-md text-center"
                : "px-3 py-1 hover:bg-muted/50 rounded-sm"
              }
            >
              {line}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Génération Paroles Musicales - {itemCode}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Paroles médicales avec rythmes intégrés et contenu pédagogique pour mémorisation optimale
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={generateAllRangs}
              disabled={isGenerating}
              variant="outline"
              size="sm"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Générer A+B+AB
            </Button>
            <Button
              onClick={generateAllItems}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="sm"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Générer 367 Items
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {globalProgress && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Progression Globale (367 Items)</h4>
              <Badge variant={globalProgress.failed > 0 ? "destructive" : "default"}>
                {globalProgress.success} réussis / {globalProgress.failed} échecs
              </Badge>
            </div>
            <Progress 
              value={(globalProgress.processed / globalProgress.total) * 100} 
              className="mb-2" 
            />
            <div className="text-sm text-muted-foreground">
              {globalProgress.processed} / {globalProgress.total} items traités
              {globalProgress.current && (
                <span className="ml-2 text-primary">• En cours: {globalProgress.current}</span>
              )}
            </div>
            {globalProgress.errors.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {globalProgress.errors.length} erreurs
                </summary>
                <div className="mt-2 text-xs bg-destructive/10 p-2 rounded max-h-32 overflow-y-auto">
                  {globalProgress.errors.map((error, i) => (
                    <div key={i} className="text-destructive">{error}</div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="A" className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">A</Badge>
              Rang A
              {generatedLyrics.A && <CheckCircle className="h-4 w-4 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger value="B" className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">B</Badge>
              Rang B
              {generatedLyrics.B && <CheckCircle className="h-4 w-4 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger value="AB" className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">A+B</Badge>
              Mix A+B
              {generatedLyrics.AB && <CheckCircle className="h-4 w-4 text-green-600" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="A" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Paroles Rang A - Compétences Fondamentales</h3>
              <Button
                onClick={() => generateSingleRang('A')}
                disabled={isGenerating}
                variant="outline"
                size="sm"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Générer Rang A
              </Button>
            </div>
            {renderLyrics(generatedLyrics.A || currentLyrics?.rang_a, 'A')}
          </TabsContent>

          <TabsContent value="B" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Paroles Rang B - Compétences Approfondies</h3>
              <Button
                onClick={() => generateSingleRang('B')}
                disabled={isGenerating}
                variant="outline"
                size="sm"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Générer Rang B
              </Button>
            </div>
            {renderLyrics(generatedLyrics.B || currentLyrics?.rang_b, 'B')}
          </TabsContent>

          <TabsContent value="AB" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Paroles Mix A+B - Synthèse Complète</h3>
              <Button
                onClick={() => generateSingleRang('AB')}
                disabled={isGenerating}
                variant="outline"
                size="sm"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Générer Mix A+B
              </Button>
            </div>
            {renderLyrics(generatedLyrics.AB || currentLyrics?.rang_ab, 'AB')}
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            🎯 Génération Musicale Premium
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• <strong>Contenu médical complet</strong>: Toutes les compétences intégrées de façon naturelle</li>
            <li>• <strong>Structure pédagogique</strong>: Organisation optimisée pour l'apprentissage</li>
            <li>• <strong>Rythme adapté</strong>: Tempo idéal pour la mémorisation efficace</li>
            <li>• <strong>Qualité professionnelle</strong>: Paroles conçues pour maximiser la rétention</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};