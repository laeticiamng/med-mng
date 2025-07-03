
import { HeroSection } from "@/components/HeroSection";
import { MngPresentationBrief } from "@/components/MngPresentationBrief";
import MainSections from "@/components/MainSections";
import { MusicGenerationSection } from "@/components/MusicGenerationSection";
import { AppFooter } from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { PremiumBackground } from "@/components/ui/premium-background";
import { PremiumCard } from "@/components/ui/premium-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { useNavigate } from "react-router-dom";
import { LogIn, CreditCard, BarChart3, Music, BookOpen, MessageSquare, Users, Zap, Target, Award, TrendingUp, Sparkles, Star, Wand2, Brain } from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";

const Index = () => {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  return (
    <PremiumBackground>
      
      {/* Header premium avec effet glassmorphism */}
      <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo premium */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-xl shadow-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  MED MNG
                </span>
                <div className="text-xs text-gray-500 font-medium">Premium Platform</div>
              </div>
            </div>
            
            {/* Navigation premium */}
            <div className="flex items-center gap-3">
              <PremiumButton
                variant="glass"
                size="sm"
                onClick={() => navigate('/generator')}
                className="hidden sm:inline-flex"
              >
                <Music className="h-4 w-4 mr-2" />
                <TranslatedText text="Générateur" />
              </PremiumButton>
              
              <PremiumButton
                variant="secondary"
                size="sm"
                onClick={() => navigate('/med-mng/pricing')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                <TranslatedText text="Tarifs" />
              </PremiumButton>
              
              <PremiumButton
                variant="primary"
                size="sm"
                onClick={() => navigate('/med-mng/login')}
              >
                <LogIn className="h-4 w-4 mr-2" />
                <TranslatedText text="Connexion" />
              </PremiumButton>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal avec design premium */}
      <div className="container mx-auto px-4">
        {/* Section Hero premium */}
        <div className="pt-16 pb-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full mb-8 border border-blue-200/50">
              <Star className="h-5 w-5 text-blue-600" />
              <span className="text-blue-800 font-semibold">Plateforme Premium</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight">
              MED MNG
            </h1>
            <p className="text-2xl md:text-3xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              <TranslatedText text="L'apprentissage médical réinventé avec l'intelligence artificielle" />
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <PremiumButton
                variant="primary"
                size="xl"
                onClick={() => navigate('/edn')}
              >
                <BookOpen className="h-6 w-6 mr-3" />
                <TranslatedText text="Explorer les Items EDN" />
              </PremiumButton>
              <div className="flex gap-4">
                <PremiumButton
                  variant="glass"
                  size="lg"
                  onClick={() => navigate('/generator')}
                >
                  <Music className="h-5 w-5 mr-2" />
                  <TranslatedText text="Générateur (Supabase)" />
                </PremiumButton>
                <PremiumButton
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/suno-generator')}
                >
                  <Wand2 className="h-5 w-5 mr-2" />
                  <TranslatedText text="Suno Direct" />
                </PremiumButton>
                <PremiumButton
                  variant="accent"
                  size="lg"
                  onClick={() => navigate('/openai-generator')}
                >
                  <Brain className="h-5 w-5 mr-2" />
                  <TranslatedText text="OpenAI Direct" />
                </PremiumButton>
              </div>
            </div>
          </div>
        </div>

        {/* Section d'accès rapide premium avec grille 2x2 */}
        <div className="pb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              <TranslatedText text="Accès Rapide aux Outils" />
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              <TranslatedText text="Choisissez votre méthode d'apprentissage et commencez immédiatement" />
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Items EDN */}
            <PremiumCard variant="gradient" className="p-8 text-center cursor-pointer" onClick={() => navigate('/edn')}>
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                <TranslatedText text="Items EDN (IC-1 à IC-10)" />
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                <TranslatedText text="Items à Choix Multiples pour l'apprentissage médical structuré - 10 items complets" />
              </p>
              <div className="space-y-3 text-sm text-gray-600 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                  <span>IC-1 à IC-10 disponibles</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                  <span>Rangs A et B</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"></div>
                  <span>Contenu interactif</span>
                </div>
              </div>
              <PremiumButton variant="primary" size="lg" className="w-full">
                <TranslatedText text="Accéder aux Items" />
              </PremiumButton>
            </PremiumCard>

            {/* Générateur Musical */}
            <PremiumCard variant="gradient" className="p-8 text-center cursor-pointer" onClick={() => navigate('/generator')}>
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/25">
                <Music className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                <TranslatedText text="Générateur Musical IA" />
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                <TranslatedText text="Génération rapide de musique éducative personnalisée avec intelligence artificielle" />
              </p>
              <div className="space-y-3 text-sm text-gray-600 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                  <span>Sélection rapide d'items</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"></div>
                  <span>Styles musicaux variés</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                  <span>Génération IA instantanée</span>
                </div>
              </div>
              <PremiumButton variant="secondary" size="lg" className="w-full">
                <TranslatedText text="Générer Maintenant" />
              </PremiumButton>
            </PremiumCard>

            {/* ECOS */}
            <PremiumCard variant="gradient" className="p-8 text-center cursor-pointer opacity-75" onClick={() => navigate('/ecos')}>
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/25">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                <TranslatedText text="Simulations ECOS" />
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                <TranslatedText text="Examens Cliniques Objectifs Structurés pour la pratique clinique" />
              </p>
              <div className="space-y-3 text-sm text-gray-600 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                  <span>Scénarios cliniques réalistes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                  <span>Évaluation par compétences</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"></div>
                  <span>Feedback personnalisé</span>
                </div>
              </div>
              <PremiumButton variant="glass" size="lg" className="w-full" disabled>
                <TranslatedText text="Bientôt Disponible" />
              </PremiumButton>
            </PremiumCard>

            {/* MedChat */}
            <PremiumCard variant="gradient" className="p-8 text-center cursor-pointer" onClick={() => navigate('/chat')}>
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/25">
                <MessageSquare className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                <TranslatedText text="MedChat IA" />
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                <TranslatedText text="Chat intelligent pour questions médicales avec IA avancée" />
              </p>
              <div className="space-y-3 text-sm text-gray-600 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                  <span>Chat en temps réel</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                  <span>Base de connaissances médicales</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
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
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                <TranslatedText text="Pourquoi Choisir MED MNG ?" />
              </h2>
              <p className="text-xl text-gray-600">
                <TranslatedText text="Une plateforme complète pour l'apprentissage médical moderne" />
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <PremiumCard variant="elevated" className="p-8">
                <Zap className="h-16 w-16 mx-auto mb-6 p-4 bg-gradient-to-br from-yellow-400 to-amber-500 text-white rounded-2xl shadow-lg shadow-yellow-500/25" />
                <h3 className="text-2xl font-bold mb-4 text-gray-900">IA Avancée</h3>
                <p className="text-gray-600">Génération musicale intelligente pour un apprentissage optimal</p>
              </PremiumCard>
              <PremiumCard variant="elevated" className="p-8">
                <Target className="h-16 w-16 mx-auto mb-6 p-4 bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-2xl shadow-lg shadow-green-500/25" />
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Ciblé EDN</h3>
                <p className="text-gray-600">Contenu adapté aux référentiels médicaux officiels IC-1 à IC-10</p>
              </PremiumCard>
              <PremiumCard variant="elevated" className="p-8">
                <Award className="h-16 w-16 mx-auto mb-6 p-4 bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-2xl shadow-lg shadow-orange-500/25" />
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Qualité</h3>
                <p className="text-gray-600">Méthode pédagogique innovante et éprouvée</p>
              </PremiumCard>
              <PremiumCard variant="elevated" className="p-8">
                <TrendingUp className="h-16 w-16 mx-auto mb-6 p-4 bg-gradient-to-br from-blue-400 to-indigo-500 text-white rounded-2xl shadow-lg shadow-blue-500/25" />
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Efficace</h3>
                <p className="text-gray-600">Amélioration mesurable des performances d'apprentissage</p>
              </PremiumCard>
            </div>
          </PremiumCard>
        </div>

        {/* Section MNG premium */}
        <div className="pb-20">
          <MngPresentationBrief />
        </div>
        
        {/* Section Génération Musicale premium */}
        <div className="pb-20">
          <MusicGenerationSection />
        </div>
        
        {/* Sections principales premium */}
        <div className="pb-20">
          <MainSections />
        </div>
        
        {/* Footer */}
        <AppFooter />
      </div>

      {/* Admin Audit Button premium */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50">
          <PremiumButton
            variant="glass"
            size="md"
            onClick={() => navigate('/audit-general')}
            className="shadow-2xl shadow-black/20"
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            <span className="font-semibold">Audit EDN</span>
          </PremiumButton>
        </div>
      )}
    </PremiumBackground>
  );
};

export default Index;
