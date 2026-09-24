import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Brain, Target, Zap, Lightbulb, Shield, Headphones, Flame, Star } from "lucide-react";
import { useActivityTracking } from "@/hooks/useActivityTracking";
import { useGamification } from "@/hooks/useGamification";
import { supabase } from "@/integrations/supabase/client";

export const MngPresentation = () => {
  const { logActivity } = useActivityTracking();
  const { stats: gamificationStats, loadStats } = useGamification();

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
      metadata: { component: 'mng_presentation', action: 'view' }
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
            Music Neuro Learning Generator : réviser avec des chansons
          </CardDescription>
          <p className="text-sm text-primary-foreground/70 mt-2">
            Méthode pédagogique conçue par Laëticia Motongane
          </p>
          {gamificationStats && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <Badge variant="secondary" className="gap-1 bg-primary-foreground/20">
                <Flame className="h-3 w-3 text-warning" />
                {gamificationStats.currentStreak} jours
              </Badge>
              <Badge variant="secondary" className="gap-1 bg-primary-foreground/20">
                <Star className="h-3 w-3 text-accent" />
                Niveau {gamificationStats.level}
              </Badge>
            </div>
          )}
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Objectif */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Target className="h-6 w-6 text-accent" />
              <CardTitle className="text-xl">Objectif de la méthode</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">
              Aider à mémoriser les 367 items EDN en transformant leurs compétences rang A et rang B
              en paroles de chanson, à réécouter en complément des fiches, des quiz et de vos cours.
            </p>
          </CardContent>
        </Card>

        {/* Fondements scientifiques */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">Pistes issues de la recherche</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-foreground">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">Double codage : associer texte et son peut faciliter le rappel</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">Une mélodie répétée peut aider à retenir un texte (effet modeste)</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">Répétition espacée et rappel actif (quiz) pour consolider</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Principe de fonctionnement */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-warning" />
            <CardTitle className="text-xl">Principe de fonctionnement</CardTitle>
          </div>
          <CardDescription>
            Pour chaque item EDN, MED MNG propose :
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-warning/10 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Headphones className="h-5 w-5 text-warning" />
                <h4 className="font-semibold text-warning-foreground">1. Paroles générées par IA</h4>
              </div>
              <p className="text-sm text-foreground">Paroles écrites à partir des compétences du référentiel (source publique UNESS/LiSA), par rang A, rang B ou A+B</p>
            </div>
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Music className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-primary-foreground">2. Sélection musicale</h4>
              </div>
              <p className="text-sm text-foreground">Vous choisissez le style musical au moment de générer l'audio (crédits)</p>
            </div>
            <div className="bg-success/10 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="h-5 w-5 text-success" />
                <h4 className="font-semibold text-success-foreground">3. Récit et planches</h4>
              </div>
              <p className="text-sm text-foreground">Récit et planches BD illustrées par IA (en cours de génération)</p>
            </div>
            <div className="bg-accent/10 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-5 w-5 text-accent" />
                <h4 className="font-semibold text-accent-foreground">4. Entraînement ciblé</h4>
              </div>
              <p className="text-sm text-foreground">Quiz par item pour vérifier vos connaissances</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Caractère unique */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-success" />
            <CardTitle className="text-xl">Principes de la méthode MNG</CardTitle>
          </div>
          <CardDescription>
            Contrairement à une simple chanson éducative ou un podcast musical :
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="bg-success/10 p-4 rounded-lg border-l-4 border-success">
              <p className="text-sm text-foreground">
                <strong>Génération à la demande</strong> à partir des compétences rang A / rang B de chaque item
                (référentiel public UNESS/LiSA). Les contenus générés par IA peuvent contenir des erreurs : vérifiez-les.
              </p>
            </div>
            <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
              <p className="text-sm text-foreground">
                <strong>Refrain centré sur les points clés</strong> de l'item, pour les entendre plusieurs fois
              </p>
            </div>
            <div className="bg-accent/10 p-4 rounded-lg border-l-4 border-accent">
              <p className="text-sm text-foreground">
                <strong>Plan didactique codifié :</strong> introduction → développement → ancrage → répétition ciblée → conclusion
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
