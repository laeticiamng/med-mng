
import { HeroSection } from "@/components/HeroSection";
import { MngPresentationBrief } from "@/components/MngPresentationBrief";
import { MainSections } from "@/components/MainSections";
import { MusicGenerationSection } from "@/components/MusicGenerationSection";
import { AppFooter } from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogIn, CreditCard, BarChart3, Music, Users, BookOpen, Zap, Target, Award, TrendingUp } from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  // Simple admin check - you can replace this with your actual admin logic
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      
      {/* Header amélioré avec navigation fixe */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
              <span className="font-bold text-xl text-gray-900">MED MNG</span>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/generator')}
                className="hidden sm:inline-flex text-gray-600 hover:text-gray-900"
              >
                <Music className="h-4 w-4 mr-2" />
                <TranslatedText text="Générateur" />
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/med-mng/pricing')}
                className="flex items-center gap-2 bg-white/80 hover:bg-white shadow-sm"
              >
                <CreditCard className="h-4 w-4" />
                <TranslatedText text="Tarifs" />
              </Button>
              
              <Button
                onClick={() => navigate('/med-mng/login')}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <LogIn className="h-4 w-4" />
                <TranslatedText text="Connexion" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal avec espacement amélioré */}
      <div className="container mx-auto px-4">
        {/* Section Hero avec padding top réduit pour compenser le header fixe */}
        <div className="pt-8 pb-12">
          <HeroSection />
        </div>

        {/* Section d'accès rapide enrichie */}
        <div className="pb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              <TranslatedText text="Accès Rapide aux Outils" />
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              <TranslatedText text="Choisissez votre méthode d'apprentissage et commencez immédiatement" />
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate('/edn')}>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">
                  <TranslatedText text="Items EDN" />
                </CardTitle>
                <CardDescription>
                  <TranslatedText text="Items à Choix Multiples pour l'apprentissage médical structuré" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>IC1 à IC5 disponibles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Rangs A et B</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Contenu interactif</span>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                  <TranslatedText text="Accéder aux Items" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate('/ecos')}>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">
                  <TranslatedText text="Simulation ECOS" />
                </CardTitle>
                <CardDescription>
                  <TranslatedText text="Évaluations Cliniques Objectives Structurées en simulation" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Cas cliniques réalistes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Évaluation en temps réel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Feedback immédiat</span>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                  <TranslatedText text="Commencer ECOS" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate('/generator')}>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
                  <Music className="h-8 w-8 text-amber-600" />
                </div>
                <CardTitle className="text-xl">
                  <TranslatedText text="Générateur Musical" />
                </CardTitle>
                <CardDescription>
                  <TranslatedText text="Génération rapide de musique éducative personnalisée" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Sélection rapide d'items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span>Styles musicaux variés</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>Génération IA instantanée</span>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-amber-600 hover:bg-amber-700">
                  <TranslatedText text="Générer Maintenant" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section statistiques et avantages */}
        <div className="pb-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                <TranslatedText text="Pourquoi Choisir MED MNG ?" />
              </h2>
              <p className="text-xl opacity-90">
                <TranslatedText text="Une plateforme complète pour l'apprentissage médical moderne" />
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <Zap className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
                <h3 className="text-2xl font-bold mb-2">IA Avancée</h3>
                <p className="text-sm opacity-90">Génération musicale intelligente pour un apprentissage optimal</p>
              </div>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <Target className="h-12 w-12 mx-auto mb-4 text-green-300" />
                <h3 className="text-2xl font-bold mb-2">Ciblé</h3>
                <p className="text-sm opacity-90">Contenu adapté aux référentiels médicaux officiels</p>
              </div>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <Award className="h-12 w-12 mx-auto mb-4 text-orange-300" />
                <h3 className="text-2xl font-bold mb-2">Qualité</h3>
                <p className="text-sm opacity-90">Méthode pédagogique innovante et éprouvée</p>
              </div>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-blue-300" />
                <h3 className="text-2xl font-bold mb-2">Efficace</h3>
                <p className="text-sm opacity-90">Amélioration mesurable des performances d'apprentissage</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section MNG */}
        <div className="pb-16">
          <MngPresentationBrief />
        </div>
        
        {/* Section Génération Musicale - Point central */}
        <div className="pb-16">
          <MusicGenerationSection />
        </div>
        
        {/* Sections principales */}
        <div className="pb-16">
          <MainSections />
        </div>
        
        {/* Footer */}
        <AppFooter />
      </div>

      {/* Admin Audit Button - Bottom Right - UNIQUEMENT POUR ADMIN */}
      {isAdmin && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => navigate('/audit-general')}
            variant="outline"
            size="sm"
            className="bg-white/95 backdrop-blur-sm border-gray-300 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Audit EDN</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;
