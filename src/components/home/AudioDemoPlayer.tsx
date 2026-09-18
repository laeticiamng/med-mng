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

        if (!error && data?.length) {
          const demoTracks: DemoTrack[] = data.map((track, i) => ({
            id: track.id,
            title: `Extrait démo ${i + 1}`,
            genre: track.genre || 'Médical',
            audio_url: track.audio_url!,
            duration: track.duration || 180,
          }));
          setTracks(demoTracks);
          setCurrentTrack(demoTracks[0]);
        } else {
          // Pas de repli fabriqué. Les trois « extraits » codés en dur ici
          // (Épilepsie 0:30, Asthme 0:38, HTA 0:42) n'existaient pas : la table
          // `edn_suno_tracks` est vide (0 ligne), `generated_music_tracks` aussi,
          // et le fichier audio-demos/demo-epilepsie-preview.mp3 renvoie 404.
          // On n'annonce donc aucun extrait tant qu'aucune piste n'est en base.
          setTracks([]);
          setCurrentTrack(null);
        }
      } catch {
        setTracks([]);
        setCurrentTrack(null);
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

  const hasAudio = !!currentTrack?.audio_url;
  const isFallback = !tracks.some(t => t.audio_url && t.audio_url.length > 0);

  const togglePlay = async () => {
    if (!hasAudio) return; // No audio for this specific track
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

  if (isLoading) return null;

  // Aucun extrait en base : on le dit, plutôt que d'afficher un faux catalogue.
  if (tracks.length === 0 || isFallback) {
    return (
      <div className="mt-8 space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Music className="h-4 w-4 text-primary" />
          <span className="font-medium"><TranslatedText text="Aucun extrait audio en ligne pour l'instant" /></span>
        </div>
        <p className="text-xs text-muted-foreground">
          <TranslatedText text="Les 367 items EDN sont disponibles avec leurs compétences officielles. Les chansons sont générées à la demande depuis votre compte : aucune piste pré-enregistrée n'est encore publiée." />
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Volume2 className="h-4 w-4 text-primary" />
        <span className="font-medium"><TranslatedText text="🎧 Écoute un extrait" /></span>
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
            whileHover={hasAudio ? { scale: 1.1 } : {}}
            whileTap={hasAudio ? { scale: 0.9 } : {}}
            onClick={togglePlay}
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
              hasAudio 
                ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-primary/30 cursor-pointer' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
            title={hasAudio ? undefined : 'Inscrivez-vous pour écouter'}
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
