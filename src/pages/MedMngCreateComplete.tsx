// Complete MED-MNG Create Page with all features
import React from "react";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Music, 
  Play, 
  Pause, 
  Volume2, 
  Download, 
  Share, 
  Heart,
  Settings,
  Mic,
  Headphones,
  Waveform,
  Sparkles,
  Brain,
  Target,
  Clock,
  Users,
  Palette,
  Shuffle,
  RotateCcw,
  Save,
  Upload,
  FileText,
  Lightbulb,
  Zap,
  Award,
  Star,
  TrendingUp,
  BarChart3,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  RefreshCw
} from "lucide-react";
import { useNavAction } from "@/hooks/useNavAction";
import { analytics } from "@/lib/analytics";
import { t } from "@/lib/i18n/keys";
import { toast } from "@/components/ui/use-toast";

// Mock data for generation options
const mockGenres = [
  { id: "pop", name: "Pop Médical", description: "Catchy et mémorable" },
  { id: "rock", name: "Rock Éducatif", description: "Énergique et motivant" },
  { id: "rap", name: "Rap Pédagogique", description: "Rythmé et précis" },
  { id: "folk", name: "Folk Académique", description: "Doux et narratif" },
  { id: "electronic", name: "Électro Mnémotechnique", description: "Moderne et accrocheur" },
  { id: "jazz", name: "Jazz Médical", description: "Sophistiqué et créatif" }
];

const mockMoods = [
  { id: "energetic", name: "Énergique", emoji: "⚡", color: "bg-yellow-100 text-yellow-800" },
  { id: "calm", name: "Calme", emoji: "🌊", color: "bg-blue-100 text-blue-800" },
  { id: "focused", name: "Concentré", emoji: "🎯", color: "bg-green-100 text-green-800" },
  { id: "motivational", name: "Motivant", emoji: "🚀", color: "bg-orange-100 text-orange-800" },
  { id: "relaxed", name: "Détendu", emoji: "😌", color: "bg-purple-100 text-purple-800" },
  { id: "intense", name: "Intense", emoji: "🔥", color: "bg-red-100 text-red-800" }
];

const mockTemplates = [
  {
    id: "anatomy-song",
    name: "Chanson d'Anatomie",
    description: "Structure pour mémoriser les éléments anatomiques",
    category: "Anatomie",
    structure: ["Introduction", "Couplet 1: Localisation", "Refrain: Fonction", "Couplet 2: Relations", "Pont: Pathologies", "Refrain final"],
    example: "Os du crâne, frontal, pariétal..."
  },
  {
    id: "pathology-rap",
    name: "Rap de Pathologie",
    description: "Format rap pour les mécanismes pathologiques",
    category: "Pathologie",
    structure: ["Intro: Définition", "Verse 1: Étiologie", "Chorus: Symptômes", "Verse 2: Diagnostic", "Bridge: Traitement", "Outro: Pronostic"],
    example: "L'infarctus c'est l'occlusion, artère coronaire en fusion..."
  },
  {
    id: "pharmacology-ballad",
    name: "Ballade Pharmacologique",
    description: "Mélodie douce pour retenir les médicaments",
    category: "Pharmacologie",
    structure: ["Verse 1: Indication", "Chorus: Posologie", "Verse 2: Mécanisme", "Chorus: Posologie", "Bridge: Effets secondaires", "Final Chorus"],
    example: "Aspirine à faible dose, pour le cœur qui se repose..."
  }
];

const mockEdnItems = [
  { id: "IC-290", title: "Épidémiologie et prévention des cancers", category: "Oncologie" },
  { id: "IC-331", title: "Arrêt cardio-circulatoire", category: "Urgences" },
  { id: "IC-360", title: "Pneumothorax", category: "Pneumologie" },
  { id: "IC-91", title: "Déficit neurologique récent", category: "Neurologie" }
];

