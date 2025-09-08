import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MusicVersionDisplay } from '@/components/music/MusicVersionDisplay';
import { Music } from 'lucide-react';
import { useEnhancedParolesMusicales } from '@/hooks/useEnhancedParolesMusicales';
import { MusicVersionSelector } from './music/MusicVersionSelector';
import { ParolesMusicalesControls } from './music/ParolesMusicalesControls';
import { ParolesMusicalesErrorSection } from './music/ParolesMusicalesErrorSection';
import { MusicCardsSection } from './music/MusicCardsSection';

interface EnhancedParolesMusicalesProps {
  paroles?: string[];
  paroles_rang_a?: string[];
  paroles_rang_b?: string[];
  paroles_rang_ab?: string[];
  itemCode: string;
  tableauRangA?: any;
  tableauRangB?: any;
}

export const EnhancedParolesMusicales: React.FC<EnhancedParolesMusicalesProps> = ({
  paroles = [],
  paroles_rang_a,
  paroles_rang_b,
  paroles_rang_ab,
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
  } = useEnhancedParolesMusicales(paroles, { paroles_rang_a, paroles_rang_b, paroles_rang_ab });

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
                isGenerating={isGenerating.rangA || isGenerating.rangB || isGenerating.rangAB}
                generatedAudio={generatedAudio}
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

            {/* Musiques générées - Affichage selon documentation Suno (2 versions par génération) */}
            {(generatedAudio.rangA_v1 || generatedAudio.rangB_v1 || generatedAudio.rangAB_v1 || 
              generatedAudio.rangA || generatedAudio.rangB || generatedAudio.rangAB) && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">🎵 Musiques générées</h3>
                  <span className="text-sm text-muted-foreground bg-blue-50 px-2 py-1 rounded">
                    📖 Suno API: 2 versions par génération
                  </span>
                </div>
                
                <div className="space-y-4">
                  {/* Rang A - 2 versions */}
                  {(generatedAudio.rangA_v1 || generatedAudio.rangA) && (
                    <MusicVersionDisplay
                      rang="A"
                      title={`${itemCode} - Rang A (Compétences fondamentales)`}
                      version1Url={generatedAudio.rangA_v1 || generatedAudio.rangA}
                      version2Url={generatedAudio.rangA_v2}
                      currentTrack={currentTrack?.url}
                      isPlaying={isPlaying}
                      onPlayPause={handlePlayAudio}
                      style={selectedStyle}
                      duration={musicDuration}
                    />
                  )}

                  {/* Rang B - 2 versions */}
                  {(generatedAudio.rangB_v1 || generatedAudio.rangB) && (
                    <MusicVersionDisplay
                      rang="B"
                      title={`${itemCode} - Rang B (Compétences avancées)`}
                      version1Url={generatedAudio.rangB_v1 || generatedAudio.rangB}
                      version2Url={generatedAudio.rangB_v2}
                      currentTrack={currentTrack?.url}
                      isPlaying={isPlaying}
                      onPlayPause={handlePlayAudio}
                      style={selectedStyle}
                      duration={musicDuration}
                    />
                  )}

                  {/* Rang A+B Mix - 2 versions */}
                  {(generatedAudio.rangAB_v1 || generatedAudio.rangAB) && (
                    <MusicVersionDisplay
                      rang="AB"
                      title={`${itemCode} - Rang A+B (Compétences complètes)`}
                      version1Url={generatedAudio.rangAB_v1 || generatedAudio.rangAB}
                      version2Url={generatedAudio.rangAB_v2}
                      currentTrack={currentTrack?.url}
                      isPlaying={isPlaying}
                      onPlayPause={handlePlayAudio}
                      style={selectedStyle}
                      duration={musicDuration}
                    />
                  )}
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