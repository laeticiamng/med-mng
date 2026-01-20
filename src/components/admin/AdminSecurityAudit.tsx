import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock, Users, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityAuditReport {
  timestamp: string;
  activeSessions: number;
  last24h: {
    totalAccess: number;
    sessionsCreated: number;
    streamsAccessed: number;
    uniqueUsers: number;
  };
  securityChecks: {
    sessionExpiration: string;
    urlSigning: string;
    streamProxy: string;
    downloadPrevention: string;
  };
}

interface StreamingLog {
  id: string;
  user_id: string;
  song_id: string;
  session_token: string;
  action: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export const AdminSecurityAudit = () => {
  const [auditReport, setAuditReport] = useState<SecurityAuditReport | null>(null);
  const [streamingLogs, setStreamingLogs] = useState<StreamingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    fetchSecurityAudit();
    fetchStreamingLogs();
    
    // Actualisation automatique toutes les 30 secondes
    const interval = setInterval(() => {
      fetchSecurityAudit();
      fetchStreamingLogs();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchSecurityAudit = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('secure-streaming-proxy', {
        body: { action: 'security-audit' }
      });

      if (error) {
        throw error;
      }

      setAuditReport(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur audit sécurité:', error);
      toast.error('Erreur lors de l\'audit de sécurité');
    }
  };

  const fetchStreamingLogs = async () => {
    try {
      setLoading(true);
      
      // Charger les logs depuis streaming_sessions (table non typée)
      const { data: logs, error } = await (supabase as any)
        .from('streaming_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error || !logs) {
        // Table n'existe pas encore, afficher liste vide
        setStreamingLogs([]);
        return;
      }

      const mappedLogs: StreamingLog[] = logs.map((log: any) => ({
        id: log.id,
        user_id: log.user_id,
        song_id: log.song_id,
        session_token: log.session_token || '',
        action: log.is_active ? 'stream_accessed' : 'session_created',
        ip_address: '',
        user_agent: '',
        created_at: log.created_at
      }));

      setStreamingLogs(mappedLogs);
    } catch (error) {
      console.error('Erreur chargement logs:', error);
      setStreamingLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const cleanupExpiredSessions = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('secure-streaming-proxy', {
        body: { action: 'cleanup-sessions' }
      });

      if (error) {
        throw error;
      }

      toast.success(`${data.message}`);
      fetchSecurityAudit(); // Refresh après nettoyage
    } catch (error) {
      console.error('Erreur nettoyage:', error);
      toast.error('Erreur lors du nettoyage des sessions');
    }
  };

  const getSecurityStatus = (check: string): 'success' | 'warning' | 'error' => {
    if (check.includes('OK')) return 'success';
    if (check.includes('WARNING')) return 'warning';
    return 'error';
  };

  const getSecurityIcon = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
  };

  if (loading && !auditReport) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Audit de Sécurité Streaming
          </h2>
          <p className="text-muted-foreground">
            Surveillance et monitoring de la sécurité du streaming audio
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchSecurityAudit}>
            Actualiser
          </Button>
          <Button variant="outline" onClick={cleanupExpiredSessions}>
            Nettoyer sessions
          </Button>
        </div>
      </div>

      {lastUpdate && (
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <Clock className="h-4 w-4" />
          Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
        </div>
      )}

      {/* Statistiques principales */}
      {auditReport && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <div className="text-sm font-medium text-muted-foreground">Sessions actives</div>
              </div>
              <div className="text-2xl font-bold">{auditReport.activeSessions}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-success" />
                <div className="text-sm font-medium text-muted-foreground">Utilisateurs uniques (24h)</div>
              </div>
              <div className="text-2xl font-bold">{auditReport.last24h.uniqueUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" />
                <div className="text-sm font-medium text-muted-foreground">Sessions créées (24h)</div>
              </div>
              <div className="text-2xl font-bold">{auditReport.last24h.sessionsCreated}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-warning" />
                <div className="text-sm font-medium text-muted-foreground">Streams accédés (24h)</div>
              </div>
              <div className="text-2xl font-bold">{auditReport.last24h.streamsAccessed}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Checks de sécurité */}
      {auditReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Vérifications de sécurité
            </CardTitle>
            <CardDescription>
              État des mesures de protection anti-téléchargement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(auditReport.securityChecks).map(([check, status]) => {
                const securityStatus = getSecurityStatus(status);
                return (
                  <div key={check} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      {getSecurityIcon(securityStatus)}
                      <span className="font-medium capitalize">
                        {check.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                    </div>
                    <Badge variant={securityStatus === 'success' ? 'default' : 'destructive'}>
                      {status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logs d'accès récents */}
      <Card>
        <CardHeader>
          <CardTitle>Logs d'accès récents</CardTitle>
          <CardDescription>
            Activité de streaming des 50 dernières actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {streamingLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant={log.action === 'session_created' ? 'default' : 'secondary'}>
                    {log.action === 'session_created' ? 'Création' : 'Accès'}
                  </Badge>
                  <span className="text-muted-foreground">
                    User: {log.user_id.slice(0, 8)}...
                  </span>
                  <span className="text-muted-foreground">
                    Song: {log.song_id.slice(0, 8)}...
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleString('fr-FR')}
                </div>
              </div>
            ))}
            
            {streamingLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucun log d'accès récent
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};