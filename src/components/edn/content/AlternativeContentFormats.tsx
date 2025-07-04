import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, FileText, Headphones, Video, Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AlternativeContentFormatsProps {
  itemData: {
    title: string;
    subtitle: string;
    item_code: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
  };
}

export const AlternativeContentFormats: React.FC<AlternativeContentFormatsProps> = ({ itemData }) => {
  const [activeFormat, setActiveFormat] = useState('novel');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>({});
  const { toast } = useToast();

  const generateContent = async (format: string) => {
    setIsGenerating(true);
    
    try {
      const prompt = createPromptForFormat(format, itemData);
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt,
          format,
          item_code: itemData.item_code,
          content_type: format
        }
      });

      if (error) throw error;

      setGeneratedContent(prev => ({
        ...prev,
        [format]: data.content
      }));

      toast({
        title: "Contenu généré !",
        description: `Le ${getFormatLabel(format)} a été généré avec succès.`,
      });
    } catch (error) {
      console.error(`Erreur génération ${format}:`, error);
      toast({
        title: "Erreur de génération",
        description: `Impossible de générer le ${getFormatLabel(format)}.`,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const createPromptForFormat = (format: string, item: any) => {
    const baseContent = `Titre: ${item.title}\nCode: ${item.item_code}`;
    
    switch (format) {
      case 'novel':
        return `Écris un court roman médical (2000 mots) basé sur ce contenu EDN: ${baseContent}. 
        Le roman doit être narratif, avec des personnages médicaux (médecin, patient, équipe soignante) et 
        intégrer naturellement les connaissances médicales du rang A et rang B. Style: accessible et engageant.`;
        
      case 'podcast':
        return `Crée un script de podcast médical (15 minutes) sur ce contenu EDN: ${baseContent}.
        Format: dialogue entre deux médecins experts qui discutent du sujet de manière pédagogique.
        Inclus des segments d'introduction, développement des concepts clés, cas pratiques et conclusion.`;
        
      case 'video':
        return `Écris un script vidéo éducatif (10 minutes) pour ce contenu EDN: ${baseContent}.
        Structure: introduction accrocheuse, développement visuel des concepts, exemples pratiques, 
        résumé des points clés. Inclus des indications pour les visuels et animations.`;
        
      case 'infographic':
        return `Conçois une infographie éducative détaillée pour ce contenu EDN: ${baseContent}.
        Structure: titre principal, 5-7 points clés visuels, schémas explicatifs, statistiques importantes,
        résumé en bas. Format: description textuelle des éléments visuels à créer.`;
        
      default:
        return `Adapte ce contenu EDN en format ${format}: ${baseContent}`;
    }
  };

  const getFormatLabel = (format: string) => {
    const labels = {
      'novel': 'Roman médical',
      'podcast': 'Script podcast',
      'video': 'Script vidéo',
      'infographic': 'Infographie'
    };
    return labels[format] || format;
  };

  const formats = [
    {
      id: 'novel',
      title: 'Roman médical',
      description: 'Récit narratif intégrant les connaissances médicales',
      icon: BookOpen,
      color: 'bg-emerald-500',
      estimated_time: '5-7 minutes de lecture'
    },
    {
      id: 'podcast',
      title: 'Script podcast',
      description: 'Dialogue pédagogique entre experts médicaux',
      icon: Headphones,
      color: 'bg-purple-500',
      estimated_time: '15 minutes d\'écoute'
    },
    {
      id: 'video',
      title: 'Script vidéo',
      description: 'Contenu vidéo éducatif avec indications visuelles',
      icon: Video,
      color: 'bg-blue-500',
      estimated_time: '10 minutes de visionnage'
    },
    {
      id: 'infographic',
      title: 'Infographie',
      description: 'Présentation visuelle synthétique des concepts',
      icon: FileText,
      color: 'bg-orange-500',
      estimated_time: '2-3 minutes de lecture'
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-indigo-800">
            <FileText className="h-6 w-6" />
            Formats Alternatifs - {itemData.title}
          </CardTitle>
          <CardDescription>
            Explorez le contenu EDN sous différents formats pédagogiques adaptés à votre style d'apprentissage
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeFormat} onValueChange={setActiveFormat} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {formats.map((format) => (
            <TabsTrigger key={format.id} value={format.id} className="flex items-center gap-2">
              <format.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{format.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {formats.map((format) => (
          <TabsContent key={format.id} value={format.id} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${format.color} text-white`}>
                      <format.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>{format.title}</CardTitle>
                      <CardDescription>{format.description}</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">{format.estimated_time}</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {!generatedContent[format.id] ? (
                  <div className="text-center py-8">
                    <format.icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {format.title} à générer
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Cliquez sur le bouton ci-dessous pour générer le contenu dans ce format
                    </p>
                    <Button 
                      onClick={() => generateContent(format.id)}
                      disabled={isGenerating}
                      className="flex items-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Génération en cours...
                        </>
                      ) : (
                        <>
                          <format.icon className="h-4 w-4" />
                          Générer le {format.title}
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Contenu généré</h3>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Télécharger
                      </Button>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm">
                        {generatedContent[format.id]}
                      </pre>
                    </div>

                    <Button 
                      variant="outline" 
                      onClick={() => generateContent(format.id)}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      Régénérer le contenu
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Résumé des fonctionnalités */}
      <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-800">Avantages des formats alternatifs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-emerald-700">📚 Diversité pédagogique</h4>
              <p className="text-sm text-gray-600">
                Adaptez votre apprentissage selon vos préférences : lecture, écoute, visuel
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-700">🎯 Mémorisation renforcée</h4>
              <p className="text-sm text-gray-600">
                Les différents formats stimulent différentes zones du cerveau pour une meilleure rétention
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-700">⚡ Accessible partout</h4>
              <p className="text-sm text-gray-600">
                Révisez en déplacement avec les formats audio et téléchargeables
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-700">🔄 Contenu adaptatif</h4>
              <p className="text-sm text-gray-600">
                Chaque format est spécialement conçu pour maximiser l'efficacité pédagogique
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};