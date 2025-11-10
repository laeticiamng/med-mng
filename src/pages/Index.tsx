import React, { Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import { PremiumBackground } from "@/components/ui/premium-background";
import { PremiumCard } from "@/components/ui/premium-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { useNavigate } from "react-router-dom";
import { LogIn, CreditCard, BarChart3, Music, BookOpen, MessageSquare, Users, Zap, Target, Award, TrendingUp, Sparkles, Star, Wand2, Brain, Settings } from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";
import { WelcomeDashboard } from "@/components/welcome/WelcomeDashboard";
import MusicGenerationSection from "@/components/MusicGenerationSection";

// ⚡ LAZY LOADING - Charger les composants lourds seulement quand nécessaire
const MngPresentationBrief = lazy(() => import("@/components/MngPresentationBrief").then(module => ({
  default: module.MngPresentationBrief
})));
const MainSections = lazy(() => import("@/components/MainSections"));
const AppFooter = lazy(() => import("@/components/AppFooter").then(module => ({
  default: module.AppFooter
})));

// Composant de loading léger
const LazyLoadSpinner = () => <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>;
const Index = () => {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  return <PremiumBackground>
      
      {/* Header premium avec effet glassmorphism */}
      <div className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/20 shadow-lg">
        
      </div>

      {/* Contenu principal avec design premium */}
      <div className="container mx-auto px-4">
        {/* Section Hero premium */}
        <div className="pt-16 pb-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-medical/10 px-6 py-3 rounded-full mb-8 border border-primary/20">
              <Star className="h-5 w-5 text-primary" />
              <span className="text-primary font-semibold">Plateforme Premium</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-medical bg-clip-text text-transparent leading-tight">
              MED MNG
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
              <TranslatedText text="Révisez l'EDN avec l'intelligence artificielle" />
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <PremiumButton variant="primary" size="xl" onClick={() => navigate('/edn-complete')}>
                <BookOpen className="h-6 w-6 mr-3" />
                <TranslatedText text="Commencer mes Révisions" />
              </PremiumButton>
              <PremiumButton variant="glass" size="lg" onClick={() => navigate('/generator')}>
                <Music className="h-5 w-5 mr-2" />
                <TranslatedText text="Générer une Musique" />
              </PremiumButton>
            </div>
          </div>
        </div>

        {/* Section d'accès rapide premium avec grille 2x2 */}
        <div className="pb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              <TranslatedText text="Accès Rapide" />
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              <TranslatedText text="Choisissez votre outil et commencez à réviser immédiatement" />
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Items EDN Unifié */}
            <PremiumCard variant="gradient" className="p-8 text-center cursor-pointer" onClick={() => navigate('/edn-complete')}>
              <div className="mx-auto w-20 h-20 bg-gradient-medical rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/25">
                <BookOpen className="h-10 w-10 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                <TranslatedText text="Items EDN" />
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                <TranslatedText text="367 items EDN complets avec contenu immersif et 4,872 compétences OIC pour réviser efficacement" />
              </p>
              <div className="space-y-3 text-sm text-muted-foreground mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span>367 items complets</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span>4,872 compétences OIC</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                  <span>Contenu immersif & BD</span>
                </div>
              </div>
              <PremiumButton variant="primary" size="lg" className="w-full">
                <TranslatedText text="Réviser l'EDN" />
              </PremiumButton>
            </PremiumCard>

            {/* Générateur Musical */}
            <PremiumCard variant="gradient" className="p-8 text-center cursor-pointer" onClick={() => navigate('/generator')}>
              <div className="mx-auto w-20 h-20 bg-warning rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-warning/25">
                <Music className="h-10 w-10 text-warning-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                <TranslatedText text="Générateur Musical IA" />
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                <TranslatedText text="Génération rapide de musique éducative personnalisée avec intelligence artificielle" />
              </p>
              <div className="space-y-3 text-sm text-muted-foreground mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-warning rounded-full"></div>
                  <span>Sélection rapide d'items</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-destructive rounded-full"></div>
                  <span>Styles musicaux variés</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span>Génération IA instantanée</span>
                </div>
              </div>
              <PremiumButton variant="secondary" size="lg" className="w-full">
                <TranslatedText text="Générer Maintenant" />
              </PremiumButton>
            </PremiumCard>

            {/* ECOS */}
            <PremiumCard variant="gradient" className="p-8 text-center cursor-pointer" onClick={() => navigate('/ecos')}>
              <div className="mx-auto w-20 h-20 bg-success rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-success/25">
                <Users className="h-10 w-10 text-success-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                <TranslatedText text="Simulations ECOS" />
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                <TranslatedText text="Examens Cliniques Objectifs Structurés pour la pratique clinique - 3 situations disponibles" />
              </p>
              <div className="space-y-3 text-sm text-muted-foreground mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span>3 scénarios cliniques complets</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span>Évaluation par compétences</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                  <span>Feedback détaillé</span>
                </div>
              </div>
              <PremiumButton variant="glass" size="lg" className="w-full">
                <TranslatedText text="Commencer ECOS" />
              </PremiumButton>
            </PremiumCard>

            {/* MedChat */}
            <PremiumCard variant="gradient" className="p-8 text-center cursor-pointer" onClick={() => navigate('/chat')}>
              <div className="mx-auto w-20 h-20 bg-destructive rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-destructive/25">
                <MessageSquare className="h-10 w-10 text-destructive-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                <TranslatedText text="Assistant IA" />
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                <TranslatedText text="Assistant intelligent connecté à vos cours médicaux" />
              </p>
              <div className="space-y-3 text-sm text-muted-foreground mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-destructive rounded-full"></div>
                  <span>Chat en temps réel</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span>Base de connaissances médicales</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span>Réponses instantanées</span>
                </div>
              </div>
              <PremiumButton variant="accent" size="lg" className="w-full">
                <TranslatedText text="Démarrer Chat" />
              </PremiumButton>
            </PremiumCard>
          </div>
        </div>

        {/* Section statistiques premium */}
        <div className="pb-20">
          <PremiumCard variant="glass" className="p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-6 bg-gradient-medical bg-clip-text text-transparent">
                <TranslatedText text="Pourquoi Choisir MED MNG ?" />
              </h2>
              <p className="text-xl text-muted-foreground">
                <TranslatedText text="Une plateforme complète pour l'apprentissage médical moderne" />
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <PremiumCard variant="elevated" className="p-8">
                <Zap className="h-16 w-16 mx-auto mb-6 p-4 bg-warning text-warning-foreground rounded-2xl shadow-lg shadow-warning/25" />
                <h3 className="text-2xl font-bold mb-4 text-foreground">IA Avancée</h3>
                <p className="text-muted-foreground">Génération musicale intelligente pour un apprentissage optimal</p>
              </PremiumCard>
              <PremiumCard variant="elevated" className="p-8">
                <Target className="h-16 w-16 mx-auto mb-6 p-4 bg-success text-success-foreground rounded-2xl shadow-lg shadow-success/25" />
                <h3 className="text-2xl font-bold mb-4 text-foreground">Ciblé EDN</h3>
                <p className="text-muted-foreground">Contenu adapté aux référentiels médicaux officiels IC-1 à IC-367</p>
              </PremiumCard>
              <PremiumCard variant="elevated" className="p-8">
                <Award className="h-16 w-16 mx-auto mb-6 p-4 bg-destructive text-destructive-foreground rounded-2xl shadow-lg shadow-destructive/25" />
                <h3 className="text-2xl font-bold mb-4 text-foreground">Qualité</h3>
                <p className="text-muted-foreground">Méthode pédagogique innovante et éprouvée</p>
              </PremiumCard>
              <PremiumCard variant="elevated" className="p-8">
                <TrendingUp className="h-16 w-16 mx-auto mb-6 p-4 bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/25" />
                <h3 className="text-2xl font-bold mb-4 text-foreground">Efficace</h3>
                <p className="text-muted-foreground">Amélioration mesurable des performances d'apprentissage</p>
              </PremiumCard>
            </div>
          </PremiumCard>
        </div>

        {/* Section MNG premium - LAZY LOADED */}
        <Suspense fallback={<LazyLoadSpinner />}>
          <div className="pb-20">
            <MngPresentationBrief />
          </div>
        </Suspense>

        {/* Section Bibliothèque Musicale - Nouveau composant */}
        <Suspense fallback={<LazyLoadSpinner />}>
          <div className="pb-20">
            {React.createElement(React.lazy(() => import('@/components/music/MusicLibrary').then(module => ({
            default: module.MusicLibrary
          }))))}
          </div>
        </Suspense>
        
        {/* Section Génération Musicale premium - Static Import */}
        <div className="pb-20">
          <MusicGenerationSection />
        </div>
        
        {/* Sections principales premium - LAZY LOADED */}
        <Suspense fallback={<LazyLoadSpinner />}>
          <div className="pb-20">
            <MainSections />
          </div>
        </Suspense>
        
        {/* Footer - LAZY LOADED */}
        <Suspense fallback={<LazyLoadSpinner />}>
          <AppFooter />
        </Suspense>
      </div>

      {/* Admin Audit Button premium */}
      {isAdmin && <div className="fixed bottom-6 right-6 z-50">
          <PremiumButton variant="glass" size="md" onClick={() => navigate('/audit-general')} className="shadow-2xl">
            <BarChart3 className="h-5 w-5 mr-2" />
            <span className="font-semibold">Audit EDN</span>
          </PremiumButton>
        </div>}
    </PremiumBackground>;
};
export default Index;