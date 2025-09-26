import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Music, BookOpen, MessageSquare, Users, Sparkles, LogIn, CreditCard, Star, Zap, Shield, Award, Play, Heart, Clock, ArrowRight, TrendingUp, Brain, Headphones } from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConsistentBackground } from "@/components/layout/ConsistentBackground";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const features = [
    { icon: Zap, text: "IA Avancée", color: "text-pink-400" },
    { icon: Shield, text: "367 Items EDN", color: "text-purple-400" },
    { icon: Award, text: "Certifié Médical", color: "text-blue-400" }
  ];

  const stats = [
    { value: "2,847", label: "Musiques créées", trend: "+12%" },
    { value: "156", label: "Étudiants actifs", trend: "+23%" },
    { value: "98%", label: "Satisfaction", trend: "+5%" }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "P1 - Cardiologie",
      quote: "Grâce aux musiques MNG, j'ai enfin retenu la classification NYHA ! Le style trap rend l'apprentissage addictif.",
      score: 95,
      avatar: "S"
    },
    {
      name: "Thomas L.",
      role: "ECN - Neurologie", 
      quote: "Les paroles sont scientifiquement exactes et les mélodies restent en tête. J'ai progressé de 15 points.",
      score: 87,
      avatar: "T"
    },
    {
      name: "Emma R.",
      role: "Externe - Pneumologie",
      quote: "L'interface immersive et les recommandations IA ont révolutionné ma révision des EDN.",
      score: 92,
      avatar: "E"
    }
  ];

  return (
    <ConsistentBackground variant="primary">
      <div className="min-h-screen">
        {/* Header moderne */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl blur opacity-25 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">MED MNG</h1>
                <p className="text-sm text-muted-foreground">Plateforme d'apprentissage médical IA</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => navigate('/med-mng/pricing')}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Tarifs
              </Button>
              <Button 
                size="sm"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg"
                onClick={() => navigate('/med-mng/login')}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Connexion
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-secondary/50 backdrop-blur-sm px-4 py-2 rounded-full border mb-8">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-foreground">Nouveau : IA musicale avancée</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-tight">
              Apprenez la médecine
              <span className="block bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                comme jamais
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
              Révolutionnez votre apprentissage médical avec l'IA musicale. 
              Maîtrisez les 367 items EDN grâce à des chansons éducatives personnalisées.
            </p>

            {/* Features badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 bg-secondary/30 backdrop-blur-sm px-4 py-2 rounded-full border">
                  <feature.icon className={`w-4 h-4 ${feature.color}`} />
                  <span className="text-sm font-medium text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-xl px-8 py-4 text-lg"
                onClick={() => navigate('/generator')}
              >
                <Play className="w-5 h-5 mr-2" />
                Commencer maintenant
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 px-8 py-4 text-lg hover:bg-secondary/50"
                onClick={() => navigate('/edn')}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Explorer EDN
              </Button>
            </div>

            {/* Stats en temps réel */}
            <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-6 max-w-2xl mx-auto">
              <div className="grid grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground mb-2">{stat.label}</div>
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400 font-medium">{stat.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sections principales */}
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {/* Items EDN */}
            <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-background to-secondary/20 border-2 hover:border-pink-400/50 overflow-hidden">
              <CardContent className="p-6" onClick={() => navigate('/edn')}>
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Items EDN</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  367 items complets avec contenus spécialisés
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-pink-500/20 text-pink-400 border-pink-400/30 text-xs">367 Items</Badge>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-400/30 text-xs">Immersif</Badge>
                </div>
                <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0">
                  Explorer
                </Button>
              </CardContent>
            </Card>

            {/* Générateur Musical */}
            <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-background to-secondary/20 border-2 hover:border-blue-400/50 overflow-hidden">
              <CardContent className="p-6" onClick={() => navigate('/generator')}>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Générateur IA</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Créez des chansons éducatives personnalisées
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30 text-xs">IA Avancée</Badge>
                  <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-400/30 text-xs">Multi-Styles</Badge>
                </div>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0">
                  Générer
                </Button>
              </CardContent>
            </Card>

            {/* ECOS */}
            <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-background to-secondary/20 border-2 hover:border-green-400/50 overflow-hidden">
              <CardContent className="p-6" onClick={() => navigate('/ecos')}>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">ECOS</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Simulations cliniques interactives
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-green-500/20 text-green-400 border-green-400/30 text-xs">3 Scénarios</Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-400/30 text-xs">Évaluation</Badge>
                </div>
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0">
                  Commencer
                </Button>
              </CardContent>
            </Card>

            {/* Chat */}
            <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-background to-secondary/20 border-2 hover:border-orange-400/50 overflow-hidden">
              <CardContent className="p-6" onClick={() => navigate('/chat')}>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">MedChat</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Assistant IA pour questions médicales
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-400/30 text-xs">24/7</Badge>
                  <Badge className="bg-red-500/20 text-red-400 border-red-400/30 text-xs">Temps réel</Badge>
                </div>
                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0">
                  Chatter
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Témoignages */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Ils transforment leur apprentissage
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Découvrez comment nos étudiants révolutionnent leur façon d'apprendre la médecine
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gradient-to-br from-background to-secondary/20 border-2 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{testimonial.avatar}</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-foreground font-semibold">{testimonial.name}</p>
                      <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-foreground">Score: {testimonial.score}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action final */}
        <div className="container mx-auto px-4 py-20">
          <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 rounded-3xl p-12 text-center border">
            <Brain className="w-16 h-16 text-pink-400 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Prêt à révolutionner votre apprentissage ?
            </h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers d'étudiants qui utilisent déjà MED MNG pour maîtriser les EDN avec l'IA musicale
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-xl px-8 py-4"
                onClick={() => navigate('/med-mng/signup')}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Commencer gratuitement
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 px-8 py-4"
                onClick={() => navigate('/demo')}
              >
                <Play className="w-5 h-5 mr-2" />
                Voir la démo
              </Button>
            </div>
          </div>
        </div>

        {/* Footer simple */}
        <div className="container mx-auto px-4 py-12 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Sparkles className="w-6 h-6 text-pink-400" />
              <span className="text-lg font-bold text-foreground">MED MNG</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/legal/mentions" className="hover:text-foreground transition-colors">Mentions légales</Link>
              <Link to="/legal/privacy" className="hover:text-foreground transition-colors">Confidentialité</Link>
              <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </div>
    </ConsistentBackground>
  );
};

export default Index;