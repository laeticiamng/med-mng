import React from "react";
import { useNavigate } from "react-router-dom";
import { Music, BookOpen, MessageSquare, Users, Sparkles, LogIn, CreditCard, Star, Zap, Shield, Award, Play, Heart, Clock } from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SecurityHeaders } from "@/components/security/SecurityHeaders";

const Index = () => {
  const navigate = useNavigate();
  
  // Get absolute URL for canonical link
  const canonicalUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/` 
    : 'https://med-mng.lovable.app/';

  return (
    <>
      <SecurityHeaders
        title="MED MNG par EmotionsCare - Expérience Immersive d'Apprentissage Médical"
        description="Plateforme immersive d'apprentissage des items EDN et situations ECOS - Médecine sensorielle et interactive avec IA musicale"
        url={canonicalUrl}
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden gpu-accelerated">
      {/* Optimized background effects with reduced paint cost */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 will-change-transform"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.3),transparent_50%)] gpu-accelerated"></div>
      
      <div className="relative z-10">
        {/* Header simplifié et moderne */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">MED MNG</h1>
                <Badge className="bg-pink-500/20 text-pink-300 border-pink-400/30 text-xs">Premium</Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                className="text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => navigate('/med-mng/pricing')}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Tarifs
              </Button>
              <Button 
                className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20"
                onClick={() => navigate('/med-mng/login')}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Connexion
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Section inspiré de Suno */}
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-16">
            <h2 className="lcp-heading text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
              Apprenez la médecine<br />
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                comme jamais
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Révolutionnez votre apprentissage médical avec l'IA musicale. 
              Maîtrisez les 367 items EDN grâce à des chansons éducatives personnalisées et mémorisables.
            </p>
            
            {/* CTA Principal style Suno */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-12">
              <div className="relative flex-1 max-w-md">
                <input 
                  type="text" 
                  placeholder="Ex: IC-103 Vertige, Cardiologie, Pneumologie..."
                  className="w-full px-6 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-300"
                  onFocus={(e) => e.target.style.transform = 'scale(1.02)'}
                  onBlur={(e) => e.target.style.transform = 'scale(1)'}
                />
              </div>
              <button 
                onClick={() => navigate('/generator')}
                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
              >
                🎵 Créer ma musique
              </button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <Zap className="w-4 h-4 text-pink-400" />
                <span className="text-white text-sm font-medium">IA Avancée</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-white text-sm font-medium">367 Items EDN</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <Award className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm font-medium">Certifié Médical</span>
              </div>
            </div>
          </div>

          {/* Galerie de démonstrations inspirée de Suno */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { title: "IC-103 Vertige", subtitle: "Neurologie", emoji: "🧠", plays: "2.3K", gradient: "from-purple-600 to-pink-600" },
              { title: "IC-230 Cardiologie", subtitle: "Cardiovasculaire", emoji: "❤️", plays: "1.8K", gradient: "from-red-500 to-pink-500" },
              { title: "IC-156 Pneumologie", subtitle: "Respiratoire", emoji: "🫁", plays: "1.5K", gradient: "from-blue-500 to-cyan-500" },
              { title: "IC-089 Psychiatrie", subtitle: "Santé mentale", emoji: "🧠", plays: "2.1K", gradient: "from-indigo-500 to-purple-500" }
            ].map((item, index) => (
              <div key={index} className="group cursor-pointer will-change-transform" onClick={() => navigate('/generator')}>
                <div className={`relative aspect-square bg-gradient-to-br ${item.gradient} rounded-xl mb-4 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 gpu-accelerated`}>
                  <div className="absolute inset-0 flex items-center justify-center text-5xl">
                    {item.emoji}
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-3 shadow-lg">
                      <Play className="h-6 w-6 text-purple-600 ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-1 text-xs">
                        <Heart className="h-3 w-3" />
                        <span>{item.plays}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        <span>4:00</span>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-white font-medium text-sm mb-1 truncate">{item.title}</h3>
                <p className="text-gray-400 text-xs truncate">{item.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Sections principales avec design moderne */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
            <Card 
              className="group cursor-pointer hover:shadow-2xl transition-all duration-500 bg-black/20 backdrop-blur-xl border border-white/10 hover:border-pink-400/50 overflow-hidden will-change-transform gpu-accelerated" 
              onClick={() => navigate('/edn')}
            >
              <CardContent className="p-8 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Items EDN</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    Base complète IC-1 à IC-367 avec 4,872 compétences OIC intégrées pour une maîtrise totale
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Badge className="bg-pink-500/20 text-pink-300 border-pink-400/30">367 Items</Badge>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">4,872 Compétences</Badge>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">Immersif</Badge>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0" size="lg">
                    Explorer EDN
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="group cursor-pointer hover:shadow-2xl transition-all duration-500 bg-black/20 backdrop-blur-xl border border-white/10 hover:border-blue-400/50 overflow-hidden will-change-transform gpu-accelerated" 
              onClick={() => navigate('/generator')}
            >
              <CardContent className="p-8 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Music className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Générateur Musical IA</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    Créez des chansons éducatives personnalisées avec l'intelligence artificielle de dernière génération
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">IA Avancée</Badge>
                    <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30">Multi-Styles</Badge>
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-400/30">Instantané</Badge>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0" size="lg">
                    Générer Maintenant
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Autres sections */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
            <Card 
              className="group cursor-pointer hover:shadow-2xl transition-all duration-500 bg-black/20 backdrop-blur-xl border border-white/10 hover:border-green-400/50 overflow-hidden will-change-transform gpu-accelerated" 
              onClick={() => navigate('/ecos')}
            >
              <CardContent className="p-8 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Simulations ECOS</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    Examens Cliniques Objectifs Structurés pour la pratique médicale immersive
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Badge className="bg-green-500/20 text-green-300 border-green-400/30">3 Scénarios</Badge>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">Évaluation</Badge>
                    <Badge className="bg-teal-500/20 text-teal-300 border-teal-400/30">Feedback</Badge>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0" size="lg">
                    Commencer ECOS
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="group cursor-pointer hover:shadow-2xl transition-all duration-500 bg-black/20 backdrop-blur-xl border border-white/10 hover:border-orange-400/50 overflow-hidden will-change-transform gpu-accelerated" 
              onClick={() => navigate('/chat')}
            >
              <CardContent className="p-8 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Assistant IA</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    Chat intelligent spécialisé en médecine avec base de connaissances experte
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/30">Chat Temps Réel</Badge>
                    <Badge className="bg-red-500/20 text-red-300 border-red-400/30">Base Médicale</Badge>
                    <Badge className="bg-pink-500/20 text-pink-300 border-pink-400/30">IA Experte</Badge>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0" size="lg">
                    Démarrer Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section CTA finale */}
          <div className="text-center">
            <Card className="bg-black/20 backdrop-blur-xl border border-white/10 max-w-4xl mx-auto overflow-hidden">
              <CardContent className="p-12 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10"></div>
                <div className="relative">
                  <h3 className="text-4xl font-bold text-white mb-6">
                    Prêt à révolutionner votre apprentissage ?
                  </h3>
                  <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Rejoignez des milliers d'étudiants qui transforment leur façon d'apprendre la médecine avec l'IA
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg" 
                      className="px-8 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300" 
                      onClick={() => navigate('/med-mng/pricing')}
                    >
                      <Star className="w-5 h-5 mr-2" />
                      Découvrir nos Offres
                    </Button>
                    <Button 
                      size="lg" 
                      className="px-8 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300" 
                      onClick={() => navigate('/generator')}
                    >
                      <Music className="w-5 h-5 mr-2" />
                      Essayer Gratuitement
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};
export default Index;