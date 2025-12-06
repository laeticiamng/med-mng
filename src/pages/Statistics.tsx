import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  Users,
  BookOpen,
  Music,
  TrendingUp,
  Clock,
  Target,
  Award,
  Activity
} from 'lucide-react';

// Couleurs sémantiques pour les graphiques (compatibles avec le design system)
const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  destructive: 'hsl(var(--destructive))',
  muted: 'hsl(var(--muted-foreground))',
  chart1: 'hsl(var(--chart-1))',
  chart2: 'hsl(var(--chart-2))',
  chart3: 'hsl(var(--chart-3))',
  chart4: 'hsl(var(--chart-4))',
  chart5: 'hsl(var(--chart-5))',
};

const Statistics = () => {
  // Données simulées pour les statistiques
  const globalStats = {
    totalUsers: 15847,
    activeItems: 367,
    generatedSongs: 8432,
    completionRate: 78.5,
    averageSessionTime: 24,
    successRate: 92.3
  };

  const usageData = [
    { name: 'Jan', edn: 1200, music: 800, quiz: 950 },
    { name: 'Fév', edn: 1100, music: 900, quiz: 1100 },
    { name: 'Mar', edn: 1300, music: 1200, quiz: 1050 },
    { name: 'Avr', edn: 1400, music: 1100, quiz: 1200 },
    { name: 'Mai', edn: 1600, music: 1400, quiz: 1300 },
    { name: 'Jun', edn: 1500, music: 1300, quiz: 1250 }
  ];

  const specialtyData = [
    { name: 'Cardiologie', value: 25, color: CHART_COLORS.chart1 },
    { name: 'Neurologie', value: 20, color: CHART_COLORS.chart2 },
    { name: 'Pédiatrie', value: 18, color: CHART_COLORS.chart3 },
    { name: 'Gynécologie', value: 15, color: CHART_COLORS.chart4 },
    { name: 'Psychiatrie', value: 12, color: CHART_COLORS.chart5 },
    { name: 'Autres', value: 10, color: CHART_COLORS.muted }
  ];

  const performanceData = [
    { month: 'Jan', score: 75 },
    { month: 'Fév', score: 78 },
    { month: 'Mar', score: 82 },
    { month: 'Avr', score: 85 },
    { month: 'Mai', score: 88 },
    { month: 'Jun', score: 92 }
  ];

  return (
    <>
      <Helmet>
        <title>Statistiques Globales | MED-MNG</title>
        <meta name="description" content="Tableaux de bord et statistiques d'utilisation de la plateforme MED-MNG" />
      </Helmet>

      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Statistiques Globales</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Analyse complète de l'utilisation et des performances de la plateforme MED-MNG
          </p>
        </div>

        {/* Métriques Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% par rapport au mois dernier</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items EDN Actifs</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats.activeItems}</div>
              <p className="text-xs text-muted-foreground">+5 nouveaux cette semaine</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Musiques Générées</CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats.generatedSongs.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+8% cette semaine</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats.successRate}%</div>
              <p className="text-xs text-muted-foreground">+2.1% ce mois</p>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques Principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Utilisation Mensuelle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Utilisation Mensuelle
              </CardTitle>
              <CardDescription>
                Évolution de l'utilisation par module
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="edn" fill={CHART_COLORS.chart1} name="EDN" />
                  <Bar dataKey="music" fill={CHART_COLORS.chart2} name="Musique" />
                  <Bar dataKey="quiz" fill={CHART_COLORS.chart3} name="Quiz" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Répartition par Spécialité */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Répartition par Spécialité
              </CardTitle>
              <CardDescription>
                Distribution des utilisateurs par domaine médical
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={specialtyData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill={CHART_COLORS.chart1}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {specialtyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Globale */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Performance Globale
              </CardTitle>
              <CardDescription>
                Évolution des scores moyens des utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={CHART_COLORS.chart1}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.chart1, strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Indicateurs de Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Indicateurs Clés
              </CardTitle>
              <CardDescription>
                Métriques de performance et d'engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Taux de Complétion</span>
                  <Badge variant="secondary">{globalStats.completionRate}%</Badge>
                </div>
                <Progress value={globalStats.completionRate} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Temps de Session Moyen</span>
                  <Badge variant="secondary">{globalStats.averageSessionTime} min</Badge>
                </div>
                <Progress value={(globalStats.averageSessionTime / 60) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Engagement Utilisateur</span>
                  <Badge variant="secondary">87%</Badge>
                </div>
                <Progress value={87} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Satisfaction</span>
                  <Badge variant="secondary">4.6/5</Badge>
                </div>
                <Progress value={92} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Résumé des Tendances */}
        <Card>
          <CardHeader>
            <CardTitle>Tendances et Insights</CardTitle>
            <CardDescription>
              Analyse des tendances d'utilisation et recommandations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-success mb-2">📈 Croissance Positive</h3>
                <p className="text-sm text-muted-foreground">
                  L'utilisation des modules EDN a augmenté de 15% ce mois, 
                  avec une forte adoption en cardiologie et neurologie.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-primary mb-2">🎵 Innovation Musicale</h3>
                <p className="text-sm text-muted-foreground">
                  Les musiques mnémotechniques génèrent 40% d'amélioration 
                  des scores de mémorisation comparé aux méthodes traditionnelles.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-accent mb-2">🎯 Objectifs Atteints</h3>
                <p className="text-sm text-muted-foreground">
                  92% des utilisateurs atteignent leurs objectifs d'apprentissage 
                  grâce à l'approche multimodale de la plateforme.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Statistics;