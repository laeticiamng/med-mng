import logger from '@/lib/logger';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, RefreshCw, BookOpen, Palette, Sparkles, Eye, Download, Share2 } from "lucide-react";
import { BandeDessineDisplay } from './BandeDessineDisplay';
import { RomanDisplay } from './RomanDisplay';
import { PoemeDisplay } from './PoemeDisplay';
import { pedagogicalContentService } from '@shared/services/pedagogicalContentService';

interface EnhancedContentViewerProps {
  itemCode: string;
  itemData?: {
    title: string;
    subtitle?: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
  };
}

export const EnhancedContentViewer: React.FC<EnhancedContentViewerProps> = ({
  itemCode,
  itemData
}) => {
  const [contentData, setContentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('bd');
  const [readingProgress, setReadingProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    loadContent();
  }, [itemCode]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const content = await pedagogicalContentService.getItemContent(itemCode);
      
      if (content && content.length > 0) {
        const organizedContent = {
          bande_dessinee: content.find((c: any) => c.content_type === 'comic')?.content || null,
          roman: content.find((c: any) => c.content_type === 'novel')?.content || null,
          poeme: content.find((c: any) => c.content_type === 'poem')?.content || null,
        };
        setContentData(organizedContent);
      } else {
        setContentData({ bande_dessinee: null, roman: null, poeme: null });
      }
    } catch (error) {
      logger.error('Error loading content:', error);
      toast.error('Erreur lors du chargement du contenu');
    } finally {
      setLoading(false);
    }
  };

  const generateMissingContent = async () => {
    try {
      setGenerating(true);
      toast.info('Génération du contenu en cours...');
      
      const result = await pedagogicalContentService.generateMissingContent(itemCode);
      
      if (result.success_count > 0) {
        toast.success(`${result.success_count} contenu(s) généré(s) avec succès`);
        await loadContent();
      } else {
        toast.warning('Aucun nouveau contenu généré');
      }
    } catch (error) {
      logger.error('Error generating content:', error);
      toast.error('Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  const updateProgress = async (contentType: string, progress: number) => {
    setReadingProgress(prev => ({ ...prev, [contentType]: progress }));
    await pedagogicalContentService.updateContentProgress(itemCode, contentType, progress);
  };

  const exportContent = (contentType: string) => {
    const content = contentData?.[contentType === 'bd' ? 'bande_dessinee' : contentType];
    if (!content) return;

    const dataStr = JSON.stringify(content, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${itemCode}-${contentType}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Contenu exporté avec succès');
  };

  const shareContent = async (contentType: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${itemData?.title} - ${pedagogicalContentService.formatContentTitle(contentType)}`,
          text: `Découvrez ce contenu pédagogique: ${itemData?.title}`,
          url: window.location.href
        });
      } catch (error) {
        logger.error('Error sharing:', error);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papiers');
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Chargement du contenu pédagogique...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasContent = (type: string) => {
    return contentData?.[type === 'bd' ? 'bande_dessinee' : type] != null;
  };

  const getContentCount = () => {
    let count = 0;
    if (hasContent('bd')) count++;
    if (hasContent('roman')) count++;
    if (hasContent('poeme')) count++;
    return count;
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Contenu Pédagogique
              <Badge variant="secondary">{getContentCount()}/3</Badge>
            </CardTitle>
            {itemData?.title && (
              <p className="text-sm text-muted-foreground mt-1">{itemData.title}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateMissingContent}
              disabled={generating}
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Générer manquant
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bd" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Bande Dessinée
              {hasContent('bd') && <Badge variant="secondary" className="ml-1">✓</Badge>}
            </TabsTrigger>
            <TabsTrigger value="roman" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Roman
              {hasContent('roman') && <Badge variant="secondary" className="ml-1">✓</Badge>}
            </TabsTrigger>
            <TabsTrigger value="poeme" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Poème
              {hasContent('poeme') && <Badge variant="secondary" className="ml-1">✓</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bd">
            {hasContent('bd') ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm font-medium">Bande Dessinée</span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => exportContent('bd')}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => shareContent('bd')}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {readingProgress.bd !== undefined && (
                  <Progress value={readingProgress.bd} className="w-full" />
                )}
                <BandeDessineDisplay data={contentData.bande_dessinee} />
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <Palette className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Aucune bande dessinée disponible</p>
                <Button onClick={generateMissingContent} disabled={generating}>
                  {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Générer maintenant
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="roman">
            {hasContent('roman') ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-sm font-medium">Roman</span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => exportContent('roman')}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => shareContent('roman')}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {readingProgress.roman !== undefined && (
                  <Progress value={readingProgress.roman} className="w-full" />
                )}
                <RomanDisplay data={contentData.roman} />
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Aucun roman disponible</p>
                <Button onClick={generateMissingContent} disabled={generating}>
                  {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Générer maintenant
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="poeme">
            {hasContent('poeme') ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-medium">Poème</span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => exportContent('poeme')}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => shareContent('poeme')}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {readingProgress.poeme !== undefined && (
                  <Progress value={readingProgress.poeme} className="w-full" />
                )}
                <PoemeDisplay data={contentData.poeme} />
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Aucun poème disponible</p>
                <Button onClick={generateMissingContent} disabled={generating}>
                  {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Générer maintenant
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};