import { useState, useEffect, useCallback } from 'react';

interface Song {
  id: string;
  title: string;
  audio_url: string;
  duration?: string;
  style?: string;
}

interface UseAudioPlayerReturn {
  currentSong: Song | null;
  playlist: Song[];
  isPlaying: boolean;
  setCurrentSong: (song: Song) => void;
  addToPlaylist: (song: Song) => void;
  removeFromPlaylist: (songId: string) => void;
  clearPlaylist: () => void;
  playNext: () => void;
  playPrevious: () => void;
}

export const useAudioPlayer = (): UseAudioPlayerReturn => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const savedPlaylist = localStorage.getItem('music-playlist');
    if (savedPlaylist) {
      try {
        setPlaylist(JSON.parse(savedPlaylist));
      } catch (err) {
        console.error('Error loading playlist:', err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('music-playlist', JSON.stringify(playlist));
  }, [playlist]);

  const addToPlaylist = useCallback((song: Song) => {
    setPlaylist((prev) => {
      const exists = prev.find((s) => s.id === song.id);
      if (exists) return prev;
      return [...prev, song];
    });
  }, []);

  const removeFromPlaylist = useCallback((songId: string) => {
    setPlaylist((prev) => prev.filter((s) => s.id !== songId));
  }, []);

  const clearPlaylist = useCallback(() => {
    setPlaylist([]);
    setCurrentSong(null);
  }, []);

  const playNext = useCallback(() => {
    if (!currentSong || playlist.length === 0) return;

    const currentIndex = playlist.findIndex((s) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentSong(playlist[nextIndex]);
  }, [currentSong, playlist]);

  const playPrevious = useCallback(() => {
    if (!currentSong || playlist.length === 0) return;

    const currentIndex = playlist.findIndex((s) => s.id === currentSong.id);
    const prevIndex =
      currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    setCurrentSong(playlist[prevIndex]);
  }, [currentSong, playlist]);

  const handleSetCurrentSong = useCallback(
    (song: Song) => {
      setCurrentSong(song);
      addToPlaylist(song);
    },
    [addToPlaylist]
  );

  return {
    currentSong,
    playlist,
    isPlaying,
    setCurrentSong: handleSetCurrentSong,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    playNext,
    playPrevious,
  };
};
