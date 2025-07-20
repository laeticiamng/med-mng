
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Play, Pause, Download, Library } from 'lucide-react';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';

interface GeneratorMusicPlayerProps {
  generatedSong: any;
  onAddToLibrary: () => void;
}

export const GeneratorMusicPlayer: React.FC<GeneratorMusicPlayerProps> = ({
  generatedSong,
  onAddToLibrary
}) => {
  const { currentTrack, isPlaying, play, pause, resume } = useGlobalAudio();

  if (!generatedSong) return null;

  const isCurrentTrack = currentTrack?.url === generatedSong.audioUrl;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying;

  const handlePlay = () => {
    if (isCurrentTrack) {
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
    } else {
      play({
        url: generatedSong.audioUrl,
        title: generatedSong.title,
        rang: 'A'
      });
    }
  };

  return (
    <Card className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Music className="h-6 w-6" />
          Musique générée avec succès !
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-square bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 max-w-xs mx-auto">
          <Music className="h-16 w-16 text-white/80" />
        </div>
        
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {generatedSong.title}
          </h3>
          <p className="text-gray-600 mb-4">
            Style: {generatedSong.style || 'Personnalisé'}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handlePlay}
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {isCurrentlyPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Écouter
              </>
            )}
          </Button>
          <Button
            onClick={onAddToLibrary}
            variant="outline"
            className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
            size="lg"
          >
            <Library className="h-4 w-4 mr-2" />
            Bibliothèque
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center mt-4">
          🎵 Votre musique est prête ! Utilisez les contrôles pour l'écouter.
        </div>
      </CardContent>
    </Card>
  );
};
