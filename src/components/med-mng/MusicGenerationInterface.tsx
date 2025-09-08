import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Music, Play, Download, Loader2, Sparkles, BookOpen, Heart } from 'lucide-react';

interface MusicGenerationRequest {
  lyrics: string[];
  style: string;
  duration: number;
  rang: 'A' | 'B' | 'AB';
  itemCode?: string;
  title?: string;
}

interface GenerationResult {
  success: boolean;
  generationId: string;
  audioUrl?: string;
  imageUrl?: string;
  trackId?: string;
  enhancedLyrics?: string;
  error?: string;
}

const musicStyles = [
  { value: 'pop-medical', label: 'Pop Médical', description: 'Mélodique et mémorable' },
  { value: 'rap-educatif', label: 'Rap Éducatif', description: 'Rythmé et informatif' },
  { value: 'folk-academique', label: 'Folk Académique', description: 'Acoustique et narratif' },
  { value: 'electronic-study', label: 'Electronic Study', description: 'Énergique et moderne' },
  { value: 'classical-medical', label: 'Classical Médical', description: 'Sophistiqué et élégant' },
  { value: 'jazz-clinique', label: 'Jazz Clinique', description: 'Improvisé et créatif' }
];

const durations = [
  { value: 60, label: '1 minute', description: 'Révision rapide' },
  { value: 120, label: '2 minutes', description: 'Concept complet' },
  { value: 180, label: '3 minutes', description: 'Étude approfondie' }
];

