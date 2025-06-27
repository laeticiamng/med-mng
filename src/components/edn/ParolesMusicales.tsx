
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { AudioPlayer } from './AudioPlayer';

interface ParolesMusicalesProps {
  paroles: string[];
}

export const ParolesMusicales = ({ paroles }: ParolesMusicalesProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [generatedAudio, setGeneratedAudio] = useState<{ rangA?: string; rangB?: string }>({});
  const [currentPlaying, setCurrentPlaying] = useState<'rangA' | 'rangB' | null>(null);
  const { toast } = useToast();
  
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    currentTrack,
    play,
    pause,
    resume,
    stop,
    seek,
    changeVolume
  } = useAudioPlayer();

  const musicStyles = [
    { value: 'lofi-piano', label: 'Lo-fi Piano Doux' },
    { value: 'afrobeat', label: 'Afrobeat Énergique' },
    { value: 'jazz-moderne', label: 'Jazz Moderne' },
    { value: 'hip-hop-conscient', label: 'Hip-Hop Conscient' },
    { value: 'soul-rnb', label: 'Soul R&B' },
    { value: 'electro-chill', label: 'Electro Chill' }
  ];

  const formatParoles = (text: string) => {
    return text
      .replace(/\\n/g, '\n')
      .replace(/\n\n+/g, '\n\n')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  };

  const generateMusic = async (rang: 'A' | 'B') => {
    if (!selectedStyle) {
      toast({
        title: "Style musical requis",
        description: "Veuillez sélectionner un style musical avant de générer la musique.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    const parolesIndex = rang === 'A' ? 0 : 1;
    const parolesText = paroles[parolesIndex];

    try {
      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: {
          lyrics: parolesText,
          style: selectedStyle,
          rang: rang
        }
      });

      if (error) throw error;

      const audioKey = rang === 'A' ? 'rangA' : 'rangB';
      setGeneratedAudio(prev => ({
        ...prev,
        [audioKey]: data.audioUrl
      }));

      toast({
        title: `Musique Rang ${rang} générée`,
        description: "La musique a été générée avec succès !",
      });
    } catch (error) {
      console.error('Erreur génération musique:', error);
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer la musique. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = (rang: 'rangA' | 'rangB') => {
    const audioUrl = generatedAudio[rang];
    if (!audioUrl) return;

    if (currentPlaying === rang && currentTrack === audioUrl) {
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
    } else {
      setCurrentPlaying(rang);
      play(audioUrl);
    }
  };

  const handleStop = () => {
    stop();
    setCurrentPlaying(null);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-serif text-amber-900 mb-4">Paroles Musicales Immersives</h2>
        <p className="text-lg text-amber-700 mb-6">
          Assonances et rythmes pour une mémorisation optimale
        </p>
        
        <div className="max-w-md mx-auto mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Settings className="h-5 w-5 text-amber-600" />
            <span className="font-medium text-amber-800">Style Musical</span>
          </div>
          <Select value={selectedStyle} onValueChange={setSelectedStyle}>
            <SelectTrigger className="border-amber-300 focus:border-amber-500">
              <SelectValue placeholder="Choisissez votre style musical" />
            </SelectTrigger>
            <SelectContent>
              {musicStyles.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chanson Rang A */}
      <Card className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-xl">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <Music className="h-6 w-6 text-amber-600 mr-3" />
            <h3 className="text-2xl font-serif text-amber-900 font-bold">
              Chanson Rang A - "Colloque Singulier"
            </h3>
          </div>
        </div>
        
        <div className="prose prose-lg max-w-none text-amber-900 mb-8">
          {formatParoles(paroles[0]).map((ligne, index) => {
            if (ligne.startsWith('[') && ligne.endsWith(']')) {
              return (
                <div key={index} className="text-xl font-bold text-amber-800 my-4 text-center">
                  {ligne}
                </div>
              );
            }
            if (ligne.includes(' - ')) {
              return (
                <div key={index} className="text-2xl font-bold text-amber-900 mb-6 text-center border-b-2 border-amber-300 pb-3">
                  {ligne}
                </div>
              );
            }
            return (
              <div key={index} className="text-lg leading-relaxed mb-2 italic font-medium">
                {ligne}
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="flex justify-center">
            <Button
              onClick={() => generateMusic('A')}
              disabled={isGenerating || !selectedStyle}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3"
            >
              {isGenerating ? 'Génération...' : 'Générer Musique Rang A'}
            </Button>
          </div>
          
          {generatedAudio.rangA && (
            <AudioPlayer
              audioUrl={generatedAudio.rangA}
              title="Chanson Rang A - Colloque Singulier"
              isPlaying={isPlaying && currentPlaying === 'rangA'}
              currentTime={currentPlaying === 'rangA' ? currentTime : 0}
              duration={currentPlaying === 'rangA' ? duration : 0}
              volume={volume}
              onPlayPause={() => handlePlayPause('rangA')}
              onSeek={seek}
              onVolumeChange={changeVolume}
              onStop={handleStop}
            />
          )}
        </div>
      </Card>

      {/* Chanson Rang B */}
      <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-xl">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <Music className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-2xl font-serif text-blue-900 font-bold">
              Chanson Rang B - "Outils Pratiques"
            </h3>
          </div>
        </div>
        
        <div className="prose prose-lg max-w-none text-blue-900 mb-8">
          {formatParoles(paroles[1]).map((ligne, index) => {
            if (ligne.startsWith('[') && ligne.endsWith(']')) {
              return (
                <div key={index} className="text-xl font-bold text-blue-800 my-4 text-center">
                  {ligne}
                </div>
              );
            }
            if (ligne.includes(' - ')) {
              return (
                <div key={index} className="text-2xl font-bold text-blue-900 mb-6 text-center border-b-2 border-blue-300 pb-3">
                  {ligne}
                </div>
              );
            }
            return (
              <div key={index} className="text-lg leading-relaxed mb-2 italic font-medium">
                {ligne}
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="flex justify-center">
            <Button
              onClick={() => generateMusic('B')}
              disabled={isGenerating || !selectedStyle}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
            >
              {isGenerating ? 'Génération...' : 'Générer Musique Rang B'}
            </Button>
          </div>
          
          {generatedAudio.rangB && (
            <AudioPlayer
              audioUrl={generatedAudio.rangB}
              title="Chanson Rang B - Outils Pratiques"
              isPlaying={isPlaying && currentPlaying === 'rangB'}
              currentTime={currentPlaying === 'rangB' ? currentTime : 0}
              duration={currentPlaying === 'rangB' ? duration : 0}
              volume={volume}
              onPlayPause={() => handlePlayPause('rangB')}
              onSeek={seek}
              onVolumeChange={changeVolume}
              onStop={handleStop}
            />
          )}
        </div>
      </Card>

      {selectedStyle && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full">
            <Music className="h-4 w-4" />
            <span className="font-medium">
              Style sélectionné : {musicStyles.find(s => s.value === selectedStyle)?.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
