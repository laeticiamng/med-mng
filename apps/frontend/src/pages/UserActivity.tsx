import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  Trophy, Award, BookOpen, Target, Clock, TrendingUp,
  ArrowLeft, UserPlus, MessageCircle, Calendar, Flame
} from 'lucide-react';

export default function UserActivity() {
  const { userId } = useParams<{ userId: string }>();

  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('profiles_public')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: activityData, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['user-activity', userId],
    queryFn: async () => {
      if (!userId) return null;

      const [
        { data: achievements },
        { data: challenges },
        { data: sessions },
      ] = await Promise.all([
        supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', userId)
          .order('unlocked_at', { ascending: false })
          .limit(10),
        supabase
          .from('challenge_participation')
          .select('*, daily_challenges(*)')
          .eq('user_id', userId)
          .eq('completed', true)
          .order('completed_at', { ascending: false })
          .limit(10),
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      return {
        achievements: achievements || [],
        challenges: challenges || [],
        sessions: sessions || [],
      };
    },
    enabled: !!userId,
  });

  const recentActivities = [
    {
      type: 'achievement',
      icon: Trophy,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      title: 'A débloqué le badge "100 jours de suite"',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      type: 'challenge',
      icon: Target,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      title: 'A complété le challenge "Focus Intense"',
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
      type: 'badge',
      icon: Award,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-100',
      title: 'Badge "Méditateur Zen" obtenu',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'challenge',
      icon: Target,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      title: 'Challenge quotidien complété',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  ];

  const stats = [
    {
      label: 'Activités Publiques',
      value: activityData ?
        activityData.achievements.length +
        activityData.challenges.length +
        activityData.sessions.length
        : 0,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Badges',
      value: activityData?.achievements.length || 0,
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Challenges',
      value: activityData?.challenges.length || 0,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Sessions',
      value: activityData?.sessions.length || 0,
      icon: Clock,
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

  if (isLoadingUser || isLoadingActivity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'activité utilisateur...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Utilisateur non trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              Cet utilisateur n'existe pas ou son profil est privé
            </p>
            <Link to={ROUTE_PATHS.activity}>
              <Button>Retour au Fil d'Activité</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{userData.display_name || userData.username} - Activité | Med-Mng</title>
        <meta name="description" content={`Consultez l'activité de ${userData.display_name || userData.username} sur Med-Mng`} />
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

            {/* User Info */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={userData.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl">
                      {userData.display_name?.charAt(0) || userData.username?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                      {userData.display_name || userData.username}
                    </h1>
                    <p className="text-gray-600 mb-3">@{userData.username}</p>
                    {userData.bio && (
                      <p className="text-gray-700 mb-3">{userData.bio}</p>
                    )}
                    <div className="flex gap-3">
                      <Button>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Suivre
                      </Button>
                      <Button variant="outline">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Link to={ROUTE_PATHS.userProfile.replace(':userId', userId!)}>
                        <Button variant="outline">
                          Voir le Profil
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                    Activités publiques des derniers jours
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
              {/* Streak */}
              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-900">
                    <Flame className="w-5 h-5 text-orange-600" />
                    Série Actuelle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-orange-600 mb-2">32</div>
                    <div className="text-orange-900 font-medium">jours consécutifs</div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Badges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Badges Récents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((badge) => (
                      <div
                        key={badge}
                        className="aspect-square rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center"
                      >
                        <Trophy className="w-8 h-8 text-yellow-600" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Cette Semaine</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Challenges</span>
                    <Badge>8 complétés</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Sessions</span>
                    <Badge>12h 15min</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">XP Gagnés</span>
                    <Badge>+450 XP</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
