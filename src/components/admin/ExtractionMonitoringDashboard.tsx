import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Clock, PlayCircle, RefreshCw, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ExtractionLog {
  id: string;
  batch_id: string;
  batch_type: string;
  status: string;
  progress_percentage: number;
  total_items: number;
  processed_items: number;
  failed_items: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  updated_at: string;
}

interface ExtractionEvent {
  id: string;
  event_type: string;
  event_message: string;
  event_data: any;
  item_reference?: string;
  created_at: string;
}

interface ExtractionStats {
  total_extractions: number;
  recent_extractions_7d: number;
  running_extractions: number;
  success_rate_7d: number;
  failed_extractions_7d: number;
}

export function ExtractionMonitoringDashboard() {
  const [stats, setStats] = useState<ExtractionStats | null>(null);
  const [recentExtractions, setRecentExtractions] = useState<ExtractionLog[]>([]);
  const [runningExtractions, setRunningExtractions] = useState<ExtractionLog[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [batchEvents, setBatchEvents] = useState<ExtractionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, recentRes, runningRes] = await Promise.all([
        supabase.functions.invoke('extraction-monitoring', {
          body: { action: 'get_stats' }
        }),
        supabase.functions.invoke('extraction-monitoring', {
          body: { action: 'get_recent' }
        }),
        supabase.functions.invoke('extraction-monitoring', {
          body: { action: 'get_running' }
        })
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (recentRes.data?.success) setRecentExtractions(recentRes.data.data);
      if (runningRes.data?.success) setRunningExtractions(runningRes.data.data);
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchEvents = async (batchId: string) => {
    try {
      const response = await supabase.functions.invoke('extraction-monitoring', {
        body: { action: 'get_events', batch_id: batchId }
      });

      if (response.data?.success) {
        setBatchEvents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching batch events:', error);
      toast.error('Erreur lors du chargement des événements');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchBatchEvents(selectedBatch);
    }
  }, [selectedBatch]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-primary';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-destructive';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <PlayCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      case 'paused': return <Clock className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h${mins}min`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoring des Extractions</h1>
          <p className="text-muted-foreground">
            Suivi en temps réel des extractions batch (OIC, EDN, ECOS)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </Button>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Extractions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_extractions}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.running_extractions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">7 derniers jours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recent_extractions_7d}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(stats.success_rate_7d)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Échecs (7j)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failed_extractions_7d}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="running" className="space-y-4">
        <TabsList>
          <TabsTrigger value="running">En Cours ({runningExtractions.length})</TabsTrigger>
          <TabsTrigger value="recent">Récentes ({recentExtractions.length})</TabsTrigger>
          <TabsTrigger value="events">Événements</TabsTrigger>
        </TabsList>

        <TabsContent value="running" className="space-y-4">
          {runningExtractions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  Aucune extraction en cours
                </div>
              </CardContent>
            </Card>
          ) : (
            runningExtractions.map((extraction) => (
              <Card key={extraction.id} className="cursor-pointer hover:bg-accent/50"
                    onClick={() => setSelectedBatch(extraction.batch_id)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(extraction.status)}
                      <CardTitle className="text-lg">{extraction.batch_id}</CardTitle>
                      <Badge variant="secondary">{extraction.batch_type}</Badge>
                      <Badge className={getStatusColor(extraction.status)}>
                        {extraction.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Démarré: {new Date(extraction.started_at).toLocaleString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progression: {extraction.processed_items}/{extraction.total_items}</span>
                      <span>{extraction.progress_percentage}%</span>
                    </div>
                    <Progress value={extraction.progress_percentage} className="h-2" />
                    {extraction.failed_items > 0 && (
                      <div className="text-sm text-red-600">
                        {extraction.failed_items} échec(s)
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          {recentExtractions.map((extraction) => (
            <Card key={extraction.id} className="cursor-pointer hover:bg-accent/50"
                  onClick={() => setSelectedBatch(extraction.batch_id)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(extraction.status)}
                    <CardTitle className="text-lg">{extraction.batch_id}</CardTitle>
                    <Badge variant="secondary">{extraction.batch_type}</Badge>
                    <Badge className={getStatusColor(extraction.status)}>
                      {extraction.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(extraction.started_at).toLocaleString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    {extraction.processed_items}/{extraction.total_items} items
                    {extraction.failed_items > 0 && (
                      <span className="text-red-600 ml-2">
                        ({extraction.failed_items} échecs)
                      </span>
                    )}
                  </div>
                  {extraction.completed_at && (
                    <div className="text-sm text-muted-foreground">
                      Durée: {formatDuration((new Date(extraction.completed_at).getTime() - new Date(extraction.started_at).getTime()) / 60000)}
                    </div>
                  )}
                </div>
                {extraction.error_message && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                    {extraction.error_message}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          {selectedBatch ? (
            <Card>
              <CardHeader>
                <CardTitle>Événements - {selectedBatch}</CardTitle>
                <CardDescription>
                  Historique détaillé des événements pour ce batch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {batchEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-2 border-l-2 border-l-primary/20">
                      <div className="text-xs text-muted-foreground w-20 flex-shrink-0">
                        {new Date(event.created_at).toLocaleTimeString()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {event.event_type}
                          </Badge>
                          {event.item_reference && (
                            <Badge variant="secondary" className="text-xs">
                              {event.item_reference}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm mt-1">{event.event_message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  Sélectionnez une extraction pour voir les événements détaillés
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}