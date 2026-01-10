/**
 * Page de musique partagée
 * Affiche un track partagé via lien
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Music, Play, Pause, ArrowLeft, Share2, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PremiumCard } from '@/components/ui/premium-card';
import { Badge } from '@/components/ui/badge';
import { ROUTE_PATHS } from '@/config/routes';
import { toast } from 'sonner';

interface SharedTrack {
  id: string;
  title: string;
  audio_url: string;
  image_url?: string;
  duration?: number;
  metadata?: {
    style?: string;
    rang?: string;
    itemCode?: string;
  };
  created_at: string;
}

const SharedMusicPage: React.FC = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const [track, setTrack] = useState<SharedTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadTrack = async () => {
      if (!trackId) {
        setError('ID de track manquant');
        setLoading(false);
        return;
      }

      try {
        const { data, error: dbError } = await supabase
          .from('generated_music_tracks')
          .select('id, title, audio_url, image_url, duration, metadata, created_at')
          .eq('id', trackId)
          .maybeSingle();

        if (dbError) throw dbError;
        
        if (!data || !data.audio_url) {
          setError('Musique introuvable ou non disponible');
        } else {
          setTrack(data as SharedTrack);
        }
      } catch (err) {
        console.error('Erreur chargement track partagé:', err);
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadTrack();
  }, [trackId]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

  const handlePlayPause = () => {
    if (!track?.audio_url) return;

    if (!audio) {
      const newAudio = new Audio(track.audio_url);
      newAudio.onended = () => setIsPlaying(false);
      newAudio.onerror = () => {
        toast.error('Erreur de lecture audio');
        setIsPlaying(false);
      };
      setAudio(newAudio);
      newAudio.play();
      setIsPlaying(true);
    } else if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleDownload = async () => {
    if (!track?.audio_url) return;

    try {
      const response = await fetch(track.audio_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${track.title || 'musique'}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Téléchargement lancé');
    } catch (err) {
      toast.error('Erreur de téléchargement');
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: track?.title || 'Musique MED MNG',
          text: `Écoutez "${track?.title}" - Créé avec MED MNG`,
          url: shareUrl
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Lien copié !');
        }
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Lien copié !');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <PremiumCard variant="glass" className="max-w-md w-full p-8 text-center">
          <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-xl font-bold mb-2">Musique introuvable</h1>
          <p className="text-muted-foreground mb-6">{error || 'Cette musique n\'existe pas ou a été supprimée.'}</p>
          <Link to={ROUTE_PATHS.generator}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au générateur
            </Button>
          </Link>
        </PremiumCard>
      </div>
    );
  }

  const metadata = track.metadata || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 flex items-center justify-center">
      <PremiumCard variant="gradient" className="max-w-lg w-full p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Link to={ROUTE_PATHS.generator}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1" />
          <Badge variant="secondary">Musique partagée</Badge>
        </div>

        {/* Cover image */}
        <div className="relative aspect-square max-w-xs mx-auto mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          {track.image_url ? (
            <img 
              src={track.image_url} 
              alt={track.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <Music className="h-20 w-20 text-primary/40" />
          )}
        </div>

        {/* Track info */}
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            {track.title || 'Musique générée'}
          </h1>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {metadata.style && (
              <Badge variant="outline">{metadata.style}</Badge>
            )}
            {metadata.rang && (
              <Badge variant="secondary">Rang {metadata.rang}</Badge>
            )}
            {track.duration && (
              <Badge variant="outline">
                {Math.floor(track.duration / 60)}:{String(Math.floor(track.duration % 60)).padStart(2, '0')}
              </Badge>
            )}
          </div>
        </div>

        {/* Play button */}
        <div className="flex justify-center mb-6">
          <Button
            size="lg"
            onClick={handlePlayPause}
            className="h-16 w-16 rounded-full"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </Button>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Partager
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Créé avec MED MNG
          </p>
          <Link to={ROUTE_PATHS.generator} className="text-xs text-primary hover:underline">
            Créer votre propre musique →
          </Link>
        </div>
      </PremiumCard>
    </div>
  );
};

export default SharedMusicPage;
