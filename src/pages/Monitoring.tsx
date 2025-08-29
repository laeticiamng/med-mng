import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  Cpu, 
  MemoryStick, 
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Monitor,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Monitoring() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const systemMetrics = [
    { id: 'cpu', name: 'CPU Usage', value: 34, unit: '%', status: 'good', change: -5, icon: Cpu },
    { id: 'memory', name: 'Memory', value: 67, unit: '%', status: 'warning', change: +12, icon: MemoryStick },
    { id: 'users', name: 'Active Users', value: 1247, unit: '', status: 'good', change: +8, icon: Users },
    { id: 'database', name: 'DB Queries/s', value: 89, unit: '/s', status: 'warning', change: +45, icon: Database }
  ];

  const services = [
    { id: 'api', name: 'API Gateway', status: 'online', uptime: '99.97%', responseTime: 125 },
    { id: 'database', name: 'Supabase DB', status: 'online', uptime: '99.99%', responseTime: 45 },
    { id: 'storage', name: 'File Storage', status: 'online', uptime: '99.95%', responseTime: 89 },
    { id: 'auth', name: 'Authentication', status: 'online', uptime: '99.98%', responseTime: 67 },
    { id: 'cdn', name: 'CDN Network', status: 'maintenance', uptime: '99.93%', responseTime: 234 },
    { id: 'backup', name: 'Backup Service', status: 'online', uptime: '99.89%', responseTime: 156 }
  ];

  const performanceData = [
    { time: '00:00', cpu: 35, memory: 62, users: 1180 },
    { time: '04:00', cpu: 28, memory: 58, users: 890 },
    { time: '08:00', cpu: 42, memory: 71, users: 1450 },
    { time: '12:00', cpu: 38, memory: 69, users: 1620 },
    { time: '16:00', cpu: 45, memory: 74, users: 1580 },
    { time: '20:00', cpu: 34, memory: 67, users: 1247 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'online': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical':
      case 'offline': return 'text-red-500';
      case 'maintenance': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
      case 'online': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical':
      case 'offline': return XCircle;
      case 'maintenance': return Clock;
      default: return CheckCircle;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center gap-3">
              <Monitor className="h-10 w-10" />
              Monitoring Temps Réel
            </h1>
            <p className="text-muted-foreground">
              Surveillance continue des performances et de la santé du système
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Dernière mise à jour</p>
              <p className="font-mono text-sm">{currentTime.toLocaleTimeString()}</p>
            </div>
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </motion.div>

        {/* System Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {systemMetrics.map((metric, index) => {
            const StatusIcon = getStatusIcon(metric.status);
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="relative overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <metric.icon className="h-5 w-5 text-primary" />
                      <StatusIcon className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">
                        {metric.value.toLocaleString()}{metric.unit}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {metric.name}
                      </p>
                      <div className="flex items-center gap-1">
                        {metric.change > 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span className={`text-xs ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {metric.change > 0 ? '+' : ''}{metric.change}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Services Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, index) => {
            const StatusIcon = getStatusIcon(service.status);
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <StatusIcon className={`h-5 w-5 ${getStatusColor(service.status)}`} />
                    </div>
                    <Badge className={
                      service.status === 'online' ? 'bg-green-100 text-green-800' :
                      service.status === 'maintenance' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {service.status}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Uptime</span>
                      <span className="font-medium">{service.uptime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Response</span>
                      <span className="font-medium">{service.responseTime}ms</span>
                    </div>
                    <Progress 
                      value={parseFloat(service.uptime)} 
                      className="h-2"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Performance Charts */}
        <Card>
          <CardHeader>
            <CardTitle>Performance en Temps Réel</CardTitle>
            <CardDescription>Métriques système sur les dernières 24 heures</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="cpu" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="CPU %"
                />
                <Line 
                  type="monotone" 
                  dataKey="memory" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="Memory %"
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  name="Active Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}