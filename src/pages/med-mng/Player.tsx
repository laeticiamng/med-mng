import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Heart, 
  Share2, 
  Download,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  ArrowLeft,
  Music,
  Clock,
  Brain,
  BookOpen,
  User,
  Tag,
  TrendingUp,
  Eye,
  ThumbsUp,
  MessageCircle
} from 'lucide-react';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { useToast } from '@/hooks/use-toast';

interface Track {
  id: string;
  title: string;
  subject: string;
  style: string;
  duration: number;
  artist: string;
  description: string;
  lyrics: string;
  tags: string[];
  difficulty: string;
  playCount: number;
  isFavorite: boolean;
  audioUrl?: string;
  imageUrl?: string;
  createdAt: string;
}

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isRepeating: boolean;
  isShuffling: boolean;
}

const Player = () => {
  const { trackId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [track, setTrack] = useState<Track | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 80,
    isMuted: false,
    isRepeating: false,
    isShuffling: false
  });

  // Mock track data
  useEffect(() => {
    const mockTracks: Track[] = [
      {
        id: '1',
        title: 'Insuffisance Cardiaque Trap',
        subject: 'Cardiologie',
        style: 'Trap',
        duration: 245,
        artist: 'Dr. MED-MNG',
        description: 'Une exploration musicale approfondie de l\'insuffisance cardiaque, couvrant la physiopathologie, les symptômes, le diagnostic et les stratégies thérapeutiques modernes.',
        lyrics: 'Le cœur qui faiblit, pompe qui défaille\nInsuffisance cardiaque, un combat sans faille\nFraction d\'éjection diminuée\nLe débit cardiaque perturbé\n\n[Refrain]\nIC systolique ou diastolique\nClassification New York\nStade I à IV chronique\nPronostic qu\'on explore\n\nIEC, ARA2, bêta-bloquants\nDigoxine pour les symptômes\nDiurétiques décongestionnants\nPour soulager les syndromes',
        tags: ['cardiologie', 'insuffisance', 'physiopathologie', 'traitement'],
        difficulty: 'Intermédiaire',
        playCount: 127,
        isFavorite: true,
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        title: 'Neuroanatomie Lo-Fi',
        subject: 'Neurologie',
        style: 'Lo-Fi',
        duration: 312,
        artist: 'Prof. Neural',
        description: 'Un voyage relaxant à travers les structures du système nerveux central et périphérique.',
        lyrics: 'Cerveau et moelle épinière\nSystème nerveux central, structure légendaire\nNeurones et synapses\nTransmission qui ne s\'effondre jamais\n\n[Refrain]\nCortex frontal, pariétal\nTemporal et occipital\nFaisceaux descendants\nMotricité en mouvement',
        tags: ['neurologie', 'anatomie', 'système nerveux'],
        difficulty: 'Avancé',
        playCount: 89,
        isFavorite: false,
        createdAt: '2024-01-14T15:45:00Z'
      }
    ];

    const foundTrack = mockTracks.find(t => t.id === trackId);
    if (foundTrack) {
      setTrack(foundTrack);
      setPlayerState(prev => ({ ...prev, duration: foundTrack.duration }));
    }
  }, [trackId]);

  // Simulate playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (playerState.isPlaying && track) {
      interval = setInterval(() => {
        setPlayerState(prev => ({
          ...prev,
          currentTime: Math.min(prev.currentTime + 1, prev.duration)
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [playerState.isPlaying, track]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    
    if (!playerState.isPlaying && track) {
      toast({
        title: "🎵 Lecture en cours",
        description: `${track.title} - ${track.subject}`,
      });
    }
  };

  const handleSeek = (value: number[]) => {
    setPlayerState(prev => ({ ...prev, currentTime: value[0] }));
  };

  const handleVolumeChange = (value: number[]) => {
    setPlayerState(prev => ({ 
      ...prev, 
      volume: value[0],
      isMuted: value[0] === 0
    }));
  };

  const toggleMute = () => {
    setPlayerState(prev => ({ 
      ...prev, 
      isMuted: !prev.isMuted,
      volume: prev.isMuted ? 80 : 0
    }));
  };

  const toggleFavorite = () => {
    if (track) {
      setTrack(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
      toast({
        title: track.isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
        description: track.title,
      });
    }
  };

  const handleShare = () => {
    if (track) {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Lien copié !",
        description: "Le lien de cette musique a été copié dans le presse-papier.",
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'débutant': return 'bg-green-100 text-green-800';
      case 'intermédiaire': return 'bg-blue-100 text-blue-800';
      case 'avancé': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStyleGradient = (style: string) => {
    switch (style.toLowerCase()) {
      case 'trap': return 'from-purple-500 to-pink-500';
      case 'lo-fi': return 'from-blue-400 to-cyan-400';
      case 'pop': return 'from-pink-400 to-rose-400';
      case 'jazz': return 'from-amber-500 to-orange-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  if (!track) {
    return (
      <MedMngLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">Musique non trouvée</h2>
            <p className="text-gray-500 mb-6">Cette musique n'existe pas ou a été supprimée.</p>
            <Button onClick={() => navigate('/med-mng/library')}>
              Retour à la bibliothèque
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
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Lecteur principal */}
            <Card className="mb-8 overflow-hidden shadow-2xl bg-white/90 backdrop-blur-sm border-0">
              <div className="grid md:grid-cols-2 gap-0">
                
                {/* Image / Visualisation */}
                <div className="relative aspect-square">
                  <div className={`w-full h-full bg-gradient-to-br ${getStyleGradient(track.style)} flex items-center justify-center text-white relative`}>
                    <Music className="h-24 w-24 opacity-80" />
                    
                    {/* Overlay de lecture */}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Button
                        size="lg"
                        onClick={handlePlayPause}
                        className="bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white rounded-full w-20 h-20"
                      >
                        {playerState.isPlaying ? (
                          <Pause className="h-10 w-10" />
                        ) : (
                          <Play className="h-10 w-10 ml-1" />
                        )}
                      </Button>
                    </div>

                    {/* Stats overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex justify-between items-center text-white text-sm">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          {track.playCount}
                        </div>
                        <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/20">
                          {track.style}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations et contrôles */}
                <div className="p-8 flex flex-col justify-between">
                  
                  {/* Informations du track */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-800 mb-2">{track.title}</h1>
                      <p className="text-gray-600">{track.artist}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{track.subject}</Badge>
                      <Badge className={getDifficultyColor(track.difficulty)}>
                        {track.difficulty}
                      </Badge>
                      {track.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed">
                      {track.description}
                    </p>
                  </div>

                  {/* Contrôles de lecture */}
                  <div className="space-y-4">
                    
                    {/* Barre de progression */}
                    <div className="space-y-2">
                      <Slider
                        value={[playerState.currentTime]}
                        max={playerState.duration}
                        step={1}
                        onValueChange={handleSeek}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{formatTime(playerState.currentTime)}</span>
                        <span>{formatTime(playerState.duration)}</span>
                      </div>
                    </div>

                    {/* Contrôles principaux */}
                    <div className="flex items-center justify-center gap-4">
                      <Button variant="ghost" size="sm">
                        <SkipBack className="h-5 w-5" />
                      </Button>
                      
                      <Button 
                        onClick={handlePlayPause}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full w-12 h-12"
                      >
                        {playerState.isPlaying ? (
                          <Pause className="h-6 w-6" />
                        ) : (
                          <Play className="h-6 w-6 ml-1" />
                        )}
                      </Button>
                      
                      <Button variant="ghost" size="sm">
                        <SkipForward className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Contrôles secondaires */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={toggleFavorite}
                          className={track.isFavorite ? 'text-red-500' : ''}
                        >
                          <Heart className={`h-4 w-4 ${track.isFavorite ? 'fill-current' : ''}`} />
                        </Button>
                        
                        <Button variant="ghost" size="sm" onClick={handleShare}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Contrôle volume */}
                      <div className="flex items-center gap-2 w-32">
                        <Button variant="ghost" size="sm" onClick={toggleMute}>
                          {playerState.isMuted || playerState.volume === 0 ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Slider
                          value={[playerState.volume]}
                          max={100}
                          step={1}
                          onValueChange={handleVolumeChange}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Paroles et informations détaillées */}
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Paroles */}
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Paroles Pédagogiques
                </h3>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-medium leading-relaxed">
                    {track.lyrics}
                  </pre>
                </div>
              </Card>

              {/* Informations détaillées */}
              <div className="space-y-6">
                
                {/* Stats d'apprentissage */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    Impact Pédagogique
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taux de rétention</span>
                      <Badge className="bg-green-100 text-green-800">89%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Difficulté perçue</span>
                      <Badge className={getDifficultyColor(track.difficulty)}>
                        {track.difficulty}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Temps d'apprentissage moyen</span>
                      <span className="text-sm font-medium">24 min</span>
                    </div>
                  </div>
                </Card>

                {/* Interactions communautaires */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Communauté
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm">J'aime</span>
                      </div>
                      <span className="text-sm font-medium">234</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Commentaires</span>
                      </div>
                      <span className="text-sm font-medium">18</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">Écoutes</span>
                      </div>
                      <span className="text-sm font-medium">{track.playCount}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MedMngLayout>
  );
};

export default Player;