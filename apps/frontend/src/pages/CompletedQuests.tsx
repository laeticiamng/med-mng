/**
 * Completed Quests Page
 * Displays user's completed quests with statistics and rewards
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, CheckCircle, Star, Award, Calendar, ArrowLeft, Zap, Heart, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

type WellnessQuest = {
  id: string;
  title: string;
  description: string;
  category: string;
  quest_type: string;
  target_value: number;
  energy_reward: number;
  harmony_points_reward: number;
  special_reward: unknown;
  start_date: string;
  end_date: string | null;
  active: boolean;
  created_at: string;
};

type UserQuestProgress = {
  id: string;
  user_id: string;
  quest_id: string;
  current_progress: number;
  completed: boolean;
  completed_at: string | null;
  claimed: boolean;
  claimed_at: string | null;
  created_at: string;
  wellness_quests: WellnessQuest;
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'learning':
      return <Star className="h-5 w-5" />;
    case 'consistency':
    case 'streak':
      return <Calendar className="h-5 w-5" />;
    case 'mastery':
    case 'achievement':
      return <Award className="h-5 w-5" />;
    case 'wellness':
    case 'health':
      return <Heart className="h-5 w-5" />;
    case 'energy':
      return <Zap className="h-5 w-5" />;
    default:
      return <Trophy className="h-5 w-5" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'learning':
      return 'bg-blue-500';
    case 'consistency':
    case 'streak':
      return 'bg-green-500';
    case 'mastery':
    case 'achievement':
      return 'bg-purple-500';
    case 'wellness':
    case 'health':
      return 'bg-red-500';
    case 'energy':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'learning':
      return 'Apprentissage';
    case 'consistency':
    case 'streak':
      return 'Regularite';
    case 'mastery':
    case 'achievement':
      return 'Maitrise';
    case 'wellness':
    case 'health':
      return 'Bien-etre';
    case 'energy':
      return 'Energie';
    default:
      return category;
  }
};

export const CompletedQuests: React.FC = () => {
  const { user } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Fetch completed quests with quest details
  const { data: completedQuests, isLoading } = useQuery({
    queryKey: ['completed-quests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_quest_progress')
        .select(`
          *,
          wellness_quests (*)
        `)
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return (data || []) as UserQuestProgress[];
    },
    enabled: !!user?.id
  });

  // Get unique categories for filter
  const categories = Array.from(
    new Set(completedQuests?.map(q => q.wellness_quests?.category).filter(Boolean) || [])
  );

  // Filter quests by category
  const filteredQuests = categoryFilter === 'all'
    ? completedQuests
    : completedQuests?.filter(q => q.wellness_quests?.category === categoryFilter);

  // Calculate statistics
  const totalXP = completedQuests?.reduce((sum, quest) =>
    sum + (quest.wellness_quests?.harmony_points_reward || 0), 0) || 0;
  const totalEnergy = completedQuests?.reduce((sum, quest) =>
    sum + (quest.wellness_quests?.energy_reward || 0), 0) || 0;
  const totalQuests = completedQuests?.length || 0;

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Quetes Completees | Med-Mng</title>
        <meta name="description" content="Consultez vos quetes completees et recompenses gagnees" />
      </Helmet>

      <div className="container max-w-6xl mx-auto p-6">
        {/* Header */}
        <Link to={ROUTE_PATHS.gamification || '/gamification'}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Quetes Completees
          </h1>
          <p className="text-muted-foreground">
            Toutes vos quetes reussies et recompenses gagnees
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quetes Completees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-3xl font-bold">{totalQuests}</div>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Points d'Harmonie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-yellow-500" />
                <div>
                  <div className="text-3xl font-bold">{totalXP}</div>
                  <p className="text-xs text-muted-foreground">Points gagnes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Energie Gagnee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-orange-500" />
                <div>
                  <div className="text-3xl font-bold">{totalEnergy}</div>
                  <p className="text-xs text-muted-foreground">Points d'energie</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        {categories.length > 0 && (
          <div className="flex items-center gap-4 mb-6">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par categorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Completed Quests List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Historique des Quetes</h2>

          {!filteredQuests || filteredQuests.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Aucune quete completee</h3>
                <p className="text-muted-foreground mb-4">
                  Commencez a completer des quetes pour voir vos succes ici
                </p>
                <Link to={ROUTE_PATHS.gamification || '/gamification'}>
                  <Button>Voir les quetes disponibles</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredQuests.map((progress) => {
              const quest = progress.wellness_quests;
              if (!quest) return null;

              return (
                <Card key={progress.id} className="hover:shadow-lg transition-shadow">
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
                              Completee
                            </Badge>
                          </div>
                          <CardDescription>{quest.description}</CardDescription>
                          <div className="mt-2 text-sm text-muted-foreground">
                            Completee le{' '}
                            {progress.completed_at ? new Date(progress.completed_at).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex gap-4 flex-wrap">
                      {quest.harmony_points_reward > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-lg">
                          <Star className="h-4 w-4 text-yellow-600" />
                          <span className="font-semibold text-yellow-700">
                            +{quest.harmony_points_reward} Points
                          </span>
                        </div>
                      )}
                      {quest.energy_reward > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg">
                          <Zap className="h-4 w-4 text-orange-600" />
                          <span className="font-semibold text-orange-700">
                            +{quest.energy_reward} Energie
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg">
                        <Award className="h-4 w-4 text-purple-600" />
                        <span className="font-semibold text-purple-700 capitalize">
                          {getCategoryLabel(quest.category)}
                        </span>
                      </div>
                      {progress.claimed && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          Recompense reclamee
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default CompletedQuests;
