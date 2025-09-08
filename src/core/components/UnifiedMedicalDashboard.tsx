// ==========================================
// MED-MNG UNIFIED MEDICAL DASHBOARD
// Dashboard centralisé et optimisé
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Music, Brain, Timer, BarChart3, Settings, 
  Headphones, BookOpen, TrendingUp, Award
} from 'lucide-react';
import { useUnifiedMedicalPlatform } from '../hooks/useUnifiedMedicalPlatform';
import InteractiveStudyTools from '../../components/med-mng/InteractiveStudyTools';

export const UnifiedMedicalDashboard: React.FC = () => {
  const {
    generateMedicalMusic,
    generateMedicalQuiz,
    startStudySession,
    studySessions,
    totalStudyTime,
    performanceMetrics,
    loading,
    announceToScreenReader
  } = useUnifiedMedicalPlatform();

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleQuickAction = (action: string) => {
    announceToScreenReader(`Action ${action} déclenchée`, 'polite');
    
    switch (action) {
      case 'music':
        generateMedicalMusic('cardiologie de base', 'Cardiologie', 'intermédiaire');
        break;
      case 'quiz':
        generateMedicalQuiz('système cardiovasculaire', 'Cardiologie', 'intermédiaire');
        break;
      case 'study':
        startStudySession('reading');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-medical bg-clip-text text-transparent">
            MED-MNG Dashboard Premium
          </h1>
          <p className="text-xl text-muted-foreground">
            Plateforme d'apprentissage médical par l'IA musicale
          </p>
        </motion.div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="medical-card">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">Temps d'étude</p>
                <p className="text-2xl font-bold">{formatTime(totalStudyTime)}</p>
              </div>
              <Timer className="h-8 w-8 text-primary" />
            </CardContent>
          </Card>
          
          <Card className="medical-card">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">Sessions</p>
                <p className="text-2xl font-bold">{studySessions.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-accent" />
            </CardContent>
          </Card>
          
          <Card className="medical-card">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">Performance</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </CardContent>
          </Card>
          
          <Card className="medical-card">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">Niveau</p>
                <p className="text-2xl font-bold">Expert</p>
              </div>
              <Award className="h-8 w-8 text-warning" />
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <Card className="medical-card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Actions Rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                className="medical-btn-primary h-16 flex flex-col gap-2"
                onClick={() => handleQuickAction('music')}
                disabled={loading}
              >
                <Music className="h-6 w-6" />
                Générer Musique
              </Button>
              
              <Button
                className="medical-btn-secondary h-16 flex flex-col gap-2"
                onClick={() => handleQuickAction('quiz')}
                disabled={loading}
              >
                <Brain className="h-6 w-6" />
                Nouveau Quiz
              </Button>
              
              <Button
                className="medical-btn-outline h-16 flex flex-col gap-2"
                onClick={() => handleQuickAction('study')}
                disabled={loading}
              >
                <Headphones className="h-6 w-6" />
                Session d'Étude
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Outils interactifs intégrés */}
        <Tabs defaultValue="tools" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tools">Outils d'Étude</TabsTrigger>
            <TabsTrigger value="analytics">Analyses</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tools">
            <InteractiveStudyTools />
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analyse des Performances
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Analyses détaillées disponibles prochainement</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration de la Plateforme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Settings className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Paramètres avancés disponibles prochainement</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UnifiedMedicalDashboard;