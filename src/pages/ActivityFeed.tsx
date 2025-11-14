import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Trophy, Award, BookOpen, Target, Heart, MessageCircle,
  Share2, Clock, TrendingUp, Users, Sparkles
} from 'lucide-react';
import { useState } from 'react';

export default function ActivityFeed() {
  const [filter, setFilter] = useState<'all' | 'following' | 'popular'>('all');

  const activities = [
    {
      id: 1,
      user: {
        name: 'Sophie Martin',
        username: '@sophie_m',
        avatar: null,
      },
      type: 'achievement',
      icon: Trophy,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      content: 'a débloqué le badge "100 jours de suite"',
      timestamp: '5 min',
      likes: 24,
      comments: 3,
      isFollowing: true,
    },
    {
      id: 2,
      user: {
        name: 'Marc Dubois',
        username: '@marc_d',
        avatar: null,
      },
      type: 'challenge',
      icon: Target,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      content: 'a complété le challenge "Focus Intense" avec un score parfait',
      timestamp: '12 min',
      likes: 18,
      comments: 5,
      isFollowing: true,
    },
    {
      id: 3,
      user: {
        name: 'Emma Laurent',
        username: '@emma_l',
        avatar: null,
      },
      type: 'streak',
      icon: Sparkles,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      content: 'maintient une série de 45 jours de méditation',
      timestamp: '24 min',
      likes: 32,
      comments: 7,
      isFollowing: false,
    },
    {
      id: 4,
      user: {
        name: 'Thomas Bernard',
        username: '@thomas_b',
        avatar: null,
      },
      type: 'journal',
      icon: BookOpen,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      content: 'a publié une nouvelle entrée de journal "Réflexions du matin"',
      timestamp: '1h',
      likes: 15,
      comments: 2,
      isFollowing: true,
    },
    {
      id: 5,
      user: {
        name: 'Julie Petit',
        username: '@julie_p',
        avatar: null,
      },
      type: 'leaderboard',
      icon: TrendingUp,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      content: 'est montée au Top 5 du leaderboard hebdomadaire',
      timestamp: '2h',
      likes: 42,
      comments: 8,
      isFollowing: true,
    },
    {
      id: 6,
      user: {
        name: 'Pierre Moreau',
        username: '@pierre_m',
        avatar: null,
      },
      type: 'badge',
      icon: Award,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-100',
      content: 'a collecté 25 badges différents',
      timestamp: '3h',
      likes: 28,
      comments: 4,
      isFollowing: false,
    },
  ];

  const filteredActivities = activities.filter((activity) => {
    if (filter === 'following') return activity.isFollowing;
    if (filter === 'popular') return activity.likes > 20;
    return true;
  });

  const stats = [
    { label: 'Activités', value: '1,234', icon: TrendingUp, color: 'text-blue-600' },
    { label: 'Abonnements', value: '89', icon: Users, color: 'text-green-600' },
    { label: 'Cette semaine', value: '+24', icon: Sparkles, color: 'text-purple-600' },
  ];

  return (
    <>
      <Helmet>
        <title>Fil d'Activité | Med-Mng</title>
        <meta name="description" content="Découvrez les dernières activités de la communauté Med-Mng" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Fil d'Activité
            </h1>
            <p className="text-lg text-gray-600">
              Restez connecté avec la communauté Med-Mng
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Filter Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                >
                  Tout
                </Button>
                <Button
                  variant={filter === 'following' ? 'default' : 'outline'}
                  onClick={() => setFilter('following')}
                >
                  Abonnements
                </Button>
                <Button
                  variant={filter === 'popular' ? 'default' : 'outline'}
                  onClick={() => setFilter('popular')}
                >
                  Populaire
                </Button>
              </div>

              {/* Activities */}
              <div className="space-y-4">
                {filteredActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <Card key={activity.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-4">
                          <Link to={`/users/${activity.user.username.slice(1)}`}>
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={activity.user.avatar || undefined} />
                              <AvatarFallback>{activity.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link to={`/users/${activity.user.username.slice(1)}`}>
                                <span className="font-semibold text-gray-900 hover:underline">
                                  {activity.user.name}
                                </span>
                              </Link>
                              <span className="text-gray-500">{activity.user.username}</span>
                              <span className="text-gray-400">·</span>
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {activity.timestamp}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${activity.iconBg}`}>
                                <Icon className={`w-4 h-4 ${activity.iconColor}`} />
                              </div>
                              <span className="text-gray-900">{activity.content}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <button className="flex items-center gap-2 hover:text-red-600 transition-colors">
                            <Heart className="w-4 h-4" />
                            {activity.likes}
                          </button>
                          <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            {activity.comments}
                          </button>
                          <button className="flex items-center gap-2 hover:text-green-600 transition-colors">
                            <Share2 className="w-4 h-4" />
                            Partager
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Load More */}
              <div className="text-center">
                <Button variant="outline" size="lg">
                  Charger plus d'activités
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900">Vos Statistiques</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${stat.color}`} />
                          <span className="text-gray-600">{stat.label}</span>
                        </div>
                        <span className="font-semibold text-gray-900">{stat.value}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900">Navigation Rapide</h3>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to={ROUTE_PATHS.activityMe}>
                    <Button variant="outline" className="w-full justify-start">
                      Mon Activité
                    </Button>
                  </Link>
                  <Link to={ROUTE_PATHS.users}>
                    <Button variant="outline" className="w-full justify-start">
                      Découvrir des Utilisateurs
                    </Button>
                  </Link>
                  <Link to={ROUTE_PATHS.posts}>
                    <Button variant="outline" className="w-full justify-start">
                      Fil de Posts
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900">Tendances</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  {['#100DaysChallenge', '#MeditationDaily', '#FocusTime', '#LearningGoals'].map((tag, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <Badge variant="secondary">{tag}</Badge>
                      <span className="text-sm text-gray-500">{Math.floor(Math.random() * 500 + 100)} posts</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
