/**
 * ⚡ Dashboard Unifié MED-MNG Premium
 * Interface principale optimisée pour l'apprentissage médical par la musique
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Play, 
  Pause, 
  Music, 
  Brain, 
  TrendingUp, 
  Clock, 
  Target,
  Zap,
  BookOpen,
  Users,
  Activity,
  Award,
  Headphones,
  Volume2,
  ChevronRight,
  Filter,
  Star,
  Download
} from 'lucide-react';
import { useUnifiedMedicalPlatform } from '../hooks/useUnifiedMedicalPlatform';
import { logger } from '@/utils/logger';

export const UnifiedMedMngDashboard: React.FC = () => {
  const {
    medicalContent,
    userAnalytics,
    currentSession,
    isLoading,
    error,
    studiedPercentage,
    averageMastery,
    specialtyProgress,
    activeGenerationsCount,
    loadMedicalContent,
    generateMusic,
    startLearningSession,
    endLearningSession,
    getItemsBySpecialty
  } = useUnifiedMedicalPlatform();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Log l'initialisation du dashboard
  useEffect(() => {
    logger.info('MED-MNG Dashboard initialized', 'UnifiedMedMngDashboard', {
      contentLoaded: medicalContent.length,
      hasAnalytics: !!userAnalytics,
      hasActiveSession: !!currentSession
    });
  }, [medicalContent.length, userAnalytics, currentSession]);

  // Filtrage intelligent du contenu
  const filteredContent = React.useMemo(() => {
    let filtered = medicalContent;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(item => item.specialty === selectedSpecialty);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(item => item.difficulty === selectedDifficulty);
    }

    return filtered.sort((a, b) => {
      // Prioriser les items non étudiés
      if (a.progress.studied !== b.progress.studied) {
        return a.progress.studied ? 1 : -1;
      }
      // Puis par maîtrise croissante
      return a.progress.mastery - b.progress.mastery;
    });
  }, [medicalContent, searchTerm, selectedSpecialty, selectedDifficulty]);

  const handleGenerateMusic = async (itemId: string, difficulty: 'A' | 'B' | 'A+B') => {
    try {
      await generateMusic(itemId, difficulty);
    } catch (error) {
      logger.error('Failed to generate music from dashboard', 'UnifiedMedMngDashboard', error);
    }
  };

  const handleStartSession = () => {
    if (currentSession) {
      endLearningSession();
    } else {
      startLearningSession();
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Recharger la page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard MED-MNG - Apprentissage Médical par la Musique</title>
        <meta 
          name="description" 
          content="Tableau de bord premium pour l'apprentissage médical par la musique avec IA. Suivi des progrès, génération musicale et analytics avancés." 
        />
        <meta name="keywords" content="apprentissage médical, musique éducative, IA générative, EDN 2025, dashboard étudiant" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Header Premium */}
        <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                    <Music className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">MED-MNG</h1>
                    <p className="text-xs text-muted-foreground">Apprentissage Musical Médical</p>
                  </div>
                </div>
                
                {currentSession && (
                  <Badge variant="default" className="bg-green-500/10 text-green-700 border-green-500/20">
                    <Activity className="h-3 w-3 mr-1" />
                    Session Active
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant={currentSession ? "destructive" : "default"}
                  onClick={handleStartSession}
                  className="gap-2"
                >
                  {currentSession ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Terminer Session
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Nouvelle Session
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Stats Overview */}
          {userAnalytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Items Étudiés</p>
                      <p className="text-2xl font-bold text-foreground">{userAnalytics.itemsCompleted}</p>
                      <p className="text-xs text-blue-600">{studiedPercentage.toFixed(1)}% du programme</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Score Moyen</p>
                      <p className="text-2xl font-bold text-foreground">{userAnalytics.averageScore}%</p>
                      <p className="text-xs text-green-600">Maîtrise: {averageMastery.toFixed(1)}%</p>
                    </div>
                    <Target className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Temps d'Étude</p>
                      <p className="text-2xl font-bold text-foreground">
                        {Math.floor(userAnalytics.totalStudyTime / (60 * 1000))}min
                      </p>
                      <p className="text-xs text-purple-600">Série de {userAnalytics.streakDays} jours</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Musique</p>
                      <p className="text-2xl font-bold text-foreground">
                        {Math.floor(userAnalytics.musicEngagement.totalListeningTime / (60 * 1000))}min
                      </p>
                      <p className="text-xs text-orange-600">
                        {(userAnalytics.musicEngagement.completionRate * 100).toFixed(0)}% complétude
                      </p>
                    </div>
                    <Headphones className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-card">
              <TabsTrigger value="overview" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Aperçu
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Contenu
              </TabsTrigger>
              <TabsTrigger value="music" className="gap-2">
                <Music className="h-4 w-4" />
                Musique
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <Activity className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Progress par Spécialité */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Progrès par Spécialité
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(specialtyProgress).map(([specialty, progress]) => (
                      <div key={specialty} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{specialty}</span>
                          <span className="text-xs text-muted-foreground">
                            {progress.studied}/{progress.total} items
                          </span>
                        </div>
                        <Progress 
                          value={(progress.studied / progress.total) * 100} 
                          className="h-2"
                        />
                        <div className="text-xs text-muted-foreground">
                          Maîtrise moyenne: {(progress.mastery / progress.total).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Génération Active */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Générations en Cours
                      {activeGenerationsCount > 0 && (
                        <Badge variant="secondary">{activeGenerationsCount}</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activeGenerationsCount === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Music className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Aucune génération musicale en cours</p>
                        <p className="text-xs">Lancez une génération depuis l'onglet Contenu</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Ici on afficherait les générations actives */}
                        <div className="text-center py-4 text-sm text-muted-foreground">
                          {activeGenerationsCount} génération(s) musicale(s) en cours...
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher un item médical..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Spécialité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les spécialités</SelectItem>
                        {Object.keys(specialtyProgress).map(specialty => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger className="w-full md:w-32">
                        <SelectValue placeholder="Rang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous rangs</SelectItem>
                        <SelectItem value="A">Rang A</SelectItem>
                        <SelectItem value="B">Rang B</SelectItem>
                        <SelectItem value="A+B">Rang A+B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                          <div className="h-8 bg-muted rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : filteredContent.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Aucun contenu trouvé</h3>
                    <p className="text-muted-foreground">
                      Essayez de modifier vos critères de recherche
                    </p>
                  </div>
                ) : (
                  filteredContent.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow group">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.itemCode} • {item.specialty}
                              </p>
                            </div>
                            <Badge variant={item.progress.studied ? "default" : "secondary"} className="ml-2">
                              Rang {item.difficulty}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-muted-foreground">Maîtrise</span>
                              <span className="font-medium">{item.progress.mastery}%</span>
                            </div>
                            <Progress value={item.progress.mastery} className="h-1.5" />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGenerateMusic(item.id, item.difficulty)}
                              className="flex-1 gap-2"
                            >
                              <Music className="h-3 w-3" />
                              Générer
                            </Button>
                            <Button size="sm" variant="ghost" className="px-3">
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Music Tab */}
            <TabsContent value="music" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    Bibliothèque Musicale
                  </CardTitle>
                  <CardDescription>
                    Gérez vos générations musicales et accédez à votre contenu audio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Fonctionnalité en cours de développement</p>
                    <p className="text-xs">Lecteur musical intégré et gestion des playlists</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Analytics Détaillées
                  </CardTitle>
                  <CardDescription>
                    Analyse approfondie de vos performances et habitudes d'apprentissage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Analytics avancées en cours de développement</p>
                    <p className="text-xs">Graphiques de progression, insights IA et recommandations</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};