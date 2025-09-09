import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Music,
  BookOpen,
  Clock,
  Target,
  Award,
  Brain,
  Zap,
  Calendar,
  Filter,
  Download,
  Share2,
  Eye,
  Heart,
  Play
} from 'lucide-react';

// Mock data pour les analytics avancées
const mockAnalyticsData = {
  overview: {
    totalUsers: 15420,
    activeUsers: 8934,
    totalSessions: 45678,
    avgSessionTime: '12m 34s',
    retentionRate: 78.5,
    conversionRate: 23.4
  },
  userGrowth: [
    { month: 'Jan', users: 1200, active: 890 },
    { month: 'Fév', users: 1850, active: 1340 },
    { month: 'Mar', users: 2100, active: 1580 },
    { month: 'Avr', users: 2650, active: 1920 },
    { month: 'Mai', users: 3200, active: 2340 },
    { month: 'Juin', users: 3800, active: 2850 }
  ],
  contentStats: {
    totalContent: 892,
    ednItems: 360,
    musicTracks: 428,
    ecosScenarios: 104,
    avgEngagement: 85.2,
    topPerformers: [
      { id: 'IC-331', title: 'Arrêt cardio-circulatoire', type: 'EDN', engagement: 94.5, completions: 1250 },
      { id: 'TRACK-45', title: 'Cardiologie Flow', type: 'Music', engagement: 92.1, plays: 2340 },
      { id: 'ECOS-12', title: 'Urgences Pédiatriques', type: 'ECOS', engagement: 89.7, attempts: 890 }
    ]
  },
  learningPathways: {
    completionRates: {
      cardiology: 87.3,
      pneumology: 78.9,
      neurology: 82.1,
      emergency: 91.2,
      pediatrics: 75.6
    },
    avgTimeSpent: {
      cardiology: '45m',
      pneumology: '38m',
      neurology: '52m',
      emergency: '41m',
      pediatrics: '36m'
    }
  },
  engagement: {
    dailyActive: 3420,
    weeklyActive: 8934,
    monthlyActive: 15420,
    avgSessionsPerUser: 4.2,
    bounceRate: 12.3,
    pageViews: 234567
  }
};

const mockRealtimeData = {
  currentUsers: 247,
  trending: [
    { content: 'IC-290 Trap Beat', type: 'Music', users: 89, trend: '+15%' },
    { content: 'Pneumothorax Study', type: 'EDN', users: 67, trend: '+8%' },
    { content: 'Emergency Protocol', type: 'ECOS', users: 45, trend: '+22%' }
  ]
};

interface AnalyticsDashboardProps {
  className?: string;
}

