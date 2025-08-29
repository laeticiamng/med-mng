import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Headphones, 
  Brain, 
  Heart, 
  Waves, 
  Volume2,
  Settings,
  Moon,
  Sun,
  Target,
  Zap,
  Sparkles,
  Timer,
  Activity,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  Share2,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface ListeningMode {
  id: string;
  name: string;
  description: string;
  category: 'meditation' | 'focus' | 'sleep' | 'energy';
  icon: React.ComponentType<any>;
  color: string;
  settings: {
    binauralFreq?: number;
    volume: number;
    spatialAudio: boolean;
    noiseReduction: boolean;
    bassBoost: boolean;
    trebleEnhance: boolean;
    ambientMix: number;
    focusIntensity: number;
  };
  benefits: string[];
  brainwaveTarget: string;
}

interface SessionStats {
  duration: number;
  averageHeartRate: number;
  stressReduction: number;
  focusScore: number;
  relaxationLevel: number;
}

export const PerfectListeningModes: React.FC = () => {
  const [activeMode, setActiveMode] = useState<string>('');
  const [isActive, setIsActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [heartRateMonitoring, setHeartRateMonitoring] = useState(false);
  const [environmentalSync, setEnvironmentalSync] = useState(false);
  const [adaptiveMode, setAdaptiveMode] = useState(true);
  const [customSettings, setCustomSettings] = useState(false);
  
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    duration: 0,
    averageHeartRate: 72,
    stressReduction: 0,
    focusScore: 0,
    relaxationLevel: 0
  });

  const [realTimeData, setRealTimeData] = useState({
    heartRate: 72,
    brainwaveActivity: 65,
    stressLevel: 30,
    focusLevel: 75
  });

  const listeningModes: ListeningMode[] = [
    {
      id: 'deep_meditation',
      name: 'Méditation Profonde',
      description: 'Ondes Theta pour méditation transcendantale',
      category: 'meditation',
      icon: Brain,
      color: 'from-purple-500 to-indigo-600',
      settings: {
        binauralFreq: 6,
        volume: 70,
        spatialAudio: true,
        noiseReduction: true,
        bassBoost: false,
        trebleEnhance: false,
        ambientMix: 80,
        focusIntensity: 90
      },
      benefits: ['Méditation profonde', 'Réduction du stress', 'Clarté mentale'],
      brainwaveTarget: 'Theta (4-8 Hz)'
    },
    {
      id: 'mindful_focus',
      name: 'Focus Conscient',
      description: 'Ondes Alpha pour concentration détendue',
      category: 'focus',
      icon: Target,
      color: 'from-blue-500 to-cyan-600',
      settings: {
        binauralFreq: 10,
        volume: 65,
        spatialAudio: false,
        noiseReduction: true,
        bassBoost: false,
        trebleEnhance: true,
        ambientMix: 40,
        focusIntensity: 85
      },
      benefits: ['Concentration accrue', 'Créativité', 'Apprentissage'],
      brainwaveTarget: 'Alpha (8-12 Hz)'
    },
    {
      id: 'healing_sleep',
      name: 'Sommeil Réparateur',
      description: 'Ondes Delta pour sommeil profond',
      category: 'sleep',
      icon: Moon,
      color: 'from-indigo-600 to-purple-700',
      settings: {
        binauralFreq: 2,
        volume: 45,
        spatialAudio: true,
        noiseReduction: true,
        bassBoost: true,
        trebleEnhance: false,
        ambientMix: 90,
        focusIntensity: 30
      },
      benefits: ['Endormissement rapide', 'Sommeil profond', 'Récupération'],
      brainwaveTarget: 'Delta (0.5-4 Hz)'
    },
    {
      id: 'energy_boost',
      name: 'Boost d\'Énergie',
      description: 'Ondes Beta pour vitalité et éveil',
      category: 'energy',
      icon: Zap,
      color: 'from-orange-500 to-red-600',
      settings: {
        binauralFreq: 18,
        volume: 75,
        spatialAudio: false,
        noiseReduction: false,
        bassBoost: true,
        trebleEnhance: true,
        ambientMix: 20,
        focusIntensity: 95
      },
      benefits: ['Éveil mental', 'Énergie positive', 'Motivation'],
      brainwaveTarget: 'Beta (12-30 Hz)'
    },
    {
      id: 'heart_coherence',
      name: 'Cohérence Cardiaque',
      description: 'Synchronisation cœur-cerveau optimale',
      category: 'meditation',
      icon: Heart,
      color: 'from-pink-500 to-rose-600',
      settings: {
        binauralFreq: 7,
        volume: 60,
        spatialAudio: true,
        noiseReduction: true,
        bassBoost: false,
        trebleEnhance: false,
        ambientMix: 70,
        focusIntensity: 80
      },
      benefits: ['Régulation émotionnelle', 'Résilience', 'Bien-être'],
      brainwaveTarget: 'Theta-Alpha (6-10 Hz)'
    },
    {
      id: 'gamma_consciousness',
      name: 'Conscience Gamma',
      description: 'Ondes Gamma pour états de conscience élevés',
      category: 'meditation',
      icon: Sparkles,
      color: 'from-violet-500 to-purple-600',
      settings: {
        binauralFreq: 40,
        volume: 55,
        spatialAudio: true,
        noiseReduction: true,
        bassBoost: false,
        trebleEnhance: true,
        ambientMix: 50,
        focusIntensity: 100
      },
      benefits: ['Conscience élargie', 'Intuition', 'Transcendance'],
      brainwaveTarget: 'Gamma (30-100 Hz)'
    }
  ];

  // Simulation des données temps réel
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
        
        // Simulation des données biométriques
        setRealTimeData(prev => ({
          heartRate: prev.heartRate + (Math.random() - 0.5) * 4,
          brainwaveActivity: Math.max(0, Math.min(100, prev.brainwaveActivity + (Math.random() - 0.5) * 10)),
          stressLevel: Math.max(0, Math.min(100, prev.stressLevel + (Math.random() - 0.6) * 5)),
          focusLevel: Math.max(0, Math.min(100, prev.focusLevel + (Math.random() - 0.4) * 8))
        }));

        // Mise à jour des statistiques de session
        setSessionStats(prev => ({
          ...prev,
          duration: sessionTime,
          averageHeartRate: (prev.averageHeartRate + realTimeData.heartRate) / 2,
          stressReduction: Math.max(0, 100 - realTimeData.stressLevel),
          focusScore: realTimeData.focusLevel,
          relaxationLevel: 100 - realTimeData.stressLevel
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isActive, sessionTime, realTimeData]);

  const startSession = (modeId: string) => {
    setActiveMode(modeId);
    setIsActive(true);
    setSessionTime(0);
    
    const mode = listeningModes.find(m => m.id === modeId);
    toast.success(`🎧 Session "${mode?.name}" démarrée`);
  };

  const stopSession = () => {
    setIsActive(false);
    if (sessionTime > 60) {
      toast.success(`Session terminée: ${Math.floor(sessionTime / 60)}min ${sessionTime % 60}s`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeModeData = listeningModes.find(m => m.id === activeMode);

  return (
    <div className="space-y-6">
      {/* Interface Principale */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-accent">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            Modes d'Écoute Perfectionnés
            <Badge className="bg-gradient-to-r from-success to-success-glow text-white">
              100% Optimisé
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Session Active */}
          {isActive && activeModeData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${activeModeData.color}`}>
                    <activeModeData.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{activeModeData.name}</h3>
                    <p className="text-sm text-muted-foreground">{activeModeData.brainwaveTarget}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{formatTime(sessionTime)}</div>
                  <p className="text-sm text-muted-foreground">Temps de session</p>
                </div>
              </div>

              {/* Données Biométriques Temps Réel */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-card/50">
                  <Heart className="w-5 h-5 mx-auto mb-2 text-red-500" />
                  <div className="text-lg font-semibold">{Math.round(realTimeData.heartRate)}</div>
                  <div className="text-xs text-muted-foreground">BPM</div>
                </div>
                
                <div className="text-center p-3 rounded-lg bg-card/50">
                  <Brain className="w-5 h-5 mx-auto mb-2 text-purple-500" />
                  <div className="text-lg font-semibold">{Math.round(realTimeData.brainwaveActivity)}%</div>
                  <div className="text-xs text-muted-foreground">Activité cérébrale</div>
                </div>
                
                <div className="text-center p-3 rounded-lg bg-card/50">
                  <Activity className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                  <div className="text-lg font-semibold">{Math.round(realTimeData.stressLevel)}%</div>
                  <div className="text-xs text-muted-foreground">Stress</div>
                </div>
                
                <div className="text-center p-3 rounded-lg bg-card/50">
                  <Target className="w-5 h-5 mx-auto mb-2 text-green-500" />
                  <div className="text-lg font-semibold">{Math.round(realTimeData.focusLevel)}%</div>
                  <div className="text-xs text-muted-foreground">Focus</div>
                </div>
              </div>

              <Button 
                onClick={stopSession}
                variant="outline" 
                className="w-full mt-4"
              >
                Arrêter la Session
              </Button>
            </motion.div>
          )}

          {/* Modes d'Écoute */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Modes d'Écoute Disponibles</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={adaptiveMode}
                    onCheckedChange={setAdaptiveMode}
                  />
                  <label>Mode adaptatif</label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listeningModes.map((mode) => {
                const IconComponent = mode.icon;
                return (
                  <motion.div
                    key={mode.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all h-full ${
                        activeMode === mode.id && isActive
                          ? 'ring-2 ring-primary shadow-lg bg-primary/5' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => !isActive && startSession(mode.id)}
                    >
                      <CardContent className="p-4 h-full flex flex-col">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${mode.color} flex-shrink-0`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm">{mode.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {mode.description}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                mode.category === 'meditation' ? 'border-purple-200 text-purple-700' :
                                mode.category === 'focus' ? 'border-blue-200 text-blue-700' :
                                mode.category === 'sleep' ? 'border-indigo-200 text-indigo-700' :
                                'border-orange-200 text-orange-700'
                              }`}
                            >
                              {mode.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {mode.brainwaveTarget}
                            </Badge>
                          </div>

                          <div className="space-y-1">
                            {mode.benefits.slice(0, 3).map((benefit, index) => (
                              <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                                <div className="w-1 h-1 bg-current rounded-full" />
                                {benefit}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 mt-auto border-t border-border">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Fréq: {mode.settings.binauralFreq || 'N/A'} Hz</span>
                            <span>Vol: {mode.settings.volume}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Options Avancées */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Options Avancées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Monitoring cardiaque</label>
                  <Switch
                    checked={heartRateMonitoring}
                    onCheckedChange={setHeartRateMonitoring}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Sync environnementale</label>
                  <Switch
                    checked={environmentalSync}
                    onCheckedChange={setEnvironmentalSync}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Paramètres personnalisés</label>
                  <Switch
                    checked={customSettings}
                    onCheckedChange={setCustomSettings}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Statistiques Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Durée totale</span>
                  <span className="font-semibold">{formatTime(sessionStats.duration)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Réduction stress</span>
                  <span className="font-semibold text-green-600">
                    {Math.round(sessionStats.stressReduction)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Score de focus</span>
                  <span className="font-semibold text-blue-600">
                    {Math.round(sessionStats.focusScore)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Niveau relaxation</span>
                  <span className="font-semibold text-purple-600">
                    {Math.round(sessionStats.relaxationLevel)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};