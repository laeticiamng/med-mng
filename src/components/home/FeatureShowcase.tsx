// ==========================================
// MED-MNG FEATURE SHOWCASE - Démonstration interactive
// ==========================================

import React, { memo, useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, Music, Brain, BookOpen, Target, Sparkles, CheckCircle, ArrowRight, Zap, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for demonstration
const mockMusicGeneration = {
  title: "IC-1 : Relation Médecin-Malade",
  lyrics: [
    "🎵 Dans le cabinet, face à face on se retrouve",
    "🎵 L'empathie guide, la confiance on éprouve",
    "🎵 Écouter d'abord, avant de diagnostiquer",
    "🎵 La relation soigne, faut pas l'oublier",
    "🎵 SPIKES pour annoncer, une mauvaise nouvelle",
    "🎵 Setting-Perception-Invitation-Knowledge-Emotions-Strategy, c'est l'échelle..."
  ],
  style: "Clinical Hip-Hop",
  duration: "3:24",
  rang: "A"
};

const mockTableauData = {
  title: "Tableau IC-1 : Compétences Relationnelles",
  headers: ["Concept", "Définition", "Exemple", "Piège", "Mnémotechnique"],
  rows: [
    ["Empathie clinique", "Capacité à comprendre sans se laisser submerger", "Reformuler les émotions du patient", "Confondre avec sympathie", "EMPATHIE = Écoute + Mesure + Professionnel"],
    ["Alliance thérapeutique", "Collaboration active autour d'objectifs partagés", "Accord sur le plan de traitement", "Croire qu'elle se crée automatiquement", "ALLIANCE = Accord + Loyauté + Liens + Intérêts"]
  ]
};

// Interactive Music Player Component
const InteractiveMusicPlayer = memo(() => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentLyric, setCurrentLyric] = useState(0);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev >= 100 ? 0 : prev + 2;
          if (newProgress % 16 === 0) { // Change lyric every 16%
            setCurrentLyric(prev => (prev + 1) % mockMusicGeneration.lyrics.length);
          }
          return newProgress;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="medical-card-premium p-8 space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">{mockMusicGeneration.title}</h3>
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-primary/10 text-primary">{mockMusicGeneration.style}</Badge>
            <Badge variant="outline">Rang {mockMusicGeneration.rang}</Badge>
            <Badge variant="outline">{mockMusicGeneration.duration}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">IA Generated</span>
        </div>
      </div>

      {/* Lyrics Display */}
      <div className="bg-muted/30 rounded-lg p-6 min-h-[200px] flex items-center justify-center">
        <motion.div
          key={currentLyric}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-center"
        >
          <p className="text-lg font-medium text-foreground mb-4">
            {mockMusicGeneration.lyrics[currentLyric]}
          </p>
          <motion.div
            animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 0.8, repeat: isPlaying ? Infinity : 0 }}
            className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto"
          >
            <Music className="w-6 h-6 text-primary" />
          </motion.div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-primary to-accent h-full rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0:00</span>
            <span>{mockMusicGeneration.duration}</span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
          >
            <Volume2 className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full medical-btn-primary"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
          >
            <Sparkles className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Generation Info */}
      <div className="bg-success/5 border border-success/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-success" />
          <span className="font-medium text-success">Génération Réussie</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Musique générée en 45 secondes avec validation médicale automatique
        </p>
      </div>
    </motion.div>
  );
});

// Interactive Tableau Component
const InteractiveTableau = memo(() => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [animatedCells, setAnimatedCells] = useState<Set<string>>(new Set());

  const handleCellClick = (rowIndex: number, cellIndex: number) => {
    const key = `${rowIndex}-${cellIndex}`;
    setAnimatedCells(prev => new Set([...prev, key]));
    setTimeout(() => {
      setAnimatedCells(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="medical-card-premium p-8 space-y-6"
    >
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-2">{mockTableauData.title}</h3>
        <Badge className="bg-accent/10 text-accent">
          <Brain className="w-4 h-4 mr-2" />
          IA Structurée
        </Badge>
      </div>

      {/* Interactive Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Headers */}
          <thead>
            <tr className="border-b border-border">
              {mockTableauData.headers.map((header, index) => (
                <th key={index} className="text-left p-4 font-semibold text-foreground bg-muted/20">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          {/* Rows */}
          <tbody>
            {mockTableauData.rows.map((row, rowIndex) => (
              <motion.tr
                key={rowIndex}
                className={cn(
                  "border-b border-border hover:bg-muted/30 cursor-pointer transition-colors",
                  selectedRow === rowIndex && "bg-primary/5"
                )}
                onClick={() => setSelectedRow(selectedRow === rowIndex ? null : rowIndex)}
                whileHover={{ scale: 1.01 }}
              >
                {row.map((cell, cellIndex) => (
                  <motion.td
                    key={cellIndex}
                    className={cn(
                      "p-4 text-sm",
                      animatedCells.has(`${rowIndex}-${cellIndex}`) && "bg-accent/20"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCellClick(rowIndex, cellIndex);
                    }}
                    animate={animatedCells.has(`${rowIndex}-${cellIndex}`) ? {
                      scale: [1, 1.05, 1],
                      backgroundColor: ["transparent", "hsl(var(--accent) / 0.2)", "transparent"]
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {cell}
                  </motion.td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Interactive Features */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-primary" />
            <span className="font-medium text-primary">Interaction</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Cliquez sur les cellules pour explorer le contenu
          </p>
        </div>
        
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-accent" />
            <span className="font-medium text-accent">IA Adaptive</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Contenu qui s'adapte à votre progression
          </p>
        </div>
      </div>
    </motion.div>
  );
});

// Main Feature Showcase Component
const FeatureShowcase: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.section 
      ref={ref}
      className="medical-section bg-gradient-to-b from-muted/10 to-background"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="medical-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-16"
        >
          <Badge className="mb-6 bg-primary/10 text-primary">
            <Sparkles className="w-4 h-4 mr-2" />
            Démonstration Interactive
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Voyez MED-MNG en Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explorez nos fonctionnalités révolutionnaires avec des exemples concrets
          </p>
        </motion.div>

        {/* Interactive Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Tabs defaultValue="music" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-12 bg-muted/50">
              <TabsTrigger value="music" className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                IA Musicale
              </TabsTrigger>
              <TabsTrigger value="tableau" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Tableaux IA
              </TabsTrigger>
            </TabsList>

            <TabsContent value="music" className="max-w-4xl mx-auto">
              <InteractiveMusicPlayer />
            </TabsContent>

            <TabsContent value="tableau" className="max-w-4xl mx-auto">
              <InteractiveTableau />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Feature Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid md:grid-cols-3 gap-8 mt-16"
        >
          {[
            {
              icon: Zap,
              title: "Génération Instantanée",
              description: "Contenu créé en secondes grâce à notre IA avancée"
            },
            {
              icon: Target,
              title: "Personnalisation Totale",
              description: "Chaque élément adapté à votre style d'apprentissage"
            },
            {
              icon: CheckCircle,
              title: "Validation Médicale",
              description: "Contenu vérifié par des experts médicaux"
            }
          ].map((feature, index) => (
            <Card key={index} className="medical-card text-center group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <Button size="lg" className="medical-btn-primary px-8 py-4 text-lg font-semibold group">
            Essayer Maintenant
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default memo(FeatureShowcase);