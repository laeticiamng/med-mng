
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music, Settings, Minimize2, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { AudioPlayer } from './AudioPlayer';

interface ParolesMusicalesProps {
  paroles: string[];
}

export const ParolesMusicales = ({ paroles }: ParolesMusicalesProps) => {
  const [isGenerating, setIsGenerating] = useState<{ rangA: boolean; rangB: boolean }>({
    rangA: false,
    rangB: false
  });
  const [selectedStyle, setSelectedStyle] = useState('');
  const [generatedAudio, setGeneratedAudio] = useState<{ rangA?: string; rangB?: string }>({});
  const [lastError, setLastError] = useState<string>('');
  const { toast } = useToast();
  
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMinimized,
    play,
    pause,
    resume,
    stop,
    seek,
    changeVolume,
    minimize,
  } = useGlobalAudio();

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

    setIsGenerating(prev => ({ ...prev, [rang === 'A' ? 'rangA' : 'rangB']: true }));
    setLastError('');
    const parolesIndex = rang === 'A' ? 0 : 1;
    const parolesText = paroles[parolesIndex];

    try {
      console.log(`Génération musique Rang ${rang} avec style ${selectedStyle} - Durée: 4 minutes`);
      
      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: {
          lyrics: parolesText,
          style: selectedStyle,
          rang: rang
        }
      });

      if (error) {
        console.error('Erreur Supabase:', error);
        throw new Error(error.message || 'Erreur lors de l\'appel à la fonction');
      }

      if (data.status === 'error') {
        setLastError(data.error);
        throw new Error(data.error);
      }

      const audioKey = rang === 'A' ? 'rangA' : 'rangB';
      setGeneratedAudio(prev => ({
        ...prev,
        [audioKey]: data.audioUrl
      }));

      toast({
        title: `Musique Rang ${rang} générée`,
        description: "Chanson de 4 minutes générée avec succès !",
      });

      console.log(`Musique 4 minutes générée avec succès:`, data.audioUrl);
    } catch (error) {
      console.error('Erreur génération musique:', error);
      setLastError(error.message);
      toast({
        title: "Erreur de génération",
        description: error.message || "Impossible de générer la musique. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(prev => ({ ...prev, [rang === 'A' ? 'rangA' : 'rangB']: false }));
    }
  };

  const handlePlayPause = (rang: 'rangA' | 'rangB') => {
    const audioUrl = generatedAudio[rang];
    if (!audioUrl) return;

    const trackTitle = rang === 'rangA' 
      ? 'Chanson Rang A - Colloque Singulier (4 min)'
      : 'Chanson Rang B - Outils Pratiques (4 min)';

    const track = {
      url: audioUrl,
      title: trackTitle,
      rang: rang === 'rangA' ? 'A' as const : 'B' as const
    };

    if (currentTrack?.url === audioUrl) {
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
    } else {
      play(track);
    }
  };

  const handleStop = () => {
    stop();
  };

  const isCurrentTrackPlaying = (rang: 'rangA' | 'rangB') => {
    const audioUrl = generatedAudio[rang];
    return currentTrack?.url === audioUrl && isPlaying;
  };

  const isCurrentTrack = (rang: 'rangA' | 'rangB') => {
    const audioUrl = generatedAudio[rang];
    return currentTrack?.url === audioUrl;
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

        {lastError && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Erreur de configuration</span>
            </div>
            <p className="text-red-700 mt-2 text-sm">{lastError}</p>
            <p className="text-red-600 mt-2 text-xs">
              Veuillez configurer REPLICATE_API_TOKEN dans les paramètres Supabase.
            </p>
          </div>
        )}
      </div>

      {/* Chanson Rang A */}
      <Card className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-xl">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <Music className="h-6 w-6 text-amber-600 mr-3" />
            <h3 className="text-2xl font-serif text-amber-900 font-bold">
              Chanson Rang A - "Colloque Singulier" (4 minutes)
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
              disabled={isGenerating.rangA || !selectedStyle}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3"
            >
              {isGenerating.rangA ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération 4 min en cours...
                </>
              ) : (
                'Générer Musique Rang A (4 min)'
              )}
            </Button>
          </div>
          
          {generatedAudio.rangA && !isMinimized && (
            <AudioPlayer
              audioUrl={generatedAudio.rangA}
              title="Chanson Rang A - Colloque Singulier (4 min)"
              isPlaying={isCurrentTrackPlaying('rangA')}
              currentTime={isCurrentTrack('rangA') ? currentTime : 0}
              duration={isCurrentTrack('rangA') ? duration : 240}
              volume={volume}
              onPlayPause={() => handlePlayPause('rangA')}
              onSeek={seek}
              onVolumeChange={changeVolume}
              onStop={handleStop}
              onClose={minimize}
            />
          )}

          {generatedAudio.rangA && isMinimized && isCurrentTrack('rangA') && (
            <div className="text-center">
              <Button
                onClick={minimize}
                variant="outline"
                className="border-amber-300 text-amber-600 hover:bg-amber-50"
              >
                <Minimize2 className="h-4 w-4 mr-2" />
                Lecteur minimisé - Continuer l'écoute
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Chanson Rang B */}
      <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-xl">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <Music className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-2xl font-serif text-blue-900 font-bold">
              Chanson Rang B - "Outils Pratiques" (4 minutes)
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
              disabled={isGenerating.rangB || !selectedStyle}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
            >
              {isGenerating.rangB ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération 4 min en cours...
                </>
              ) : (
                'Générer Musique Rang B (4 min)'
              )}
            </Button>
          </div>
          
          {generatedAudio.rangB && !isMinimized && (
            <AudioPlayer
              audioUrl={generatedAudio.rangB}
              title="Chanson Rang B - Outils Pratiques (4 min)"
              isPlaying={isCurrentTrackPlaying('rangB')}
              currentTime={isCurrentTrack('rangB') ? currentTime : 0}
              duration={isCurrentTrack('rangB') ? duration : 240}
              volume={volume}
              onPlayPause={() => handlePlayPause('rangB')}
              onSeek={seek}
              onVolumeChange={changeVolume}
              onStop={handleStop}
              onClose={minimize}
            />
          )}

          {generatedAudio.rangB && isMinimized && isCurrentTrack('rangB') && (
            <div className="text-center">
              <Button
                onClick={minimize}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Minimize2 className="h-4 w-4 mr-2" />
                Lecteur minimisé - Continuer l'écoute
              </Button>
            </div>
          )}
        </div>
      </Card>

      {selectedStyle && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full">
            <Music className="h-4 w-4" />
            <span className="font-medium">
              Style sélectionné : {musicStyles.find(s => s.value === selectedStyle)?.label} - Durée: 4 minutes
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
