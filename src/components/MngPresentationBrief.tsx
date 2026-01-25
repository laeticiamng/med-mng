import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Music, Brain, Target, ArrowRight, Flame, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "@/config/routes";
import { useActivityTracking } from "@/hooks/useActivityTracking";
import { useGamification } from "@/hooks/useGamification";
import { supabase } from "@/integrations/supabase/client";

export const MngPresentationBrief = () => {
  const { logActivity } = useActivityTracking();
  const { _stats: gamificationStats, loadStats } = useGamification();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) loadStats(user.id);
    };
    load();
  }, [loadStats]);

  useEffect(() => {
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { component: 'mng_presentation_brief', action: 'view' }
    });
  }, [logActivity]);

  return (
    <div className="mb-16">
      <Card className="bg-gradient-medical text-primary-foreground mb-8">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Music className="h-8 w-8" />
            <CardTitle className="text-3xl">Méthode MNG</CardTitle>
          </div>
          <CardDescription className="text-primary-foreground/80 text-lg">
            Music Neuro Learning Generator - Révolutionnez votre apprentissage
          </CardDescription>
          {gamificationStats && (
            <div className="flex items-center justify-center gap-3 mt-3">
              <Badge variant="secondary" className="gap-1 bg-primary-foreground/20">
                <Flame className="h-3 w-3 text-warning" />
                {gamificationStats.currentStreak}
              </Badge>
              <Badge variant="secondary" className="gap-1 bg-primary-foreground/20">
                <Star className="h-3 w-3 text-accent" />
                Nv.{gamificationStats.level}
              </Badge>
            </div>
          )}
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Objectif */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Target className="h-6 w-6 text-accent" />
              <CardTitle className="text-lg">Objectif</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground text-sm">
              Faciliter l'apprentissage de savoirs complexes par une immersion cognitive, 
              sonore et visuelle via des contenus éducatifs en chansons personnalisées.
            </p>
          </CardContent>
        </Card>

        {/* Fondements scientifiques */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-primary" />
              <CardTitle className="text-lg">Fondements</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-foreground text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span>Sciences cognitives de l'apprentissage</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span>Neuroplasticité favorisée par la musique</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
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
                <Music className="h-6 w-6 text-accent" />
                <CardTitle className="text-lg">Innovation</CardTitle>
              </div>
              <Badge className="bg-accent/20 text-accent-foreground">Breveté</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-foreground text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <span>Génération automatique à la demande</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <span>Structure musicale optimisée</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <span>Adaptabilité multisectorielle</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bouton pour voir plus */}
      <div className="text-center">
        <Link to={ROUTE_PATHS.mngMethod}>
          <Button size="lg" className="flex items-center gap-2 mx-auto">
            En savoir plus sur la méthode MNG
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
