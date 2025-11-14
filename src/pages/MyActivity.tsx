import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  Trophy, Award, BookOpen, Target, Clock, TrendingUp,
  Calendar, Flame, Star, ArrowLeft
} from 'lucide-react';

export default function MyActivity() {
  const { user } = useAuth();

  const { data: activityData, isLoading } = useQuery({
    queryKey: ['my-activity', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Fetch user activity data from multiple tables
      const [
        { data: achievements },
        { data: challenges },
        { data: sessions },
        { data: journalEntries },
      ] = await Promise.all([
        supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id)
          .order('unlocked_at', { ascending: false })
          .limit(10),
        supabase
          .from('challenge_participation')
          .select('*, daily_challenges(*)')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(10),
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      return {
        achievements: achievements || [],
        challenges: challenges || [],
        sessions: sessions || [],
        journalEntries: journalEntries || [],
      };
    },
    enabled: !!user?.id,
  });

  const recentActivities = [
    {
      type: 'achievement',
      icon: Trophy,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      title: 'Badge débloqué: "100 jours de suite"',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      type: 'challenge',
      icon: Target,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      title: 'Challenge "Focus Intense" complété',
      date: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      type: 'session',
      icon: Clock,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      title: 'Session d\'étude de 2h terminée',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'journal',
      icon: BookOpen,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      title: 'Nouvelle entrée de journal publiée',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'badge',
      icon: Award,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-100',
      title: 'Badge "Méditateur Zen" obtenu',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ];

  const stats = [
    {
      label: 'Total d\'Activités',
      value: activityData ?
        activityData.achievements.length +
        activityData.challenges.length +
        activityData.sessions.length +
        activityData.journalEntries.length
        : 0,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Badges Débloqués',
      value: activityData?.achievements.length || 0,
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Challenges Complétés',
      value: activityData?.challenges.length || 0,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Entrées Journal',
      value: activityData?.journalEntries.length || 0,
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Il y a ${diffInDays}j`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre activité...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Mon Activité | Med-Mng</title>
        <meta name="description" content="Consultez votre historique d'activité sur Med-Mng" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Link to={ROUTE_PATHS.activity}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au Fil d'Activité
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Mon Activité
            </h1>
            <p className="text-lg text-gray-600">
              Consultez votre historique et vos réalisations
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.bgColor} ${stat.color} mb-2`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardDescription>{stat.label}</CardDescription>
                    <CardTitle className="text-3xl">{stat.value}</CardTitle>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Timeline */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Activité Récente
                  </CardTitle>
                  <CardDescription>
                    Votre historique des 7 derniers jours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => {
                      const Icon = activity.icon;
                      return (
                        <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full ${activity.iconBg} flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${activity.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-500">{formatDate(activity.date)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Current Streak */}
              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-900">
                    <Flame className="w-5 h-5 text-orange-600" />
                    Série Actuelle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-orange-600 mb-2">45</div>
                    <div className="text-orange-900 font-medium">jours consécutifs</div>
                  </div>
                </CardContent>
              </Card>

              {/* This Week */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Cette Semaine
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Challenges</span>
                    <Badge>12 complétés</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Sessions</span>
                    <Badge>8h 30min</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Journal</span>
                    <Badge>5 entrées</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions Rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to={ROUTE_PATHS.challenges}>
                    <Button variant="outline" className="w-full justify-start">
                      Voir les Challenges
                    </Button>
                  </Link>
                  <Link to={ROUTE_PATHS.journal}>
                    <Button variant="outline" className="w-full justify-start">
                      Écrire dans le Journal
                    </Button>
                  </Link>
                  <Link to={ROUTE_PATHS.sessions}>
                    <Button variant="outline" className="w-full justify-start">
                      Démarrer une Session
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
