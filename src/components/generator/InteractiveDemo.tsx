import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  Heart, 
  Music, 
  Headphones, 
  Clock 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DemoTrack {
  id: string;
  title: string;
  emoji: string;
  subject: string;
  plays: string;
  duration: string;
  gradient: string;
}

interface InteractiveDemoProps {
  tracks?: DemoTrack[];
  onTrackSelect?: (trackId: string) => void;
}

export const InteractiveDemo: React.FC<InteractiveDemoProps> = ({ 
  tracks,
  onTrackSelect 
}) => {
  const { toast } = useToast();
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const defaultTracks: DemoTrack[] = [
    { 
      id: '1',
      title: "IC-103 Vertige", 
      emoji: "🧠", 
      subject: "Neurologie",
      plays: "2.3K", 
      duration: "4:23",
      gradient: "from-purple-600 to-pink-600" 
    },
    { 
      id: '2',
      title: "IC-230 Cardiologie", 
      emoji: "❤️", 
      subject: "Cardiovasculaire",
      plays: "1.8K", 
      duration: "3:45",
      gradient: "from-red-500 to-pink-500" 
    },
    { 
      id: '3',
      title: "IC-156 Pneumologie", 
      emoji: "🫁", 
      subject: "Respiratoire",
      plays: "1.5K", 
      duration: "4:12",
      gradient: "from-blue-500 to-cyan-500" 
    },
    { 
      id: '4',
      title: "IC-089 Neurologie", 
      emoji: "🧠", 
      subject: "Santé mentale",
      plays: "2.1K", 
      duration: "3:58",
      gradient: "from-indigo-500 to-purple-500" 
    }
  ];

  const displayTracks = tracks || defaultTracks;

  const handlePlay = (trackId: string, trackTitle: string) => {
    if (playingTrack === trackId) {
      setPlayingTrack(null);
      toast({
        title: "⏸️ Lecture pausée",
        description: `${trackTitle} - Lecture interrompue`,
      });
    } else {
      setPlayingTrack(trackId);
      toast({
        title: "🎵 Lecture en cours",
        description: `${trackTitle} - Génération musicale MNG`,
      });
      
      // Simulation d'arrêt automatique après 30 secondes
      setTimeout(() => {
        setPlayingTrack(null);
      }, 30000);
    }
    
    if (onTrackSelect) {
      onTrackSelect(trackId);
    }
  };

  const toggleFavorite = (trackId: string, trackTitle: string) => {
    const newFavorites = new Set(favorites);
    
    if (favorites.has(trackId)) {
      newFavorites.delete(trackId);
      toast({
        title: "💔 Retiré des favoris",
        description: `${trackTitle} n'est plus dans vos favoris`,
      });
    } else {
      newFavorites.add(trackId);
      toast({
        title: "❤️ Ajouté aux favoris",
        description: `${trackTitle} ajouté à vos favoris`,
      });
    }
    
    setFavorites(newFavorites);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
      {displayTracks.map((track) => (
        <Card 
          key={track.id}
          className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/10 backdrop-blur-sm border border-white/20"
        >
          <CardContent className="p-3 sm:p-4">
            {/* Artwork avec contrôles */}
            <div className="relative aspect-square mb-3 rounded-lg overflow-hidden">
              <div className={`w-full h-full bg-gradient-to-br ${track.gradient} flex items-center justify-center text-3xl sm:text-4xl relative`}>
                {track.emoji}
                
                {/* Overlay de lecture */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlay(track.id, track.title);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white rounded-full w-12 h-12"
                  >
                    {playingTrack === track.id ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </Button>
                </div>

                {/* Badge de lecture */}
                {playingTrack === track.id && (
                  <Badge className="absolute top-2 left-2 bg-green-500/20 backdrop-blur-sm text-green-300 border-green-400/30 text-xs animate-pulse">
                    <Volume2 className="h-3 w-3 mr-1" />
                    En cours
                  </Badge>
                )}

                {/* Bouton favori */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(track.id, track.title);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white rounded-full w-7 h-7"
                >
                  <Heart className={`h-3 w-3 ${favorites.has(track.id) ? 'fill-current text-red-400' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Informations */}
            <div className="space-y-1">
              <h3 className="font-medium text-white text-xs sm:text-sm line-clamp-2 group-hover:text-pink-300 transition-colors">
                {track.title}
              </h3>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                  {track.subject}
                </Badge>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {track.duration}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center">
                  <Headphones className="h-3 w-3 mr-1" />
                  <span>{track.plays}</span>
                </div>
                {favorites.has(track.id) && (
                  <Heart className="h-3 w-3 fill-current text-red-400" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};