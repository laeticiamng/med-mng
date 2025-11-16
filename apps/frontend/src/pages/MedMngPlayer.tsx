
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { withAuth } from '@/components/med-mng/withAuth';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Heart,
  ArrowLeft,
  Music,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

const MedMngPlayerComponent = () => {
  const { songId } = useParams<{ songId: string }>();
  const medMngApi = useMedMngApi();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Audio states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch song details
  const { data: library } = useQuery({
    queryKey: ['med-mng-library'],
    queryFn: () => medMngApi.getLibrary(1, 100),
  });

  // Fetch lyrics
  const { data: lyrics } = useQuery({
    queryKey: ['med-mng-lyrics', songId],
    queryFn: () => songId ? medMngApi.getLyrics(songId) : null,
    enabled: !!songId,
  });

  const song = library?.find(s => s.id === songId);
  const streamUrl = songId ? medMngApi.getSongStreamUrl(songId) : null;

  useEffect(() => {
    if (streamUrl && audioRef.current) {
      const audio = audioRef.current;
      audio.src = streamUrl;
      audio.volume = volume;

      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleEnded = () => {
        setIsPlaying(false);
      };

      const handleError = (e: any) => {
        console.error('Audio error:', e);
        toast.error('Erreur lors du chargement audio');
        setIsLoading(false);
      };

      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
      };
    }
  }, [streamUrl, volume]);

  const handlePlayPause = async () => {
    if (!audioRef.current || !streamUrl) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Play error:', error);
      toast.error('Erreur lors de la lecture');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      const time = value[0];
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const skipTime = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleToggleLike = async () => {
    if (!songId) return;
    try {
      const result = await medMngApi.toggleLike(songId);
      toast.success(result.liked ? 'Chanson aimée ❤️' : 'Like retiré');
    } catch (error) {
      toast.error('Erreur lors du like');
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!song) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Chanson introuvable</h1>
          <Button onClick={() => navigate('/med-mng/library')}>
            Retour à la bibliothèque
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <audio ref={audioRef} preload="metadata" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/med-mng/library')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la bibliothèque
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Album Art & Info */}
            <div>
              <Card className="mb-6">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                    <Music className="h-24 w-24 text-white/80" />
                  </div>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {song.title}
                    </h1>
                    <p className="text-gray-600 mb-4">
                      Créé le {new Date(song.created_at).toLocaleDateString('fr-FR')}
                    </p>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={handleToggleLike}
                        className={song.is_liked ? 'text-red-500 border-red-500' : ''}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${song.is_liked ? 'fill-current' : ''}`} />
                        {song.is_liked ? 'Aimé' : 'Aimer'}
                      </Button>
                      <Button variant="outline" disabled>
                        <Download className="h-4 w-4 mr-2" />
                        Streaming uniquement
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Player & Lyrics */}
            <div>
              {/* Player Controls */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Lecteur musical</h2>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <Slider
                      value={[currentTime]}
                      max={duration || 100}
                      step={1}
                      onValueChange={handleSeek}
                      className="w-full mb-2"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => skipTime(-10)}
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>

                    <Button
                      onClick={handlePlayPause}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : isPlaying ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6 ml-1" />
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => skipTime(10)}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                    >
                      {isMuted || volume === 0 ? 
                        <VolumeX className="h-4 w-4" /> : 
                        <Volume2 className="h-4 w-4" />
                      }
                    </Button>
                    <Slider
                      value={[volume * 100]}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 w-12">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Lyrics */}
              {lyrics && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Paroles</h2>
                    <div className="space-y-2 text-sm">
                      {lyrics.segments?.map((segment: any, index: number) => (
                        <div 
                          key={index}
                          className={`p-2 rounded ${
                            currentTime >= segment.start && currentTime <= segment.end
                              ? 'bg-blue-100 text-blue-900'
                              : 'text-gray-700'
                          }`}
                        >
                          {segment.text}
                        </div>
                      )) || (
                        <p className="text-gray-500">Paroles non disponibles</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MedMngPlayer = withAuth(MedMngPlayerComponent);
