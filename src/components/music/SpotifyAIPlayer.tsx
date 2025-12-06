import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Music, Play, Pause, SkipForward, SkipBack, Volume2, Heart,
  Library, ListMusic, Clock, TrendingUp, Zap, AlertCircle
} from 'lucide-react';
import { useSpotifyAI } from '@/hooks/useSpotifyAI';
import { usePlaylists } from '@/hooks/usePlaylists';
import { toast } from 'sonner';

interface SpotifyAIPlayerProps {
  itemData: {
    item_code?: string;
    title: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
    paroles_musicales?: string[];
  };
  className?: string;
}

export const SpotifyAIPlayer: React.FC<SpotifyAIPlayerProps> = ({
  itemData,
  className
}) => {
  const [activeTab, setActiveTab] = useState('generate');
  const [currentGeneration, setCurrentGeneration] = useState<any>(null);
  const [generationStatus, setGenerationStatus] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedType, setSelectedType] = useState<'rang_a' | 'rang_b' | 'mix'>('rang_a');
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>('');

  const { 
    generateMusic, 
    pollGenerationStatus, 
    getUserGenerations,
    getStreamingUrl,
    trackListeningSession,
    loading 
  } = useSpotifyAI();
  
  const { playlists, loadPlaylists } = usePlaylists();

  useEffect(() => {
    loadPlaylists();
    loadUserGenerations();
  }, []);

  const loadUserGenerations = async () => {
    try {
      await getUserGenerations('30d');
    } catch (error) {
      console.error('❌ Erreur chargement générations:', error);
    }
  };

  const handleGenerate = async () => {
    if (!itemData.item_code || !itemData.paroles_musicales) {
      toast.error('Données manquantes pour la génération');
      return;
    }

    try {
      const result = await generateMusic({
        item_code: itemData.item_code,
        type: selectedType,
        paroles: itemData.paroles_musicales,
        style: 'educational, medical, upbeat',
        add_to_playlist_id: selectedPlaylist || undefined,
        priority: 'normal'
      });

      setCurrentGeneration(result);
      setActiveTab('status');

      // Feedback immédiat utilisateur
      toast.success(result.feedback.title, {
        description: result.feedback.message,
        duration: 5000
      });

      // Démarrer le polling du statut
      pollGenerationStatus(result.generation_id, (status) => {
        setGenerationStatus(status);
        
        if (status.status === 'completed') {
          toast.success('🎵 Votre musique est prête !', {
            description: 'Ajoutée automatiquement à votre bibliothèque',
            duration: 6000
          });
          loadUserGenerations();
        } else if (status.status === 'failed') {
          toast.error('❌ Erreur de génération', {
            description: 'Vos crédits ont été remboursés'
          });
        }
      });

    } catch (error) {
      console.error('❌ Erreur génération:', error);
      toast.error('Erreur de génération musicale');
    }
  };

  const handlePlay = async (songId?: string) => {
    if (!songId) return;

    try {
      const streamingUrl = await getStreamingUrl(songId);
      if (streamingUrl) {
        // Ici, intégrer avec un player audio
        setIsPlaying(true);
        
        // Tracker la session d'écoute
        await trackListeningSession(songId, {
          playback_source: 'library'
        });

        toast.success('🎧 Lecture démarrée');
      } else {
        toast.error('Impossible de lire cette chanson');
      }
    } catch (error) {
      console.error('❌ Erreur lecture:', error);
      toast.error('Erreur de lecture');
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      rang_a: 'Fondamentaux',
      rang_b: 'Expertise',
      mix: 'Formation Complète'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeCost = (type: string) => {
    const costs = { rang_a: 3, rang_b: 5, mix: 7 };
    return costs[type as keyof typeof costs] || 5;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Spotify-like */}
      <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white border-green-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Music className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Spotify IA Médical</CardTitle>
                <CardDescription className="text-green-100">
                  Génération musicale personnalisée pour {itemData.title}
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30">
              <Zap className="h-3 w-3 mr-1" />
              IA Suno
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Interface principale */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Générer
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Statut
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            Bibliothèque
          </TabsTrigger>
          <TabsTrigger value="playlists" className="flex items-center gap-2">
            <ListMusic className="h-4 w-4" />
            Playlists
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Nouvelle Génération Musicale
              </CardTitle>
              <CardDescription>
                Créez une chanson éducative personnalisée basée sur les compétences de l'item
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sélection du type */}
              <div className="space-y-3">
                <h4 className="font-semibold">Type de Formation</h4>
                <div className="grid md:grid-cols-3 gap-3">
                  {(['rang_a', 'rang_b', 'mix'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={selectedType === type ? 'default' : 'outline'}
                      onClick={() => setSelectedType(type)}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <span className="font-semibold">{getTypeLabel(type)}</span>
                      <Badge variant="secondary">{getTypeCost(type)} crédits</Badge>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sélection playlist */}
              {playlists.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Ajouter à une Playlist (optionnel)</h4>
                  <select 
                    value={selectedPlaylist} 
                    onChange={(e) => setSelectedPlaylist(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Aucune playlist</option>
                    {playlists.map((playlist) => (
                      <option key={playlist.id} value={playlist.id}>
                        {playlist.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Aperçu des paroles */}
              {itemData.paroles_musicales && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Aperçu des Paroles</h4>
                  <div className="bg-muted p-4 rounded-lg max-h-32 overflow-y-auto">
                    {itemData.paroles_musicales.slice(0, 4).map((ligne, idx) => (
                      <p key={idx} className="text-sm text-muted-foreground italic">
                        {ligne}
                      </p>
                    ))}
                    {itemData.paroles_musicales.length > 4 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        ... et {itemData.paroles_musicales.length - 4} lignes de plus
                      </p>
                    )}
                  </div>
                </div>
              )}

              <Button 
                onClick={handleGenerate} 
                disabled={loading || !itemData.paroles_musicales}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Music className="h-5 w-5 mr-2" />
                    Générer la Musique ({getTypeCost(selectedType)} crédits)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          {currentGeneration ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Statut de Génération
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {generationStatus && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Progression</span>
                      <Badge variant={generationStatus.status === 'completed' ? 'default' : 'secondary'}>
                        {generationStatus.feedback?.icon} {generationStatus.feedback?.title}
                      </Badge>
                    </div>
                    
                    <Progress value={generationStatus.progress} className="w-full" />
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Temps écoulé:</span>
                        <span className="ml-2 font-medium">
                          {Math.round(generationStatus.elapsed_time_ms / 1000)}s
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Temps restant:</span>
                        <span className="ml-2 font-medium">
                          {Math.round(generationStatus.estimated_remaining_ms / 1000)}s
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-blue-800 text-sm">
                        {generationStatus.feedback?.message}
                      </p>
                    </div>

                    {generationStatus.status === 'completed' && generationStatus.song_id && (
                      <Button 
                        onClick={() => handlePlay(generationStatus.song_id)}
                        className="w-full"
                        size="lg"
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Écouter Maintenant
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center p-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Aucune génération en cours. Créez votre première musique !
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Library className="h-5 w-5" />
                Ma Bibliothèque Musicale
              </CardTitle>
              <CardDescription>
                Toutes vos musiques générées - Streaming uniquement, aucun téléchargement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 text-muted-foreground">
                <Music className="h-12 w-12 mx-auto mb-4" />
                <p>Votre bibliothèque musicale apparaîtra ici après vos premières générations.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="playlists" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListMusic className="h-5 w-5" />
                Mes Playlists
              </CardTitle>
              <CardDescription>
                Organisez vos musiques par spécialité ou thème d'étude
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 text-muted-foreground">
                <ListMusic className="h-12 w-12 mx-auto mb-4" />
                <p>Créez vos premières playlists pour organiser vos musiques médicales.</p>
                <Button className="mt-4" variant="outline">
                  <ListMusic className="h-4 w-4 mr-2" />
                  Créer une Playlist
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer anti-download */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-800 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Streaming Seulement</span>
            <span>•</span>
            <span>Aucun téléchargement possible</span>
            <span>•</span>
            <span>Contenu protégé</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};