import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  FileText,
  Calendar,
  ClipboardList,
  RefreshCw,
  Plus,
  Eye,
  History
} from 'lucide-react';
import { useWorkflowEngine } from '@/hooks/useWorkflowEngine';
import { Workflow, WorkflowStatus, StepStatus, WORKFLOW_TEMPLATES } from '@/types/workflow';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusColors: Record<WorkflowStatus, string> = {
  draft: 'bg-gray-500',
  pending_approval: 'bg-yellow-500',
  approved: 'bg-blue-500',
  in_progress: 'bg-blue-600',
  completed: 'bg-green-500',
  rejected: 'bg-red-500',
  cancelled: 'bg-gray-400'
};

const statusLabels: Record<WorkflowStatus, string> = {
  draft: 'Brouillon',
  pending_approval: 'En attente d\'approbation',
  approved: 'Approuvé',
  in_progress: 'En cours',
  completed: 'Terminé',
  rejected: 'Rejeté',
  cancelled: 'Annulé'
};

const stepStatusIcons: Record<StepStatus, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-gray-400" />,
  in_progress: <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />,
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
  skipped: <AlertCircle className="h-4 w-4 text-gray-400" />
};

export function WorkflowDashboard() {
  const {
    workflows,
    auditLogs,
    templates,
    createWorkflow,
    startWorkflow,
    completeStep,
    approveStep,
    cancelWorkflow,
    getPendingApprovals,
    getWorkflowsByStatus
  } = useWorkflowEngine();

  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [workflowName, setWorkflowName] = useState('');
  const [proofText, setProofText] = useState('');

  const pendingApprovals = getPendingApprovals();
  const inProgressWorkflows = getWorkflowsByStatus('in_progress');
  const completedWorkflows = getWorkflowsByStatus('completed');

  const handleCreateWorkflow = () => {
    if (!selectedTemplate) return;
    const workflow = createWorkflow(selectedTemplate, workflowName || undefined);
    if (workflow) {
      setSelectedWorkflow(workflow);
      setIsCreateDialogOpen(false);
      setSelectedTemplate('');
      setWorkflowName('');
    }
  };

  const getProgress = (workflow: Workflow) => {
    const completed = workflow.steps.filter(s => s.status === 'completed').length;
    return (completed / workflow.steps.length) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Moteur de Workflow</h2>
          <p className="text-muted-foreground">
            Gérez vos exécutions structurées avec étapes, preuves et approbations
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Workflow
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un Workflow</DialogTitle>
              <DialogDescription>
                Choisissez un template et personnalisez votre workflow
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedTemplate && (
                <p className="text-sm text-muted-foreground">
                  {templates.find(t => t.id === selectedTemplate)?.description}
                </p>
              )}
              <div className="space-y-2">
                <Label>Nom personnalisé (optionnel)</Label>
                <Input
                  value={workflowName}
                  onChange={e => setWorkflowName(e.target.value)}
                  placeholder="Nom du workflow"
                />
              </div>
              <Button onClick={handleCreateWorkflow} disabled={!selectedTemplate} className="w-full">
                Créer le Workflow
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressWorkflows.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approbations en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingApprovals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Terminés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedWorkflows.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">
            <ClipboardList className="h-4 w-4 mr-2" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="approvals">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Approbations ({pendingApprovals.length})
          </TabsTrigger>
          <TabsTrigger value="audit">
            <History className="h-4 w-4 mr-2" />
            Journal d'audit
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="h-4 w-4 mr-2" />
            Planification
          </TabsTrigger>
        </TabsList>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Workflow List */}
            <Card>
              <CardHeader>
                <CardTitle>Mes Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {workflows.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun workflow. Créez-en un pour commencer.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {workflows.map(workflow => (
                        <div
                          key={workflow.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${
                            selectedWorkflow?.id === workflow.id ? 'bg-accent border-primary' : ''
                          }`}
                          onClick={() => setSelectedWorkflow(workflow)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{workflow.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {workflow.description?.slice(0, 50)}...
                              </p>
                            </div>
                            <Badge className={statusColors[workflow.status]}>
                              {statusLabels[workflow.status]}
                            </Badge>
                          </div>
                          <div className="mt-2">
                            <Progress value={getProgress(workflow)} className="h-1" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {workflow.steps.filter(s => s.status === 'completed').length}/{workflow.steps.length} étapes
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Workflow Details */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedWorkflow ? selectedWorkflow.name : 'Détails du Workflow'}
                </CardTitle>
                {selectedWorkflow && (
                  <CardDescription>
                    Créé le {format(new Date(selectedWorkflow.created_at), 'PPP', { locale: fr })}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {selectedWorkflow ? (
                  <div className="space-y-4">
                    {/* Actions */}
                    <div className="flex gap-2">
                      {selectedWorkflow.status === 'draft' && (
                        <Button onClick={() => startWorkflow(selectedWorkflow.id)} size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Démarrer
                        </Button>
                      )}
                      {['draft', 'in_progress', 'pending_approval'].includes(selectedWorkflow.status) && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => cancelWorkflow(selectedWorkflow.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Annuler
                        </Button>
                      )}
                    </div>

                    {/* Steps */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Étapes</h4>
                      {selectedWorkflow.steps.map((step, index) => (
                        <div key={step.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="flex-shrink-0 mt-0.5">
                            {stepStatusIcons[step.status]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{step.name}</span>
                              {step.requires_approval && (
                                <Badge variant="outline" className="text-xs">Approbation</Badge>
                              )}
                              {step.proof_required && (
                                <Badge variant="outline" className="text-xs">Preuve</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                            
                            {/* Complete Step Action */}
                            {step.status === 'in_progress' && (
                              <div className="mt-2 space-y-2">
                                {step.proof_required && (
                                  <Textarea
                                    placeholder="Fournir la preuve..."
                                    value={proofText}
                                    onChange={e => setProofText(e.target.value)}
                                    className="text-sm"
                                  />
                                )}
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    completeStep(
                                      selectedWorkflow.id, 
                                      step.id, 
                                      step.proof_required ? { text: proofText } : undefined
                                    );
                                    setProofText('');
                                  }}
                                  disabled={step.proof_required && !proofText}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Terminer cette étape
                                </Button>
                              </div>
                            )}

                            {step.completed_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Complétée le {format(new Date(step.completed_at), 'Pp', { locale: fr })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Sélectionnez un workflow pour voir les détails
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>Approbations en attente</CardTitle>
              <CardDescription>
                Validez ou rejetez les demandes d'approbation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucune approbation en attente
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map(approval => (
                    <div key={approval.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{(approval as any).workflow_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Demandé le {format(new Date(approval.requested_at), 'PPP', { locale: fr })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveStep(
                              (workflows.find(w => w.approvals.some(a => a.id === approval.id)))?.id || '',
                              approval.id,
                              true
                            )}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => approveStep(
                              (workflows.find(w => w.approvals.some(a => a.id === approval.id)))?.id || '',
                              approval.id,
                              false,
                              'Rejeté par admin'
                            )}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rejeter
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Journal d'audit</CardTitle>
              <CardDescription>
                Historique de toutes les actions sur les workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {auditLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune entrée dans le journal
                  </p>
                ) : (
                  <div className="space-y-2">
                    {auditLogs.slice(0, 50).map(log => (
                      <div key={log.id} className="flex items-start gap-3 p-2 border-b">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{log.action.replace(/_/g, ' ')}</span>
                            {log.actor_email && (
                              <span className="text-muted-foreground"> par {log.actor_email}</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(log.timestamp), 'PPpp', { locale: fr })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Planification</CardTitle>
              <CardDescription>
                Programmez l'exécution automatique de workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                La planification automatique sera disponible prochainement.
                <br />
                Utilisez les templates pour créer des workflows manuellement.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default WorkflowDashboard;
