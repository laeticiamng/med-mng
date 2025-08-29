import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Music, 
  Play, 
  Pause, 
  Download,
  Heart,
  Share2,
  Waves,
  Mic,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  SkipBack,
  SkipForward,
  Settings,
  Sparkles,
  Zap,
  Radio,
  Headphones,
  Disc3,
  AudioWaveform,
  MicVocal,
  Guitar,
  Piano,
  Drum
} from 'lucide-react';

interface MusicStyle {
  id: string;
  name: string;
  description: string;
  genre: string;
  tempo: number;
  mood: string;
  instruments: string[];
  icon: React.ReactNode;
  gradient: string;
}

interface EnhancedGenerationMusicaleProps {
  itemCode?: string;
  title?: string;
  paroles?: {
    rang_a?: string[];
    rang_b?: string[];
    rang_ab?: string[];
  };
  tableauData?: any;
}

export const EnhancedGenerationMusicale = ({ 
  itemCode = "MED001", 
  title = "Génération Musicale Médicale",
  paroles,
  tableauData
}: EnhancedGenerationMusicaleProps) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [musicDuration, setMusicDuration] = useState(120);
  const [selectedRang, setSelectedRang] = useState<'A' | 'B' | 'AB'>('A');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [generatedTracks, setGeneratedTracks] = useState<Array<{
    id: string;
    title: string;
    duration: number;
    style: string;
    url?: string;
    favorite: boolean;
  }>>([]);
  const [visualizerData, setVisualizerData] = useState<number[]>([]);
  const [audioAnalysis, setAudioAnalysis] = useState({
    bpm: 120,
    key: 'C Major',
    energy: 75,
    mood: 'Energetic'
  });
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controls = useAnimation();

  // Styles musicaux avancés
  const musicStyles: MusicStyle[] = [
    {
      id: 'electronic-medical',
      name: 'Électronique Médical',
      description: 'Sons futuristes pour la médecine moderne',
      genre: 'Electronic/Ambient',
      tempo: 110,
      mood: 'Futuriste',
      instruments: ['Synthétiseur', 'Pads', 'Séquenceur'],
      icon: <Zap className="h-5 w-5" />,
      gradient: 'from-blue-500 via-cyan-500 to-teal-500'
    },
    {
      id: 'acoustic-healing',
      name: 'Acoustique Thérapeutique',
      description: 'Mélodies apaisantes pour la guérison',
      genre: 'Acoustic/Healing',
      tempo: 80,
      mood: 'Apaisant',
      instruments: ['Guitare', 'Piano', 'Cordes'],
      icon: <Guitar className="h-5 w-5" />,
      gradient: 'from-green-500 via-emerald-500 to-teal-500'
    },
    {
      id: 'orchestral-epic',
      name: 'Orchestral Épique',
      description: 'Compositions grandioses pour l\'apprentissage',
      genre: 'Orchestral/Epic',
      tempo: 140,
      mood: 'Épique',
      instruments: ['Orchestre', 'Chœur', 'Percussion'],
      icon: <Piano className="h-5 w-5" />,
      gradient: 'from-purple-500 via-violet-500 to-pink-500'
    },
    {
      id: 'rhythmic-focus',
      name: 'Rythme Focus',
      description: 'Beats énergiques pour la concentration',
      genre: 'Rhythmic/Focus',
      tempo: 128,
      mood: 'Concentré',
      instruments: ['Batterie', 'Basse', 'Percussion'],
      icon: <Drum className="h-5 w-5" />,
      gradient: 'from-orange-500 via-red-500 to-pink-500'
    },
    {
      id: 'vocal-medical',
      name: 'Vocal Médical',
      description: 'Compositions vocales éducatives',
      genre: 'Vocal/Educational',
      tempo: 100,
      mood: 'Éducatif',
      instruments: ['Voix', 'Harmonie', 'Accompagnement'],
      icon: <MicVocal className="h-5 w-5" />,
      gradient: 'from-indigo-500 via-blue-500 to-cyan-500'
    }
  ];

  const selectedStyleData = musicStyles.find(style => style.id === selectedStyle);

  // Visualiseur audio en temps réel
  useEffect(() => {
    const generateVisualizerData = () => {
      const newData = Array.from({ length: 64 }, () => 
        Math.random() * (isPlaying ? 100 : 20) + (isPlaying ? 20 : 5)
      );
      setVisualizerData(newData);
    };

    const interval = setInterval(generateVisualizerData, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Simulation de génération musicale
  const handleGenerate = async () => {
    if (!selectedStyle) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    // Animation de progression
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsGenerating(false);
          
          // Ajouter le track généré
          const newTrack = {
            id: `track-${Date.now()}`,
            title: `${title} - ${selectedStyleData?.name}`,
            duration: musicDuration,
            style: selectedStyleData?.name || '',
            favorite: false
          };
          setGeneratedTracks(prev => [newTrack, ...prev]);
          
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const AudioVisualizer = () => (
    <div className="relative h-32 bg-black/40 rounded-lg overflow-hidden border border-white/20">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ filter: 'hue-rotate(180deg) saturate(1.5)' }}
      />
      
      {/* Barres de visualisation */}
      <div className="absolute inset-0 flex items-end justify-center gap-1 p-4">
        {visualizerData.map((height, index) => (
          <motion.div
            key={index}
            className={`w-2 bg-gradient-to-t ${selectedStyleData?.gradient || 'from-blue-500 to-purple-500'} rounded-t-sm`}
            animate={{ height: `${height}%` }}
            transition={{ duration: 0.1 }}
          />
        ))}
      </div>
      
      {/* Overlay de particules */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/60 rounded-full"
            animate={{
              x: [0, Math.random() * 100 + '%'],
              y: [100 + '%', -10 + '%'],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    </div>
  );

  const MusicStyleCard = ({ style }: { style: MusicStyle }) => (
    <motion.div
      whileHover={{ scale: 1.02, rotateY: 5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`cursor-pointer transition-all duration-300 border-2 ${
          selectedStyle === style.id 
            ? 'border-white bg-white/20' 
            : 'border-white/20 hover:border-white/40 bg-white/5'
        }`}
        onClick={() => setSelectedStyle(style.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${style.gradient}`}>
              {style.icon}
            </div>
            <div>
              <h4 className="font-semibold text-white">{style.name}</h4>
              <p className="text-xs text-gray-300">{style.genre}</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-300 mb-3">{style.description}</p>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
            <div>
              <span className="text-gray-500">Tempo:</span> {style.tempo} BPM
            </div>
            <div>
              <span className="text-gray-500">Mood:</span> {style.mood}
            </div>
          </div>
          
          <div className="mt-2">
            <div className="text-xs text-gray-500 mb-1">Instruments:</div>
            <div className="flex flex-wrap gap-1">
              {style.instruments.map((instrument, i) => (
                <Badge key={i} variant="outline" className="text-xs border-white/30 text-white/70">
                  {instrument}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const TrackItem = ({ track, index }: { track: any; index: number }) => (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <div>
            <h4 className="font-medium text-white">{track.title}</h4>
            <p className="text-xs text-gray-400">{track.style} • {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const updatedTracks = generatedTracks.map(t => 
                t.id === track.id ? { ...t, favorite: !t.favorite } : t
              );
              setGeneratedTracks(updatedTracks);
            }}
            className="text-white hover:bg-white/20"
          >
            <Heart className={`h-4 w-4 ${track.favorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
            <Share2 className="h-4 w-4" />
          </Button>
          
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Particules musicales flottantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-20"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              rotate: [0, 360],
              scale: [0.5, 1.5, 0.5]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.2
            }}
          >
            {['🎵', '🎶', '🎼', '🎤', '🎸', '🎹', '🥁'][i % 7]}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <Card className="bg-black/30 backdrop-blur-2xl border border-white/20 overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity }
                    }}
                  >
                    <Disc3 className="h-8 w-8 text-purple-400" />
                  </motion.div>
                  
                  <div>
                    <CardTitle className="text-2xl font-bold text-white mb-1">
                      Studio de Génération Musicale IA
                    </CardTitle>
                    <p className="text-purple-300">{title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-white border-white/30">
                        {itemCode}
                      </Badge>
                      <Badge className="bg-purple-600">
                        Rang {selectedRang}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Analyse audio en temps réel */}
                <div className="text-right">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="text-sm text-white mb-2">Analyse Audio</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">BPM:</span>
                        <div className="text-white font-bold">{audioAnalysis.bpm}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Tonalité:</span>
                        <div className="text-white font-bold">{audioAnalysis.key}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Énergie:</span>
                        <div className="text-green-400 font-bold">{audioAnalysis.energy}%</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Mood:</span>
                        <div className="text-yellow-400 font-bold">{audioAnalysis.mood}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visualiseur principal */}
              <div className="mt-6">
                <AudioVisualizer />
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panneau de configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* Sélection du rang */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AudioWaveform className="h-5 w-5 text-purple-400" />
                    Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-white mb-2 block">Niveau de Compétence</label>
                    <Select value={selectedRang} onValueChange={(value: 'A' | 'B' | 'AB') => setSelectedRang(value)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/20">
                        <SelectItem value="A" className="text-white">Rang A - Fondamental</SelectItem>
                        <SelectItem value="B" className="text-white">Rang B - Avancé</SelectItem>
                        <SelectItem value="AB" className="text-white">Rang AB - Complet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-white mb-2 block">
                      Durée: {Math.floor(musicDuration / 60)}:{(musicDuration % 60).toString().padStart(2, '0')}
                    </label>
                    <Slider
                      value={[musicDuration]}
                      onValueChange={([value]) => setMusicDuration(value)}
                      min={30}
                      max={300}
                      step={15}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={isMuted ? "outline" : "default"}
                      onClick={() => setIsMuted(!isMuted)}
                      className="bg-white/20 text-white border-white/30"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    
                    <Slider
                      value={[volume]}
                      onValueChange={([value]) => setVolume(value)}
                      min={0}
                      max={100}
                      className="flex-1"
                    />
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={!selectedStyle || isGenerating}
                    className={`w-full ${selectedStyleData ? `bg-gradient-to-r ${selectedStyleData.gradient}` : 'bg-gray-600'} text-white font-semibold py-3 rounded-xl shadow-lg`}
                  >
                    {isGenerating ? (
                      <>
                        <Radio className="h-5 w-5 mr-2 animate-spin" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Générer la Musique IA
                      </>
                    )}
                  </Button>

                  {isGenerating && (
                    <div>
                      <div className="flex justify-between text-sm text-white mb-1">
                        <span>Progression</span>
                        <span>{generationProgress}%</span>
                      </div>
                      <Progress value={generationProgress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Contrôles audio */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Headphones className="h-5 w-5 text-green-400" />
                    Lecteur Audio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <Shuffle className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="lg" 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="bg-white/20 text-white hover:bg-white/30 rounded-full w-12 h-12"
                    >
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <Repeat className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}</span>
                      <span>{Math.floor(musicDuration / 60)}:{(musicDuration % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <Progress value={(currentTime / musicDuration) * 100} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Zone principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Styles musicaux */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Music className="h-5 w-5 text-orange-400" />
                    Styles Musicaux IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {musicStyles.map((style) => (
                      <MusicStyleCard key={style.id} style={style} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tracks générés */}
            {generatedTracks.length > 0 && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Waves className="h-5 w-5 text-cyan-400" />
                      Compositions Générées ({generatedTracks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {generatedTracks.map((track, index) => (
                        <TrackItem key={track.id} track={track} index={index} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Paroles disponibles */}
            {paroles && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Mic className="h-5 w-5 text-pink-400" />
                      Paroles Médicales Disponibles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedRang === 'A' && paroles.rang_a && (
                        <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-400/30">
                          <h4 className="text-blue-300 font-semibold mb-2">Rang A - Fondamental</h4>
                          <div className="text-sm text-white/80 space-y-1">
                            {paroles.rang_a.slice(0, 3).map((ligne, i) => (
                              <div key={i}>"{ligne}"</div>
                            ))}
                            {paroles.rang_a.length > 3 && (
                              <div className="text-blue-300">...et {paroles.rang_a.length - 3} lignes de plus</div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {selectedRang === 'B' && paroles.rang_b && (
                        <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-400/30">
                          <h4 className="text-purple-300 font-semibold mb-2">Rang B - Avancé</h4>
                          <div className="text-sm text-white/80 space-y-1">
                            {paroles.rang_b.slice(0, 3).map((ligne, i) => (
                              <div key={i}>"{ligne}"</div>
                            ))}
                            {paroles.rang_b.length > 3 && (
                              <div className="text-purple-300">...et {paroles.rang_b.length - 3} lignes de plus</div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {selectedRang === 'AB' && paroles.rang_ab && (
                        <div className="bg-green-500/20 rounded-lg p-4 border border-green-400/30">
                          <h4 className="text-green-300 font-semibold mb-2">Rang AB - Complet</h4>
                          <div className="text-sm text-white/80 space-y-1">
                            {paroles.rang_ab.slice(0, 3).map((ligne, i) => (
                              <div key={i}>"{ligne}"</div>
                            ))}
                            {paroles.rang_ab.length > 3 && (
                              <div className="text-green-300">...et {paroles.rang_ab.length - 3} lignes de plus</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};