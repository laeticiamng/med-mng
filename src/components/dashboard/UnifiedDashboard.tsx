import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, BarChart3, Brain, BookOpen, Music, Users, Target, 
  TrendingUp, Clock, Trophy, Star, Zap, Heart, Shield, Settings,
  Calendar, Bell, Download, Share2, ArrowRight, Plus, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalStudyTime: number;
  completedItems: number;
  currentStreak: number;
  averageScore: number;
  musicTracks: number;
  communityRank: number;
}

interface RecentActivity {
  id: string;
  type: 'study' | 'music' | 'quiz' | 'community';
  title: string;
  description: string;
  timestamp: Date;
  score?: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

const UnifiedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalStudyTime: 248,
    completedItems: 42,
    currentStreak: 7,
    averageScore: 87,
    musicTracks: 15,
    communityRank: 23
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'study',
      title: 'IC-1 Relation médecin-malade',
      description: 'Quiz complété avec succès',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      score: 92
    },
    {
      id: '2',
      type: 'music',
      title: 'Musique cardiologie générée',
      description: 'Style Lo-Fi pour révisions',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      id: '3',
      type: 'community',
      title: 'Réponse dans le forum',
      description: 'Discussion sur l\'hypertension artérielle',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
    }
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Première Semaine',
      description: 'Étudiez 7 jours consécutifs',
      icon: '🔥',
      unlocked: true,
      progress: 7,
      maxProgress: 7
    },
    {
      id: '2',
      title: 'Expert Musical',
      description: 'Générez 10 musiques d\'étude',
      icon: '🎵',
      unlocked: false,
      progress: 6,
      maxProgress: 10
    },
    {
      id: '3',
      title: 'Mentor Communautaire',
      description: 'Aidez 5 étudiants dans le forum',
      icon: '🤝',
      unlocked: false,
      progress: 2,
      maxProgress: 5
    }
  ]);

  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    // Animation du compteur de stats
    const timer = setTimeout(() => {
      // Logique de mise à jour des stats en temps réel
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'study': return BookOpen;
      case 'music': return Music;
      case 'quiz': return Brain;
      case 'community': return Users;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'study': return 'text-blue-400';
      case 'music': return 'text-purple-400';
      case 'quiz': return 'text-green-400';
      case 'community': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const quickActions = [
    {
      title: 'Commencer une session',
      description: 'Étudiez un nouvel item EDN',
      icon: BookOpen,
      action: () => navigate('/edn'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Générer de la musique',
      description: 'Créez votre ambiance d\'étude',
      icon: Music,
      action: () => navigate('/generator'),
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Rejoindre la communauté',
      description: 'Échangez avec d\'autres étudiants',
      icon: Users,
      action: () => navigate('/community'),
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Voir les analytics',
      description: 'Analysez vos performances',
      icon: BarChart3,
      action: () => navigate('/analytics'),
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard Unifié - MED-MNG</title>
        <meta name="description" content="Tableau de bord complet pour suivre vos progrès, statistiques et activités d'apprentissage médical" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-6 py-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Dashboard Unifié
              </h1>
              <p className="text-muted-foreground mt-2">
                Suivez vos progrès et gérez vos activités d'apprentissage
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
              <Button size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </Button>
            </div>
          </motion.div>

          {/* Statistiques principales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {[
              { icon: Clock, label: 'Temps d\'étude', value: `${stats.totalStudyTime}h`, color: 'text-blue-400' },
              { icon: BookOpen, label: 'Items complétés', value: stats.completedItems, color: 'text-green-400' },
              { icon: Target, label: 'Série actuelle', value: `${stats.currentStreak} jours`, color: 'text-orange-400' },
              { icon: Trophy, label: 'Score moyen', value: `${stats.averageScore}%`, color: 'text-yellow-400' },
              { icon: Music, label: 'Musiques créées', value: stats.musicTracks, color: 'text-purple-400' },
              { icon: Users, label: 'Rang communauté', value: `#${stats.communityRank}`, color: 'text-pink-400' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 text-center">
                    <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Actions rapides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Actions Rapides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center text-center w-full group"
                        onClick={action.action}
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-medium mb-1">{action.title}</h3>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contenu principal avec onglets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="progress">Progression</TabsTrigger>
                <TabsTrigger value="activity">Activité</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Graphique de progression */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Progression Hebdomadaire</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                        <div className="text-center">
                          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">Graphique de progression</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Temps d'étude quotidien et scores d'évaluation
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Objectifs du jour */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Objectifs du jour
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { label: 'Étudier 2 items EDN', progress: 50, target: 2 },
                        { label: 'Créer 1 musique', progress: 0, target: 1 },
                        { label: 'Participer au forum', progress: 100, target: 1 }
                      ].map((goal, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{goal.label}</span>
                            <span className="text-muted-foreground">{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Activité Récente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => {
                        const ActivityIcon = getActivityIcon(activity.type);
                        return (
                          <div key={activity.id} className="flex items-start gap-4 p-4 bg-muted/20 rounded-lg">
                            <div className={`p-2 rounded-lg bg-background`}>
                              <ActivityIcon className={`w-4 h-4 ${getActivityColor(activity.type)}`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{activity.title}</h4>
                              <p className="text-sm text-muted-foreground">{activity.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>{activity.timestamp.toLocaleDateString('fr-FR')}</span>
                                {activity.score && (
                                  <Badge variant="secondary" className="text-xs">
                                    Score: {activity.score}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.map((achievement) => (
                    <Card key={achievement.id} className={achievement.unlocked ? 'border-primary' : ''}>
                      <CardContent className="p-6 text-center">
                        <div className="text-4xl mb-4">{achievement.icon}</div>
                        <h3 className="font-semibold mb-2">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>
                        
                        {achievement.unlocked ? (
                          <Badge className="bg-primary text-primary-foreground">
                            <Trophy className="w-3 h-3 mr-1" />
                            Débloqué !
                          </Badge>
                        ) : (
                          <div className="space-y-2">
                            <Progress 
                              value={(achievement.progress / achievement.maxProgress) * 100} 
                              className="h-2" 
                            />
                            <p className="text-xs text-muted-foreground">
                              {achievement.progress}/{achievement.maxProgress}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Widget météo d'apprentissage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                      <Brain className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Votre météo d'apprentissage</h3>
                      <p className="text-muted-foreground">
                        Excellente forme ! Continuez sur cette lancée.
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">87%</div>
                    <div className="text-sm text-muted-foreground">Efficacité</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default UnifiedDashboard;