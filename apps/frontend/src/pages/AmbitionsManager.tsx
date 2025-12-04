import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Target, ArrowLeft, Plus, TrendingUp, Clock, CheckCircle2, Loader } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useActiveGoals, useGoalStats } from '@/hooks/useGoals';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * AmbitionsManager - Gestionnaire d'objectifs personnels
 * Utilise le système de goals pour afficher et gérer les ambitions de l'utilisateur
 */
export default function AmbitionsManager() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: activeGoals = [], isLoading: goalsLoading } = useActiveGoals();
  const { data: stats, isLoading: statsLoading } = useGoalStats();

  // Protection: rediriger si pas connecté
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Connectez-vous pour gérer vos ambitions
            </p>
            <Button onClick={() => navigate('/med-mng/login')}>
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'destructive',
      medium: 'secondary',
      low: 'outline',
    } as const;
    return colors[priority as keyof typeof colors] || 'outline';
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      high: 'Haute priorité',
      medium: 'Priorité moyenne',
      low: 'Priorité basse',
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      edn: 'EDN',
      quiz: 'Quiz',
      study_time: 'Temps d\'étude',
      streak: 'Série',
      badge: 'Badges',
      custom: 'Personnalisé',
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getDaysRemaining = (targetDate: string) => {
    const days = Math.ceil((new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <>
      <Helmet>
        <title>Mes Ambitions | Med-Mng</title>
        <meta name="description" content="Gérez vos objectifs d'apprentissage et suivez votre progression" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Navigation */}
        <Link to={ROUTE_PATHS.quests}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux quêtes
          </Button>
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Mes Ambitions</h1>
              <p className="text-sm text-muted-foreground">
                Définissez et suivez vos objectifs d'apprentissage
              </p>
            </div>
          </div>
          <Button onClick={() => navigate(ROUTE_PATHS.goalsCreate)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Ambition
          </Button>
        </div>

        {/* Stats cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Loader className="h-8 w-8 animate-spin mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.activeGoals}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">En cours</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {stats.completedGoals}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Complétés</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {stats.completionRate.toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Taux de réussite</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {stats.totalXpEarned}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">XP gagnés</div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Goals list */}
        <Card>
          <CardHeader>
            <CardTitle>Ambitions en Cours ({activeGoals.length})</CardTitle>
            <CardDescription>
              Vos objectifs actifs et leur progression
            </CardDescription>
          </CardHeader>
          <CardContent>
            {goalsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-muted-foreground">
                  Chargement de vos ambitions...
                </span>
              </div>
            ) : activeGoals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune ambition active
                </h3>
                <p className="text-muted-foreground mb-4">
                  Commencez par créer votre premier objectif d'apprentissage
                </p>
                <Button onClick={() => navigate(ROUTE_PATHS.goalsCreate)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer ma première ambition
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeGoals.map((goal) => {
                  const daysRemaining = getDaysRemaining(goal.target_date);
                  const isUrgent = daysRemaining <= 7 && daysRemaining > 0;
                  const isOverdue = daysRemaining < 0;

                  return (
                    <Card
                      key={goal.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/goals/${goal.id}`)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <Target className="w-8 h-8 text-blue-600" />
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Title and badges */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="font-semibold text-lg">{goal.title}</h3>
                              <Badge variant={getPriorityColor(goal.priority)}>
                                {getPriorityLabel(goal.priority)}
                              </Badge>
                              <Badge variant="outline">
                                {getCategoryLabel(goal.category)}
                              </Badge>
                            </div>

                            {/* Description */}
                            {goal.description && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {goal.description}
                              </p>
                            )}

                            {/* Progress bar */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">
                                  Progression: {goal.current_value} / {goal.target_value} {goal.unit}
                                </span>
                                <span className="text-sm font-bold text-blue-600">
                                  {goal.progress_percentage}%
                                </span>
                              </div>
                              <Progress value={goal.progress_percentage} className="h-2" />
                            </div>

                            {/* Metadata */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {isOverdue ? (
                                  <span className="text-red-600 font-medium">
                                    En retard de {Math.abs(daysRemaining)} jour{Math.abs(daysRemaining) > 1 ? 's' : ''}
                                  </span>
                                ) : isUrgent ? (
                                  <span className="text-orange-600 font-medium">
                                    {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant{daysRemaining > 1 ? 's' : ''}
                                  </span>
                                ) : (
                                  <span>
                                    Échéance: {formatDistanceToNow(new Date(goal.target_date), {
                                      addSuffix: true,
                                      locale: fr,
                                    })}
                                  </span>
                                )}
                              </div>

                              {goal.progress_percentage === 100 && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span className="font-medium">Objectif atteint !</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Helpful tip */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">
                  💡 Conseil pour réussir
                </h4>
                <p className="text-sm text-blue-700">
                  Définissez des objectifs SMART (Spécifiques, Mesurables, Atteignables, Réalistes, Temporels).
                  Décomposez vos grandes ambitions en étapes intermédiaires pour rester motivé.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
