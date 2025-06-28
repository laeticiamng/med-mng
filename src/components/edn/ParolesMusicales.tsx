
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MusicHeader } from './music/MusicHeader';
import { MusicStyleSelector } from './music/MusicStyleSelector';
import { MusicDurationSelector } from './music/MusicDurationSelector';
import { MusicErrorDisplay } from './music/MusicErrorDisplay';
import { MusicCardsSection } from './music/MusicCardsSection';
import { MusicStyleIndicator } from './music/MusicStyleIndicator';
import { LanguageTranspositionPanel } from './music/LanguageTranspositionPanel';
import { useMusicGenerationWithTranslation } from '@/hooks/useMusicGenerationWithTranslation';
import { useAudioControls } from '@/hooks/useAudioControls';
import { useLanguage } from '@/contexts/LanguageContext';

interface ParolesMusicalesProps {
  paroles: string[];
  itemCode?: string;
  itemTitle?: string;
}

export const ParolesMusicales = ({ paroles, itemCode, itemTitle }: ParolesMusicalesProps) => {
  const [selectedStyle, setSelectedStyle] = useState('');
  const [musicDuration, setMusicDuration] = useState(240);
  const [showTranspositionPanel, setShowTranspositionPanel] = useState(false);
  
  const { currentLanguage } = useLanguage();
  const { 
    isGenerating, 
    generatedAudio, 
    lastError, 
    generateMusicInLanguage,
    transposeMusicToLanguage 
  } = useMusicGenerationWithTranslation();
  
  const {
    currentTime,
    duration,
    volume,
    isMinimized,
    handlePlayPause,
    handleStop,
    isCurrentTrackPlaying,
    isCurrentTrack,
    seek,
    changeVolume,
    minimize
  } = useAudioControls();

  const musicStyles = [
    { value: 'lofi-piano', label: 'Lo-fi Piano Doux' },
    { value: 'afrobeat', label: 'Afrobeat Énergique' },
    { value: 'jazz-moderne', label: 'Jazz Moderne' },
    { value: 'hip-hop-conscient', label: 'Hip-Hop Conscient' },
    { value: 'soul-rnb', label: 'Soul R&B' },
    { value: 'electro-chill', label: 'Electro Chill' }
  ];

  const handleGenerateMusic = async (rang: 'A' | 'B') => {
    await generateMusicInLanguage(rang, paroles, selectedStyle, musicDuration);
  };

  const handlePlayPauseWrapper = (rang: 'rangA' | 'rangB') => {
    handlePlayPause(rang, generatedAudio);
  };

  const isCurrentTrackPlayingWrapper = (rang: 'rangA' | 'rangB') => {
    return isCurrentTrackPlaying(rang, generatedAudio);
  };

  const isCurrentTrackWrapper = (rang: 'rangA' | 'rangB') => {
    return isCurrentTrack(rang, generatedAudio);
  };

  const handleTransposeMusic = async (targetLanguage: string, rang: 'A' | 'B') => {
    const parolesIndex = rang === 'A' ? 0 : 1;
    const originalLyrics = paroles[parolesIndex];
    
    if (!originalLyrics) {
      console.error('Aucune parole disponible pour la transposition');
      return;
    }

    try {
      const transposedAudioUrl = await transposeMusicToLanguage(
        originalLyrics,
        targetLanguage,
        selectedStyle,
        musicDuration
      );
      
      // Mettre à jour l'audio généré avec la version transposée
      const audioKey = rang === 'A' ? 'rangA' : 'rangB';
      // Note: Ici vous pourriez vouloir stocker les versions dans différentes langues
      // Pour l'instant, on remplace l'audio existant
      console.log(`Musique transposée vers ${targetLanguage}:`, transposedAudioUrl);
    } catch (error) {
      console.error('Erreur lors de la transposition:', error);
    }
  };

  return (
    <div className="space-y-8">
      <MusicHeader />
      
      {/* Indication de la langue actuelle */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌍</span>
          <div>
            <p className="font-semibold text-blue-800">
              Interface en {currentLanguage === 'fr' ? 'Français' : currentLanguage}
            </p>
            <p className="text-sm text-blue-600">
              La musique sera générée dans cette langue à partir du contenu pédagogique français
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MusicStyleSelector 
          selectedStyle={selectedStyle}
          onStyleChange={setSelectedStyle}
          musicStyles={musicStyles}
        />
        
        <MusicDurationSelector
          duration={musicDuration}
          onDurationChange={setMusicDuration}
          disabled={isGenerating.rangA || isGenerating.rangB}
        />
      </div>

      {lastError && <MusicErrorDisplay error={lastError} />}

      <MusicCardsSection
        paroles={paroles}
        selectedStyle={selectedStyle}
        musicDuration={musicDuration}
        isGenerating={isGenerating}
        generatedAudio={generatedAudio}
        onGenerateMusic={handleGenerateMusic}
        onPlayPause={handlePlayPauseWrapper}
        isCurrentTrackPlaying={isCurrentTrackPlayingWrapper}
        isCurrentTrack={isCurrentTrackWrapper}
        isMinimized={isMinimized}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        onSeek={seek}
        onVolumeChange={changeVolume}
        onStop={handleStop}
        onMinimize={minimize}
        itemCode={itemCode}
        itemTitle={itemTitle}
      />

      {/* Panel de transposition dans d'autres langues */}
      {(generatedAudio.rangA || generatedAudio.rangB) && (
        <LanguageTranspositionPanel
          isVisible={showTranspositionPanel}
          onToggle={() => setShowTranspositionPanel(!showTranspositionPanel)}
          onTranspose={handleTransposeMusic}
          currentLanguage={currentLanguage}
          hasRangA={!!generatedAudio.rangA}
          hasRangB={!!generatedAudio.rangB}
        />
      )}

      <MusicStyleIndicator selectedStyle={selectedStyle} musicStyles={musicStyles} />
    </div>
  );
};
