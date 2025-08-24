import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Repeat, 
  Shuffle, 
  Heart, 
  Download,
  Share2,
  Music,
  Brain,
  FileText,
  BarChart3,
  Clock,
  Target,
  Headphones,
  Waves,
  Zap,
  BookOpen,
  Star,
  TrendingUp
} from 'lucide-react';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { ImmersivePlayerControls } from '@/components/immersive/ImmersivePlayerControls';
import { AdvancedPlayerFeatures } from '@/components/immersive/AdvancedPlayerFeatures';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface Track {
  id: string;
  title: string;
  subject: string;
  style: string;
  duration: number;
  audioUrl?: string;
  lyrics: string[];
  pedagogicalPoints: string[];
  mnemonics: string[];
  difficulty: string;
  tags: string[];
  createdAt: string;
}

interface LearningStats {
  listenTime: number;
  completionRate: number;
  retentionScore: number;
  repeatedSections: number;
}

const Player = () => {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);

  // États du lecteur
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  
  // États de l'interface
  const [activeTab, setActiveTab] = useState('player');
  const [showLyrics, setShowLyrics] = useState(false);
  const [currentLyricsIndex, setCurrentLyricsIndex] = useState(0);
  const [learningMode, setLearningMode] = useState(false);
  
  // Données de la piste actuelle (simulées)
  const [currentTrack] = useState<Track>({
    id: '1',
    title: 'Insuffisance Cardiaque Trap',
    subject: 'Cardiologie',
    style: 'Trap',
    duration: 245,
    lyrics: [
      "Le cœur qui bat, mais qui faiblit",
      "Fraction d'éjection qui chute, attention !",
      "Dyspnée d'effort, œdèmes aux pieds",
      "L'insuffisance cardiaque s'installe",
      "NYHA classe 1, 2, 3 et 4",
      "De l'asymptomatique au grabataire",
      "IEC, diurétiques, bêta-bloquants",
      "Le traitement qu'il faut retenir !",
      "[Refrain] IC, IC, insuffisance cardiaque",
      "Mémorise bien cette pathologie classique",
      "Systolique ou diastolique",
      "Chaque forme a sa logique !",
      "BNP élevé, échographie",
      "Confirmation du diagnostic",
      "Prévention secondaire, éducation",
      "Pour éviter la décompensation !"
    ],
    pedagogicalPoints: [
      "Définition : Incapacité du cœur à assurer un débit cardiaque suffisant",
      "Classification NYHA : I (asymptomatique) à IV (dyspnée au repos)",
      "Biomarqueurs : BNP/NT-proBNP élevés",
      "Traitement : IEC/ARA2, bêta-bloquants, diurétiques",
      "Surveillance : Poids quotidien, signes de décompensation"
    ],
    mnemonics: [
      "IC = 'Je Craque' (Insuffisance Cardiaque)",
      "NYHA = 'New York Heart Association'",
      "BNP = 'Brain Natriuretic Peptide' (mais vient du cœur !)",
      "IEC = 'Inhibiteurs de l'Enzyme de Conversion'"
    ],
    difficulty: 'Intermédiaire',
    tags: ['cardiologie', 'insuffisance', 'NYHA', 'BNP'],
    createdAt: '2024-01-15T10:30:00Z'
  });

  // Stats d'apprentissage (simulées)
  const [learningStats] = useState<LearningStats>({
    listenTime: 127,
    completionRate: 85,
    retentionScore: 92,
    repeatedSections: 3
  });

  // Effet pour simuler la progression
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          
          // Mise à jour de l'index des paroles
          const lyricsTimePerLine = duration / currentTrack.lyrics.length;
          const newLyricsIndex = Math.floor(newTime / lyricsTimePerLine);
          setCurrentLyricsIndex(Math.min(newLyricsIndex, currentTrack.lyrics.length - 1));
          
          if (newTime >= duration) {
            setIsPlaying(false);
            if (isRepeat) {
              return 0;
            }
            return duration;
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, duration, isRepeat, currentTrack.lyrics.length]);

  // Initialisation de la durée
  useEffect(() => {
    setDuration(currentTrack.duration);
  }, [currentTrack.duration]);

  // Fonctions de contrôle
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      toast({
        title: "🎵 Lecture en cours",
        description: currentTrack.title,
      });
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    
    // Mise à jour des paroles
    const lyricsTimePerLine = duration / currentTrack.lyrics.length;
    const newLyricsIndex = Math.floor(newTime / lyricsTimePerLine);
    setCurrentLyricsIndex(Math.min(newLyricsIndex, currentTrack.lyrics.length - 1));
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStyleGradient = (style: string) => {
    switch (style.toLowerCase()) {
      case 'trap': return 'from-purple-500 to-pink-500';
      case 'lo-fi': return 'from-blue-400 to-cyan-400';
      case 'pop': return 'from-pink-400 to-rose-400';
      case 'jazz': return 'from-amber-500 to-orange-500';
      case 'afrobeat': return 'from-green-500 to-emerald-500';
      case 'classique': return 'from-indigo-500 to-purple-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <MedMngLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header avec artwork */}
            <Card className="mb-8 overflow-hidden shadow-2xl bg-white/80 backdrop-blur-sm border-0">
              <div className="flex flex-col lg:flex-row">
                {/* Artwork */}
                <div className="lg:w-80 lg:h-80">
                  <div className={`w-full h-64 lg:h-80 bg-gradient-to-br ${getStyleGradient(currentTrack.style)} flex items-center justify-center text-white relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative z-10 text-center">
                      <Music className="h-24 w-24 mx-auto mb-4 opacity-90" />
                      <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                        {currentTrack.style}
                      </Badge>
                    </div>
                    
                    {/* Animation de lecture */}
                    {isPlaying && (
                      <div className="absolute bottom-4 left-4">
                        <div className="flex items-center space-x-1">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1 bg-white/80 rounded-full animate-pulse"
                              style={{
                                height: `${Math.random() * 20 + 10}px`,
                                animationDelay: `${i * 0.1}s`,
                                animationDuration: '0.8s'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations et contrôles */}
                <div className="flex-1 p-6 lg:p-8">
                  <div className="space-y-6">
                    {/* Titre et métadonnées */}
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                        {currentTrack.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <Badge className="bg-blue-100 text-blue-800">
                          {currentTrack.subject}
                        </Badge>
                        <Badge variant="outline">
                          {currentTrack.difficulty}
                        </Badge>
                        <span className="text-gray-500 text-sm">
                          {formatTime(currentTrack.duration)}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {currentTrack.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Contrôles principaux */}
                    <div className="space-y-4">
                      {/* Barre de progression */}
                      <div className="space-y-2">
                        <Slider
                          value={[currentTime]}
                          max={duration}
                          step={1}
                          onValueChange={handleSeek}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>

                      {/* Boutons de contrôle */}
                      <div className="flex items-center justify-center space-x-4">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => setIsShuffle(!isShuffle)}
                          className={isShuffle ? 'text-purple-600 border-purple-600' : ''}
                        >
                          <Shuffle className="h-5 w-5" />
                        </Button>
                        
                        <Button variant="outline" size="lg">
                          <SkipBack className="h-5 w-5" />
                        </Button>
                        
                        <Button 
                          size="lg"
                          onClick={togglePlay}
                          className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                        >
                          {isPlaying ? (
                            <Pause className="h-8 w-8" />
                          ) : (
                            <Play className="h-8 w-8 ml-1" />
                          )}
                        </Button>
                        
                        <Button variant="outline" size="lg">
                          <SkipForward className="h-5 w-5" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => setIsRepeat(!isRepeat)}
                          className={isRepeat ? 'text-purple-600 border-purple-600' : ''}
                        >
                          <Repeat className="h-5 w-5" />
                        </Button>
                      </div>

                      {/* Volume et actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 max-w-xs">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleMute}
                          >
                            {isMuted || volume === 0 ? (
                              <VolumeX className="h-4 w-4" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </Button>
                          <Slider
                            value={[isMuted ? 0 : volume]}
                            max={100}
                            step={1}
                            onValueChange={handleVolumeChange}
                            className="flex-1"
                          />
                          <span className="text-xs text-gray-500 w-8">
                            {isMuted ? 0 : volume}%
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Onglets de contenu */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="player" className="flex items-center space-x-2">
                  <Waves className="h-4 w-4" />
                  <span className="hidden sm:inline">Visualiseur</span>
                </TabsTrigger>
                <TabsTrigger value="lyrics" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Paroles</span>
                </TabsTrigger>
                <TabsTrigger value="learning" className="flex items-center space-x-2">
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">Apprentissage</span>
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Statistiques</span>
                </TabsTrigger>
              </TabsList>

              {/* Visualiseur audio */}
              <TabsContent value="player">
                <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <div className="text-center">
                    <div className="mb-8">
                      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4">
                        {isPlaying ? (
                          <Waves className="h-16 w-16 text-purple-600 animate-pulse" />
                        ) : (
                          <Music className="h-16 w-16 text-purple-600" />
                        )}
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-2">
                        {isPlaying ? 'Lecture en cours...' : 'En pause'}
                      </h3>
                      <p className="text-gray-600">
                        Mode {learningMode ? 'Apprentissage' : 'Écoute'} actif
                      </p>
                    </div>

                    {/* Visualiseur de fréquences simulé */}
                    {isPlaying && (
                      <div className="flex items-end justify-center space-x-1 mb-8">
                        {[...Array(32)].map((_, i) => (
                          <div
                            key={i}
                            className="bg-gradient-to-t from-purple-500 to-blue-500 rounded-full"
                            style={{
                              width: '4px',
                              height: `${Math.random() * 40 + 10}px`,
                              animation: `pulse ${Math.random() * 0.5 + 0.5}s infinite`
                            }}
                          />
                        ))}
                      </div>
                    )}

                    <Button
                      onClick={() => setLearningMode(!learningMode)}
                      className={`${learningMode 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                      } text-white`}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      {learningMode ? 'Mode Apprentissage Activé' : 'Activer Mode Apprentissage'}
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Paroles synchronisées */}
              <TabsContent value="lyrics">
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Paroles Pédagogiques</h3>
                      <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                        <Zap className="h-3 w-3 mr-1" />
                        Synchronisées
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {currentTrack.lyrics.map((line, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg transition-all duration-300 ${
                            index === currentLyricsIndex
                              ? 'bg-gradient-to-r from-purple-100 to-blue-100 border-l-4 border-purple-500 text-purple-900 font-medium'
                              : index < currentLyricsIndex
                              ? 'bg-gray-50 text-gray-600'
                              : 'text-gray-800 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400 w-8">
                              {index + 1}
                            </span>
                            <span>{line}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Contenu pédagogique */}
              <TabsContent value="learning">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Points pédagogiques */}
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">Points Clés</h3>
                      </div>
                      
                      <div className="space-y-3">
                        {currentTrack.pedagogicalPoints.map((point, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <p className="text-sm text-gray-700">{point}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* Moyens mnémotechniques */}
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold">Mnémotechniques</h3>
                      </div>
                      
                      <div className="space-y-3">
                        {currentTrack.mnemonics.map((mnemonic, index) => (
                          <div key={index} className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                            <p className="text-sm text-purple-900 font-medium">{mnemonic}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Brain className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800">Conseil d'apprentissage</span>
                        </div>
                        <p className="text-xs text-purple-700">
                          Répétez cette musique plusieurs fois pour optimiser la mémorisation. 
                          La méthode MNG utilise la répétition musicale pour ancrer les connaissances.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Statistiques d'apprentissage */}
              <TabsContent value="stats">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="p-6 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <div className="space-y-2">
                      <Clock className="h-8 w-8 text-blue-600 mx-auto" />
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.floor(learningStats.listenTime / 60)}m{learningStats.listenTime % 60}s
                      </div>
                      <p className="text-sm text-gray-600">Temps d'écoute</p>
                    </div>
                  </Card>

                  <Card className="p-6 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <div className="space-y-2">
                      <Target className="h-8 w-8 text-green-600 mx-auto" />
                      <div className="text-2xl font-bold text-green-600">
                        {learningStats.completionRate}%
                      </div>
                      <p className="text-sm text-gray-600">Taux de completion</p>
                      <Progress value={learningStats.completionRate} className="h-2" />
                    </div>
                  </Card>

                  <Card className="p-6 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <div className="space-y-2">
                      <Brain className="h-8 w-8 text-purple-600 mx-auto" />
                      <div className="text-2xl font-bold text-purple-600">
                        {learningStats.retentionScore}%
                      </div>
                      <p className="text-sm text-gray-600">Score de rétention</p>
                    </div>
                  </Card>

                  <Card className="p-6 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <div className="space-y-2">
                      <Repeat className="h-8 w-8 text-orange-600 mx-auto" />
                      <div className="text-2xl font-bold text-orange-600">
                        {learningStats.repeatedSections}
                      </div>
                      <p className="text-sm text-gray-600">Sections répétées</p>
                    </div>
                  </Card>
                </div>

                <Card className="mt-6 p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Analyse de Performance</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Progression d'apprentissage</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Mémorisation des concepts</span>
                            <span>92%</span>
                          </div>
                          <Progress value={92} className="h-2" />
                          
                          <div className="flex justify-between text-sm">
                            <span>Association musicale</span>
                            <span>88%</span>
                          </div>
                          <Progress value={88} className="h-2" />
                          
                          <div className="flex justify-between text-sm">
                            <span>Rétention à long terme</span>
                            <span>85%</span>
                          </div>
                          <Progress value={85} className="h-2" />
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Recommandations</h4>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-2 text-sm">
                            <Star className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <span>Excellent travail ! Continuez à ce rythme.</span>
                          </div>
                          <div className="flex items-start space-x-2 text-sm">
                            <TrendingUp className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Répétez les sections 4-6 pour améliorer la rétention.</span>
                          </div>
                          <div className="flex items-start space-x-2 text-sm">
                            <Headphones className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <span>Prochaine session recommandée dans 2-3 jours.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MedMngLayout>
  );
};

export default Player;