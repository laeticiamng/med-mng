import { SynchronizedLyricsDisplay } from '@/components/music/SynchronizedLyricsDisplay';
import { Button } from '@/components/ui/button';
import { ROUTE_PATHS } from '@/config/routes';
import { useSynchronizedLyrics } from '@/hooks/music/useSynchronizedLyrics';
import { Music, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ParolesMusicalesRangSection } from './ParolesMusicalesRangSection';
import { SunoGenerationStatus } from './SunoGenerationStatus';

interface CurrentTrack {
  url?: string;
  title?: string;
}

interface GenerationProgressItem {
  progress: number;
  attempts: number;
  maxAttempts: number;
  estimatedTimeRemaining?: number;
}

interface ParolesMusicalesMainContentProps {
  paroles: string[] | string[][];
  /** Paroles de la chanson combinée A+B, si elles existent ; sinon A puis B. */
  parolesAB?: string[];
  /** Pas d'accès à la génération audio : paroles seules, sans bouton. */
  generationVerrouillee?: boolean;
  itemCode: string;
  musicDuration: number;
  selectedStyle: string;
  isGenerating: { rangA: boolean; rangB: boolean; rangAB?: boolean };
  generatedAudio: { rangA?: string; rangB?: string; rangAB?: string };
  currentTrack: CurrentTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  generationProgress?: {
    rangA?: GenerationProgressItem;
    rangB?: GenerationProgressItem;
    rangAB?: GenerationProgressItem;
  };
  onGenerate: (rang: 'A' | 'B') => void;
  onGenerateMix: () => void;
  onPlayAudio: (audioUrl: string, title: string) => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onStop: () => void;
  pollingTracks?: number;
}

