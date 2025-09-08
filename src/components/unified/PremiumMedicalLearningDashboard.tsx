// ============================================
// TABLEAU DE BORD PREMIUM - APPRENTISSAGE MÉDICAL PAR LA MUSIQUE
// ============================================

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Music, 
  TrendingUp, 
  Award, 
  Clock, 
  Target,
  Headphones,
  BookOpen,
  Stethoscope,
  BarChart3,
  Users,
  Calendar,
  Sparkles,
  Heart,
  Trophy
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { UnifiedMedicalMusicPlayer } from './UnifiedMedicalMusicPlayer';
import { useMedicalMusicOrchestrator } from '@/hooks/unified/useMedicalMusicOrchestrator';
import type { MedicalMusicTrack } from '@/types/music-unified';

// ==========================================
// INTERFACES ET TYPES
// ==========================================

interface LearningStats {
  total_study_time: number;
  tracks_completed: number;
  learning_streak: number;
  mastery_score: number;
  favorite_domains: string[];
  weekly_progress: number;
}

interface MedicalDomain {
  id: string;
  name: string;
  icon: React.ReactNode;
  progress: number;
  total_tracks: number;
  completed_tracks: number;
  difficulty_level: 1 | 2 | 3 | 4 | 5;
  estimated_time: number; // en minutes
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  max_progress?: number;
}

// ==========================================
// DONNÉES MOCK PREMIUM
// ==========================================

const MEDICAL_DOMAINS: MedicalDomain[] = [
  {
    id: 'cardio',
    name: 'Cardiologie',
    icon: <Heart className="h-5 w-5 text-red-500" />,
    progress: 85,
    total_tracks: 24,
    completed_tracks: 20,
    difficulty_level: 4,
    estimated_time: 180
  },
  {
    id: 'neuro',
    name: 'Neurologie', 
    icon: <Brain className="h-5 w-5 text-purple-500" />,
    progress: 62,
    total_tracks: 18,
    completed_tracks: 11,
    difficulty_level: 5,
    estimated_time: 240
  },
  {
    id: 'pneumo',
    name: 'Pneumologie',
    icon: <Stethoscope className="h-5 w-5 text-blue-500" />,
    progress: 91,
    total_tracks: 16,
    completed_tracks: 15,
    difficulty_level: 3,
    estimated_time: 120
  },
  {
    id: 'pediatrie',
    name: 'Pédiatrie',
    icon: <Users className="h-5 w-5 text-green-500" />,
    progress: 45,
    total_tracks: 22,
    completed_tracks: 10,
    difficulty_level: 2,
    estimated_time: 200
  }
];

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_track',
    title: 'Premier pas musical',
    description: 'Écoutez votre première chanson médicale',
    icon: <Music className="h-5 w-5 text-blue-500" />,
    unlocked: true
  },
  {
    id: 'streak_7',
    title: 'Étudiant assidu',
    description: '7 jours consécutifs d\'apprentissage',
    icon: <Calendar className="h-5 w-5 text-orange-500" />,
    unlocked: true
  },
  {
    id: 'domain_master',
    title: 'Maître de domaine',
    description: 'Complétez 100% d\'un domaine médical',
    icon: <Trophy className="h-5 w-5 text-yellow-500" />,
    unlocked: false,
    progress: 91,
    max_progress: 100
  },
  {
    id: 'speed_learner',
    title: 'Apprenant rapide',
    description: 'Maîtrisez 10 chansons en moins de 2h',
    icon: <Sparkles className="h-5 w-5 text-pink-500" />,
    unlocked: false,
    progress: 7,
    max_progress: 10
  }
];

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================

