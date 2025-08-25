import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Wand2, 
  FileText, 
  Music, 
  Image, 
  Video, 
  Sparkles,
  Download,
  Share2,
  Save,
  Copy,
  RefreshCw,
  Play,
  Pause,
  Volume2,
  Eye,
  Edit,
  Trash2,
  Heart,
  Clock,
  Users,
  TrendingUp,
  Zap,
  BookOpen,
  Stethoscope,
  Brain,
  Settings,
  Upload,
  History,
  Star,
  Globe,
  MessageSquare,
  ChevronDown,
  Filter,
  Search,
  Grid,
  List
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GenerationRequest {
  id: string;
  type: 'text' | 'music' | 'image' | 'video' | 'quiz' | 'scenario';
  prompt: string;
  parameters: Record<string, any>;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  result?: any;
  createdAt: Date;
  progress: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
  type: string;
  prompt: string;
  parameters: Record<string, any>;
  category: string;
  featured: boolean;
  usage: number;
}

export const AIContentGenerator = () => {
  const [activeRequest, setActiveRequest] = useState<GenerationRequest | null>(null);
  const [generationHistory, setGenerationHistory] = useState<GenerationRequest[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuration avancée pour chaque type de contenu
  const [textConfig, setTextConfig] = useState({
    model: 'gpt-5-2025-08-07',
    maxTokens: 2000,
    temperature: 0.7,
    topP: 0.9,
    frequencyPenalty: 0,
    presencePenalty: 0,
    style: 'medical',
    tone: 'professional',
    audience: 'medical-students',
    structure: 'structured',
    citations: true,
    language: 'fr'
  });

  const [musicConfig, setMusicConfig] = useState({
    duration: 120,
    style: 'educational-pop',
    tempo: 'moderate',
    key: 'C-major',
    instruments: ['piano', 'guitar', 'strings'],
    vocals: true,
    lyrics: true,
    format: 'mp3',
    quality: 'high'
  });

  const [imageConfig, setImageConfig] = useState({
    style: 'medical-illustration',
    size: '1024x1024',
    quality: 'hd',
    format: 'png',
    background: 'white',
    colors: 'professional',
    elements: [],
    annotations: true
  });

  const [videoConfig, setVideoConfig] = useState({
    duration: 60,
    resolution: '1920x1080',
    fps: 30,
    style: 'educational',
    voiceover: true,
    subtitles: true,
    transitions: 'smooth',
    format: 'mp4'
  });

  // Templates prédéfinis
  const templates: Template[] = [
    {
      id: '1',
      name: 'Cours de Cardiologie',
      description: 'Génère un cours structuré sur un sujet de cardiologie',
      type: 'text',
      prompt: 'Créez un cours médical complet sur {topic} en cardiologie, incluant : anatomie, physiopathologie, diagnostic, traitement et prévention. Structurez avec des titres clairs et des points clés.',
      parameters: { audience: 'medical-students', length: 'comprehensive' },
      category: 'medical',
      featured: true,
      usage: 145
    },
    {
      id: '2',
      name: 'Chanson Mnémotechnique',
      description: 'Crée une chanson pour mémoriser des informations médicales',
      type: 'music',
      prompt: 'Composez une chanson éducative et mémorable sur {topic} avec des paroles qui aident à retenir les informations clés.',
      parameters: { style: 'catchy', duration: 90 },
      category: 'educational',
      featured: true,
      usage: 89
    },
    {
      id: '3',
      name: 'Schéma Anatomique',
      description: 'Génère un schéma anatomique détaillé et annoté',
      type: 'image',
      prompt: 'Créez un schéma anatomique précis et éducatif de {organ} avec annotations claires et légendes médicales.',
      parameters: { style: 'medical-diagram', annotations: true },
      category: 'anatomy',
      featured: true,
      usage: 67
    },
    {
      id: '4',
      name: 'Vidéo Pédagogique',
      description: 'Produit une vidéo explicative sur un concept médical',
      type: 'video',
      prompt: 'Créez une vidéo pédagogique de {duration} secondes expliquant {concept} avec animations et narration claire.',
      parameters: { style: 'educational', quality: 'high' },
      category: 'educational',
      featured: true,
      usage: 45
    },
    {
      id: '5',
      name: 'Quiz Interactif',
      description: 'Génère un quiz avec questions à choix multiples',
      type: 'quiz',
      prompt: 'Créez un quiz médical sur {topic} avec 10 questions QCM, explications détaillées et niveau de difficulté {level}.',
      parameters: { questions: 10, difficulty: 'intermediate' },
      category: 'assessment',
      featured: false,
      usage: 78
    },
    {
      id: '6',
      name: 'Cas Clinique Immersif',
      description: 'Développe un scénario clinique interactif',
      type: 'scenario',
      prompt: 'Développez un cas clinique immersif sur {pathology} avec patient virtuel, anamnèse, examen clinique et prise de décision.',
      parameters: { complexity: 'advanced', interactive: true },
      category: 'clinical',
      featured: true,
      usage: 123
    }
  ];

  const categories = [
    { id: 'all', name: 'Tous', count: templates.length },
    { id: 'medical', name: 'Médical', count: templates.filter(t => t.category === 'medical').length },
    { id: 'educational', name: 'Éducatif', count: templates.filter(t => t.category === 'educational').length },
    { id: 'anatomy', name: 'Anatomie', count: templates.filter(t => t.category === 'anatomy').length },
    { id: 'clinical', name: 'Clinique', count: templates.filter(t => t.category === 'clinical').length },
    { id: 'assessment', name: 'Évaluation', count: templates.filter(t => t.category === 'assessment').length }
  ];

  const generateContent = async (type: string, prompt: string, config: any) => {
    const request: GenerationRequest = {
      id: Date.now().toString(),
      type: type as any,
      prompt,
      parameters: config,
      status: 'generating',
      createdAt: new Date(),
      progress: 0
    };

    setActiveRequest(request);
    setGenerationHistory(prev => [request, ...prev]);

    try {
      // Simulation de génération avec progression
      const progressInterval = setInterval(() => {
        setActiveRequest(prev => {
          if (!prev) return null;
          const newProgress = Math.min(prev.progress + Math.random() * 20, 95);
          return { ...prev, progress: newProgress };
        });
      }, 500);

      // Appel à l'API selon le type
      let result;
      switch (type) {
        case 'text':
          result = await generateText(prompt, config);
          break;
        case 'music':
          result = await generateMusic(prompt, config);
          break;
        case 'image':
          result = await generateImage(prompt, config);
          break;
        case 'video':
          result = await generateVideo(prompt, config);
          break;
        case 'quiz':
          result = await generateQuiz(prompt, config);
          break;
        case 'scenario':
          result = await generateScenario(prompt, config);
          break;
        default:
          throw new Error('Type de contenu non supporté');
      }

      clearInterval(progressInterval);

      const completedRequest = {
        ...request,
        status: 'completed' as const,
        progress: 100,
        result
      };

      setActiveRequest(completedRequest);
      setGenerationHistory(prev => 
        prev.map(r => r.id === request.id ? completedRequest : r)
      );

      toast({
        title: "Génération terminée !",
        description: `Votre ${type} a été généré avec succès.`,
      });

    } catch (error) {
      const failedRequest = {
        ...request,
        status: 'failed' as const,
        progress: 0
      };

      setActiveRequest(failedRequest);
      setGenerationHistory(prev => 
        prev.map(r => r.id === request.id ? failedRequest : r)
      );

      toast({
        title: "Erreur de génération",
        description: "Une erreur est survenue lors de la génération.",
        variant: "destructive"
      });
    }
  };

  // Fonctions de génération simulées (à remplacer par de vraies API calls)
  const generateText = async (prompt: string, config: any) => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return {
      content: `Contenu médical généré basé sur: "${prompt}"\n\nCeci est un exemple de contenu généré avec les paramètres: ${JSON.stringify(config, null, 2)}`,
      wordCount: 250,
      readingTime: 2,
      quality: 'high'
    };
  };

  const generateMusic = async (prompt: string, config: any) => {
    await new Promise(resolve => setTimeout(resolve, 5000));
    return {
      audioUrl: '/api/generated-music/example.mp3',
      duration: config.duration,
      waveform: Array.from({length: 100}, () => Math.random()),
      lyrics: ['Voici une chanson éducative', 'Pour apprendre la médecine', 'Avec mélodie et rythme'],
      metadata: { title: 'Chanson Générée', artist: 'AI Composer' }
    };
  };

  const generateImage = async (prompt: string, config: any) => {
    await new Promise(resolve => setTimeout(resolve, 4000));
    return {
      imageUrl: '/api/generated-images/example.png',
      width: parseInt(config.size.split('x')[0]),
      height: parseInt(config.size.split('x')[1]),
      format: config.format,
      elements: ['anatomical-structure', 'labels', 'annotations']
    };
  };

  const generateVideo = async (prompt: string, config: any) => {
    await new Promise(resolve => setTimeout(resolve, 8000));
    return {
      videoUrl: '/api/generated-videos/example.mp4',
      duration: config.duration,
      resolution: config.resolution,
      frames: config.duration * config.fps,
      thumbnail: '/api/generated-videos/thumbnail.jpg'
    };
  };

  const generateQuiz = async (prompt: string, config: any) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      questions: Array.from({length: config.questions || 5}, (_, i) => ({
        id: i + 1,
        question: `Question ${i + 1} générée sur le sujet: ${prompt}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct: Math.floor(Math.random() * 4),
        explanation: `Explication détaillée pour la question ${i + 1}`
      })),
      difficulty: config.difficulty,
      estimatedTime: (config.questions || 5) * 2
    };
  };

  const generateScenario = async (prompt: string, config: any) => {
    await new Promise(resolve => setTimeout(resolve, 6000));
    return {
      title: `Cas clinique: ${prompt}`,
      patient: {
        age: Math.floor(Math.random() * 60) + 20,
        gender: Math.random() > 0.5 ? 'M' : 'F',
        symptoms: ['Symptôme 1', 'Symptôme 2', 'Symptôme 3']
      },
      stages: [
        { id: 1, name: 'Anamnèse', content: 'Histoire de la maladie...' },
        { id: 2, name: 'Examen clinique', content: 'Signes observés...' },
        { id: 3, name: 'Examens complémentaires', content: 'Résultats des examens...' },
        { id: 4, name: 'Diagnostic', content: 'Diagnostic différentiel...' },
        { id: 5, name: 'Traitement', content: 'Plan thérapeutique...' }
      ],
      learningObjectives: ['Objectif 1', 'Objectif 2', 'Objectif 3']
    };
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleSaveGeneration = async (request: GenerationRequest) => {
    try {
      // Sauvegarder localement pour l'instant
      const savedGenerations = JSON.parse(localStorage.getItem('saved-generations') || '[]');
      savedGenerations.push({
        ...request,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem('saved-generations', JSON.stringify(savedGenerations));

      toast({
        title: "Sauvegardé !",
        description: "Votre génération a été sauvegardée.",
      });
    } catch (error) {
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder la génération.",
        variant: "destructive"
      });
    }
  };

  const handleExport = (request: GenerationRequest, format: string) => {
    // Logic pour exporter dans différents formats
    const data = JSON.stringify(request.result, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generation-${request.id}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header avec recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Générateur IA Avancé</h2>
          <p className="text-muted-foreground">Créez du contenu médical personnalisé avec l'intelligence artificielle</p>
        </div>
        
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un template..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Templates et configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Templates de Génération
              </CardTitle>
              <CardDescription>
                Choisissez un template ou créez votre propre prompt personnalisé
              </CardDescription>
            </CardHeader>
            <CardContent>
              {viewMode === 'grid' ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredTemplates.map((template) => (
                    <Card 
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate?.id === template.id ? 'ring-2 ring-purple-500' : ''
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {template.type === 'text' && <FileText className="h-4 w-4 text-blue-600" />}
                            {template.type === 'music' && <Music className="h-4 w-4 text-amber-600" />}
                            {template.type === 'image' && <Image className="h-4 w-4 text-green-600" />}
                            {template.type === 'video' && <Video className="h-4 w-4 text-purple-600" />}
                            {template.type === 'quiz' && <Brain className="h-4 w-4 text-red-600" />}
                            {template.type === 'scenario' && <Stethoscope className="h-4 w-4 text-indigo-600" />}
                            <span className="font-medium text-sm">{template.name}</span>
                          </div>
                          {template.featured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {template.usage}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                        selectedTemplate?.id === template.id ? 'bg-purple-50 border-purple-200' : ''
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      {template.type === 'text' && <FileText className="h-5 w-5 text-blue-600" />}
                      {template.type === 'music' && <Music className="h-5 w-5 text-amber-600" />}
                      {template.type === 'image' && <Image className="h-5 w-5 text-green-600" />}
                      {template.type === 'video' && <Video className="h-5 w-5 text-purple-600" />}
                      {template.type === 'quiz' && <Brain className="h-5 w-5 text-red-600" />}
                      {template.type === 'scenario' && <Stethoscope className="h-5 w-5 text-indigo-600" />}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{template.name}</span>
                          {template.featured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{template.category}</Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {template.usage}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuration avancée */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  Configuration Avancée
                </CardTitle>
                <CardDescription>
                  Personnalisez les paramètres de génération pour {selectedTemplate.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basique</TabsTrigger>
                    <TabsTrigger value="advanced">Avancé</TabsTrigger>
                    <TabsTrigger value="expert">Expert</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="custom-prompt">Prompt personnalisé</Label>
                      <Textarea
                        id="custom-prompt"
                        placeholder={selectedTemplate.prompt}
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    {selectedTemplate.type === 'text' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Public cible</Label>
                          <Select value={textConfig.audience} onValueChange={(value) => setTextConfig(prev => ({...prev, audience: value}))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="medical-students">Étudiants en médecine</SelectItem>
                              <SelectItem value="residents">Internes</SelectItem>
                              <SelectItem value="doctors">Médecins</SelectItem>
                              <SelectItem value="specialists">Spécialistes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Style d'écriture</Label>
                          <Select value={textConfig.style} onValueChange={(value) => setTextConfig(prev => ({...prev, style: value}))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="medical">Médical</SelectItem>
                              <SelectItem value="academic">Académique</SelectItem>
                              <SelectItem value="simplified">Simplifié</SelectItem>
                              <SelectItem value="detailed">Détaillé</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                    
                    {selectedTemplate.type === 'music' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Durée (secondes)</Label>
                          <Slider
                            value={[musicConfig.duration]}
                            onValueChange={([value]) => setMusicConfig(prev => ({...prev, duration: value}))}
                            max={300}
                            step={30}
                            className="w-full"
                          />
                          <div className="text-sm text-muted-foreground">
                            {Math.floor(musicConfig.duration / 60)}:{(musicConfig.duration % 60).toString().padStart(2, '0')}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Style musical</Label>
                          <Select value={musicConfig.style} onValueChange={(value) => setMusicConfig(prev => ({...prev, style: value}))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="educational-pop">Pop éducatif</SelectItem>
                              <SelectItem value="classical">Classique</SelectItem>
                              <SelectItem value="folk">Folk</SelectItem>
                              <SelectItem value="rap">Rap éducatif</SelectItem>
                              <SelectItem value="jazz">Jazz</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="advanced" className="space-y-4">
                    {selectedTemplate.type === 'text' && (
                      <>
                        <div className="space-y-2">
                          <Label>Créativité</Label>
                          <Slider
                            value={[textConfig.temperature * 100]}
                            onValueChange={([value]) => setTextConfig(prev => ({...prev, temperature: value / 100}))}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Conservateur</span>
                            <span>{Math.round(textConfig.temperature * 100)}%</span>
                            <span>Créatif</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Longueur maximale (tokens)</Label>
                          <Input
                            type="number"
                            value={textConfig.maxTokens}
                            onChange={(e) => setTextConfig(prev => ({...prev, maxTokens: parseInt(e.target.value)}))}
                            min="100"
                            max="4000"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={textConfig.citations}
                            onCheckedChange={(checked) => setTextConfig(prev => ({...prev, citations: checked}))}
                          />
                          <Label>Inclure des citations médicales</Label>
                        </div>
                      </>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="expert" className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Mode Expert</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        Ces paramètres avancés sont destinés aux utilisateurs expérimentés. 
                        Une mauvaise configuration peut affecter la qualité du contenu généré.
                      </p>
                    </div>
                    
                    {selectedTemplate.type === 'text' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Top P</Label>
                            <Input
                              type="number"
                              value={textConfig.topP}
                              onChange={(e) => setTextConfig(prev => ({...prev, topP: parseFloat(e.target.value)}))}
                              step="0.1"
                              min="0"
                              max="1"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Frequency Penalty</Label>
                            <Input
                              type="number"
                              value={textConfig.frequencyPenalty}
                              onChange={(e) => setTextConfig(prev => ({...prev, frequencyPenalty: parseFloat(e.target.value)}))}
                              step="0.1"
                              min="-2"
                              max="2"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Modèle IA</Label>
                          <Select value={textConfig.model} onValueChange={(value) => setTextConfig(prev => ({...prev, model: value}))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gpt-5-2025-08-07">GPT-5 (Recommandé)</SelectItem>
                              <SelectItem value="gpt-4.1-2025-04-14">GPT-4.1</SelectItem>
                              <SelectItem value="gpt-5-mini-2025-08-07">GPT-5 Mini (Rapide)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => selectedTemplate && generateContent(selectedTemplate.type, selectedTemplate.prompt, 
                      selectedTemplate.type === 'text' ? textConfig : 
                      selectedTemplate.type === 'music' ? musicConfig :
                      selectedTemplate.type === 'image' ? imageConfig : videoConfig
                    )}
                    disabled={!!activeRequest && activeRequest.status === 'generating'}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {activeRequest && activeRequest.status === 'generating' ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Générer le contenu
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Importer
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".txt,.md,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Logic pour traiter le fichier importé
                        toast({
                          title: "Fichier importé",
                          description: `${file.name} a été importé avec succès.`,
                        });
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar avec historique et résultats */}
        <div className="space-y-6">
          {/* Génération active */}
          {activeRequest && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Génération en cours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  {activeRequest.type === 'text' && <FileText className="h-5 w-5 text-blue-600" />}
                  {activeRequest.type === 'music' && <Music className="h-5 w-5 text-amber-600" />}
                  {activeRequest.type === 'image' && <Image className="h-5 w-5 text-green-600" />}
                  {activeRequest.type === 'video' && <Video className="h-5 w-5 text-purple-600" />}
                  {activeRequest.type === 'quiz' && <Brain className="h-5 w-5 text-red-600" />}
                  {activeRequest.type === 'scenario' && <Stethoscope className="h-5 w-5 text-indigo-600" />}
                  <div>
                    <div className="font-medium capitalize">{activeRequest.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {activeRequest.status === 'generating' ? 'En cours...' : 
                       activeRequest.status === 'completed' ? 'Terminé' : 
                       activeRequest.status === 'failed' ? 'Échoué' : 'En attente'}
                    </div>
                  </div>
                </div>
                
                {activeRequest.status === 'generating' && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progression</span>
                      <span>{Math.round(activeRequest.progress)}%</span>
                    </div>
                    <Progress value={activeRequest.progress} className="h-2" />
                  </div>
                )}
                
                {activeRequest.status === 'completed' && activeRequest.result && (
                  <div className="space-y-3">
                    {/* Aperçu du résultat selon le type */}
                    {activeRequest.type === 'text' && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium mb-2">Contenu généré</div>
                        <div className="text-sm text-muted-foreground line-clamp-3">
                          {activeRequest.result.content}
                        </div>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{activeRequest.result.wordCount} mots</span>
                          <span>{activeRequest.result.readingTime} min de lecture</span>
                        </div>
                      </div>
                    )}
                    
                    {activeRequest.type === 'music' && (
                      <div className="p-3 bg-amber-50 rounded-lg">
                        <div className="text-sm font-medium mb-2">Musique générée</div>
                        <div className="flex items-center gap-2 mb-2">
                          <Button size="sm" variant="outline">
                            <Play className="h-3 w-3 mr-1" />
                            Écouter
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            {Math.floor(activeRequest.result.duration / 60)}:
                            {(activeRequest.result.duration % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                        <div className="h-12 bg-gradient-to-r from-amber-200 to-amber-300 rounded flex items-center justify-center">
                          <Volume2 className="h-4 w-4 text-amber-700" />
                        </div>
                      </div>
                    )}
                    
                    {activeRequest.type === 'image' && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-sm font-medium mb-2">Image générée</div>
                        <div className="h-32 bg-gradient-to-br from-green-200 to-green-300 rounded flex items-center justify-center">
                          <Image className="h-8 w-8 text-green-700" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {activeRequest.result.width} × {activeRequest.result.height} • {activeRequest.result.format.toUpperCase()}
                        </div>
                      </div>
                    )}
                    
                    {activeRequest.type === 'quiz' && (
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="text-sm font-medium mb-2">Quiz généré</div>
                        <div className="space-y-2">
                          <div className="text-sm">
                            {activeRequest.result.questions.length} questions
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Temps estimé: {activeRequest.result.estimatedTime} minutes
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Niveau: {activeRequest.result.difficulty}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveGeneration(activeRequest)}>
                        <Save className="h-3 w-3 mr-1" />
                        Sauvegarder
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleExport(activeRequest, 'json')}>
                        <Download className="h-3 w-3 mr-1" />
                        Exporter
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-3 w-3 mr-1" />
                        Partager
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Historique */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-4 w-4" />
                Historique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {generationHistory.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                    {request.type === 'text' && <FileText className="h-4 w-4 text-blue-600" />}
                    {request.type === 'music' && <Music className="h-4 w-4 text-amber-600" />}
                    {request.type === 'image' && <Image className="h-4 w-4 text-green-600" />}
                    {request.type === 'video' && <Video className="h-4 w-4 text-purple-600" />}
                    {request.type === 'quiz' && <Brain className="h-4 w-4 text-red-600" />}
                    {request.type === 'scenario' && <Stethoscope className="h-4 w-4 text-indigo-600" />}
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium capitalize">{request.type}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {request.prompt.substring(0, 50)}...
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {request.createdAt.toLocaleTimeString()}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      {request.status === 'completed' && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => setActiveRequest(request)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Heart className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                
                {generationHistory.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune génération récente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Générations aujourd'hui</span>
                <Badge variant="outline">{generationHistory.filter(r => 
                  r.createdAt.toDateString() === new Date().toDateString()
                ).length}/20</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Contenu créé</span>
                <Badge variant="outline">{generationHistory.filter(r => r.status === 'completed').length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Templates utilisés</span>
                <Badge variant="outline">{new Set(generationHistory.map(r => r.type)).size}</Badge>
              </div>
              <Progress value={30} className="h-2" />
              <p className="text-xs text-muted-foreground">
                30% de votre quota mensuel utilisé
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};