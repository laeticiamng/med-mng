import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music, AlertTriangle, Brain, Target } from 'lucide-react';
import { useQuizErrorTracker } from '@/hooks/useQuizErrorTracker';
import { useMusicGenerationWithTranslation } from '@/hooks/useMusicGenerationWithTranslation';
import { useToast } from '@/hooks/use-toast';

interface QuizErrorSongGeneratorProps {
  itemCode: string;
  itemTitle: string;
}

export const QuizErrorSongGenerator: React.FC<QuizErrorSongGeneratorProps> = ({
  itemCode,
  itemTitle
}) => {
  const [selectedStyle, setSelectedStyle] = React.useState<string>('lofi-piano');
  const { currentErrors, hasCurrentSession } = useQuizErrorTracker();
  const { generateMusicInLanguage, isGenerating } = useMusicGenerationWithTranslation();
  const { toast } = useToast();

  const musicStyles = [
    { value: 'lofi-piano', label: 'Lofi Piano' },
    { value: 'acoustic-pop', label: 'Pop Acoustique' },
    { value: 'hip-hop', label: 'Hip-Hop' },
    { value: 'jazz', label: 'Jazz' },
    { value: 'classical', label: 'Classique' },
  ];

  const generateLyricsFromErrors = (): string => {
    if (!currentErrors.length) return '';

    const errorsByTheme = currentErrors.reduce((acc, error) => {
      if (!acc[error.theme]) acc[error.theme] = [];
      acc[error.theme].push(error);
      return acc;
    }, {} as Record<string, typeof currentErrors>);

    let lyrics = `Quiz ${itemCode} - Erreurs à retenir\n\n`;
    
    Object.entries(errorsByTheme).forEach(([theme, errors]) => {
      lyrics += `[Couplet - ${theme}]\n`;
      errors.forEach(error => {
        lyrics += `Question: ${error.question}\n`;
        lyrics += `Réponse correcte: ${error.correctAnswer}\n`;
        if (error.explanation) {
          lyrics += `Explication: ${error.explanation}\n`;
        }
        lyrics += '\n';
      });
    });

    lyrics += `[Refrain]\n`;
    lyrics += `Retenir les erreurs, c'est progresser\n`;
    lyrics += `Chaque faute est une leçon à intégrer\n`;
    lyrics += `${itemCode}, je maîtrise maintenant\n`;
    lyrics += `Mon savoir grandit constamment\n`;

    return lyrics;
  };

  const handleGenerate = async () => {
    if (!currentErrors.length) {
      toast({
        title: "Aucune erreur",
        description: "Il n'y a pas d'erreurs à convertir en chanson",
        variant: "destructive"
      });
      return;
    }

    try {
      const lyrics = generateLyricsFromErrors();
      console.log('🎵 Génération chanson d\'erreurs:', { lyrics, style: selectedStyle });
      
      const audioUrl = await generateMusicInLanguage('A', [lyrics], selectedStyle, 180);
      
      toast({
        title: "Chanson générée !",
        description: `Chanson créée à partir de ${currentErrors.length} erreur(s) du quiz`,
        variant: "default"
      });
      
    } catch (error) {
      console.error('❌ Erreur génération chanson erreurs:', error);
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer la chanson d'erreurs",
        variant: "destructive"
      });
    }
  };

  if (!hasCurrentSession || !currentErrors.length) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-500">
            <Music className="h-5 w-5" />
            Générateur de Chanson d'Erreurs
          </CardTitle>
          <CardDescription>
            Aucune erreur détectée dans cette session de quiz
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Brain className="h-5 w-5" />
          Transformer vos erreurs en chanson
        </CardTitle>
        <CardDescription className="text-orange-700">
          {currentErrors.length} erreur(s) détectée(s) - Créez une chanson pour mieux les retenir !
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Résumé des erreurs */}
        <div className="bg-white/60 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-orange-600" />
            <span className="font-medium text-orange-800">Erreurs à réviser :</span>
          </div>
          <div className="space-y-2">
            {currentErrors.slice(0, 3).map((error, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium text-gray-700">Q{index + 1}:</span>
                <span className="text-gray-600 ml-1">
                  {error.question.substring(0, 60)}...
                </span>
              </div>
            ))}
            {currentErrors.length > 3 && (
              <div className="text-sm text-orange-600 font-medium">
                +{currentErrors.length - 3} autres erreurs
              </div>
            )}
          </div>
        </div>

        {/* Sélection du style */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-orange-800">
            Style musical
          </label>
          <Select value={selectedStyle} onValueChange={setSelectedStyle}>
            <SelectTrigger className="bg-white/60 border-orange-200">
              <SelectValue />
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

        {/* Bouton de génération */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating.rangA || isGenerating.rangB}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
        >
          {isGenerating.rangA || isGenerating.rangB ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
              Génération...
            </>
          ) : (
            <>
              <Music className="h-4 w-4 mr-2" />
              Générer la chanson d'erreurs
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};