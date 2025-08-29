import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Music,
  Target,
  Award,
  Clock,
  Brain,
  Eye,
  Heart,
  Star,
  Download,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const metrics = [
    { id: 'users', title: 'Utilisateurs Actifs', value: '12,847', change: +18, icon: Users, color: 'text-blue-500' },
    { id: 'sessions', title: 'Sessions d\'Étude', value: '45,632', change: +25, icon: BookOpen, color: 'text-green-500' },
    { id: 'music', title: 'Musiques Générées', value: '3,421', change: +42, icon: Music, color: 'text-purple-500' },
    { id: 'quiz', title: 'Quiz Complétés', value: '18,965', change: +12, icon: Target, color: 'text-orange-500' },
    { id: 'time', title: 'Temps d\'Étude', value: '2,847h', change: +8, icon: Clock, color: 'text-red-500' },
    { id: 'success', title: 'Taux de Réussite', value: '87.3%', change: +5, icon: Award, color: 'text-yellow-500' }
  ];

  const learningData = [
    { month: 'Jan', users: 8500, sessions: 25000, success: 82 },
    { month: 'Fév', users: 9200, sessions: 28500, success: 84 },
    { month: 'Mar', users: 10100, sessions: 32000, success: 85 },
    { month: 'Avr', users: 11300, sessions: 35500, success: 86 },
    { month: 'Mai', users: 12100, sessions: 38000, success: 86 },
    { month: 'Juin', users: 12847, sessions: 45632, success: 87 }
  ];

  const subjectData = [
    { name: 'Cardiologie', value: 23, sessions: 1250 },
    { name: 'Neurologie', value: 18, sessions: 980 },
    { name: 'Pneumologie', value: 15, sessions: 820 },
    { name: 'Gastro-entérologie', value: 14, sessions: 760 },
    { name: 'Psychiatrie', value: 12, sessions: 650 },
    { name: 'Autres', value: 18, sessions: 975 }
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

  const progressData = [
    { subject: 'Items EDN', progress: 67, timeSpent: 145, accuracy: 89, rank: 1 },
    { subject: 'ECOS', progress: 23, timeSpent: 67, accuracy: 76, rank: 2 },
    { subject: 'Musique Médicale', progress: 89, timeSpent: 203, accuracy: 94, rank: 1 },
    { subject: 'Quiz Interactifs', progress: 78, timeSpent: 89, accuracy: 85, rank: 3 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center gap-3">
              <BarChart3 className="h-10 w-10" />
              Analytics Avancées
            </h1>
            <p className="text-muted-foreground">
              Analyses détaillées des performances et de l'engagement utilisateur
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 jours</SelectItem>
                <SelectItem value="30d">30 jours</SelectItem>
                <SelectItem value="90d">3 mois</SelectItem>
                <SelectItem value="1y">1 an</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </motion.div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <metric.icon className={`h-5 w-5 ${metric.color}`} />
                    <Badge variant={metric.change > 0 ? "default" : "destructive"}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {metric.title}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Croissance des Utilisateurs</CardTitle>
              <CardDescription>Évolution mensuelle des utilisateurs actifs</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={learningData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition par Spécialité</CardTitle>
              <CardDescription>Sessions d'étude par domaine médical</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Learning Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {progressData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.subject}</CardTitle>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      #{item.rank}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progression</span>
                      <span>{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{item.timeSpent}h étudiées</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span>{item.accuracy}% précision</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Pages Vues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">2.4M</div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                +32% ce mois
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Durée Moyenne
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">24m 35s</div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                +18% ce mois
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">4.7/5</div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                +0.3 ce mois
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}