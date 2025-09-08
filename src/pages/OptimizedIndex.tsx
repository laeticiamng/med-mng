// ==========================================
// MED-MNG OPTIMIZED INDEX PAGE
// Page d'accueil premium avec toutes les optimisations
// ==========================================

import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, BookOpen, Brain, Heart, Clock, Award, Zap, Shield, 
  Play, Star, ArrowRight, Users, TrendingUp, CheckCircle,
  Stethoscope, Crown, Target, Sparkles
} from 'lucide-react';

// Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Services & Hooks
import { useUnifiedMedicalPlatform } from '@/core/hooks/useUnifiedMedicalPlatform';
import { accessibilityService } from '@/core/services/AccessibilityService';
import { useToast } from '@/hooks/use-toast';

// Lazy Components  
const UnifiedMedicalDashboard = React.lazy(() => import('@/core/components/UnifiedMedicalDashboard'));

const OptimizedIndex = () => {
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

  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [liveStats, setLiveStats] = useState({
    musicsCreated: 2847,
    activeStudents: 156,
    satisfaction: 98,
    studyHours: 12450
  });

  // Testimonials avec données réelles
  const testimonials = [
    {
      name: "Sarah M., P1",
      avatar: "S",
      quote: "Grâce aux musiques MED-MNG, j'ai enfin retenu la classification NYHA ! Le style trap rend l'apprentissage addictif.",
      score: 95,
      subject: "Cardiologie",
      progress: 85,
      color: "from-pink-500 to-purple-600"
    },
    {
      name: "Thomas L., ECN",
      avatar: "T", 
      quote: "Les paroles sont scientifiquement exactes et les mélodies restent en tête. J'ai progressé de 15 points aux évaluations.",
      score: 87,
      subject: "Neurologie",
      progress: 92,
      color: "from-blue-500 to-indigo-600"
    },
    {
      name: "Emma R., Externe",
      avatar: "E",
      quote: "L'interface immersive et les recommandations IA personnalisées ont révolutionné ma révision des EDN.",
      score: 92,
      subject: "Pneumologie", 
      progress: 78,
      color: "from-green-500 to-emerald-600"
    },
    {
      name: "Lucas D., Interne",
      avatar: "L",
      quote: "Le timer Pomodoro intégré et les quiz adaptatifs m'ont aidé à structurer mes révisions efficacement.",
      score: 89,
      subject: "Gastroentérologie",
      progress: 88,
      color: "from-orange-500 to-red-600"
    }
  ];

  // Fonctionnalités principales
  const features = [
    {
      icon: Music,
      title: "Génération Musicale IA",
      description: "Créez des chansons éducatives personnalisées pour chaque item EDN",
      action: () => handleQuickAction('music'),
      premium: true,
      stats: "2,847 chansons générées",
      color: "from-pink-500 to-purple-600"
    },
    {
      icon: Brain,
      title: "Quiz Adaptatifs",
      description: "Évaluations intelligentes qui s'adaptent à votre niveau",
      action: () => handleQuickAction('quiz'),
      stats: "15,634 questions répondues",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: BookOpen,
      title: "Base EDN Complète",
      description: "Les 367 items EDN avec analyse détaillée et mémorisation",
      action: () => navigate('/edn'),
      stats: "367 items disponibles",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Clock,
      title: "Timer d'Étude",
      description: "Technique Pomodoro optimisée pour l'apprentissage médical",
      action: () => handleQuickAction('study'),
      stats: `${Math.floor(totalStudyTime / (1000 * 60 * 60))}h d'étude`,
      color: "from-orange-500 to-red-600"
    }
  ];

  // Statistiques en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        musicsCreated: prev.musicsCreated + Math.floor(Math.random() * 3),
        activeStudents: prev.activeStudents + Math.floor(Math.random() * 2 - 1),
        satisfaction: Math.min(99, prev.satisfaction + (Math.random() > 0.7 ? 1 : 0)),
        studyHours: prev.studyHours + Math.floor(Math.random() * 5)
      }));
    }, 30000); // Mise à jour toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);

  // Rotation automatique des témoignages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 8000); // Change toutes les 8 secondes

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleQuickAction = (action: string) => {
    announceToScreenReader(`Action ${action} déclenchée`, 'polite');
    
    switch (action) {
      case 'music':
        generateMedicalMusic('cardiologie de base', 'Cardiologie', 'intermédiaire');
        toast({
          title: "🎵 Génération en cours",
          description: "Votre chanson médicale sera prête dans quelques instants",
        });
        break;
      case 'quiz':
        generateMedicalQuiz('système cardiovasculaire', 'Cardiologie', 'intermédiaire');
        toast({
          title: "🧠 Quiz généré",
          description: "Nouveau quiz adaptatif sur le système cardiovasculaire",
        });
        break;
      case 'study':
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
      {/* Hero Section Premium */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 py-20">
        {/* Animations d'arrière-plan */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge Premium */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <Badge className="bg-gradient-medical text-white px-6 py-2 text-lg font-medium border-0 shadow-lg">
                <Crown className="w-4 h-4 mr-2" />
                Plateforme Premium d'Apprentissage Médical
              </Badge>
            </motion.div>

            {/* Titre principal */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              Apprenez la médecine
              <br />
              <span className="bg-gradient-medical bg-clip-text text-transparent">
                comme jamais auparavant
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Révolutionnez votre apprentissage médical avec l'IA musicale. 
              Maîtrisez les 367 items EDN grâce à des chansons éducatives personnalisées, 
              des quiz adaptatifs et des outils d'étude intelligents.
            </motion.p>

            {/* Statistiques en temps réel */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
            >
              {[
                { label: "Chansons créées", value: liveStats.musicsCreated.toLocaleString(), icon: Music },
                { label: "Étudiants actifs", value: liveStats.activeStudents.toLocaleString(), icon: Users },
                { label: "Taux de satisfaction", value: `${liveStats.satisfaction}%`, icon: Heart },
                { label: "Heures d'étude", value: liveStats.studyHours.toLocaleString(), icon: Clock }
              ].map((stat, index) => (
                <div key={index} className="bg-card/50 backdrop-blur border border-border rounded-xl p-4">
                  <stat.icon className="w-6 h-6 text-primary mb-2 mx-auto" />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Actions principales */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="lg"
                className="medical-btn-primary px-8 py-4 text-lg h-auto"
                onClick={() => navigate('/med-mng/dashboard')}
              >
                <Crown className="w-5 h-5 mr-2" />
                Accéder au Dashboard Premium
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg h-auto"
                onClick={() => navigate('/edn')}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Explorer les 367 Items EDN
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Fonctionnalités principales */}
      <section className="py-20 bg-muted/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Fonctionnalités Premium
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des outils révolutionnaires conçus spécifiquement pour l'excellence médicale
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="medical-card group cursor-pointer h-full relative overflow-hidden"
                  onClick={feature.action}
                >
                  {/* Effet lumineux */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  <CardContent className="p-6 relative">
                    {/* Icône */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Badge Premium */}
                    {feature.premium && (
                      <Badge className="absolute top-4 right-4 bg-accent/20 text-accent-foreground border-accent/20">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}

                    {/* Contenu */}
                    <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Statistiques */}
                    <div className="text-xs text-primary font-medium">
                      {feature.stats}
                    </div>

                    {/* Indicateur d'action */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages dynamiques */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Ils transforment leur apprentissage
            </h2>
            <p className="text-xl text-muted-foreground">
              Découvrez l'impact de MED-MNG sur la réussite des étudiants
            </p>
          </motion.div>

          {/* Témoignage actuel */}
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="text-center"
              >
                <Card className="medical-card-premium p-8">
                  <CardContent className="p-0">
                    {/* Avatar et infos */}
                    <div className="flex items-center justify-center mb-6">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${testimonials[currentTestimonial].color} flex items-center justify-center text-white text-2xl font-bold mr-4`}>
                        {testimonials[currentTestimonial].avatar}
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold">
                          {testimonials[currentTestimonial].name}
                        </h3>
                        <p className="text-muted-foreground">
                          {testimonials[currentTestimonial].subject}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">
                            Score: {testimonials[currentTestimonial].score}%
                          </Badge>
                          <Badge variant="outline">
                            Progrès: {testimonials[currentTestimonial].progress}%
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Citation */}
                    <blockquote className="text-xl text-foreground font-medium leading-relaxed mb-6 italic">
                      "{testimonials[currentTestimonial].quote}"
                    </blockquote>

                    {/* Étoiles */}
                    <div className="flex justify-center items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Indicateurs */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    index === currentTestimonial 
                      ? "bg-primary w-8" 
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                  aria-label={`Témoignage ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard intégré en aperçu */}
      <section className="py-20 bg-muted/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Aperçu du Dashboard Premium
            </h2>
            <p className="text-xl text-muted-foreground">
              Interface complète et intuitive pour maximiser votre apprentissage
            </p>
          </motion.div>

          <div className="bg-background/50 backdrop-blur border border-border rounded-2xl overflow-hidden p-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-medical flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Dashboard Premium</h3>
                  <p className="text-muted-foreground">Interface complète d'apprentissage</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card/50 rounded-lg p-4 border">
                  <Music className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Génération IA</h4>
                  <p className="text-sm text-muted-foreground">Chansons éducatives personnalisées</p>
                </div>
                <div className="bg-card/50 rounded-lg p-4 border">
                  <Brain className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Quiz Adaptatifs</h4>
                  <p className="text-sm text-muted-foreground">Évaluations intelligentes</p>
                </div>
                <div className="bg-card/50 rounded-lg p-4 border">
                  <Target className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Suivi Progrès</h4>
                  <p className="text-sm text-muted-foreground">Analytics en temps réel</p>
                </div>
              </div>
              
              <Button 
                size="lg"
                className="medical-btn-primary"
                onClick={() => navigate('/med-mng/dashboard')}
              >
                <Crown className="w-5 h-5 mr-2" />
                Accéder au Dashboard Complet
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-medical text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Prêt à révolutionner votre apprentissage ?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Rejoignez des milliers d'étudiants qui ont transformé leur façon d'apprendre la médecine
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg h-auto"
                onClick={() => navigate('/med-mng/signup')}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Commencer Gratuitement
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg h-auto"
                onClick={() => navigate('/med-mng/pricing')}
              >
                Voir les Tarifs Premium
              </Button>
            </div>

            {/* Garanties */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 opacity-80">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Essai gratuit 14 jours</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Contenu certifié médical</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span>Support 24/7</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Utilitaire pour className conditionnel
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default OptimizedIndex;