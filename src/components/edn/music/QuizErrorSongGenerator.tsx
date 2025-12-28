import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Music, Brain, Target, Flame, Star } from 'lucide-react';
import { useQuizErrorTracker } from '@/hooks/useQuizErrorTracker';
import { useSpotifyAI } from '@/hooks/useSpotifyAI';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';

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
  const { generateMusic, loading: isGenerating } = useSpotifyAI();
  const { toast } = useToast();
  const { logActivity } = useActivityTracking();
  const { stats, loadStats, addPoints } = useGamification();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) loadStats(user.id);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    let lyrics = `Chanson d'Erreurs - ${itemCode}
    
Mes erreurs du quiz ${itemTitle}
Transformées en mélodie
Pour mieux les retenir
Et ne plus les subir

`;
    
    Object.entries(errorsByTheme).forEach(([theme, errors], themeIndex) => {
      lyrics += `Thème ${themeIndex + 1}: ${theme}\n`;
      errors.forEach((error, index) => {
        lyrics += `Erreur ${index + 1}: ${error.question.substring(0, 80)}...\n`;
        lyrics += `La bonne réponse était: ${error.correctAnswer}\n`;
        if (error.explanation) {
          lyrics += `Car en fait: ${error.explanation.substring(0, 100)}...\n`;
        }
        lyrics += `Maintenant je sais, je retiens la leçon\n\n`;
      });
    });

    lyrics += `Mes erreurs sont mes professeurs
Chaque faute devient un bonheur
${currentErrors.length} leçons à retenir
Pour mieux réussir et grandir

Quiz ${itemCode}, merci pour tes enseignements
Chaque erreur forge mes apprentissages
De mes fautes naît la sagesse
Et ma connaissance progresse

Erreurs transformées en chanson
Difficile d'oublier la leçon !
${itemTitle}, je te maîtrise
Grâce à mes erreurs... quelle surprise !`;

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
      
      await generateMusic({
        item_code: itemCode,
        type: 'error_song',
        paroles: [lyrics],
        style: selectedStyle
      });

      // Activity tracking & gamification
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await logActivity({ activity_type: 'study', count: 1, metadata: { itemCode, action: 'error_song_generated', errorsCount: currentErrors.length } });
        await addPoints(user.id, 'itemReviewed');
      }
      
      toast({
        title: "Chanson générée !",
        description: `Chanson créée à partir de ${currentErrors.length} erreur(s) du quiz`,
        variant: "default"
      });
      
    } catch (error) {
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer la chanson d'erreurs",
        variant: "destructive"
      });
    }
  };

  if (!hasCurrentSession || !currentErrors.length) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
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
    <Card className="border-warning/20 bg-warning/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-warning">
            <Brain className="h-5 w-5" />
            Transformer vos erreurs en chanson
          </CardTitle>
          {stats && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 text-xs">
                <Flame className="h-3 w-3 text-orange-500" />
                {stats.currentStreak ?? 0}j
              </Badge>
              <Badge variant="outline" className="gap-1 text-xs">
                <Star className="h-3 w-3 text-yellow-500" />
                Niv. {stats.level ?? 1}
              </Badge>
            </div>
          )}
        </div>
        <CardDescription className="text-warning/80">
          {currentErrors.length} erreur(s) détectée(s) - Créez une chanson pour mieux les retenir !
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Résumé des erreurs */}
        <div className="bg-card/60 rounded-lg p-4 border border-warning/20">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-warning" />
            <span className="font-medium text-warning">Erreurs à réviser :</span>
          </div>
          <div className="space-y-2">
            {currentErrors.slice(0, 3).map((error, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium text-foreground">Q{index + 1}:</span>
                <span className="text-muted-foreground ml-1">
                  {error.question.substring(0, 60)}...
                </span>
              </div>
            ))}
            {currentErrors.length > 3 && (
              <div className="text-sm text-warning font-medium">
                +{currentErrors.length - 3} autres erreurs
              </div>
            )}
          </div>
        </div>

        {/* Sélection du style */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-warning">
            Style musical
          </label>
          <Select value={selectedStyle} onValueChange={setSelectedStyle}>
            <SelectTrigger className="bg-card/60 border-warning/20">
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
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-warning to-destructive hover:from-warning/90 hover:to-destructive/90 text-warning-foreground"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-warning-foreground border-t-transparent rounded-full" />
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