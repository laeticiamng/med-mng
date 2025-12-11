import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Music, 
  Mic, 
  Image, 
  Play, 
  Download,
  Wand2,
  Volume2,
  Palette,
  Sparkles,
  Clock,
  Music2,
  AudioLines,
  Flame,
  Trophy,
  Star
} from 'lucide-react';
import { useContentGeneration, type ContentGenerationRequest } from '@/hooks/useContentGeneration';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const MUSIC_STYLES = [
  { id: 'ambient', label: 'Ambient', description: 'Sons apaisants et atmosphériques' },
  { id: 'classical', label: 'Classique', description: 'Harmonies traditionnelles' },
  { id: 'meditation', label: 'Méditation', description: 'Sons pour la relaxation profonde' },
  { id: 'nature', label: 'Nature', description: 'Sons naturels et organiques' },
  { id: 'electronic', label: 'Électronique', description: 'Synthétiseurs et textures modernes' },
  { id: 'jazz', label: 'Jazz', description: 'Improvisations douces' }
];

const VOICE_STYLES = [
  { id: '9BWtsMINqrJLrRacOk9x', label: 'Aria', description: 'Voix féminine douce et claire' },
  { id: 'EXAVITQu4vr4xnSDxMaL', label: 'Sarah', description: 'Voix professionnelle et chaleureuse' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', label: 'Liam', description: 'Voix masculine calme' },
  { id: 'XB0fDUnXU5powFXDhCwa', label: 'Charlotte', description: 'Voix expressive et engageante' },
  { id: 'pqHfZKP75CvOlQylNhV4', label: 'Bill', description: 'Voix mature et rassurante' }
];

const IMAGE_MOODS = [
  { id: 'serene', label: 'Serein', description: 'Calme et paisible' },
  { id: 'energizing', label: 'Énergisant', description: 'Dynamique et motivant' },
  { id: 'mystical', label: 'Mystique', description: 'Mystérieux et captivant' },
  { id: 'natural', label: 'Naturel', description: 'Paysages naturels' },
  { id: 'abstract', label: 'Abstrait', description: 'Formes et couleurs abstraites' },
  { id: 'cosmic', label: 'Cosmique', description: 'Espace et galaxies' }
];

export const CreativeStudio = () => {
  const { generateContent, isGenerating, progress } = useContentGeneration();
  const { logActivity } = useActivityTracking();
  const { stats, loadStats } = useGamification();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('music');
  const [formData, setFormData] = useState({
    prompt: '',
    style: '',
    mood: 'relaxing',
    voiceId: '9BWtsMINqrJLrRacOk9x',
    duration: 120,
    size: '1024x1024'
  });

  // Load user and gamification stats
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadStats(user.id);
      }
    };
    checkUser();
  }, [loadStats]);

  const handleGenerate = async () => {
    if (!formData.prompt.trim()) return;

    const request: ContentGenerationRequest = {
      type: activeTab as 'music' | 'voice' | 'image',
      prompt: formData.prompt,
      options: {
        style: formData.style,
        mood: formData.mood,
        voiceId: formData.voiceId,
        duration: formData.duration,
        size: formData.size,
        quality: 'hd'
      }
    };

    const result = await generateContent(request);
    if (result) {
      console.log('Contenu généré:', result);
      // Track activity
      logActivity({ 
        activity_type: 'music_generation', 
        metadata: { action: 'creative_studio_generate', type: activeTab } 
      });
      toast.success('Contenu généré avec succès !');
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gradient-text">Studio de Création IA</h1>
        <p className="text-muted-foreground">
          Générez de la musique, des voix et des images d'ambiance avec l'intelligence artificielle
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="music" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Musique
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Voix
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Images
          </TabsTrigger>
        </TabsList>

        {/* Génération de Musique */}
        <TabsContent value="music" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music2 className="h-5 w-5" />
                Générateur Musical IA
              </CardTitle>
              <CardDescription>
                Créez des compositions musicales personnalisées pour vos sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="music-prompt">Description de la musique</Label>
                <Textarea
                  id="music-prompt"
                  placeholder="Décrivez la musique que vous souhaitez : ambiance, instruments, rythme..."
                  value={formData.prompt}
                  onChange={(e) => updateFormData('prompt', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Style musical</Label>
                  <Select value={formData.style} onValueChange={(value) => updateFormData('style', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un style" />
                    </SelectTrigger>
                    <SelectContent>
                      {MUSIC_STYLES.map((style) => (
                        <SelectItem key={style.id} value={style.id}>
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-sm text-muted-foreground">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Durée (secondes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="30"
                    max="300"
                    value={formData.duration}
                    onChange={(e) => updateFormData('duration', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Synthèse Vocale */}
        <TabsContent value="voice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AudioLines className="h-5 w-5" />
                Synthèse Vocale IA
              </CardTitle>
              <CardDescription>
                Créez des narrations et des voix pour vos contenus
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="voice-text">Texte à synthétiser</Label>
                <Textarea
                  id="voice-text"
                  placeholder="Saisissez le texte que vous voulez faire dire par l'IA..."
                  value={formData.prompt}
                  onChange={(e) => updateFormData('prompt', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Voix</Label>
                <Select value={formData.voiceId} onValueChange={(value) => updateFormData('voiceId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une voix" />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICE_STYLES.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div>
                          <div className="font-medium">{voice.label}</div>
                          <div className="text-sm text-muted-foreground">{voice.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  ℹ️ La synthèse vocale utilise ElevenLabs pour créer des voix naturelles et expressives.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Génération d'Images */}
        <TabsContent value="image" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Générateur d'Images IA
              </CardTitle>
              <CardDescription>
                Créez des images d'ambiance pour accompagner vos sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-prompt">Description de l'image</Label>
                <Textarea
                  id="image-prompt"
                  placeholder="Décrivez l'image que vous souhaitez : paysage, ambiance, couleurs..."
                  value={formData.prompt}
                  onChange={(e) => updateFormData('prompt', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ambiance</Label>
                  <Select value={formData.mood} onValueChange={(value) => updateFormData('mood', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une ambiance" />
                    </SelectTrigger>
                    <SelectContent>
                      {IMAGE_MOODS.map((mood) => (
                        <SelectItem key={mood.id} value={mood.id}>
                          <div>
                            <div className="font-medium">{mood.label}</div>
                            <div className="text-sm text-muted-foreground">{mood.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Taille</Label>
                  <Select value={formData.size} onValueChange={(value) => updateFormData('size', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1024x1024">Carré (1024x1024)</SelectItem>
                      <SelectItem value="1792x1024">Paysage (1792x1024)</SelectItem>
                      <SelectItem value="1024x1792">Portrait (1024x1792)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Génération en cours */}
      {isGenerating && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 animate-pulse" />
                <span className="font-medium">Génération en cours...</span>
                <Badge variant="secondary">
                  {activeTab === 'music' ? 'Musique' : activeTab === 'voice' ? 'Voix' : 'Image'}
                </Badge>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {progress < 30 ? 'Initialisation...' : 
                 progress < 70 ? 'Génération IA en cours...' : 
                 'Finalisation...'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bouton de génération */}
      <div className="flex justify-center">
        <Button 
          onClick={handleGenerate}
          disabled={!formData.prompt.trim() || isGenerating}
          size="lg"
          className="gap-2"
        >
          <Sparkles className="h-5 w-5" />
          {isGenerating ? 'Génération...' : 'Générer avec l\'IA'}
        </Button>
      </div>
    </div>
  );
};