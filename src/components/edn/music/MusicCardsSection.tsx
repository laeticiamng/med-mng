
import { MusicCard } from './MusicCard';
import { useGlobalTranslation } from '@/hooks/useGlobalTranslation';
import { useEffect, useState } from 'react';

interface MusicCardsSectionProps {
  paroles: string[];
  selectedStyle: string;
  musicDuration: number;
  isGenerating: { rangA: boolean; rangB: boolean };
  generatedAudio: { rangA?: string; rangB?: string };
  onGenerateMusic: (rang: 'A' | 'B') => void;
  onPlayPause: (rang: 'rangA' | 'rangB') => void;
  isCurrentTrackPlaying: (rang: 'rangA' | 'rangB') => boolean;
  isCurrentTrack: (rang: 'rangA' | 'rangB') => boolean;
  isMinimized: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onStop: () => void;
  onMinimize: () => void;
  itemCode?: string;
  itemTitle?: string;
}

export const MusicCardsSection = ({
  paroles,
  selectedStyle,
  musicDuration,
  isGenerating,
  generatedAudio,
  onGenerateMusic,
  onPlayPause,
  isCurrentTrackPlaying,
  isCurrentTrack,
  isMinimized,
  currentTime,
  duration,
  volume,
  onSeek,
  onVolumeChange,
  onStop,
  onMinimize,
  itemCode,
  itemTitle
}: MusicCardsSectionProps) => {
  const { translateContent, currentLanguage, isTranslationNeeded } = useGlobalTranslation();
  const [translatedTitles, setTranslatedTitles] = useState({
    rangA: '',
    rangB: ''
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Générer les titres spécifiques selon l'item et les traduire
  useEffect(() => {
    const generateAndTranslateTitles = async () => {
      const duration = formatDuration(musicDuration);
      
      let baseTitles = {
        rangA: '',
        rangB: ''
      };

      switch (itemCode) {
        case 'IC-1':
          baseTitles = {
            rangA: `${itemCode} Rang A - Colloque Singulier & Communication (${duration})`,
            rangB: `${itemCode} Rang B - Outils de Raisonnement & TICE (${duration})`
          };
          break;
        case 'IC-2':
          baseTitles = {
            rangA: `${itemCode} Rang A - Valeurs & Déontologie Médicale (${duration})`,
            rangB: `${itemCode} Rang B - Organisation & Exercice Professionnel (${duration})`
          };
          break;
        case 'IC-3':
          baseTitles = {
            rangA: `${itemCode} Rang A - Evidence-Based Medicine (${duration})`,
            rangB: `${itemCode} Rang B - Systèmes d'Aide & Expertise Clinique (${duration})`
          };
          break;
        case 'IC-4':
          baseTitles = {
            rangA: `${itemCode} Rang A - Qualité & Sécurité des Soins (${duration})`,
            rangB: `${itemCode} Rang B - Expertise EIAS & Infectiologie (${duration})`
          };
          break;
        case 'IC-5':
          baseTitles = {
            rangA: `${itemCode} Rang A - Responsabilités & Erreurs Médicales (${duration})`,
            rangB: `${itemCode} Rang B - Contentieux & Gestion Juridique (${duration})`
          };
          break;
        default:
          baseTitles = {
            rangA: `Rang A - Connaissances Fondamentales (${duration})`,
            rangB: `Rang B - Expertise Avancée (${duration})`
          };
      }

      // Traduire les titres si nécessaire
      if (isTranslationNeeded) {
        const translatedRangA = await translateContent(baseTitles.rangA);
        const translatedRangB = await translateContent(baseTitles.rangB);
        
        setTranslatedTitles({
          rangA: translatedRangA,
          rangB: translatedRangB
        });
      } else {
        setTranslatedTitles(baseTitles);
      }
    };

    generateAndTranslateTitles();
  }, [itemCode, itemTitle, musicDuration, currentLanguage, isTranslationNeeded, translateContent]);

  return (
    <div className="space-y-8">
      <MusicCard
        rang="A"
        title={translatedTitles.rangA}
        paroles={paroles[0] || 'Aucune parole disponible pour le Rang A'}
        selectedStyle={selectedStyle}
        musicDuration={musicDuration}
        isGenerating={isGenerating.rangA}
        generatedAudio={generatedAudio.rangA}
        isPlaying={isCurrentTrackPlaying('rangA')}
        isCurrentTrack={isCurrentTrack('rangA')}
        isMinimized={isMinimized}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        onGenerateMusic={() => onGenerateMusic('A')}
        onPlayPause={() => onPlayPause('rangA')}
        onSeek={onSeek}
        onVolumeChange={onVolumeChange}
        onStop={onStop}
        onMinimize={onMinimize}
      />

      <MusicCard
        rang="B"
        title={translatedTitles.rangB}
        paroles={paroles[1] || 'Aucune parole disponible pour le Rang B'}
        selectedStyle={selectedStyle}
        musicDuration={musicDuration}
        isGenerating={isGenerating.rangB}
        generatedAudio={generatedAudio.rangB}
        isPlaying={isCurrentTrackPlaying('rangB')}
        isCurrentTrack={isCurrentTrack('rangB')}
        isMinimized={isMinimized}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        onGenerateMusic={() => onGenerateMusic('B')}
        onPlayPause={() => onPlayPause('rangB')}
        onSeek={onSeek}
        onVolumeChange={onVolumeChange}
        onStop={onStop}
        onMinimize={onMinimize}
      />
    </div>
  );
};
