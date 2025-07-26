import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BandeDessineDisplay } from './BandeDessineDisplay';
import { RomanDisplay } from './RomanDisplay';
import { PoemeDisplay } from './PoemeDisplay';
import { 
  BookOpen, 
  FileText, 
  Image,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContentData {
  bande_dessinee?: any;
  roman?: any;
  poeme?: any;
}

interface PedagogicalContentDisplayProps {
  itemCode: string;
  tableauRangA?: any;
  tableauRangB?: any;
  className?: string;
}

export const PedagogicalContentDisplay: React.FC<PedagogicalContentDisplayProps> = ({
  itemCode,
  tableauRangA,
  tableauRangB,
  className
}) => {
  const [contentData, setContentData] = useState<ContentData>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bd');
  const { toast } = useToast();

  useEffect(() => {
    loadPedagogicalContent();
  }, [itemCode]);

  const loadPedagogicalContent = async () => {
    try {
      setLoading(true);
      
      // Appeler l'API pour récupérer le contenu existant
      const response = await fetch(`/api/pedagogical-content/${itemCode}`);
      
      if (response.ok) {
        const data = await response.json();
        setContentData(data);
      } else {
        // Si pas de contenu, générer automatiquement
        await generateMissingContent();
      }
    } catch (error) {
      console.error('Erreur chargement contenu pédagogique:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger le contenu pédagogique",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMissingContent = async () => {
    try {
      // Préparer les données des tableaux pour la génération
      const combinedData = {
        item_code: itemCode,
        tableau_rang_a: tableauRangA,
        tableau_rang_b: tableauRangB
      };

      toast({
        title: "🎨 Génération en cours...",
        description: "Création du contenu pédagogique IA pour " + itemCode,
      });

      // Appeler l'edge function pour générer le contenu
      const response = await fetch(`https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/content-ai-generator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_all',
          ...combinedData
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur génération contenu');
      }

      const generatedContent = await response.json();
      setContentData(generatedContent);

      toast({
        title: "✅ Contenu généré !",
        description: "BD, Roman et Poème créés avec succès",
      });
    } catch (error) {
      console.error('Erreur génération:', error);
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer le contenu pédagogique",
        variant: "destructive",
      });
    }
  };

  const hasContent = (type: 'bd' | 'roman' | 'poeme') => {
    switch (type) {
      case 'bd':
        return contentData.bande_dessinee?.panels?.length > 0;
      case 'roman':
        return contentData.roman?.chapters?.length > 0;
      case 'poeme':
        return contentData.poeme?.stanzas?.length > 0;
      default:
        return false;
    }
  };

  const getContentCount = (type: 'bd' | 'roman' | 'poeme') => {
    switch (type) {
      case 'bd':
        return contentData.bande_dessinee?.panels?.length || 0;
      case 'roman':
        return contentData.roman?.chapters?.length || 0;
      case 'poeme':
        return contentData.poeme?.stanzas?.length || 0;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <Card className={`border-2 border-gray-200 ${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Chargement du contenu pédagogique...
          </h3>
          <p className="text-gray-500 text-center">
            Récupération de la BD, du roman et du poème pour {itemCode}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card className="border-2 border-gray-200">
        <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-800 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Contenus Pédagogiques IA - {itemCode}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                Version unique partagée
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={loadPedagogicalContent}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Actualiser
              </Button>
            </div>
          </div>
          <p className="text-gray-200 text-sm">
            Explorez les contenus générés par IA : bande dessinée interactive, roman médical, et poème éducatif
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="bd" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Bande Dessinée
                <Badge variant="secondary" className="ml-1">
                  {getContentCount('bd')}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="roman" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Roman
                <Badge variant="secondary" className="ml-1">
                  {getContentCount('roman')}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="poeme" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Poème
                <Badge variant="secondary" className="ml-1">
                  {getContentCount('poeme')}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bd">
              {hasContent('bd') ? (
                <BandeDessineDisplay 
                  data={contentData.bande_dessinee} 
                />
              ) : (
                <Card className="border-dashed border-2 border-orange-300 bg-orange-50">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Image className="h-16 w-16 text-orange-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Bande Dessinée en préparation
                    </h3>
                    <p className="text-gray-500 text-center max-w-md mb-4">
                      La BD pédagogique pour {itemCode} sera générée automatiquement
                    </p>
                    <Button onClick={generateMissingContent} className="bg-orange-500 hover:bg-orange-600">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Générer maintenant
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="roman">
              {hasContent('roman') ? (
                <RomanDisplay 
                  data={contentData.roman} 
                />
              ) : (
                <Card className="border-dashed border-2 border-blue-300 bg-blue-50">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BookOpen className="h-16 w-16 text-blue-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Roman en préparation
                    </h3>
                    <p className="text-gray-500 text-center max-w-md mb-4">
                      Le roman médical pour {itemCode} sera généré automatiquement
                    </p>
                    <Button onClick={generateMissingContent} className="bg-blue-500 hover:bg-blue-600">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Générer maintenant
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="poeme">
              {hasContent('poeme') ? (
                <PoemeDisplay 
                  data={contentData.poeme} 
                />
              ) : (
                <Card className="border-dashed border-2 border-purple-300 bg-purple-50">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-16 w-16 text-purple-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Poème en préparation
                    </h3>
                    <p className="text-gray-500 text-center max-w-md mb-4">
                      Le poème éducatif pour {itemCode} sera généré automatiquement
                    </p>
                    <Button onClick={generateMissingContent} className="bg-purple-500 hover:bg-purple-600">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Générer maintenant
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};