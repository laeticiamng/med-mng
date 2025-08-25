import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Music, Brain, FileText, GraduationCap, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";

export const GeneratorPage = () => {
  const ednModules = [
    {
      title: "Items EDN",
      description: "Explorez les 367 items de connaissances médicaux avec tableaux Rang A/B",
      icon: BookOpen,
      link: "/edn",
      color: "bg-blue-500",
      stats: "367 items disponibles"
    },
    {
      title: "ECOS",
      description: "Situations d'Examen Clinique Objectif Structuré pour la pratique",
      icon: Stethoscope,
      link: "/ecos",
      color: "bg-green-500",
      stats: "150+ situations"
    },
    {
      title: "Génération Musicale",
      description: "Créez des contenus musicaux pédagogiques pour l'apprentissage",
      icon: Music,
      link: "/dashboard",
      color: "bg-purple-500",
      stats: "IA Suno intégrée"
    },
    {
      title: "Chat Médical",
      description: "Assistant IA spécialisé dans les connaissances médicales EDN",
      icon: Brain,
      link: "/chat",
      color: "bg-orange-500",
      stats: "Contexte EDN"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-blue-50 to-indigo-50 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-medical-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Plateforme EDN LiSA
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Plateforme d'apprentissage médical pour les Epreuves Dossiers Numériques
          </p>
          <Badge variant="secondary" className="text-sm">
            <GraduationCap className="h-4 w-4 mr-1" />
            Conforme au référentiel LiSA 2025
          </Badge>
        </div>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {ednModules.map((module, index) => (
            <Link key={index} to={module.link}>
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer h-full">
                <CardHeader className="text-center pb-3">
                  <div className={`h-16 w-16 ${module.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <module.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-gray-900 text-lg">{module.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-center text-gray-600 mb-3">
                    {module.description}
                  </CardDescription>
                  <Badge variant="outline" className="w-full justify-center text-xs">
                    {module.stats}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Progression EDN 2025
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-medical-600 mb-1">367</div>
              <div className="text-sm text-gray-600">Items EDN</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">2</div>
              <div className="text-sm text-gray-600">Rangs (A/B)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">7</div>
              <div className="text-sm text-gray-600">Compétences OIC</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">∞</div>
              <div className="text-sm text-gray-600">Contenus générés</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};