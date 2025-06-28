
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Music, Play, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TranslatedText } from '@/components/TranslatedText';

interface SavedMusic {
  id: string;
  title: string;
  audio_url: string;
  music_style: string;
  rang: string;
  item_code: string;
  created_at: string;
}

const EdnMusicLibrary = () => {
  const [savedMusics, setSavedMusics] = useState<SavedMusic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSavedMusics();
  }, []);

  const fetchSavedMusics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_generated_music')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement:', error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger votre bibliothèque musicale.",
          variant: "destructive"
        });
        return;
      }

      setSavedMusics(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (music: SavedMusic) => {
    if (currentAudio) {
      currentAudio.pause();
    }

    if (playingId === music.id) {
      setPlayingId(null);
      setCurrentAudio(null);
      return;
    }

    const audio = new Audio(music.audio_url);
    audio.play();
    
    audio.addEventListener('ended', () => {
      setPlayingId(null);
      setCurrentAudio(null);
    });

    setCurrentAudio(audio);
    setPlayingId(music.id);
  };

  const handleDelete = async (musicId: string) => {
    try {
      const { error } = await supabase
        .from('user_generated_music')
        .delete()
        .eq('id', musicId);

      if (error) {
        toast({
          title: "Erreur de suppression",
          description: "Impossible de supprimer cette musique.",
          variant: "destructive"
        });
        return;
      }

      setSavedMusics(prev => prev.filter(m => m.id !== musicId));
      toast({
        title: "Musique supprimée",
        description: "La musique a été retirée de votre bibliothèque.",
      });
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const filteredMusics = savedMusics.filter(music =>
    music.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    music.item_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            <TranslatedText text="Chargement de votre bibliothèque musicale..." />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/edn" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <TranslatedText text="Retour aux items EDN" />
          </Link>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-amber-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              <TranslatedText text="Ma Bibliothèque Musicale" />
            </h1>
            <p className="text-lg text-gray-600">
              <TranslatedText text={`${filteredMusics.length} musique${filteredMusics.length > 1 ? 's' : ''} sauvegardée${filteredMusics.length > 1 ? 's' : ''}`} />
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une musique..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Music Grid */}
        {filteredMusics.length === 0 ? (
          <div className="text-center py-16">
            <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              <TranslatedText text={searchTerm ? 'Aucun résultat' : 'Bibliothèque vide'} />
            </h3>
            <p className="text-gray-600 mb-6">
              <TranslatedText text={searchTerm 
                ? 'Aucune musique ne correspond à votre recherche' 
                : 'Générez vos premières musiques depuis les items EDN pour les voir apparaître ici'} />
            </p>
            {!searchTerm && (
              <Link to="/edn">
                <Button className="bg-amber-600 hover:bg-amber-700">
                  <TranslatedText text="Explorer les items EDN" />
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMusics.map((music) => (
              <Card key={music.id} className="group hover:shadow-lg transition-all duration-200">
                <CardContent className="p-0">
                  {/* Cover */}
                  <div className="relative aspect-square bg-gradient-to-br from-amber-500 to-orange-500 rounded-t-lg flex items-center justify-center">
                    <Music className="h-12 w-12 text-white/80" />
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/20 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <Button
                        onClick={() => handlePlay(music)}
                        size="lg"
                        className="rounded-full bg-white text-amber-600 hover:bg-white/90 shadow-lg"
                      >
                        <Play className={`h-6 w-6 ${playingId === music.id ? 'animate-pulse' : 'ml-1'}`} />
                      </Button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">
                          {music.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {music.item_code} - Rang {music.rang}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Style: {music.music_style}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(music.id)}
                        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {new Date(music.created_at).toLocaleDateString('fr-FR')}
                      </span>
                      <Button
                        onClick={() => handlePlay(music)}
                        size="sm"
                        variant={playingId === music.id ? "default" : "outline"}
                        className="text-xs"
                      >
                        {playingId === music.id ? 'En cours...' : 'Écouter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EdnMusicLibrary;
