import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Repeat,
  Shuffle,
  Heart,
  Share2,
  Download,
  Mic,
  Headphones,
  Radio,
  Music,
  Sparkles,
  Zap,
  TrendingUp
} from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
  cover?: string;
  genre?: string;
  bpm?: number;
  educational?: boolean;
}

export const AdvancedMusicPlayer: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [isLiked, setIsLiked] = useState(false);
  const [visualMode, setVisualMode] = useState<'spectrum' | 'wave' | 'particle'>('spectrum');
  const [isVisualizerActive, setIsVisualizerActive] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const playlist: Track[] = [
    {
      id: '1',
      title: 'Cardiologie Rythmée',
      artist: 'Dr. MedMNG',
      duration: 245,
      url: '/audio/cardio-rhythm.mp3',
      genre: 'Médicale',
      bpm: 120,
      educational: true
    },
    {
      id: '2',
      title: 'Neurologie en Musique',
      artist: 'Prof. NeuroBeats',
      duration: 198,
      url: '/audio/neuro-beats.mp3',
      genre: 'Éducative',
      bpm: 110,
      educational: true
    },
    {
      id: '3',
      title: 'Anatomie Harmonique',
      artist: 'MedMusic Collective',
      duration: 267,
      url: '/audio/anatomy-harmony.mp3',
      genre: 'Relaxante',
      bpm: 95,
      educational: true
    }
  ];

  useEffect(() => {
    if (!currentTrack) {
      setCurrentTrack(playlist[0]);
    }
  }, []);

  // Visualizer animation
  useEffect(() => {
    if (!isVisualizerActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (!isPlaying) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Simple visualizer simulation
      const bars = 64;
      const barWidth = canvas.width / bars;
      
      for (let i = 0; i < bars; i++) {
        const height = Math.random() * canvas.height * (isPlaying ? 0.8 : 0.1);
        const hue = (i * 5 + currentTime) % 360;
        
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
        ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 2, height);
      }
      
      requestAnimationFrame(animate);
    };
    
    if (isPlaying) {
      animate();
    }
  }, [isPlaying, currentTime, isVisualizerActive]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const nextTrack = () => {
    if (!currentTrack) return;
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentTrack(playlist[nextIndex]);
    setCurrentTime(0);
  };

  const prevTrack = () => {
    if (!currentTrack) return;
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    setCurrentTrack(playlist[prevIndex]);
    setCurrentTime(0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  return (
    <div className="space-y-6">
      {/* Main Player */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardContent className="p-0">
            {/* Visualizer Canvas */}
            <div className="relative h-32 overflow-hidden">
              <canvas
                ref={canvasRef}
                width={800}
                height={128}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Track Info Overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{currentTrack.title}</h3>
                    <p className="text-gray-300 text-sm">{currentTrack.artist}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentTrack.educational && (
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Éducatif
                      </Badge>
                    )}
                    {currentTrack.bpm && (
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                        {currentTrack.bpm} BPM
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Section */}
            <div className="p-6 space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider
                  value={[currentTime]}
                  max={currentTrack.duration}
                  step={1}
                  className="w-full"
                  onValueChange={(value) => setCurrentTime(value[0])}
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(currentTrack.duration)}</span>
                </div>
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={() => setIsShuffled(!isShuffled)}
                  variant="ghost"
                  size="sm"
                  className={`text-white hover:bg-white/10 ${isShuffled ? 'text-purple-400' : ''}`}
                >
                  <Shuffle className="h-4 w-4" />
                </Button>

                <Button
                  onClick={prevTrack}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  <SkipBack className="h-5 w-5" />
                </Button>

                <Button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 border-none shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6 text-white" />
                  ) : (
                    <Play className="h-6 w-6 text-white ml-1" />
                  )}
                </Button>

                <Button
                  onClick={nextTrack}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  <SkipForward className="h-5 w-5" />
                </Button>

                <Button
                  onClick={() => setRepeatMode(
                    repeatMode === 'off' ? 'all' : 
                    repeatMode === 'all' ? 'one' : 'off'
                  )}
                  variant="ghost"
                  size="sm"
                  className={`text-white hover:bg-white/10 ${repeatMode !== 'off' ? 'text-purple-400' : ''}`}
                >
                  <Repeat className="h-4 w-4" />
                  {repeatMode === 'one' && (
                    <span className="text-xs ml-1">1</span>
                  )}
                </Button>
              </div>

              {/* Secondary Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setIsLiked(!isLiked)}
                    variant="ghost"
                    size="sm"
                    className={`text-white hover:bg-white/10 ${isLiked ? 'text-red-400' : ''}`}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={toggleMute}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="w-24">
                    <Slider
                      value={[volume]}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <audio
          ref={audioRef}
          src={currentTrack.url}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onEnded={nextTrack}
        />
      </motion.div>

      {/* Queue/Playlist */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardContent className="p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Music className="h-5 w-5 text-purple-400" />
            Playlist Médicale
          </h3>
          <div className="space-y-2">
            {playlist.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                  currentTrack.id === track.id 
                    ? 'bg-white/10 border border-purple-500/30' 
                    : 'hover:bg-white/5'
                }`}
                onClick={() => setCurrentTrack(track)}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  {currentTrack.id === track.id && isPlaying ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      <Radio className="h-5 w-5 text-white" />
                    </motion.div>
                  ) : (
                    <Music className="h-5 w-5 text-white" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{track.title}</p>
                  <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {track.educational && (
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      EDU
                    </Badge>
                  )}
                  <span className="text-gray-400 text-sm">
                    {formatTime(track.duration)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Music Insights */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardContent className="p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Insights Musical
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-white/5">
              <div className="text-2xl font-bold text-white mb-1">3.2k</div>
              <p className="text-gray-300 text-sm">Écoutes totales</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/5">
              <div className="text-2xl font-bold text-white mb-1">47min</div>
              <p className="text-gray-300 text-sm">Temps d'étude</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/5">
              <div className="text-2xl font-bold text-white mb-1">12</div>
              <p className="text-gray-300 text-sm">Items mémorisés</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};