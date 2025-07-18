import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music } from 'lucide-react';
import { useEnhancedParolesMusicales } from '@/hooks/useEnhancedParolesMusicales';
import { MusicVersionSelector } from './music/MusicVersionSelector';
import { ParolesMusicalesControls } from './music/ParolesMusicalesControls';
import { ParolesMusicalesErrorSection } from './music/ParolesMusicalesErrorSection';
import { MusicCardsSection } from './music/MusicCardsSection';

interface EnhancedParolesMusicalesProps {
  paroles?: string[];
  itemCode: string;
  tableauRangA?: any;
  tableauRangB?: any;
}

export const EnhancedParolesMusicales: React.FC<EnhancedParolesMusicalesProps> = ({
  paroles = [],
  itemCode,
  tableauRangA,
  tableauRangB
}) => {
  console.log('🎵 EnhancedParolesMusicales - Rendu avec props:', { 
    paroles: paroles?.length, 
    itemCode, 
    hasTableauA: !!tableauRangA, 
    hasTableauB: !!tableauRangB 
  });

  const {
    selectedStyle,
    setSelectedStyle,
    musicDuration,
    setMusicDuration,
    selectedVersion,
    setSelectedVersion,
    isGenerating,
    generatedAudio,
    generationProgress,
    lastError,
    currentLanguage,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    enhancedParoles,
    handleGenerate,
    handlePlayAudio,
    seek,
    changeVolume,
    stop
  } = useEnhancedParolesMusicales(paroles);

  console.log('🎵 ÉTAT ACTUEL generatedAudio:', generatedAudio);
  console.log('🎵 ÉTAT ACTUEL enhancedParoles:', enhancedParoles?.length);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-6 w-6 text-amber-600" />
            Génération Musicale Avancée - {itemCode}
          </CardTitle>
          <CardDescription>
            Génération de musique avec versions Rang A, Rang B et Rang A+B combinés via Suno AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            
            {/* Sélecteur de version musicale */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Choisissez votre version</h3>
              <MusicVersionSelector
                paroles={enhancedParoles}
                selectedVersion={selectedVersion}
                onVersionChange={setSelectedVersion}
                onGenerate={handleGenerate}
                isGenerating={isGenerating.rangA || isGenerating.rangB}
                generatedAudio={{
                  rangA: generatedAudio.rangA,
                  rangB: generatedAudio.rangB,
                  rangAB: generatedAudio.rangAB ?? undefined
                }}
              />
            </div>

            {/* Contrôles de style et durée */}
            <ParolesMusicalesControls
              selectedStyle={selectedStyle}
              musicDuration={musicDuration}
              onStyleChange={setSelectedStyle}
              onDurationChange={setMusicDuration}
            />

            {/* Section d'erreur */}
            <ParolesMusicalesErrorSection lastError={lastError} />

            {/* Cartes de musique générée */}
            {(generatedAudio.rangA || generatedAudio.rangB || generatedAudio.rangAB) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Musiques générées</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  
                  {/* Version Rang A */}
                  {generatedAudio.rangA && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">🎵 Version Rang A</h4>
                      <p className="text-sm text-blue-600 mb-3">Compétences fondamentales</p>
                      <div className="space-y-2">
                        <button 
                          onClick={() => handlePlayAudio(generatedAudio.rangA!, `${itemCode} - Rang A`)}
                          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          {currentTrack?.url === generatedAudio.rangA && isPlaying ? 'Pause' : 'Écouter'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Version Rang B */}
                  {generatedAudio.rangB && (
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">🎵 Version Rang B</h4>
                      <p className="text-sm text-purple-600 mb-3">Compétences avancées</p>
                      <div className="space-y-2">
                        <button 
                          onClick={() => handlePlayAudio(generatedAudio.rangB!, `${itemCode} - Rang B`)}
                          className="w-full p-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                        >
                          {currentTrack?.url === generatedAudio.rangB && isPlaying ? 'Pause' : 'Écouter'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Version Rang A+B - Générer la version combinée */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">🎵 Version Rang A+B</h4>
                    <p className="text-sm text-green-600 mb-3">Compétences complètes combinées</p>
                    <div className="space-y-2">
                      {generatedAudio.rangAB ? (
                        <button 
                          onClick={() => handlePlayAudio(generatedAudio.rangAB!, `${itemCode} - Rang A+B`)}
                          className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          {currentTrack?.url === generatedAudio.rangAB && isPlaying ? 'Pause' : 'Écouter'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleGenerate('AB')}
                          disabled={isGenerating.rangA || isGenerating.rangB || !enhancedParoles[2]}
                          className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                        >
                          {isGenerating.rangA || isGenerating.rangB ? 'Génération...' : 'Générer Version A+B'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Informations de débogage */}
            <div className="p-4 bg-gray-50 rounded-lg text-xs space-y-2">
              <div><strong>Item:</strong> {itemCode}</div>
              <div><strong>Paroles disponibles:</strong> {enhancedParoles?.length || 0}</div>
              <div><strong>Version sélectionnée:</strong> {selectedVersion}</div>
              <div><strong>Style:</strong> {selectedStyle}</div>
              <div><strong>Durée:</strong> {musicDuration}s</div>
              <div><strong>Langue:</strong> {currentLanguage}</div>
              <div><strong>En génération:</strong> {isGenerating ? 'Oui' : 'Non'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};