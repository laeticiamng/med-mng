
import React from 'react';
import { AlertTriangle, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ParolesMusicalesErrorSectionProps {
  lastError: string;
  itemCode?: string;
  hasNoLyrics?: boolean;
}

export const ParolesMusicalesErrorSection: React.FC<ParolesMusicalesErrorSectionProps> = ({
  lastError,
  itemCode,
  hasNoLyrics = false
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerateContent = async () => {
    if (!itemCode) return;
    
    setIsGenerating(true);
    toast({
      title: "Génération en cours",
      description: "Génération du contenu complet en cours..."
    });

    try {
      const { data, error } = await supabase.functions.invoke('complete-edn-content', {
        body: { itemCode }
      });

      if (error) throw error;

      toast({
        title: "Contenu généré",
        description: "Le contenu a été généré avec succès. Rechargez la page pour voir les nouveautés."
      });
      
      // Recharger la page après génération
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Erreur génération contenu:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération du contenu",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Si pas de paroles disponibles, afficher le bouton de génération
  if (hasNoLyrics && itemCode) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center gap-2 text-amber-800 mb-3">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold">Aucune parole disponible</span>
        </div>
        <p className="text-amber-700 mb-4">
          Cet item ne contient pas encore de paroles musicales pour Suno.
        </p>
        <Button 
          onClick={handleGenerateContent}
          disabled={isGenerating}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Génération en cours...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Générer le contenu complet
            </>
          )}
        </Button>
      </div>
    );
  }

  // Erreur de génération standard
  if (!lastError) return null;

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center gap-2 text-red-800">
        <AlertTriangle className="h-5 w-5" />
        <span className="font-semibold">Erreur de génération Suno</span>
      </div>
      <p className="text-red-700 mt-2">{lastError}</p>
    </div>
  );
};
