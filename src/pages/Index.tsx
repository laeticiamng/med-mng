import React from "react";
import { useNavigate } from "react-router-dom";
import { Music, BookOpen, MessageSquare, Users, Sparkles, LogIn, CreditCard, Star, Zap, Shield, Award, Play, Heart, Clock, BarChart3 } from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConsistentBackground } from "@/components/layout/ConsistentBackground";
import { InteractiveDemo } from "@/components/generator/InteractiveDemo";
import { FloatingElements } from "@/components/immersive/FloatingElements";
import { ParallaxBackground } from "@/components/immersive/ParallaxBackground";
import { InteractiveStats } from "@/components/immersive/InteractiveStats";
import { AdvancedMusicPlayer } from "@/components/immersive/AdvancedMusicPlayer";
import { LiveStatsWidget } from "@/components/immersive/LiveStatsWidget";
import { SearchAndRecommendations } from "@/components/immersive/SearchAndRecommendations";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <ConsistentBackground variant="primary">
      <ParallaxBackground />
      <FloatingElements />
      
      {/* Header optimisé pour mobile */}
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-white truncate">MED MNG</h1>
              <p className="text-xs sm:text-sm text-white/70 hidden sm:block">Plateforme d'apprentissage médical avec IA musicale</p>
              <Badge className="bg-pink-500/20 text-pink-300 border-pink-400/30 text-xs mt-1 sm:mt-0">Premium</Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10 hidden sm:flex"
              onClick={() => navigate('/med-mng/pricing')}
              aria-label="Voir les offres d'abonnement et tarifs"
            >
              <CreditCard className="w-4 h-4 mr-1" />
              Tarifs
            </Button>
            <div className="flex gap-1 sm:gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10 hidden md:flex"
                onClick={() => navigate('/dashboard')}
                aria-label="Accéder au tableau de bord"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Dashboard
              </Button>
              <Button 
                size="sm"
                className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 text-xs sm:text-sm"
                onClick={() => navigate('/med-mng/login')}
                aria-label="Se connecter à son compte MED-MNG"
              >
                <LogIn className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Connexion</span>
                <span className="sm:hidden">Login</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section optimisé mobile */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="lcp-heading text-4xl sm:text-6xl md:text-8xl font-bold text-white mb-6 sm:mb-8 leading-tight" id="main-content">
            Apprenez la médecine<br />
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              comme jamais
            </span>
          </h2>
          <p className="text-base sm:text-xl text-gray-300 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-2">
            Révolutionnez votre apprentissage médical avec l'IA musicale. 
            Maîtrisez les 367 items EDN grâce à des chansons éducatives personnalisées et mémorisables.
          </p>
          
          {/* Interface de recherche et recommandations immersive */}
          <SearchAndRecommendations />
          
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 px-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-white/20">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400" />
              <span className="text-white text-xs sm:text-sm font-medium">IA Avancée</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-white/20">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
              <span className="text-white text-xs sm:text-sm font-medium">367 Items EDN</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-white/20">
              <Award className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
              <span className="text-white text-xs sm:text-sm font-medium">Certifié Médical</span>
            </div>
          </div>
        </div>

        {/* Galerie de démonstrations immersive */}
        <div className="mb-16 sm:mb-20">
          <InteractiveDemo onTrackSelect={(trackId) => {
            toast({
              title: "🎵 Démonstration Interactive",
              description: "Découvrez cette création musicale générée par MED MNG IA",
            });
            navigate('/generator');
          }} />
          
          {/* Compteur en temps réel */}
          <div className="flex justify-center mt-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3">
              <div className="flex items-center space-x-4 text-white">
                <div className="text-center">
                  <div className="text-2xl font-bold animate-pulse">2,847</div>
                  <div className="text-xs text-white/70">Musiques créées</div>
                </div>
                <div className="w-px h-8 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold animate-pulse">156</div>
                  <div className="text-xs text-white/70">Étudiants actifs</div>
                </div>
                <div className="w-px h-8 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold animate-pulse">98%</div>
                  <div className="text-xs text-white/70">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats en temps réel */}
        <LiveStatsWidget />

        {/* Stats interactives */}
        <InteractiveStats />

        {/* Lecteur musical avancé en démonstration */}
        <div className="mb-16 sm:mb-20">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Expérience d'Écoute Immersive
            </h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Découvrez notre interface de lecture révolutionnaire, conçue spécialement pour l'apprentissage médical
            </p>
          </div>
          
          <div className="flex justify-center">
            <AdvancedMusicPlayer />
          </div>
        </div>

        {/* Section des témoignages et preuves sociales */}
        <div className="mb-16 sm:mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ils transforment leur apprentissage avec MED MNG
            </h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Découvrez les témoignages d'étudiants qui révolutionnent leur façon d'apprendre la médecine
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
            {[
              {
                name: "Sarah M., P1",
                quote: "Grâce aux musiques MNG, j'ai enfin retenu la classification NYHA ! Le style trap rend l'apprentissage addictif.",
                score: 95,
                subject: "Cardiologie"
              },
              {
                name: "Thomas L., ECN",
                quote: "Les paroles sont scientifiquement exactes et les mélodies restent en tête. J'ai progressé de 15 points aux évaluations.",
                score: 87,
                subject: "Neurologie"
              },
              {
                name: "Emma R., Externe",
                quote: "L'interface immersive et les recommandations IA personnalisées ont révolutionné ma révision des EDN.",
                score: 92,
                subject: "Pneumologie"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-black/20 backdrop-blur-xl border border-white/10 p-6 hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{testimonial.name[0]}</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-white font-semibold">{testimonial.name}</p>
                      <p className="text-white/70 text-sm">{testimonial.subject}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < 5 ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                    ))}
                    <span className="ml-2 text-white/70 text-sm">Score: {testimonial.score}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sections principales optimisées mobile */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-8 max-w-6xl mx-auto mb-12 sm:mb-16 px-2">
          <Card 
            className="group cursor-pointer hover:shadow-2xl transition-all duration-500 bg-black/20 backdrop-blur-xl border border-white/10 hover:border-pink-400/50 overflow-hidden will-change-transform gpu-accelerated" 
            onClick={() => navigate('/edn')}
          >
            <CardContent className="p-4 sm:p-8 relative">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-3">Items EDN</h3>
                <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  Base complète IC-1 à IC-367 avec 4,872 compétences OIC intégrées pour une maîtrise totale
                </p>
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
                  <Badge className="bg-pink-500/20 text-pink-300 border-pink-400/30 text-xs">367 Items</Badge>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-xs">4,872 Compétences</Badge>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs">Immersif</Badge>
                </div>
                <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 touch-target" size="lg">
                  Explorer EDN
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer hover:shadow-2xl transition-all duration-500 bg-black/20 backdrop-blur-xl border border-white/10 hover:border-blue-400/50 overflow-hidden will-change-transform gpu-accelerated" 
            onClick={() => navigate('/generator')}
          >
            <CardContent className="p-4 sm:p-8 relative">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Music className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-3">Générateur Musical IA</h3>
                <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  Créez des chansons éducatives personnalisées avec l'intelligence artificielle de dernière génération
                </p>
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs">IA Avancée</Badge>
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 text-xs">Multi-Styles</Badge>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-400/30 text-xs">Instantané</Badge>
                </div>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 touch-target" size="lg">
                  Générer Maintenant
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Autres sections optimisées mobile */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-8 max-w-6xl mx-auto mb-12 sm:mb-16 px-2">
          <Card 
            className="group cursor-pointer hover:shadow-2xl transition-all duration-500 bg-black/20 backdrop-blur-xl border border-white/10 hover:border-green-400/50 overflow-hidden will-change-transform gpu-accelerated" 
            onClick={() => navigate('/ecos')}
          >
            <CardContent className="p-4 sm:p-8 relative">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-3">Simulations ECOS</h3>
                <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  Examens Cliniques Objectifs Structurés pour la pratique médicale immersive
                </p>
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
                  <Badge className="bg-green-500/20 text-green-300 border-green-400/30 text-xs">3 Scénarios</Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs">Évaluation</Badge>
                  <Badge className="bg-teal-500/20 text-teal-300 border-teal-400/30 text-xs">Feedback</Badge>
                </div>
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 touch-target" size="lg">
                  Commencer ECOS
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer hover:shadow-2xl transition-all duration-500 bg-black/20 backdrop-blur-xl border border-white/10 hover:border-orange-400/50 overflow-hidden will-change-transform gpu-accelerated" 
            onClick={() => navigate('/chat')}
          >
            <CardContent className="p-4 sm:p-8 relative">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-3">Assistant IA</h3>
                <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  Chat intelligent spécialisé en médecine avec base de connaissances experte
                </p>
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/30 text-xs">Chat Temps Réel</Badge>
                  <Badge className="bg-red-500/20 text-red-300 border-red-400/30 text-xs">Base Médicale</Badge>
                  <Badge className="bg-pink-500/20 text-pink-300 border-pink-400/30 text-xs">IA Experte</Badge>
                </div>
                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0 touch-target" size="lg">
                  Démarrer Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section CTA finale optimisée mobile */}
        <div className="text-center px-2">
          <Card className="bg-black/20 backdrop-blur-xl border border-white/10 max-w-4xl mx-auto overflow-hidden">
            <CardContent className="p-6 sm:p-12 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10"></div>
              <div className="relative">
                <h3 className="text-2xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
                  Prêt à révolutionner votre apprentissage ?
                </h3>
                <p className="text-base sm:text-xl text-gray-300 mb-6 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
                  Rejoignez des milliers d'étudiants qui transforment leur façon d'apprendre la médecine avec l'IA
                </p>
                <div className="flex flex-col gap-3 sm:gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto px-6 sm:px-8 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 touch-target" 
                    onClick={() => navigate('/med-mng/pricing')}
                  >
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Découvrir nos Offres
                  </Button>
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto px-6 sm:px-8 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 touch-target" 
                    onClick={() => navigate('/generator')}
                  >
                    <Music className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Essayer Gratuitement
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Premium */}
        <div className="text-center py-8 sm:py-12 px-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-gray-300">
            <span>&copy; 2024 MED MNG. Tous droits réservés.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">Conditions</a>
              <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    </ConsistentBackground>
  );
};

export default Index;