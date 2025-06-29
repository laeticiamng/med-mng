
import { useState, useEffect } from 'react';
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
import { useLanguage, SupportedLanguage } from '@/contexts/LanguageContext';

interface ParolesMusicalesProps {
  paroles: string[];
  itemCode?: string;
  itemTitle?: string;
}

export const ParolesMusicales = ({ paroles, itemCode, itemTitle }: ParolesMusicalesProps) => {
  const [selectedStyle, setSelectedStyle] = useState('lofi-piano');
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

  // Logs de débogage pour identifier le problème
  useEffect(() => {
    console.log('🎵 ParolesMusicales - Props reçues:', {
      paroles: paroles?.length || 0,
      itemCode,
      itemTitle,
      parolesContent: paroles
    });
    
    if (!paroles || paroles.length < 2) {
      console.warn('⚠️ Paroles incomplètes:', {
        received: paroles?.length || 0,
        expected: 2,
        content: paroles
      });
    } else {
      console.log('✅ Paroles complètes:', {
        rangA: paroles[0]?.length || 0,
        rangB: paroles[1]?.length || 0
      });
    }
  }, [paroles, itemCode, itemTitle]);

  const musicStyles = [
    { value: 'lofi-piano', label: 'Lo-fi Piano Doux' },
    { value: 'afrobeat', label: 'Afrobeat Énergique' },
    { value: 'jazz-moderne', label: 'Jazz Moderne' },
    { value: 'hip-hop-conscient', label: 'Hip-Hop Conscient' },
    { value: 'soul-rnb', label: 'Soul R&B' },
    { value: 'electro-chill', label: 'Electro Chill' }
  ];

  const handleGenerateMusic = async (rang: 'A' | 'B') => {
    console.log(`🚀 Génération demandée pour Rang ${rang} avec style: ${selectedStyle}`);
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
        targetLanguage as SupportedLanguage,
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

  // Vérifier si nous avons des données valides à afficher
  if (!paroles || paroles.length < 2 || !paroles[0] || !paroles[1]) {
    return (
      <div className="space-y-8">
        <MusicHeader />
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">🎵</span>
            <h3 className="text-xl font-semibold text-red-800">
              Paroles musicales incomplètes
            </h3>
          </div>
          <p className="text-red-700 mb-4">
            Les paroles musicales pour cet item ne sont pas complètes dans Supabase.
          </p>
          <div className="text-sm text-red-600 bg-red-100 rounded p-3">
            <p><strong>Debug info:</strong></p>
            <p>Item Code: {itemCode || 'Non défini'}</p>
            <p>Item Title: {itemTitle || 'Non défini'}</p>
            <p>Paroles reçues: {paroles ? paroles.length : 0} élément(s)</p>
            <p>Rang A: {paroles?.[0] ? `${paroles[0].length} caractères` : 'Manquant'}</p>
            <p>Rang B: {paroles?.[1] ? `${paroles[1].length} caractères` : 'Manquant'}</p>
            <p><strong>Status:</strong> Données Supabase à compléter</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <MusicHeader />
      
      {/* Debug: Afficher les données reçues */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
        <p className="font-semibold text-green-800 mb-2">✅ Paroles musicales complètes :</p>
        <p>Item: {itemCode} - {itemTitle}</p>
        <p>Paroles disponibles: {paroles.length} rang(s)</p>
        <p>Rang A: {paroles[0].length} caractères</p>
        <p>Rang B: {paroles[1].length} caractères</p>
        <p><strong>Source:</strong> Données Supabase validées</p>
      </div>
      
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

      <MusicStyleIndicator selectedStyle={selectedStyle} />
    </div>
  );
};
