
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImageIcon, RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  prompt: string;
}

export const BandeDessinee = ({ itemData }: BandeDessineeProps) => {
  const [panels, setPanels] = useState<ComicPanel[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingPanel, setGeneratingPanel] = useState<number | null>(null);

  // Histoire structurée basée sur l'item EDN
  const storyPanels: Omit<ComicPanel, 'imageUrl'>[] = [
    {
      id: 1,
      title: "La Rencontre",
      text: `Dans le cabinet médical, Dr. Martin accueille sa patiente, Mme Dubois. L'atmosphère est chaleureuse mais professionnelle, établissant les bases d'une relation de confiance essentielle à tout soin de qualité.`,
      prompt: "Doctor greeting patient in medical office, warm professional atmosphere, establishing trust and rapport, medical consultation beginning"
    },
    {
      id: 2,
      title: "L'Écoute Active",
      text: `Le médecin pratique l'écoute active, se penchant légèrement vers sa patiente, maintenant un contact visuel bienveillant. Chaque mot compte dans cette communication thérapeutique privilégiée.`,
      prompt: "Doctor practicing active listening, leaning forward attentively, maintaining eye contact, patient speaking, therapeutic communication"
    },
    {
      id: 3,
      title: "L'Explication Claire",
      text: `Dr. Martin explique le diagnostic avec des mots simples, utilisant des schémas et des gestes pour s'assurer que sa patiente comprend bien. La pédagogie médicale en action.`,
      prompt: "Doctor explaining diagnosis clearly, using simple words and gestures, patient understanding, medical education in practice"
    },
    {
      id: 4,
      title: "L'Alliance Thérapeutique",
      text: `Patient et médecin construisent ensemble un plan de soins. Cette collaboration active améliore l'adhésion au traitement et les résultats cliniques. Une vraie partnership santé.`,
      prompt: "Doctor and patient working together on treatment plan, collaborative healthcare, therapeutic alliance, positive outcome"
    }
  ];

  const [comicPanels, setComicPanels] = useState<ComicPanel[]>(
    storyPanels.map(panel => ({
      ...panel,
      imageUrl: '' // Sera rempli par la génération
    }))
  );

  const generateImage = async (panelIndex: number) => {
    setGeneratingPanel(panelIndex);
    
    try {
      const panel = storyPanels[panelIndex];
      
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: panel.prompt,
          style: 'comic book',
          panelNumber: panel.id,
          totalPanels: storyPanels.length,
          itemTitle: itemData.title
        }
      });

      if (error) {
        console.error('Erreur génération image:', error);
        throw new Error(error.message || 'Erreur lors de la génération');
      }

      if (data?.imageUrl) {
        setComicPanels(prev => prev.map((p, i) => 
          i === panelIndex ? { ...p, imageUrl: data.imageUrl } : p
        ));
      }
    } catch (error) {
      console.error('Erreur:', error);
      // On garde l'image par défaut en cas d'erreur
    } finally {
      setGeneratingPanel(null);
    }
  };

  const generateAllImages = async () => {
    setIsGenerating(true);
    
    for (let i = 0; i < storyPanels.length; i++) {
      await generateImage(i);
      // Petite pause entre les générations pour éviter les limites de taux
      if (i < storyPanels.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    setIsGenerating(false);
  };

  // Générer automatiquement les images au chargement
  useEffect(() => {
    generateAllImages();
  }, [itemData.title]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-serif text-amber-900 mb-4">Bande Dessinée Éducative</h2>
        <p className="text-lg text-amber-700 mb-6">
          Découvrez "{itemData.title}" à travers une histoire illustrée captivante
        </p>
        
        {isGenerating && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
            <span className="text-amber-700">Génération automatique des images en cours...</span>
          </div>
        )}
        
        <Button 
          onClick={generateAllImages}
          disabled={isGenerating}
          className="bg-amber-600 hover:bg-amber-700 text-white mb-6"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Régénérer la bande dessinée
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {comicPanels.map((panel, index) => (
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
                ) : generatingPanel === index ? (
                  <div className="w-full h-48 bg-amber-100 rounded-lg border-2 border-amber-200 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 text-amber-600 animate-spin mx-auto mb-2" />
                      <p className="text-amber-700 text-sm">Génération...</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-amber-100 rounded-lg border-2 border-amber-200 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 text-amber-400 mx-auto mb-2" />
                      <Button
                        onClick={() => generateImage(index)}
                        variant="outline"
                        size="sm"
                        className="text-amber-700 border-amber-300"
                      >
                        Générer cette vignette
                      </Button>
                    </div>
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

      <div className="text-center text-sm text-amber-600 italic">
        <p>Cette bande dessinée illustre les concepts clés de la relation médecin-patient de manière narrative et engageante.</p>
      </div>
    </div>
  );
};
