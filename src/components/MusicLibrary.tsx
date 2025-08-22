import React, { useState } from 'react';
import { Music, Play, Pause, Heart, Download, Clock, Search } from 'lucide-react';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';

interface GeneratedTrack {
  id: string;
  title: string;
  audioUrl: string;
  style: string;
  duration: number;
  createdAt: string;
  itemCode: string;
  imageUrl?: string;
  plays: number;
  likes: number;
  isLiked: boolean;
}

// Données simulées inspirées de l'interface Suno
const mockTracks: GeneratedTrack[] = [
  {
    id: '1',
    title: 'IC-103 Vertige - Indie Pop',
    audioUrl: 'https://example.com/audio1.mp3',
    style: 'indie-pop',
    duration: 240,
    createdAt: '2024-01-15',
    itemCode: 'IC-103',
    plays: 2340,
    likes: 156,
    isLiked: true
  },
  {
    id: '2', 
    title: 'IC-230 Cardiologie - Jazz',
    audioUrl: 'https://example.com/audio2.mp3',
    style: 'jazz',
    duration: 195,
    createdAt: '2024-01-14',
    itemCode: 'IC-230',
    plays: 1890,
    likes: 134,
    isLiked: false
  },
  {
    id: '3',
    title: 'IC-156 Pneumologie - Classical',
    audioUrl: 'https://example.com/audio3.mp3', 
    style: 'classical',
    duration: 220,
    createdAt: '2024-01-13',
    itemCode: 'IC-156',
    plays: 1560,
    likes: 98,
    isLiked: true
  },
  {
    id: '4',
    title: 'IC-089 Neurologie - Electronic',
    audioUrl: 'https://example.com/audio4.mp3',
    style: 'electronic',
    duration: 210,
    createdAt: '2024-01-12',
    itemCode: 'IC-089',
    plays: 2100,
    likes: 187,
    isLiked: false
  }
];

export const MusicLibrary: React.FC = () => {
  const { currentTrack, isPlaying, play, pause } = useGlobalAudio();
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState(mockTracks);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const handlePlayPause = (track: GeneratedTrack) => {
    if (currentTrack?.url === track.audioUrl) {
      if (isPlaying) {
        pause();
      } else {
        // Resume would go here, but for now just play again
        play({
          url: track.audioUrl,
          title: track.title,
          rang: 'A'
        });
      }
    } else {
      play({
        url: track.audioUrl,
        title: track.title,
        rang: 'A'
      });
    }
  };

  const toggleLike = (trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId 
        ? { 
            ...track, 
            isLiked: !track.isLiked,
            likes: track.isLiked ? track.likes - 1 : track.likes + 1
          }
        : track
    ));
  };

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.style.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Aura de fond */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.3),transparent_50%)]"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            Ma <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Bibliothèque</span>
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Toutes vos créations musicales éducatives
          </p>
          
          {/* Barre de recherche */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher par titre, item ou style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Liste des tracks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTracks.map((track) => {
            const isCurrentTrack = currentTrack?.url === track.audioUrl;
            const isCurrentlyPlaying = isCurrentTrack && isPlaying;
            
            return (
              <div key={track.id} className="group">
                {/* Pochette/Cover */}
                <div className="relative aspect-square bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg mb-4 overflow-hidden shadow-lg">
                  {/* Icône médicale selon l'item */}
                  <div className="absolute inset-0 flex items-center justify-center text-6xl text-white/80">
                    {track.itemCode.includes('103') && '🧠'}
                    {track.itemCode.includes('230') && '❤️'}
                    {track.itemCode.includes('156') && '🫁'}
                    {track.itemCode.includes('089') && '🧠'}
                    {!['103', '230', '156', '089'].some(code => track.itemCode.includes(code)) && <Music className="h-16 w-16" />}
                  </div>
                  
                  {/* Overlay de lecture */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <button
                      onClick={() => handlePlayPause(track)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-4 shadow-lg hover:scale-110 transform transition-transform"
                    >
                      {isCurrentlyPlaying ? (
                        <Pause className="h-8 w-8 text-purple-600" />
                      ) : (
                        <Play className="h-8 w-8 text-purple-600 ml-1" />
                      )}
                    </button>
                  </div>

                  {/* Badge de lecture en cours */}
                  {isCurrentlyPlaying && (
                    <div className="absolute top-3 left-3 bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      En cours
                    </div>
                  )}
                </div>

                {/* Informations de la track */}
                <div className="space-y-2">
                  <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-pink-300 transition-colors">
                    {track.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(track.duration)}
                    </span>
                    <span className="bg-white/10 px-2 py-1 rounded-full text-xs">
                      {track.style}
                    </span>
                  </div>

                  {/* Stats et actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{formatNumber(track.plays)} écoutes</span>
                      <span>{formatNumber(track.likes)} ❤️</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleLike(track.id)}
                        className="p-1 rounded-full hover:bg-white/10 transition-colors"
                      >
                        <Heart className={`h-4 w-4 ${track.isLiked ? 'text-pink-500 fill-current' : 'text-gray-400'}`} />
                      </button>
                      <button className="p-1 rounded-full hover:bg-white/10 transition-colors">
                        <Download className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message si aucun résultat */}
        {filteredTracks.length === 0 && (
          <div className="text-center py-12">
            <Music className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Aucune musique trouvée</p>
            <p className="text-gray-500 text-sm">Essayez avec d'autres termes de recherche</p>
          </div>
        )}
      </div>
    </div>
  );
};