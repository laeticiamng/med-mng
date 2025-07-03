import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Music, AlertTriangle, Heart, Plus } from 'lucide-react';
import { musicStyles } from './MusicStylesData';
import { useToast } from '@/hooks/use-toast';

interface QuizError {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
  theme: string;
}

interface QuizErrorSongGeneratorProps {
  errors: QuizError[];
  itemTitle: string;
  onAddToLibrary: (song: {
    title: string;
    lyrics: string;
    style: string;
    theme: string;
    audioUrl?: string;
  }) => void;
}

export const QuizErrorSongGenerator: React.FC<QuizErrorSongGeneratorProps> = ({
  errors,
  itemTitle,
  onAddToLibrary
}) => {
  const [selectedStyle, setSelectedStyle] = useState('');
  const [customLyrics, setCustomLyrics] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateErrorLyrics = (): string => {
    if (!errors || errors.length === 0) {
      return "Aucune erreur détectée dans ce quiz !\nFélicitations pour vos bonnes réponses !\nContinuez ainsi pour maîtriser tous les concepts.";
    }

    const lyricsParts = [
      `🎵 Erreurs du Quiz ${itemTitle} 🎵`,
      "",
      "Voici les points à réviser pour progresser :"
    ];

    errors.forEach((error, index) => {
      lyricsParts.push(
        "",
        `${index + 1}. ${error.theme}`,
        `Question : ${error.question}`,
        `Votre réponse : ${error.userAnswer}`,
        `Bonne réponse : ${error.correctAnswer}`,
        error.explanation ? `Explication : ${error.explanation}` : ""
      );
    });

    lyricsParts.push(
      "",
      "🎯 Ne vous découragez pas, c'est en apprenant de ses erreurs qu'on progresse !",
      "Révisez ces points et vous maîtriserez parfaitement le sujet !"
    );

    return lyricsParts.filter(line => line !== "").join("\n");
  };

  const handleGenerate = async () => {
    if (!selectedStyle) {
      toast({
        title: "Style musical requis",
        description: "Veuillez sélectionner un style musical",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const lyrics = customLyrics || generateErrorLyrics();
      const songTitle = `Erreurs Quiz ${itemTitle}`;
      
      // Simulation de génération (à remplacer par l'API Suno)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const song = {
        title: songTitle,
        lyrics,
        style: selectedStyle,
        theme: `Quiz Erreurs - ${itemTitle}`,
        audioUrl: undefined // Sera rempli par l'API Suno
      };

      onAddToLibrary(song);
      
      toast({
        title: "Chanson générée !",
        description: `"${songTitle}" a été ajoutée à votre bibliothèque`,
        variant: "default"
      });

    } catch (error) {
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer la chanson. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const previewLyrics = customLyrics || generateErrorLyrics();

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-orange-800">
          <AlertTriangle className="h-6 w-6" />
          Générateur de Chanson d'Erreurs
        </CardTitle>
        <CardDescription>
          Transformez vos erreurs de quiz en chanson pour mieux les retenir !
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Statistiques des erreurs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{errors.length}</div>
            <div className="text-sm text-orange-700">Erreurs détectées</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-blue-600">{new Set(errors.map(e => e.theme)).size}</div>
            <div className="text-sm text-blue-700">Thèmes à réviser</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-green-600">100%</div>
            <div className="text-sm text-green-700">Potentiel d'amélioration</div>
          </div>
        </div>

        {/* Thèmes des erreurs */}
        {errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-orange-800">Thèmes à réviser :</h4>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(errors.map(e => e.theme))).map((theme, index) => (
                <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                  {theme}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Sélection du style musical */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-orange-800">Style musical</label>
          <Select value={selectedStyle} onValueChange={setSelectedStyle}>
            <SelectTrigger>
              <SelectValue placeholder="Choisissez un style musical" />
            </SelectTrigger>
            <SelectContent>
            {musicStyles.map((style) => (
              <SelectItem key={style.value} value={style.value}>
                <div className="flex items-center gap-2">
                  <span>🎵</span>
                  <span>{style.label}</span>
                </div>
              </SelectItem>
            ))}
            </SelectContent>
          </Select>
        </div>

        {/* Aperçu des paroles */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-orange-800">Paroles personnalisées (optionnel)</label>
          <Textarea
            value={customLyrics}
            onChange={(e) => setCustomLyrics(e.target.value)}
            placeholder="Laissez vide pour utiliser les paroles générées automatiquement..."
            rows={4}
            className="border-orange-200 focus:border-orange-400"
          />
        </div>

        {/* Aperçu des paroles générées */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-orange-800">Aperçu des paroles</label>
          <div className="p-4 bg-white rounded-lg border border-orange-200 max-h-40 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {previewLyrics}
            </pre>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-4">
          <Button
            onClick={handleGenerate}
            disabled={!selectedStyle || isGenerating}
            className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                Génération en cours...
              </>
            ) : (
              <>
                <Music className="h-4 w-4 mr-2" />
                Générer la chanson d'erreurs
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              onAddToLibrary({
                title: `Erreurs Quiz ${itemTitle}`,
                lyrics: previewLyrics,
                style: selectedStyle || 'pop',
                theme: `Quiz Erreurs - ${itemTitle}`
              });
              toast({
                title: "Ajouté à la bibliothèque",
                description: "Les paroles ont été sauvegardées",
                variant: "default"
              });
            }}
            className="border-orange-200 text-orange-700 hover:bg-orange-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Sauvegarder les paroles
          </Button>
        </div>

      </CardContent>
    </Card>
  );
};