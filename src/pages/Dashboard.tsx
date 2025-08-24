import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  BookOpen, 
  Music, 
  Users, 
  Trophy, 
  Star, 
  TrendingUp,
  Clock,
  PlayCircle,
  Calendar,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Share2,
  Heart,
  Target,
  Zap,
  Award,
  ChevronRight,
  ArrowUpRight,
  PlusCircle,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { PersonalizedDashboard } from '@/components/dashboard/PersonalizedDashboard';
import { RealTimeAnalytics } from '@/components/analytics/RealTimeAnalytics';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { GamificationSystem } from '@/components/gamification/GamificationSystem';
import { ImmersiveLayout } from '@/components/immersive/ImmersiveLayout';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');

  const quickStats = [
    {
      title: 'Items EDN Maîtrisés',
      value: 142,
      total: 367,
      percentage: 39,
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-600',
      trend: '+12 cette semaine'
    },
    {
      title: 'Musiques Créées',
      value: 28,
      total: 50,
      percentage: 56,
      icon: Music,
      color: 'from-purple-500 to-pink-600',
      trend: '+5 aujourd\'hui'
    },
    {
      title: 'Score Moyen',
      value: 87,
      total: 100,
      percentage: 87,
      icon: Target,
      color: 'from-green-500 to-emerald-600',
      trend: '+3 points'
    },
    {
      title: 'Temps d\'Étude',
      value: 156,
      total: 200,
      percentage: 78,
      icon: Clock,
      color: 'from-orange-500 to-red-600',
      trend: '2h aujourd\'hui',
      unit: 'h'
    }
  ];

  const recentActivities = [
    {
      type: 'study',
      title: 'Item IC-225 - Insuffisance cardiaque',
      description: 'Session d\'étude complétée avec succès',
      time: 'Il y a 2h',
      score: 94,
      icon: BookOpen
    },
    {
      type: 'music',
      title: 'Chanson "Arythmie Rap" créée',
      description: 'Nouvelle composition pour l\'item IC-230',
      time: 'Il y a 4h',
      icon: Music
    },
    {
      type: 'achievement',
      title: 'Badge "Expert Cardiologie" débloqué',
      description: 'Félicitations pour votre maîtrise !',
      time: 'Il y a 6h',
      icon: Trophy
    },
    {
      type: 'quiz',
      title: 'Quiz Neurologie réussi',
      description: '9/10 - Excellent résultat !',
      time: 'Hier',
      score: 90,
      icon: Target
    }
  ];

  const recommendations = [
    {
      title: 'Item IC-91 - Déficit neurologique récent',
      reason: 'Basé sur vos difficultés récentes',
      difficulty: 'Intermédiaire',
      estimatedTime: '45 min',
      type: 'study'
    },
    {
      title: 'Créer une chanson pour la Pneumologie',
      reason: 'Vous n\'avez pas encore exploré ce domaine',
      difficulty: 'Facile',
      estimatedTime: '15 min',
      type: 'music'
    },
    {
      title: 'Simulation ECOS - Consultation urgences',
      reason: 'Préparez votre examen pratique',
      difficulty: 'Avancé',
      estimatedTime: '60 min',
      type: 'simulation'
    }
  ];

  return (
    <ImmersiveLayout
      variant="dashboard"
      header={{
        title: "Tableau de Bord Personnel",
        subtitle: "Suivez vos progrès et découvrez vos recommandations",
        icon: <BarChart3 className="h-6 w-6" />,
        badge: { text: "Pro", color: "purple" },
        actions: (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Button>
            <Button 
              onClick={() => navigate('/notifications')}
              variant="outline" 
              size="sm"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
          </div>
        )
      }}
    >
      <div className="space-y-6">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <Card key={index} className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">
                        {stat.value}{stat.unit || ''}
                      </span>
                      <span className="text-sm text-gray-400">
                        /{stat.total}{stat.unit || ''}
                      </span>
                    </div>
                    <Progress value={stat.percentage} className="mt-2 h-2" />
                    <p className="text-xs text-green-400 mt-1">{stat.trend}</p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dashboard personnalisé */}
        <PersonalizedDashboard />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activités récentes */}
          <Card className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Activités Récentes</CardTitle>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Eye className="h-4 w-4 mr-2" />
                  Voir tout
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'study' ? 'bg-blue-500/20' :
                    activity.type === 'music' ? 'bg-purple-500/20' :
                    activity.type === 'achievement' ? 'bg-yellow-500/20' :
                    'bg-green-500/20'
                  }`}>
                    <activity.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm">{activity.title}</h4>
                    <p className="text-gray-400 text-xs">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.time}</span>
                      {activity.score && (
                        <Badge className="bg-green-500/20 text-green-300 text-xs">
                          {activity.score}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recommandations personnalisées */}
          <Card className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Recommandations IA</CardTitle>
                <Badge className="bg-purple-500/20 text-purple-300">
                  <Zap className="h-3 w-3 mr-1" />
                  Personnalisé
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-medium text-sm">{rec.title}</h4>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-gray-400 text-xs mb-3">{rec.reason}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${
                        rec.difficulty === 'Facile' ? 'bg-green-500/20 text-green-300' :
                        rec.difficulty === 'Intermédiaire' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {rec.difficulty}
                      </Badge>
                      <span className="text-xs text-gray-500">{rec.estimatedTime}</span>
                    </div>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                      Commencer
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Analytics en temps réel */}
        <RealTimeAnalytics />

        {/* Système de gamification */}
        <GamificationSystem />

        {/* Actions rapides */}
        <Card className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Actions Rapides</CardTitle>
            <CardDescription className="text-gray-400">
              Accès direct à vos fonctionnalités préférées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: PlusCircle, label: 'Créer Musique', path: '/generator', color: 'from-purple-500 to-pink-600' },
                { icon: BookOpen, label: 'Étudier EDN', path: '/edn', color: 'from-blue-500 to-indigo-600' },
                { icon: Users, label: 'Simuler ECOS', path: '/ecos', color: 'from-green-500 to-emerald-600' },
                { icon: BarChart3, label: 'Voir Analytics', path: '/analytics', color: 'from-orange-500 to-red-600' }
              ].map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="h-20 flex-col gap-2 bg-white/5 hover:bg-white/10 border border-white/10"
                  onClick={() => navigate(action.path)}
                >
                  <div className={`w-8 h-8 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center`}>
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-white text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ImmersiveLayout>
  );
}