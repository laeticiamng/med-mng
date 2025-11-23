import logger from '@/lib/logger';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { AlertTriangle, Activity, RefreshCw, Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MonitoringIncident {
  id: string;
  incident_type: 'error' | 'warning' | 'critical';
  service_name: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'investigating';
  details: Record<string, any>;
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
}

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  lastCheck: string;
  errorMessage?: string;
}

export const MonitoringDashboard = () => {
  const [incidents, setIncidents] = useState<MonitoringIncident[]>([]);
  const [healthResults, setHealthResults] = useState<HealthCheckResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unhealthy': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const runHealthChecks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('monitoring-alerts', {
        body: { action: 'health_check' }
      });

      if (error) throw error;

      setHealthResults(data.results || []);
      toast.success('Health checks completed');
    } catch (error) {
      logger.error('Health check failed:', error);
      toast.error('Failed to run health checks');
    } finally {
      setLoading(false);
      setLastUpdate(new Date());
    }
  };

  const fetchIncidents = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('monitoring-alerts', {
        body: { action: 'get_incidents' }
      });

      if (error) throw error;

      setIncidents(data.incidents || []);
    } catch (error) {
      logger.error('Failed to fetch incidents:', error);
      toast.error('Failed to fetch incidents');
    }
  };

  const resolveIncident = async (incidentId: string, notes: string) => {
    try {
      const { error } = await supabase.functions.invoke('monitoring-alerts', {
        body: { 
          action: 'resolve_incident',
          incident_id: incidentId,
          resolution_notes: notes
        }
      });

      if (error) throw error;

      toast.success('Incident resolved');
      fetchIncidents();
    } catch (error) {
      logger.error('Failed to resolve incident:', error);
      toast.error('Failed to resolve incident');
    }
  };

  const sendTestAlert = async () => {
    try {
      const { error } = await supabase.functions.invoke('monitoring-alerts', {
        body: { 
          action: 'send_alert',
          type: 'warning',
          service: 'Test Service',
          message: 'Test alert from monitoring dashboard',
          severity: 'medium'
        }
      });

      if (error) throw error;

      toast.success('Test alert sent');
      fetchIncidents();
    } catch (error) {
      logger.error('Failed to send test alert:', error);
      toast.error('Failed to send test alert');
    }
  };

  useEffect(() => {
    runHealthChecks();
    fetchIncidents();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      runHealthChecks();
      fetchIncidents();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const criticalIncidents = incidents.filter(i => i.severity === 'critical' && i.status === 'active');
  const activeIncidents = incidents.filter(i => i.status === 'active');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Monitoring & Alerting</h2>
          <p className="text-muted-foreground">
            Système de surveillance temps réel et gestion d'incidents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={runHealthChecks} 
            disabled={loading}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button 
            onClick={sendTestAlert} 
            variant="outline"
            size="sm"
          >
            Test Alert
          </Button>
        </div>
      </div>

      {criticalIncidents.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {criticalIncidents.length} incident{criticalIncidents.length > 1 ? 's' : ''} critique{criticalIncidents.length > 1 ? 's' : ''} nécessite{criticalIncidents.length > 1 ? 'nt' : ''} une attention immédiate.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services actifs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthResults.filter(r => r.status === 'healthy').length}/{healthResults.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidents actifs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {activeIncidents.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critiques</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">
              {criticalIncidents.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dernière MAJ</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {lastUpdate.toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="health" className="space-y-4">
        <TabsList>
          <TabsTrigger value="health">Health Checks</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="alerts">Historique Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>État des Services</CardTitle>
              <CardDescription>
                Surveillance temps réel des APIs critiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthResults.map((result) => (
                  <div 
                    key={result.service}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium">{result.service}</div>
                        <div className="text-sm text-muted-foreground">
                          Temps de réponse: {result.responseTime}ms
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={result.status === 'healthy' ? 'default' : 'destructive'}>
                        {result.status}
                      </Badge>
                      {result.errorMessage && (
                        <div className="text-xs text-red-500 mt-1">
                          {result.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incidents Actifs</CardTitle>
              <CardDescription>
                Incidents nécessitant une intervention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeIncidents.map((incident) => (
                  <div 
                    key={incident.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(incident.severity)}>
                          {incident.severity}
                        </Badge>
                        <span className="font-medium">{incident.service_name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(incident.created_at).toLocaleString()}
                      </div>
                    </div>
                    <p className="text-sm">{incident.message}</p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => resolveIncident(incident.id, 'Resolved manually')}
                      >
                        Résoudre
                      </Button>
                    </div>
                  </div>
                ))}
                {activeIncidents.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun incident actif
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Incidents</CardTitle>
              <CardDescription>
                Tous les incidents récents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents.slice(0, 20).map((incident) => (
                  <div 
                    key={incident.id}
                    className={`p-4 border rounded-lg ${incident.status === 'resolved' ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(incident.severity)}>
                          {incident.severity}
                        </Badge>
                        <span className="font-medium">{incident.service_name}</span>
                        <Badge variant="outline">{incident.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(incident.created_at).toLocaleString()}
                      </div>
                    </div>
                    <p className="text-sm mt-2">{incident.message}</p>
                    {incident.resolution_notes && (
                      <p className="text-xs text-green-600 mt-1">
                        Résolution: {incident.resolution_notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};