// ==========================================
// MED-MNG ENHANCED MEDICAL PLATFORM
// Plateforme médicale optimisée et accessible
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, Heart, Brain, BookOpen, Music, Crown, 
  Zap, Shield, Award, Users, TrendingUp, Play, 
  ChevronRight, Star, Target, Clock, Trophy
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Services & Hooks
import { useUnifiedMedicalPlatform } from '@/core/hooks/useUnifiedMedicalPlatform';
import { accessibilityService } from '@/core/services/AccessibilityService';
import { useToast } from '@/hooks/use-toast';

export const EnhancedMedicalPlatform = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    generateMedicalMusic,
    generateMedicalQuiz,
    startStudySession,
    studySessions,
    totalStudyTime,
    loading,
    announceToScreenReader
  } = useUnifiedMedicalPlatform();

  const [activeSpecialty, setActiveSpecialty] = useState('cardiologie');

  const specialties = [
    {
      id: 'cardiologie',
      name: 'Cardiologie',
      icon: Heart,
      color: 'from-red-500 to-pink-600',
      items: 45,
      description: 'Système cardiovasculaire et pathologies cardiaques',
      progress: 78
    },
    {
      id: 'neurologie',
      name: 'Neurologie',
      icon: Brain,
      color: 'from-purple-500 to-indigo-600',
      items: 52,
      description: 'Système nerveux et troubles neurologiques',
      progress: 65
    },
    {
      id: 'pneumologie',
      name: 'Pneumologie',
      icon: Stethoscope,
      color: 'from-blue-500 to-cyan-600',
      items: 38,
      description: 'Système respiratoire et pathologies pulmonaires',
      progress: 82
    },
    {
      id: 'gastroenterologie',
      name: 'Gastroentérologie',
      icon: Target,
      color: 'from-green-500 to-emerald-600',
      items: 41,
      description: 'Système digestif et pathologies gastro-intestinales',
      progress: 56
    }
  ];

  const learningTools = [
    {
      title: 'Génération Musicale IA',
      description: 'Créez des chansons éducatives pour mémoriser efficacement',
      icon: Music,
      action: () => handleQuickGeneration('music'),
      premium: true,
      stats: '2,847 chansons générées',
      color: 'from-pink-500 to-purple-600'
    },
    {
      title: 'Quiz Adaptatifs',
      description: 'Évaluations personnalisées selon votre niveau',
      icon: Brain,
      action: () => handleQuickGeneration('quiz'),
      stats: '15,634 questions répondues',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Timer d\'Étude',
      description: 'Technique Pomodoro optimisée pour l\'apprentissage',
      icon: Clock,
      action: () => handleQuickGeneration('timer'),
      stats: `${Math.floor(totalStudyTime / (1000 * 60 * 60))}h d'étude`,
      color: 'from-orange-500 to-red-600'
    },
    {
      title: 'Suivi de Progrès',
      description: 'Analytics détaillées de votre apprentissage',
      icon: TrendingUp,
      action: () => navigate('/med-mng/analytics'),
      stats: `${studySessions.length} sessions`,
      color: 'from-green-500 to-emerald-600'
    }
  ];

  const recentAchievements = [
    { title: 'Maître de Cardiologie', description: '50 items EDN complétés', icon: Trophy, color: 'text-yellow-500' },
    { title: 'Mélomane Médical', description: '10 chansons générées', icon: Music, color: 'text-purple-500' },
    { title: 'Quiz Champion', description: '100 quiz réussis', icon: Star, color: 'text-blue-500' },
    { title: 'Étudiant Assidu', description: '30 jours consécutifs', icon: Award, color: 'text-green-500' }
  ];

  const handleQuickGeneration = (type: string) => {
    const currentSpecialty = specialties.find(s => s.id === activeSpecialty);
    
    announceToScreenReader(`Génération ${type} pour ${currentSpecialty?.name}`, 'polite');

    switch (type) {
      case 'music':
        generateMedicalMusic(
          `${currentSpecialty?.name} de base`, 
          currentSpecialty?.name || 'Médecine générale', 
          'intermédiaire'
        );
        toast({
          title: "🎵 Génération Musicale",
          description: `Création d'une chanson pour ${currentSpecialty?.name}`,
        });
        break;
      case 'quiz':
        generateMedicalQuiz(
          `système ${currentSpecialty?.name}`, 
          currentSpecialty?.name || 'Médecine générale', 
          'intermédiaire'
        );
        toast({
          title: "🧠 Quiz Adaptatif", 
          description: `Nouveau quiz généré pour ${currentSpecialty?.name}`,
        });
        break;
      case 'timer':
        startStudySession('reading');
        navigate('/med-mng/comprehensive');
        break;
    }
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* En-tête Premium */}
      <section className="bg-gradient-medical text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-full px-6 py-3">
                <Crown className="w-6 h-6" />
                <span className="font-semibold">Plateforme Médicale Premium</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Maîtrisez la Médecine
              <br />
              <span className="text-white/80">avec l'IA Musicale</span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Plateforme révolutionnaire combinant intelligence artificielle, 
              musique éducative et apprentissage adaptatif pour exceller aux EDN.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg h-auto"
                onClick={() => navigate('/med-mng/dashboard')}
              >
                <Crown className="w-5 h-5 mr-2" />
                Accéder au Dashboard
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg h-auto"
                onClick={() => navigate('/edn')}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Explorer les 367 Items EDN
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Statistiques Personnelles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <Card className="medical-card">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">Temps d'étude</p>
                <p className="text-2xl font-bold">{formatTime(totalStudyTime)}</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
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
                <p className="text-sm text-muted-foreground">Items maîtrisés</p>
                <p className="text-2xl font-bold">142/367</p>
              </div>
              <Target className="h-8 w-8 text-success" />
            </CardContent>
          </Card>
          
          <Card className="medical-card">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">Score moyen</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
              <Trophy className="h-8 w-8 text-warning" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Spécialités Médicales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Spécialités Médicales</h2>
              <p className="text-muted-foreground">
                Maîtrisez chaque domaine avec des outils adaptatifs
              </p>
            </div>
          </div>

          <Tabs value={activeSpecialty} onValueChange={setActiveSpecialty}>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
              {specialties.map((specialty) => (
                <TabsTrigger 
                  key={specialty.id} 
                  value={specialty.id}
                  className="flex items-center gap-2"
                >
                  <specialty.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{specialty.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {specialties.map((specialty) => (
              <TabsContent key={specialty.id} value={specialty.id}>
                <Card className="medical-card-premium">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${specialty.color} flex items-center justify-center`}>
                        <specialty.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{specialty.name}</CardTitle>
                        <p className="text-muted-foreground">{specialty.description}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <Badge variant="secondary">{specialty.items} items EDN</Badge>
                          <Badge variant="outline">Progrès: {specialty.progress}%</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progression</span>
                        <span>{specialty.progress}%</span>
                      </div>
                      <Progress value={specialty.progress} className="h-2" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Button
                        className="medical-btn-primary h-16 flex flex-col gap-1"
                        onClick={() => handleQuickGeneration('music')}
                        disabled={loading}
                      >
                        <Music className="w-6 h-6" />
                        <span>Générer Chanson</span>
                      </Button>
                      
                      <Button
                        className="medical-btn-secondary h-16 flex flex-col gap-1"
                        onClick={() => handleQuickGeneration('quiz')}
                        disabled={loading}
                      >
                        <Brain className="w-6 h-6" />
                        <span>Quiz Adaptatif</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>

        {/* Outils d'Apprentissage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Outils d'Apprentissage Premium</h2>
            <p className="text-muted-foreground">
              Technologies révolutionnaires pour maximiser votre réussite
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {learningTools.map((tool, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card 
                  className="medical-card group cursor-pointer h-full"
                  onClick={tool.action}
                >
                  <CardContent className="p-6 relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <tool.icon className="w-6 h-6 text-white" />
                    </div>

                    {tool.premium && (
                      <Badge className="absolute top-4 right-4 bg-accent/20 text-accent-foreground border-accent/20">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}

                    <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {tool.description}
                    </p>

                    <div className="text-xs text-primary font-medium mb-4">
                      {tool.stats}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Utiliser</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Succès Récents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <Card className="medical-card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-6 h-6 text-accent" />
                Succès Récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg">
                    <achievement.icon className={`w-8 h-8 ${achievement.color}`} />
                    <div>
                      <h4 className="font-semibold text-sm">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions Rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <Card className="medical-card-premium p-8">
            <h2 className="text-2xl font-bold mb-4">Prêt à continuer votre apprentissage ?</h2>
            <p className="text-muted-foreground mb-8">
              Choisissez votre prochain défi et progressez vers l'excellence médicale
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="medical-btn-primary px-8 py-4 text-lg h-auto"
                onClick={() => navigate('/med-mng/comprehensive')}
              >
                <Brain className="w-5 h-5 mr-2" />
                Outils d'Étude Complets
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg h-auto"
                onClick={() => navigate('/edn')}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Parcourir les Items EDN
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedMedicalPlatform;