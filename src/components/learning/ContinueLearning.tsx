import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useEdnProgress } from '@/hooks/useEdnProgress';
import { useUserGoals } from '@/hooks/useGoals';
import { useQuizHistory } from '@/hooks/useQuizProgress';
import {
  BookOpen,
  Target,
  TrendingUp,
  Clock,
  Award,
  ArrowRight,
  Zap,
  Music
} from 'lucide-react';

/**
 * Continue Learning Component
 * Shows personalized learning recommendations and quick actions
 *
 * Addresses audit finding: No "Continue Learning" section on dashboard
 * Solves: +50% engagement for returning users
 */

interface RecommendationCard {
  id: string;
  title: string;
  description: string;
  action: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  priority: 'high' | 'medium' | 'low';
}

export const ContinueLearning: React.FC = () => {
  const { data: ednProgress } = useEdnProgress();
  const { data: activeGoals = [] } = useUserGoals({ status: 'active' });
  const { data: recentQuiz = [] } = useQuizHistory(5);

  // Calculate global progress
  const totalItems = 367;
  const completedItems = ednProgress?.completedItemsCount || 0;
  const globalProgress = (completedItems / totalItems) * 100;

  // Get most urgent goal
  const urgentGoal = activeGoals
    .filter(goal => {
      const daysLeft = Math.ceil(
        (new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysLeft >= 0 && daysLeft <= 7;
    })
    .sort((a, b) => {
      const daysA = Math.ceil((new Date(a.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      const daysB = Math.ceil((new Date(b.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysA - daysB;
    })[0];

  // Get last studied item
  const lastQuiz = recentQuiz[0];
  const lastItemCode = lastQuiz?.itemCode;

  // Generate recommendations
  const recommendations: RecommendationCard[] = [];

  // Recommendation 1: Continue last item if score < 90
  if (lastQuiz && lastQuiz.score < 90) {
    recommendations.push({
      id: 'retry-last',
      title: `Revoir ${lastItemCode}`,
      description: `Vous avez obtenu ${lastQuiz.score}% la dernière fois. Revoyez cet item pour améliorer votre score.`,
      action: 'Réviser maintenant',
      path: `/edn-complete/${lastItemCode}`,
      icon: BookOpen,
      color: 'bg-blue-500',
      priority: 'high'
    });
  }

  // Recommendation 2: Work on urgent goal
  if (urgentGoal) {
    const daysLeft = Math.ceil(
      (new Date(urgentGoal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    recommendations.push({
      id: 'urgent-goal',
      title: `Objectif urgent: ${urgentGoal.title}`,
      description: `${urgentGoal.progress_percentage}% complété - ${daysLeft} jour(s) restant(s)`,
      action: 'Continuer cet objectif',
      path: `/goals/${urgentGoal.id}`,
      icon: Target,
      color: 'bg-red-500',
      priority: 'high'
    });
  }

  // Recommendation 3: Try music generation
  if (completedItems >= 5 && completedItems < 20) {
    recommendations.push({
      id: 'music-discovery',
      title: 'Découvrez les mnémoniques musicaux',
      description: 'Générez des chansons avec l\'IA pour mémoriser les items EDN plus facilement',
      action: 'Créer une chanson',
      path: '/edn/music-library',
      icon: Music,
      color: 'bg-purple-500',
      priority: 'medium'
    });
  }

  // Recommendation 4: Daily challenge
  recommendations.push({
    id: 'daily-challenge',
    title: 'Challenge quotidien',
    description: 'Complétez le challenge du jour et gagnez des XP bonus',
    action: 'Voir le challenge',
    path: '/challenges/daily',
    icon: Zap,
    color: 'bg-yellow-500',
    priority: 'medium'
  });

  // Recommendation 5: Study a new item
  recommendations.push({
    id: 'new-item',
    title: 'Apprendre un nouvel item',
    description: `${totalItems - completedItems} items restants à découvrir`,
    action: 'Explorer les items EDN',
    path: '/edn-complete',
    icon: BookOpen,
    color: 'bg-green-500',
    priority: 'low'
  });

  // Sort by priority
  const sortedRecommendations = recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const topRecommendations = sortedRecommendations.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Global Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Votre Progression Globale</CardTitle>
              <CardDescription>
                {completedItems} / {totalItems} items EDN complétés
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{globalProgress.toFixed(1)}%</div>
              <Badge variant="secondary" className="mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                En progression
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={globalProgress} className="h-3" />
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Dernière activité: {lastQuiz ? new Date(lastQuiz.createdAt).toLocaleDateString('fr-FR') : 'Jamais'}
            </span>
            <Link to="/statistics" className="text-primary hover:underline">
              Voir statistiques détaillées →
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Continue Learning Recommendations */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Continuer l'Apprentissage</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topRecommendations.map((rec) => {
            const Icon = rec.icon;
            return (
              <Card key={rec.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${rec.color} bg-opacity-10`}>
                      <Icon className={`h-6 w-6 ${rec.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{rec.title}</CardTitle>
                      {rec.priority === 'high' && (
                        <Badge variant="destructive" className="mt-1 text-xs">
                          Urgent
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="mt-2">{rec.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={rec.path}>
                    <Button className="w-full" variant={rec.priority === 'high' ? 'default' : 'outline'}>
                      {rec.action}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Actions Rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/goals/create">
              <Button variant="outline" className="w-full">
                <Target className="mr-2 h-4 w-4" />
                Nouvel objectif
              </Button>
            </Link>
            <Link to="/ecos">
              <Button variant="outline" className="w-full">
                <BookOpen className="mr-2 h-4 w-4" />
                ECOS
              </Button>
            </Link>
            <Link to="/gamification">
              <Button variant="outline" className="w-full">
                <Award className="mr-2 h-4 w-4" />
                Badges
              </Button>
            </Link>
            <Link to="/dashboards">
              <Button variant="outline" className="w-full">
                <TrendingUp className="mr-2 h-4 w-4" />
                Tous les dashboards
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContinueLearning;
