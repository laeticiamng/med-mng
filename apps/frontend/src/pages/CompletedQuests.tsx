/**
 * Completed Quests Page
 * Displays user's completed quests with statistics and rewards
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, CheckCircle, Star, Award, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data - replace with actual data from database
const completedQuests = [
  {
    id: '1',
    title: 'Premier Quiz Réussi',
    description: 'Complétez votre premier quiz avec un score de 80% ou plus',
    completedAt: '2025-11-10T14:30:00Z',
    xpReward: 100,
    badgeReward: 'Quiz Master Bronze',
    category: 'learning',
  },
  {
    id: '2',
    title: 'Série de 7 Jours',
    description: 'Étudiez pendant 7 jours consécutifs',
    completedAt: '2025-11-08T09:15:00Z',
    xpReward: 250,
    badgeReward: 'Streak Champion',
    category: 'consistency',
  },
  {
    id: '3',
    title: 'Maître ECOS',
    description: 'Complétez 10 scénarios ECOS avec un score moyen de 85%',
    completedAt: '2025-11-05T16:45:00Z',
    xpReward: 500,
    badgeReward: 'ECOS Expert',
    category: 'mastery',
  },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'learning':
      return <Star className="h-5 w-5" />;
    case 'consistency':
      return <Calendar className="h-5 w-5" />;
    case 'mastery':
      return <Award className="h-5 w-5" />;
    default:
      return <Trophy className="h-5 w-5" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'learning':
      return 'bg-blue-500';
    case 'consistency':
      return 'bg-green-500';
    case 'mastery':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};

export const CompletedQuests: React.FC = () => {
  const totalXP = completedQuests.reduce((sum, quest) => sum + quest.xpReward, 0);
  const totalBadges = completedQuests.length;

  return (
    <div className="container max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Quêtes Complétées
        </h1>
        <p className="text-muted-foreground">
          Toutes vos quêtes réussies et récompenses gagnées
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Quêtes Complétées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-3xl font-bold">{completedQuests.length}</div>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">XP Gagné</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <div className="text-3xl font-bold">{totalXP}</div>
                <p className="text-xs text-muted-foreground">Points d'expérience</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Badges Obtenus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-3xl font-bold">{totalBadges}</div>
                <p className="text-xs text-muted-foreground">Récompenses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completed Quests List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Historique des Quêtes</h2>

        {completedQuests.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Aucune quête complétée</h3>
              <p className="text-muted-foreground">
                Commencez à compléter des quêtes pour voir vos succès ici
              </p>
            </CardContent>
          </Card>
        ) : (
          completedQuests.map((quest) => (
            <Card key={quest.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`p-3 rounded-lg ${getCategoryColor(quest.category)} text-white`}
                    >
                      {getCategoryIcon(quest.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-xl">{quest.title}</CardTitle>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complétée
                        </Badge>
                      </div>
                      <CardDescription>{quest.description}</CardDescription>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Complétée le{' '}
                        {new Date(quest.completedAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-lg">
                    <Star className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold text-yellow-700">+{quest.xpReward} XP</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg">
                    <Award className="h-4 w-4 text-purple-600" />
                    <span className="font-semibold text-purple-700">{quest.badgeReward}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CompletedQuests;
