/**
 * Sessions Analytics Page
 * Analytics and insights for user study/focus/meditation sessions
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Clock,
  TrendingUp,
  Calendar,
  Target,
  Activity,
  BookOpen,
  Focus,
  Brain,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock data - replace with actual data from database
const sessionsData = {
  totalSessions: 127,
  totalMinutes: 3845,
  averageSessionLength: 30,
  longestStreak: 12,
  currentStreak: 5,
  mostProductiveDay: 'Mardi',
  sessionTypes: [
    { name: 'Étude', value: 65, color: '#3b82f6' },
    { name: 'Focus', value: 42, color: '#8b5cf6' },
    { name: 'Méditation', value: 20, color: '#10b981' },
  ],
  weeklyData: [
    { day: 'Lun', study: 45, focus: 30, meditation: 15 },
    { day: 'Mar', study: 60, focus: 40, meditation: 20 },
    { day: 'Mer', study: 50, focus: 35, meditation: 10 },
    { day: 'Jeu', study: 55, focus: 45, meditation: 25 },
    { day: 'Ven', study: 40, focus: 30, meditation: 15 },
    { day: 'Sam', study: 70, focus: 20, meditation: 30 },
    { day: 'Dim', study: 35, focus: 25, meditation: 40 },
  ],
  monthlyTrend: [
    { month: 'Jan', minutes: 520 },
    { month: 'Fév', minutes: 680 },
    { month: 'Mar', minutes: 750 },
    { month: 'Avr', minutes: 890 },
    { month: 'Mai', minutes: 920 },
    { month: 'Juin', minutes: 1085 },
  ],
  timeDistribution: [
    { hour: '6h-9h', sessions: 15 },
    { hour: '9h-12h', sessions: 35 },
    { hour: '12h-15h', sessions: 20 },
    { hour: '15h-18h', sessions: 30 },
    { hour: '18h-21h', sessions: 20 },
    { hour: '21h-24h', sessions: 7 },
  ],
};

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
};

export const SessionsAnalytics: React.FC = () => {
  const totalHours = Math.floor(sessionsData.totalMinutes / 60);

  return (
    <div className="container max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Activity className="h-8 w-8 text-purple-600" />
          Analytics des Sessions
        </h1>
        <p className="text-muted-foreground">
          Insights détaillés sur vos sessions d'étude, de focus et de méditation
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sessions Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-3xl font-bold">{sessionsData.totalSessions}</div>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Temps Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-3xl font-bold">{totalHours}h</div>
                <p className="text-xs text-muted-foreground">{formatTime(sessionsData.totalMinutes)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Durée Moyenne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-3xl font-bold">{sessionsData.averageSessionLength}</div>
                <p className="text-xs text-muted-foreground">minutes/session</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-3xl font-bold">{sessionsData.currentStreak}</div>
                <p className="text-xs text-muted-foreground">
                  Record: {sessionsData.longestStreak} jours
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="weekly" className="space-y-6">
        <TabsList>
          <TabsTrigger value="weekly">Vue Hebdomadaire</TabsTrigger>
          <TabsTrigger value="monthly">Tendance Mensuelle</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        {/* Weekly View */}
        <TabsContent value="weekly" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Session Types Pie Chart */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Types de Sessions</CardTitle>
                <CardDescription>Répartition par type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={sessionsData.sessionTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sessionsData.sessionTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {sessionsData.sessionTypes.map((type) => (
                    <div key={type.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                        <span className="text-sm">{type.name}</span>
                      </div>
                      <Badge variant="outline">{type.value} sessions</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Bar Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Sessions Hebdomadaires</CardTitle>
                <CardDescription>Minutes par type de session</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sessionsData.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="study" fill="#3b82f6" name="Étude" />
                    <Bar dataKey="focus" fill="#8b5cf6" name="Focus" />
                    <Bar dataKey="meditation" fill="#10b981" name="Méditation" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monthly Trend */}
        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Tendance Mensuelle</CardTitle>
              <CardDescription>Évolution du temps total passé</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={sessionsData.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="minutes"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Minutes totales"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Distribution */}
        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Distribution Horaire</CardTitle>
              <CardDescription>Nombre de sessions par plage horaire</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={sessionsData.timeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis label={{ value: 'Sessions', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="sessions" fill="#3b82f6" name="Sessions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Insights & Recommandations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Tendance positive</p>
              <p className="text-sm text-blue-700">
                Votre temps d'étude a augmenté de 18% ce mois-ci par rapport au mois dernier
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <Calendar className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-medium text-purple-900">Jour le plus productif</p>
              <p className="text-sm text-purple-700">
                {sessionsData.mostProductiveDay} est votre jour le plus productif avec une moyenne
                de 90 minutes
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <Focus className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">Sessions de focus optimales</p>
              <p className="text-sm text-green-700">
                Vos sessions de focus entre 9h-12h sont 25% plus efficaces
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionsAnalytics;
