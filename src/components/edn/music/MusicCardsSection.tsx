
import { MusicCard } from './MusicCard';

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
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Fonction pour générer les titres spécifiques selon l'item
  const getTitlesForItem = (code: string = '', title: string = '') => {
    const duration = formatDuration(musicDuration);
    
    switch (code) {
      case 'IC-1':
        return {
          rangA: `${code} Rang A - Colloque Singulier & Communication (${duration})`,
          rangB: `${code} Rang B - Outils de Raisonnement & TICE (${duration})`
        };
      case 'IC-2':
        return {
          rangA: `${code} Rang A - Valeurs & Déontologie Médicale (${duration})`,
          rangB: `${code} Rang B - Organisation & Exercice Professionnel (${duration})`
        };
      case 'IC-3':
        return {
          rangA: `${code} Rang A - Evidence-Based Medicine (${duration})`,
          rangB: `${code} Rang B - Systèmes d'Aide & Expertise Clinique (${duration})`
        };
      case 'IC-4':
        return {
          rangA: `${code} Rang A - Qualité & Sécurité des Soins (${duration})`,
          rangB: `${code} Rang B - Expertise EIAS & Infectiologie (${duration})`
        };
      case 'IC-5':
        return {
          rangA: `${code} Rang A - Responsabilités & Erreurs Médicales (${duration})`,
          rangB: `${code} Rang B - Contentieux & Gestion Juridique (${duration})`
        };
      default:
        return {
          rangA: `Rang A - Connaissances Fondamentales (${duration})`,
          rangB: `Rang B - Expertise Avancée (${duration})`
        };
    }
  };

  const titles = getTitlesForItem(itemCode, itemTitle);

  return (
    <div className="space-y-8">
      <MusicCard
        rang="A"
        title={titles.rangA}
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
        title={titles.rangB}
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