export const MusicGenerationInterface: React.FC = () => {
  const [formData, setFormData] = useState<MusicGenerationRequest>({
    lyrics: [''],
    style: '',
    duration: 120,
    rang: 'A',
    itemCode: '',
    title: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [quotaInfo, setQuotaInfo] = useState<any>(null);
  
  const { toast } = useToast();

  // Load user quota on component mount
  React.useEffect(() => {
    loadUserQuota();
  }, []);

  const loadUserQuota = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('check_music_generation_quota', {
        user_uuid: user.id
      });

      if (error) throw error;
      setQuotaInfo(data?.[0]);
    } catch (error) {
      console.error('Quota load error:', error);
    }
  };

  const updateFormData = useCallback(<K extends keyof MusicGenerationRequest>(
    key: K, 
    value: MusicGenerationRequest[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const addLyricsLine = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      lyrics: [...prev.lyrics, '']
    }));
  }, []);

  const updateLyricsLine = useCallback((index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      lyrics: prev.lyrics.map((line, i) => i === index ? value : line)
    }));
  }, []);

  const removeLyricsLine = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      lyrics: prev.lyrics.filter((_, i) => i !== index)
    }));
  }, []);

  const simulateProgress = () => {
    setGenerationProgress(0);
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 1000);
    return interval;
  };

  const generateMusic = async () => {
    if (!formData.style || formData.lyrics.filter(l => l.trim()).length === 0) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir le style et au moins une ligne de paroles",
        variant: "destructive"
      });
      return;
    }

    if (!quotaInfo?.can_generate) {
      toast({
        title: "Quota dépassé",
        description: `Quota mensuel atteint (${quotaInfo?.current_usage}/${quotaInfo?.quota_limit})`,
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setResult(null);
    
    const progressInterval = simulateProgress();

    try {
      const { data, error } = await supabase.functions.invoke('secure-music-generation', {
        body: {
          lyrics: formData.lyrics.filter(l => l.trim()),
          style: formData.style,
          duration: formData.duration,
          rang: formData.rang,
          itemCode: formData.itemCode || undefined,
          title: formData.title || undefined
        }
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (error) throw error;

      setResult(data);
      
      if (data.success) {
        toast({
          title: "Musique générée !",
          description: "Votre musique médicale est prête",
        });
        
        // Refresh quota
        await loadUserQuota();
      } else {
        throw new Error(data.error || 'Erreur de génération');
      }

    } catch (error) {
      clearInterval(progressInterval);
      console.error('Generation error:', error);
      
      toast({
        title: "Erreur de génération",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 2000);
    }
  };

  const selectedStyle = musicStyles.find(s => s.value === formData.style);
  const selectedDuration = durations.find(d => d.value === formData.duration);

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-none">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Music className="h-8 w-8 text-blue-600" />
            <Sparkles className="h-6 w-6 text-purple-500" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Générateur de Musique Médicale
          </CardTitle>
          <CardDescription className="text-lg">
            Transformez vos connaissances médicales en mélodies inoubliables
          </CardDescription>
          
          {quotaInfo && (
            <div className="mt-4 p-3 bg-white/80 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Quota mensuel</span>
                <span className="text-blue-600 font-bold">
                  {quotaInfo.current_usage}/{quotaInfo.quota_limit}
                </span>
              </div>
              <Progress 
                value={(quotaInfo.current_usage / quotaInfo.quota_limit) * 100} 
                className="mt-2"
              />
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Informations de base
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Code Item (optionnel)</label>
                  <Input
                    placeholder="ex: IC-123"
                    value={formData.itemCode}
                    onChange={(e) => updateFormData('itemCode', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Titre (optionnel)</label>
                  <Input
                    placeholder="ex: Cardiologie avancée"
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Rang EDN *</label>
                <Select value={formData.rang} onValueChange={(value: 'A' | 'B' | 'AB') => updateFormData('rang', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Rang A - Connaissances de base</SelectItem>
                    <SelectItem value="B">Rang B - Compétences avancées</SelectItem>
                    <SelectItem value="AB">Rang A+B - Complet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lyrics */}
          <Card>
            <CardHeader>
              <CardTitle>Paroles médicales *</CardTitle>
              <CardDescription>
                Saisissez vos connaissances médicales qui seront transformées en paroles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formData.lyrics.map((line, index) => (
                  <div key={index} className="flex gap-2">
                    <Textarea
                      placeholder={`Ligne ${index + 1}...`}
                      value={line}
                      onChange={(e) => updateLyricsLine(index, e.target.value)}
                      className="min-h-[60px]"
                    />
                    {formData.lyrics.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeLyricsLine(index)}
                        className="px-2"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addLyricsLine}
                  className="w-full"
                >
                  + Ajouter une ligne
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Style */}
          <Card>
            <CardHeader>
              <CardTitle>Style musical *</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={formData.style} onValueChange={(value) => updateFormData('style', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un style" />
                </SelectTrigger>
                <SelectContent>
                  {musicStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      <div>
                        <div className="font-medium">{style.label}</div>
                        <div className="text-xs text-muted-foreground">{style.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedStyle && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>{selectedStyle.label}</strong>
                  <p className="text-muted-foreground">{selectedStyle.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Duration */}
          <Card>
            <CardHeader>
              <CardTitle>Durée</CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={formData.duration.toString()} 
                onValueChange={(value) => updateFormData('duration', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((duration) => (
                    <SelectItem key={duration.value} value={duration.value.toString()}>
                      <div>
                        <div className="font-medium">{duration.label}</div>
                        <div className="text-xs text-muted-foreground">{duration.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedDuration && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <Badge variant="secondary">{selectedDuration.label}</Badge>
                  <p className="text-muted-foreground mt-1">{selectedDuration.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={generateMusic}
            disabled={isGenerating || !quotaInfo?.can_generate}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Générer la musique
              </>
            )}
          </Button>

          {/* Progress */}
          {isGenerating && (
            <div className="space-y-2">
              <Progress value={generationProgress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                {generationProgress < 30 ? 'Préparation...' :
                 generationProgress < 60 ? 'Amélioration des paroles...' :
                 generationProgress < 90 ? 'Génération musicale...' :
                 'Finalisation...'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Result */}
      {result && result.success && (
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Heart className="h-5 w-5" />
              Musique générée avec succès !
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.audioUrl && (
              <div className="bg-white p-4 rounded-lg">
                <audio controls className="w-full">
                  <source src={result.audioUrl} type="audio/mpeg" />
                  Votre navigateur ne supporte pas l'élément audio.
                </audio>
                
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4 mr-1" />
                    Écouter
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    Télécharger
                  </Button>
                </div>
              </div>
            )}
            
            {result.enhancedLyrics && (
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium mb-2">Paroles améliorées :</h4>
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {result.enhancedLyrics}
                </pre>
              </div>
            )}
            
            {result.imageUrl && (
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium mb-2">Illustration générée :</h4>
                <img 
                  src={result.imageUrl} 
                  alt="Illustration musicale" 
                  className="max-w-full h-auto rounded"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};