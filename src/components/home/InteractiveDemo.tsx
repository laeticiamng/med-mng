// ==========================================
// MED-MNG INTERACTIVE DEMO - Démonstration interactive avancée
// ==========================================

import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Volume2, 
  Music, 
  BookOpen, 
  Brain, 
  Sparkles, 
  Zap, 
  CheckCircle,
  Headphones,
  BarChart3 as Waveform,
  BarChart3,
  Target,
  Mic,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for realistic demo
const demoContent = {
  music: {
    title: "IC-1 : La Relation Médecin-Malade",
    rang: "A",
    style: "Clinical Hip-Hop",
    duration: "3:24",
    progress: 0,
    isPlaying: false,
    lyrics: [
      "🎵 Dans le cabinet, face à face on se retrouve",
      "🎵 L'empathie guide, la confiance on éprouve", 
      "🎵 Écouter d'abord, avant de diagnostiquer",
      "🎵 La relation soigne, faut pas l'oublier",
      "🎵 SPIKES pour annoncer, une mauvaise nouvelle",
      "🎵 Setting-Perception-Invitation-Knowledge-Emotions-Strategy",
      "🎵 Alliance thérapeutique, c'est fondamental",
      "🎵 Patient au centre, approche optimale"
    ],
    currentLyric: 0
  },
  tableau: {
    title: "Tableau IC-1 Interactif",
    concepts: [
      {
        concept: "Empathie clinique",
        definition: "Capacité à comprendre les émotions du patient sans se laisser submerger",
        exemple: "Reformuler les émotions exprimées par le patient",
        piege: "Confondre empathie et sympathie",
        mnemo: "EMPATHIE = Écoute + Mesure + Professionnel"
      },
      {
        concept: "Alliance thérapeutique",
        definition: "Collaboration active entre patient et soignant autour d'objectifs partagés",
        exemple: "Accord sur le plan de traitement et les objectifs de soins",
        piege: "Croire qu'elle se crée automatiquement",
        mnemo: "ALLIANCE = Accord + Loyauté + Liens + Intérêts"
      }
    ],
    selectedConcept: 0
  },
  generation: {
    stage: "idle",
    progress: 0,
    steps: [
      { name: "Analyse du contenu", duration: 2000 },
      { name: "Génération IA", duration: 3000 },
      { name: "Optimisation musicale", duration: 2000 },
      { name: "Validation médicale", duration: 1500 },
      { name: "Finalisation", duration: 1000 }
    ],
    currentStep: 0
  }
};

