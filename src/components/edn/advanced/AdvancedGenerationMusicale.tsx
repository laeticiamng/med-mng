import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Music, Play } from 'lucide-react';

interface AdvancedGenerationMusicaleProps {
  item: {
    id: string;
    title: string;
    paroles_musicales?: string[];
    item_code: string;
  };
  onProgress?: (progress: number) => void;
}

export const AdvancedGenerationMusicale: React.FC<AdvancedGenerationMusicaleProps> = ({
  item,
  onProgress
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!item?.paroles_musicales || !Array.isArray(item.paroles_musicales) || item.paroles_musicales.length === 0) {
      console.error('Paroles manquantes pour la génération');
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('suno-music-optimized', {
        body: {
          lyrics: item.paroles_musicales.join('\n'),
          title: `${item.item_code} - ${item.title}`,
          style: 'medical ambient',
          duration: 120
        }
      });

      if (error) {
        console.error('Erreur génération Suno:', error);
        return;
      }

      if (data?.audioUrl) {
        setGeneratedAudio(data.audioUrl);
      }
    } catch (error) {
      console.error('Erreur génération musicale:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Génération Musicale - {item.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? 'Génération en cours...' : 'Générer Musique'}
          </Button>
          
          {generatedAudio && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <audio controls className="w-full">
                <source src={generatedAudio} type="audio/mpeg" />
              </audio>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};