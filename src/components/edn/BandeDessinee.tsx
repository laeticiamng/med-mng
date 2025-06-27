
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, Sparkles, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BandeDessineeProps {
  itemData: {
    title: string;
    subtitle: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
  };
}

interface ComicPanel {
  id: number;
  imageUrl: string;
  text: string;
  title: string;
}

export const BandeDessinee = ({ itemData }: BandeDessineeProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [comicPanels, setComicPanels] = useState<ComicPanel[]>([]);
  const { toast } = useToast();

  const generateComicStrip = async () => {
    setIsGenerating(true);
    
    try {
      // Créer les prompts pour les différentes vignettes
      const prompts = [
        {
          title: "Introduction - Le Contexte",
          imagePrompt: `Medical consultation scene, doctor and patient in a modern clinic, professional medical illustration style, warm lighting, educational comic book art`,
          text: `Dans le cadre de "${itemData.title}", nous explorons les enjeux de la relation médecin-malade moderne.`
        },
        {
          title: "Les Enjeux Principaux",
          imagePrompt: `Doctor explaining medical concepts to patient, medical diagrams and charts visible, comic book style illustration, clear communication scene`,
          text: `La communication efficace entre soignant et patient est au cœur de toute démarche thérapeutique réussie.`
        },
        {
          title: "Les Outils Pratiques",
          imagePrompt: `Medical tools and communication techniques illustrated, stethoscope, medical charts, empathetic listening scene, educational comic style`,
          text: `L'écoute active, l'empathie et la transmission claire d'informations sont des compétences essentielles à développer.`
        },
        {
          title: "Mise en Application",
          imagePrompt: `Successful doctor-patient interaction, smiling faces, positive medical consultation outcome, comic book illustration style`,
          text: `Une relation thérapeutique de qualité améliore significativement l'adhésion au traitement et les résultats cliniques.`
        }
      ];

      const generatedPanels: ComicPanel[] = [];

      for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        
        // Générer l'image pour cette vignette
        const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-image', {
          body: {
            prompt: prompt.imagePrompt,
            style: 'educational comic'
          }
        });

        if (imageError) {
          console.error('Erreur génération image:', imageError);
          continue;
        }

        generatedPanels.push({
          id: i + 1,
          imageUrl: imageData.imageUrl,
          text: prompt.text,
          title: prompt.title
        });
      }

      setComicPanels(generatedPanels);
      
      toast({
        title: "Bande dessinée générée",
        description: "Votre bande dessinée éducative a été créée avec succès !",
      });
      
    } catch (error) {
      console.error('Erreur génération BD:', error);
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer la bande dessinée. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-serif text-amber-900 mb-4">Bande Dessinée Éducative</h2>
        <p className="text-lg text-amber-700 mb-6">
          Découvrez les concepts clés sous forme de bande dessinée interactive et mémorable
        </p>
        
        <Button
          onClick={generateComicStrip}
          disabled={isGenerating}
          className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Générer la Bande Dessinée
            </>
          )}
        </Button>
      </div>

      {comicPanels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {comicPanels.map((panel) => (
            <Card key={panel.id} className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-amber-700 border-amber-300">
                    Vignette {panel.id}
                  </Badge>
                  <h3 className="text-lg font-semibold text-amber-900">
                    {panel.title}
                  </h3>
                </div>
                
                <div className="relative">
                  {panel.imageUrl ? (
                    <img 
                      src={panel.imageUrl} 
                      alt={panel.title}
                      className="w-full h-48 object-cover rounded-lg border-2 border-amber-200"
                    />
                  ) : (
                    <div className="w-full h-48 bg-amber-100 rounded-lg border-2 border-amber-200 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-amber-400" />
                    </div>
                  )}
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-amber-200">
                  <p className="text-amber-900 font-medium italic">
                    {panel.text}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {comicPanels.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="h-16 w-16 text-amber-300 mx-auto mb-4" />
          <p className="text-amber-600 text-lg">
            Cliquez sur "Générer la Bande Dessinée" pour créer votre expérience visuelle immersive
          </p>
        </div>
      )}
    </div>
  );
};