// Interactive Music Player Component
const InteractiveMusicPlayer = memo(() => {
  const [musicState, setMusicState] = useState(demoContent.music);
  const [audioLevel, setAudioLevel] = useState(0);

  // Simulate audio playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (musicState.isPlaying) {
      interval = setInterval(() => {
        setMusicState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 1, 100),
          currentLyric: Math.floor((prev.progress / 100) * prev.lyrics.length)
        }));
        
        // Simulate audio levels
        setAudioLevel(Math.random() * 100);
      }, 300);
    }
    
    return () => clearInterval(interval);
  }, [musicState.isPlaying]);

  const togglePlayback = () => {
    setMusicState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const currentLyric = musicState.lyrics[musicState.currentLyric] || musicState.lyrics[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Player Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground">{musicState.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Badge className="bg-primary/10 text-primary">{musicState.style}</Badge>
            <Badge variant="outline">Rang {musicState.rang}</Badge>
            <Badge variant="outline">{musicState.duration}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">IA Generated</span>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="bg-muted/30 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Waveform className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Visualisation Audio</span>
        </div>
        
        <div className="flex items-center justify-center space-x-1 h-16">
          {Array.from({ length: 40 }, (_, i) => (
            <motion.div
              key={i}
              className="bg-primary rounded-full w-1"
              animate={{
                height: musicState.isPlaying 
                  ? Math.random() * 40 + 8 
                  : 8,
              }}
              transition={{
                duration: 0.2,
                repeat: musicState.isPlaying ? Infinity : 0,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>

      {/* Lyrics Display */}
      <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
        <div className="text-center space-y-4">
          <motion.p
            key={musicState.currentLyric}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-medium text-foreground"
          >
            {currentLyric}
          </motion.p>
          
          <motion.div
            animate={{ 
              scale: musicState.isPlaying ? [1, 1.1, 1] : 1,
              rotate: musicState.isPlaying ? [0, 5, -5, 0] : 0 
            }}
            transition={{ 
              duration: 2, 
              repeat: musicState.isPlaying ? Infinity : 0,
              ease: "easeInOut" 
            }}
            className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto"
          >
            <Music className="w-6 h-6 text-primary" />
          </motion.div>
        </div>
      </div>

      {/* Player Controls */}
      <div className="space-y-4">
        <Progress value={musicState.progress} className="w-full" />
        
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full">
            <Volume2 className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={togglePlayback}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform"
          >
            {musicState.isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white" />
            )}
          </Button>
          
          <Button variant="outline" size="icon" className="rounded-full">
            <Sparkles className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Generation Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-success/5 border border-success/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-success">45s</div>
          <div className="text-sm text-muted-foreground">Temps de génération</div>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary">98%</div>
          <div className="text-sm text-muted-foreground">Précision médicale</div>
        </div>
      </div>
    </motion.div>
  );
});

// Interactive Tableau Component
const InteractiveTableau = memo(() => {
  const [tableauState, setTableauState] = useState(demoContent.tableau);
  const [animatingCells, setAnimatingCells] = useState<Set<string>>(new Set());

  const handleCellClick = (conceptIndex: number, field: string) => {
    const key = `${conceptIndex}-${field}`;
    setAnimatingCells(prev => new Set([...prev, key]));
    
    setTimeout(() => {
      setAnimatingCells(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }, 1000);
    
    setTableauState(prev => ({ ...prev, selectedConcept: conceptIndex }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Tableau Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground">{tableauState.title}</h3>
        <Badge className="bg-accent/10 text-accent">
          <Brain className="w-4 h-4 mr-2" />
          IA Structurée
        </Badge>
      </div>

      {/* Interactive Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left p-4 font-semibold text-foreground">Concept</th>
                <th className="text-left p-4 font-semibold text-foreground">Définition</th>
                <th className="text-left p-4 font-semibold text-foreground">Exemple</th>
                <th className="text-left p-4 font-semibold text-foreground">Piège</th>
                <th className="text-left p-4 font-semibold text-foreground">Mnémotechnique</th>
              </tr>
            </thead>
            <tbody>
              {tableauState.concepts.map((concept, index) => (
                <motion.tr
                  key={index}
                  className={cn(
                    "border-b border-border hover:bg-muted/20 cursor-pointer transition-colors",
                    tableauState.selectedConcept === index && "bg-primary/5 border-primary/20"
                  )}
                  whileHover={{ scale: 1.01 }}
                >
                  {(['concept', 'definition', 'exemple', 'piege', 'mnemo'] as const).map((field) => (
                    <motion.td
                      key={field}
                      className={cn(
                        "p-4 text-sm transition-colors",
                        animatingCells.has(`${index}-${field}`) && "bg-accent/20"
                      )}
                      onClick={() => handleCellClick(index, field)}
                      animate={animatingCells.has(`${index}-${field}`) ? {
                        scale: [1, 1.05, 1],
                        backgroundColor: ["transparent", "hsl(var(--accent) / 0.2)", "transparent"]
                      } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      {concept[field]}
                    </motion.td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Features */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
          <Target className="w-6 h-6 text-primary mx-auto mb-2" />
          <div className="text-sm font-medium text-primary">Interaction</div>
          <div className="text-xs text-muted-foreground">Cliquez sur les cellules</div>
        </div>
        
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 text-center">
          <Zap className="w-6 h-6 text-accent mx-auto mb-2" />
          <div className="text-sm font-medium text-accent">IA Adaptive</div>
          <div className="text-xs text-muted-foreground">Contenu intelligent</div>
        </div>
        
        <div className="bg-success/5 border border-success/20 rounded-lg p-4 text-center">
          <CheckCircle className="w-6 h-6 text-success mx-auto mb-2" />
          <div className="text-sm font-medium text-success">Validé</div>
          <div className="text-xs text-muted-foreground">Contenu expert</div>
        </div>
      </div>
    </motion.div>
  );
});

// Generation Process Component
const GenerationProcess = memo(() => {
  const [generationState, setGenerationState] = useState(demoContent.generation);
  const [isRunning, setIsRunning] = useState(false);

  const startGeneration = () => {
    setIsRunning(true);
    setGenerationState(prev => ({ ...prev, stage: "running", currentStep: 0, progress: 0 }));
    
    let totalProgress = 0;
    const steps = generationState.steps;
    
    steps.forEach((step, index) => {
      setTimeout(() => {
        setGenerationState(prev => ({ 
          ...prev, 
          currentStep: index,
          progress: ((index + 1) / steps.length) * 100
        }));
        
        if (index === steps.length - 1) {
          setTimeout(() => {
            setGenerationState(prev => ({ ...prev, stage: "completed" }));
            setIsRunning(false);
          }, step.duration);
        }
      }, totalProgress);
      
      totalProgress += step.duration;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Generation Header */}
      <div className="text-center space-y-4">
        <h3 className="text-xl font-bold text-foreground">Génération IA en Temps Réel</h3>
        <p className="text-muted-foreground">
          Découvrez comment notre IA crée du contenu médical personnalisé
        </p>
      </div>

      {/* Generation Steps */}
      <div className="space-y-4">
        {generationState.steps.map((step, index) => (
          <motion.div
            key={index}
            className={cn(
              "flex items-center gap-4 p-4 rounded-lg border transition-all duration-300",
              generationState.currentStep === index && isRunning
                ? "bg-primary/10 border-primary/20"
                : generationState.currentStep > index && generationState.stage === "completed"
                ? "bg-success/10 border-success/20"
                : "bg-muted/10 border-border"
            )}
            animate={generationState.currentStep === index && isRunning ? {
              scale: [1, 1.02, 1],
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              generationState.currentStep === index && isRunning
                ? "bg-primary text-primary-foreground"
                : generationState.currentStep > index && generationState.stage === "completed"
                ? "bg-success text-success-foreground"
                : "bg-muted text-muted-foreground"
            )}>
              {generationState.currentStep > index && generationState.stage === "completed" ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <span className="text-sm font-bold">{index + 1}</span>
              )}
            </div>
            
            <div className="flex-1">
              <div className="font-medium">{step.name}</div>
              <div className="text-sm text-muted-foreground">
                {generationState.currentStep === index && isRunning
                  ? "En cours..."
                  : generationState.currentStep > index && generationState.stage === "completed"
                  ? "Terminé"
                  : "En attente"
                }
              </div>
            </div>
            
            {generationState.currentStep === index && isRunning && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5"
              >
                <Zap className="w-5 h-5 text-primary" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progression générale</span>
          <span>{Math.round(generationState.progress)}%</span>
        </div>
        <Progress value={generationState.progress} className="w-full" />
      </div>

      {/* Control Button */}
      <div className="text-center">
        <Button
          onClick={startGeneration}
          disabled={isRunning}
          className="px-8 py-4 text-lg font-semibold"
        >
          {isRunning ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 mr-2"
              >
                <Zap className="w-5 h-5" />
              </motion.div>
              Génération en cours...
            </>
          ) : generationState.stage === "completed" ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Génération Terminée
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Démarrer la Génération
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {generationState.stage === "completed" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-success/5 border border-success/20 rounded-lg p-6 text-center"
        >
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
          <h4 className="text-lg font-bold text-success mb-2">Génération Réussie !</h4>
          <p className="text-muted-foreground">
            Contenu médical généré et validé en moins d'une minute
          </p>
        </motion.div>
      )}
    </motion.div>
  );
});

// Main Interactive Demo Component
const InteractiveDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState("music");

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50">
          <TabsTrigger value="music" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            IA Musicale
          </TabsTrigger>
          <TabsTrigger value="tableau" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Tableaux IA
          </TabsTrigger>
          <TabsTrigger value="generation" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Processus IA
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="music">
            <Card className="medical-card-premium">
              <CardContent className="p-8">
                <InteractiveMusicPlayer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tableau">
            <Card className="medical-card-premium">
              <CardContent className="p-8">
                <InteractiveTableau />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generation">
            <Card className="medical-card-premium">
              <CardContent className="p-8">
                <GenerationProcess />
              </CardContent>
            </Card>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};

export default memo(InteractiveDemo);