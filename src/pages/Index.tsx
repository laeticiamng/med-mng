import React from "react";
import { useNavigate } from "react-router-dom";
import { Music, BookOpen, MessageSquare, Users, Sparkles, LogIn, CreditCard, Star, Zap, Shield, Award } from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Header Premium avec Navigation */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">MED MNG</h1>
                <Badge variant="secondary" className="text-xs">Premium</Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate('/med-mng/pricing')}>
                <CreditCard className="w-4 h-4 mr-2" />
                <TranslatedText text="Tarifs" />
              </Button>
              <Button onClick={() => navigate('/med-mng/login')}>
                <LogIn className="w-4 h-4 mr-2" />
                <TranslatedText text="Connexion" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Section Hero Premium */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-3 rounded-full mb-8 border border-primary/20">
            <Star className="w-5 h-5 text-primary" />
            <span className="text-primary font-semibold">
              <TranslatedText text="Plateforme d'Excellence Médicale" />
            </span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
            MED MNG
          </h2>
          <p className="text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            <TranslatedText text="L'intelligence artificielle au service de l'apprentissage médical de nouvelle génération" />
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm px-4 py-2 rounded-full border">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">IA Avancée</span>
            </div>
            <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm px-4 py-2 rounded-full border">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">367 Items EDN</span>
            </div>
            <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm px-4 py-2 rounded-full border">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Certifié Médical</span>
            </div>
          </div>
        </div>

        {/* Cartes Premium avec Gradients */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-background to-primary/5 border-primary/20 hover:border-primary/40" onClick={() => navigate('/edn')}>
            <CardContent className="p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">
                  <TranslatedText text="Items EDN" />
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  <TranslatedText text="Base complète IC-1 à IC-367 avec 4,872 compétences OIC intégrées" />
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  <Badge variant="secondary">367 Items</Badge>
                  <Badge variant="secondary">4,872 Compétences</Badge>
                  <Badge variant="secondary">Immersif</Badge>
                </div>
                <Button className="w-full" size="lg">
                  <TranslatedText text="Explorer EDN" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-background to-secondary/5 border-secondary/20 hover:border-secondary/40" onClick={() => navigate('/generator')}>
            <CardContent className="p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-secondary to-secondary/60 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Music className="w-10 h-10 text-secondary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">
                  <TranslatedText text="Générateur Musical IA" />
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  <TranslatedText text="Créez des chansons éducatives personnalisées avec l'intelligence artificielle" />
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  <Badge variant="secondary">IA Avancée</Badge>
                  <Badge variant="secondary">Multi-Styles</Badge>
                  <Badge variant="secondary">Instantané</Badge>
                </div>
                <Button variant="secondary" className="w-full" size="lg">
                  <TranslatedText text="Générer Maintenant" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-background to-accent/5 border-accent/20 hover:border-accent/40" onClick={() => navigate('/ecos')}>
            <CardContent className="p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent/60 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-10 h-10 text-accent-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">
                  <TranslatedText text="Simulations ECOS" />
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  <TranslatedText text="Examens Cliniques Objectifs Structurés pour la pratique médicale" />
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  <Badge variant="secondary">3 Scénarios</Badge>
                  <Badge variant="secondary">Évaluation</Badge>
                  <Badge variant="secondary">Feedback</Badge>
                </div>
                <Button variant="outline" className="w-full" size="lg">
                  <TranslatedText text="Commencer ECOS" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-background to-muted/20 border-muted/40 hover:border-foreground/20" onClick={() => navigate('/chat')}>
            <CardContent className="p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-foreground to-muted-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="w-10 h-10 text-background" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">
                  <TranslatedText text="Assistant IA" />
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  <TranslatedText text="Chat intelligent spécialisé en médecine avec base de connaissances" />
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  <Badge variant="secondary">Chat Temps Réel</Badge>
                  <Badge variant="secondary">Base Médicale</Badge>
                  <Badge variant="secondary">IA Experte</Badge>
                </div>
                <Button variant="outline" className="w-full" size="lg">
                  <TranslatedText text="Démarrer Chat" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section CTA Premium */}
        <div className="mt-20 text-center">
          <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/20 max-w-4xl mx-auto">
            <CardContent className="p-12">
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                <TranslatedText text="Prêt à Révolutionner Votre Apprentissage ?" />
              </h3>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                <TranslatedText text="Rejoignez des milliers d'étudiants qui transforment leur façon d'apprendre la médecine" />
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="px-8" onClick={() => navigate('/med-mng/pricing')}>
                  <Star className="w-5 h-5 mr-2" />
                  <TranslatedText text="Découvrir nos Offres" />
                </Button>
                <Button variant="outline" size="lg" className="px-8" onClick={() => navigate('/generator')}>
                  <Music className="w-5 h-5 mr-2" />
                  <TranslatedText text="Essayer Gratuitement" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;