export const PremiumMedicalLearningDashboard: React.FC = () => {
  
  const [learningStats, setLearningStats] = useState<LearningStats>({
    total_study_time: 2340, // minutes
    tracks_completed: 127,
    learning_streak: 12,
    mastery_score: 87,
    favorite_domains: ['Cardiologie', 'Neurologie', 'Pneumologie'],
    weekly_progress: 23
  });
  
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [recentTracks, setRecentTracks] = useState<MedicalMusicTrack[]>([]);
  
  const orchestrator = useMedicalMusicOrchestrator({
    enableAnalytics: true,
    accessibilityConfig: {
      keyboardNavigation: true,
      ariaLabels: true,
      liveRegions: true
    }
  });
  
  const {
    playerState,
    play,
    generateMusic,
    checkQuota,
    getAnalytics
  } = orchestrator;

  // ==========================================
  // EFFECTS ET LOGIQUE
  // ==========================================
  
  useEffect(() => {
    // Charger les données d'analytics au montage
    getAnalytics('week').catch(console.error);
    checkQuota().catch(console.error);
  }, [getAnalytics, checkQuota]);
  
  // Formatage du temps
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  
  // Calcul du niveau de difficulté
  const getDifficultyColor = (level: number): string => {
    switch (level) {
      case 1: return 'text-green-500';
      case 2: return 'text-blue-500'; 
      case 3: return 'text-yellow-500';
      case 4: return 'text-orange-500';
      case 5: return 'text-red-500';
      default: return 'text-gray-500';
    }
  };
  
  // Génération rapide pour un domaine
  const handleQuickGenerate = async (domain: MedicalDomain) => {
    try {
      const taskId = await generateMusic({
        lyrics: `Apprenez ${domain.name} en musique ! Concepts essentiels et pratiques cliniques.`,
        item_code: domain.id.toUpperCase(),
        rang: 'A',
        medical_context: {
          domain: domain.name,
          competencies: [`Maîtrise de ${domain.name}`, 'Diagnostic clinique', 'Prise en charge'],
          learning_level: domain.difficulty_level <= 2 ? 'beginner' : domain.difficulty_level <= 4 ? 'intermediate' : 'advanced'
        },
        style: 'Éducatif Pop',
        duration: 180,
        language: 'fr',
        model: 'V4_5',
        quality: 'premium',
        custom_mode: true,
        instrumental: false
      });
      
      console.log(`🎵 Génération démarrée pour ${domain.name}:`, taskId);
    } catch (error) {
      console.error('Erreur génération rapide:', error);
    }
  };

  // ==========================================
  // RENDU DU COMPOSANT
  // ==========================================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="container mx-auto max-w-7xl space-y-8">
        
        {/* Header Premium */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MedMusic Academy
              </h1>
              <p className="text-lg text-muted-foreground">
                Plateforme Premium d'Apprentissage Médical par la Musique
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-6">
            <Badge variant="outline" className="text-sm">
              <Trophy className="h-4 w-4 mr-1" />
              Niveau Expert
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Sparkles className="h-4 w-4 mr-1" />
              {learningStats.learning_streak} jours de suite
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Target className="h-4 w-4 mr-1" />
              Score {learningStats.mastery_score}%
            </Badge>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>Temps d'étude</span>
                <Clock className="h-5 w-5 text-blue-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {formatTime(learningStats.total_study_time)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                +{formatTime(learningStats.weekly_progress)} cette semaine
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>Pistes complétées</span>
                <Headphones className="h-5 w-5 text-green-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {learningStats.tracks_completed}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Across {learningStats.favorite_domains.length} specialties
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>Score de maîtrise</span>
                <Award className="h-5 w-5 text-purple-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {learningStats.mastery_score}%
              </div>
              <Progress value={learningStats.mastery_score} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>Série d'étude</span>
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {learningStats.learning_streak}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                jours consécutifs 🔥
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Contenu principal avec onglets */}
        <Tabs defaultValue="domains" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="domains" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Domaines médicaux</span>
            </TabsTrigger>
            <TabsTrigger value="player" className="flex items-center space-x-2">
              <Music className="h-4 w-4" />
              <span>Lecteur musical</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Accomplissements</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Onglet Domaines médicaux */}
          <TabsContent value="domains" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MEDICAL_DOMAINS.map((domain) => (
                <Card 
                  key={domain.id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedDomain === domain.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedDomain(selectedDomain === domain.id ? null : domain.id)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {domain.icon}
                        <span>{domain.name}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={getDifficultyColor(domain.difficulty_level)}
                      >
                        Niveau {domain.difficulty_level}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {domain.completed_tracks}/{domain.total_tracks} pistes complétées • 
                      ~{formatTime(domain.estimated_time)} restantes
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progression</span>
                        <span className="font-medium">{domain.progress}%</span>
                      </div>
                      <Progress value={domain.progress} className="h-2" />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickGenerate(domain);
                        }}
                        className="flex-1"
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        Générer
                      </Button>
                      <Button 
                        size="sm" 
                        variant="default"
                        className="flex-1"
                      >
                        <BookOpen className="h-4 w-4 mr-1" />
                        Étudier
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Onglet Lecteur musical */}
          <TabsContent value="player" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Music className="h-5 w-5" />
                  <span>Lecteur Musical Premium</span>
                </CardTitle>
                <CardDescription>
                  Lecteur unifié avec accessibilité complète et fonctionnalités avancées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UnifiedMedicalMusicPlayer 
                  variant="full"
                  showLyrics={true}
                  showVisualizer={true}
                  enableKeyboardControls={true}
                  screenReaderOptimized={true}
                  onTrackChange={(track) => {
                    console.log('Track changé:', track?.title);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Onglet Accomplissements */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ACHIEVEMENTS.map((achievement) => (
                <Card 
                  key={achievement.id}
                  className={`${
                    achievement.unlocked 
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' 
                      : 'opacity-70'
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      {achievement.icon}
                      <span>{achievement.title}</span>
                      {achievement.unlocked && (
                        <Badge className="bg-yellow-500 text-yellow-50">
                          Débloqué
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{achievement.description}</CardDescription>
                  </CardHeader>
                  
                  {!achievement.unlocked && achievement.progress !== undefined && (
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progression</span>
                          <span>{achievement.progress}/{achievement.max_progress}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress / (achievement.max_progress || 1)) * 100} 
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Onglet Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Performance hebdomadaire</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Temps d'écoute</span>
                      <span className="font-medium">+{learningStats.weekly_progress}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pistes complétées</span>
                      <span className="font-medium">+12 pistes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taux de réussite</span>
                      <span className="font-medium text-green-600">94%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Domaines étudiés</span>
                      <span className="font-medium">5 spécialités</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Domaines favoris</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {learningStats.favorite_domains.map((domain, index) => (
                      <div key={domain} className="flex items-center space-x-3">
                        <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className="flex-1">{domain}</span>
                        <Progress value={85 - index * 10} className="w-20 h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Footer */}
        <Separator />
        <div className="text-center text-sm text-muted-foreground">
          <p>MedMusic Academy Premium • Optimisé pour l'apprentissage médical par la musique</p>
        </div>
      </div>
    </div>
  );
};