export default function AdvancedAnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('users');

  const MetricCard = ({ icon: Icon, title, value, change, trend, subtitle }: any) => (
    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 mb-1">
          <span className="text-3xl font-bold">{value}</span>
          {change && (
            <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {change}
            </div>
          )}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );

  const ContentPerformanceCard = ({ item }: { item: any }) => {
    const getTypeIcon = () => {
      switch (item.type) {
        case 'EDN': return <BookOpen className="w-4 h-4" />;
        case 'Music': return <Music className="w-4 h-4" />;
        case 'ECOS': return <Brain className="w-4 h-4" />;
        default: return <Target className="w-4 h-4" />;
      }
    };

    const getTypeColor = () => {
      switch (item.type) {
        case 'EDN': return 'text-blue-600';
        case 'Music': return 'text-purple-600';
        case 'ECOS': return 'text-green-600';
        default: return 'text-gray-600';
      }
    };

    return (
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full bg-muted ${getTypeColor()}`}>
            {getTypeIcon()}
          </div>
          <div>
            <h4 className="font-semibold text-sm">{item.title}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{item.id}</span>
              <Badge variant="outline" className="text-xs">{item.type}</Badge>
            </div>
          </div>
        </div>
        <div className="text-right space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{item.engagement}%</span>
            <div className="w-16 bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${item.engagement}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {item.type === 'Music' ? `${item.plays} écoutes` : 
             item.type === 'EDN' ? `${item.completions} complétions` :
             `${item.attempts} tentatives`}
          </p>
        </div>
      </div>
    );
  };

  const RealtimeActivity = () => (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            Activité en temps réel
          </CardTitle>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {mockRealtimeData.currentUsers} utilisateurs actifs
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground mb-3">Contenu tendance maintenant</h4>
          {mockRealtimeData.trending.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-sm">{item.content}</p>
                  <p className="text-xs text-muted-foreground">{item.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">{item.users} users</p>
                <p className="text-xs text-green-600">{item.trend}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Analytics Avancées</h2>
          <p className="text-muted-foreground">Insights détaillés sur l'utilisation de la plateforme</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 heures</SelectItem>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">3 mois</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          icon={Users}
          title="Utilisateurs totaux"
          value={mockAnalyticsData.overview.totalUsers.toLocaleString()}
          change="+12.5%"
          trend="up"
          subtitle="vs mois dernier"
        />
        <MetricCard
          icon={Zap}
          title="Utilisateurs actifs"
          value={mockAnalyticsData.overview.activeUsers.toLocaleString()}
          change="+8.2%"
          trend="up"
          subtitle="7 derniers jours"
        />
        <MetricCard
          icon={Eye}
          title="Sessions"
          value={mockAnalyticsData.overview.totalSessions.toLocaleString()}
          change="+15.3%"
          trend="up"
          subtitle="Ce mois"
        />
        <MetricCard
          icon={Clock}
          title="Temps moyen"
          value={mockAnalyticsData.overview.avgSessionTime}
          change="+2.1%"
          trend="up"
          subtitle="Par session"
        />
        <MetricCard
          icon={Target}
          title="Rétention"
          value={`${mockAnalyticsData.overview.retentionRate}%`}
          change="+3.4%"
          trend="up"
          subtitle="7 jours"
        />
        <MetricCard
          icon={Award}
          title="Conversion"
          value={`${mockAnalyticsData.overview.conversionRate}%`}
          change="+5.7%"
          trend="up"
          subtitle="Visiteur → Utilisateur"
        />
      </div>

      {/* Real-time Activity */}
      <RealtimeActivity />

      {/* Detailed Analytics */}
      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Performance Contenu</TabsTrigger>
          <TabsTrigger value="learning">Parcours d'apprentissage</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="retention">Rétention</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top Performers
                </CardTitle>
                <CardDescription>
                  Contenu le plus engageant par type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalyticsData.contentStats.topPerformers.map((item, index) => (
                    <ContentPerformanceCard key={index} item={item} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Répartition par type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Items EDN</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }} />
                      </div>
                      <span className="font-semibold">{mockAnalyticsData.contentStats.ednItems}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">Tracks Musicales</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '70%' }} />
                      </div>
                      <span className="font-semibold">{mockAnalyticsData.contentStats.musicTracks}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Scénarios ECOS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '40%' }} />
                      </div>
                      <span className="font-semibold">{mockAnalyticsData.contentStats.ecosScenarios}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Taux de complétion par spécialité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(mockAnalyticsData.learningPathways.completionRates).map(([specialty, rate]) => (
                    <div key={specialty} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium capitalize">{specialty}</span>
                        <span>{rate}%</span>
                      </div>
                      <Progress value={rate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Temps moyen par spécialité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(mockAnalyticsData.learningPathways.avgTimeSpent).map(([specialty, time]) => (
                    <div key={specialty} className="flex items-center justify-between">
                      <span className="font-medium capitalize">{specialty}</span>
                      <Badge variant="outline">{time}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <MetricCard
              icon={Users}
              title="Utilisateurs quotidiens"
              value={mockAnalyticsData.engagement.dailyActive.toLocaleString()}
              change="+5.2%"
              trend="up"
            />
            <MetricCard
              icon={Calendar}
              title="Sessions par utilisateur"
              value={mockAnalyticsData.engagement.avgSessionsPerUser.toString()}
              change="+0.3"
              trend="up"
            />
            <MetricCard
              icon={Eye}
              title="Taux de rebond"
              value={`${mockAnalyticsData.engagement.bounceRate}%`}
              change="-2.1%"
              trend="down"
            />
          </div>
        </TabsContent>

        <TabsContent value="retention">
          <Card>
            <CardHeader>
              <CardTitle>Courbes de rétention</CardTitle>
              <CardDescription>
                Analyse de la rétention utilisateur sur différentes périodes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                📊 Graphique de rétention interactive sera implémenté ici
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}