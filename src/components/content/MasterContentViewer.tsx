import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, FileText, Wand2, Eye, Clock, Users, 
  TrendingUp, Star, Shield, Zap, CheckCircle
} from 'lucide-react';
import { useContentMaster, type MasterContent } from '@/hooks/useContentMaster';
import { BandeDessineDisplay } from './BandeDessineDisplay';
import { RomanDisplay } from './RomanDisplay';
import { PoemeDisplay } from './PoemeDisplay';
import { toast } from 'sonner';

interface MasterContentViewerProps {
  itemData: {
    item_code?: string;
    title: string;
    subtitle?: string;
  };
  className?: string;
}

export const MasterContentViewer: React.FC<MasterContentViewerProps> = ({
  itemData,
  className
}) => {
  const [masterContent, setMasterContent] = useState<MasterContent | null>(null);
  const [activeTab, setActiveTab] = useState('comic');
  const [viewStartTime, setViewStartTime] = useState<number>(Date.now());
  const { getMasterContent, trackContentView, loading, error } = useContentMaster();

  useEffect(() => {
    if (itemData.item_code) {
      loadMasterContent();
      setViewStartTime(Date.now());
    }
  }, [itemData.item_code]);

  useEffect(() => {
    // Tracker le changement d'onglet
    if (masterContent) {
      const duration = Math.floor((Date.now() - viewStartTime) / 1000);
      if (duration > 5) { // Au moins 5 secondes
        trackContentView(itemData.item_code || '', activeTab, duration);
      }
      setViewStartTime(Date.now());
    }
  }, [activeTab]);

  const loadMasterContent = async () => {
    if (!itemData.item_code) return;
    
    try {
      const content = await getMasterContent(itemData.item_code);
      setMasterContent(content);
    } catch (err) {
      console.error('❌ Erreur chargement contenu master:', err);
      toast.error('Erreur de chargement du contenu');
    }
  };

  const handleContentComplete = (contentType: string, completionPercentage: number) => {
    if (masterContent && itemData.item_code) {
      const duration = Math.floor((Date.now() - viewStartTime) / 1000);
      trackContentView(
        itemData.item_code, 
        contentType, 
        duration, 
        completionPercentage >= 90, 
        completionPercentage
      );
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Chargement du contenu master...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${className} border-destructive`}>
        <CardContent className="p-6 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadMasterContent} variant="outline">
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!masterContent) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Contenu en Préparation
          </CardTitle>
          <CardDescription>
            Le contenu éducatif premium pour cet item est en cours de création.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center p-6">
          <div className="text-6xl mb-4">🎨</div>
          <p className="text-muted-foreground">
            Nos experts travaillent sur la création du contenu BD, Roman et Poème 
            pour l'item {itemData.item_code}. Il sera bientôt disponible !
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasContent = {
    comic: !!masterContent.comic_data,
    novel: !!masterContent.novel_data,
    poem: !!masterContent.poem_data,
    images: !!masterContent.images_data
  };

  const availableContent = Object.entries(hasContent).filter(([_, available]) => available);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header avec stats */}
      <Card className="bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-accent-foreground">
                <Star className="h-6 w-6" />
                Contenu Éducatif Premium - {itemData.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <Shield className="h-4 w-4 text-success" />
                Version Officielle Plateforme • Qualité Garantie
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-accent/10 text-accent-foreground border-accent/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Vérifié
              </Badge>
              <Badge variant="outline">
                Score: {masterContent.quality_score}/100
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">{masterContent.views_count}</div>
              <div className="text-sm text-primary/80">Vues Totales</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div className="text-2xl font-bold text-success">{masterContent.unique_viewers_count}</div>
              <div className="text-sm text-success/80">Utilisateurs</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div className="text-2xl font-bold text-warning">{Math.floor(masterContent.avg_reading_time / 60)}m</div>
              <div className="text-sm text-warning/80">Temps Moyen</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div className="text-2xl font-bold text-accent">{availableContent.length}</div>
              <div className="text-sm text-accent/80">Formats Dispo</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenu principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Contenu Éducatif Multiformat
            </CardTitle>
            <Badge variant="secondary">
              Généré le {new Date(masterContent.generated_at).toLocaleDateString('fr-FR')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full mb-6">
              <TabsTrigger 
                value="comic" 
                disabled={!hasContent.comic}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Bande Dessinée
                {hasContent.comic && <CheckCircle className="h-3 w-3 text-success" />}
              </TabsTrigger>
              <TabsTrigger 
                value="novel" 
                disabled={!hasContent.novel}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Roman
                {hasContent.novel && <CheckCircle className="h-3 w-3 text-success" />}
              </TabsTrigger>
              <TabsTrigger 
                value="poem" 
                disabled={!hasContent.poem}
                className="flex items-center gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Poème
                {hasContent.poem && <CheckCircle className="h-3 w-3 text-success" />}
              </TabsTrigger>
              <TabsTrigger 
                value="images" 
                disabled={!hasContent.images}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Images
                {hasContent.images && <CheckCircle className="h-3 w-3 text-success" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comic" className="space-y-4">
              {hasContent.comic ? (
                <BandeDessineDisplay data={masterContent.comic_data} />
              ) : (
                <div className="text-center p-8 bg-muted/50 rounded-lg">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Bande dessinée en cours de création...</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="novel" className="space-y-4">
              {hasContent.novel ? (
                <RomanDisplay data={masterContent.novel_data} />
              ) : (
                <div className="text-center p-8 bg-muted/50 rounded-lg">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Roman en cours de création...</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="poem" className="space-y-4">
              {hasContent.poem ? (
                <PoemeDisplay data={masterContent.poem_data} />
              ) : (
                <div className="text-center p-8 bg-muted/50 rounded-lg">
                  <Wand2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Poème en cours de création...</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              {hasContent.images ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {masterContent.images_data?.images?.map((image: any) => (
                    <Card key={image.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{image.title}</CardTitle>
                        <CardDescription>{image.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <img 
                          src={image.url} 
                          alt={image.title}
                          className="w-full h-48 object-cover rounded-lg"
                          onLoad={() => handleContentComplete('images', 25)}
                        />
                        <Badge variant="outline" className="mt-2">
                          {image.type}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-muted/50 rounded-lg">
                  <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Galerie d'images en cours de création...</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Footer avec informations */}
      <Card className="bg-gradient-to-r from-success/5 to-primary/5 border-success/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2 text-sm text-success">
            <Shield className="h-4 w-4" />
            <span className="font-medium">Contenu Premium Vérifié</span>
            <span>•</span>
            <span>Version Officielle Plateforme</span>
            <span>•</span>
            <span>Pas de Régénération Utilisateur</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};