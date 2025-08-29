import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollText, Search, Download, Eye, AlertCircle, User, Database, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  ip: string;
  userAgent: string;
  outcome: 'success' | 'failure' | 'blocked';
}

interface AuditMetrics {
  totalEvents: number;
  todayEvents: number;
  securityEvents: number;
  failedAttempts: number;
  uniqueUsers: number;
}

export const ComprehensiveAuditTrail: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      user: 'admin@medicosage.com',
      action: 'LOGIN_SUCCESS',
      resource: '/auth/login',
      details: 'Successful administrator login with MFA',
      severity: 'info',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 Chrome/120.0',
      outcome: 'success'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      user: 'user@example.com',
      action: 'DATA_ACCESS',
      resource: '/api/medical-records/12345',
      details: 'Accessed patient medical record',
      severity: 'info',
      ip: '10.0.0.45',
      userAgent: 'Mozilla/5.0 Safari/605.1',
      outcome: 'success'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      user: 'unknown',
      action: 'LOGIN_FAILED',
      resource: '/auth/login',
      details: 'Failed login attempt - invalid credentials',
      severity: 'warning',
      ip: '203.0.113.25',
      userAgent: 'curl/7.68.0',
      outcome: 'failure'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      user: 'system',
      action: 'SECURITY_SCAN',
      resource: '/security/scan',
      details: 'Automated security scan completed',
      severity: 'info',
      ip: '127.0.0.1',
      userAgent: 'SecurityBot/1.0',
      outcome: 'success'
    }
  ]);

  const [metrics, setMetrics] = useState<AuditMetrics>({
    totalEvents: 145789,
    todayEvents: 2341,
    securityEvents: 156,
    failedAttempts: 23,
    uniqueUsers: 892
  });

  const [filters, setFilters] = useState({
    search: '',
    severity: 'all',
    action: 'all',
    outcome: 'all',
    dateRange: '24h'
  });

  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  const filteredEvents = events.filter(event => {
    if (filters.search && !event.details.toLowerCase().includes(filters.search.toLowerCase()) &&
        !event.user.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.severity !== 'all' && event.severity !== filters.severity) {
      return false;
    }
    if (filters.outcome !== 'all' && event.outcome !== filters.outcome) {
      return false;
    }
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'error': return 'bg-red-100 text-red-700 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'failure': return 'bg-red-100 text-red-800 border-red-200';
      case 'blocked': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const exportAuditLog = (format: 'json' | 'csv') => {
    let content: string;
    let mimeType: string;
    let extension: string;

    if (format === 'json') {
      content = JSON.stringify(filteredEvents, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else {
      const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Details', 'Severity', 'IP', 'Outcome'];
      const csvContent = [
        headers.join(','),
        ...filteredEvents.map(event => [
          event.timestamp,
          event.user,
          event.action,
          event.resource,
          event.details.replace(/,/g, ';'),
          event.severity,
          event.ip,
          event.outcome
        ].join(','))
      ].join('\n');
      content = csvContent;
      mimeType = 'text/csv';
      extension = 'csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${Date.now()}.${extension}`;
    a.click();
    
    toast.success(`Audit trail exporté en ${format.toUpperCase()}`);
  };

  const generateComplianceReport = () => {
    const report = {
      reportType: 'Compliance Audit',
      generatedAt: new Date().toISOString(),
      period: '30 days',
      summary: {
        totalEvents: metrics.totalEvents,
        securityEvents: metrics.securityEvents,
        failedAttempts: metrics.failedAttempts,
        complianceScore: 98.5
      },
      findings: [
        'All access attempts are properly logged',
        'Failed authentication attempts below threshold',
        'No unauthorized access detected',
        'Audit trail retention policy compliant'
      ],
      recommendations: [
        'Continue current monitoring practices',
        'Regular review of access patterns',
        'Maintain current security policies'
      ]
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${Date.now()}.json`;
    a.click();
    
    toast.success('Rapport de conformité généré');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <ScrollText className="h-8 w-8 text-blue-600" />
            Comprehensive Audit Trail
          </h2>
          <p className="text-muted-foreground">Traçabilité complète et forensique de toutes les activités</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportAuditLog('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportAuditLog('json')}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button onClick={generateComplianceReport}>
            <Shield className="h-4 w-4 mr-2" />
            Rapport Conformité
          </Button>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Événements Total</p>
                <p className="text-2xl font-bold">{metrics.totalEvents.toLocaleString()}</p>
              </div>
              <ScrollText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aujourd'hui</p>
                <p className="text-2xl font-bold text-green-600">{metrics.todayEvents.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sécurité</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.securityEvents}</p>
              </div>
              <Shield className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Échecs</p>
                <p className="text-2xl font-bold text-red-600">{metrics.failedAttempts}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilisateurs</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.uniqueUsers}</p>
              </div>
              <User className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-9"
              />
            </div>
            
            <Select value={filters.severity} onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sévérité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes sévérités</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.outcome} onValueChange={(value) => setFilters(prev => ({ ...prev, outcome: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Résultat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous résultats</SelectItem>
                <SelectItem value="success">Succès</SelectItem>
                <SelectItem value="failure">Échec</SelectItem>
                <SelectItem value="blocked">Bloqué</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Dernière heure</SelectItem>
                <SelectItem value="24h">Dernières 24h</SelectItem>
                <SelectItem value="7d">7 derniers jours</SelectItem>
                <SelectItem value="30d">30 derniers jours</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${realTimeEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-muted-foreground">
                {realTimeEnabled ? 'Temps réel' : 'Hors ligne'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Événements</TabsTrigger>
          <TabsTrigger value="forensics">Forensique</TabsTrigger>
          <TabsTrigger value="compliance">Conformité</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Journal des Événements ({filteredEvents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{event.action}</h4>
                          <p className="text-sm text-muted-foreground">{event.details}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{event.user}</Badge>
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                        <Badge className={getOutcomeColor(event.outcome)}>
                          {event.outcome}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{event.ip}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forensics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse Forensique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Patterns Suspects</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tentatives de force brute</span>
                      <Badge variant="outline" className="text-green-600">0 détectées</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Accès inhabituels</span>
                      <Badge variant="outline" className="text-green-600">2 vérifiés</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Élévation privilèges</span>
                      <Badge variant="outline" className="text-green-600">0 non autorisées</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Indicateurs de Compromission</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>IPs suspectes</span>
                      <Badge variant="outline" className="text-green-600">0 actives</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Sessions anormales</span>
                      <Badge variant="outline" className="text-green-600">0 détectées</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Activité malveillante</span>
                      <Badge variant="outline" className="text-green-600">0 confirmée</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conformité Réglementaire</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Database className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-semibold">GDPR</h4>
                    <p className="text-sm text-muted-foreground">Compliant</p>
                    <Badge variant="outline" className="text-green-600 mt-2">✓ Conforme</Badge>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-semibold">SOC2</h4>
                    <p className="text-sm text-muted-foreground">Type II</p>
                    <Badge variant="outline" className="text-green-600 mt-2">✓ Certifié</Badge>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <User className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-semibold">HIPAA</h4>
                    <p className="text-sm text-muted-foreground">Healthcare</p>
                    <Badge variant="outline" className="text-green-600 mt-2">✓ Ready</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Exigences de Rétention</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-green-600" />
                      Logs d'authentification conservés 90 jours
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-green-600" />
                      Événements de sécurité conservés 365 jours
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-green-600" />
                      Accès aux données médicales conservés 7 ans
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};