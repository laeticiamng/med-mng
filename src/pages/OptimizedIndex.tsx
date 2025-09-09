// ==========================================
// MED-MNG PREMIUM HOME PAGE - Experience exceptionnelle
// ==========================================

import React, { memo, Suspense, lazy, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Users, BookOpen, Music, Brain, Stethoscope, GraduationCap, Sparkles, Star, ChevronDown, CheckCircle, Zap, Target, Trophy, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Lazy load components for performance
const FeatureShowcase = lazy(() => import('@/components/home/FeatureShowcase'));
const TestimonialCarousel = lazy(() => import('@/components/home/TestimonialCarousel'));

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

// Premium Hero Section
const PremiumHero = memo(() => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    { icon: Music, text: "IA Musicale Révolutionnaire" },
    { icon: Brain, text: "Apprentissage Adaptatif" },
    { icon: Stethoscope, text: "Contenu Médical Validé" },
    { icon: GraduationCap, text: "Parcours Personnalisés" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <motion.section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/10"
      initial="initial"
      animate="animate"
      variants={staggerChildren}
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-gentle-float" />

      <div className="medical-container relative z-10 text-center space-y-8">
        <motion.div variants={fadeInUp} className="space-y-4">
          <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-4 h-4 mr-2" />
            Révolution de l'Apprentissage Médical
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-shimmer-medical bg-[length:200%_100%]">
              MED-MNG
            </span>
            <br />
            <span className="text-2xl md:text-4xl font-semibold text-muted-foreground">
              L'IA au Service de l'Excellence Médicale
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Révolutionnez votre apprentissage médical avec notre IA avancée qui génère automatiquement 
            du contenu musical, des tableaux interactifs et des quiz personnalisés pour chaque item ECN.
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Button 
            size="lg" 
            className="medical-btn-primary px-8 py-4 text-lg font-semibold group"
            onClick={() => navigate('/med-mng/signup')}
          >
            Commencer Gratuitement
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="medical-btn-outline px-8 py-4 text-lg font-semibold group"
            onClick={() => navigate('/platform')}
          >
            <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Voir la Démo
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
});

// Main Component
const OptimizedIndex: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>MED-MNG - Révolutionnez votre Apprentissage Médical avec l'IA</title>
        <meta name="description" content="Plateforme d'apprentissage médical révolutionnaire avec IA musicale, tableaux interactifs et contenu personnalisé pour réussir les ECN." />
        <meta name="keywords" content="médecine, ECN, apprentissage, IA, musique éducative, étudiants médecine" />
        <link rel="canonical" href="/" />
        <meta property="og:title" content="MED-MNG - L'IA au Service de l'Excellence Médicale" />
        <meta property="og:description" content="Transformez votre préparation ECN avec notre IA révolutionnaire." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <main className="min-h-screen">
        <PremiumHero />
        
        <Suspense fallback={<div className="h-96 bg-muted/10 animate-pulse rounded-lg" />}>
          <FeatureShowcase />
        </Suspense>
        
        <Suspense fallback={<div className="h-64 bg-muted/10 animate-pulse rounded-lg" />}>
          <TestimonialCarousel />
        </Suspense>

        {/* Final CTA */}
        <motion.section 
          className="medical-section bg-gradient-to-r from-primary via-accent to-primary text-white"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="medical-container text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-bold">
                Prêt à Révolutionner Votre Apprentissage ?
              </h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Rejoignez des milliers d'étudiants qui ont déjà transformé leur préparation ECN
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="px-8 py-4 text-lg font-semibold bg-white text-primary hover:bg-gray-100">
                  Commencer Maintenant
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </>
  );
};

export default memo(OptimizedIndex);