
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Play, Trash2 } from 'lucide-react';

interface SavedMusic {
  id: string;
  title: string;
  audio_url: string;
  music_style: string;
  rang: string;
  item_code: string;
  created_at: string;
}

interface MusicLibraryGridProps {
  musics: SavedMusic[];
  playingId: string | null;
  onPlay: (music: SavedMusic) => void;
  onDelete: (musicId: string) => void;
}

export const MusicLibraryGrid = ({ musics, playingId, onPlay, onDelete }: MusicLibraryGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {musics.map((music) => (
        <Card key={music.id} className="group hover:shadow-lg transition-all duration-200">
          <CardContent className="p-0">
            {/* Cover */}
            <div className="relative aspect-square bg-gradient-to-br from-amber-500 to-orange-500 rounded-t-lg flex items-center justify-center">
              <Music className="h-12 w-12 text-white/80" />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/20 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Button
                  onClick={() => onPlay(music)}
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
                  onClick={() => onDelete(music.id)}
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
                  onClick={() => onPlay(music)}
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
  );
};
