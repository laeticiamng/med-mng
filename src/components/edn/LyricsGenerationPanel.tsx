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

interface LyricsGenerationPanelProps {
  itemCode: string;
  currentLyrics?: {
    rang_a?: string[];
    rang_b?: string[];
    rang_ab?: string[];
  };
  onLyricsGenerated?: (lyrics: any) => void;
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
      const { data, error } = await supabase.functions.invoke('generate-lyrics-refined', {
        body: { itemCode, rang }
      });

      if (error) throw error;

      const lines = Array.isArray(data?.lines) ? data.lines : [];
      if (lines.length > 0) {
        setGeneratedLyrics(prev => ({ ...prev, [rang]: lines }));
        toast({
          title: `✅ Paroles ${rang} générées`,
          description: `${lines.length} lignes créées avec style Nekfeu`,
        });
        
        if (onLyricsGenerated) {
          onLyricsGenerated({ [`rang_${rang.toLowerCase()}`]: lines });
        }
      } else {
        throw new Error('Aucune parole générée');
      }
    } catch (error) {
      console.error(`Erreur génération ${rang}:`, error);
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
      // Générer les 3 versions en parallèle
      const promises = ['A', 'B', 'AB'].map(async (rang) => {
        const { data, error } = await supabase.functions.invoke('generate-lyrics-refined', {
          body: { itemCode, rang }
        });
        if (error) throw error;
        return { rang, lines: Array.isArray(data?.lines) ? data.lines : [] };
      });

      const results = await Promise.all(promises);
      const newLyrics: any = {};
      
      results.forEach(({ rang, lines }) => {
        if (lines.length > 0) {
          newLyrics[rang] = lines;
        }
      });

      setGeneratedLyrics(newLyrics);
      toast({
        title: '🎵 Génération complète terminée',
        description: `Paroles générées pour ${Object.keys(newLyrics).length}/3 rangs`,
      });

      if (onLyricsGenerated) {
        onLyricsGenerated({
          rang_a: newLyrics.A,
          rang_b: newLyrics.B,
          rang_ab: newLyrics.AB
        });
      }
    } catch (error) {
      console.error('Erreur génération complète:', error);
      toast({
        title: '❌ Erreur génération',
        description: error.message || 'Erreur lors de la génération',
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
      const { data, error } = await supabase.functions.invoke('generate-lyrics-bulk', {
        body: { 
          rang: 'ALL',
          preserveIfBetter: false // Forcer la régénération pour avoir la qualité maximale
        }
      });

      if (error) throw error;

      setGlobalProgress({
        total: data.processed || 367,
        processed: data.processed || 0,
        success: data.success || 0,
        failed: data.failed || 0,
        errors: data.errors || []
      });

      toast({
        title: '🎉 Génération globale terminée',
        description: `${data.success || 0} items traités avec succès sur ${data.processed || 0}`,
      });
    } catch (error) {
      console.error('Erreur génération globale:', error);
      toast({
        title: '❌ Erreur génération globale',
        description: error.message || 'Erreur lors de la génération',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
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
              Génération Paroles Style Nekfeu - {itemCode}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Paroles médicales avec assonances, métaphores et contenu dense pour mémorisation optimale
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

        <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
            🎯 Objectif Qualité 20/20
          </h4>
          <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
            <li>• <strong>Style Nekfeu</strong>: Phrases longues, métaphores et assonances variées</li>
            <li>• <strong>Contenu médical dense</strong>: Toutes les compétences intégrées organiquement</li>
            <li>• <strong>Mémorisation optimale</strong>: Structure et rythme pour retenir l'essentiel</li>
            <li>• <strong>QCM post-écoute</strong>: Paroles conçues pour réussir les évaluations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};