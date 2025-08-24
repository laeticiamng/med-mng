import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Volume2, 
  Brain, 
  Wand2,
  Music,
  BookOpen,
  Target,
  Zap,
  Clock
} from 'lucide-react';
import { MusicWaveform } from '@/components/immersive/MusicWaveform';

interface RealtimePreviewProps {
  selectedContent: string;
  selectedStyle: string;
  customPrompt: string;
  difficulty: string;
  duration: string;
  isGenerating: boolean;
  onGenerate: () => void;
}

export const RealtimePreview: React.FC<RealtimePreviewProps> = ({
  selectedContent,
  selectedStyle,
  customPrompt,
  difficulty,
  duration,
  isGenerating,
  onGenerate
}) => {
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // Générer des suggestions IA en temps réel
    if (selectedContent || customPrompt) {
      const suggestions = [
        "Ajouter des mnémoniques rythmées",
        "Inclure des références cliniques",
        "Optimiser pour la mémorisation",
        "Adapter le tempo au contenu"
      ];
      setAiSuggestions(suggestions);
    }
  }, [selectedContent, customPrompt]);

  const getStyleGradient = (style: string) => {
    switch (style) {
      case 'trap': return 'from-purple-500 to-pink-500';
      case 'lofi': return 'from-blue-400 to-cyan-400';
      case 'pop': return 'from-pink-400 to-rose-400';
      case 'jazz': return 'from-amber-500 to-orange-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const readinessScore = () => {
    let score = 0;
    if (selectedContent) score += 30;
    if (selectedStyle) score += 30;
    if (difficulty) score += 20;
    if (duration) score += 20;
    return score;
  };

  return (
    <div className="space-y-6">
      {/* Aperçu en temps réel */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-0 shadow-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>Aperçu Intelligent</span>
            <Badge className="bg-purple-100 text-purple-700">
              IA Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mock Album Art */}
          <div className="relative">
            <div className={`aspect-square rounded-xl bg-gradient-to-br ${getStyleGradient(selectedStyle)} flex items-center justify-center text-white shadow-lg`}>
              <div className="text-center">
                <Music className="h-16 w-16 mb-3 opacity-80" />
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                  {selectedStyle || 'Style à choisir'}
                </Badge>
              </div>
            </div>
            
            {/* Waveform preview */}
            <div className="absolute bottom-4 left-4 right-4">
              <MusicWaveform 
                isPlaying={previewPlaying}
                height={24}
                barCount={16}
                color="bg-gradient-to-t from-white/60 to-white/80"
              />
            </div>
          </div>

          {/* Informations prédites */}
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <strong>Titre prédit :</strong> {
                selectedContent ? `${selectedContent} - Version ${selectedStyle || 'Musicale'}` : 'En attente...'
              }
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Durée estimée :</span>
                <div className="font-medium">{duration ? duration + ' minutes' : '3-5 minutes'}</div>
              </div>
              <div>
                <span className="text-gray-600">Complexité :</span>
                <div className="font-medium">{difficulty || 'Intermédiaire'}</div>
              </div>
            </div>
          </div>

          {/* Score de préparation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Score de préparation</span>
              <span className="text-purple-600 font-bold">{readinessScore()}%</span>
            </div>
            <Progress value={readinessScore()} className="h-2" />
          </div>

          {/* Contrôles de prévisualisation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewPlaying(!previewPlaying)}
              disabled={readinessScore() < 60}
            >
              {previewPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              Aperçu Audio
            </Button>
            
            <Button
              onClick={onGenerate}
              disabled={isGenerating || readinessScore() < 80}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Génération...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Générer
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions IA */}
      {aiSuggestions.length > 0 && (
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Zap className="h-4 w-4 text-emerald-600" />
              <span>Suggestions IA</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700">{suggestion}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métriques prédictives */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">92%</div>
              <div className="text-xs text-gray-600">Mémorisation</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">4.8</div>
              <div className="text-xs text-gray-600">Note prévue</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-600">87%</div>
              <div className="text-xs text-gray-600">Engagement</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};