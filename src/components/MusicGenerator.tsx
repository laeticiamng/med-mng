import React from 'react';
import { AudioPlayer } from './AudioPlayer/AudioPlayer';
import { MiniPlayer } from './AudioPlayer/MiniPlayer';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useMusicGeneration } from '../hooks/useMusicGeneration';

export const MusicGenerator = () => {
  const { isGenerating, songData, generateMusic } = useMusicGeneration();

  const { currentSong, playlist, setCurrentSong, playNext, playPrevious } =
    useAudioPlayer();

  React.useEffect(() => {
    if (songData?.audio_url) {
      setCurrentSong(songData);
    }
  }, [songData, setCurrentSong]);

  return (
    <div className="music-generator">
      <div className="generation-controls">
        <button
          onClick={() =>
            generateMusic({
              prompt: 'Paroles IC4 Rang A',
              style: 'lofi-piano',
              duration: '4:00',
            })
          }
          disabled={isGenerating}
        >
          {isGenerating ? 'Génération...' : 'Générer Musique'}
        </button>
      </div>

      {currentSong && (
        <AudioPlayer
          song={currentSong}
          playlist={playlist}
          onSongChange={setCurrentSong}
          autoPlay={true}
          showDownload={true}
        />
      )}

      {currentSong && (
        <MiniPlayer
          song={currentSong}
          isPlaying={false}
          onTogglePlay={() => {}}
          onNext={playNext}
          onExpand={() => {}}
        />
      )}
    </div>
  );
};
