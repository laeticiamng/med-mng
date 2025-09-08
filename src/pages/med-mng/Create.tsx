import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Music, 
  Wand2, 
  Brain, 
  FileText, 
  Users, 
  PlayCircle,
  Sparkles,
  Clock,
  Target,
  Palette,
  Volume2,
  Download,
  Share2,
  Settings,
  Zap,
  ArrowRight,
  Check,
  Star,
  TrendingUp,
  Mic,
  Radio,
  Headphones,
  Waves
} from 'lucide-react';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedMedicalMusicGeneration } from '@/hooks/useUnifiedMedicalMusicGeneration';
import { UnifiedMedicalMusicPlayer } from '@/components/UnifiedMedicalMusicPlayer';

interface CreationStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
}

interface MusicStyle {
  id: string;
  name: string;
  description: string;
  preview?: string;
  mood: string;
  tempo: string;
  popularity: number;
}

const Create = () => {
  const { toast } = useToast();
  
  const {
    generateMedicalMusic,
    generateBatchMusic,
    activeGenerations,
    generatedTracks,
    isGenerating: unifiedIsGenerating
  } = useUnifiedMedicalMusicGeneration();
  
  // États principaux
  const [activeStep, setActiveStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedContent, setSelectedContent] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [difficulty, setDifficulty] = useState('intermediaire');
  const [duration, setDuration] = useState('3-5');
  
  // Configuration des étapes
  const steps: CreationStep[] = [
    {
      id: 'content',
      title: 'Contenu médical',
      description: 'Choisissez le sujet à transformer en musique',
      icon: FileText,
      completed: false
    },
    {
      id: 'style',
      title: 'Style musical',
      description: 'Sélectionnez le style et l\'ambiance',
      icon: Music,
      completed: false
    },
    {
      id: 'params',
      title: 'Paramètres',
      description: 'Ajustez la difficulté et les options',
      icon: Settings,
      completed: false
    },
    {
      id: 'generate',
      title: 'Génération',
      description: 'Créez votre musique pédagogique',
      icon: Wand2,
      completed: false
    }
  ];

  // Styles musicaux disponibles
  const musicStyles: MusicStyle[] = [
    {
      id: 'trap',
      name: 'Trap Médical',
      description: 'Style moderne et rythmé pour mémoriser rapidement',
      mood: 'Énergique',
      tempo: '140-180 BPM',
      popularity: 95
    },
    {
      id: 'lofi',
      name: 'Lo-Fi Study',
      description: 'Ambiance relaxante pour l\'étude approfondie',
      mood: 'Relaxant',
      tempo: '70-90 BPM',
      popularity: 88
    },
    {
      id: 'pop',
      name: 'Pop Éducative',
      description: 'Mélodies accrocheuses et faciles à retenir',
      mood: 'Optimiste',
      tempo: '120-130 BPM',
      popularity: 92
    },
    {
      id: 'jazz',
      name: 'Jazz Clinique',
      description: 'Sophistiqué et intellectuellement stimulant',
      mood: 'Sophistiqué',
      tempo: '90-120 BPM',
      popularity: 76
    },
    {
      id: 'afrobeat',
      name: 'Afrobeat Santé',
      description: 'Rythmes africains pour une mémorisation dynamique',
      mood: 'Dynamique',
      tempo: '100-120 BPM',
      popularity: 84
    },
    {
      id: 'classical',
      name: 'Classique Moderne',
      description: 'Orchestrations élégantes pour concepts complexes',
      mood: 'Élégant',
      tempo: '60-100 BPM',
      popularity: 71
    }
  ];

  // Contenus médicaux populaires
  const medicalTopics = [
    { id: 'cardio', name: 'Cardiologie', items: 45, difficulty: 'Avancé' },
    { id: 'neuro', name: 'Neurologie', items: 38, difficulty: 'Expert' },
    { id: 'pneumo', name: 'Pneumologie', items: 32, difficulty: 'Intermédiaire' },
    { id: 'gastro', name: 'Gastroentérologie', items: 28, difficulty: 'Intermédiaire' },
    { id: 'endoc', name: 'Endocrinologie', items: 22, difficulty: 'Avancé' },
    { id: 'nephro', name: 'Néphrologie', items: 19, difficulty: 'Avancé' }
  ];

  // Génération réelle avec système unifié
  const handleGeneration = async () => {
    if (!selectedContent && !customPrompt) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez sélectionner un contenu médical ou saisir un prompt personnalisé.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedStyle) {
      toast({
        title: "Style manquant",
        description: "Veuillez sélectionner un style musical.",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedTopic = medicalTopics.find(t => t.id === selectedContent);
      const medicalContent = customPrompt || selectedTopic?.name || '';
      
      // Préparation des paroles médicales
      const lyrics = [medicalContent];
      
      // Génération avec le système unifié
      await generateMedicalMusic({
        itemCode: selectedContent || 'custom',
        rang: 'A',
        lyrics,
        style: selectedStyle,
        duration: parseInt(duration.split('-')[1]) * 60 || 180,
        medicalContext: {
          specialty: selectedTopic?.name || 'Général',
          difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
          keywords: [medicalContent],
          learningObjectives: []
        }
      });

      toast({
        title: "🎵 Génération lancée !",
        description: "Votre musique médicale est en cours de création...",
      });

    } catch (error) {
      console.error('Erreur génération:', error);
      
      toast({
        title: "Erreur de génération",
        description: error.message || "Une erreur est survenue lors de la génération.",
        variant: "destructive"
      });
    }
  };

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <MedMngLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Créateur Musical MNG
                </h1>
                <p className="text-gray-600 mt-1">
                  Transformez n'importe quel contenu médical en musique pédagogique
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  <Sparkles className="h-3 w-3 mr-1" />
                  IA Avancée
                </Badge>
                <Badge variant="outline">
                  <Brain className="h-3 w-3 mr-1" />
                  Neurosciences
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === activeStep;
                const isCompleted = index < activeStep;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                      isActive 
                        ? 'border-purple-500 bg-purple-100 text-purple-600' 
                        : isCompleted
                        ? 'border-green-500 bg-green-100 text-green-600'
                        : 'border-gray-300 bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    
                    <div className="ml-3">
                      <p className={`font-medium text-sm ${
                        isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {step.description}
                      </p>
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-px mx-6 ${
                        isCompleted ? 'bg-green-300' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Tabs value={steps[activeStep].id} className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contenu principal */}
              <div className="lg:col-span-2">
                {/* Étape 1: Sélection du contenu */}
                <TabsContent value="content" className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <FileText className="h-6 w-6 text-purple-600" />
                    <span>Sélectionnez votre contenu médical</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {medicalTopics.map((topic) => (
                      <Card 
                        key={topic.id}
                        className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                          selectedContent === topic.id 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                        onClick={() => setSelectedContent(topic.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{topic.name}</h3>
                            {selectedContent === topic.id && (
                              <Check className="h-5 w-5 text-purple-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{topic.items} items disponibles</p>
                          <Badge variant="outline" className="text-xs">
                            {topic.difficulty}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <Label>Ou saisissez un contenu personnalisé :</Label>
                    <Textarea
                      placeholder="Ex: Les mécanismes de l'insuffisance cardiaque, les différents types d'arythmies..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Étape 2: Style musical */}
            <TabsContent value="style" className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <Music className="h-6 w-6 text-purple-600" />
                    <span>Choisissez votre style musical</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {musicStyles.map((style) => (
                      <Card 
                        key={style.id}
                        className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                          selectedStyle === style.id 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                        onClick={() => setSelectedStyle(style.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">{style.name}</h3>
                            {selectedStyle === style.id && (
                              <Check className="h-5 w-5 text-purple-600" />
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{style.description}</p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Ambiance:</span>
                              <span className="font-medium">{style.mood}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Tempo:</span>
                              <span className="font-medium">{style.tempo}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Popularité:</span>
                              <div className="flex items-center space-x-1">
                                <Progress value={style.popularity} className="w-12 h-2" />
                                <span className="font-medium">{style.popularity}%</span>
                              </div>
                            </div>
                          </div>

                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Simulation d'aperçu audio
                            setIsGenerating(true);
                            setTimeout(() => {
                              setIsGenerating(false);
                              toast({
                                title: `🎵 Aperçu ${style.name}`,
                                description: `Style: ${style.mood} • Tempo: ${style.tempo}`,
                              });
                            }, 1500);
                          }}
                          >
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Aperçu
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Étape 3: Paramètres */}
            <TabsContent value="params" className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <Settings className="h-6 w-6 text-purple-600" />
                    <span>Paramètres avancés</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-base font-medium">Niveau de difficulté</Label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="debutant">Débutant - Concepts de base</SelectItem>
                          <SelectItem value="intermediaire">Intermédiaire - Niveau EDN</SelectItem>
                          <SelectItem value="avance">Avancé - Spécialisation</SelectItem>
                          <SelectItem value="expert">Expert - Recherche clinique</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Durée souhaitée</Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-2">1-2 minutes - Concept rapide</SelectItem>
                          <SelectItem value="3-5">3-5 minutes - Standard</SelectItem>
                          <SelectItem value="5-8">5-8 minutes - Approfondi</SelectItem>
                          <SelectItem value="8-12">8-12 minutes - Cours complet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">Options avancées</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="vocals" />
                        <Label htmlFor="vocals">Inclure des voix explicatives</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="repetition" defaultChecked />
                        <Label htmlFor="repetition">Répétitions pour mémorisation</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="quiz" />
                        <Label htmlFor="quiz">Intégrer des questions-réponses</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="mnemonics" defaultChecked />
                        <Label htmlFor="mnemonics">Optimiser les moyens mnémotechniques</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Étape 4: Génération */}
            <TabsContent value="generate" className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <Wand2 className="h-6 w-6 text-purple-600" />
                    <span>Génération de votre musique pédagogique</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!isGenerating ? (
                    <div className="text-center py-8">
                      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="h-12 w-12 text-purple-600" />
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-4">Prêt à créer votre chef-d'œuvre pédagogique ?</h3>
                      <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                        Notre IA va analyser votre contenu médical et le transformer en une expérience musicale 
                        optimisée pour la mémorisation et l'apprentissage selon la méthode MNG.
                      </p>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Contenu:</span>
                            <p className="font-medium">
                              {selectedContent ? medicalTopics.find(t => t.id === selectedContent)?.name : 'Personnalisé'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Style:</span>
                            <p className="font-medium">
                              {selectedStyle ? musicStyles.find(s => s.id === selectedStyle)?.name : 'Non sélectionné'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Difficulté:</span>
                            <p className="font-medium capitalize">{difficulty}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Durée:</span>
                            <p className="font-medium">{duration} minutes</p>
                          </div>
                        </div>
                      </div>

                      <Button 
                        onClick={handleGeneration}
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-3"
                      >
                        <Zap className="h-5 w-5 mr-2" />
                        Générer ma musique pédagogique
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Brain className="h-12 w-12 text-purple-600" />
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-4">Génération en cours...</h3>
                      <p className="text-gray-600 mb-6">
                        Notre IA travaille pour créer votre musique pédagogique personnalisée
                      </p>
                      
                      <div className="max-w-md mx-auto">
                        <Progress value={generationProgress} className="h-3 mb-4" />
                        <p className="text-sm text-gray-500">
                          {generationProgress}% terminé
                        </p>
                      </div>
                      
                      <div className="mt-8 text-sm text-gray-500">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Temps estimé: 2-3 minutes
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
                </TabsContent>
              </div>

              {/* Aperçu en temps réel */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  {/* Générations en cours et conseils */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Aperçu en temps réel</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Contenu sélectionné */}
                      {selectedContent && (
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium mb-2">Contenu médical</h4>
                          <Badge variant="outline">{selectedContent}</Badge>
                        </div>
                      )}
                      
                      {/* Style sélectionné */}
                      {selectedStyle && (
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium mb-2">Style musical</h4>
                          <Badge variant="outline">{selectedStyle}</Badge>
                        </div>
                      )}
                      
                      {/* Générations actives */}
                      {activeGenerations.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium">Générations en cours</h4>
                          {activeGenerations.map((generation) => (
                            <div key={generation.taskId} className="p-3 border rounded-lg">
                              <div className="text-sm font-medium mb-2">{generation.taskId}</div>
                              <Progress value={generation.progress} className="mb-2" />
                              <div className="text-xs text-muted-foreground">
                                {generation.stage} - {generation.progress}%
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Bouton de génération */}
                      <Button 
                        onClick={handleGeneration}
                        disabled={unifiedIsGenerating || !selectedContent || !selectedStyle}
                        className="w-full"
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        {unifiedIsGenerating ? 'Génération...' : 'Générer la musique'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </Tabs>

          {/* Navigation */}
          <div className="flex justify-between mt-8 max-w-6xl mx-auto">
            <Button 
              onClick={prevStep}
              variant="outline"
              disabled={activeStep === 0 || isGenerating}
            >
              Précédent
            </Button>
            
            {activeStep < steps.length - 1 ? (
              <Button 
                onClick={nextStep}
                disabled={
                  (activeStep === 0 && !selectedContent && !customPrompt) ||
                  (activeStep === 1 && !selectedStyle) ||
                  isGenerating
                }
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Suivant
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <div /> /* Spacer when on last step */
            )}
          </div>
        </div>
      </div>
    </MedMngLayout>
  );
};

export default Create;