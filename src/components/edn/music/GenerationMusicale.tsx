import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Music, 
  Play, 
  Pause, 
  Download, 
  Share, 
  Wand2,
  Volume2,
  Repeat,
  Shuffle,
  Heart
} from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';

interface GenerationMusicaleProps {
  item: any;
  paroles?: string[];
  onProgress?: (progress: number) => void;
}

export const GenerationMusicale: React.FC<GenerationMusicaleProps> = ({ 
  item, 
  paroles = [], 
  onProgress 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTracks, setGeneratedTracks] = useState<any[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('rap-medical');
  const [customLyrics, setCustomLyrics] = useState('');

  // Styles musicaux disponibles
  const musicalStyles = [
    {
      id: 'rap-medical',
      name: 'Rap Médical',
      description: 'Rythme percutant pour mémoriser',
      color: 'from-purple-500 to-pink-600',
      tempo: 'Rapide'
    },
    {
      id: 'folk-educatif',
      name: 'Folk Éducatif',
      description: 'Mélodique et facile à retenir',
      color: 'from-green-500 to-teal-600',
      tempo: 'Modéré'
    },
    {
      id: 'electro-science',
      name: 'Électro Science',
      description: 'Moderne et énergique',
      color: 'from-blue-500 to-indigo-600',
      tempo: 'Élevé'
    },
    {
      id: 'ballad-medical',
      name: 'Ballade Médicale',
      description: 'Douce et contemplative',
      color: 'from-amber-500 to-orange-600',
      tempo: 'Lent'
    }
  ];

  // Tracks générées par défaut
  useEffect(() => {
    const defaultTracks = [
      {
        id: 1,
        title: `${item.title} - Version Rap`,
        style: 'Rap Médical',
        duration: '3:45',
        lyrics: paroles.length > 0 ? paroles.join('\n') : generateDefaultLyrics(),
        generated: true
      },
      {
        id: 2,
        title: `${item.title} - Version Folk`,
        style: 'Folk Éducatif',
        duration: '4:12',
        lyrics: generateAlternativeLyrics(),
        generated: false
      }
    ];
    setGeneratedTracks(defaultTracks);
  }, [item, paroles]);

  const generateDefaultLyrics = () => {
    return `[Couplet 1]
Item ${item.item_code}, c'est parti
Les notions clés, je vais saisir
${item.title}, sujet à maîtriser
Pour l'examen, bien me préparer

[Refrain]
Médecine en rythme, savoir en cadence
Chaque détail compte, dans cette science
Diagnostic précis, traitement efficace
La connaissance avance, étape par étape

[Couplet 2]
Symptômes et signes, je dois identifier
Examens complémentaires, savoir prescrire
Thérapeutique adaptée, patient soigner
Suivi médical, toujours assurer`;
  };

  const generateAlternativeLyrics = () => {
    return `Dans le monde médical, item ${item.item_code}
Une histoire à raconter, pour bien comprendre
${item.title}, concept fondamental
Que chaque étudiant doit apprendre

Sur le chemin de la guérison
Chaque connaissance est précision
Patient au centre, toujours présent
Médecine humaine, art bienveillant`;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulation de génération IA
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newTrack = {
      id: generatedTracks.length + 1,
      title: `${item.title} - ${musicalStyles.find(s => s.id === selectedStyle)?.name}`,
      style: musicalStyles.find(s => s.id === selectedStyle)?.name || 'Personnalisé',
      duration: '3:28',
      lyrics: customLyrics || generateDefaultLyrics(),
      generated: true
    };
    
    setGeneratedTracks(prev => [...prev, newTrack]);
    setIsGenerating(false);
    onProgress?.(100);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const currentTrackData = generatedTracks[currentTrack];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-600" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <TranslatedText text="Génération Musicale IA" />
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Créez des chansons éducatives personnalisées pour {item.title}
              </p>
            </div>
            
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
              <Wand2 className="w-3 h-3 mr-1" />
              IA Premium
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Player principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Player interface */}
          <Card>
            <CardContent className="p-6">
              {currentTrackData ? (
                <div className="space-y-6">
                  {/* Info track */}
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Music className="w-16 h-16 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {currentTrackData.title}
                    </h3>
                    <p className="text-muted-foreground">
                      Style: {currentTrackData.style} • Durée: {currentTrackData.duration}
                    </p>
                  </div>

                  {/* Contrôles */}
                  <div className="flex items-center justify-center gap-4">
                    <Button variant="outline" size="sm">
                      <Shuffle className="w-4 h-4" />
                    </Button>
                    
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                      onClick={togglePlay}
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Repeat className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Barre de progression */}
                  <div className="space-y-2">
                    <Progress value={isPlaying ? 45 : 0} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{isPlaying ? '1:23' : '0:00'}</span>
                      <span>{currentTrackData.duration}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-3">
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4 mr-2" />
                      Favoris
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="w-4 h-4 mr-2" />
                      Partager
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    <TranslatedText text="Générez votre première chanson médicale" />
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Paroles */}
          {currentTrackData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Paroles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
                    {currentTrackData.lyrics}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panneau de génération */}
        <div className="space-y-6">
          {/* Générateur */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Générateur IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sélection de style */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Style musical
                </label>
                <div className="space-y-2">
                  {musicalStyles.map((style) => (
                    <div
                      key={style.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedStyle === style.id
                          ? 'border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-950'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedStyle(style.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{style.name}</p>
                          <p className="text-xs text-muted-foreground">{style.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {style.tempo}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Paroles personnalisées */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Paroles personnalisées (optionnel)
                </label>
                <Textarea
                  placeholder="Entrez vos propres paroles..."
                  value={customLyrics}
                  onChange={(e) => setCustomLyrics(e.target.value)}
                  rows={4}
                  className="text-sm"
                />
              </div>

              {/* Bouton de génération */}
              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Générer la chanson
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Playlist */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mes chansons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {generatedTracks.map((track, index) => (
                  <div
                    key={track.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      currentTrack === index
                        ? 'border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-950'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setCurrentTrack(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded flex items-center justify-center flex-shrink-0">
                        <Music className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{track.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {track.style} • {track.duration}
                        </p>
                      </div>
                      {track.generated && (
                        <Badge variant="secondary" className="text-xs">
                          IA
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};