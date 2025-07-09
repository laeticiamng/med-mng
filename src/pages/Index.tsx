import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MusicGenerationSection } from "@/components/MusicGenerationSection";
import { Link } from "react-router-dom";
import { Music, Brain, Stethoscope, BookOpen } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            E-LiSA Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plateforme d'apprentissage médical avec intelligence artificielle
          </p>
        </header>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link to="/generator">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Music className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Générateur</CardTitle>
                <CardDescription>Créez du contenu médical</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/edn">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>EDN</CardTitle>
                <CardDescription>Items de connaissance</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/ecos">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Stethoscope className="h-8 w-8 text-red-600 mb-2" />
                <CardTitle>ECOS</CardTitle>
                <CardDescription>Situations cliniques</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/med-mng/pricing">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Brain className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Med MNG</CardTitle>
                <CardDescription>Gestion médicale IA</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Music Generation Section */}
        <MusicGenerationSection />

        {/* Footer */}
        <footer className="text-center mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-center space-x-6">
            <Link to="/mentions-legales" className="text-gray-600 hover:text-gray-900">
              Mentions légales
            </Link>
            <Link to="/politique-confidentialite" className="text-gray-600 hover:text-gray-900">
              Politique de confidentialité
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;