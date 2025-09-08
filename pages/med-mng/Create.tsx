import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { 
  Wand2, 
  Music, 
  Play, 
  Pause, 
  Download, 
  Share, 
  Heart,
  Volume2,
  Clock,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mic,
  BookOpen,
  Settings,
  Save,
  Headphones,
  TrendingUp
} from "lucide-react";

const musicStyles = [
  { value: "pop", label: "Pop", description: "Mélodies accrocheuses", popularity: 85 },
  { value: "rap", label: "Rap", description: "Rythmes pour mémoriser", popularity: 92 },
  { value: "classical", label: "Classique", description: "Concentration optimale", popularity: 67 },
  { value: "rock", label: "Rock", description: "Énergie et motivation", popularity: 78 },
  { value: "jazz", label: "Jazz", description: "Sophistication", popularity: 45 },
  { value: "electronic", label: "Électronique", description: "Modernité et rythme", popularity: 73 },
  { value: "folk", label: "Folk", description: "Narration naturelle", popularity: 56 },
  { value: "blues", label: "Blues", description: "Expressivité", popularity: 39 }
];

const ednCategories = [
  "Cardiologie", "Pneumologie", "Gastro-entérologie", "Neurologie",
  "Endocrinologie", "Rhumatologie", "Dermatologie", "Psychiatrie",
  "Pédiatrie", "Gynécologie", "Urologie", "ORL", "Ophtalmologie"
];