export const ParolesMusicalesMainContent: React.FC<ParolesMusicalesMainContentProps> = ({
  paroles,
  parolesAB,
  generationVerrouillee = false,
  itemCode,
  musicDuration,
  selectedStyle,
  isGenerating,
  generatedAudio,
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  generationProgress,
  onGenerate,
  onGenerateMix,
  onPlayAudio,
  onSeek,
  onVolumeChange,
  onStop,
  pollingTracks = 0
}) => {
  const navigate = useNavigate();
  const [showSyncLyrics, setShowSyncLyrics] = useState<'A' | 'B' | null>(null);
  
  // Normaliser les paroles en format attendu
  const normalizedParoles = Array.isArray(paroles[0]) 
    ? (paroles as string[][]).map(section => section.join('\n'))
    : paroles as string[];

  // Load synchronized lyrics when audio is available
  const { lyrics: lyricsA } = useSynchronizedLyrics({
    audioId: generatedAudio.rangA ? `${itemCode}-A` : undefined,
    rawLyrics: normalizedParoles[0],
    enableAutoSync: true
  });
  
  const { lyrics: lyricsB } = useSynchronizedLyrics({
    audioId: generatedAudio.rangB ? `${itemCode}-B` : undefined,
    rawLyrics: normalizedParoles[1],
    enableAutoSync: true
  });

  // Calculate current line index from currentTime
  const getCurrentLineIndex = (lyrics: { time: number; text: string }[]) => {
    if (!lyrics?.length || !currentTime) return -1;
    return lyrics.findIndex((line, index) => {
      const nextLine = lyrics[index + 1];
      return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
    });
  };

  if (!normalizedParoles || normalizedParoles.length === 0 || normalizedParoles.every(p => !p || p.trim() === '')) {
    return (
      <div className="p-6 bg-gradient-to-br from-warning/5 to-accent/5 border border-warning/20 rounded-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
            <Music className="h-6 w-6 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Paroles pas encore disponibles</h3>
            <p className="text-sm text-muted-foreground">
              La chanson pour <strong>{itemCode}</strong> n'est pas encore disponible.
            </p>
          </div>
        </div>
        
        <div className="bg-background/50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Comment ça fonctionne :</h4>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Les paroles sont générées à partir des compétences OIC de l'item</li>
            <li>Une IA de génération audio les transforme en chanson</li>
            <li>Vous pouvez écouter et télécharger le résultat</li>
          </ol>
        </div>
        
        {!generationVerrouillee && (<>
        <Button 
          onClick={() => navigate(`${ROUTE_PATHS.medMngCreate}?itemCode=${itemCode}`)}
          className="w-full gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" />
          Générer cette chanson
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          💡 Vous serez redirigé vers le générateur de musique avec cet item pré-sélectionné
        </p>
        </>)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Paroles de l'item</h3>
      
      {normalizedParoles[0] && (
        <div className="space-y-2">
          <SunoGenerationStatus 
            isPolling={isGenerating.rangA}
            pollingCount={pollingTracks}
            hasAudio={!!generatedAudio.rangA}
            rang="A"
          />
          <ParolesMusicalesRangSection
            generationVerrouillee={generationVerrouillee}
            rang="A"
            paroles={normalizedParoles[0]}
            musicDuration={musicDuration}
            selectedStyle={selectedStyle}
            isGenerating={isGenerating.rangA}
            generatedAudio={generatedAudio.rangA}
            itemCode={itemCode}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            onGenerate={() => onGenerate('A')}
            onPlayAudio={onPlayAudio}
            onSeek={onSeek}
            onVolumeChange={onVolumeChange}
            onStop={onStop}
            generationProgress={generationProgress?.rangA}
          />
          
          {/* Synchronized Lyrics Display for Rang A */}
          {generatedAudio.rangA && lyricsA.length > 0 && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSyncLyrics(showSyncLyrics === 'A' ? null : 'A')}
                className="mb-2 gap-2"
              >
                <Music className="h-4 w-4" />
                {showSyncLyrics === 'A' ? 'Masquer' : 'Afficher'} paroles synchronisées
              </Button>
              
              {showSyncLyrics === 'A' && (
                <SynchronizedLyricsDisplay
                  lyrics={lyricsA}
                  currentLineIndex={getCurrentLineIndex(lyricsA)}
                  variant="karaoke"
                  onLineClick={(index) => onSeek(lyricsA[index].time)}
                />
              )}
            </div>
          )}
        </div>
      )}

      {normalizedParoles[1] && (
        <div className="space-y-2">
          <SunoGenerationStatus 
            isPolling={isGenerating.rangB}
            pollingCount={pollingTracks}
            hasAudio={!!generatedAudio.rangB}
            rang="B"
          />
          <ParolesMusicalesRangSection
            generationVerrouillee={generationVerrouillee}
            rang="B"
            paroles={normalizedParoles[1]}
            musicDuration={musicDuration}
            selectedStyle={selectedStyle}
            isGenerating={isGenerating.rangB}
            generatedAudio={generatedAudio.rangB}
            itemCode={itemCode}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            onGenerate={() => onGenerate('B')}
            onPlayAudio={onPlayAudio}
            onSeek={onSeek}
            onVolumeChange={onVolumeChange}
            onStop={onStop}
            generationProgress={generationProgress?.rangB}
          />
          
          {/* Synchronized Lyrics Display for Rang B */}
          {generatedAudio.rangB && lyricsB.length > 0 && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSyncLyrics(showSyncLyrics === 'B' ? null : 'B')}
                className="mb-2 gap-2"
              >
                <Music className="h-4 w-4" />
                {showSyncLyrics === 'B' ? 'Masquer' : 'Afficher'} paroles synchronisées
              </Button>
              
              {showSyncLyrics === 'B' && (
                <SynchronizedLyricsDisplay
                  lyrics={lyricsB}
                  currentLineIndex={getCurrentLineIndex(lyricsB)}
                  variant="karaoke"
                  onLineClick={(index) => onSeek(lyricsB[index].time)}
                />
              )}
            </div>
          )}
        </div>
      )}

      {normalizedParoles[0] && normalizedParoles[1] && (
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-lg">
          <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
            🎵 Chanson combinée Rang A+B
          </h4>
          <ParolesMusicalesRangSection
            generationVerrouillee={generationVerrouillee}
            rang="A"
            libelleRang="A+B"
            paroles={parolesAB && parolesAB.length > 0
              ? parolesAB.join('\n')
              : `${normalizedParoles[0]}\n\n${normalizedParoles[1]}`}
            /* Même durée demandée que les autres rangs (le serveur la borne à
               90–300 s) : le bouton annonçait 1,5 × la durée, jamais demandée. */
            musicDuration={musicDuration}
            selectedStyle={selectedStyle}
            isGenerating={Boolean(isGenerating.rangAB)}
            generatedAudio={generatedAudio.rangAB}
            itemCode={`${itemCode}-FUSION`}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            onGenerate={() => onGenerateMix()}
            onPlayAudio={onPlayAudio}
            onSeek={onSeek}
            onVolumeChange={onVolumeChange}
            onStop={onStop}
            generationProgress={generationProgress?.rangAB}
            title="Chanson Rang A+B"
          />
          <p className="text-primary/80 text-sm mt-2">
            Une seule chanson qui reprend les compétences de rang A puis de rang B de {itemCode}.
          </p>
        </div>
      )}
    </div>
  );
};
