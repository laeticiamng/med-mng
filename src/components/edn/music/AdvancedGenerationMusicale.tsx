import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Music, Mic, Download, Share2, Settings, Activity, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';

interface MusicStyle {
  id: string;
  name: string;
  description: string;
  medicalContext: string;
  tempo: number;
  mood: 'calme' | 'énergique' | 'contemplatif' | 'urgent';
  instruments: string[];
  competencesFavorisees: string[];
}

interface GeneratedTrack {
  id: string;
  title: string;
  style: string;
  duration: number;
  rang: 'A' | 'B' | 'AB';
  audioUrl?: string;
  waveformData?: number[];
  competences: string[];
  paroles: string[];
  bpm: number;
  key: string;
  generatedAt: Date;
}

interface AdvancedGenerationMusicaleProps {
  itemData: {
    title: string;
    subtitle: string;
    item_code: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
  };
  competences: string[];
}

export const AdvancedGenerationMusicale = ({ itemData, competences }: AdvancedGenerationMusicaleProps) => {
  const [selectedStyle, setSelectedStyle] = useState<MusicStyle | null>(null);
  const [selectedRang, setSelectedRang] = useState<'A' | 'B' | 'AB'>('A');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedTracks, setGeneratedTracks] = useState<GeneratedTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<GeneratedTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([80]);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [customLyrics, setCustomLyrics] = useState('');
  const [advancedMode, setAdvancedMode] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);

  // Styles musicaux adaptés au contexte médical
  const medicalMusicStyles: MusicStyle[] = [
    {
      id: 'classical-medical',
      name: 'Classique Médical',
      description: 'Musique classique adaptée à l\'apprentissage médical',
      medicalContext: 'Idéal pour la mémorisation et la concentration',
      tempo: 60,
      mood: 'contemplatif',
      instruments: ['piano', 'violons', 'violoncelle'],
      competencesFavorisees: ['Diagnostic', 'Anamnèse', 'Réflexion clinique']
    },
    {
      id: 'ambient-hospital',
      name: 'Ambiance Hospitalière',
      description: 'Sons d\'ambiance médicale relaxants',
      medicalContext: 'Recréer l\'atmosphère d\'un environnement de soin',
      tempo: 70,
      mood: 'calme',
      instruments: ['synthétiseur', 'piano électrique', 'cordes'],
      competencesFavorisees: ['Communication', 'Empathie', 'Relation patient']
    },
    {
      id: 'urgency-rhythm',
      name: 'Rythme d\'Urgence',
      description: 'Musique dynamique pour les situations d\'urgence',
      medicalContext: 'Simulation d\'urgences médicales',
      tempo: 120,
      mood: 'urgent',
      instruments: ['batterie', 'basse', 'cuivres'],
      competencesFavorisees: ['Urgences', 'Prise de décision', 'Gestes techniques']
    },
    {
      id: 'mnemonic-melody',
      name: 'Mélodie Mnémotechnique',
      description: 'Mélodies optimisées pour la mémorisation',
      medicalContext: 'Faciliter l\'apprentissage des concepts médicaux',
      tempo: 90,
      mood: 'énergique',
      instruments: ['guitare', 'piano', 'percussions légères'],
      competencesFavorisees: ['Mémorisation', 'Pharmacologie', 'Anatomie']
    }
  ];

  // Génération de paroles adaptées aux compétences
  const generateAdaptiveLyrics = (competences: string[], rang: 'A' | 'B' | 'AB') => {
    const lyricsTemplates = {
      'Cardiologie': [
        'Le cœur bat, régulier et fort',
        'Systole, diastole, un rythme d\'or',
        'L\'ECG révèle ses secrets',
        'Chaque onde a son message complet'
      ],
      'Neurologie': [
        'Les neurones tissent leur réseau',
        'Synapses, messages nouveaux',
        'Cerveau, moelle, un système entier',
        'La neurologie à maîtriser'
      ],
      'Diagnostic': [
        'Observer, écouter, palper',
        'Chaque signe va révéler',
        'Le diagnostic se dessine',
        'Par l\'art de la médecine'
      ]
    };

    let selectedLyrics: string[] = [];
    competences.forEach(comp => {
      if (lyricsTemplates[comp as keyof typeof lyricsTemplates]) {
        selectedLyrics.push(...lyricsTemplates[comp as keyof typeof lyricsTemplates]);
      }
    });

    if (selectedLyrics.length === 0) {
      selectedLyrics = [
        'Apprenons ensemble, pas à pas',
        'La médecine dans tous ses états',
        'Chaque concept, chaque notion',
        'Pour une parfaite formation'
      ];
    }

    return selectedLyrics;
  };

  // Simulation de génération musicale
  const generateMusic = async () => {
    if (!selectedStyle) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulation du processus de génération
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          completeGeneration();
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  const completeGeneration = () => {
    const newTrack: GeneratedTrack = {
      id: `track-${Date.now()}`,
      title: `${itemData.title} - ${selectedStyle?.name}`,
      style: selectedStyle?.id || '',
      duration: 180 + Math.random() * 120, // 3-5 minutes
      rang: selectedRang,
      competences: competences,
      paroles: customLyrics ? customLyrics.split('\n') : generateAdaptiveLyrics(competences, selectedRang),
      bpm: selectedStyle?.tempo || 90,
      key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)],
      generatedAt: new Date(),
      waveformData: Array.from({ length: 100 }, () => Math.random())
    };

    setGeneratedTracks(prev => [newTrack, ...prev]);
    setCurrentTrack(newTrack);
    setIsGenerating(false);
    setGenerationProgress(0);
  };

  // Visualisation de forme d'onde
  const drawWaveform = (canvas: HTMLCanvasElement, data: number[]) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !data) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / data.length;
    
    ctx.fillStyle = 'hsl(var(--primary))';
    
    data.forEach((value, index) => {
      const barHeight = value * height * 0.8;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;
      
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });
  };

  useEffect(() => {
    if (currentTrack?.waveformData && waveformCanvasRef.current) {
      drawWaveform(waveformCanvasRef.current, currentTrack.waveformData);
    }
  }, [currentTrack]);

  const StyleSelector = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {medicalMusicStyles.map((style) => (
        <motion.div
          key={style.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card 
            className={`p-4 cursor-pointer transition-all ${
              selectedStyle?.id === style.id 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => setSelectedStyle(style)}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold">{style.name}</h3>
              <Badge variant="outline">{style.mood}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{style.description}</p>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                <strong>Contexte:</strong> {style.medicalContext}
              </div>
              <div className="text-xs text-muted-foreground">
                <strong>Tempo:</strong> {style.tempo} BPM
              </div>
              <div className="flex flex-wrap gap-1">
                {style.competencesFavorisees.map((comp) => (
                  <Badge key={comp} variant="secondary" className="text-xs">
                    {comp}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const TrackPlayer = () => {
    if (!currentTrack) return null;

    return (
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            size="lg"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-full"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          <div className="flex-1">
            <h3 className="font-semibold">{currentTrack.title}</h3>
            <p className="text-sm text-muted-foreground">
              {currentTrack.style} • {currentTrack.bpm} BPM • Clé de {currentTrack.key}
            </p>
          </div>
          <Badge variant="outline">Rang {currentTrack.rang}</Badge>
        </div>

        {/* Forme d'onde */}
        <div className="mb-4">
          <canvas
            ref={waveformCanvasRef}
            width={800}
            height={100}
            className="w-full h-20 bg-muted/20 rounded"
          />
        </div>

        {/* Contrôles */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Volume2 className="w-4 h-4" />
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-12">
              {volume[0]}%
            </span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Télécharger
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Partager
            </Button>
            <Button variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Régénérer
            </Button>
          </div>
        </div>

        {/* Paroles */}
        <div className="mt-6 p-4 bg-muted/20 rounded-lg">
          <h4 className="font-medium mb-3">Paroles pédagogiques</h4>
          <div className="space-y-1">
            {currentTrack.paroles.map((ligne, index) => (
              <p key={index} className="text-sm italic">
                {ligne}
              </p>
            ))}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-900 dark:to-purple-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Génération Musicale Avancée
          </h1>
          <p className="text-muted-foreground">
            Créez des contenus musicaux pédagogiques adaptés à vos compétences médicales
          </p>
        </div>

        {/* Compétences ciblées */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Music className="w-5 h-5 text-primary" />
            <span className="font-semibold">Compétences ciblées</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {competences.map((competence) => (
              <Badge key={competence} variant="secondary">
                {competence}
              </Badge>
            ))}
          </div>
        </Card>

        <Tabs defaultValue="generation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generation">Génération</TabsTrigger>
            <TabsTrigger value="player">Lecteur</TabsTrigger>
            <TabsTrigger value="library">Bibliothèque</TabsTrigger>
          </TabsList>

          <TabsContent value="generation" className="space-y-6">
            {/* Options avancées */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Options de génération</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Mode avancé</span>
                  <Switch
                    checked={advancedMode}
                    onCheckedChange={setAdvancedMode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sélection du rang */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rang de compétence</label>
                  <div className="flex gap-2">
                    {(['A', 'B', 'AB'] as const).map((rang) => (
                      <Button
                        key={rang}
                        variant={selectedRang === rang ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedRang(rang)}
                      >
                        {rang === 'AB' ? 'A+B' : `Rang ${rang}`}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Génération automatique */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Génération automatique</label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={autoGenerate}
                      onCheckedChange={setAutoGenerate}
                    />
                    <span className="text-sm text-muted-foreground">
                      {autoGenerate ? 'Activée' : 'Désactivée'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Paroles personnalisées */}
              {advancedMode && (
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium">Paroles personnalisées</label>
                  <textarea
                    value={customLyrics}
                    onChange={(e) => setCustomLyrics(e.target.value)}
                    placeholder="Saisissez vos paroles personnalisées (une ligne par vers)..."
                    className="w-full h-24 p-3 border rounded-md resize-none"
                  />
                </div>
              )}
            </Card>

            {/* Sélection du style */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Choisissez votre style musical</h3>
              <StyleSelector />
            </div>

            {/* Génération */}
            <div className="flex justify-center">
              <Button
                onClick={generateMusic}
                disabled={!selectedStyle || isGenerating}
                size="lg"
                className="px-8 py-4"
              >
                {isGenerating ? (
                  <>
                    <Activity className="w-5 h-5 mr-2 animate-pulse" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Music className="w-5 h-5 mr-2" />
                    Générer la musique
                  </>
                )}
              </Button>
            </div>

            {/* Barre de progression */}
            {isGenerating && (
              <Card className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Génération en cours</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(generationProgress)}%
                    </span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    Création de la mélodie adaptée à vos compétences...
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="player">
            <TrackPlayer />
          </TabsContent>

          <TabsContent value="library" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Vos créations musicales</h3>
              <Badge variant="outline">
                {generatedTracks.length} piste{generatedTracks.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedTracks.map((track) => (
                <motion.div
                  key={track.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="p-4 cursor-pointer hover:bg-muted/50"
                    onClick={() => setCurrentTrack(track)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm leading-tight">
                          {track.title}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {track.rang}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Style: {track.style}</div>
                        <div>Durée: {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</div>
                        <div>BPM: {track.bpm}</div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {track.competences.slice(0, 2).map((comp) => (
                          <Badge key={comp} variant="secondary" className="text-xs">
                            {comp}
                          </Badge>
                        ))}
                        {track.competences.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{track.competences.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {generatedTracks.length === 0 && (
              <div className="text-center py-12">
                <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune création musicale</h3>
                <p className="text-muted-foreground">
                  Générez votre première piste musicale pédagogique
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};