export default function MedMngCreateComplete() {
  const executeAction = useNavAction();
  
  // Form states
  const [formData, setFormData] = React.useState({
    title: "",
    medicalContent: "",
    selectedEdn: "",
    genre: "",
    mood: "",
    template: "",
    duration: [180], // 3 minutes default
    tempo: [120], // BPM
    useAI: true,
    includeChorus: true,
    includeBridge: true,
    language: "fr",
    voiceType: "mixed",
    instrumentalOnly: false,
    customLyrics: "",
    tags: [] as string[],
    difficulty: "intermediate",
    targetAudience: "medical-students"
  });

  // UI states
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generationProgress, setGenerationProgress] = React.useState(0);
  const [previewMode, setPreviewMode] = React.useState(false);
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<any>(null);
  const [customTag, setCustomTag] = React.useState("");
  const [savedDrafts, setSavedDrafts] = React.useState([]);
  const [showTemplatePreview, setShowTemplatePreview] = React.useState(false);

  // Generated content states
  const [generatedLyrics, setGeneratedLyrics] = React.useState("");
  const [generatedMusic, setGeneratedMusic] = React.useState<any>(null);
  const [generationHistory, setGenerationHistory] = React.useState([]);

  React.useEffect(() => {
    analytics.track('page', 'medmng_create_view');
  }, []);

  const steps = [
    { id: 0, title: "Contenu médical", icon: Brain },
    { id: 1, title: "Style musical", icon: Music },
    { id: 2, title: "Personnalisation", icon: Settings },
    { id: 3, title: "Génération", icon: Sparkles },
    { id: 4, title: "Finalisation", icon: Award }
  ];

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    analytics.trackUserAction('form_change', field, { value });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    analytics.trackMusicGeneration({
      genre: formData.genre,
      mood: formData.mood,
      duration: formData.duration[0],
      useAI: formData.useAI,
      medicalContent: formData.selectedEdn || "custom"
    });

    // Simulate generation process
    const progressSteps = [
      { progress: 20, message: "Analyse du contenu médical..." },
      { progress: 40, message: "Génération des paroles..." },
      { progress: 60, message: "Composition musicale..." },
      { progress: 80, message: "Synthèse vocale..." },
      { progress: 100, message: "Finalisation..." }
    ];

    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setGenerationProgress(step.progress);
      
      toast({
        title: "Génération en cours",
        description: step.message,
      });
    }

    // Mock generated content
    const mockLyrics = `Vers 1:
${formData.medicalContent || "Contenu médical éducatif"}
Dans cette mélodie qui s'élève
Pour mieux retenir et rêver

Refrain:
Apprendre en musique c'est magique
Chaque note guide la logique
${formData.selectedEdn} en harmonie
Pour une médecine réussie`;

    setGeneratedLyrics(mockLyrics);
    setGeneratedMusic({
      id: Date.now(),
      title: formData.title || "Nouvelle création",
      duration: formData.duration[0],
      genre: formData.genre,
      audioUrl: null // Mock URL
    });

    setIsGenerating(false);
    setCurrentStep(4);

    toast({
      title: "Génération terminée !",
      description: "Votre chanson médicale est prête.",
    });
  };

  const handleSave = async () => {
    analytics.trackUserAction('song_save', 'create_page');
    
    toast({
      title: "Chanson sauvegardée",
      description: "Vous pouvez la retrouver dans votre bibliothèque.",
    });

    // Navigate to library
    await executeAction({ type: "route", to: "/med-mng/library" });
  };

  const handleAddTag = () => {
    if (customTag && !formData.tags.includes(customTag)) {
      handleFormChange('tags', [...formData.tags, customTag]);
      setCustomTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleFormChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const StepIndicator = () => (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : 'border-muted-foreground text-muted-foreground'
              }`}>
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <div className="ml-2 hidden md:block">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const StepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Contenu médical
                </CardTitle>
                <CardDescription>
                  Choisissez le contenu médical à transformer en chanson
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre de votre chanson *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Les os du crâne en mélodie"
                    value={formData.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                  />
                </div>

                <Tabs defaultValue="edn" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="edn">Items EDN</TabsTrigger>
                    <TabsTrigger value="custom">Contenu personnalisé</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="edn" className="space-y-4">
                    <div>
                      <Label>Sélectionner un item EDN</Label>
                      <Select value={formData.selectedEdn} onValueChange={(value) => handleFormChange('selectedEdn', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un item EDN" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockEdnItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{item.id}</span>
                                <span className="text-sm text-muted-foreground">{item.title}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {formData.selectedEdn && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm">
                          <strong>Contenu sélectionné:</strong> {mockEdnItems.find(item => item.id === formData.selectedEdn)?.title}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="custom" className="space-y-4">
                    <div>
                      <Label htmlFor="medicalContent">Votre contenu médical *</Label>
                      <Textarea
                        id="medicalContent"
                        placeholder="Décrivez le contenu médical que vous souhaitez transformer en chanson..."
                        value={formData.medicalContent}
                        onChange={(e) => handleFormChange('medicalContent', e.target.value)}
                        rows={5}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Style musical
                </CardTitle>
                <CardDescription>
                  Personnalisez le style et l'ambiance de votre chanson
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Genre musical</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {mockGenres.map((genre) => (
                      <Card 
                        key={genre.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          formData.genre === genre.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleFormChange('genre', genre.id)}
                      >
                        <CardContent className="p-4">
                          <h4 className="font-medium">{genre.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{genre.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Ambiance</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {mockMoods.map((mood) => (
                      <Button
                        key={mood.id}
                        variant={formData.mood === mood.id ? "default" : "outline"}
                        className="h-auto p-4 flex flex-col gap-2"
                        onClick={() => handleFormChange('mood', mood.id)}
                      >
                        <span className="text-2xl">{mood.emoji}</span>
                        <span className="font-medium">{mood.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Template de structure</Label>
                  <div className="space-y-3 mt-2">
                    {mockTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          formData.template === template.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => {
                          handleFormChange('template', template.id);
                          setSelectedTemplate(template);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{template.name}</h4>
                                <Badge variant="outline">{template.category}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                              <p className="text-sm text-blue-600 mt-2 font-mono">{template.example}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowTemplatePreview(!showTemplatePreview);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {showTemplatePreview && formData.template === template.id && (
                            <div className="mt-4 pt-4 border-t">
                              <p className="text-sm font-medium mb-2">Structure:</p>
                              <div className="space-y-1">
                                {template.structure.map((section, index) => (
                                  <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                    <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                                    {section}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Personnalisation avancée
                </CardTitle>
                <CardDescription>
                  Ajustez les paramètres détaillés de votre chanson
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Durée (secondes)</Label>
                      <div className="mt-2">
                        <Slider
                          value={formData.duration}
                          onValueChange={(value) => handleFormChange('duration', value)}
                          max={300}
                          min={60}
                          step={30}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                          <span>1 min</span>
                          <span className="font-medium">{Math.floor(formData.duration[0] / 60)}:{(formData.duration[0] % 60).toString().padStart(2, '0')}</span>
                          <span>5 min</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Tempo (BPM)</Label>
                      <div className="mt-2">
                        <Slider
                          value={formData.tempo}
                          onValueChange={(value) => handleFormChange('tempo', value)}
                          max={180}
                          min={60}
                          step={10}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                          <span>Lent</span>
                          <span className="font-medium">{formData.tempo[0]} BPM</span>
                          <span>Rapide</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Type de voix</Label>
                      <Select value={formData.voiceType} onValueChange={(value) => handleFormChange('voiceType', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Voix masculine</SelectItem>
                          <SelectItem value="female">Voix féminine</SelectItem>
                          <SelectItem value="mixed">Voix mixte</SelectItem>
                          <SelectItem value="child">Voix d'enfant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="useAI">Génération IA assistée</Label>
                        <Switch
                          id="useAI"
                          checked={formData.useAI}
                          onCheckedChange={(checked) => handleFormChange('useAI', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="includeChorus">Inclure un refrain</Label>
                        <Switch
                          id="includeChorus"
                          checked={formData.includeChorus}
                          onCheckedChange={(checked) => handleFormChange('includeChorus', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="includeBridge">Inclure un pont musical</Label>
                        <Switch
                          id="includeBridge"
                          checked={formData.includeBridge}
                          onCheckedChange={(checked) => handleFormChange('includeBridge', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="instrumentalOnly">Version instrumentale uniquement</Label>
                        <Switch
                          id="instrumentalOnly"
                          checked={formData.instrumentalOnly}
                          onCheckedChange={(checked) => handleFormChange('instrumentalOnly', checked)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Niveau de difficulté</Label>
                      <Select value={formData.difficulty} onValueChange={(value) => handleFormChange('difficulty', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Débutant</SelectItem>
                          <SelectItem value="intermediate">Intermédiaire</SelectItem>
                          <SelectItem value="advanced">Avancé</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Tags personnalisés</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ajouter un tag..."
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      />
                      <Button onClick={handleAddTag} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:text-destructive"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Accordion type="single" collapsible>
                  <AccordionItem value="custom-lyrics">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Paroles personnalisées (optionnel)
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <Label>Ajoutez vos propres paroles</Label>
                        <Textarea
                          placeholder="Saisissez vos paroles personnalisées..."
                          value={formData.customLyrics}
                          onChange={(e) => handleFormChange('customLyrics', e.target.value)}
                          rows={6}
                        />
                        <p className="text-sm text-muted-foreground">
                          Si vous laissez vide, l'IA générera les paroles automatiquement.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Génération de votre chanson
                </CardTitle>
                <CardDescription>
                  Récapitulatif avant génération
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isGenerating ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-medium">Paramètres choisis</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Titre:</span>
                            <span className="font-medium">{formData.title || "Sans titre"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Genre:</span>
                            <span className="font-medium">{mockGenres.find(g => g.id === formData.genre)?.name || "Non défini"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ambiance:</span>
                            <span className="font-medium">{mockMoods.find(m => m.id === formData.mood)?.name || "Non définie"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Durée:</span>
                            <span className="font-medium">{Math.floor(formData.duration[0] / 60)}:{(formData.duration[0] % 60).toString().padStart(2, '0')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tempo:</span>
                            <span className="font-medium">{formData.tempo[0]} BPM</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Contenu médical</h4>
                        <div className="p-3 bg-muted rounded-lg text-sm">
                          {formData.selectedEdn ? (
                            <>
                              <p className="font-medium">{formData.selectedEdn}</p>
                              <p className="text-muted-foreground">
                                {mockEdnItems.find(item => item.id === formData.selectedEdn)?.title}
                              </p>
                            </>
                          ) : (
                            <p>{formData.medicalContent || "Contenu personnalisé"}</p>
                          )}
                        </div>
                        
                        {formData.tags.length > 0 && (
                          <div>
                            <p className="font-medium text-sm mb-2">Tags:</p>
                            <div className="flex flex-wrap gap-1">
                              {formData.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        onClick={handleGenerate}
                        className="flex-1"
                        disabled={!formData.title || (!formData.selectedEdn && !formData.medicalContent)}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Générer la chanson
                      </Button>
                      <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-primary/10 rounded-full">
                      <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Génération en cours...</h3>
                      <p className="text-muted-foreground">Création de votre chanson médicale personnalisée</p>
                    </div>
                    <div className="max-w-md mx-auto">
                      <Progress value={generationProgress} className="h-2" />
                      <p className="text-sm text-muted-foreground mt-2">{generationProgress}% terminé</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Votre chanson est prête !
                </CardTitle>
                <CardDescription>
                  Écoutez, modifiez et sauvegardez votre création
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {generatedMusic && (
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{generatedMusic.title}</h3>
                        <p className="text-muted-foreground">
                          {generatedMusic.genre} • {Math.floor(generatedMusic.duration / 60)}:{(generatedMusic.duration % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Play className="w-4 h-4 mr-2" />
                          Écouter
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-background/50 rounded p-3 mb-4">
                      <div className="h-16 bg-muted rounded flex items-center justify-center">
                        <Waveform className="w-8 h-8 text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Forme d'onde audio</span>
                      </div>
                    </div>
                  </div>
                )}

                {generatedLyrics && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Paroles générées</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-lg font-mono text-sm whitespace-pre-line">
                        {generatedLyrics}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Copy className="w-4 h-4 mr-2" />
                          Copier
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-4">
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder dans ma bibliothèque
                  </Button>
                  <Button variant="outline" onClick={() => handleGenerate()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Régénérer
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Actions disponibles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button variant="outline" className="h-20 flex flex-col gap-2">
                        <Share className="w-6 h-6" />
                        <span className="text-sm">Partager</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col gap-2">
                        <Heart className="w-6 h-6" />
                        <span className="text-sm">Favoris</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col gap-2">
                        <Plus className="w-6 h-6" />
                        <span className="text-sm">Playlist</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col gap-2">
                        <BarChart3 className="w-6 h-6" />
                        <span className="text-sm">Analytics</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title="Créer une chanson médicale"
      subtitle="Transformez vos connaissances médicales en musique mémorable"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <HelpCircle className="w-4 h-4 mr-2" />
            Aide
          </Button>
          {currentStep > 0 && (
            <Button variant="outline" size="sm" onClick={() => setCurrentStep(prev => prev - 1)}>
              Précédent
            </Button>
          )}
          {currentStep < 3 && (
            <Button size="sm" onClick={() => setCurrentStep(prev => prev + 1)}>
              Suivant
            </Button>
          )}
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <StepIndicator />
        <StepContent />
      </div>
    </DashboardLayout>
  );
}