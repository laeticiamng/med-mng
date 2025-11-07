import { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, ArrowUpCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSecurityIncidents, SecurityIncident, IncidentStatus } from '@/hooks/useSecurityIncidents';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const IncidentManagement = () => {
  const { incidents, activeIncidents, criticalIncidents, updateIncidentStatus, escalateIncident, isUpdating } = useSecurityIncidents();
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [escalateDialog, setEscalateDialog] = useState(false);
  const [assignedTo, setAssignedTo] = useState('');

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critique</Badge>;
      case 'high':
        return <Badge className="bg-warning text-warning-foreground">Élevée</Badge>;
      case 'medium':
        return <Badge variant="secondary">Moyenne</Badge>;
      default:
        return <Badge variant="outline">Basse</Badge>;
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'open':
        return <Badge variant="destructive">Ouvert</Badge>;
      case 'acknowledged':
        return <Badge className="bg-warning text-warning-foreground">Reconnu</Badge>;
      case 'investigating':
        return <Badge variant="secondary">En cours</Badge>;
      case 'escalated':
        return <Badge className="bg-destructive">Escaladé</Badge>;
      case 'resolved':
        return <Badge className="bg-success text-success-foreground">Résolu</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: IncidentStatus) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'escalated':
        return <ArrowUpCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const handleStatusChange = (status: IncidentStatus) => {
    if (!selectedIncident) return;

    if (status === 'resolved') {
      updateIncidentStatus({
        id: selectedIncident.id,
        status,
        notes: resolutionNotes,
      });
      setSelectedIncident(null);
      setResolutionNotes('');
    } else {
      updateIncidentStatus({
        id: selectedIncident.id,
        status,
      });
    }
  };

  const handleEscalate = () => {
    if (!selectedIncident || !assignedTo) return;
    
    escalateIncident({
      id: selectedIncident.id,
      assignedTo,
    });
    
    setEscalateDialog(false);
    setAssignedTo('');
    setSelectedIncident(null);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Incidents Actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{activeIncidents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{criticalIncidents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taux de Résolution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {incidents.length > 0 
                ? Math.round((incidents.filter(i => i.status === 'resolved').length / incidents.length) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incidents List */}
      <Card>
        <CardHeader>
          <CardTitle>Incidents de Sécurité</CardTitle>
          <CardDescription>
            Gérez et résolvez les incidents de sécurité détectés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incidents.map((incident) => (
              <Card key={incident.id} className="border-l-4" style={{
                borderLeftColor: incident.severity === 'critical' ? 'hsl(var(--destructive))' : 
                                 incident.severity === 'high' ? 'hsl(var(--warning))' : 
                                 'hsl(var(--border))'
              }}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(incident.status)}
                        <CardTitle className="text-base">{incident.title}</CardTitle>
                      </div>
                      <CardDescription>{incident.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {getSeverityBadge(incident.severity)}
                      {getStatusBadge(incident.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Ressource: {incident.affected_resource}</span>
                    <span>•</span>
                    <span>
                      Détecté {formatDistanceToNow(new Date(incident.detected_at), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </span>
                  </div>

                  {incident.status !== 'resolved' && (
                    <div className="flex gap-2">
                      <Select
                        onValueChange={(value) => {
                          setSelectedIncident(incident);
                          handleStatusChange(value as IncidentStatus);
                        }}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Changer statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="acknowledged">Reconnaître</SelectItem>
                          <SelectItem value="investigating">Enquêter</SelectItem>
                          <SelectItem value="resolved">Résoudre</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedIncident(incident);
                          setEscalateDialog(true);
                        }}
                        disabled={isUpdating}
                      >
                        <ArrowUpCircle className="h-4 w-4 mr-1" />
                        Escalader
                      </Button>
                    </div>
                  )}

                  {incident.resolution_notes && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Notes de résolution:</p>
                          <p className="text-sm text-muted-foreground">{incident.resolution_notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {incidents.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun incident de sécurité détecté</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Escalation Dialog */}
      <Dialog open={escalateDialog} onOpenChange={setEscalateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalader l'Incident</DialogTitle>
            <DialogDescription>
              Assignez cet incident à un responsable pour escalade
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assigned-to">Email du responsable</Label>
              <Input
                id="assigned-to"
                type="email"
                placeholder="security@example.com"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEscalateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleEscalate} disabled={!assignedTo || isUpdating}>
              Escalader
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolution Dialog */}
      <Dialog open={selectedIncident?.status === 'resolved' && !!resolutionNotes} onOpenChange={(open) => {
        if (!open) {
          setSelectedIncident(null);
          setResolutionNotes('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Résoudre l'Incident</DialogTitle>
            <DialogDescription>
              Ajoutez des notes sur la résolution de cet incident
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resolution-notes">Notes de résolution</Label>
              <Textarea
                id="resolution-notes"
                placeholder="Décrivez comment l'incident a été résolu..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedIncident(null);
              setResolutionNotes('');
            }}>
              Annuler
            </Button>
            <Button onClick={() => handleStatusChange('resolved')} disabled={isUpdating}>
              Résoudre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
