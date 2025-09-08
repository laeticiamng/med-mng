import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Music, 
  Clock, 
  Target,
  Heart,
  Brain,
  Headphones,
  Star
} from 'lucide-react';

// ===============================================
// ANALYTICS AVANCÉS - PLATEFORME MÉDICALE
// ===============================================

interface AnalyticsData {
  userEngagement: {
    totalUsers: number;
    activeUsers: number;
    retentionRate: number;
    averageSessionTime: number;
  };
  musicGeneration: {
    totalGenerated: number;
    successRate: number;
    averageGenerationTime: number;
    popularStyles: string[];
  };
  learning: {
    completionRate: number;
    averageScore: number;
    improvementRate: number;
    topPerformingItems: string[];
  };
  platform: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    satisfaction: number;
  };
}

const AdvancedAnalytics: React.FC = () => {
  const [analyticsData] = useState<AnalyticsData>({
    userEngagement: {
      totalUsers: 12847,
      activeUsers: 8423,
      retentionRate: 87.3,
      averageSessionTime: 24.5
    },
    musicGeneration: {
      totalGenerated: 45672,
      successRate: 98.7,
      averageGenerationTime: 127,
      popularStyles: ['Trap Médical', 'Pop Éducative', 'Jazz Clinique', 'Lo-Fi Study']
    },
    learning: {
      completionRate: 94.2,
      averageScore: 87.8,
      improvementRate: 23.4,
      topPerformingItems: ['IC-230', 'IC-103', 'IC-156', 'IC-089']
    },
    platform: {
      uptime: 99.97,
      responseTime: 1.2,
      errorRate: 0.03,
      satisfaction: 4.8
    }
  });

  const MetricCard: React.FC<{
    title: string;
    value: string;
    change: number;
    icon: any;
    color: string;
  }> = ({ title, value, change, icon: Icon, color }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <div className="flex items-center mt-2">
              <TrendingUp className={`h-4 w-4 mr-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{change}% ce mois
              </span>
            </div>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Avancés</h2>
          <p className="text-muted-foreground">
            Analyse complète des performances de la plateforme médicale
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
          Temps réel
        </Badge>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Utilisateurs Actifs"
          value={analyticsData.userEngagement.activeUsers.toLocaleString()}
          change={12}
          icon={Users}
          color="bg-blue-500"
        />
        <MetricCard
          title="Musiques Générées"
          value={analyticsData.musicGeneration.totalGenerated.toLocaleString()}
          change={8}
          icon={Music}
          color="bg-purple-500"
        />
        <MetricCard
          title="Taux de Réussite"
          value={`${analyticsData.musicGeneration.successRate}%`}
          change={2.3}
          icon={Target}
          color="bg-green-500"
        />
        <MetricCard
          title="Satisfaction"
          value={`${analyticsData.platform.satisfaction}/5`}
          change={5.2}
          icon={Heart}
          color="bg-pink-500"
        />
      </div>

      {/* Graphiques détaillés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Utilisateur */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Engagement Utilisateur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Taux de Rétention</span>
                  <span className="font-medium">{analyticsData.userEngagement.retentionRate}%</span>
                </div>
                <Progress value={analyticsData.userEngagement.retentionRate} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Temps Moyen de Session</span>
                  <span className="font-medium">{analyticsData.userEngagement.averageSessionTime}min</span>
                </div>
                <Progress value={(analyticsData.userEngagement.averageSessionTime / 60) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Utilisateurs Actifs</span>
                  <span className="font-medium">
                    {Math.round((analyticsData.userEngagement.activeUsers / analyticsData.userEngagement.totalUsers) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(analyticsData.userEngagement.activeUsers / analyticsData.userEngagement.totalUsers) * 100} 
                  className="h-2" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Apprentissage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-green-600" />
              Performance Apprentissage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Taux de Completion</span>
                  <span className="font-medium">{analyticsData.learning.completionRate}%</span>
                </div>
                <Progress value={analyticsData.learning.completionRate} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Score Moyen</span>
                  <span className="font-medium">{analyticsData.learning.averageScore}%</span>
                </div>
                <Progress value={analyticsData.learning.averageScore} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Taux d'Amélioration</span>
                  <span className="font-medium">{analyticsData.learning.improvementRate}%</span>
                </div>
                <Progress value={analyticsData.learning.improvementRate} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informations détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Styles Populaires */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-purple-600" />
              Styles Populaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.musicGeneration.popularStyles.map((style, index) => (
                <div key={style} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span className="text-sm">{style}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {95 - index * 8}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Items Performants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Items Top Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.learning.topPerformingItems.map((item, index) => (
                <div key={item} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {98 - index * 2}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Santé Plateforme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Santé Plateforme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Uptime</span>
                <span className="text-sm font-bold text-green-600">{analyticsData.platform.uptime}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Temps de Réponse</span>
                <span className="text-sm font-bold">{analyticsData.platform.responseTime}s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Taux d'Erreur</span>
                <span className="text-sm font-bold text-green-600">{analyticsData.platform.errorRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Score Santé Global</span>
                <Badge className="bg-green-500 text-white">Excellent</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;