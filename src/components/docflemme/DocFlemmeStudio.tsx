import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Music, Play, Pause, Download, Heart, Share2, Waves, Mic, Volume2, 
  Zap, Radio, Headphones, Disc3, Brain, Sparkles, Target, Trophy,
  Activity, BarChart, Clock, User, Settings, Shuffle, Repeat
} from 'lucide-react';

interface DocFlemmeStyle {
  id: string;
  name: string;
  description: string;
  slogan: string;
  medicalContext: string;
  neurobiology: string;
  tempo: number;
  mood: 'flow' | 'focus' | 'memorize' | 'relax';
  effectiveness: number;
  memoryType: 'auditive' | 'kinesthetic' | 'visual' | 'multimodal';
  gradient: string;
  icon: React.ReactNode;
  situations: string[];
}

interface DocFlemmeStudioProps {
  itemCode: string;
  title: string;
  subtitle: string;
  competences?: string[];
  paroles?: {
    rang_a?: string[];
    rang_b?: string[];
    rang_ab?: string[];
  };
}

export const DocFlemmeStudio = ({ 
  itemCode, 
  title, 
  subtitle, 
  competences = [],
  paroles 
}: DocFlemmeStudioProps) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedRang, setSelectedRang] = useState<'A' | 'B' | 'AB'>('A');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [musicDuration, setMusicDuration] = useState(240);
  const [generatedTracks, setGeneratedTracks] = useState<any[]>([]);

  // Styles DocFlemme révolutionnaires
  const docFlemmeStyles: DocFlemmeStyle[] = [
    {
      id: 'clinical-hip-hop',
      name: 'Clinical Hip-Hop',
      description: 'Beats médicaux pour mémoriser en mouvement',
      slogan: '🏃‍♂️ Apprends en courant, retiens en rappant',
      medicalContext: 'Parfait pour les protocoles et classifications',
      neurobiology: 'Active la mémoire procédurale et le cortex moteur',
      tempo: 128,
      mood: 'flow',
      effectiveness: 95,
      memoryType: 'kinesthetic',
      gradient: 'from-orange-500 via-red-500 to-pink-600',
      icon: <Activity className="h-5 w-5" />,
      situations: ['Footing', 'Salle de sport', 'Transports', 'Marche active']
    },
    {
      id: 'shower-melodies',
      name: 'Shower Melodies',
      description: 'Mélodies relaxantes pour réviser sous la douche',
      slogan: '🚿 Détends-toi et laisse ton cerveau absorber',
      medicalContext: 'Idéal pour les concepts complexes et la synthèse',
      neurobiology: 'Favorise la neuroplasticité et la consolidation mnésique',
      tempo: 72,
      mood: 'relax',
      effectiveness: 88,
      memoryType: 'auditive',
      gradient: 'from-blue-400 via-cyan-500 to-teal-400',
      icon: <Waves className="h-5 w-5" />,
      situations: ['Douche', 'Bain', 'Relaxation', 'Avant sommeil']
    },
    {
      id: 'focus-frequencies',
      name: 'Focus Frequencies',
      description: 'Fréquences optimisées pour la concentration intense',
      slogan: '🧠 Zone de concentration maximale activée',
      medicalContext: 'Pour l\'apprentissage des diagnostics complexes',
      neurobiology: 'Synchronise les ondes gamma et renforce l\'attention',
      tempo: 100,
      mood: 'focus',
      effectiveness: 92,
      memoryType: 'visual',
      gradient: 'from-purple-600 via-indigo-500 to-blue-600',
      icon: <Target className="h-5 w-5" />,
      situations: ['Étude intensive', 'Révisions', 'Examens blancs', 'QCM']
    },
    {
      id: 'memory-palace',
      name: 'Memory Palace',
      description: 'Compositions mnémotechniques multimodales',
      slogan: '🏰 Construis ton palais de mémoire sonore',
      medicalContext: 'Architectures mnémotechniques pour l\'anatomie',
      neurobiology: 'Intègre hippocampe et cortex préfrontal',
      tempo: 85,
      mood: 'memorize',
      effectiveness: 97,
      memoryType: 'multimodal',
      gradient: 'from-emerald-500 via-green-500 to-lime-500',
      icon: <Brain className="h-5 w-5" />,
      situations: ['Mémorisation', 'Anatomie', 'Pharmacologie', 'Classifications']
    }
  ];

  const selectedStyleData = docFlemmeStyles.find(style => style.id === selectedStyle);

  // Génération DocFlemme
  const handleDocFlemmeGeneration = async () => {
    if (!selectedStyleData) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsGenerating(false);
          
          // Créer le nouveau track DocFlemme
          const newTrack = {
            id: `docflemme-${Date.now()}`,
            title: `${title} - ${selectedStyleData.name}`,
            subtitle: subtitle,
            itemCode: itemCode,
            style: selectedStyleData.name,
            rang: selectedRang,
            duration: musicDuration,
            effectiveness: selectedStyleData.effectiveness,
            situations: selectedStyleData.situations,
            slogan: selectedStyleData.slogan,
            favorite: false
          };
          
          setGeneratedTracks(prev => [newTrack, ...prev]);
          return 100;
        }
        return prev + Math.random() * 3;
      });
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header DocFlemme */}
      <Card className="bg-black/30 backdrop-blur-2xl border border-white/20">
        <CardHeader>
          <div className="text-center">
            <motion.h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              DocFlemme Studio Révolutionnaire
            </motion.h1>
            <p className="text-xl text-white">{title}</p>
            <p className="text-purple-300">{subtitle}</p>
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold mt-4">
              NEURO LEARNING GENERATOR
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Styles DocFlemme */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {docFlemmeStyles.map((style) => (
          <motion.div key={style.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card 
              className={`cursor-pointer transition-all duration-500 h-full border-2 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl ${
                selectedStyle === style.id 
                  ? 'border-white/60 bg-white/20 shadow-2xl' 
                  : 'border-white/20 hover:border-white/40'
              }`}
              onClick={() => setSelectedStyle(style.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${style.gradient}`}>
                    {style.icon}
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{style.name}</CardTitle>
                    <Badge className={`bg-gradient-to-r ${style.gradient} text-white border-0 text-xs`}>
                      {style.effectiveness}% d'efficacité
                    </Badge>
                  </div>
                </div>
                
                <div className="text-sm bg-black/30 rounded-lg p-3 border border-white/20">
                  <p className="text-yellow-300 font-medium">{style.slogan}</p>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-300 text-sm mb-4">{style.description}</p>
                
                <div className="space-y-3">
                  <div className="text-xs">
                    <span className="text-gray-400">Contexte médical:</span>
                    <p className="text-white mt-1">{style.medicalContext}</p>
                  </div>
                  
                  <div className="text-xs">
                    <span className="text-gray-400">Neurobiologie:</span>
                    <p className="text-blue-300 mt-1">{style.neurobiology}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-400 text-xs">Situations idéales:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {style.situations.map((situation) => (
                        <Badge key={situation} variant="outline" className="text-xs border-white/30 text-white/70">
                          {situation}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Configuration et génération */}
      <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-400" />
            Configuration DocFlemme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sélection du rang */}
          <div className="space-y-3">
            <label className="text-sm text-white">Classification Stratégique</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { rang: 'A', label: 'Rang A', desc: 'Core Knowledge', color: 'from-green-500 to-emerald-500' },
                { rang: 'B', label: 'Rang B', desc: 'Discriminant', color: 'from-orange-500 to-red-500' },
                { rang: 'AB', label: 'Rang A+B', desc: 'Perfection', color: 'from-purple-500 to-pink-500' }
              ].map(({ rang, label, desc, color }) => (
                <Button
                  key={rang}
                  variant={selectedRang === rang ? "default" : "outline"}
                  className={`p-4 h-auto ${
                    selectedRang === rang 
                      ? `bg-gradient-to-r ${color} text-white border-0` 
                      : 'bg-white/5 border-white/30 text-white hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedRang(rang as 'A' | 'B' | 'AB')}
                >
                  <div className="text-center">
                    <div className="font-bold">{label}</div>
                    <div className="text-xs opacity-80">{desc}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Durée */}
          <div>
            <label className="text-sm text-white mb-2 block">
              Durée: {Math.floor(musicDuration / 60)}:{(musicDuration % 60).toString().padStart(2, '0')}
            </label>
            <Slider
              value={[musicDuration]}
              onValueChange={([value]) => setMusicDuration(value)}
              min={60}
              max={480}
              step={30}
              className="w-full"
            />
          </div>

          {/* Génération */}
          <div className="flex justify-center">
            <Button
              onClick={handleDocFlemmeGeneration}
              disabled={!selectedStyle || isGenerating}
              size="lg"
              className="px-12 py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-2xl"
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
                  Génération DocFlemme en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 mr-3" />
                  Lancer la Génération DocFlemme
                </>
              )}
            </Button>
          </div>

          {/* Barre de progression */}
          {isGenerating && (
            <Card className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl border border-white/20">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-400" />
                      Génération DocFlemme Active
                    </span>
                    <span className="text-sm text-purple-300 font-bold">
                      {Math.round(generationProgress)}%
                    </span>
                  </div>
                  <Progress value={generationProgress} className="h-3 bg-white/10" />
                  <p className="text-xs text-gray-300 text-center">
                    {selectedStyleData?.slogan}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Bibliothèque générée */}
      {generatedTracks.length > 0 && (
        <Card className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Music className="h-5 w-5 text-purple-400" />
              Bibliothèque DocFlemme Générée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedTracks.map((track, index) => (
                <div
                  key={track.id}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button size="lg" variant="ghost" className="text-white hover:bg-white/20 w-12 h-12 rounded-full">
                        <Play className="h-6 w-6" />
                      </Button>
                      <div>
                        <h4 className="font-medium text-white">{track.title}</h4>
                        <p className="text-sm text-gray-400">
                          {track.style} • Rang {track.rang} • {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                        </p>
                        <p className="text-xs text-purple-300">{track.slogan}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                        {track.effectiveness}% efficace
                      </Badge>
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};