const Create = () => {
  const [activeTab, setActiveTab] = useState("simple");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedSong, setGeneratedSong] = useState<any>(null);
  
  const [simpleForm, setSimpleForm] = useState({
    topic: "",
    style: "",
  });

  const [advancedForm, setAdvancedForm] = useState({
    title: "",
    content: "",
    style: "",
    duration: [180],
    category: "",
    difficulty: "intermediate",
    mood: "energetic",
    tempo: [120],
    vocals: "mixed",
    instruments: [],
    language: "french",
    rhymeScheme: "AABB",
    includeChorus: true,
    generateMultiple: false,
    personalizeForUser: true
  });

  const handleSimpleGenerate = async () => {
    if (!simpleForm.topic || !simpleForm.style) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulation de génération avec progression
    const progressSteps = [
      { step: 20, message: "Analyse du sujet médical..." },
      { step: 40, message: "Génération des paroles..." },
      { step: 60, message: "Composition musicale..." },
      { step: 80, message: "Arrangement et mixage..." },
      { step: 100, message: "Finalisation..." }
    ];

    for (const { step, message } of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setGenerationProgress(step);
    }

    // Simulation du résultat
    setTimeout(() => {
      setGeneratedSong({
        id: Date.now().toString(),
        title: `${simpleForm.topic} - ${simpleForm.style}`,
        duration: 183,
        style: simpleForm.style,
        audioUrl: "https://example.com/generated-song.mp3",
        lyrics: generateSampleLyrics(simpleForm.topic),
        waveform: Array.from({ length: 100 }, () => Math.random() * 100),
        createdAt: new Date().toISOString()
      });
      setIsGenerating(false);
      setGenerationProgress(0);
    }, 1000);
  };

  const handleAdvancedGenerate = async () => {
    if (!advancedForm.title || !advancedForm.content || !advancedForm.style) return;
    
    setIsGenerating(true);
    // Logique similaire pour le mode avancé
    setTimeout(() => {
      setGeneratedSong({
        id: Date.now().toString(),
        title: advancedForm.title,
        duration: advancedForm.duration[0],
        style: advancedForm.style,
        audioUrl: "https://example.com/generated-song.mp3",
        lyrics: generateSampleLyrics(advancedForm.title),
        waveform: Array.from({ length: 100 }, () => Math.random() * 100),
        createdAt: new Date().toISOString()
      });
      setIsGenerating(false);
    }, 4000);
  };

  const generateSampleLyrics = (topic: string) => {
    return `[Couplet 1]
Dans le monde médical, parlons de ${topic}
C'est un sujet important, ne l'oublions pas
Les symptômes à connaître, le diagnostic à poser
Pour nos patients guérir et les accompagner

[Refrain]
${topic}, ${topic}
Dans nos têtes ça reste
Les connaissances qu'on teste
Pour être au top de notre art

[Couplet 2]
L'examen clinique nous guide sur la voie
Les examens complémentaires confirment notre choix
Le traitement adapté pour chaque situation
C'est ça la médecine, notre passion !

[Refrain]
${topic}, ${topic}
Dans nos têtes ça reste
Les connaissances qu'on teste
Pour être au top de notre art`;
  };

  const resetGeneration = () => {
    setGeneratedSong(null);
    setSimpleForm({ topic: "", style: "" });
    setAdvancedForm({
      title: "",
      content: "",
      style: "",
      duration: [180],
      category: "",
      difficulty: "intermediate",
      mood: "energetic",
      tempo: [120],
      vocals: "mixed",
      instruments: [],
      language: "french",
      rhymeScheme: "AABB",
      includeChorus: true,
      generateMultiple: false,
      personalizeForUser: true
    });
  };

  if (generatedSong) {
    return (
      <>
        <Helmet>
          <title>Chanson générée - MED-MNG | {generatedSong.title}</title>
        </Helmet>

        <main className="min-h-screen py-8">
          <div className="medical-container max-w-4xl">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-bold">Chanson générée avec succès !</h1>
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <p className="text-muted-foreground">
                Votre contenu médical a été transformé en musique mémorable
              </p>
            </div>

            <Card className="medical-card-premium">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{generatedSong.title}</CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-2">
                      <Badge variant="secondary">{generatedSong.style}</Badge>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{Math.floor(generatedSong.duration / 60)}:{(generatedSong.duration % 60).toString().padStart(2, '0')}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Créé le {new Date(generatedSong.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Lecteur audio */}
                <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-xl p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Button size="lg" className="rounded-full w-16 h-16 p-0">
                      <Play className="w-6 h-6 ml-1" />
                    </Button>
                    <div className="flex-1">
                      <div className="h-3 bg-background/50 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-1/3 rounded-full transition-all duration-300"></div>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>0:00</span>
                        <span>{Math.floor(generatedSong.duration / 60)}:{(generatedSong.duration % 60).toString().padStart(2, '0')}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Volume2 className="w-5 h-5 text-muted-foreground" />
                      <div className="w-20 h-2 bg-background/50 rounded-full">
                        <div className="h-full bg-primary w-3/4 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Forme d'onde */}
                  <div className="flex items-end justify-center space-x-1 h-20 bg-background/20 rounded-lg p-2">
                    {generatedSong.waveform.slice(0, 80).map((height: number, i: number) => (
                      <div
                        key={i}
                        className="w-1 bg-primary/60 rounded-full transition-all duration-200 hover:bg-primary"
                        style={{ height: `${Math.max(height * 0.6, 8)}px` }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Paroles */}
                <Tabs defaultValue="lyrics" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="lyrics">Paroles</TabsTrigger>
                    <TabsTrigger value="analysis">Analyse</TabsTrigger>
                    <TabsTrigger value="export">Export</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="lyrics" className="mt-6">
                    <div className="bg-muted/30 rounded-lg p-6">
                      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                        {generatedSong.lyrics}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="analysis" className="mt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="medical-card">
                        <CardHeader>
                          <CardTitle className="text-lg">Analyse musicale</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between">
                            <span>Tempo</span>
                            <span className="font-medium">120 BPM</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tonalité</span>
                            <span className="font-medium">Do majeur</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Structure</span>
                            <span className="font-medium">Couplet-Refrain</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Rimes</span>
                            <span className="font-medium">AABB</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="medical-card">
                        <CardHeader>
                          <CardTitle className="text-lg">Contenu pédagogique</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between">
                            <span>Concepts médicaux</span>
                            <span className="font-medium">8</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Niveau de complexité</span>
                            <Badge variant="secondary">Intermédiaire</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Mémorabilité</span>
                            <div className="flex items-center space-x-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <CheckCircle key={i} className="w-4 h-4 text-success" />
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="export" className="mt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="medical-card">
                        <CardHeader>
                          <CardTitle className="text-lg">Formats disponibles</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Button variant="outline" className="w-full justify-start">
                            <Download className="w-4 h-4 mr-2" />
                            MP3 Haute qualité (320kbps)
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Download className="w-4 h-4 mr-2" />
                            WAV Non compressé
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Download className="w-4 h-4 mr-2" />
                            Paroles (TXT)
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Share className="w-4 h-4 mr-2" />
                            Partager le lien
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="medical-card">
                        <CardHeader>
                          <CardTitle className="text-lg">Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Button className="w-full medical-btn-primary">
                            <Save className="w-4 h-4 mr-2" />
                            Sauvegarder dans ma bibliothèque
                          </Button>
                          <Button variant="outline" className="w-full">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Ajouter à une playlist
                          </Button>
                          <Button variant="outline" className="w-full">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Voir les statistiques
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Actions principales */}
                <div className="flex space-x-4 pt-6 border-t border-border">
                  <Button 
                    onClick={resetGeneration}
                    variant="outline"
                    className="flex-1"
                  >
                    Créer une nouvelle chanson
                  </Button>
                  <Button asChild className="flex-1 medical-btn-primary">
                    <Link to="/med-mng/library">
                      Aller à ma bibliothèque
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Créer une chanson - MED-MNG | Générateur musical IA</title>
        <meta name="description" content="Créez des chansons médicales personnalisées avec notre IA avancée. Mode simple ou avancé selon vos besoins." />
      </Helmet>

      <main className="min-h-screen py-8">
        <div className="medical-container max-w-6xl">
          {/* En-tête */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Wand2 className="w-4 h-4 mr-2" />
              IA Musicale Avancée
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Studio de création
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent block">
                musicale IA
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transformez vos connaissances médicales en chansons mémorables. 
              Choisissez votre mode de création préféré.
            </p>
          </div>

          {/* Mode de génération en cours */}
          {isGenerating && (
            <Card className="medical-card-premium mb-8">
              <CardContent className="p-8 text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto mb-4">
                    <Loader2 className="w-20 h-20 animate-spin text-primary" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 mx-auto animate-pulse">
                    <div className="w-20 h-20 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-sm"></div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-4">Création en cours...</h2>
                <p className="text-muted-foreground mb-6">
                  Notre IA compose votre chanson personnalisée
                </p>

                <div className="max-w-md mx-auto mb-6">
                  <Progress value={generationProgress} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {generationProgress}% terminé
                  </p>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground max-w-md mx-auto">
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Analyse du contenu médical</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    {generationProgress >= 40 ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    )}
                    <span>Génération des paroles</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    {generationProgress >= 60 ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : generationProgress >= 40 ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <div className="w-4 h-4 border border-muted rounded-full" />
                    )}
                    <span>Composition musicale</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    {generationProgress >= 80 ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : generationProgress >= 60 ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <div className="w-4 h-4 border border-muted rounded-full" />
                    )}
                    <span>Finalisation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interface de création */}
          {!isGenerating && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="simple" className="flex items-center space-x-2">
                  <Mic className="w-4 h-4" />
                  <span>Mode Simple</span>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Mode Avancé</span>
                </TabsTrigger>
              </TabsList>

              {/* Mode Simple */}
              <TabsContent value="simple">
                <Card className="medical-card-premium">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Mic className="w-5 h-5" />
                      <span>Création simplifiée</span>
                    </CardTitle>
                    <CardDescription>
                      Générez rapidement une chanson en quelques clics. Parfait pour débuter.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="simple-topic">Sujet médical</Label>
                        <Input
                          id="simple-topic"
                          placeholder="Ex: Insuffisance cardiaque, Diabète type 2..."
                          value={simpleForm.topic}
                          onChange={(e) => setSimpleForm(prev => ({ ...prev, topic: e.target.value }))}
                          className="medical-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Style musical</Label>
                        <Select value={simpleForm.style} onValueChange={(value) => setSimpleForm(prev => ({ ...prev, style: value }))}>
                          <SelectTrigger className="medical-input">
                            <SelectValue placeholder="Choisissez un style" />
                          </SelectTrigger>
                          <SelectContent>
                            {musicStyles.map((style) => (
                              <SelectItem key={style.value} value={style.value}>
                                <div className="flex items-center justify-between w-full">
                                  <div>
                                    <span className="font-medium">{style.label}</span>
                                    <span className="text-xs text-muted-foreground ml-2">{style.description}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs ml-2">
                                    {style.popularity}% populaire
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="text-center pt-4">
                      <Button 
                        onClick={handleSimpleGenerate}
                        disabled={!simpleForm.topic || !simpleForm.style}
                        className="medical-btn-primary px-8 py-3"
                        size="lg"
                      >
                        <Wand2 className="w-5 h-5 mr-2" />
                        Générer ma chanson
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Mode Avancé */}
              <TabsContent value="advanced">
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    {/* Contenu */}
                    <Card className="medical-card-premium">
                      <CardHeader>
                        <CardTitle>Contenu médical</CardTitle>
                        <CardDescription>
                          Définissez précisément le contenu à transformer en musique
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">Titre de la chanson</Label>
                            <Input
                              id="title"
                              placeholder="Ex: Les bases de la cardiologie"
                              value={advancedForm.title}
                              onChange={(e) => setAdvancedForm(prev => ({ ...prev, title: e.target.value }))}
                              className="medical-input"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category">Catégorie EDN</Label>
                            <Select value={advancedForm.category} onValueChange={(value) => setAdvancedForm(prev => ({ ...prev, category: value }))}>
                              <SelectTrigger className="medical-input">
                                <SelectValue placeholder="Spécialité" />
                              </SelectTrigger>
                              <SelectContent>
                                {ednCategories.map((category) => (
                                  <SelectItem key={category} value={category.toLowerCase()}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="content">Contenu médical détaillé</Label>
                          <Textarea
                            id="content"
                            placeholder="Collez ici vos cours, définitions, protocoles médicaux..."
                            value={advancedForm.content}
                            onChange={(e) => setAdvancedForm(prev => ({ ...prev, content: e.target.value }))}
                            className="medical-input min-h-[150px]"
                          />
                          <p className="text-sm text-muted-foreground">
                            {advancedForm.content.length}/5000 caractères
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Style et composition */}
                    <Card className="medical-card-premium">
                      <CardHeader>
                        <CardTitle>Style et composition</CardTitle>
                        <CardDescription>
                          Personnalisez l'aspect musical de votre création
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Style musical</Label>
                            <Select value={advancedForm.style} onValueChange={(value) => setAdvancedForm(prev => ({ ...prev, style: value }))}>
                              <SelectTrigger className="medical-input">
                                <SelectValue placeholder="Style" />
                              </SelectTrigger>
                              <SelectContent>
                                {musicStyles.map((style) => (
                                  <SelectItem key={style.value} value={style.value}>
                                    {style.label} - {style.description}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Ambiance</Label>
                            <Select value={advancedForm.mood} onValueChange={(value) => setAdvancedForm(prev => ({ ...prev, mood: value }))}>
                              <SelectTrigger className="medical-input">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="energetic">Énergique</SelectItem>
                                <SelectItem value="calm">Calme</SelectItem>
                                <SelectItem value="motivational">Motivant</SelectItem>
                                <SelectItem value="focus">Concentration</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Durée de la chanson : {Math.floor(advancedForm.duration[0] / 60)}:{(advancedForm.duration[0] % 60).toString().padStart(2, '0')}</Label>
                            <Slider
                              value={advancedForm.duration}
                              onValueChange={(value) => setAdvancedForm(prev => ({ ...prev, duration: value }))}
                              max={360}
                              min={60}
                              step={15}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>1 min</span>
                              <span>6 min</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Tempo : {advancedForm.tempo[0]} BPM</Label>
                            <Slider
                              value={advancedForm.tempo}
                              onValueChange={(value) => setAdvancedForm(prev => ({ ...prev, tempo: value }))}
                              max={180}
                              min={60}
                              step={5}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>Lent</span>
                              <span>Rapide</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar options */}
                  <div className="space-y-6">
                    <Card className="medical-card">
                      <CardHeader>
                        <CardTitle className="text-lg">Options avancées</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="include-chorus">Inclure un refrain</Label>
                          <Switch
                            id="include-chorus"
                            checked={advancedForm.includeChorus}
                            onCheckedChange={(checked) => setAdvancedForm(prev => ({ ...prev, includeChorus: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="generate-multiple">Générer plusieurs versions</Label>
                          <Switch
                            id="generate-multiple"
                            checked={advancedForm.generateMultiple}
                            onCheckedChange={(checked) => setAdvancedForm(prev => ({ ...prev, generateMultiple: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="personalize">Personnaliser pour moi</Label>
                          <Switch
                            id="personalize"
                            checked={advancedForm.personalizeForUser}
                            onCheckedChange={(checked) => setAdvancedForm(prev => ({ ...prev, personalizeForUser: checked }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Type de voix</Label>
                          <Select value={advancedForm.vocals} onValueChange={(value) => setAdvancedForm(prev => ({ ...prev, vocals: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Voix masculine</SelectItem>
                              <SelectItem value="female">Voix féminine</SelectItem>
                              <SelectItem value="mixed">Voix mixte</SelectItem>
                              <SelectItem value="synthetic">Voix synthétique</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Schéma de rimes</Label>
                          <Select value={advancedForm.rhymeScheme} onValueChange={(value) => setAdvancedForm(prev => ({ ...prev, rhymeScheme: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AABB">AABB (Plates)</SelectItem>
                              <SelectItem value="ABAB">ABAB (Croisées)</SelectItem>
                              <SelectItem value="ABBA">ABBA (Embrassées)</SelectItem>
                              <SelectItem value="FREE">Libres</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Button
                      onClick={handleAdvancedGenerate}
                      disabled={!advancedForm.title || !advancedForm.content || !advancedForm.style}
                      className="w-full medical-btn-primary py-6"
                      size="lg"
                    >
                      <Wand2 className="w-5 h-5 mr-2" />
                      Créer avec ces paramètres
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </>
  );
};

export default Create;