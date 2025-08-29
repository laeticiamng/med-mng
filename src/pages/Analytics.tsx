import React, { useState } from 'react';
import { PremiumLayout } from '@/components/layout/PremiumLayout';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Target,
  Brain,
  Music,
  BookOpen,
  Activity,
  Download
} from 'lucide-react';

const performanceMetrics = [
  { label: 'Score moyen EDN', value: 78.5, unit: '%', change: '+5.2%', trend: 'up' },
  { label: 'Temps d\'étude', value: 142, unit: 'min/jour', change: '+12%', trend: 'up' },
  { label: 'Taux de réussite ECOS', value: 85.2, unit: '%', change: '+3.8%', trend: 'up' },
  { label: 'Sessions complétées', value: 28, unit: 'cette semaine', change: '+15%', trend: 'up' }
];

const studyPatterns = [
  { period: 'Matin (6h-12h)', sessions: 45, percentage: 35 },
  { period: 'Après-midi (12h-18h)', sessions: 38, percentage: 30 },
  { period: 'Soirée (18h-22h)', sessions: 32, percentage: 25 },
  { period: 'Nuit (22h-6h)', sessions: 13, percentage: 10 }
];

const subjects = [
  { name: 'Cardiologie', progress: 85, questions: 234, time: '45h 30m' },
  { name: 'Pneumologie', progress: 72, questions: 198, time: '38h 15m' },
  { name: 'Neurologie', progress: 68, questions: 156, time: '32h 45m' },
  { name: 'Gastro-entérologie', progress: 91, questions: 287, time: '52h 20m' },
  { name: 'Endocrinologie', progress: 59, questions: 134, time: '28h 10m' }
];

