
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Music, Mic, Volume2 } from 'lucide-react';
import { MusicStyleSelector } from './music/MusicStyleSelector';

interface ParolesMusicalesProps {
  paroles: string[];
  itemCode: string;
  tableauRangA?: any;
  tableauRangB?: any;
}

export const ParolesMusicales: React.FC<ParolesMusicalesProps> = ({ 
  paroles, 
  itemCode,
  tableauRangA,
  tableauRangB
}) => {
  const [selectedStyle, setSelectedStyle] = useState('');
  const [currentSong, setCurrentSong] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!paroles || paroles.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-600">⚠️ Paroles Musicales - Contenu indisponible</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Les paroles musicales ne sont pas encore disponibles dans Supabase.</p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-700">
              <strong>Données attendues :</strong> 2 chansons complètes (Rang A et Rang B) basées sur les tableaux correspondants.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleGenerateMusic = async (songIndex: number) => {
    setIsGenerating(true);
    setCurrentSong(songIndex);
    
    try {
      // Simuler la génération musicale
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log(`🎵 Génération musique ${itemCode} - Chanson ${songIndex + 1}`, {
        style: selectedStyle,
        lyrics: paroles[songIndex]
      });
      
      setIsPlaying(true);
    } catch (error) {
      console.error('Erreur génération musique:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const rangLabels = ['Rang A', 'Rang B'];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="w-6 h-6 text-purple-600" />
          Paroles Musicales - {itemCode}
          <Badge variant="outline">{paroles.length} chanson{paroles.length > 1 ? 's' : ''}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sélecteur de style musical */}
        <MusicStyleSelector
          selectedStyle={selectedStyle}
          onStyleChange={setSelectedStyle}
        />

        {/* Affichage des paroles */}
        <div className="space-y-6">
          {paroles.map((chanson, index) => (
            <Card key={index} className="border-l-4 border-l-purple-400">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={index === 0 ? 'default' : 'secondary'}>
                      {rangLabels[index] || `Chanson ${index + 1}`}
                    </Badge>
                    <span className="text-lg">
                      {index === 0 ? 'Fondamentaux' : 'Approfondissements'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentSong === index && isPlaying && (
                      <Volume2 className="w-4 h-4 text-green-600 animate-pulse" />
                    )}
                    <Button
                      onClick={() => handleGenerateMusic(index)}
                      disabled={!selectedStyle || isGenerating}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {isGenerating && currentSong === index ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Génération...
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4" />
                          Générer musique
                        </>
                      )}
                    </Button>
                    {currentSong === index && (
                      <Button
                        onClick={togglePlayback}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                    {chanson}
                  </pre>
                </div>
                
                {index === 0 && tableauRangA && (
                  <div className="mt-3 text-xs text-gray-600">
                    <strong>Basé sur :</strong> {tableauRangA.theme || 'Tableau Rang A'}
                  </div>
                )}
                {index === 1 && tableauRangB && (
                  <div className="mt-3 text-xs text-gray-600">
                    <strong>Basé sur :</strong> {tableauRangB.theme || 'Tableau Rang B'}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {paroles.length < 2 && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded">
            <p className="text-orange-700">
              ⚠️ Il devrait y avoir 2 chansons complètes (une pour chaque rang). 
              Actuellement : {paroles.length} chanson{paroles.length > 1 ? 's' : ''} disponible{paroles.length > 1 ? 's' : ''}.
            </p>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>🎵 Sélectionnez un style musical, puis cliquez sur "Générer musique" pour créer votre version personnalisée.</p>
        </div>
      </CardContent>
    </Card>
  );
};
