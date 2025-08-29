import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Stethoscope, Music, BookOpen, Brain, Zap, TrendingUp,
  Users, Star, Play, Award, Clock, BarChart3, Sparkles,
  Heart, Target, Trophy, Rocket, GraduationCap, Activity
} from 'lucide-react';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { cn } from '@/lib/utils';

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  path: string;
  gradient: string;
  badge?: string;
  stats?: { label: string; value: string }[];
}

interface UserStats {
  songsCreated: number;
  itemsStudied: number;
  studyStreak: number;
  totalScore: number;
}

export const PremiumHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    songsCreated: 0,
    itemsStudied: 0,
    studyStreak: 0,
    totalScore: 0
  });
  const [liveStats, setLiveStats] = useState({
    totalUsers: 2847,
    songsGenerated: 15672,
    itemsCompleted: 98234
  });

  useEffect(() => {
    // Simulate real-time stats updates
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 3),
        songsGenerated: prev.songsGenerated + Math.floor(Math.random() * 5),
        itemsCompleted: prev.itemsCompleted + Math.floor(Math.random() * 10)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const features: FeatureCard[] = [
    {
      title: 'Générateur IA Musical',
      description: 'Transformez vos cours en chansons mémorables avec notre IA avancée',
      icon: Music,
      path: '/generator',
      gradient: 'from-purple-500 to-pink-500',
      badge: 'Premium',
      stats: [
        { label: 'Chansons créées', value: '15,672' },
        { label: 'Styles disponibles', value: '20+' }
      ]
    },
    {
      title: 'Items EDN Complets',
      description: 'Tous les 367 items EDN avec contenu musical et interactif',
      icon: BookOpen,
      path: '/edn',
      gradient: 'from-blue-500 to-cyan-500',
      badge: '367 Items',
      stats: [
        { label: 'Items disponibles', value: '367' },
        { label: 'Avec musique', value: '245' }
      ]
    },
    {
      title: 'Assistant IA Médical',
      description: 'Votre compagnon intelligent pour révisions et questions',
      icon: Brain,
      path: '/chat',
      gradient: 'from-green-500 to-emerald-500',
      badge: 'Beta',
      stats: [
        { label: 'Questions résolues', value: '25,847' },
        { label: 'Taux de précision', value: '94%' }
      ]
    },
    {
      title: 'ECOS Interactifs',
      description: 'Examens cliniques simulés avec feedback intelligent',
      icon: Target,
      path: '/ecos',
      gradient: 'from-orange-500 to-red-500',
      stats: [
        { label: 'Scenarios', value: '150+' },
        { label: 'Taux de réussite', value: '87%' }
      ]
    },
    {
      title: 'Analytics Avancées',
      description: 'Suivez vos progrès avec des analyses détaillées',
      icon: BarChart3,
      path: '/analytics',
      gradient: 'from-indigo-500 to-purple-500',
      stats: [
        { label: 'Métriques', value: '50+' },
        { label: 'Précision', value: '99.9%' }
      ]
    },
    {
      title: 'Communauté Premium',
      description: 'Rejoignez une communauté d\'étudiants passionnés',
      icon: Users,
      path: '/community',
      gradient: 'from-pink-500 to-rose-500',
      stats: [
        { label: 'Membres actifs', value: '2,847' },
        { label: 'Discussions', value: '12,456' }
      ]
    }
  ];

  const achievements = [
    { icon: Trophy, title: 'Premier pas', description: 'Première connexion', unlocked: true },
    { icon: Music, title: 'Créateur', description: '10 chansons créées', unlocked: user ? true : false },
    { icon: GraduationCap, title: 'Studieux', description: '50 items étudiés', unlocked: false },
    { icon: Rocket, title: 'Expert', description: '100% sur un item', unlocked: false }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section Premium */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative medical-container py-16 lg:py-24">
          <div className="text-center space-y-8">
            {/* Welcome Message */}
            {user && (
              <div className="glass-medical inline-block px-6 py-3 rounded-full">
                <p className="text-premium">
                  Bon retour, <span className="font-semibold text-primary">{user.email.split('@')[0]}</span> ! 
                  <Sparkles className="inline h-4 w-4 ml-2 text-accent" />
                </p>
              </div>
            )}

            {/* Main Title */}
            <div className="space-y-6">
              <h1 className="heading-premium text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Révolutionnez votre
                <br />
                <span className="bg-gradient-premium bg-clip-text text-transparent">
                  apprentissage médical
                </span>
              </h1>
              
              <p className="text-premium text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                Transformez vos révisions en expérience musicale immersive. 
                MED MNG combine intelligence artificielle et pédagogie pour 
                une mémorisation exceptionnelle des 367 items EDN.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                className="medical-btn-primary px-8 py-4 text-lg shadow-glow"
                onClick={() => navigate(user ? '/med-mng/create' : '/med-mng/signup')}
              >
                <Music className="h-5 w-5 mr-2" />
                {user ? 'Créer une chanson' : 'Commencer gratuitement'}
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="medical-btn-outline px-8 py-4 text-lg"
                onClick={() => navigate('/edn')}
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Explorer les items EDN
              </Button>
            </div>

            {/* Live Stats */}
            <div className="glass-medical p-6 rounded-2xl max-w-2xl mx-auto">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary glow-primary">
                    {liveStats.totalUsers.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Étudiants actifs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">
                    {liveStats.songsGenerated.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Chansons créées</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-500">
                    {liveStats.itemsCompleted.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Items étudiés</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="medical-section">
        <div className="medical-container">
          <div className="text-center mb-16">
            <h2 className="heading-premium text-3xl md:text-4xl font-bold mb-4">
              Fonctionnalités Exceptionnelles
            </h2>
            <p className="text-premium text-lg max-w-2xl mx-auto">
              Découvrez tous les outils qui font de MED MNG la plateforme 
              d'apprentissage médical la plus innovante.
            </p>
          </div>

          <div className="medical-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              
              return (
                <Card 
                  key={feature.path}
                  className="card-glass premium-hover cursor-pointer group h-full"
                  onClick={() => navigate(feature.path)}
                >
                  <CardHeader className="relative">
                    <div className={cn(
                      "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300",
                      feature.gradient
                    )}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <CardTitle className="heading-premium text-lg">
                        {feature.title}
                      </CardTitle>
                      {feature.badge && (
                        <Badge className="status-success">
                          {feature.badge}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-premium text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardHeader>

                  {feature.stats && (
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-4">
                        {feature.stats.map((stat, statIndex) => (
                          <div key={statIndex} className="text-center">
                            <div className="text-lg font-bold text-primary">
                              {stat.value}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {stat.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* User Dashboard Section (if logged in) */}
      {user && (
        <section className="medical-section bg-muted/20">
          <div className="medical-container">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Progress Overview */}
              <div className="lg:col-span-2">
                <Card className="card-glass h-full">
                  <CardHeader>
                    <CardTitle className="heading-premium text-xl flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Vos Progrès
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {userStats.songsCreated}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Chansons créées
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-accent">
                          {userStats.itemsStudied}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Items étudiés
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-500">
                          {userStats.studyStreak}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Jours consécutifs
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-500">
                          {userStats.totalScore}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Score moyen
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Achievements */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="heading-premium text-xl flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Succès
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {achievements.map((achievement, index) => {
                      const IconComponent = achievement.icon;
                      
                      return (
                        <div 
                          key={index}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg transition-all",
                            achievement.unlocked 
                              ? "bg-primary/10 border border-primary/20" 
                              : "bg-muted/50 opacity-50"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            achievement.unlocked 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted"
                          )}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {achievement.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {achievement.description}
                            </div>
                          </div>
                          {achievement.unlocked && (
                            <Badge className="status-success">
                              Débloqué
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="medical-section">
        <div className="medical-container">
          <Card className="card-glass text-center p-12">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-gradient-premium rounded-full flex items-center justify-center mx-auto shadow-glow">
                <Heart className="h-8 w-8 text-white" />
              </div>
              
              <div className="space-y-4">
                <h2 className="heading-premium text-3xl font-bold">
                  Prêt à transformer vos révisions ?
                </h2>
                <p className="text-premium text-lg max-w-2xl mx-auto">
                  Rejoignez des milliers d'étudiants qui ont révolutionné 
                  leur apprentissage médical avec MED MNG.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="medical-btn-primary px-8 py-4 shadow-glow"
                  onClick={() => navigate(user ? '/med-mng/dashboard' : '/med-mng/signup')}
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  {user ? 'Accéder au Dashboard' : 'Créer mon compte'}
                </Button>
                
                <Button 
                  size="lg"
                  variant="outline"
                  className="medical-btn-outline px-8 py-4"
                  onClick={() => navigate('/documentation')}
                >
                  Découvrir la documentation
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};