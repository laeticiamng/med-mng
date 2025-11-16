import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Trophy, ArrowLeft, Star, Users, CheckCircle2, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function ChallengeDetail() {
  const { challengeId } = useParams<{ challengeId: string }>();

  const { data: challenge, isLoading } = useQuery({
    queryKey: ['challenge', challengeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!challengeId
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Challenge introuvable</p>
            <Link to={ROUTE_PATHS.challenges}>
              <Button variant="outline" className="mt-4">
                Retour aux challenges
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = Math.floor(Math.random() * 100);
  const participants = Math.floor(Math.random() * 500) + 50;

  return (
    <>
      <Helmet>
        <title>{challenge.title} | Challenges | Med-Mng</title>
        <meta name="description" content={challenge.description} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link to={ROUTE_PATHS.challenges}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux challenges
            </Button>
          </Link>
        </div>

        {/* Challenge Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-2">
                <Badge variant={challenge.difficulty === 'hard' ? 'destructive' : 'default'}>
                  {challenge.difficulty || 'medium'}
                </Badge>
                <Badge variant="outline">
                  {challenge.category || 'General'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-yellow-600">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-bold">{challenge.points || 100} points</span>
              </div>
            </div>
            <CardTitle className="text-3xl">{challenge.title}</CardTitle>
            <CardDescription className="text-base mt-2">
              {challenge.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Participants</div>
                  <div className="font-semibold">{participants}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Taux de Réussite</div>
                  <div className="font-semibold">{Math.floor(Math.random() * 40) + 50}%</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Votre progression</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            <Button className="w-full mt-6" size="lg">
              {progress === 100 ? 'Challenge Complété!' : 'Continuer le Challenge'}
            </Button>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Objectifs</CardTitle>
            <CardDescription>Complétez tous les objectifs pour réussir le challenge</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { text: 'Compléter 5 sessions d\'étude', done: true },
                { text: 'Répondre à 20 questions correctement', done: true },
                { text: 'Atteindre un score de 80%', done: false },
                { text: 'Inviter 2 amis à participer', done: false },
              ].map((objective, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                  <CheckCircle2 className={`w-5 h-5 ${objective.done ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <span className={objective.done ? 'line-through text-muted-foreground' : ''}>
                    {objective.text}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rewards */}
        <Card>
          <CardHeader>
            <CardTitle>Récompenses</CardTitle>
            <CardDescription>Ce que vous gagnerez en complétant ce challenge</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                <Star className="w-8 h-8 text-yellow-500 mb-2" />
                <div className="font-semibold">{challenge.points || 100} Points</div>
                <div className="text-sm text-muted-foreground">XP</div>
              </div>
              <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                <Trophy className="w-8 h-8 text-orange-500 mb-2" />
                <div className="font-semibold">Badge Spécial</div>
                <div className="text-sm text-muted-foreground">Réalisation</div>
              </div>
              <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                <Target className="w-8 h-8 text-blue-500 mb-2" />
                <div className="font-semibold">Déblocage</div>
                <div className="text-sm text-muted-foreground">Nouveau contenu</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
