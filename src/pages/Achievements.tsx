import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GamificationPanel } from '@/components/gamification/GamificationPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Star, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';

const Achievements: React.FC = () => {
  const navigate = useNavigate();

  return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Helmet>
        <title>Succès et Gamification - MED MNG</title>
        <meta name="description" content="Suivez votre progression, débloquez des succès et relevez des défis dans votre apprentissage médical." />
        <meta name="keywords" content="succès, badges, gamification, progression, apprentissage médical" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Trophy className="w-8 h-8 text-warning" />
                Succès & Progression
              </h1>
              <p className="text-muted-foreground mt-1">
                Suivez votre progression et débloquez des récompenses exclusives
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-warning/10 to-warning/5 border-warning/30">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 text-warning mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-foreground">12</h3>
              <p className="text-muted-foreground">Badges Obtenus</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
            <CardContent className="p-6 text-center">
              <Star className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-foreground">2,450</h3>
              <p className="text-muted-foreground">Points XP</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success/30">
            <CardContent className="p-6 text-center">
              <Target className="w-12 h-12 text-success mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-foreground">8</h3>
              <p className="text-muted-foreground">Défis Complétés</p>
            </CardContent>
          </Card>
        </div>

        {/* Panel de gamification principal */}
        <GamificationPanel />

        {/* Section motivation */}
        <Card className="mt-8 bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30">
          <CardHeader>
            <CardTitle className="text-center">🎯 Continuez sur votre lancée !</CardTitle>
            <CardDescription className="text-center">
              Vous êtes sur la bonne voie pour devenir un expert médical. 
              Continuez à étudier et à relever des défis pour débloquer encore plus de récompenses !
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center gap-4">
              <Button onClick={() => navigate(ROUTE_PATHS.ednComplete)}>
                Continuer l'étude
              </Button>
              <Button variant="outline" onClick={() => navigate(ROUTE_PATHS.generator)}>
                Générer une musique
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Achievements;