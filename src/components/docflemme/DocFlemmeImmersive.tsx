import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, Zap, Target, Trophy, Sparkles, Play, Pause, Volume2,
  Activity, BarChart, Clock, User, Heart, Download, Share2, Music,
  Headphones, Radio, Waves, Mic, Settings, ArrowLeft, Home
} from 'lucide-react';
import { DocFlemmeStudio } from './DocFlemmeStudio';

interface DocFlemmeImmersiveProps {
  itemData: {
    item_code: string;
    title: string;
    subtitle?: string;
    pitch_intro?: string;
    paroles_rang_a?: string[];
    paroles_rang_b?: string[];
    paroles_rang_ab?: string[];
    tableau_rang_a?: any;
    tableau_rang_b?: any;
  };
  onBack?: () => void;
}

interface ImmersiveScene {
  id: string;
  name: string;
  description: string;
  environment: string;
  neuralPattern: string;
  bgGradient: string;
  soundscape: string[];
  effectiveness: number;
}

export const DocFlemmeImmersive = ({ itemData, onBack }: DocFlemmeImmersiveProps) => {
  const [currentScene, setCurrentScene] = useState<string>('studio');
  const [isGenerating, setIsGenerating] = useState(false);
  const [immersionLevel, setImmersionLevel] = useState(0);
  const [neuralActivity, setNeuralActivity] = useState({
    focus: 0,
    creativity: 0,
    memory: 0,
    motivation: 0
  });

  const immersiveScenes: ImmersiveScene[] = [
    {
      id: 'studio',
      name: 'Studio DocFlemme',
      description: 'Le laboratoire de génération musicale révolutionnaire',
      environment: 'Studio de production avancé avec IA neurocognitive',
      neuralPattern: 'Optimisation créative et technique',
      bgGradient: 'from-indigo-900 via-purple-900 to-pink-900',
      soundscape: ['Ambiance studio', 'Beats créatifs', 'Sons futuristes'],
      effectiveness: 95
    },
    {
      id: 'jogging',
      name: 'Mode Footing',
      description: 'Apprends en courant avec des beats adaptatifs',
      environment: 'Environnement sportif avec rythmes motivants',
      neuralPattern: 'Mémoire kinesthésique activée',
      bgGradient: 'from-orange-600 via-red-600 to-pink-600',
      soundscape: ['Rythmes cardio', 'Beats énergiques', 'Motivationels'],
      effectiveness: 92
    },
    {
      id: 'shower',
      name: 'Mode Douche',
      description: 'Détente cognitive avec mélodies apaisantes',
      environment: 'Ambiance relaxante et immersive',
      neuralPattern: 'Neuroplasticité optimisée',
      bgGradient: 'from-blue-600 via-cyan-600 to-teal-600',
      soundscape: ['Sons aquatiques', 'Mélodies douces', 'Harmonies zen'],
      effectiveness: 88
    },
    {
      id: 'meditation',
      name: 'Mode Méditation',
      description: 'Concentration profonde et mémorisation active',
      environment: 'Espace de concentration pure',
      neuralPattern: 'États contemplatifs renforcés',
      bgGradient: 'from-purple-800 via-indigo-800 to-blue-800',
      soundscape: ['Fréquences theta', 'Ambiances méditatives', 'Tons purs'],
      effectiveness: 90
    }
  ];

  const currentSceneData = immersiveScenes.find(scene => scene.id === currentScene) || immersiveScenes[0];

  // Simulation de l'activité neurale
  useEffect(() => {
    const interval = setInterval(() => {
      setNeuralActivity(prev => ({
        focus: Math.min(95, prev.focus + Math.random() * 5),
        creativity: Math.min(95, prev.creativity + Math.random() * 4),
        memory: Math.min(95, prev.memory + Math.random() * 6),
        motivation: Math.min(95, prev.motivation + Math.random() * 3)
      }));
      
      setImmersionLevel(prev => Math.min(100, prev + Math.random() * 2));
    }, 500);

    return () => clearInterval(interval);
  }, [currentScene]);

  const SceneSelector = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {immersiveScenes.map((scene) => (
        <motion.div
          key={scene.id}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card 
            className={`cursor-pointer transition-all duration-500 border-2 bg-gradient-to-br ${scene.bgGradient} ${
              currentScene === scene.id 
                ? 'border-white/60 shadow-2xl scale-105' 
                : 'border-white/20 hover:border-white/40 opacity-80'
            }`}
            onClick={() => setCurrentScene(scene.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">{scene.name}</CardTitle>
                <Badge className="bg-white/20 text-white border-0">
                  {scene.effectiveness}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/90 text-sm mb-3">{scene.description}</p>
              <div className="text-xs text-white/70">
                <p className="mb-1"><strong>Environnement:</strong> {scene.environment}</p>
                <p><strong>Pattern neural:</strong> {scene.neuralPattern}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const NeuralActivityDashboard = () => (
    <Card className="bg-black/30 backdrop-blur-xl border border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          Activité Neurale Temps Réel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'focus', label: 'Focus', color: 'from-blue-500 to-cyan-500', icon: Target },
            { key: 'creativity', label: 'Créativité', color: 'from-purple-500 to-pink-500', icon: Sparkles },
            { key: 'memory', label: 'Mémoire', color: 'from-green-500 to-emerald-500', icon: Brain },
            { key: 'motivation', label: 'Motivation', color: 'from-orange-500 to-red-500', icon: Zap }
          ].map(({ key, label, color, icon: Icon }) => (
            <div key={key} className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="text-sm text-white font-medium">{label}</div>
              <div className="text-2xl font-bold text-white mb-2">
                {Math.round(neuralActivity[key as keyof typeof neuralActivity])}%
              </div>
              <Progress 
                value={neuralActivity[key as keyof typeof neuralActivity]} 
                className={`h-2 bg-gradient-to-r ${color}`}
              />
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-400/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span className="text-white font-semibold">Immersion DocFlemme</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={immersionLevel} className="h-3" />
            </div>
            <div className="text-white font-bold">{Math.round(immersionLevel)}%</div>
          </div>
          <p className="text-sm text-gray-300 mt-2">
            {currentSceneData.neuralPattern}
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );

  const ImmersiveSoundscape = () => (
    <Card className="bg-black/30 backdrop-blur-xl border border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Headphones className="h-5 w-5 text-green-400" />
          Paysage Sonore Immersif
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentSceneData.soundscape.map((sound, index) => (
            <motion.div
              key={sound}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 rounded-lg p-3 border border-white/20"
            >
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 w-10 h-10 rounded-full"
                >
                  <Play className="h-4 w-4" />
                </Button>
                <div>
                  <div className="text-white text-sm font-medium">{sound}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 h-3 bg-green-400 rounded-full"
                        animate={{ 
                          scaleY: [0.3, 1, 0.3],
                          opacity: [0.3, 1, 0.3]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.1
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (currentScene === 'studio') {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${currentSceneData.bgGradient} relative overflow-hidden`}>
        {/* Navigation */}
        <div className="relative z-20 p-6">
          <div className="flex items-center gap-4 mb-6">
            {onBack && (
              <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            )}
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <Home className="h-4 w-4 mr-2" />
              Accueil
            </Button>
          </div>

          {/* Scene Selector */}
          <SceneSelector />
          
          {/* Neural Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <NeuralActivityDashboard />
            <ImmersiveSoundscape />
          </div>
        </div>

        {/* Studio Component */}
        <DocFlemmeStudio 
          itemCode={itemData.item_code}
          title={itemData.title}
          subtitle={itemData.subtitle || ''}
          paroles={{
            rang_a: itemData.paroles_rang_a,
            rang_b: itemData.paroles_rang_b,
            rang_ab: itemData.paroles_rang_ab
          }}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentSceneData.bgGradient} relative overflow-hidden`}>
      {/* Particules spécifiques à la scène */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-10"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              rotate: [0, 360],
              scale: [0.5, 1.5, 0.5]
            }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.4
            }}
          >
            {currentScene === 'jogging' && ['🏃‍♂️', '💪', '⚡', '🎵'][i % 4]}
            {currentScene === 'shower' && ['🚿', '💧', '🎶', '🧠'][i % 4]}
            {currentScene === 'meditation' && ['🧘‍♀️', '🕉️', '✨', '🎼'][i % 4]}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 p-6">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-6">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          )}
          <Button variant="ghost" className="text-white hover:bg-white/20">
            <Home className="h-4 w-4 mr-2" />
            Accueil
          </Button>
        </div>

        {/* Scene Selector */}
        <SceneSelector />

        {/* Scene Content */}
        <motion.div
          key={currentScene}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header de la scène */}
          <Card className="bg-black/30 backdrop-blur-2xl border border-white/20">
            <CardHeader>
              <div className="text-center">
                <motion.h1
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-4xl font-bold text-white mb-4"
                >
                  {currentSceneData.name}
                </motion.h1>
                <p className="text-xl text-white/90 mb-4">{currentSceneData.description}</p>
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-lg px-4 py-2">
                  {currentSceneData.effectiveness}% EFFICACITÉ NEURALE
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Dashboard principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NeuralActivityDashboard />
            <ImmersiveSoundscape />
          </div>

          {/* Contrôles spécifiques à la scène */}
          <Card className="bg-black/30 backdrop-blur-xl border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-400" />
                Contrôles Immersifs - {currentSceneData.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Contenu spécifique selon la scène */}
              {currentScene === 'jogging' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">🏃‍♂️ Mode Footing Activé</h3>
                    <p className="text-lg text-white/90 mb-6">
                      Synchronise tes pas avec les beats médicaux. Chaque foulée renforce ta mémoire !
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-white/10 border border-white/20">
                        <CardContent className="p-4 text-center">
                          <Activity className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                          <div className="text-white font-bold text-lg">128 BPM</div>
                          <div className="text-white/70 text-sm">Rythme Cardio</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/10 border border-white/20">
                        <CardContent className="p-4 text-center">
                          <Target className="h-8 w-8 text-green-400 mx-auto mb-2" />
                          <div className="text-white font-bold text-lg">5 km</div>
                          <div className="text-white/70 text-sm">Distance Optimale</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/10 border border-white/20">
                        <CardContent className="p-4 text-center">
                          <Brain className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                          <div className="text-white font-bold text-lg">+85%</div>
                          <div className="text-white/70 text-sm">Rétention</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {currentScene === 'shower' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">🚿 Mode Douche Activé</h3>
                    <p className="text-lg text-white/90 mb-6">
                      L'eau chaude détend, les mélodies pénètrent. Apprentissage passif optimal !
                    </p>
                    <div className="space-y-4">
                      <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                        <Waves className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                        <h4 className="text-white font-bold text-lg mb-2">Neuroplasticité Maximale</h4>
                        <p className="text-white/80">
                          L'état de relaxation favorise la formation de nouvelles connexions synaptiques
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentScene === 'meditation' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">🧘‍♀️ Mode Méditation Activé</h3>
                    <p className="text-lg text-white/90 mb-6">
                      Concentration pure. Les concepts s'intègrent naturellement dans ta conscience.
                    </p>
                    <div className="space-y-4">
                      <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                        <Brain className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                        <h4 className="text-white font-bold text-lg mb-2">États Contemplatifs</h4>
                        <p className="text-white/80">
                          Ondes thêta et alpha optimisées pour l'intégration profonde des connaissances
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bouton de génération universel */}
              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => setIsGenerating(!isGenerating)}
                  size="lg"
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-2xl"
                >
                  {isGenerating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="mr-3"
                      >
                        <Zap className="w-6 h-6" />
                      </motion.div>
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Music className="w-6 h-6 mr-3" />
                      Générer pour {currentSceneData.name}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};