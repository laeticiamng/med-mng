
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Music, Play, Download } from 'lucide-react';
import { musicStyles } from './StyleSelector';
import { toast } from 'sonner';

interface GeneratedSongDisplayProps {
  generatedSong: any;
  style: string;
  onPlay: () => void;
  onAddToLibrary: () => void;
}

export const GeneratedSongDisplay: React.FC<GeneratedSongDisplayProps> = ({
  generatedSong,
  style,
  onPlay,
  onAddToLibrary
}) => {
  const [isAddingToLibrary, setIsAddingToLibrary] = useState(false);

  const handleAddToLibrary = async () => {
    setIsAddingToLibrary(true);
    try {
      await onAddToLibrary();
    } catch (error) {
      toast.error('Erreur lors de l\'ajout à la bibliothèque');
    } finally {
      setIsAddingToLibrary(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="aspect-square bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
        <Music className="h-16 w-16 text-white/80" />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {generatedSong.title}
        </h3>
        <p className="text-gray-600 mb-4">
          Style: {musicStyles.find(s => s.value === style)?.label}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onPlay}
          className="flex-1 bg-green-600 hover:bg-green-700 transition-colors"
        >
          <Play className="h-4 w-4 mr-2" />
          Écouter
        </Button>
        <Button
          onClick={handleAddToLibrary}
          disabled={isAddingToLibrary}
          variant="outline"
          className="flex-1 transition-colors"
        >
          {isAddingToLibrary ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              Ajout...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Bibliothèque
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
