
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Minimize2, Loader2, AlertTriangle } from 'lucide-react';
import { AudioPlayer } from '../AudioPlayer';

interface MusicCardProps {
  rang: 'A' | 'B';
  title: string;
  paroles: string;
  selectedStyle: string;
  musicDuration: number;
  isGenerating: boolean;
  generatedAudio?: string;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  isMinimized: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onGenerateMusic: () => void;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onStop: () => void;
  onMinimize: () => void;
}

export const MusicCard = ({
  rang,
  title,
  paroles,
  selectedStyle,
  musicDuration,
  isGenerating,
  generatedAudio,
  isPlaying,
  isCurrentTrack,
  isMinimized,
  currentTime,
  duration,
  volume,
  onGenerateMusic,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onStop,
  onMinimize
}: MusicCardProps) => {
  // Protection supplémentaire contre les double-clics
  const [isClicked, setIsClicked] = useState(false);

  const formatParoles = (text: string) => {
    if (!text || text === 'Aucune parole disponible pour le Rang A' || text === 'Aucune parole disponible pour le Rang B') {
      return ['Aucune parole disponible pour ce rang.'];
    }
    
    return text
      .replace(/\\n/g, '\n')
      .replace(/\n\n+/g, '\n\n')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleGenerateClick = async () => {
    if (isClicked || isGenerating) {
      console.log(`⚠️ Clic ignoré - isClicked: ${isClicked}, isGenerating: ${isGenerating}`);
      return;
    }
    
    setIsClicked(true);
    console.log(`🎵 Clic génération Rang ${rang}`);
    
    try {
      await onGenerateMusic();
    } finally {
      // Réactiver après un délai pour éviter les double-clics rapides
      setTimeout(() => setIsClicked(false), 2000);
    }
  };

  const cardColor = rang === 'A' ? 'amber' : 'blue';
  const gradientFrom = rang === 'A' ? 'from-amber-50' : 'from-blue-50';
  const gradientTo = rang === 'A' ? 'to-orange-50' : 'to-indigo-50';
  const borderColor = rang === 'A' ? 'border-amber-300' : 'border-blue-300';
  const textColor = rang === 'A' ? 'text-amber-900' : 'text-blue-900';
  const iconColor = rang === 'A' ? 'text-amber-600' : 'text-blue-600';
  const buttonColor = rang === 'A' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700';

  const parolesArray = formatParoles(paroles);
  const hasValidParoles = parolesArray.length > 0 && parolesArray[0] !== 'Aucune parole disponible pour ce rang.';

  const isButtonDisabled = isGenerating || isClicked || !selectedStyle || !hasValidParoles;

  return (
    <Card className={`p-8 bg-gradient-to-br ${gradientFrom} ${gradientTo} ${borderColor} shadow-xl`}>
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <Music className={`h-6 w-6 ${iconColor} mr-3`} />
          <h3 className={`text-2xl font-serif ${textColor} font-bold`}>
            {title}
          </h3>
        </div>
      </div>
      
      {!hasValidParoles && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0" />
          <div className="text-yellow-800">
            <p className="font-medium">Paroles manquantes</p>
            <p className="text-sm">Les paroles pour ce rang ne sont pas encore disponibles dans la base de données.</p>
          </div>
        </div>
      )}
      
      <div className={`prose prose-lg max-w-none ${textColor} mb-8`}>
        {parolesArray.map((ligne, index) => {
          if (ligne.startsWith('[') && ligne.endsWith(']')) {
            return (
              <div key={index} className={`text-xl font-bold ${rang === 'A' ? 'text-amber-800' : 'text-blue-800'} my-4 text-center`}>
                {ligne}
              </div>
            );
          }
          if (ligne.includes(' - ')) {
            return (
              <div key={index} className={`text-2xl font-bold ${textColor} mb-6 text-center border-b-2 ${rang === 'A' ? 'border-amber-300' : 'border-blue-300'} pb-3`}>
                {ligne}
              </div>
            );
          }
          return (
            <div key={index} className="text-lg leading-relaxed mb-2 italic font-medium">
              {ligne}
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        <div className="flex justify-center">
          <Button
            onClick={handleGenerateClick}
            disabled={isButtonDisabled}
            className={`${buttonColor} text-white px-6 py-3 ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération {formatDuration(musicDuration)} en cours...
              </>
            ) : (
              `Générer Musique Rang ${rang} (${formatDuration(musicDuration)})`
            )}
          </Button>
        </div>
        
        {!hasValidParoles && (
          <p className="text-center text-sm text-gray-600">
            La génération nécessite des paroles valides depuis la base de données Supabase.
          </p>
        )}
        
        {generatedAudio && !isMinimized && (
          <AudioPlayer
            audioUrl={generatedAudio}
            title={title}
            isPlaying={isPlaying}
            currentTime={isCurrentTrack ? currentTime : 0}
            duration={isCurrentTrack ? duration : musicDuration}
            volume={volume}
            onPlayPause={onPlayPause}
            onSeek={onSeek}
            onVolumeChange={onVolumeChange}
            onStop={onStop}
            onClose={onMinimize}
          />
        )}

        {generatedAudio && isMinimized && isCurrentTrack && (
          <div className="text-center">
            <Button
              onClick={onMinimize}
              variant="outline"
              className={`${rang === 'A' ? 'border-amber-300 text-amber-600 hover:bg-amber-50' : 'border-blue-300 text-blue-600 hover:bg-blue-50'}`}
            >
              <Minimize2 className="h-4 w-4 mr-2" />
              Lecteur minimisé - Continuer l'écoute
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
