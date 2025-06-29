
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Music, Mic, Volume2, AlertCircle } from 'lucide-react';
import { MusicStyleSelector } from './music/MusicStyleSelector';
import { useMusicGenerationWithTranslation } from '@/hooks/useMusicGenerationWithTranslation';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';

interface ParolesMusicalesProps {
  paroles: string[];
  itemCode: string;
  tableauRangA?: any;
  tableauRangB?: any;
}

export const ParolesMusicales: React.FC<ParolesMusicalesProps> = ({ 
  paroles, 
  itemCode,
  tableauRangA,
  tableauRangB
}) => {
  const [selectedStyle, setSelectedStyle] = useState('');
  const [musicDuration, setMusicDuration] = useState(240); // 4 minutes par défaut
  
  const {
    isGenerating,
    generatedAudio,
    generateMusicInLanguage,
    currentLanguage
  } = useMusicGenerationWithTranslation();

  const {
    currentTrack,
    isPlaying,
    play,
    pause,
    resume,
    stop
  } = useGlobalAudio();

  // Vérifier si les paroles sont suffisantes
  const hasValidParoles = paroles && paroles.length >= 2;
  const isParolesTooShort = (parole: string) => parole && parole.split('\n').length < 8;

  if (!hasValidParoles) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-6 h-6" />
            Paroles Musicales - Contenu indisponible
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 mb-4">
            Les paroles musicales ne sont pas encore disponibles dans Supabase.
          </p>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-700">
              <strong>Données attendues :</strong> 2 chansons complètes (Rang A et Rang B) 
              avec 3 couplets + refrain répété 3 fois + pont pour chaque chanson.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleGenerateMusic = async (rangIndex: number) => {
    if (!selectedStyle) {
      alert('Veuillez sélectionner un style musical');
      return;
    }

    const rang = rangIndex === 0 ? 'A' : 'B';
    await generateMusicInLanguage(rang, paroles, selectedStyle, musicDuration);
  };

  const handlePlayPause = (rangIndex: number) => {
    const audioKey = rangIndex === 0 ? 'rangA' : 'rangB';
    const audioUrl = generatedAudio[audioKey];
    
    if (!audioUrl) return;

    const trackTitle = `IC-${itemCode} - Rang ${rangIndex === 0 ? 'A' : 'B'} - ${selectedStyle}`;
    
    if (currentTrack?.url === audioUrl) {
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
    } else {
      play({
        url: audioUrl,
        title: trackTitle,
        rang: rangIndex === 0 ? 'A' : 'B'
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const rangLabels = ['Rang A - Fondamentaux', 'Rang B - Approfondissements'];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="w-6 h-6 text-purple-600" />
          Paroles Musicales - {itemCode}
          <Badge variant="outline">{paroles.length} chanson{paroles.length > 1 ? 's' : ''}</Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Langue actuelle : <strong>{currentLanguage === 'fr' ? 'Français' : currentLanguage}</strong>
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contrôles de génération */}
        <div className="space-y-4">
          <MusicStyleSelector
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
          />
          
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Durée :</label>
            <select 
              value={musicDuration}
              onChange={(e) => setMusicDuration(Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              <option value={180}>3:00</option>
              <option value={240}>4:00</option>
              <option value={300}>5:00</option>
            </select>
          </div>
        </div>

        {/* Affichage des paroles et génération */}
        <div className="space-y-6">
          {paroles.map((chanson, index) => {
            const rangKey = index === 0 ? 'rangA' : 'rangB';
            const audioUrl = generatedAudio[rangKey];
            const isCurrentTrack = currentTrack?.url === audioUrl;
            const isGeneratingThis = isGenerating[rangKey];
            const isTooShort = isParolesTooShort(chanson);
            
            return (
              <Card key={index} className={`border-l-4 ${index === 0 ? 'border-l-amber-400' : 'border-l-blue-400'}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>
                        {rangLabels[index]}
                      </Badge>
                      {isTooShort && (
                        <Badge variant="destructive" className="text-xs">
                          Paroles trop courtes
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isCurrentTrack && isPlaying && (
                        <Volume2 className="w-4 h-4 text-green-600 animate-pulse" />
                      )}
                      
                      {/* Bouton de génération */}
                      <Button
                        onClick={() => handleGenerateMusic(index)}
                        disabled={!selectedStyle || isGeneratingThis}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        {isGeneratingThis ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Génération...
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4" />
                            Générer ({formatDuration(musicDuration)})
                          </>
                        )}
                      </Button>
                      
                      {/* Bouton play/pause */}
                      {audioUrl && (
                        <Button
                          onClick={() => handlePlayPause(index)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          {isCurrentTrack && isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                      {chanson}
                    </pre>
                  </div>
                  
                  {isTooShort && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
                      <p className="text-orange-700 text-sm">
                        ⚠️ Ces paroles semblent incomplètes. Elles devraient contenir 3 couplets, 
                        un refrain répété 3 fois et un pont pour une chanson de {formatDuration(musicDuration)}.
                      </p>
                    </div>
                  )}
                  
                  {/* Informations contextuelles */}
                  {index === 0 && tableauRangA && (
                    <div className="mt-3 text-xs text-gray-600">
                      <strong>Basé sur :</strong> {tableauRangA.theme || 'Tableau Rang A'}
                    </div>
                  )}
                  {index === 1 && tableauRangB && (
                    <div className="mt-3 text-xs text-gray-600">
                      <strong>Basé sur :</strong> {tableauRangB.theme || 'Tableau Rang B'}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Message d'aide */}
        <div className="text-sm text-gray-600 p-4 bg-blue-50 rounded-lg">
          <p className="mb-2">
            🎵 <strong>Instructions :</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Sélectionnez un style musical dans les onglets ci-dessus</li>
            <li>Choisissez la durée souhaitée</li>
            <li>Cliquez sur "Générer" pour créer votre musique</li>
            <li>Une fois générée, utilisez les contrôles play/pause</li>
            <li>Le lecteur global apparaîtra en bas à droite de l'écran</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
