/**
 * 🎵 Page de découverte des musiques partagées
 * Liste toutes les musiques publiques de la communauté
 */

import { SEOHead } from '@/components/seo/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROUTE_PATHS } from '@/config/routes';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Filter, Loader2, Music, Pause, Play, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PublicTrack {
  id: string;
  music_id: string;
  title: string;
  music_style: string;
  rang: string;
  item_code: string;
  created_at: string;
  audio_url: string;
}

const SharedMusicIndex = () => {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<PublicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStyle, setFilterStyle] = useState<string>('all');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadPublicTracks();
  }, []);

  const loadPublicTracks = async () => {
    try {
      const { data, error } = await supabase
        .from('user_generated_music')
        .select('id, music_id, title, music_style, rang, item_code, created_at, audio_url')
        .not('audio_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTracks(data || []);
    } catch (err) {
      console.error('Erreur chargement musiques:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = (track: PublicTrack) => {
    if (currentlyPlaying === track.id) {
      audioRef?.pause();
      setCurrentlyPlaying(null);
    } else {
      if (audioRef) {
        audioRef.pause();
      }
      const audio = new Audio(track.audio_url);
      audio.play().catch(console.error);
      audio.addEventListener('ended', () => setCurrentlyPlaying(null));
      setAudioRef(audio);
      setCurrentlyPlaying(track.id);
    }
  };

  const openTrack = (track: PublicTrack) => {
    navigate(`/shared-music/${track.music_id || track.id}`);
  };

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.item_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStyle = filterStyle === 'all' || track.music_style === filterStyle;
    return matchesSearch && matchesStyle;
  });

  const musicStyles = [...new Set(tracks.map(t => t.music_style).filter(Boolean))];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <>
      <SEOHead
        title="Musiques de la Communauté | MED-MNG"
        description="Découvrez et écoutez les musiques pédagogiques créées par la communauté MED-MNG"
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-muted/50">
        {/* Header */}
        <div className="bg-card/70 backdrop-blur-xl border-b border-border shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-warning to-warning/80 rounded-xl flex items-center justify-center shadow-lg">
                <Music className="h-6 w-6 text-warning-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Musiques de la Communauté</h1>
                <p className="text-muted-foreground">Découvrez les créations des autres étudiants</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par titre ou item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStyle} onValueChange={setFilterStyle}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les styles</SelectItem>
                  {musicStyles.map(style => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTracks.length === 0 ? (
            <Card className="max-w-md mx-auto text-center p-8">
              <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Aucune musique trouvée</h2>
              <p className="text-muted-foreground mb-4">
                Soyez le premier à créer et partager une musique pédagogique !
              </p>
              <Button onClick={() => navigate(ROUTE_PATHS.generator)}>
                Créer ma musique
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTracks.map(track => (
                <Card key={track.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                          currentlyPlaying === track.id 
                            ? 'bg-primary animate-pulse' 
                            : 'bg-primary/10 group-hover:bg-primary/20'
                        }`}>
                          <Music className={`h-6 w-6 ${currentlyPlaying === track.id ? 'text-primary-foreground' : 'text-primary'}`} />
                        </div>
                        <div>
                          <CardTitle className="text-base line-clamp-1">{track.title || 'Musique générée'}</CardTitle>
                          <CardDescription>{track.item_code}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary">{track.music_style}</Badge>
                      <Badge variant="outline">Rang {track.rang}</Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatDate(track.created_at)}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => { e.stopPropagation(); togglePlay(track); }}
                      >
                        {currentlyPlaying === track.id ? (
                          <><Pause className="h-4 w-4 mr-1" /> Pause</>
                        ) : (
                          <><Play className="h-4 w-4 mr-1" /> Écouter</>
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => openTrack(track)}
                      >
                        Ouvrir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Vous aussi, créez vos propres musiques pédagogiques !
            </p>
            <Button size="lg" onClick={() => navigate(ROUTE_PATHS.generator)}>
              <Music className="h-5 w-5 mr-2" />
              Créer ma musique
            </Button>
          </div>
        </main>
      </div>
    </>
  );
};

export default SharedMusicIndex;
