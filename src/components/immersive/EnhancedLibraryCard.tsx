import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Heart, 
  MoreHorizontal, 
  Download,
  Share2,
  Clock,
  Headphones,
  TrendingUp,
  Zap,
  Brain
} from 'lucide-react';
import { MusicWaveform } from './MusicWaveform';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Track {
  id: string;
  title: string;
  subject: string;
  style: string;
  duration: number;
  playCount: number;
  isFavorite: boolean;
  difficulty: string;
  tags: string[];
  mood: string;
  tempo: number;
  retentionScore?: number;
  completionRate?: number;
}

interface EnhancedLibraryCardProps {
  track: Track;
  isPlaying: boolean;
  onPlayPause: (trackId: string) => void;
  onToggleFavorite: (trackId: string) => void;
  onDelete: (trackId: string) => void;
}

export const EnhancedLibraryCard: React.FC<EnhancedLibraryCardProps> = ({
  track,
  isPlaying,
  onPlayPause,
  onToggleFavorite,
  onDelete
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStyleGradient = (style: string) => {
    switch (style.toLowerCase()) {
      case 'trap': return 'from-purple-500 to-pink-500';
      case 'lo-fi': return 'from-blue-400 to-cyan-400';
      case 'pop': return 'from-pink-400 to-rose-400';
      case 'jazz': return 'from-amber-500 to-orange-500';
      case 'afrobeat': return 'from-green-500 to-emerald-500';
      case 'classique': return 'from-indigo-500 to-purple-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'debutant': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediaire': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'avance': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'expert': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card 
      className="group hover:shadow-xl transition-all duration-500 hover:scale-[1.02] bg-white/80 backdrop-blur-sm border-0 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        {/* Album Art avec overlay interactif */}
        <div className="relative aspect-square overflow-hidden">
          <div className={`w-full h-full bg-gradient-to-br ${getStyleGradient(track.style)} flex items-center justify-center text-white relative`}>
            <Brain className="h-16 w-16 opacity-60" />
            
            {/* Overlay de lecture */}
            <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <Button
                size="lg"
                onClick={() => onPlayPause(track.id)}
                className="scale-75 hover:scale-90 transition-all duration-300 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white rounded-full w-16 h-16"
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8 ml-1" />
                )}
              </Button>
            </div>

            {/* Badge style */}
            <Badge className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white border-white/20 text-xs">
              {track.style}
            </Badge>

            {/* Favori */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggleFavorite(track.id)}
              className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white rounded-full w-8 h-8 p-0"
            >
              <Heart className={`h-4 w-4 ${track.isFavorite ? 'fill-current text-red-400' : ''}`} />
            </Button>

            {/* Waveform overlay */}
            <div className="absolute bottom-3 left-3 right-3">
              <MusicWaveform 
                isPlaying={isPlaying}
                height={20}
                barCount={16}
                color="bg-gradient-to-t from-white/40 to-white/60"
              />
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors mb-1">
              {track.title}
            </h3>
            <p className="text-sm text-gray-600">{track.subject}</p>
          </div>

          {/* Métriques d'apprentissage */}
          <div className="space-y-2">
            {track.retentionScore && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 flex items-center">
                  <Brain className="h-3 w-3 mr-1" />
                  Rétention
                </span>
                <div className="flex items-center space-x-2">
                  <Progress value={track.retentionScore} className="w-12 h-1" />
                  <span className="font-medium text-green-600">{track.retentionScore}%</span>
                </div>
              </div>
            )}
            
            {track.completionRate && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Progression
                </span>
                <div className="flex items-center space-x-2">
                  <Progress value={track.completionRate} className="w-12 h-1" />
                  <span className="font-medium text-blue-600">{track.completionRate}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Métadonnées */}
          <div className="flex items-center justify-between">
            <Badge className={getDifficultyColor(track.difficulty) + ' text-xs border'}>
              {track.difficulty}
            </Badge>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(track.duration)}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-gray-500">
              <Headphones className="h-3 w-3 mr-1" />
              {track.playCount} écoutes
            </div>
            
            {/* Menu actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(track.id)} className="text-red-600">
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {track.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0.5">
                #{tag}
              </Badge>
            ))}
            {track.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                +{track.tags.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};