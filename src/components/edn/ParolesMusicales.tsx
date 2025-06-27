
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Music } from 'lucide-react';

interface ParolesMusicalesProps {
  paroles: string[];
}

export const ParolesMusicales = ({ paroles }: ParolesMusicalesProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(0);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-serif text-amber-900 mb-4">Paroles Musicales</h2>
        <p className="text-amber-700">Assonances et rythmes pour mémoriser</p>
      </div>

      <div className="max-w-3xl mx-auto">
        {paroles.map((strophe, index) => (
          <Card
            key={index}
            className={`p-8 mb-6 transition-all duration-500 ${
              currentVerse === index
                ? 'bg-gradient-to-r from-amber-50 to-blue-50 border-amber-300 shadow-lg scale-105'
                : 'bg-white/80 border-amber-200'
            }`}
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Music className="h-5 w-5 text-amber-600 mr-2" />
                <span className="text-sm text-amber-600 font-medium">
                  Strophe {index + 1}
                </span>
              </div>
              
              <div className="text-lg font-serif text-amber-900 leading-relaxed italic">
                {strophe.split('\n').map((ligne, ligneIndex) => (
                  <div key={ligneIndex} className="mb-2">
                    {ligne}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center space-y-4">
        <Button
          onClick={togglePlay}
          className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3"
          size="lg"
        >
          {isPlaying ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
          {isPlaying ? 'Pause' : 'Écouter la mélodie'}
        </Button>
        
        <p className="text-sm text-amber-600">
          🎵 Lo-fi piano avec ambiance douce - 4 minutes
        </p>
      </div>
    </div>
  );
};
