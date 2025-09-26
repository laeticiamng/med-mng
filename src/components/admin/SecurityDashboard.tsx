import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, CheckCircle, X, Clock, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { errorService } from '@/services/core/ErrorService';

interface SecurityIncident {
  id: string;
  type: 'secret_detected' | 'suspicious_pattern' | 'build_scan';
  severity: 'low' | 'medium' | 'high' | 'critical';
  file_path: string;
  line_number?: number;
  pattern_matched: string;
  content_preview: string;
  status: 'detected' | 'resolved' | 'false_positive';
  created_at: string;
  resolved_at?: string;
  notes?: string;
}

export const SecurityDashboard: React.FC = () => {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('security_incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncidents((data || []) as SecurityIncident[]);
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : new Error('Error fetching security incidents'), 'api_call');
      toast.error('Erreur lors du chargement des incidents de sécurité');
    } finally {
      setLoading(false);
    }
  };

  const updateIncidentStatus = async (incidentId: string, status: 'resolved' | 'false_positive', notes?: string) => {
    try {
      const { error } = await supabase
        .from('security_incidents')
        .update({
          status,
          resolved_at: new Date().toISOString(),
          notes
        })
        .eq('id', incidentId);

      if (error) throw error;
      
      toast.success(`Incident marqué comme ${status === 'resolved' ? 'résolu' : 'faux positif'}`);
      fetchIncidents();
      setSelectedIncident(null);
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : new Error('Error updating incident'), 'api_call');
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const scanProject = async () => {
    try {
      toast.info('Analyse de sécurité en cours...');
      
      const { data, error } = await supabase.functions.invoke('security-scanner', {
        body: {
          action: 'scan_files',
          files: [
            // Simulation d'un scan de fichiers
            {
              path: 'src/config.ts',
              content: `
                const API_KEY = "sk-test123456789"; // Test secret
                export const config = {
                  openai: API_KEY
                };
              `
            }
          ]
        }
      });

      if (error) throw error;
      
      if (data.critical_count > 0) {
        toast.error(`🚨 ${data.critical_count} incident(s) critiques détectés !`);
      } else if (data.high_count > 0) {
        toast.warning(`⚠️ ${data.high_count} incident(s) importants détectés`);
      } else {
        toast.success('✅ Aucun problème de sécurité détecté');
      }
      
      fetchIncidents();
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : new Error('Error scanning project'), 'api_call');
      toast.error('Erreur lors de l\'analyse de sécurité');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-500';
      case 'false_positive': return 'bg-gray-500';
      default: return 'bg-red-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const criticalCount = incidents.filter(i => i.severity === 'critical' && i.status === 'detected').length;
  const highCount = incidents.filter(i => i.severity === 'high' && i.status === 'detected').length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">🔒 Dashboard Sécurité</h1>
          <p className="text-muted-foreground">Surveillance des incidents de sécurité</p>
        </div>
        <Button onClick={scanProject} className="bg-primary hover:bg-primary/90">
          <Shield className="h-4 w-4 mr-2" />
          Lancer Scan Sécurité
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critiques</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Importants</p>
                <p className="text-2xl font-bold text-orange-600">{highCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Résolus</p>
                <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-blue-600">{incidents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incidents List */}
      <Card>
        <CardHeader>
          <CardTitle>Incidents de Sécurité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => setSelectedIncident(incident)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(incident.severity)}
                    <Badge className={`${getSeverityColor(incident.severity)} text-white`}>
                      {incident.severity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="font-medium">{incident.pattern_matched}</p>
                    <p className="text-sm text-muted-foreground">
                      {incident.file_path}
                      {incident.line_number && `:${incident.line_number}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(incident.status)} text-white`}>
                    {incident.status === 'detected' ? 'Détecté' : 
                     incident.status === 'resolved' ? 'Résolu' : 'Faux positif'}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(incident.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}

            {incidents.length === 0 && (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-green-600">Aucun incident de sécurité</p>
                <p className="text-muted-foreground">Votre plateforme est sécurisée !</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full m-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getSeverityIcon(selectedIncident.severity)}
                  Détails de l'Incident
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIncident(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">Type de menace</p>
                <p className="text-muted-foreground">{selectedIncident.pattern_matched}</p>
              </div>

              <div>
                <p className="font-medium">Fichier</p>
                <p className="text-muted-foreground font-mono text-sm">
                  {selectedIncident.file_path}
                  {selectedIncident.line_number && `:${selectedIncident.line_number}`}
                </p>
              </div>

              <div>
                <p className="font-medium">Contenu détecté</p>
                <code className="block p-3 bg-muted rounded text-sm">
                  {selectedIncident.content_preview}
                </code>
              </div>

              {selectedIncident.status === 'detected' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => updateIncidentStatus(selectedIncident.id, 'resolved')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marquer Résolu
                  </Button>
                  <Button
                    onClick={() => updateIncidentStatus(selectedIncident.id, 'false_positive')}
                    variant="outline"
                  >
                    Faux Positif
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};