import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, Globe, Shield, Zap, AlertTriangle, CheckCircle, Ban, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface RateLimitRule {
  id: string;
  endpoint: string;
  limit: number;
  window: string;
  current: number;
  blocked: number;
  status: 'active' | 'warning' | 'exceeded';
}

interface ThreatDetection {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  count: number;
  lastDetected: string;
  blocked: boolean;
}

interface APIMetrics {
  totalRequests: number;
  blockedRequests: number;
  avgResponseTime: number;
  uptime: number;
  threatScore: number;
}

export const APISecurity: React.FC = () => {
  const [rateLimits, setRateLimits] = useState<RateLimitRule[]>([
    { id: '1', endpoint: '/api/auth/*', limit: 10, window: '1m', current: 7, blocked: 3, status: 'active' },
    { id: '2', endpoint: '/api/data/*', limit: 100, window: '1h', current: 82, blocked: 15, status: 'warning' },
    { id: '3', endpoint: '/api/upload/*', limit: 5, window: '5m', current: 3, blocked: 1, status: 'active' },
    { id: '4', endpoint: '/api/admin/*', limit: 20, window: '1h', current: 8, blocked: 0, status: 'active' }
  ]);

  const [threats, setThreats] = useState<ThreatDetection[]>([
    { id: '1', type: 'SQL Injection', severity: 'high', count: 23, lastDetected: '2 min ago', blocked: true },
    { id: '2', type: 'XSS Attack', severity: 'medium', count: 8, lastDetected: '15 min ago', blocked: true },
    { id: '3', type: 'CSRF', severity: 'medium', count: 5, lastDetected: '1h ago', blocked: true },
    { id: '4', type: 'Bot Traffic', severity: 'low', count: 156, lastDetected: '30s ago', blocked: true }
  ]);

  const [metrics, setMetrics] = useState<APIMetrics>({
    totalRequests: 847293,
    blockedRequests: 1847,
    avgResponseTime: 89,
    uptime: 99.97,
    threatScore: 15
  });

  const [corsSettings, setCorsSettings] = useState({
    enabled: true,
    origins: ['https://app.medicosage.com', 'https://admin.medicosage.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  });

  const [securityHeaders, setSecurityHeaders] = useState({
    hsts: true,
    csp: true,
    xFrameOptions: true,
    xContentTypeOptions: true,
    referrerPolicy: true
  });

  const updateRateLimit = (id: string, newLimit: number) => {
    setRateLimits(prev => 
      prev.map(rule => 
        rule.id === id ? { ...rule, limit: newLimit } : rule
      )
    );
    toast.success('Limite de débit mise à jour');
  };

  const blockThreat = (id: string) => {
    setThreats(prev => 
      prev.map(threat => 
        threat.id === id ? { ...threat, blocked: !threat.blocked } : threat
      )
    );
    toast.success('Configuration de menace mise à jour');
  };

  const generateSecurityReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      rateLimits,
      threats,
      recommendations: [
        'Toutes les API sont protégées par rate limiting',
        'Détection de menaces active et efficace',
        'Headers de sécurité correctement configurés',
        'CORS configuré de manière sécurisée'
      ]
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-security-report-${Date.now()}.json`;
    a.click();
    
    toast.success('Rapport de sécurité API généré');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8 text-blue-600" />
            API Security Center
          </h2>
          <p className="text-muted-foreground">Protection et surveillance avancée des API</p>
        </div>
        <Button onClick={generateSecurityReport}>
          <Shield className="h-4 w-4 mr-2" />
          Rapport Sécurité
        </Button>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Requêtes Total</p>
                <p className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bloquées</p>
                <p className="text-2xl font-bold text-red-600">{metrics.blockedRequests.toLocaleString()}</p>
              </div>
              <Ban className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Temps Réponse</p>
                <p className="text-2xl font-bold text-green-600">{metrics.avgResponseTime}ms</p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disponibilité</p>
                <p className="text-2xl font-bold text-green-600">{metrics.uptime}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score Menace</p>
                <p className="text-2xl font-bold text-green-600">{metrics.threatScore}/100</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ratelimit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ratelimit">Rate Limiting</TabsTrigger>
          <TabsTrigger value="threats">Menaces</TabsTrigger>
          <TabsTrigger value="cors">CORS & Headers</TabsTrigger>
        </TabsList>

        <TabsContent value="ratelimit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limiting Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rateLimits.map((rule) => (
                  <div key={rule.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{rule.endpoint}</h4>
                        <p className="text-sm text-muted-foreground">
                          {rule.limit} requêtes par {rule.window}
                        </p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(rule.status)}>
                        {rule.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Utilisation actuelle</span>
                        <span>{rule.current}/{rule.limit}</span>
                      </div>
                      <Progress value={(rule.current / rule.limit) * 100} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Bloquées: {rule.blocked}</span>
                        <span>{Math.round((rule.current / rule.limit) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Détection de Menaces</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threats.map((threat) => (
                  <div key={threat.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-5 w-5 ${threat.severity === 'high' ? 'text-red-500' : threat.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'}`} />
                      <div>
                        <h4 className="font-semibold">{threat.type}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(threat.severity)}>
                            {threat.severity}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {threat.count} détections - {threat.lastDetected}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={threat.blocked ? 'default' : 'destructive'}>
                        {threat.blocked ? 'Bloqué' : 'Autorisé'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => blockThreat(threat.id)}
                      >
                        {threat.blocked ? 'Débloquer' : 'Bloquer'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuration CORS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      CORS configuré de manière sécurisée avec origines spécifiques
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Origines Autorisées</h4>
                    {corsSettings.origins.map((origin, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {origin}
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Méthodes</h4>
                    <div className="flex gap-2 flex-wrap">
                      {corsSettings.methods.map((method, index) => (
                        <Badge key={index} variant="outline">{method}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Headers de Sécurité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">HSTS</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Content Security Policy</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">X-Frame-Options</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">X-Content-Type-Options</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Referrer Policy</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};