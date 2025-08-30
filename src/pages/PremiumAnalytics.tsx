import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PremiumLayout } from '@/components/layout/PremiumLayout';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, TrendingUp, Users, Clock, Target, BookOpen, Music, Brain,
  Calendar, Filter, Download, Share2, Eye, Heart, Zap, Award,
  LineChart, PieChart, Activity, RefreshCw, CheckCircle, AlertCircle, Sparkles
} from 'lucide-react';

interface AnalyticsMetric {
  id: string;
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
  description?: string;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface AnalyticsData {
  period: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export default function PremiumAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [activeView, setActiveView] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  const mainMetrics: AnalyticsMetric[] = [
    {
      id: 'study-sessions',
      title: 'Sessions d\'étude',
      value: 247,
      change: '+18%',
      trend: 'up',
      icon: Clock,
      color: 'from-blue-500 to-cyan-600',
      description: 'Cette semaine'
    },
    {
      id: 'completion-rate',
      title: 'Taux de completion',
      value: '89.3%',
      change: '+5.2%',
      trend: 'up',
      icon: Target,
      color: 'from-green-500 to-emerald-600',
      description: 'Amélioration constante'
    },
    {
      id: 'learning-time',
      title: 'Temps d\'apprentissage',
      value: '156h',
      change: '+12h',
      trend: 'up',
      icon: BookOpen,
      color: 'from-purple-500 to-pink-600',
      description: 'Temps total cette période'
    },
    {
      id: 'ai-interactions',
      title: 'Interactions IA',
      value: 342,
      change: '+28%',
      trend: 'up',
      icon: Brain,
      color: 'from-orange-500 to-red-600',
      description: 'Questions posées à l\'IA'
    }
  ];

  const metrics = mainMetrics;

  const learningData: ChartData[] = [
    { name: 'Cardiologie', value: 35, color: '#ef4444' },
    { name: 'Neurologie', value: 28, color: '#8b5cf6' },
    { name: 'Pneumologie', value: 22, color: '#3b82f6' },
    { name: 'Gastro', value: 18, color: '#10b981' },
    { name: 'Endocrino', value: 15, color: '#f59e0b' },
    { name: 'Autres', value: 12, color: '#6b7280' }
  ];

  const weeklyProgress = [
    { day: 'Lun', items: 12, time: 180, score: 85 },
    { day: 'Mar', items: 15, time: 220, score: 88 },
    { day: 'Mer', items: 8, time: 120, score: 92 },
    { day: 'Jeu', items: 18, time: 270, score: 87 },
    { day: 'Ven', items: 22, time: 310, score: 91 },
    { day: 'Sam', items: 10, time: 150, score: 89 },
    { day: 'Dim', items: 6, time: 90, score: 85 }
  ];

  const achievements = [
    {
      title: 'Série Parfaite',
      description: '7 jours consécutifs d\'apprentissage',
      date: 'Il y a 2 jours',
      rarity: 'epic',
      icon: Award
    },
    {
      title: 'Maître Cardiologue',
      description: 'Tous les items de cardiologie complétés',
      date: 'Il y a 1 semaine',
      rarity: 'legendary',
      icon: Heart
    },
    {
      title: 'Créateur Musical',
      description: '25 musiques générées avec succès',
      date: 'Il y a 2 semaines',
      rarity: 'rare',
      icon: Music
    }
  ];

  const periods = [
    { id: '7d', label: '7 jours' },
    { id: '30d', label: '30 jours' },
    { id: '90d', label: '3 mois' },
    { id: '1y', label: '1 an' }
  ];

  const studyData: AnalyticsData[] = [
    { period: 'Lun', value: 180, change: 12, trend: 'up' },
    { period: 'Mar', value: 240, change: 15, trend: 'up' },
    { period: 'Mer', value: 120, change: -8, trend: 'down' },
    { period: 'Jeu', value: 300, change: 25, trend: 'up' },
    { period: 'Ven', value: 200, change: -10, trend: 'down' },
    { period: 'Sam', value: 360, change: 30, trend: 'up' },
    { period: 'Dim', value: 180, change: 5, trend: 'up' }
  ];

  const progressByCategory = [
    { category: 'Cardiologie', completed: 28, total: 35, percentage: 80, color: 'bg-red-500' },
    { category: 'Neurologie', completed: 22, total: 30, percentage: 73, color: 'bg-purple-500' },
    { category: 'Pneumologie', completed: 15, total: 25, percentage: 60, color: 'bg-blue-500' },
    { category: 'Gastroentérologie', completed: 18, total: 28, percentage: 64, color: 'bg-green-500' },
    { category: 'Endocrinologie', completed: 12, total: 20, percentage: 60, color: 'bg-yellow-500' },
    { category: 'Rhumatologie', completed: 8, total: 15, percentage: 53, color: 'bg-indigo-500' }
  ];

  const recentAchievements = [
    {
      id: '1',
      title: 'Expert Cardiologie',
      description: 'Complété tous les items de cardiologie',
      date: 'Il y a 2 jours',
      icon: Heart,
      color: 'text-red-500'
    },
    {
      id: '2',
      title: 'Créateur Musical',
      description: '25 musiques pédagogiques créées',
      date: 'Il y a 5 jours',
      icon: Music,
      color: 'text-purple-500'
    },
    {
      id: '3',
      title: 'Série d\'Or',
      description: '10 jours d\'apprentissage consécutifs',
      date: 'Il y a 1 semaine',
      icon: Award,
      color: 'text-yellow-500'
    }
  ];

  const weeklyGoals = [
    { 
      goal: 'Étudier 20h cette semaine', 
      current: 15.5, 
      target: 20, 
      unit: 'h',
      color: 'from-blue-500 to-cyan-600'
    },
    { 
      goal: 'Compléter 15 nouveaux items', 
      current: 12, 
      target: 15, 
      unit: 'items',
      color: 'from-green-500 to-emerald-600'
    },
    { 
      goal: 'Créer 5 musiques', 
      current: 3, 
      target: 5, 
      unit: 'musiques',
      color: 'from-purple-500 to-pink-600'
    },
    { 
      goal: 'Score moyen > 85%', 
      current: 87.3, 
      target: 85, 
      unit: '%',
      color: 'from-orange-500 to-red-600'
    }
  ];

  const maxStudyTime = Math.max(...studyData.map(d => d.value));

  return (
    <PremiumLayout variant="gradient">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Analytics Premium
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Analysez vos performances, suivez vos progrès et optimisez votre apprentissage 
            avec des insights personnalisés et des recommandations IA.
          </p>
          
          <div className="flex items-center justify-center gap-4 pt-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Dernières 24h</SelectItem>
                <SelectItem value="7d">7 derniers jours</SelectItem>
                <SelectItem value="30d">30 derniers jours</SelectItem>
                <SelectItem value="90d">3 derniers mois</SelectItem>
              </SelectContent>
            </Select>
            
            <PremiumButton
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={() => setIsLoading(true)}
              loading={isLoading}
            >
              Exporter
            </PremiumButton>
          </div>
        </motion.div>

        {/* Main Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <PremiumCard
                key={metric.id}
                variant="glow"
                colorScheme="primary"
                className="p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color}`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <Badge
                    className={`${
                      metric.trend === 'up' ? 'bg-success/20 text-success' : 
                      metric.trend === 'down' ? 'bg-destructive/20 text-destructive' : 
                      'bg-muted/20 text-muted-foreground'
                    }`}
                  >
                    {metric.change}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                </div>
              </PremiumCard>
            );
          })}
        </motion.div>

        {/* Detailed Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-muted/50">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="progress">Progression</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="goals">Objectifs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Study Time Chart */}
              <PremiumCard variant="elevated" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground">Temps d'Étude par Jour</h3>
                  <Badge className="bg-primary/20 text-primary">Cette semaine</Badge>
                </div>
                
                <div className="space-y-4">
                  {studyData.map((day, index) => (
                    <div key={day.period} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{day.period}</span>
                        <span className="font-medium">
                          {Math.floor(day.value / 60)}h {day.value % 60}m
                        </span>
                      </div>
                      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(day.value / maxStudyTime) * 100}%` }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </PremiumCard>

              {/* Recent Achievements */}
              <PremiumCard variant="glass" className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-6">Succès Récents</h3>
                <div className="space-y-4">
                  {recentAchievements.map((achievement) => {
                    const IconComponent = achievement.icon;
                    return (
                      <div key={achievement.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                        <div className="p-2 rounded-lg bg-muted">
                          <IconComponent className={`w-4 h-4 ${achievement.color}`} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="font-medium text-foreground">{achievement.title}</p>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          <p className="text-xs text-muted-foreground">{achievement.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </PremiumCard>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              {/* Progress by Category */}
              <PremiumCard variant="elevated" className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-6">Progression par Spécialité</h3>
                <div className="space-y-6">
                  {progressByCategory.map((category, index) => (
                    <motion.div
                      key={category.category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{category.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {category.completed}/{category.total} items
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress
                          value={category.percentage}
                          className="flex-1 h-3"
                        />
                        <span className="text-sm font-medium w-12 text-right">
                          {category.percentage}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </PremiumCard>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              {/* Performance Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PremiumCard variant="glow" colorScheme="success" className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-6 h-6 text-success" />
                    <h3 className="font-bold text-foreground">Points Forts</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm">Excellent en Cardiologie (95%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm">Régularité d'apprentissage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm">Créativité musicale</span>
                    </div>
                  </div>
                </PremiumCard>

                <PremiumCard variant="glow" colorScheme="warning" className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-warning" />
                    <h3 className="font-bold text-foreground">À Améliorer</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-warning" />
                      <span className="text-sm">Rhumatologie (53% complété)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-warning" />
                      <span className="text-sm">Temps de révision quotidien</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-warning" />
                      <span className="text-sm">Quiz intermédiaires</span>
                    </div>
                  </div>
                </PremiumCard>
              </div>
            </TabsContent>

            <TabsContent value="goals" className="space-y-6">
              {/* Weekly Goals */}
              <PremiumCard variant="elevated" className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-6">Objectifs de la Semaine</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {weeklyGoals.map((goal, index) => (
                    <motion.div
                      key={goal.goal}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">{goal.goal}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {goal.current} / {goal.target} {goal.unit}
                          </span>
                          <span className={`font-medium ${
                            goal.current >= goal.target ? 'text-success' : 'text-primary'
                          }`}>
                            {Math.round((goal.current / goal.target) * 100)}%
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={Math.min((goal.current / goal.target) * 100, 100)}
                        className="h-2"
                      />
                      {goal.current >= goal.target && (
                        <div className="flex items-center gap-2 text-success text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>Objectif atteint !</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </PremiumCard>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PremiumCard variant="glow" colorScheme="accent" className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-accent" />
              <h3 className="text-xl font-bold text-foreground">Recommandations IA</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <Brain className="w-5 h-5 text-accent mb-2" />
                <p className="text-sm font-medium text-foreground mb-1">
                  Optimisation d'apprentissage
                </p>
                <p className="text-xs text-muted-foreground">
                  Concentrez-vous sur la rhumatologie, votre point faible actuel
                </p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <Clock className="w-5 h-5 text-primary mb-2" />
                <p className="text-sm font-medium text-foreground mb-1">
                  Meilleur moment d'étude
                </p>
                <p className="text-xs text-muted-foreground">
                  Vos meilleures performances sont entre 14h-16h
                </p>
              </div>
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <Music className="w-5 h-5 text-success mb-2" />
                <p className="text-sm font-medium text-foreground mb-1">
                  Création musicale
                </p>
                <p className="text-xs text-muted-foreground">
                  Créez des musiques sur l'endocrinologie pour améliorer la rétention
                </p>
              </div>
            </div>
          </PremiumCard>
        </motion.div>
      </div>
    </PremiumLayout>
  );
}