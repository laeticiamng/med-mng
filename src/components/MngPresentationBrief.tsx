
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Music, Brain, Target, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const MngPresentationBrief = () => {
  return (
    <div className="mb-16">
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white mb-8">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Music className="h-8 w-8" />
            <CardTitle className="text-3xl">Méthode MNG</CardTitle>
          </div>
          <CardDescription className="text-purple-100 text-lg">
            Music Neuro Learning Generator - Révolutionnez votre apprentissage
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Objectif */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Target className="h-6 w-6 text-purple-600" />
              <CardTitle className="text-lg">Objectif</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm">
              Faciliter l'apprentissage de savoirs complexes par une immersion cognitive, 
              sonore et visuelle via des contenus éducatifs en chansons personnalisées.
            </p>
          </CardContent>
        </Card>

        {/* Fondements scientifiques */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-lg">Fondements</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-gray-700 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Sciences cognitives de l'apprentissage</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Neuroplasticité favorisée par la musique</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Mémoire à long terme consolidée</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Caractère unique */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Music className="h-6 w-6 text-indigo-600" />
                <CardTitle className="text-lg">Innovation</CardTitle>
              </div>
              <Badge className="bg-indigo-100 text-indigo-800">Breveté</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-gray-700 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Génération automatique à la demande</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Structure musicale optimisée</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Adaptabilité multisectorielle</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bouton pour voir plus */}
      <div className="text-center">
        <Link to="/mng-method">
          <Button size="lg" className="flex items-center gap-2 mx-auto">
            En savoir plus sur la méthode MNG
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
