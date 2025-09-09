/**
 * 🚀 PAGE MUSIQUE IA PREMIUM
 * Générateur musical intelligent pour l'apprentissage médical
 * ✅ Suno API intégrée via edge functions
 * ✅ Styles musicaux multiples
 * ✅ Interface immersive et intuitive
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Music as MusicIcon, 
  Wand2, 
  Play, 
  Pause, 
  Download,
  Share2,
  Heart,
  Clock,
  Sparkles,
  Loader2,
  Volume2,
  Headphones,
  Mic,
  Radio,
  BookOpen
} from 'lucide-react';

interface GenerationRequest {
  lyrics: string;
  style: string;
  duration: number;
  itemCode?: string;
  model: 'V3_5' | 'V4' | 'V4_5';
}

interface GeneratedTrack {
  id: string;
  audioUrl: string;
  title: string;
  style: string;
  duration: number;
  status: 'generating' | 'completed' | 'failed';
  progress: number;
}

const musicStyles = [
  { value: 'pop', label: 'Pop Médical', description: 'Mélodies accrocheuses et entraînantes', icon: '🎵' },
  { value: 'rap', label: 'Rap Éducatif', description: 'Rythmes rapides pour mémorisation', icon: '🎤' },
  { value: 'classical', label: 'Classique Moderne', description: 'Sophistiqué et méditatif', icon: '🎼' },
  { value: 'electronic', label: 'Électronique Focus', description: 'Beats énergiques pour concentration', icon: '🎧' },
  { value: 'folk', label: 'Folk Académique', description: 'Narratif et storytelling', icon: '🪕' },
  { value: 'jazz', label: 'Jazz Éducatif', description: 'Créatif et improvisé', icon: '🎷' },
  { value: 'rock', label: 'Rock Mémorisation', description: 'Puissant et mémorable', icon: '🎸' },
  { value: 'ambient', label: 'Ambient Study', description: 'Atmosphérique pour étude profonde', icon: '🌟' }
];

const durations = [
  { value: 30, label: '30 secondes', description: 'Concept clé rapide' },
  { value: 60, label: '1 minute', description: 'Résumé complet' },
  { value: 120, label: '2 minutes', description: 'Exploration détaillée' },
  { value: 180, label: '3 minutes', description: 'Apprentissage approfondi' }
];

const aiModels = [
  { value: 'V3_5', label: 'Suno V3.5', description: 'Rapide et efficace' },
  { value: 'V4', label: 'Suno V4', description: 'Qualité premium' },
  { value: 'V4_5', label: 'Suno V4.5', description: 'Intelligence maximale' }
];

const Music = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // États du générateur
  const [lyrics, setLyrics] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('pop');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [selectedModel, setSelectedModel] = useState<'V3_5' | 'V4' | 'V4_5'>('V4');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedTracks, setGeneratedTracks] = useState<GeneratedTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<GeneratedTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Pré-remplissage depuis URL parameters
  useEffect(() => {
    const itemCode = searchParams.get('item');
    if (itemCode) {
      // Pré-remplir avec des paroles basées sur l'item EDN
      setLyrics(`Voici l'item ${itemCode} à retenir,
Ses concepts vont t'aider à réussir,
Chaque notion doit être maîtrisée,
Pour l'EDN être bien préparé.`);
      
      toast({
        title: "🎵 Item EDN détecté",
        description: `Génération musicale pré-configurée pour ${itemCode}`,
      });
    }
  }, [searchParams, toast]);

  // Chargement des tracks existantes
  useEffect(() => {
    const loadUserTracks = async () => {
      try {
        const { data: tracks, error } = await supabase
          .from('user_generated_music')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        if (tracks) {
          const formattedTracks: GeneratedTrack[] = tracks.map(track => ({
            id: track.id,
            audioUrl: track.audio_url,
            title: track.title,
            style: track.music_style || 'pop',
            duration: 60, // durée par défaut
            status: 'completed',
            progress: 100
          }));

          setGeneratedTracks(formattedTracks);
        }
      } catch (error) {
        console.error('Erreur chargement tracks:', error);
      }
    };

    loadUserTracks();
  }, []);

  // Génération de musique via edge function Suno
  const handleGenerate = async () => {
    if (!lyrics.trim()) {
      toast({
        title: "❌ Paroles requises",
        description: "Veuillez saisir des paroles pour générer la musique",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationProgress(0);

      // Simulation du progrès
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      toast({
        title: "🎵 Génération démarrée",
        description: `Création d'une musique ${selectedStyle} avec Suno AI`,
      });

      // Appel à l'edge function Suno
      const { data, error } = await supabase.functions.invoke('suno-music-optimized', {
        body: {
          lyrics: lyrics.trim(),
          style: selectedStyle,
          duration: selectedDuration,
          model: selectedModel,
          language: 'français',
          isComposition: false
        }
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (error) throw error;

      if (data?.success && data.audioUrl) {
        const newTrack: GeneratedTrack = {
          id: Date.now().toString(),
          audioUrl: data.audioUrl,
          title: `Musique ${selectedStyle} - ${new Date().toLocaleTimeString()}`,
          style: selectedStyle,
          duration: selectedDuration,
          status: 'completed',
          progress: 100
        };

        setGeneratedTracks(prev => [newTrack, ...prev]);
        setCurrentTrack(newTrack);

        toast({
          title: "✅ Musique générée !",
          description: `Votre ${selectedStyle} de ${selectedDuration}s est prêt`,
        });

        // Sauvegarder en base
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('user_generated_music').insert({
              title: newTrack.title,
              audio_url: newTrack.audioUrl,
              music_style: newTrack.style,
              rang: 'A',
              music_id: data.trackId || 'generated',
              item_code: searchParams.get('item') || '',
              user_id: user.id
            });
          }
        } catch (saveError) {
          console.error('Erreur sauvegarde:', saveError);
        }

      } else {
        throw new Error(data?.message || 'Échec de la génération');
      }

    } catch (error) {
      console.error('Erreur génération:', error);
      toast({
        title: "❌ Erreur génération",
        description: "Impossible de générer la musique. Réessayez.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handlePlay = (track: GeneratedTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  return (
    <ConsistentBackground variant="primary">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Générateur Musical IA"
          subtitle="Créez des chansons éducatives personnalisées avec Suno AI"
          icon={MusicIcon}
          showBackButton
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de génération */}
          <div className="lg:col-span-2 space-y-6">
            {/* Configuration du style */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Style Musical
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {musicStyles.map((style) => (
                    <Button
                      key={style.value}
                      variant={selectedStyle === style.value ? "default" : "outline"}
                      className="h-auto p-3 flex flex-col items-center gap-2"
                      onClick={() => setSelectedStyle(style.value)}
                    >
                      <span className="text-2xl">{style.icon}</span>
                      <span className="text-xs font-medium">{style.label}</span>
                    </Button>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {musicStyles.find(s => s.value === selectedStyle)?.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Paroles et paramètres */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Paroles & Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Paroles de la chanson</label>
                  <Textarea
                    placeholder="Saisissez les paroles de votre chanson éducative..."
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {lyrics.length} caractères • Recommandé : 200-500 caractères
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Durée</label>
                    <Select value={selectedDuration.toString()} onValueChange={(v) => setSelectedDuration(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {durations.map((duration) => (
                          <SelectItem key={duration.value} value={duration.value.toString()}>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{duration.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Modèle IA</label>
                    <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as 'V3_5' | 'V4' | 'V4_5')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {aiModels.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || !lyrics.trim()}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
                </div>

                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progression de la génération</span>
                      <span>{Math.round(generationProgress)}%</span>
                    </div>
                    <Progress value={generationProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      L'IA Suno compose votre musique personnalisée...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panel des résultats */}
          <div className="space-y-6">
            {/* Lecteur actuel */}
            {currentTrack && (
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Headphones className="h-5 w-5" />
                    Lecture en cours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">{currentTrack.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary">{currentTrack.style}</Badge>
                      <Clock className="h-3 w-3" />
                      <span>{currentTrack.duration}s</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={isPlaying ? "secondary" : "default"}
                      onClick={() => isPlaying ? handlePause() : handlePlay(currentTrack)}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    
                    <Button size="sm" variant="outline">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Simulation d'un player audio */}
                  <div className="bg-black/10 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>00:00</span>
                      <span>{Math.floor(currentTrack.duration / 60)}:{(currentTrack.duration % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <Progress value={isPlaying ? 45 : 0} className="h-1" />
                    <div className="flex items-center justify-center">
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Historique des générations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-5 w-5" />
                  Vos Créations ({generatedTracks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedTracks.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {generatedTracks.map((track) => (
                      <div
                        key={track.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          currentTrack?.id === track.id 
                            ? 'bg-primary/10 border-primary/30' 
                            : 'bg-muted/30 hover:bg-muted/50'
                        }`}
                        onClick={() => handlePlay(track)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{track.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{track.style}</Badge>
                              <span className="text-xs text-muted-foreground">{track.duration}s</span>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="shrink-0">
                            <Play className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MusicIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Aucune création pour le moment</p>
                    <p className="text-xs">Générez votre première chanson !</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Suggestions et tips */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5" />
                  Conseils Pro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span>💡</span>
                  <span>Utilisez des rimes pour une meilleure mémorisation</span>
                </div>
                <div className="flex gap-2">
                  <span>🎵</span>
                  <span>Le style Rap est idéal pour les listes et classifications</span>
                </div>
                <div className="flex gap-2">
                  <span>⏱️</span>
                  <span>60s est parfait pour résumer un concept médical</span>
                </div>
                <div className="flex gap-2">
                  <span>🧠</span>
                  <span>Répétez les mots-clés pour ancrer la mémoire</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to action */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">🎼 Explorez Plus de Fonctionnalités</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Découvrez notre bibliothèque de musiques EDN pré-générées et nos outils d'apprentissage avancés
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate('/edn-production')}>
                  <BookOpen className="h-5 w-5 mr-2" />
                  Explorer les Items EDN
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/med-mng/library')}>
                  <MusicIcon className="h-5 w-5 mr-2" />
                  Ma Bibliothèque
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ConsistentBackground>
  );
};

export default Music;