const musicTherapyStats = [
  { genre: 'Relaxation', usage: 78, effect: 'Concentration +15%' },
  { genre: 'Focus', usage: 65, effect: 'Mémorisation +12%' },
  { genre: 'Motivation', usage: 52, effect: 'Performance +8%' },
  { genre: 'Méditation', usage: 43, effect: 'Stress -20%' }
];

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('week');

  return (
    <PremiumLayout variant="gradient">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Analytics MED-MNG
            </h1>
            <p className="text-white/80 text-lg">
              Suivez vos progrès et optimisez vos performances d'étude
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
            
            <PremiumButton variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </PremiumButton>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="study">Étude</TabsTrigger>
            <TabsTrigger value="music">Musicothérapie</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Métriques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {performanceMetrics.map((metric, index) => (
                <PremiumCard key={index} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </h3>
                    <Badge variant={metric.trend === 'up' ? 'default' : 'secondary'}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {metric.change}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {metric.value}
                    <span className="text-sm text-muted-foreground ml-1">
                      {metric.unit}
                    </span>
                  </div>
                </PremiumCard>
              ))}
            </div>

            {/* Graphique de progression */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PremiumCard className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                  Progression hebdomadaire
                </h2>
                <div className="space-y-4">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => {
                    const score = Math.floor(Math.random() * 40) + 60;
                    return (
                      <div key={day} className="flex items-center space-x-4">
                        <span className="w-8 text-sm">{day}</span>
                        <Progress value={score} className="flex-1" />
                        <span className="w-12 text-sm font-medium">{score}%</span>
                      </div>
                    );
                  })}
                </div>
              </PremiumCard>

              <PremiumCard className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-primary" />
                  Habitudes d'étude
                </h2>
                <div className="space-y-4">
                  {studyPatterns.map((pattern, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{pattern.period}</span>
                        <span>{pattern.sessions} sessions</span>
                      </div>
                      <Progress value={pattern.percentage} />
                    </div>
                  ))}
                </div>
              </PremiumCard>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PremiumCard className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-primary" />
                  Scores par matière
                </h2>
                <div className="space-y-6">
                  {subjects.map((subject, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{subject.name}</h3>
                        <Badge>{subject.progress}%</Badge>
                      </div>
                      <Progress value={subject.progress} />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{subject.questions} questions</span>
                        <span>{subject.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </PremiumCard>

              <PremiumCard className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-primary" />
                  Analyse cognitive
                </h2>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-200">
                    <h3 className="font-medium text-blue-600 mb-2">Force principale</h3>
                    <p className="text-sm">Excellent en raisonnement clinique</p>
                    <Badge variant="secondary" className="mt-2">+18% vs moyenne</Badge>
                  </div>
                  
                  <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-200">
                    <h3 className="font-medium text-orange-600 mb-2">À améliorer</h3>
                    <p className="text-sm">Vitesse de résolution des QCM</p>
                    <Badge variant="secondary" className="mt-2">-12% vs objectif</Badge>
                  </div>
                  
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-200">
                    <h3 className="font-medium text-green-600 mb-2">Progression</h3>
                    <p className="text-sm">Constante amélioration en pharmacologie</p>
                    <Badge variant="secondary" className="mt-2">+25% ce mois</Badge>
                  </div>
                </div>
              </PremiumCard>
            </div>
          </TabsContent>

          <TabsContent value="study" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <PremiumCard className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-primary" />
                  Sessions d'étude
                </h2>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">28</div>
                  <p className="text-sm text-muted-foreground mb-4">Cette semaine</p>
                  <Progress value={70} />
                  <p className="text-xs text-muted-foreground mt-2">70% de l'objectif</p>
                </div>
              </PremiumCard>

              <PremiumCard className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-primary" />
                  Temps total
                </h2>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">16h</div>
                  <p className="text-sm text-muted-foreground mb-4">42 minutes</p>
                  <Progress value={85} />
                  <p className="text-xs text-muted-foreground mt-2">+12% vs semaine précédente</p>
                </div>
              </PremiumCard>

              <PremiumCard className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-primary" />
                  Efficacité
                </h2>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">92%</div>
                  <p className="text-sm text-muted-foreground mb-4">Score d'efficacité</p>
                  <Progress value={92} />
                  <p className="text-xs text-muted-foreground mt-2">Excellent niveau</p>
                </div>
              </PremiumCard>
            </div>

            <PremiumCard className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary" />
                Calendrier d'activité
              </h2>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium p-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }, (_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded ${
                      Math.random() > 0.3
                        ? Math.random() > 0.7
                          ? 'bg-primary/80'
                          : Math.random() > 0.5
                          ? 'bg-primary/50'
                          : 'bg-primary/20'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Moins actif</span>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-muted rounded-sm" />
                  <div className="w-3 h-3 bg-primary/20 rounded-sm" />
                  <div className="w-3 h-3 bg-primary/50 rounded-sm" />
                  <div className="w-3 h-3 bg-primary/80 rounded-sm" />
                </div>
                <span>Plus actif</span>
              </div>
            </PremiumCard>
          </TabsContent>

          <TabsContent value="music" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PremiumCard className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <Music className="w-5 h-5 mr-2 text-primary" />
                  Usage par genre
                </h2>
                <div className="space-y-4">
                  {musicTherapyStats.map((stat, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{stat.genre}</span>
                        <span className="text-sm text-muted-foreground">{stat.usage}%</span>
                      </div>
                      <Progress value={stat.usage} />
                      <p className="text-xs text-green-600">{stat.effect}</p>
                    </div>
                  ))}
                </div>
              </PremiumCard>

              <PremiumCard className="p-6">
                <h2 className="text-xl font-semibold mb-6">Impact thérapeutique</h2>
                <div className="space-y-6">
                  <div className="text-center p-4 bg-green-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">+23%</div>
                    <p className="text-sm">Amélioration concentration</p>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">-35%</div>
                    <p className="text-sm">Réduction du stress</p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-1">+18%</div>
                    <p className="text-sm">Rétention mémoire</p>
                  </div>
                </div>
              </PremiumCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PremiumLayout>
  );
};

export default Analytics;