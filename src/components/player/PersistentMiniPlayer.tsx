import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, 
  X, ChevronUp, ChevronDown, Music2, Repeat, Gauge 
} from 'lucide-react';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

export const PersistentMiniPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    pause,
    resume,
    stop,
    seek,
    changeVolume,
    audioElement,
  } = useGlobalAudio();

  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const [isExpanded, setIsExpanded] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  // Sync loop state with audio element
  useEffect(() => {
    if (audioElement) {
      audioElement.loop = isLooping;
    }
  }, [isLooping, audioElement]);

  // Sync playback rate
  useEffect(() => {
    if (audioElement) {
      audioElement.playbackRate = playbackRate;
    }
  }, [playbackRate, audioElement]);

  if (!currentTrack) return null;

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handlePlayPause = () => {
    if (isPlaying) pause();
    else resume();
  };

  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    seek(newTime);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    const newTime = (Math.max(0, Math.min(100, percent)) / 100) * duration;
    seek(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    changeVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (isMuted) {
      changeVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      changeVolume(0);
      setIsMuted(true);
    }
  };

  const cyclePlaybackRate = () => {
    const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % PLAYBACK_RATES.length;
    setPlaybackRate(PLAYBACK_RATES[nextIndex]);
  };

  const skipForward = () => seek(Math.min(duration, currentTime + 10));
  const skipBackward = () => seek(Math.max(0, currentTime - 10));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[60] border-t border-border/50",
          "bg-card/95 backdrop-blur-xl shadow-[0_-4px_30px_-10px_hsl(var(--primary)/0.15)]"
        )}
      >
        {/* Thin progress bar at very top — always visible, clickable */}
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="absolute top-0 left-0 right-0 h-1 bg-muted cursor-pointer group hover:h-1.5 transition-all"
        >
          <div
            className="h-full bg-primary transition-all duration-150 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
          </div>
        </div>

        {/* Compact player row */}
        <div className="container mx-auto px-3 md:px-6">
          <div className="flex items-center gap-3 h-16 md:h-[68px]">
            {/* Track info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Music2 className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-foreground truncate">
                  {currentTrack.title}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  Rang {currentTrack.rang}
                  {' · '}
                  <span className="tabular-nums">{formatTime(currentTime)}</span>
                  {' / '}
                  <span className="tabular-nums">{formatTime(duration)}</span>
                </p>
              </div>
            </div>

            {/* Central controls */}
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                onClick={skipBackward}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hidden sm:flex"
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                onClick={handlePlayPause}
                size="icon"
                className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </Button>

              <Button
                onClick={skipForward}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hidden sm:flex"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-1 md:gap-2 flex-1 justify-end">
              {/* Playback rate — desktop */}
              <Button
                onClick={cyclePlaybackRate}
                variant="ghost"
                size="sm"
                className="hidden md:flex h-7 px-2 text-xs font-mono text-muted-foreground hover:text-foreground"
                title="Vitesse de lecture"
              >
                {playbackRate}x
              </Button>

              {/* Loop */}
              <Button
                onClick={() => setIsLooping(!isLooping)}
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 hidden md:flex",
                  isLooping ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                title="Boucle"
              >
                <Repeat className="h-4 w-4" />
              </Button>

              {/* Volume — desktop */}
              <div className="hidden lg:flex items-center gap-1">
                <Button
                  onClick={toggleMute}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>

              {/* Expand toggle — mobile */}
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:hidden text-muted-foreground"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>

              {/* Close */}
              <Button
                onClick={stop}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile expanded controls */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden md:hidden"
              >
                <div className="pb-3 space-y-3">
                  {/* Progress slider */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
                      {formatTime(currentTime)}
                    </span>
                    <Slider
                      value={[progress]}
                      max={100}
                      step={0.1}
                      onValueChange={handleSeek}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground tabular-nums w-10">
                      {formatTime(duration)}
                    </span>
                  </div>

                  {/* Extra controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={skipBackward}
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                      >
                        <SkipBack className="h-4 w-4 mr-1" />
                        10s
                      </Button>
                      <Button
                        onClick={skipForward}
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                      >
                        10s
                        <SkipForward className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={cyclePlaybackRate}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs font-mono"
                      >
                        <Gauge className="h-3 w-3 mr-1" />
                        {playbackRate}x
                      </Button>
                      <Button
                        onClick={() => setIsLooping(!isLooping)}
                        variant={isLooping ? "default" : "outline"}
                        size="sm"
                        className="h-7 px-2"
                      >
                        <Repeat className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={toggleMute}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                      >
                        {isMuted || volume === 0 ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                      </Button>
                      <Slider
                        value={[isMuted ? 0 : volume * 100]}
                        max={100}
                        step={1}
                        onValueChange={handleVolumeChange}
                        className="w-16"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
