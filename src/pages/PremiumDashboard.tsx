import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PremiumLayout } from '@/components/layout/PremiumLayout';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Music, 
  TrendingUp, 
  Zap,
  Target,
  Award,
  PlayCircle,
  Brain,
  Heart,
  Sparkles,
  Clock,
  CheckCircle,
  ArrowRight,
  Globe
} from 'lucide-react';

interface DashboardStat {
  id: string;
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ComponentType<any>;
  color: string;
  isPremium?: boolean;
  isNew?: boolean;
}

interface RecentActivity {
  id: string;
  type: 'learning' | 'creation' | 'achievement';
  title: string;
  description: string;
  time: string;
  icon: React.ComponentType<any>;
  color: string;
}

export default function PremiumDashboard() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats: DashboardStat[] = [
    {
      id: 'total-items',
      label: 'Items EDN Étudiés',
      value: 156,
      change: '+23 cette semaine',
      trend: 'up',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'music-created',
      label: 'Musiques Créées',
      value: 42,
      change: '+8 cette semaine',
      trend: 'up',
      icon: Music,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'study-time',
      label: 'Temps d\'Étude',
      value: '34h',
      change: '+5h cette semaine',
      trend: 'up',
      icon: Clock,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'success-rate',
      label: 'Taux de Réussite',
      value: '87%',
      change: '+5% ce mois',
      trend: 'up',
      icon: Target,
      color: 'from-orange-500 to-red-600'
    }
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'edn-study',
      title: 'Étudier Items EDN',
      description: 'Continuez votre progression sur les 367 items',
      path: '/edn',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'create-music',
      title: 'Créer Musique',
      description: 'Générez une nouvelle musique pédagogique',
      path: '/generator',
      icon: Music,
      color: 'from-purple-500 to-pink-600',
      isPremium: true
    },
    {
      id: 'ai-chat',
      title: 'Assistant IA',
      description: 'Posez vos questions médicales à l\'IA',
      path: '/chat',
      icon: Brain,
      color: 'from-green-500 to-emerald-600',
      isNew: true
    },
    {
      id: 'ecos-practice',
      title: 'Simulation ECOS',
      description: 'Entraînez-vous avec des cas cliniques',
      path: '/ecos',
      icon: Users,
      color: 'from-teal-500 to-blue-600'
    }
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'learning',
      title: 'Item IC-230 complété',
      description: 'Fibrillation auriculaire - Score: 95%',
      time: 'Il y a 2h',
      icon: CheckCircle,
      color: 'text-success'
    },
    {
      id: '2',
      type: 'creation',
      title: 'Musique générée',
      description: 'Chanson sur l\'hypertension artérielle',
      time: 'Il y a 4h',
      icon: Music,
      color: 'text-purple-500'
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Badge obtenu',
      description: 'Cardiologue en herbe - 50 items cardio',
      time: 'Hier',
      icon: Award,
      color: 'text-accent'
    }
  ];

  const todayProgress = {
    studiedItems: 8,
    targetItems: 12,
    studyTime: 145, // minutes
    targetTime: 180, // minutes
    quizScore: 85
  };

  return (
    <PremiumLayout variant="gradient">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <p className="text-sm text-muted-foreground">
              Connecté • {currentTime.toLocaleTimeString('fr-FR')}
            </p>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Dashboard Premium
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Votre centre de commande pour une formation médicale d'excellence
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <PremiumCard
                key={stat.id}
                variant="glow"
                colorScheme="primary"
                className="p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <Badge
                    className={`${
                      stat.trend === 'up' ? 'bg-success/20 text-success' : 
                      stat.trend === 'down' ? 'bg-destructive/20 text-destructive' : 
                      'bg-muted/20 text-muted-foreground'
                    }`}
                  >
                    {stat.change}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
              </PremiumCard>
            );
          })}
        </motion.div>

        {/* Progress Today */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PremiumCard variant="gradient" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Progression du Jour</h2>
              <Badge className="bg-primary/20 text-primary">
                En cours
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Items étudiés</span>
                  <span className="text-sm font-medium">{todayProgress.studiedItems}/{todayProgress.targetItems}</span>
                </div>
                <Progress 
                  value={(todayProgress.studiedItems / todayProgress.targetItems) * 100} 
                  className="h-2"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Temps d'étude</span>
                  <span className="text-sm font-medium">{Math.floor(todayProgress.studyTime / 60)}h{todayProgress.studyTime % 60}m/{Math.floor(todayProgress.targetTime / 60)}h{todayProgress.targetTime % 60}m</span>
                </div>
                <Progress 
                  value={(todayProgress.studyTime / todayProgress.targetTime) * 100} 
                  className="h-2"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Score moyen</span>
                  <span className="text-sm font-medium">{todayProgress.quizScore}%</span>
                </div>
                <Progress 
                  value={todayProgress.quizScore} 
                  className="h-2"
                />
              </div>
            </div>
          </PremiumCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-foreground">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <PremiumCard
                  key={action.id}
                  variant="glass"
                  hover
                  className="p-6 cursor-pointer group"
                  onClick={() => navigate(action.path)}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex gap-1">
                        {action.isPremium && (
                          <Badge className="bg-gradient-accent text-white text-xs">Premium</Badge>
                        )}
                        {action.isNew && (
                          <Badge className="bg-success/20 text-success text-xs">Nouveau</Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <div className="flex items-center text-primary text-sm group-hover:translate-x-1 transition-transform">
                      <span>Commencer</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </PremiumCard>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2">
            <PremiumCard variant="elevated" className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Activité Récente</h2>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={`p-2 rounded-lg bg-muted`}>
                        <IconComponent className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium text-foreground">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </PremiumCard>
          </div>

          <div className="space-y-6">
            <PremiumCard variant="gradient" className="p-6">
              <h3 className="font-bold text-foreground mb-4">Navigation Rapide</h3>
              <div className="space-y-3">
                <PremiumButton
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/platform')}
                  icon={<Globe className="w-4 h-4" />}
                >
                  Vue Plateforme
                </PremiumButton>
                <PremiumButton
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/analytics')}
                  icon={<BarChart3 className="w-4 h-4" />}
                >
                  Analytics
                </PremiumButton>
                <PremiumButton
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/settings')}
                  icon={<Zap className="w-4 h-4" />}
                >
                  Paramètres
                </PremiumButton>
              </div>
            </PremiumCard>

            <PremiumCard variant="glow" colorScheme="accent" className="p-6 text-center">
              <Sparkles className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="font-bold text-foreground mb-2">Mode Premium</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Accès illimité à toutes les fonctionnalités
              </p>
              <Badge className="bg-gradient-accent text-white">
                Actif
              </Badge>
            </PremiumCard>
          </div>
        </motion.div>
      </div>
    </PremiumLayout>
  );
}