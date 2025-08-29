import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Eye,
  Target,
  Star,
  MessageSquare,
  Zap,
  Heart,
  Share2,
  Bookmark
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface Panel {
  id: number;
  title: string;
  content: string;
  character: string;
  dialogue: string;
  medicalFact: string;
  visualStyle: 'comic' | 'manga' | 'realistic' | 'cartoon';
  emotion: 'neutral' | 'surprised' | 'concerned' | 'happy' | 'focused';
}

interface EnhancedBandeDessineeProps {
  itemData: {
    title: string;
    subtitle?: string;
    slug: string;
    item_code: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
  };
}

export const EnhancedBandeDessinee = ({ itemData }: EnhancedBandeDessineeProps) => {
  const [currentPanel, setCurrentPanel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readingMode, setReadingMode] = useState<'auto' | 'manual'>('manual');
  const [userEngagement, setUserEngagement] = useState(0);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  
  const controls = useAnimation();
  const panelRef = useRef<HTMLDivElement>(null);

  // Génération de panels basée sur les données médicales
  const generatePanels = (): Panel[] => {
    const basePanels: Panel[] = [
      {
        id: 1,
        title: "Introduction Clinique",
        content: `Découvrons ensemble ${itemData.title}`,
        character: "Dr. Sarah Martin",
        dialogue: "Bienvenue ! Aujourd'hui nous allons explorer un cas médical fascinant.",
        medicalFact: `${itemData.title} - Approche clinique moderne`,
        visualStyle: 'comic',
        emotion: 'happy'
      },
      {
        id: 2,
        title: "Anamnèse",
        content: "Recueil des informations patient",
        character: "Patient",
        dialogue: "Docteur, j'ai des symptômes qui m'inquiètent...",
        medicalFact: "L'anamnèse représente 80% du diagnostic médical",
        visualStyle: 'realistic',
        emotion: 'concerned'
      },
      {
        id: 3,
        title: "Examen Clinique",
        content: "Observation et palpation",
        character: "Dr. Sarah Martin",
        dialogue: "L'examen physique révèle des éléments importants.",
        medicalFact: "L'examen clinique guide la prescription d'examens complémentaires",
        visualStyle: 'comic',
        emotion: 'focused'
      },
      {
        id: 4,
        title: "Diagnostic Différentiel",
        content: "Analyse des hypothèses",
        character: "Dr. Sarah Martin",
        dialogue: "Plusieurs diagnostics sont à considérer...",
        medicalFact: "Le raisonnement différentiel évite les erreurs diagnostiques",
        visualStyle: 'manga',
        emotion: 'focused'
      },
      {
        id: 5,
        title: "Plan Thérapeutique",
        content: "Stratégie de prise en charge",
        character: "Équipe Soignante",
        dialogue: "Voici notre plan de traitement personnalisé.",
        medicalFact: "La médecine personnalisée améliore l'efficacité thérapeutique",
        visualStyle: 'comic',
        emotion: 'happy'
      },
      {
        id: 6,
        title: "Suivi Évolutif",
        content: "Monitoring et ajustements",
        character: "Dr. Sarah Martin",
        dialogue: "Le suivi permet d'ajuster le traitement si nécessaire.",
        medicalFact: "Le suivi médical optimise les résultats thérapeutiques",
        visualStyle: 'realistic',
        emotion: 'happy'
      }
    ];

    return basePanels;
  };

  const [panels] = useState<Panel[]>(generatePanels());

  // Auto-play logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && readingMode === 'auto') {
      interval = setInterval(() => {
        setCurrentPanel(prev => {
          const next = prev + 1;
          if (next >= panels.length) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }, 3000 / speed);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, readingMode, speed, panels.length]);

  // Engagement tracking
  useEffect(() => {
    const timer = setTimeout(() => {
      setUserEngagement(prev => Math.min(prev + 10, 100));
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [currentPanel]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    setReadingMode('auto');
  };

  const handlePrevious = () => {
    setCurrentPanel(prev => Math.max(0, prev - 1));
    setIsPlaying(false);
  };

  const handleNext = () => {
    setCurrentPanel(prev => Math.min(panels.length - 1, prev + 1));
    setIsPlaying(false);
  };

  const toggleFavorite = (panelId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(panelId)) {
        newFavorites.delete(panelId);
      } else {
        newFavorites.add(panelId);
      }
      return newFavorites;
    });
  };

  const getCharacterAvatar = (character: string, emotion: string) => {
    const avatarStyles = {
      'Dr. Sarah Martin': {
        neutral: '👩‍⚕️',
        happy: '😊👩‍⚕️',
        focused: '🤔👩‍⚕️',
        concerned: '😟👩‍⚕️',
        surprised: '😲👩‍⚕️'
      },
      'Patient': {
        neutral: '🙂',
        happy: '😊',
        focused: '🤔',
        concerned: '😟',
        surprised: '😲'
      },
      'Équipe Soignante': {
        neutral: '👥',
        happy: '😊👥',
        focused: '🤔👥',
        concerned: '😟👥',
        surprised: '😲👥'
      }
    };

    return avatarStyles[character as keyof typeof avatarStyles]?.[emotion as keyof typeof avatarStyles['Dr. Sarah Martin']] || '👤';
  };

  const getVisualStyleGradient = (style: Panel['visualStyle']) => {
    const styles = {
      comic: 'from-yellow-400 via-orange-500 to-red-500',
      manga: 'from-pink-400 via-purple-500 to-indigo-500',
      realistic: 'from-blue-400 via-cyan-500 to-teal-500',
      cartoon: 'from-green-400 via-lime-500 to-yellow-500'
    };
    return styles[style];
  };

  const currentPanelData = panels[currentPanel] || panels[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/95 via-blue-900/90 to-indigo-900/95 relative overflow-hidden">
      {/* Effets de particules animées */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            animate={{
              x: [0, Math.random() * window.innerWidth],
              y: [0, Math.random() * window.innerHeight],
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-6">
        {/* Header avec contrôles */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <Card className="bg-black/20 backdrop-blur-xl border border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <BookOpen className="h-8 w-8 text-purple-400" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">
                      Bande Dessinée Médicale Interactive
                    </CardTitle>
                    <p className="text-gray-300">{itemData.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-white border-white/30">
                    {itemData.item_code}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className="bg-purple-500/20 text-purple-300"
                  >
                    Panel {currentPanel + 1}/{panels.length}
                  </Badge>
                </div>
              </div>

              {/* Contrôles de lecture */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentPanel === 0}
                    className="text-white border-white/30 hover:bg-white/10"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={handlePlayPause}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleNext}
                    disabled={currentPanel === panels.length - 1}
                    className="text-white border-white/30 hover:bg-white/10"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  {/* Contrôle de vitesse */}
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm">Vitesse:</span>
                    <Slider
                      value={[speed]}
                      onValueChange={([value]) => setSpeed(value)}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="w-20"
                    />
                    <span className="text-white text-sm w-8">{speed}x</span>
                  </div>

                  {/* Contrôle de volume */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:bg-white/10"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Slider
                      value={[volume]}
                      onValueChange={([value]) => setVolume(value)}
                      min={0}
                      max={100}
                      className="w-20"
                    />
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="text-white hover:bg-white/10"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-300 mb-1">
                  <span>Progression de lecture</span>
                  <span>{Math.round(((currentPanel + 1) / panels.length) * 100)}%</span>
                </div>
                <Progress 
                  value={((currentPanel + 1) / panels.length) * 100} 
                  className="h-2"
                />
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Panel principal */}
        <motion.div
          key={currentPanel}
          initial={{ x: 300, opacity: 0, rotateY: 15 }}
          animate={{ x: 0, opacity: 1, rotateY: 0 }}
          exit={{ x: -300, opacity: 0, rotateY: -15 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="mb-6"
        >
          <Card 
            className={`overflow-hidden bg-gradient-to-br ${getVisualStyleGradient(currentPanelData.visualStyle)} p-1 shadow-2xl`}
            ref={panelRef}
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-8 min-h-[500px]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                {/* Zone visuelle */}
                <div className="relative">
                  <motion.div
                    className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 h-full flex items-center justify-center min-h-[300px] border-4 border-dashed border-gray-300"
                    animate={{ 
                      boxShadow: [
                        "0 0 0 0 rgba(168, 85, 247, 0)",
                        "0 0 0 10px rgba(168, 85, 247, 0.1)",
                        "0 0 0 0 rgba(168, 85, 247, 0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="text-center">
                      <motion.div 
                        className="text-8xl mb-4"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {getCharacterAvatar(currentPanelData.character, currentPanelData.emotion)}
                      </motion.div>
                      <div className="text-gray-600 font-medium">
                        Style: {currentPanelData.visualStyle.toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        [Espace réservé pour l'illustration médicale]
                      </div>
                    </div>
                  </motion.div>

                  {/* Overlay d'interaction */}
                  <motion.div 
                    className="absolute top-4 right-4 flex gap-2"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      size="sm"
                      variant={favorites.has(currentPanelData.id) ? "default" : "outline"}
                      onClick={() => toggleFavorite(currentPanelData.id)}
                      className="bg-white/80 hover:bg-white"
                    >
                      <Heart className={`h-4 w-4 ${favorites.has(currentPanelData.id) ? 'text-red-500' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/80 hover:bg-white"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/80 hover:bg-white"
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>

                {/* Zone de contenu */}
                <div className="space-y-6">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {currentPanel + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {currentPanelData.title}
                        </h3>
                        <p className="text-gray-600">{currentPanelData.character}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Bulle de dialogue */}
                  <motion.div
                    className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-l-4 border-purple-500 relative"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <MessageSquare className="absolute top-2 right-2 h-5 w-5 text-purple-500" />
                    <p className="text-gray-800 font-medium text-lg leading-relaxed">
                      "{currentPanelData.dialogue}"
                    </p>
                  </motion.div>

                  {/* Fait médical */}
                  <motion.div
                    className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-800 mb-1">Point Clé Médical</h4>
                        <p className="text-green-700">{currentPanelData.medicalFact}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Contenu principal */}
                  <motion.div
                    className="bg-gray-50 rounded-xl p-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                    <p className="text-gray-700">{currentPanelData.content}</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Navigation par thumbnails */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-black/20 backdrop-blur-xl border border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">Navigation des Panels</h4>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Eye className="h-4 w-4" />
                  <span>Engagement: {userEngagement}%</span>
                </div>
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2">
                {panels.map((panel, index) => (
                  <motion.button
                    key={panel.id}
                    onClick={() => setCurrentPanel(index)}
                    className={`flex-shrink-0 w-24 h-16 rounded-lg border-2 transition-all duration-300 ${
                      index === currentPanel
                        ? 'border-purple-400 bg-purple-500/20 scale-110'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center text-white">
                      <span className="text-xs font-medium">{index + 1}</span>
                      <span className="text-xs opacity-70">{panel.title.split(' ')[0]}</span>
                      {favorites.has(panel.id) && (
                        <Heart className="h-3 w-3 text-red-400 mt-1" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};