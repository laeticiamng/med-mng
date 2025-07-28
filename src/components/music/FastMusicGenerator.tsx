import React, { useState } from 'react';
import { Zap, Clock, TrendingUp, Music, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFastMusicGeneration } from '@/hooks/useFastMusicGeneration';

interface FastMusicGeneratorProps {
  onMusicGenerated?: (audioUrl: string, taskId: string) => void;
  className?: string;
}

export const FastMusicGenerator: React.FC<FastMusicGeneratorProps> = ({ 
  onMusicGenerated, 
  className = "" 
}) => {
  const { 
    generateMusic, 
    isGenerating, 
    progress, 
    timeRemaining, 
    audioUrl,
    error,
    isCompleted 
  } = useFastMusicGeneration();
  
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    try {
      const taskId = await generateMusic({
        prompt: prompt,
        title: title || `Musique rapide - ${new Date().toLocaleTimeString()}`,
        tags: 'educational, upbeat, clear vocals',
        rang: 'A'
      });
      
      console.log('🚀 Génération ultra-rapide démarrée:', taskId);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  React.useEffect(() => {
    if (isCompleted && audioUrl && onMusicGenerated) {
      onMusicGenerated(audioUrl, '');
    }
  }, [isCompleted, audioUrl, onMusicGenerated]);

  return (
    <Card className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-bold">
          <Zap className="mr-2" size={24} />
          Génération ULTRA-RAPIDE
          <Badge className="ml-2 bg-yellow-400 text-black text-xs font-bold">
            v4.5 - 2x Plus Rapide
          </Badge>
        </CardTitle>
        <p className="text-sm opacity-90">
          Génération optimisée en 20-60 secondes avec le modèle chirp-v4.5
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Décrivez votre musique ou collez vos paroles..."
            className="text-black"
            rows={3}
          />
          
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de la musique (optionnel)"
            className="w-full p-2 rounded text-black"
          />
        </div>
        
        {isGenerating && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                <Clock size={16} className="mr-1" />
                Temps restant: ~{Math.round(timeRemaining)}s
              </span>
              <span className="font-semibold">{progress.toFixed(0)}%</span>
            </div>
            
            <Progress value={progress} className="w-full" />
            
            <div className="grid grid-cols-3 gap-2 text-xs opacity-80">
              <div className="flex items-center">
                <Zap size={12} className="mr-1" />
                Modèle v4.5
              </div>
              <div className="flex items-center">
                <TrendingUp size={12} className="mr-1" />
                Streaming
              </div>
              <div className="flex items-center">
                <Volume2 size={12} className="mr-1" />
                Priorité haute
              </div>
            </div>
          </div>
        )}
        
        {isCompleted && audioUrl && (
          <div className="p-3 bg-green-100 text-green-800 rounded-lg">
            <div className="flex items-center">
              <Music className="mr-2" size={16} />
              <span className="font-semibold">Musique générée avec succès !</span>
            </div>
            <audio controls className="w-full mt-2" src={audioUrl}>
              Votre navigateur ne supporte pas l'audio.
            </audio>
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-100 text-red-800 rounded-lg">
            <p className="font-semibold">Erreur de génération</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-yellow-400 text-black font-bold hover:bg-yellow-300 disabled:opacity-50 transition-colors"
          size="lg"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center">
              <TrendingUp className="animate-bounce mr-2" size={20} />
              Génération en cours... ({progress.toFixed(0)}%)
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Zap className="mr-2" size={20} />
              Générer en 20-60 secondes
            </span>
          )}
        </Button>
        
        <div className="text-xs opacity-70 text-center">
          🎯 Optimisations actives: Modèle v4.5, Streaming, Polling rapide, Priorité haute
        </div>
      </CardContent>
    </Card>
  );
};