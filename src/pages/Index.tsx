import React from "react";
import { useNavigate } from "react-router-dom";
import { Music, BookOpen, MessageSquare, Users, Sparkles } from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header simplifié */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">MED MNG</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            <TranslatedText text="Plateforme d'apprentissage médical avec IA" />
          </p>
        </div>

        {/* Menu principal - 4 cartes essentielles */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/edn')}>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                <TranslatedText text="Items EDN" />
              </h3>
              <p className="text-muted-foreground mb-4">
                <TranslatedText text="Base complète IC-1 à IC-367" />
              </p>
              <Button className="w-full">
                <TranslatedText text="Explorer" />
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/generator')}>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                <TranslatedText text="Générateur Musical" />
              </h3>
              <p className="text-muted-foreground mb-4">
                <TranslatedText text="Créez de la musique éducative avec l'IA" />
              </p>
              <Button variant="secondary" className="w-full">
                <TranslatedText text="Générer" />
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/ecos')}>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                <TranslatedText text="ECOS" />
              </h3>
              <p className="text-muted-foreground mb-4">
                <TranslatedText text="Simulations cliniques interactives" />
              </p>
              <Button variant="outline" className="w-full">
                <TranslatedText text="Commencer" />
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/chat')}>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-muted/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                <TranslatedText text="Assistant IA" />
              </h3>
              <p className="text-muted-foreground mb-4">
                <TranslatedText text="Chat intelligent médical" />
              </p>
              <Button variant="outline" className="w-full">
                <TranslatedText text="Démarrer" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Button size="lg" onClick={() => navigate('/med-mng/pricing')}>
            <TranslatedText text="Voir les tarifs" />
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/med-mng/login')}>
            <TranslatedText text="Se connecter" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;