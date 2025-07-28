
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Play, Pause, Download, Library, Bug } from 'lucide-react';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { DebugAudioButton } from './DebugAudioButton';

interface GeneratorMusicPlayerProps {
  generatedSong: any;
  onAddToLibrary: () => void;
}

export const GeneratorMusicPlayer: React.FC<GeneratorMusicPlayerProps> = ({
  generatedSong,
  onAddToLibrary
}) => {
  const { currentTrack, isPlaying, play, pause, resume } = useGlobalAudio();
  const [showDebug, setShowDebug] = useState(false);

  console.log('🎵 GeneratorMusicPlayer render:', {
    hasGeneratedSong: !!generatedSong,
    audioUrl: generatedSong?.audioUrl,
    isCurrentTrack: currentTrack?.url === generatedSong?.audioUrl,
    isPlaying,
    currentTrack
  });

  if (!generatedSong) return null;

  const isCurrentTrack = currentTrack?.url === generatedSong.audioUrl;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying;

  const handlePlay = () => {
    console.log('🎵 GeneratorMusicPlayer: Tentative de lecture', {
      audioUrl: generatedSong.audioUrl,
      title: generatedSong.title,
      isCurrentTrack,
      isPlaying,
      hasGeneratedSong: !!generatedSong,
      urlType: generatedSong.audioUrl?.startsWith('http') ? 'http' : 'relative',
      generatedSongObject: generatedSong
    });

    // CORRECTION 1: Vérifier que l'URL audio est valide
    if (!generatedSong.audioUrl || 
        generatedSong.audioUrl === '' || 
        generatedSong.audioUrl === 'undefined' ||
        generatedSong.audioUrl === null) {
      console.error('❌ URL audio invalide dans GeneratorMusicPlayer:', generatedSong.audioUrl);
      alert('❌ Erreur: URL audio manquante ou invalide. Veuillez regénérer la musique.');
      return;
    }

    // CORRECTION 2: Vérifier que l'URL ne pointe pas vers example.com
    if (generatedSong.audioUrl.includes('example.com')) {
      console.error('⚠️ URL de simulation détectée (example.com) - fonctionnement impossible');
      alert('⚠️ Mode simulation détecté. Cette fonctionnalité nécessite une vraie URL audio.');
      return;
    }

    // CORRECTION 3: Vérifier que l'URL est accessible
    console.log('🔍 Test de l\'URL audio:', generatedSong.audioUrl);
    
    // Test simple de connectivité de l'URL
    const testAudioAccess = () => {
      const audio = new Audio();
      audio.preload = 'metadata';
      
      audio.addEventListener('loadedmetadata', () => {
        console.log('✅ URL audio accessible, durée:', audio.duration);
      });
      
      audio.addEventListener('error', (e) => {
        console.error('❌ Erreur accès URL audio:', e);
        alert('❌ Impossible d\'accéder à l\'audio. Vérifiez la connectivité.');
      });
      
      audio.src = generatedSong.audioUrl;
    };

    testAudioAccess();

    if (isCurrentTrack) {
      if (isPlaying) {
        console.log('⏸️ Pause audio en cours');
        pause();
      } else {
        console.log('▶️ Reprise audio');
        resume();
      }
    } else {
      console.log('🎵 Démarrage nouveau track avec URL:', generatedSong.audioUrl);
      play({
        url: generatedSong.audioUrl,
        title: generatedSong.title || 'Musique générée',
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
          <Button
            onClick={() => setShowDebug(!showDebug)}
            variant="ghost"
            size="lg"
            className="text-gray-500 hover:text-gray-700"
            title="Debug audio"
          >
            <Bug className="h-4 w-4" />
          </Button>
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold text-sm text-gray-700">🐛 Debug Audio</h4>
            <DebugAudioButton 
              audioUrl={generatedSong.audioUrl} 
              title={generatedSong.title}
            />
            <div className="text-xs text-gray-500 space-y-1">
              <div>Object: {JSON.stringify(generatedSong, null, 2).substring(0, 200)}...</div>
              <div>Current Track: {currentTrack?.url}</div>
              <div>Is Playing: {isPlaying ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center mt-4 space-y-1">
          <p>🎵 Votre musique est prête ! Utilisez les contrôles pour l'écouter.</p>
          {generatedSong.audioUrl && (
            <p className="break-all">🔗 URL: {generatedSong.audioUrl.substring(0, 80)}...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
