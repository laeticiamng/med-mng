import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Volume2,
  VolumeX,
  Maximize,
  Eye,
  Brain,
  Sparkles,
  Target,
  Users,
  Clock,
  Award,
  Lightbulb,
  Zap
} from 'lucide-react';
import { SceneImmersive } from '@/components/edn/SceneImmersive';

interface ImmersiveSceneDisplayProps {
  data: any;
  itemCode: string;
  title: string;
}

export const ImmersiveSceneDisplay = ({ data, itemCode, title }: ImmersiveSceneDisplayProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [userEngagement, setUserEngagement] = useState(0);
  const [immersionLevel, setImmersionLevel] = useState(1);

  // Données de scène simulées si pas de données
  const defaultScenes = [
    {
      id: 'intro',
      title: 'Introduction au Cas Clinique',
      description: 'Découvrez le contexte médical et les enjeux',
      duration: 30,
      type: 'introduction',
      content: 'Vous êtes face à un cas clinique complexe nécessitant une analyse approfondie...'
    },
    {
      id: 'analysis',
      title: 'Analyse Diagnostique',
      description: 'Explorez les symptômes et signes cliniques',
      duration: 45,
      type: 'interactive',
      content: 'Examinez attentivement les éléments cliniques présentés...'
    },
    {
      id: 'decision',
      title: 'Prise de Décision Thérapeutique',
      description: 'Choisissez la meilleure approche thérapeutique',
      duration: 40,
      type: 'decision',
      content: 'Quelle décision thérapeutique prendriez-vous dans cette situation ?'
    },
    {
      id: 'conclusion',
      title: 'Synthèse et Apprentissages',
      description: 'Consolidez vos acquis et les points clés',
      duration: 25,
      type: 'conclusion',
      content: 'Les points essentiels à retenir de ce cas clinique sont...'
    }
  ];

  const scenes = data?.scenes || defaultScenes;
  const currentSceneData = scenes[currentScene] || defaultScenes[0];

  // Animation de progression automatique
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setSceneProgress(prev => {
          if (prev >= 100) {
            // Passer à la scène suivante automatiquement
            if (currentScene < scenes.length - 1) {
              setCurrentScene(prev => prev + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          return prev + (100 / (currentSceneData.duration || 30));
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, currentScene, scenes.length, currentSceneData.duration]);

  // Mise à jour de l'engagement utilisateur
  useEffect(() => {
    const engagement = Math.min(100, (currentScene + 1) / scenes.length * 100 + sceneProgress / scenes.length);
    setUserEngagement(engagement);
    
    // Niveau d'immersion basé sur l'engagement
    setImmersionLevel(Math.floor(engagement / 25) + 1);
  }, [currentScene, sceneProgress, scenes.length]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextScene = () => {
    if (currentScene < scenes.length - 1) {
      setCurrentScene(currentScene + 1);
      setSceneProgress(0);
    }
  };

  const prevScene = () => {
    if (currentScene > 0) {
      setCurrentScene(currentScene - 1);
      setSceneProgress(0);
    }
  };

  const getSceneTypeConfig = (type: string) => {
    const configs = {
      introduction: {
        color: 'from-blue-600 to-indigo-600',
        bg: 'from-blue-50 to-indigo-50',
        icon: Eye,
        particles: ['🔍', '📋', '🏥']
      },
      interactive: {
        color: 'from-purple-600 to-pink-600',
        bg: 'from-purple-50 to-pink-50',
        icon: Brain,
        particles: ['🧠', '⚡', '🎯']
      },
      decision: {
        color: 'from-emerald-600 to-teal-600',
        bg: 'from-emerald-50 to-teal-50',
        icon: Target,
        particles: ['🎯', '⚖️', '✅']
      },
      conclusion: {
        color: 'from-amber-600 to-orange-600',
        bg: 'from-amber-50 to-orange-50',
        icon: Award,
        particles: ['🏆', '🌟', '📚']
      }
    };
    
    return configs[type as keyof typeof configs] || configs.introduction;
  };

  const sceneConfig = getSceneTypeConfig(currentSceneData.type);

  // Particules d'immersion
  const ImmersionParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: immersionLevel * 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl opacity-30"
          initial={{ 
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            scale: 0
          }}
          animate={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            scale: [0, 1, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: i * 0.5
          }}
        >
          {sceneConfig.particles[i % sceneConfig.particles.length]}
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className={`relative min-h-screen transition-all duration-1000 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Arrière-plan immersif dynamique */}
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-br ${sceneConfig.bg} transition-all duration-1000`}
        key={currentSceneData.type}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
      />
      
      <ImmersionParticles />

      <div className="relative z-10 space-y-6 p-4">
        {/* Header de contrôle immersif */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="bg-white/10 backdrop-blur-2xl border-white/20 overflow-hidden">
            <CardHeader className={`bg-gradient-to-r ${sceneConfig.color} text-white relative`}>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ 
                        scale: isPlaying ? [1, 1.2, 1] : 1,
                        rotate: isPlaying ? [0, 10, -10, 0] : 0
                      }}
                      transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
                    >
                      <sceneConfig.icon className="h-8 w-8" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-2xl font-bold">
                        Expérience Immersive
                      </CardTitle>
                      <p className="text-white/90 text-sm">
                        {title} - {itemCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      Niveau {immersionLevel}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Informations de la scène actuelle */}
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">
                      {currentSceneData.title}
                    </h3>
                    <span className="text-sm opacity-90">
                      Scène {currentScene + 1}/{scenes.length}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm mb-3">
                    {currentSceneData.description}
                  </p>
                  
                  {/* Barre de progression de la scène */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs opacity-75">Progression:</span>
                    <Progress 
                      value={sceneProgress} 
                      className="flex-1 h-2 bg-white/20" 
                    />
                    <span className="text-xs opacity-75">
                      {Math.round(sceneProgress)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Contrôles de navigation */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="bg-white/10 backdrop-blur-2xl border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevScene}
                    disabled={currentScene === 0}
                    className="text-white hover:bg-white/20 disabled:opacity-30"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>

                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      onClick={togglePlayPause}
                      className={`bg-gradient-to-r ${sceneConfig.color} hover:scale-105 transition-transform`}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </motion.div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextScene}
                    disabled={currentScene === scenes.length - 1}
                    className="text-white hover:bg-white/20 disabled:opacity-30"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  {/* Indicateur d'engagement */}
                  <div className="flex items-center gap-2 text-white text-sm">
                    <Sparkles className="h-4 w-4" />
                    <span>Engagement: {Math.round(userEngagement)}%</span>
                  </div>

                  {/* Contrôle du son */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="text-white hover:bg-white/20"
                  >
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Navigation rapide des scènes */}
              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
                {scenes.map((scene, index) => (
                  <motion.div
                    key={scene.id || index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={currentScene === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setCurrentScene(index);
                        setSceneProgress(0);
                      }}
                      className={`min-w-fit transition-all duration-300 ${
                        currentScene === index 
                          ? `bg-gradient-to-r ${sceneConfig.color} text-white shadow-lg` 
                          : 'text-white/70 border-white/30 hover:text-white hover:bg-white/20'
                      }`}
                    >
                      <span className="text-xs">{index + 1}</span>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contenu principal de la scène */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="bg-white/95 backdrop-blur-2xl border-white/30 shadow-2xl overflow-hidden">
            <CardContent className="p-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScene}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="p-8"
                >
                  {data ? (
                    <SceneImmersive data={data} />
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.05, 1],
                            rotate: [0, 2, -2, 0]
                          }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="inline-flex items-center gap-3 mb-4"
                        >
                          <sceneConfig.icon className={`h-12 w-12 text-transparent bg-gradient-to-r ${sceneConfig.color} bg-clip-text`} />
                          <h2 className="text-3xl font-bold text-gray-800">
                            {currentSceneData.title}
                          </h2>
                        </motion.div>
                      </div>

                      <div className={`bg-gradient-to-br ${sceneConfig.bg} p-6 rounded-2xl border border-gray-200`}>
                        <p className="text-lg text-gray-700 leading-relaxed mb-4">
                          {currentSceneData.content}
                        </p>
                        
                        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Durée: {currentSceneData.duration}s</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>Mode: {currentSceneData.type}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Panneau de statistiques d'immersion */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <motion.div
                    className="text-2xl font-bold text-indigo-600 mb-1"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {Math.round(userEngagement)}%
                  </motion.div>
                  <div className="text-sm text-indigo-700">Engagement</div>
                </div>
                
                <div className="text-center">
                  <motion.div
                    className="text-2xl font-bold text-purple-600 mb-1"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    {immersionLevel}
                  </motion.div>
                  <div className="text-sm text-purple-700">Niveau</div>
                </div>
                
                <div className="text-center">
                  <motion.div
                    className="text-2xl font-bold text-teal-600 mb-1"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  >
                    {currentScene + 1}/{scenes.length}
                  </motion.div>
                  <div className="text-sm text-teal-700">Progression</div>
                </div>
                
                <div className="text-center">
                  <motion.div
                    className="text-2xl font-bold text-amber-600 mb-1"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                  >
                    {Math.round(userEngagement * 2)}
                  </motion.div>
                  <div className="text-sm text-amber-700">Points XP</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};