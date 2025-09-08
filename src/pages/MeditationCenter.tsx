import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Music, 
  BarChart3, 
  Mic, 
  Image, 
  Headphones,
  Activity,
  Target,
  Heart,
  Brain,
  Timer,
  Star,
  TrendingUp,
  Play,
  Settings
} from 'lucide-react';

// Import des composants de méditation
import { MeditationSidebar } from '@/components/meditation/MeditationSidebar';
import { PremiumMusicGenerator } from '@/components/meditation/PremiumMusicGenerator';
import { UltimateAudioMixer } from '@/components/meditation/UltimateAudioMixer';
import { AdvancedVoiceSynthesis } from '@/components/meditation/AdvancedVoiceSynthesis';
import { IntelligentAmbientImages } from '@/components/meditation/IntelligentAmbientImages';
import { PerfectListeningModes } from '@/components/meditation/PerfectListeningModes';

// Dashboard principal du centre de méditation
const MeditationDashboard: React.FC = () => {
  const stats = [
    {
      icon: Music,
      label: 'Musiques Générées',
      value: '247',
      change: '+23%',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      icon: Mic,
      label: 'Voix Synthétisées',
      value: '89',
      change: '+15%',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Image,
      label: 'Images d\'Ambiance',
      value: '156',
      change: '+31%',
      color: 'from-pink-500 to-rose-600'
    },
    {
      icon: Timer,
      label: 'Heures de Méditation',
      value: '1,234',
      change: '+18%',
      color: 'from-green-500 to-emerald-600'
    }
  ];

  const tools = [
    {
      id: 'music-generator',
      name: 'Générateur Musical IA',
      description: 'Créez des musiques avec Suno API et battements binauraux',
      icon: Music,
      color: 'from-purple-500 to-indigo-600',
      status: '100%',
      features: ['Suno API', 'Battements binauraux', '6 styles', 'Templates']
    },
    {
      id: 'audio-mixer',
      name: 'Mixeur Audio Ultimate',
      description: 'Console professionnelle avec analyseur spectral temps réel',
      icon: BarChart3,
      color: 'from-green-500 to-emerald-600',
      status: '100%',
      features: ['4 pistes', 'Analyseur spectral', 'Presets pro', 'Export audio']
    },
    {
      id: 'voice-synthesis',
      name: 'Synthèse Vocale Avancée',
      description: 'Voix naturelles avec OpenAI TTS et templates de méditation',
      icon: Mic,
      color: 'from-blue-500 to-cyan-600',
      status: '100%',
      features: ['OpenAI TTS', '6 voix', 'Qualité premium', 'Templates guidés']
    },
    {
      id: 'ambient-images',
      name: 'Images d\'Ambiance IA',
      description: 'Génération automatique d\'images avec DALL-E 3',
      icon: Image,
      color: 'from-pink-500 to-rose-600',
      status: '100%',
      features: ['DALL-E 3', '6 thèmes', 'Auto-génération', 'Diaporama']
    },
    {
      id: 'listening-modes',
      name: 'Modes d\'Écoute Parfaits',
      description: 'Ondes cérébrales avec monitoring biométrique temps réel',
      icon: Headphones,
      color: 'from-orange-500 to-red-600',
      status: '100%',
      features: ['6 modes binauraux', 'Monitoring cardiaque', 'Biométrie', 'Adaptatif']
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Centre de Méditation IA
          </h1>
          <p className="text-muted-foreground mt-2">
            Suite complète d'outils IA pour une expérience méditative exceptionnelle
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-success to-success-glow text-white px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            100% IA Complété
          </Badge>
          <Button className="bg-gradient-to-r from-primary to-accent text-white">
            <Play className="w-4 h-4 mr-2" />
            Démarrer Session
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3 text-success" />
                        <span className="text-xs text-success">{stat.change}</span>
                        <span className="text-xs text-muted-foreground">vs mois dernier</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Outils IA */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Outils IA Premium</h2>
          <Badge className="bg-primary/10 text-primary">5 outils disponibles</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {tools.map((tool, index) => {
            const IconComponent = tool.icon;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <Card className="h-full cursor-pointer hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  
                  <CardHeader className="relative">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${tool.color}`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <Badge className="bg-success/10 text-success border-success/20">
                        {tool.status}
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </CardHeader>

                  <CardContent className="relative">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {tool.features.map((feature, featureIndex) => (
                          <Badge 
                            key={featureIndex} 
                            variant="outline" 
                            className="text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button 
                        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                        onClick={() => window.location.href = `/meditation/${tool.id}`}
                      >
                        Ouvrir l'Outil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* État du Système */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5" />
              État du Système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Génération IA</span>
                <Badge className="bg-success/10 text-success">Opérationnel</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Synthèse Vocale</span>
                <Badge className="bg-success/10 text-success">Opérationnel</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Mixage Audio</span>
                <Badge className="bg-success/10 text-success">Opérationnel</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Génération</span>
                  <span>98%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full" style={{width: '98%'}} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Qualité Audio</span>
                  <span>100%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-gradient-to-r from-success to-success-glow h-2 rounded-full" style={{width: '100%'}} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5" />
              Actions Rapides
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start text-sm">
              <Music className="w-4 h-4 mr-2" />
              Générer Musique
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm">
              <Mic className="w-4 h-4 mr-2" />
              Créer Voix Guidée
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm">
              <Heart className="w-4 h-4 mr-2" />
              Session Cohérence
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const MeditationCenter: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <MeditationSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header avec trigger */}
          <header className="h-16 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
            <div className="flex items-center gap-4 px-6">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-r from-primary to-accent">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-sm">Centre Méditation</span>
              </div>
            </div>
          </header>

          {/* Contenu principal */}
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<MeditationDashboard />} />
              <Route path="/music-generator" element={<PremiumMusicGenerator />} />
              <Route path="/audio-mixer" element={<UltimateAudioMixer />} />
              <Route path="/voice-synthesis" element={<AdvancedVoiceSynthesis />} />
              <Route path="/ambient-images" element={<IntelligentAmbientImages />} />
              <Route path="/listening-modes" element={<PerfectListeningModes />} />
              <Route path="*" element={<Navigate to="/meditation" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MeditationCenter;