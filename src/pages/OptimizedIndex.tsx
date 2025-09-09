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
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { cn } from '@/lib/utils';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import { useAdvancedAccessibility } from '@/hooks/useAdvancedAccessibility';
import { useUserPreferences } from '@/hooks/useUserPreferences';

// Lazy load components for performance
const FeatureShowcase = lazy(() => import('@/components/home/FeatureShowcase'));
const TestimonialCarousel = lazy(() => import('@/components/home/TestimonialCarousel'));

// Composant de squelette amélioré
const FeatureSkeleton = memo(() => (
  <div className="medical-section bg-gradient-to-br from-background via-primary/5 to-accent/5">
    <div className="medical-container">
      <div className="text-center mb-16">
        <div className="h-6 w-48 bg-muted/20 animate-pulse rounded mx-auto mb-4" />
        <div className="h-12 w-96 bg-muted/20 animate-pulse rounded mx-auto mb-6" />
        <div className="h-6 w-80 bg-muted/20 animate-pulse rounded mx-auto" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg border p-6">
            <div className="w-16 h-16 bg-muted/20 animate-pulse rounded-xl mx-auto mb-4" />
            <div className="h-6 w-32 bg-muted/20 animate-pulse rounded mx-auto mb-2" />
            <div className="h-4 w-full bg-muted/20 animate-pulse rounded mb-4" />
            <div className="h-9 w-24 bg-muted/20 animate-pulse rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  </div>
));

const TestimonialSkeleton = memo(() => (
  <div className="medical-section bg-gradient-to-br from-muted/20 to-background">
    <div className="medical-container">
      <div className="text-center mb-16">
        <div className="h-6 w-40 bg-muted/20 animate-pulse rounded mx-auto mb-4" />
        <div className="h-12 w-80 bg-muted/20 animate-pulse rounded mx-auto mb-6" />
        <div className="h-6 w-96 bg-muted/20 animate-pulse rounded mx-auto" />
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg border p-6">
            <div className="w-8 h-8 bg-muted/20 animate-pulse rounded mb-4" />
            <div className="space-y-2 mb-6">
              <div className="h-4 w-full bg-muted/20 animate-pulse rounded" />
              <div className="h-4 w-4/5 bg-muted/20 animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-muted/20 animate-pulse rounded" />
            </div>
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="w-4 h-4 bg-muted/20 animate-pulse rounded" />
              ))}
            </div>
            <div className="h-5 w-32 bg-muted/20 animate-pulse rounded mb-1" />
            <div className="h-4 w-24 bg-muted/20 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
));

// Animation variants avec respect des préférences utilisateur
const useAnimationVariants = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return {
    fadeInUp: prefersReducedMotion ? {} : {
      initial: { opacity: 0, y: 60 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
    },
    staggerChildren: prefersReducedMotion ? {} : {
      animate: {
        transition: {
          staggerChildren: 0.2
        }
      }
    }
  };
};

// Premium Hero Section avec authentification intelligente
const PremiumHero = memo(() => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  const { fadeInUp, staggerChildren } = useAnimationVariants();

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

  const renderAuthenticatedCTA = () => {
    if (loading) {
      return (
        <div className="flex gap-4">
          <div className="h-12 w-48 bg-muted/20 animate-pulse rounded-lg" />
          <div className="h-12 w-32 bg-muted/20 animate-pulse rounded-lg" />
        </div>
      );
    }

    if (user) {
      return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Button asChild size="lg" className="medical-btn-primary px-8 py-4 text-lg font-semibold group">
            <Link to="/med-mng/dashboard">
              Accéder au Dashboard
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          
          <Button asChild size="lg" variant="outline" className="medical-btn-outline px-8 py-4 text-lg font-semibold group">
            <Link to="/med-mng/create">
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Créer du Contenu
            </Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
        <Button asChild size="lg" className="medical-btn-primary px-8 py-4 text-lg font-semibold group">
          <Link to="/med-mng/signup">
            Commencer Gratuitement
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
        
        <Button asChild size="lg" variant="outline" className="medical-btn-outline px-8 py-4 text-lg font-semibold group">
          <Link to="/platform">
            <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Voir la Démo
          </Link>
        </Button>
      </div>
    );
  };

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

        <motion.div variants={fadeInUp}>
          {renderAuthenticatedCTA()}
        </motion.div>
      </div>
    </motion.section>
  );
});

// Main Component
const OptimizedIndex: React.FC = () => {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const { announceToScreenReader } = useAdvancedAccessibility();
  
  // Activer les optimisations de performance
  usePerformanceOptimization();

  // Annoncer le chargement de la page pour les lecteurs d'écran
  useEffect(() => {
    announceToScreenReader('Page d\'accueil MED-MNG chargée', 'polite');
  }, [announceToScreenReader]);

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
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "MED-MNG",
            "description": "Plateforme d'apprentissage médical avec IA",
            "url": "https://med-mng.com",
            "logo": "https://med-mng.com/logo.png",
            "sameAs": [
              "https://twitter.com/medmng",
              "https://linkedin.com/company/medmng"
            ]
          })}
        </script>
      </Helmet>

      <main className="min-h-screen">
        <PremiumHero />
        
        <Suspense fallback={<FeatureSkeleton />}>
          <FeatureShowcase />
        </Suspense>
        
        <Suspense fallback={<TestimonialSkeleton />}>
          <TestimonialCarousel />
        </Suspense>

        {/* Final CTA avec authentification */}
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
                {user ? 'Continuez Votre Parcours d\'Excellence' : 'Prêt à Révolutionner Votre Apprentissage ?'}
              </h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                {user 
                  ? 'Explorez de nouvelles fonctionnalités et poursuivez votre progression'
                  : 'Rejoignez des milliers d\'étudiants qui ont déjà transformé leur préparation ECN'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <>
                    <Button asChild size="lg" variant="secondary" className="px-8 py-4 text-lg font-semibold bg-white text-primary hover:bg-gray-100">
                      <Link to="/med-mng/create">
                        Créer du Contenu
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold border-white text-white hover:bg-white/10">
                      <Link to="/med-mng/library">
                        Ma Bibliothèque
                      </Link>
                    </Button>
                  </>
                ) : (
                  <Button asChild size="lg" variant="secondary" className="px-8 py-4 text-lg font-semibold bg-white text-primary hover:bg-gray-100">
                    <Link to="/med-mng/signup">
                      Commencer Maintenant
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </>
  );
};

export default memo(OptimizedIndex);