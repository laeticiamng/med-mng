import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Music, Play, Pause, Download, Radio, Sparkles, Volume2 } from 'lucide-react';
import { useSunoMusicGeneration } from '@/hooks/music/useSunoMusicGeneration';
import MicroInteractions from '@/components/experience/MicroInteractions';

interface AdvancedGenerationMusicaleProps {
  itemData: {
    id: string;
    title: string;
    music_lyrics_a?: string[];
    music_lyrics_b?: string[];
    item_code?: string;
  };
  competences: string[];
  onProgress?: (progress: number) => void;
}

const MUSIC_STYLES = [
  { value: 'pop', label: 'Pop moderne' },
  { value: 'rock', label: 'Rock énergique' },
  { value: 'electronic', label: 'Électronique' },
  { value: 'ambient', label: 'Ambiant' },
  { value: 'classical', label: 'Classique' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'hip-hop', label: 'Hip-Hop' },
  { value: 'folk', label: 'Folk' }
];

export const AdvancedGenerationMusicale: React.FC<AdvancedGenerationMusicaleProps> = ({
  itemData,
  competences,
  onProgress
}) => {
  const [selectedRang, setSelectedRang] = useState<'A' | 'B'>('A');
  const [selectedStyle, setSelectedStyle] = useState('pop');
  const [duration, setDuration] = useState(30);
  const [customLyrics, setCustomLyrics] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const {
    isGenerating,
    generatedAudio,
    generationProgress,
    lastError,
    generateMusicInLanguage
  } = useSunoMusicGeneration();

  const currentLyrics = selectedRang === 'A' 
    ? itemData.music_lyrics_a 
    : itemData.music_lyrics_b;

  const handleGenerate = useCallback(async () => {
    const lyrics = customLyrics || (currentLyrics?.join('\n') || '');
    if (!lyrics.trim()) return;

    await generateMusicInLanguage(
      selectedRang,
      [lyrics],
      selectedStyle,
      duration,
      'V4'
    );
  }, [selectedRang, selectedStyle, duration, customLyrics, currentLyrics, generateMusicInLanguage]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <Card className="min-h-[600px] bg-gradient-to-br from-background/80 to-muted/40 backdrop-blur-sm">
        <CardHeader className="bg-background/90 backdrop-blur-xl border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Music className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Génération Musicale AI
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    Suno V4
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {itemData.title} - Création musicale immersive
                </p>
              </div>
            </div>

            {generatedAudio && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Télécharger
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handlePlay}
                  className="gap-2"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isPlaying ? 'Pause' : 'Écouter'}
                </Button>
              </div>
            )}
          </div>

          {(isGenerating || (generationProgress && typeof generationProgress === 'object' && Object.keys(generationProgress).length > 0)) && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Génération en cours...</span>
                <span>Processing...</span>
              </div>
              <Progress value={50} className="h-2" />
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Configuration */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rang</label>
              <Select value={selectedRang} onValueChange={(value: 'A' | 'B') => setSelectedRang(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Rang A</SelectItem>
                  <SelectItem value="B">Rang B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Style musical</label>
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MUSIC_STYLES.map(style => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Durée (secondes)</label>
              <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 secondes</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="120">2 minutes</SelectItem>
                  <SelectItem value="180">3 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Paroles */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Paroles</h3>
              <Badge variant="outline">
                {selectedRang === 'A' ? 'Version A' : 'Version B'}
              </Badge>
            </div>

            <Textarea
              placeholder={currentLyrics?.join('\n') || 'Entrez vos paroles personnalisées...'}
              value={customLyrics}
              onChange={(e) => setCustomLyrics(e.target.value)}
              className="min-h-[120px] resize-none"
            />

            {currentLyrics && !customLyrics && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Paroles prédéfinies :</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  {currentLyrics.map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-center">
            <Button
              onClick={handleGenerate}
              disabled={Boolean(isGenerating) || (!customLyrics && !currentLyrics?.length)}
              size="lg"
              className="gap-3 px-8"
            >
              {Boolean(isGenerating) ? (
                <>
                  <Radio className="h-5 w-5 animate-pulse" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Générer la musique
                </>
              )}
            </Button>
          </div>

          {/* Lecteur audio */}
          {generatedAudio && (
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Volume2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Musique générée</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedStyle} • {duration}s
                      </p>
                    </div>
                  </div>
                </div>

                <audio
                  controls
                  src={typeof generatedAudio === 'string' ? generatedAudio : ''}
                  className="w-full"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </CardContent>
            </Card>
          )}

          {/* Compétences développées */}
          <Card className="bg-background/50">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                Compétences développées
              </h4>
              <div className="flex flex-wrap gap-2">
                {competences.map((comp, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
                  >
                    {comp}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {lastError && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{lastError}</p>
            </div>
          )}
        </CardContent>
    </Card>
  );
};