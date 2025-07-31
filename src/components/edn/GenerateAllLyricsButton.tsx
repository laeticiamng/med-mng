import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Music } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const GenerateAllLyricsButton: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateAllLyrics = async () => {
    setIsGenerating(true);
    
    toast({
      title: "Génération en cours",
      description: "Génération des paroles pour tous les items EDN en cours... Cela peut prendre plusieurs minutes.",
      duration: 5000
    });

    try {
      const { data, error } = await supabase.functions.invoke('generate-all-lyrics', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: "Génération terminée",
        description: `Paroles générées avec succès! Traités: ${data.stats.processed}, Succès: ${data.stats.success}, Erreurs: ${data.stats.errors}`,
        duration: 10000
      });

      // Recharger la page après un délai pour voir les nouvelles paroles
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Erreur génération paroles:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération des paroles: " + (error.message || 'Erreur inconnue'),
        variant: "destructive",
        duration: 10000
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
      <div className="flex items-center gap-3 mb-4">
        <Music className="h-6 w-6 text-purple-600" />
        <h3 className="text-lg font-semibold text-purple-900">
          Génération Globale des Paroles
        </h3>
      </div>
      
      <p className="text-purple-700 mb-4">
        Générer automatiquement les paroles musicales pour tous les items EDN 
        basées sur les compétences OIC. Cette opération peut prendre plusieurs minutes.
      </p>
      
      <Button 
        onClick={handleGenerateAllLyrics}
        disabled={isGenerating}
        className="bg-purple-600 hover:bg-purple-700 text-white"
        size="lg"
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Génération en cours...
          </>
        ) : (
          <>
            <Wand2 className="h-5 w-5 mr-2" />
            Générer toutes les paroles
          </>
        )}
      </Button>
      
      {isGenerating && (
        <div className="mt-4 p-3 bg-purple-100 border border-purple-300 rounded">
          <p className="text-sm text-purple-800">
            ⏳ Génération en cours... Veuillez patienter, cette opération traite tous les items EDN.
          </p>
        </div>
      )}
    </div>
  );
};