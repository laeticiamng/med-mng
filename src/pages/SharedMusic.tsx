/**
 * 🎵 Page de musique partagée
 * Affiche une musique générée via un lien de partage public
 */

import { AudioWaveform } from '@/components/generator/AudioWaveform';
import { ShareMusicDialog } from '@/components/generator/ShareMusicDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PremiumBackground } from '@/components/ui/premium-background';
import { PremiumCard } from '@/components/ui/premium-card';
import { ROUTE_PATHS } from '@/config/routes';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Download, Loader2, Music, Pause, Play, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

interface SharedTrack {
  id: string;
  title: string;
  audio_url: string;
  music_style: string;
  rang: string;
  item_code: string;
  created_at: string;
  user_id: string;
}

const SharedMusic = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
  const [track, setTrack] = useState<SharedTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadTrack = async () => {
      if (!trackId) {
        setError('ID de piste manquant');
        setLoading(false);
        return;
      }

      try {
        // Essayer de trouver par music_id d'abord
        let { _data, _error: fetchError } = await supabase
          .from('user_generated_music')
          .select('*')
          .eq('music_id', trackId)
          .maybeSingle();

        // Si pas trouvé, essayer par id
        if (!_data && !fetchError) {
          const result = await supabase
            .from('user_generated_music')
            .select('*')
            .eq('id', trackId)
            .maybeSingle();
          _data = result._data;
          fetchError = result._error;
        }

        if (fetchError) throw fetchError;
        if (!_data) throw new Error('Musique introuvable');

        setTrack(_data);
        
        // Créer l'audio element
        const audio = new Audio(_data.audio_url);
        audio.addEventListener('loadedmetadata', () => {
          setDuration(audio.duration);
        });
        audio.addEventListener('timeupdate', () => {
          setCurrentTime(audio.currentTime);
        });
        audio.addEventListener('ended', () => {
          setIsPlaying(false);
          setCurrentTime(0);
        });
        setAudioRef(audio);

      } catch (err) {
        console.error('Erreur chargement track:', err);
        setError('Cette musique n\'existe pas ou a été supprimée');
      } finally {
        setLoading(false);
      }
    };

    loadTrack();

    return () => {
      if (audioRef) {
        audioRef.pause();
        audioRef.src = '';
      }
    };
  }, [trackId]);

  const togglePlay = () => {
    if (!audioRef) return;
    
    if (isPlaying) {
      audioRef.pause();
    } else {
      audioRef.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    if (!audioRef) return;
    audioRef.currentTime = time;
    setCurrentTime(time);
  };

  const handleDownload = async () => {
    if (!track) return;
    
    try {
      const response = await fetch(track.audio_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${track.title || 'music'}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Téléchargement démarré');
    } catch (err) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <PremiumBackground variant="amber">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement de la musique...</p>
          </div>
        </div>
      </PremiumBackground>
    );
  }

  if (error || !track) {
    return (
      <PremiumBackground variant="amber">
        <div className="min-h-screen flex items-center justify-center p-4">
          <PremiumCard variant="glass" className="max-w-md w-full p-8 text-center">
            <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Musique introuvable</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate(ROUTE_PATHS.home)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </PremiumCard>
        </div>
      </PremiumBackground>
    );
  }

  return (
    <PremiumBackground variant="amber">
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-card/70 backdrop-blur-xl border-b border-border shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(ROUTE_PATHS.home)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Accueil
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-warning to-warning/80 rounded-lg flex items-center justify-center">
                  <Music className="h-5 w-5 text-warning-foreground" />
                </div>
                <span className="font-semibold">Musique Partagée</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <PremiumCard variant="glass" className="p-8">
              {/* Track Info */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <Music className="h-12 w-12 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold mb-2">{track.title || 'Musique générée'}</h1>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <Badge variant="secondary">{track.music_style}</Badge>
                  <Badge variant="outline">Rang {track.rang}</Badge>
                  <Badge variant="outline">{track.item_code}</Badge>
                </div>
              </div>

              {/* Player */}
              <div className="space-y-4 mb-8">
                {/* Waveform */}
                <AudioWaveform
                  audioUrl={track.audio_url}
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  duration={duration}
                  onSeek={handleSeek}
                  color="warning"
                  className="h-16"
                />

                {/* Time display */}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>

                {/* Play button */}
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={togglePlay}
                    className="h-16 w-16 rounded-full"
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8" />
                    ) : (
                      <Play className="h-8 w-8 ml-1" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
                
                <ShareMusicDialog
                  trackTitle={track.title || 'Musique générée'}
                  trackId={trackId || track.id}
                  trigger={
                    <Button variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Partager
                    </Button>
                  }
                />
              </div>

              {/* CTA */}
              <div className="mt-8 pt-6 border-t border-border text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Créez vos propres musiques pédagogiques avec MED MNG
                </p>
                <Button onClick={() => navigate(ROUTE_PATHS.generator)}>
                  <Music className="h-4 w-4 mr-2" />
                  Créer ma musique
                </Button>
              </div>
            </PremiumCard>
          </div>
        </main>
      </div>
    </PremiumBackground>
  );
};

export default SharedMusic;
