import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { TranslatedText } from '@/components/global/TranslatedText';

interface DemoTrack {
  id: string;
  title: string;
  genre: string;
  audio_url: string;
  duration: number;
}

export const AudioDemoPlayer = () => {
  const [tracks, setTracks] = useState<DemoTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<DemoTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchDemoTracks = async () => {
      try {
        const { data, error } = await supabase
          .from('edn_suno_tracks')
          .select('id, audio_url, duration, genre')
          .eq('status', 'completed')
          .not('audio_url', 'is', null)
          .limit(3);

        if (error || !data?.length) {
          setIsLoading(false);
          return;
        }

        const demoTracks: DemoTrack[] = data.map((track, i) => ({
          id: track.id,
          title: `Extrait démo ${i + 1}`,
          genre: track.genre || 'Médical',
          audio_url: track.audio_url!,
          duration: track.duration || 180,
        }));

        setTracks(demoTracks);
        setCurrentTrack(demoTracks[0]);
      } catch {
        // Silent fail — demo player is optional
      } finally {
        setIsLoading(false);
      }
    };

    fetchDemoTracks();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        // Autoplay blocked
      }
    }
  };

  const selectTrack = (track: DemoTrack) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentTrack(track);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading || tracks.length === 0) return null;

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Volume2 className="h-4 w-4 text-primary" />
        <span className="font-medium"><TranslatedText text="🎧 Écoute un extrait — sans inscription" /></span>
      </div>

      {/* Track selector */}
      <div className="flex gap-2 flex-wrap">
        {tracks.map((track, i) => (
          <button
            key={track.id}
            onClick={() => selectTrack(track)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentTrack?.id === track.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            Extrait {i + 1}
          </button>
        ))}
      </div>

      {/* Player */}
      {currentTrack && (
        <div className="flex items-center gap-4 bg-muted/30 rounded-2xl p-4 border border-border/30">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </motion.button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-foreground truncate">
                {currentTrack.title}
              </p>
              <button
                onClick={() => {
                  setIsMuted(!isMuted);
                  if (audioRef.current) audioRef.current.muted = !isMuted;
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>

            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>{formatTime(currentTime)}</span>
              <span className="text-primary/70 font-medium">{currentTrack.genre}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          <audio ref={audioRef} src={currentTrack.audio_url} preload="none" />
        </div>
      )}
    </div>
  );
};
