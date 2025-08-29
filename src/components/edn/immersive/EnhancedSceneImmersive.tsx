import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Maximize2,
  Eye,
  Compass,
  Zap,
  Sparkles,
  Brain,
  Target,
  Heart,
  Star,
  Camera,
  Mic,
  Settings,
  Monitor,
  Headphones,
  Gamepad2
} from 'lucide-react';

interface SceneData {
  title: string;
  description: string;
  mots_cles?: string[];
  effet?: string;
  setting?: string;
  characters?: string[];
  interactions?: Array<{
    id: string;
    type: 'click' | 'hover' | 'voice' | 'gesture';
    target: string;
    response: string;
    medicalInfo?: string;
  }>;
}

interface EnhancedSceneImmersiveProps {
  data: SceneData | null;
  itemCode: string;
  title: string;
}

export const EnhancedSceneImmersive = ({ data, itemCode, title }: EnhancedSceneImmersiveProps) => {
  const [isActive, setIsActive] = useState(false);
  const [currentKeyword, setCurrentKeyword] = useState(0);
  const [immersionLevel, setImmersionLevel] = useState(0);
  const [isVRMode, setIsVRMode] = useState(false);
  const [currentEnvironment, setCurrentEnvironment] = useState<'hospital' | 'emergency' | 'lab' | 'home'>('hospital');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(75);
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0, z: 0 });
  const [interactionMode, setInteractionMode] = useState<'mouse' | 'touch' | 'voice' | 'gesture'>('mouse');
  const [emotionalState, setEmotionalState] = useState<'calm' | 'focused' | 'engaged' | 'excited'>('calm');
  const [learningProgress, setLearningProgress] = useState(0);
  
  const sceneRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const sceneData = data || {
    title: title || "Scène Médicale Interactive",
    description: "Explorez cette situation clinique en mode immersif",
    mots_cles: ["Diagnostic", "Traitement", "Prévention", "Suivi", "Urgence"],
    effet: "Immersion totale dans l'environnement médical",
    setting: "Service de médecine moderne",
    characters: ["Médecin", "Patient", "Infirmière", "Famille"],
    interactions: [
      {
        id: "patient-bed",
        type: "click",
        target: "Lit du patient",
        response: "Examen du patient en cours...",
        medicalInfo: "Surveillance des constantes vitales"
      },
      {
        id: "monitor",
        type: "hover",
        target: "Moniteur médical",
        response: "Données physiologiques en temps réel",
        medicalInfo: "FC: 72 bpm, PA: 120/80 mmHg, SpO2: 98%"
      }
    ]
  };

  const environments = {
    hospital: {
      name: "Hôpital",
      gradient: "from-blue-900 via-blue-800 to-cyan-900",
      particles: ["🏥", "⚕️", "🩺"],
      ambiance: "Environnement hospitalier moderne et technologique"
    },
    emergency: {
      name: "Urgences",
      gradient: "from-red-900 via-orange-800 to-yellow-900",
      particles: ["🚨", "⚡", "🆘"],
      ambiance: "Urgences médicales - Réactivité et efficacité"
    },
    lab: {
      name: "Laboratoire",
      gradient: "from-green-900 via-emerald-800 to-teal-900",
      particles: ["🔬", "🧪", "⚗️"],
      ambiance: "Laboratoire d'analyses - Précision scientifique"
    },
    home: {
      name: "Domicile",
      gradient: "from-purple-900 via-violet-800 to-indigo-900",
      particles: ["🏠", "👨‍👩‍👧‍👦", "💊"],
      ambiance: "Soins à domicile - Proximité et humanité"
    }
  };

  const currentEnv = environments[currentEnvironment];

  // Animation des mots-clés
  useEffect(() => {
    if (isActive && sceneData.mots_cles && sceneData.mots_cles.length > 0) {
      const interval = setInterval(() => {
        setCurrentKeyword((prev) => (prev + 1) % sceneData.mots_cles!.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isActive, sceneData.mots_cles]);

  // Progression de l'immersion
  useEffect(() => {
    if (isActive) {
      const timer = setInterval(() => {
        setImmersionLevel(prev => {
          const newLevel = Math.min(prev + 2, 100);
          if (newLevel > 25) setEmotionalState('focused');
          if (newLevel > 50) setEmotionalState('engaged');
          if (newLevel > 75) setEmotionalState('excited');
          return newLevel;
        });
      }, 200);
      return () => clearInterval(timer);
    } else {
      setImmersionLevel(0);
      setEmotionalState('calm');
    }
  }, [isActive]);

  // Animations des particules 3D
  const Particle3D = ({ emoji, index }: { emoji: string; index: number }) => (
    <motion.div
      className="absolute text-4xl opacity-30 pointer-events-none"
      initial={{
        x: Math.random() * 100 + '%',
        y: Math.random() * 100 + '%',
        z: Math.random() * 1000,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        scale: 0
      }}
      animate={{
        x: [
          Math.random() * 100 + '%',
          Math.random() * 100 + '%',
          Math.random() * 100 + '%'
        ],
        y: [
          Math.random() * 100 + '%',
          Math.random() * 100 + '%',
          Math.random() * 100 + '%'
        ],
        rotateX: [0, 360, 720],
        rotateY: [0, 180, 360],
        rotateZ: [0, 180, 360],
        scale: [0, 1, 0.8, 1, 0]
      }}
      transition={{
        duration: 8 + Math.random() * 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.5
      }}
      style={{
        transform: `translate3d(${cameraPosition.x}px, ${cameraPosition.y}px, ${cameraPosition.z}px)`
      }}
    >
      {emoji}
    </motion.div>
  );

  const handleCameraMove = (direction: 'up' | 'down' | 'left' | 'right' | 'forward' | 'back') => {
    setCameraPosition(prev => {
      switch (direction) {
        case 'up': return { ...prev, y: prev.y - 10 };
        case 'down': return { ...prev, y: prev.y + 10 };
        case 'left': return { ...prev, x: prev.x - 10 };
        case 'right': return { ...prev, x: prev.x + 10 };
        case 'forward': return { ...prev, z: prev.z + 10 };
        case 'back': return { ...prev, z: prev.z - 10 };
        default: return prev;
      }
    });
  };

  const resetCamera = () => {
    setCameraPosition({ x: 0, y: 0, z: 0 });
  };

  const toggleVRMode = () => {
    setIsVRMode(!isVRMode);
    setImmersionLevel(prev => isVRMode ? prev - 20 : Math.min(prev + 30, 100));
  };

  const getEmotionColor = () => {
    switch (emotionalState) {
      case 'calm': return 'text-blue-400';
      case 'focused': return 'text-green-400';
      case 'engaged': return 'text-yellow-400';
      case 'excited': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentEnv.gradient} relative overflow-hidden`}>
      {/* Particules 3D de l'environnement */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {currentEnv.particles.map((particle, i) => (
          <Particle3D key={i} emoji={particle} index={i} />
        ))}
      </div>

      {/* Interface de contrôle VR/AR */}
      <motion.div
        className="absolute top-6 right-6 z-50"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-black/40 backdrop-blur-xl border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant={isVRMode ? "default" : "outline"}
                onClick={toggleVRMode}
                className={isVRMode ? "bg-purple-600" : "text-white border-white/30"}
              >
                <Monitor className="h-4 w-4 mr-2" />
                {isVRMode ? "VR Actif" : "Mode VR"}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="text-white border-white/30"
              >
                <Camera className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant={soundEnabled ? "default" : "outline"}
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={soundEnabled ? "bg-green-600" : "text-white border-white/30"}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="relative z-10 p-6">
        {/* Header immersif */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <Card className="bg-black/30 backdrop-blur-2xl border border-white/20 overflow-hidden">
            <CardHeader>
              <motion.div
                className="flex items-center justify-between"
                animate={{ 
                  background: `linear-gradient(90deg, 
                    hsla(${immersionLevel * 3.6}, 70%, 50%, 0.1) 0%, 
                    hsla(${(immersionLevel * 3.6 + 60) % 360}, 70%, 50%, 0.1) 100%)`
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ 
                      rotate: isActive ? 360 : 0,
                      scale: isActive ? [1, 1.2, 1] : 1
                    }}
                    transition={{ 
                      rotate: { duration: 2, repeat: isActive ? Infinity : 0, ease: "linear" },
                      scale: { duration: 1, repeat: isActive ? Infinity : 0 }
                    }}
                  >
                    <Eye className="h-8 w-8 text-cyan-400" />
                  </motion.div>
                  
                  <div>
                    <CardTitle className="text-2xl font-bold text-white mb-1">
                      Scène Immersive Interactive
                    </CardTitle>
                    <p className="text-cyan-300">{sceneData.title}</p>
                    <p className="text-gray-300 text-sm">{currentEnv.ambiance}</p>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="outline" className="text-white border-white/30 mb-2">
                    {itemCode}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className={`h-4 w-4 ${getEmotionColor()}`} />
                    <span className={`font-semibold ${getEmotionColor()}`}>
                      {emotionalState.toUpperCase()}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Contrôles d'environnement */}
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                {Object.entries(environments).map(([key, env]) => (
                  <Button
                    key={key}
                    size="sm"
                    variant={currentEnvironment === key ? "default" : "outline"}
                    onClick={() => setCurrentEnvironment(key as typeof currentEnvironment)}
                    className={currentEnvironment === key 
                      ? "bg-white/20 text-white" 
                      : "text-white/80 border-white/30 hover:bg-white/10"
                    }
                  >
                    {env.particles[0]} {env.name}
                  </Button>
                ))}
              </div>

              {/* Barre d'immersion */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-white/80 mb-2">
                  <span>Niveau d'immersion</span>
                  <span>{immersionLevel}%</span>
                </div>
                <Progress value={immersionLevel} className="h-3" />
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Zone de scène principale */}
        <motion.div
          ref={sceneRef}
          className="relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="bg-gradient-to-br from-black/40 to-transparent backdrop-blur-3xl border border-white/20 min-h-[500px] overflow-hidden">
            <CardContent className="p-0 relative">
              {/* Environnement 3D simulé */}
              <motion.div
                className="h-96 relative flex items-center justify-center"
                animate={{
                  rotateX: cameraPosition.y * 0.1,
                  rotateY: cameraPosition.x * 0.1,
                  scale: 1 + (cameraPosition.z * 0.001)
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Grille de profondeur */}
                <div className="absolute inset-0 opacity-20">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute border border-white/10"
                      style={{
                        width: `${(i + 1) * 10}%`,
                        height: `${(i + 1) * 10}%`,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 10 + i,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  ))}
                </div>

                {/* Zone d'interaction centrale */}
                <motion.div
                  className="relative z-10 bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 min-w-[300px] min-h-[200px]"
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(56, 189, 248, 0)",
                      "0 0 0 20px rgba(56, 189, 248, 0.1)",
                      "0 0 0 0 rgba(56, 189, 248, 0)"
                    ]
                  }}
                  transition={{ 
                    boxShadow: { duration: 2, repeat: Infinity },
                    scale: { duration: 0.3 },
                    rotateY: { duration: 0.3 }
                  }}
                >
                  <div className="text-center">
                    <motion.div
                      className="text-6xl mb-4"
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      {currentEnv.particles[0]}
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {sceneData.title}
                    </h3>
                    
                    <p className="text-gray-300 mb-4">
                      {sceneData.description}
                    </p>

                    {/* Mots-clés animés */}
                    <AnimatePresence mode="wait">
                      {sceneData.mots_cles && sceneData.mots_cles.length > 0 && (
                        <motion.div
                          key={currentKeyword}
                          initial={{ y: 20, opacity: 0, rotateX: -90 }}
                          animate={{ y: 0, opacity: 1, rotateX: 0 }}
                          exit={{ y: -20, opacity: 0, rotateX: 90 }}
                          className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full px-6 py-2 inline-block border border-cyan-400/30"
                        >
                          <span className="text-cyan-300 font-semibold">
                            {sceneData.mots_cles[currentKeyword]}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Bouton d'activation */}
                    <motion.div className="mt-6">
                    <motion.div
                      whileHover={{ scale: 1.05, rotateZ: isActive ? 0 : 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        onClick={() => setIsActive(!isActive)}
                        className={`${
                          isActive 
                            ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600' 
                            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                        } text-white font-semibold px-8 py-3 rounded-xl shadow-2xl`}
                      >
                        {isActive ? (
                          <>
                            <Pause className="h-5 w-5 mr-2" />
                            Arrêter l'Immersion
                          </>
                        ) : (
                          <>
                            <Play className="h-5 w-5 mr-2" />
                            Démarrer l'Immersion
                          </>
                        )}
                      </Button>
                    </motion.div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Points d'interaction flottants */}
                {sceneData.interactions?.map((interaction, index) => (
                  <motion.div
                    key={interaction.id}
                    className="absolute w-8 h-8 bg-yellow-400/80 rounded-full flex items-center justify-center cursor-pointer"
                    style={{
                      left: `${20 + index * 15}%`,
                      top: `${30 + (index % 2) * 40}%`
                    }}
                    animate={{
                      scale: [1, 1.3, 1],
                      rotate: [0, 180, 360],
                      boxShadow: [
                        "0 0 0 0 rgba(251, 191, 36, 0.7)",
                        "0 0 0 10px rgba(251, 191, 36, 0)",
                        "0 0 0 0 rgba(251, 191, 36, 0.7)"
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3
                    }}
                    whileHover={{ scale: 1.5 }}
                    onClick={() => {
                      // Interaction click handler
                      console.log(`Interaction: ${interaction.response}`);
                    }}
                  >
                    <Zap className="h-4 w-4 text-white" />
                  </motion.div>
                ))}
              </motion.div>

              {/* Contrôles de caméra 3D */}
              <motion.div
                className="absolute bottom-4 left-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: isActive ? 1 : 0.5, y: 0 }}
              >
                <Card className="bg-black/60 backdrop-blur-xl border border-white/20">
                  <CardContent className="p-4">
                    <div className="text-white text-sm mb-2 flex items-center gap-2">
                      <Compass className="h-4 w-4" />
                      <span>Caméra 3D</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <div></div>
                      <Button size="sm" variant="ghost" onClick={() => handleCameraMove('up')} className="text-white hover:bg-white/20">↑</Button>
                      <div></div>
                      <Button size="sm" variant="ghost" onClick={() => handleCameraMove('left')} className="text-white hover:bg-white/20">←</Button>
                      <Button size="sm" variant="ghost" onClick={resetCamera} className="text-white hover:bg-white/20">⌂</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleCameraMove('right')} className="text-white hover:bg-white/20">→</Button>
                      <div></div>
                      <Button size="sm" variant="ghost" onClick={() => handleCameraMove('down')} className="text-white hover:bg-white/20">↓</Button>
                      <div></div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Button size="sm" variant="ghost" onClick={() => handleCameraMove('forward')} className="text-white hover:bg-white/20 text-xs">+</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleCameraMove('back')} className="text-white hover:bg-white/20 text-xs">-</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Panneau d'informations médicales */}
              {isActive && (
                <motion.div
                  className="absolute bottom-4 right-4 max-w-xs"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                >
                  <Card className="bg-black/60 backdrop-blur-xl border border-white/20">
                    <CardContent className="p-4">
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-400" />
                        Contexte Médical
                      </h4>
                      <p className="text-gray-300 text-sm mb-3">
                        {sceneData.setting}
                      </p>
                      <div className="space-y-2">
                        <div className="text-xs text-gray-400">Personnages:</div>
                        {sceneData.characters?.map((character, index) => (
                          <Badge key={index} variant="outline" className="text-white border-white/30 mr-1">
                            {character}
                          </Badge>
                        ))}
                      </div>
                      {sceneData.effet && (
                        <div className="mt-3 p-2 bg-purple-500/20 rounded-lg">
                          <div className="text-xs text-purple-300 mb-1">Effet Immersif:</div>
                          <div className="text-xs text-white">{sceneData.effet}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Panneau de contrôles avancés */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Card className="bg-black/30 backdrop-blur-xl border border-white/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Mode d'interaction */}
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4" />
                    Mode d'Interaction
                  </h4>
                  <div className="space-y-2">
                    {['mouse', 'touch', 'voice', 'gesture'].map((mode) => (
                      <Button
                        key={mode}
                        size="sm"
                        variant={interactionMode === mode ? "default" : "outline"}
                        onClick={() => setInteractionMode(mode as typeof interactionMode)}
                        className={`w-full justify-start ${
                          interactionMode === mode 
                            ? "bg-white/20 text-white" 
                            : "text-white/80 border-white/30 hover:bg-white/10"
                        }`}
                      >
                        {mode === 'mouse' && '🖱️'}
                        {mode === 'touch' && '👆'}
                        {mode === 'voice' && '🎤'}
                        {mode === 'gesture' && '👋'}
                        <span className="ml-2 capitalize">{mode}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Audio et ambiance */}
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Headphones className="h-4 w-4" />
                    Audio & Ambiance
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400">Volume</label>
                      <Slider
                        value={[volume]}
                        onValueChange={([value]) => setVolume(value)}
                        min={0}
                        max={100}
                        className="mt-1"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-white/80 border-white/30 hover:bg-white/10"
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Narration IA
                    </Button>
                  </div>
                </div>

                {/* Statistiques de performance */}
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Performance
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Engagement:</span>
                      <span className="text-white">{immersionLevel}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Apprentissage:</span>
                      <span className="text-white">{learningProgress}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">État:</span>
                      <span className={`capitalize ${getEmotionColor()}`}>{emotionalState}</span>
                    </div>
                  </div>
                </div>

                {/* Actions rapides */}
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Actions Rapides
                  </h4>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-white/80 border-white/30 hover:bg-white/10 justify-start"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-white/80 border-white/30 hover:bg-white/10 justify-start"
                    >
                      <Maximize2 className="h-4 w-4 mr-2" />
                      Plein écran
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-white/80 border-white/30 hover:bg-white/10 justify-start"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Capture
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};