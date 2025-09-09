import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  Brain,
  Music,
  FileText,
  HelpCircle,
  Wand2,
  Download,
  Play,
  Pause,
  Volume2,
  Settings,
  Sparkles,
  Zap,
  Crown,
  BookOpen,
  Target,
  Clock,
  Save,
  Share2,
  Heart,
  Star,
  Lightbulb,
  Mic,
  Headphones,
  ChevronRight,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/hooks/use-toast';

const Generator: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('music');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedContent, setGeneratedContent] = useState([]);
  const [isPlaying, setIsPlaying] = useState(null);

  const [musicForm, setMusicForm] = useState({
    topic: '',
    style: 'relaxing',
    duration: 120,
    mood: 'peaceful',
    tempo: 60
  });

  const [quizForm, setQuizForm] = useState({
    subject: '',
    topic: '',
    difficulty: 'intermediate',
    questionCount: 10,
    questionType: 'multiple-choice'
  });

  const handleGenerate = async (type) => {
    setIsGenerating(true);
    setGenerationProgress(0);

    const steps = [
      { progress: 20, message: 'Analyse du contexte médical...' },
      { progress: 40, message: 'Génération IA en cours...' },
      { progress: 60, message: 'Optimisation du contenu...' },
      { progress: 80, message: 'Finalisation et vérification...' },
      { progress: 100, message: 'Génération terminée !' }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGenerationProgress(step.progress);
    }

    const newContent = {
      id: Date.now().toString(),
      type,
      title: getGeneratedTitle(type),
      content: getGeneratedContent(type),
      audioUrl: type === 'music' ? '/generated-audio.mp3' : undefined,
      createdAt: new Date(),
      likes: 0,
      downloads: 0
    };
    
    setGeneratedContent(prev => [newContent, ...prev]);
    setIsGenerating(false);
    setGenerationProgress(0);
    
    toast({
      title: "Génération réussie !",
      description: `Votre ${type} a été généré avec succès.`,
    });
  };

  const getGeneratedTitle = (type) => {
    switch (type) {
      case 'music': return `Musique thérapeutique - ${musicForm.style}`;
      case 'quiz': return `Quiz ${quizForm.subject} - ${quizForm.difficulty}`;
      default: return 'Contenu généré';
    }
  };

  const getGeneratedContent = (type) => {
    switch (type) {
      case 'music':
        return {
          style: musicForm.style,
          duration: musicForm.duration,
          mood: musicForm.mood,
          description: `Musique thérapeutique de ${musicForm.duration}s dans un style ${musicForm.style}`
        };
      case 'quiz':
        return {
          questions: Array.from({ length: quizForm.questionCount }, (_, i) => ({
            id: i + 1,
            question: `Question ${i + 1} sur ${quizForm.subject}`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correct: 0,
            explanation: 'Explication détaillée de la réponse correcte.'
          }))
        };
      default: return {};
    }
  };

  return (
    <>
      <Helmet>
        <title>Générateur IA - MED-MNG</title>
        <meta name="description" content="Créez du contenu pédagogique personnalisé avec l'intelligence artificielle" />
      </Helmet>

      <div className="container mx-auto p-6 space-y-8 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <Badge className="bg-gradient-to-r from-gold to-yellow-600 text-white">
              <Crown className="h-3 w-3 mr-1" />
              PREMIUM IA
            </Badge>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Générateur IA Médical
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Créez instantanément du contenu pédagogique personnalisé avec notre IA spécialisée en médecine
          </p>
        </motion.div>

        <AnimatePresence>
          {isGenerating && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <Card className="border-2 border-primary">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="animate-spin">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Génération IA en cours...</h3>
                  </div>
                  <Progress value={generationProgress} className="h-3 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {generationProgress < 20 && "Analyse du contexte médical..."}
                    {generationProgress >= 20 && generationProgress < 40 && "Génération IA en cours..."}
                    {generationProgress >= 40 && generationProgress < 60 && "Optimisation du contenu..."}
                    {generationProgress >= 60 && generationProgress < 80 && "Finalisation et vérification..."}
                    {generationProgress >= 80 && "Génération terminée !"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="music" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Musique
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Quiz
            </TabsTrigger>
            <TabsTrigger value="fiche" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Fiches
            </TabsTrigger>
          </TabsList>

          <TabsContent value="music" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Musique Thérapeutique
                </CardTitle>
                <CardDescription>Générez de la musique personnalisée pour optimiser votre apprentissage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="music-topic">Contexte d'étude</Label>
                  <Input
                    id="music-topic"
                    placeholder="Ex: Révision cardiologie, préparation ECN..."
                    value={musicForm.topic}
                    onChange={(e) => setMusicForm({ ...musicForm, topic: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Style musical</Label>
                    <Select value={musicForm.style} onValueChange={(value) => setMusicForm({ ...musicForm, style: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relaxing">🧘 Relaxant</SelectItem>
                        <SelectItem value="focus">🎯 Concentration</SelectItem>
                        <SelectItem value="energetic">⚡ Énergisant</SelectItem>
                        <SelectItem value="ambient">🌙 Ambiant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Humeur cible</Label>
                    <Select value={musicForm.mood} onValueChange={(value) => setMusicForm({ ...musicForm, mood: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="peaceful">😌 Paisible</SelectItem>
                        <SelectItem value="motivated">💪 Motivé</SelectItem>
                        <SelectItem value="concentrated">🧠 Concentré</SelectItem>
                        <SelectItem value="creative">🎨 Créatif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Durée: {Math.floor(musicForm.duration / 60)}:{(musicForm.duration % 60).toString().padStart(2, '0')}</Label>
                  <Slider
                    value={[musicForm.duration]}
                    onValueChange={([value]) => setMusicForm({ ...musicForm, duration: value })}
                    min={30}
                    max={1800}
                    step={30}
                  />
                </div>

                <Button 
                  onClick={() => handleGenerate('music')} 
                  disabled={isGenerating || !musicForm.topic}
                  className="w-full"
                  size="lg"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Générer la musique
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Quiz Personnalisés
                </CardTitle>
                <CardDescription>Créez des quiz adaptatifs selon vos besoins d'apprentissage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quiz-subject">Matière</Label>
                  <Input
                    id="quiz-subject"
                    placeholder="Ex: Cardiologie, Neurologie..."
                    value={quizForm.subject}
                    onChange={(e) => setQuizForm({ ...quizForm, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quiz-topic">Sujet spécifique</Label>
                  <Input
                    id="quiz-topic"
                    placeholder="Ex: Infarctus du myocarde, Epilepsie..."
                    value={quizForm.topic}
                    onChange={(e) => setQuizForm({ ...quizForm, topic: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Difficulté</Label>
                    <Select value={quizForm.difficulty} onValueChange={(value) => setQuizForm({ ...quizForm, difficulty: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">🟢 Débutant</SelectItem>
                        <SelectItem value="intermediate">🟡 Intermédiaire</SelectItem>
                        <SelectItem value="advanced">🔴 Avancé</SelectItem>
                        <SelectItem value="expert">🟣 Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Type de questions</Label>
                    <Select value={quizForm.questionType} onValueChange={(value) => setQuizForm({ ...quizForm, questionType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple-choice">QCM</SelectItem>
                        <SelectItem value="true-false">Vrai/Faux</SelectItem>
                        <SelectItem value="case-study">Cas clinique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Nombre de questions: {quizForm.questionCount}</Label>
                  <Slider
                    value={[quizForm.questionCount]}
                    onValueChange={([value]) => setQuizForm({ ...quizForm, questionCount: value })}
                    min={5}
                    max={50}
                    step={5}
                  />
                </div>

                <Button 
                  onClick={() => handleGenerate('quiz')} 
                  disabled={isGenerating || !quizForm.subject}
                  className="w-full"
                  size="lg"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Générer le quiz
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fiche" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Fiches de Révision
                </CardTitle>
                <CardDescription>Générez des fiches synthétiques et structurées</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fiche-topic">Sujet de la fiche</Label>
                  <Input
                    id="fiche-topic"
                    placeholder="Ex: Physiopathologie de l'HTA..."
                  />
                </div>

                <Button 
                  onClick={() => handleGenerate('fiche')} 
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Générer la fiche
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {generatedContent.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Contenu Généré</h2>
              <Badge variant="secondary">{generatedContent.length} élément{generatedContent.length > 1 ? 's' : ''}</Badge>
            </div>
            
            <div className="grid gap-4">
              {generatedContent.map((content) => (
                <Card key={content.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{content.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{content.createdAt.toLocaleDateString()}</span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {content.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {content.downloads}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {content.audioUrl && (
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {content.type === 'music' && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm">{content.content.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default Generator;