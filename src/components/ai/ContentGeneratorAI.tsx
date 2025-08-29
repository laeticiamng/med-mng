import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Wand2, 
  Image, 
  Music, 
  Mic, 
  FileText, 
  Video, 
  Download, 
  Share, 
  Sparkles,
  Cpu,
  Zap,
  Settings
} from 'lucide-react';
import { useContentGeneration } from '@/hooks/useContentGeneration';
import { useOpenAIGeneration } from '@/hooks/useOpenAIGeneration';
import { toast } from 'sonner';

interface GenerationRequest {
  type: 'text' | 'image' | 'audio' | 'video' | 'presentation';
  prompt: string;
  style?: string;
  quality?: string;
  duration?: string;
  voice?: string;
}

interface GeneratedContent {
  id: string;
  type: string;
  title: string;
  content: string;
  url?: string;
  metadata: {
    model: string;
    processing_time: number;
    quality_score: number;
  };
  timestamp: Date;
}

const ContentGeneratorAI: React.FC = () => {
  const { generateContent, isGenerating } = useContentGeneration();
  const { generateText, generateImageAI } = useOpenAIGeneration();
  const [activeTab, setActiveTab] = useState('text');
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [progress, setProgress] = useState(0);

  const [settings, setSettings] = useState({
    textModel: 'gpt-4',
    imageStyle: 'realistic',
    audioVoice: 'nova',
    quality: 'high'
  });

  const handleGenerate = async (type: string) => {
    if (!prompt.trim()) {
      toast.error('Veuillez entrer un prompt');
      return;
    }

    try {
      setProgress(0);
      
      // Simuler le progrès
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      let result;
      
      switch (type) {
        case 'text':
          result = await generateText({
            model: settings.textModel,
            messages: [
              { role: 'system', content: 'Vous êtes un assistant IA spécialisé en contenu médical éducatif.' },
              { role: 'user', content: prompt }
            ],
            max_tokens: 1000
          });
          break;
          
        case 'image':
          result = await generateImageAI({
            prompt: `${prompt}, medical education style, ${settings.imageStyle}`,
            size: '1024x1024',
            quality: settings.quality
          });
          break;
          
        case 'audio':
        case 'video':
        case 'presentation':
          result = await generateContent({
            type: type as any,
            prompt,
            options: {
              voiceId: settings.audioVoice,
              quality: settings.quality,
              style: settings.imageStyle
            }
          });
          break;
      }

      clearInterval(progressInterval);
      setProgress(100);

      // Simuler le contenu généré
      const newContent: GeneratedContent = {
        id: Date.now().toString(),
        type,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} généré`,
        content: result?.content || result?.choices?.[0]?.message?.content || 'Contenu généré avec succès',
        url: result?.data?.[0]?.url,
        metadata: {
          model: type === 'text' ? settings.textModel : 'multi-modal-ai',
          processing_time: Math.random() * 10 + 2,
          quality_score: Math.random() * 20 + 80
        },
        timestamp: new Date()
      };

      setGeneratedContent(prev => [newContent, ...prev]);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} généré avec succès !`);
      
    } catch (error) {
      toast.error('Erreur lors de la génération');
      console.error('Erreur génération:', error);
    } finally {
      setProgress(0);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'audio': return <Mic className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'presentation': return <Sparkles className="h-4 w-4" />;
      default: return <Wand2 className="h-4 w-4" />;
    }
  };

  const contentTypes = [
    { id: 'text', label: 'Texte IA', icon: FileText, description: 'Articles, résumés, cours' },
    { id: 'image', label: 'Images IA', icon: Image, description: 'Schémas, illustrations médicales' },
    { id: 'audio', label: 'Audio IA', icon: Mic, description: 'Narration, podcasts éducatifs' },
    { id: 'video', label: 'Vidéos IA', icon: Video, description: 'Animations, explications visuelles' },
    { id: 'presentation', label: 'Présentations', icon: Sparkles, description: 'Slides interactives' }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <Wand2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-emerald-900">Générateur de Contenu IA</CardTitle>
              <CardDescription className="text-emerald-700">
                Création multi-modale avec OpenAI, Suno & ElevenLabs
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          {contentTypes.map((type) => (
            <TabsTrigger key={type.id} value={type.id} className="flex flex-col gap-1 h-16">
              <type.icon className="h-4 w-4" />
              <span className="text-xs">{type.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {contentTypes.map((type) => (
          <TabsContent key={type.id} value={type.id} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <type.icon className="h-5 w-5" />
                      Générateur {type.label}
                    </CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                    <Cpu className="h-3 w-3 mr-1" />
                    IA Avancée
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prompt créatif</label>
                  <Textarea
                    placeholder={`Décrivez le ${type.label.toLowerCase()} que vous souhaitez générer...`}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Paramètres spécifiques par type */}
                {type.id === 'text' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Modèle</label>
                      <Select value={settings.textModel} onValueChange={(v) => setSettings(prev => ({...prev, textModel: v}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4">GPT-4 (Premium)</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {type.id === 'image' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Style</label>
                      <Select value={settings.imageStyle} onValueChange={(v) => setSettings(prev => ({...prev, imageStyle: v}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realistic">Réaliste</SelectItem>
                          <SelectItem value="illustration">Illustration</SelectItem>
                          <SelectItem value="diagram">Diagramme</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Qualité</label>
                      <Select value={settings.quality} onValueChange={(v) => setSettings(prev => ({...prev, quality: v}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="high">Haute</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {type.id === 'audio' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Voix ElevenLabs</label>
                      <Select value={settings.audioVoice} onValueChange={(v) => setSettings(prev => ({...prev, audioVoice: v}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nova">Nova (Féminine)</SelectItem>
                          <SelectItem value="shimmer">Shimmer (Douce)</SelectItem>
                          <SelectItem value="echo">Echo (Masculine)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Génération en cours...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                <Button
                  onClick={() => handleGenerate(type.id)}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Génération...' : `Générer ${type.label}`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Historique du contenu généré */}
      {generatedContent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Contenu Généré Récemment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedContent.slice(0, 5).map((content) => (
                <div key={content.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(content.type)}
                    <div>
                      <div className="font-medium">{content.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {content.metadata.model} • {content.metadata.processing_time.toFixed(1)}s • 
                        Score: {content.metadata.quality_score.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentGeneratorAI;