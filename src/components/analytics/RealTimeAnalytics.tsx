import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Music, 
  BookOpen, 
  Activity, 
  Globe, 
  Clock, 
  Target,
  Zap,
  Eye,
  Heart,
  Share2,
  Download,
  AlertCircle,
  CheckCircle2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface MetricData {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
  color: string;
  description: string;
}

interface ActivityEvent {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: Date;
  type: 'generation' | 'learning' | 'collaboration' | 'export';
  success: boolean;
}

interface UsageData {
  time: string;
  users: number;
  generations: number;
  studies: number;
}

export const RealTimeAnalytics: React.FC = () => {
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Données simulées en temps réel
  const [metrics, setMetrics] = useState<MetricData[]>([
    {
      id: '1',
      name: 'Utilisateurs actifs',
      value: 1247,
      previousValue: 1198,
      change: 4.1,
      changeType: 'positive',
      icon: Users,
      color: 'text-blue-600',
      description: 'Utilisateurs connectés maintenant'
    },
    {
      id: '2',
      name: 'Générations musicales',
      value: 89,
      previousValue: 76,
      change: 17.1,
      changeType: 'positive',
      icon: Music,
      color: 'text-purple-600',
      description: 'Nouvelles chansons créées aujourd\'hui'
    },
    {
      id: '3',
      name: 'Sessions d\'étude',
      value: 567,
      previousValue: 623,
      change: -9.0,
      changeType: 'negative',
      icon: BookOpen,
      color: 'text-green-600',
      description: 'Sessions EDN actives'
    },
    {
      id: '4',
      name: 'Taux d\'engagement',
      value: 73,
      previousValue: 68,
      change: 7.4,
      changeType: 'positive',
      icon: Target,
      color: 'text-orange-600',
      description: 'Pourcentage d\'utilisateurs actifs'
    }
  ]);

  const [recentActivity] = useState<ActivityEvent[]>([
    {
      id: '1',
      user: 'Marie D.',
      action: 'Généré une chanson',
      target: 'IC-230 Insuffisance cardiaque',
      timestamp: new Date(Date.now() - 2000),
      type: 'generation',
      success: true
    },
    {
      id: '2', 
      user: 'Jean M.',
      action: 'Complété étude',
      target: 'IC-091 Déficit neurologique',
      timestamp: new Date(Date.now() - 8000),
      type: 'learning',
      success: true
    },
    {
      id: '3',
      user: 'Sophie L.',
      action: 'Partagé création',
      target: 'Playlist Cardiologie',
      timestamp: new Date(Date.now() - 15000),
      type: 'collaboration',
      success: true
    },
    {
      id: '4',
      user: 'Pierre D.',
      action: 'Exporté données',
      target: 'Rapport mensuel',
      timestamp: new Date(Date.now() - 30000),
      type: 'export',
      success: false
    }
  ]);

  const usageData: UsageData[] = [
    { time: '14:00', users: 45, generations: 12, studies: 34 },
    { time: '14:15', users: 52, generations: 8, studies: 28 },
    { time: '14:30', users: 61, generations: 15, studies: 42 },
    { time: '14:45', users: 58, generations: 19, studies: 38 },
    { time: '15:00', users: 67, generations: 11, studies: 51 },
    { time: '15:15', users: 73, generations: 23, studies: 46 },
    { time: '15:30', users: 69, generations: 17, studies: 39 }
  ];

  const deviceData = [
    { name: 'Desktop', value: 45, color: '#8B5CF6' },
    { name: 'Mobile', value: 35, color: '#06B6D4' },
    { name: 'Tablet', value: 20, color: '#10B981' }
  ];

  const contentPopularity = [
    { name: 'Cardiologie', value: 892, category: 'medical' },
    { name: 'Neurologie', value: 756, category: 'medical' },
    { name: 'Pneumologie', value: 634, category: 'medical' },
    { name: 'Urgences', value: 578, category: 'medical' },
    { name: 'Pédiatrie', value: 445, category: 'medical' }
  ];

  // Simulation de mise à jour en temps réel
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        previousValue: metric.value,
        value: metric.value + Math.floor(Math.random() * 10) - 5,
        change: Math.random() * 20 - 10
      })));
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'positive': return <ArrowUp className="h-3 w-3 text-green-500" />;
      case 'negative': return <ArrowDown className="h-3 w-3 text-red-500" />;
      default: return null;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'generation': return <Music className="h-4 w-4 text-purple-400" />;
      case 'learning': return <BookOpen className="h-4 w-4 text-green-400" />;
      case 'collaboration': return <Users className="h-4 w-4 text-blue-400" />;
      case 'export': return <Download className="h-4 w-4 text-orange-400" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const seconds = Math.floor((new Date().getTime() - timestamp.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header de contrôle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-white font-medium">
              {isLive ? 'Temps réel' : 'Pausé'}
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className={`${isLive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
          >
            {isLive ? 'Pause' : 'Reprendre'}
          </Button>
        </div>
        <div className="text-sm text-gray-400">
          Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id} className="bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
                <div className="flex items-center gap-1">
                  {getChangeIcon(metric.changeType)}
                  <span className={`text-xs font-medium ${
                    metric.changeType === 'positive' ? 'text-green-400' : 
                    metric.changeType === 'negative' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {metric.value.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">{metric.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique d'utilisation */}
        <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Activité en Temps Réel
            </CardTitle>
            <CardDescription className="text-gray-300">
              Utilisateurs et actions des 2 dernières heures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stackId="1" 
                  stroke="#3B82F6" 
                  fill="rgba(59, 130, 246, 0.3)" 
                  name="Utilisateurs"
                />
                <Area 
                  type="monotone" 
                  dataKey="generations" 
                  stackId="1" 
                  stroke="#8B5CF6" 
                  fill="rgba(139, 92, 246, 0.3)" 
                  name="Générations"
                />
                <Area 
                  type="monotone" 
                  dataKey="studies" 
                  stackId="1" 
                  stroke="#10B981" 
                  fill="rgba(16, 185, 129, 0.3)" 
                  name="Études"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-400" />
              Flux d'Activité
            </CardTitle>
            <CardDescription className="text-gray-300">
              Actions des utilisateurs en direct
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivity.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2">
                    {getActivityIcon(event.type)}
                    {event.success ? 
                      <CheckCircle2 className="h-3 w-3 text-green-400" /> :
                      <AlertCircle className="h-3 w-3 text-red-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">
                      <span className="font-medium">{event.user}</span> {event.action}
                    </p>
                    <p className="text-gray-400 text-xs truncate">{event.target}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTimeAgo(event.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Répartition des appareils */}
        <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-cyan-400" />
              Appareils
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {deviceData.map((device) => (
                <div key={device.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: device.color }}
                    ></div>
                    <span className="text-white text-sm">{device.name}</span>
                  </div>
                  <span className="text-gray-400 text-sm">{device.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contenu populaire */}
        <Card className="lg:col-span-2 bg-black/20 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-400" />
              Contenu Populaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={contentPopularity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alertes système */}
      <Card className="bg-black/20 backdrop-blur-sm border border-yellow-400/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Alertes Système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-400/30">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-white font-medium">Charge serveur élevée</p>
                  <p className="text-yellow-300 text-sm">CPU à 85% - Génération musicale ralentie</p>
                </div>
              </div>
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
                Attention
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-400/30">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-white font-medium">Mise à jour déployée</p>
                  <p className="text-blue-300 text-sm">Nouvelles fonctionnalités analytics disponibles</p>
                </div>
              </div>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                Info
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};