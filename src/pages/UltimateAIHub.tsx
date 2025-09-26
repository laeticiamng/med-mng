import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageCircle, Music } from 'lucide-react';

export const UltimateAIHub: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Hub IA Ultime - MED-MNG</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
            🧠 Hub IA Ultime
            <Badge>Dernière Génération</Badge>
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Assistant Médical IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Chat intelligent spécialisé en médecine</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Génération Musicale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Création de contenus musicaux éducatifs</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  QCM Intelligent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Génération automatique de questions</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
};

export default UltimateAIHub;