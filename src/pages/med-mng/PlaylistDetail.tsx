import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  Pause, 
  Heart, 
  Share2, 
  Download,
  Edit3,
  Trash2,
  Plus,
  ArrowLeft,
  Music,
  Clock,
  Users,
  Shuffle,
  MoreHorizontal,
  Save,
  X
} from 'lucide-react';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface PlaylistTrack {
  id: string;
  title: string;
  subject: string;
  style: string;
  duration: number;
  artist: string;
  playCount: number;
  isFavorite: boolean;
  addedAt: string;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  coverGradient: string;
  tracks: PlaylistTrack[];
  totalDuration: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  followers: number;
  plays: number;
}

const PlaylistDetail = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Mock playlist data
  useEffect(() => {
    const mockPlaylists: Playlist[] = [
      {
        id: '1',
        name: 'Cardiologie Intensive',
        description: 'Une collection complète pour maîtriser tous les aspects de la cardiologie moderne',
        coverGradient: 'from-red-500 to-pink-500',
        tracks: [
          {
            id: '1',
            title: 'Insuffisance Cardiaque Trap',
            subject: 'Cardiologie',
            style: 'Trap',
            duration: 245,
            artist: 'Dr. MED-MNG',
            playCount: 127,
            isFavorite: true,
            addedAt: '2024-01-15T10:30:00Z'
          },
          {
            id: '5',
            title: 'Arythmies Pop Clinique',
            subject: 'Cardiologie',
            style: 'Pop',
            duration: 198,
            artist: 'Prof. Rythme',
            playCount: 156,
            isFavorite: false,
            addedAt: '2024-01-14T15:45:00Z'
          },
          {
            id: '8',
            title: 'Infarctus Jazz Fusion',
            subject: 'Cardiologie',
            style: 'Jazz',
            duration: 287,
            artist: 'Dr. Coronaires',
            playCount: 98,
            isFavorite: true,
            addedAt: '2024-01-13T09:15:00Z'
          }
        ],
        totalDuration: 730,
        isPublic: true,
        createdAt: '2024-01-10T08:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        createdBy: 'Dr. Marie Dubois',
        followers: 45,
        plays: 892
      },
      {
        id: '2',
        name: 'Neurologie Focus',
        description: 'Explorez les mystères du système nerveux en musique',
        coverGradient: 'from-blue-500 to-cyan-500',
        tracks: [
          {
            id: '2',
            title: 'Neuroanatomie Lo-Fi',
            subject: 'Neurologie',
            style: 'Lo-Fi',
            duration: 312,
            artist: 'Prof. Neural',
            playCount: 89,
            isFavorite: false,
            addedAt: '2024-01-12T14:20:00Z'
          }
        ],
        totalDuration: 312,
        isPublic: false,
        createdAt: '2024-01-12T12:00:00Z',
        updatedAt: '2024-01-12T14:20:00Z',
        createdBy: 'Dr. Marie Dubois',
        followers: 12,
        plays: 234
      }
    ];

    const foundPlaylist = mockPlaylists.find(p => p.id === playlistId);
    if (foundPlaylist) {
      setPlaylist(foundPlaylist);
      setEditedName(foundPlaylist.name);
      setEditedDescription(foundPlaylist.description);
    }
  }, [playlistId]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handlePlayPause = (trackId?: string) => {
    if (trackId) {
      if (currentTrack === trackId && isPlaying) {
        setIsPlaying(false);
      } else {
        setCurrentTrack(trackId);
        setIsPlaying(true);
        
        const track = playlist?.tracks.find(t => t.id === trackId);
        if (track) {
          toast({
            title: "🎵 Lecture en cours",
            description: `${track.title} - ${track.subject}`,
          });
          
          // Rediriger vers le lecteur
          setTimeout(() => {
            navigate(`/med-mng/player/${trackId}`);
          }, 1000);
        }
      }
    } else {
      // Play/pause de la playlist entière
      if (isPlaying) {
        setIsPlaying(false);
      } else {
        if (playlist && playlist.tracks.length > 0) {
          const firstTrack = playlist.tracks[0];
          setCurrentTrack(firstTrack.id);
          setIsPlaying(true);
          
          toast({
            title: "🎵 Lecture de la playlist",
            description: `${playlist.name} - ${playlist.tracks.length} pistes`,
          });
        }
      }
    }
  };

  const handleSaveEdit = () => {
    if (playlist) {
      setPlaylist(prev => prev ? {
        ...prev,
        name: editedName,
        description: editedDescription,
        updatedAt: new Date().toISOString()
      } : null);
      
      setIsEditing(false);
      toast({
        title: "Playlist mise à jour",
        description: "Les modifications ont été sauvegardées.",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditedName(playlist?.name || '');
    setEditedDescription(playlist?.description || '');
    setIsEditing(false);
  };

  const handleDeletePlaylist = () => {
    if (playlist) {
      toast({
        title: "Playlist supprimée",
        description: `${playlist.name} a été supprimée de votre collection.`,
      });
      navigate('/med-mng/playlists');
    }
  };

  const handleRemoveTrack = (trackId: string) => {
    if (playlist) {
      const track = playlist.tracks.find(t => t.id === trackId);
      setPlaylist(prev => prev ? {
        ...prev,
        tracks: prev.tracks.filter(t => t.id !== trackId),
        totalDuration: prev.totalDuration - (track?.duration || 0)
      } : null);
      
      toast({
        title: "Piste supprimée",
        description: "La piste a été retirée de la playlist.",
      });
    }
  };

  const handleShare = () => {
    if (playlist) {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Lien copié !",
        description: "Le lien de cette playlist a été copié dans le presse-papier.",
      });
    }
  };

  if (!playlist) {
    return (
      <MedMngLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">Playlist non trouvée</h2>
            <p className="text-gray-500 mb-6">Cette playlist n'existe pas ou a été supprimée.</p>
            <Button onClick={() => navigate('/med-mng/playlists')}>
              Retour aux playlists
            </Button>
          </div>
        </div>
      </MedMngLayout>
    );
  }

  return (
    <MedMngLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        
        {/* Header avec navigation */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/med-mng/playlists')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Mes Playlists
              </Button>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleDeletePlaylist}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Header de la playlist */}
            <Card className="mb-8 overflow-hidden shadow-2xl bg-white/90 backdrop-blur-sm border-0">
              <div className="grid md:grid-cols-5 gap-0">
                
                {/* Cover de la playlist */}
                <div className="md:col-span-2">
                  <div className={`w-full aspect-square bg-gradient-to-br ${playlist.coverGradient} flex items-center justify-center text-white relative`}>
                    <Music className="h-24 w-24 opacity-80" />
                    
                    {/* Overlay de lecture */}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <Button
                        size="lg"
                        onClick={() => handlePlayPause()}
                        className="opacity-0 hover:opacity-100 transition-all duration-300 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white rounded-full w-20 h-20"
                      >
                        {isPlaying ? (
                          <Pause className="h-10 w-10" />
                        ) : (
                          <Play className="h-10 w-10 ml-1" />
                        )}
                      </Button>
                    </div>

                    {/* Badge public/privé */}
                    <Badge className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm text-white border-white/20">
                      {playlist.isPublic ? 'Public' : 'Privé'}
                    </Badge>
                  </div>
                </div>

                {/* Informations de la playlist */}
                <div className="md:col-span-3 p-8 flex flex-col justify-between">
                  
                  {/* Titre et description */}
                  <div className="space-y-4 mb-6">
                    {isEditing ? (
                      <div className="space-y-3">
                        <Input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="text-xl font-bold"
                          placeholder="Nom de la playlist"
                        />
                        <Textarea
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          placeholder="Description de la playlist"
                          className="resize-none"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>
                            <Save className="h-4 w-4 mr-2" />
                            Sauvegarder
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                            <X className="h-4 w-4 mr-2" />
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{playlist.name}</h1>
                        <p className="text-gray-600 leading-relaxed">{playlist.description}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Music className="h-4 w-4" />
                        {playlist.tracks.length} pistes
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTotalDuration(playlist.totalDuration)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {playlist.followers} abonnés
                      </div>
                    </div>
                  </div>

                  {/* Contrôles */}
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={() => handlePlayPause()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                      {isPlaying ? 'Pause' : 'Lire tout'}
                    </Button>
                    
                    <Button variant="outline">
                      <Shuffle className="h-4 w-4 mr-2" />
                      Aléatoire
                    </Button>
                    
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter des pistes
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Liste des pistes */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Pistes ({playlist.tracks.length})</span>
                  {playlist.tracks.length > 0 && (
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {playlist.tracks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                      <Music className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Playlist vide</h3>
                    <p className="text-gray-600 mb-6">
                      Ajoutez des musiques à cette playlist pour commencer l'apprentissage !
                    </p>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter des pistes
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {playlist.tracks.map((track, index) => (
                      <div 
                        key={track.id} 
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-8 text-center text-sm text-gray-500">
                          {currentTrack === track.id && isPlaying ? (
                            <div className="flex items-center justify-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                            </div>
                          ) : (
                            <span className="group-hover:hidden">{index + 1}</span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePlayPause(track.id)}
                            className="hidden group-hover:flex w-8 h-8 p-0"
                          >
                            {currentTrack === track.id && isPlaying ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-800 truncate">
                                {track.title}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {track.artist} • {track.subject}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {track.style}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {formatDuration(track.duration)}
                              </span>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => navigate(`/med-mng/player/${track.id}`)}>
                                    <Play className="h-4 w-4 mr-2" />
                                    Lire
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Heart className="h-4 w-4 mr-2" />
                                    {track.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleRemoveTrack(track.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Retirer de la playlist
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MedMngLayout>
  );
};

export default PlaylistDetail;