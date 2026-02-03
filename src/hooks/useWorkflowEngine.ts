import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { toast } from 'sonner';
import { 
  Workflow, 
  WorkflowStep, 
  WorkflowApproval, 
  WorkflowStatus, 
  StepStatus,
  WorkflowType,
  AuditLogEntry,
  ScheduledTask,
  WORKFLOW_TEMPLATES 
} from '@/types/workflow';

/**
 * Hook pour gérer le moteur de workflow/run
 * Système d'exécution structuré avec étapes, preuves et approbations
 */
export function useWorkflowEngine() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(null);

  // Générer un ID unique
  const generateId = () => crypto.randomUUID();

  // Logger une action dans l'audit
  const logAuditEntry = useCallback((
    workflowId: string,
    action: string,
    details?: Record<string, any>,
    stepId?: string
  ) => {
    if (!user) return;

    const entry: AuditLogEntry = {
      id: generateId(),
      workflow_id: workflowId,
      step_id: stepId,
      action,
      actor_id: user.id,
      actor_email: user.email,
      timestamp: new Date().toISOString(),
      details
    };

    setAuditLogs(prev => [entry, ...prev]);
    
    // Persister en localStorage (ou Supabase en production)
    const stored = localStorage.getItem('med-mng-audit-logs') || '[]';
    const logs = JSON.parse(stored);
    logs.unshift(entry);
    localStorage.setItem('med-mng-audit-logs', JSON.stringify(logs.slice(0, 1000)));
  }, [user]);

  // Créer un nouveau workflow à partir d'un template
  const createWorkflow = useCallback((
    templateId: string,
    name?: string,
    metadata?: Record<string, any>
  ): Workflow | null => {
    if (!user) return null;

    const template = WORKFLOW_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      toast.error('Template non trouvé');
      return null;
    }

    const workflow: Workflow = {
      id: generateId(),
      name: name || template.name,
      description: template.description,
      type: template.type,
      status: 'draft',
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      steps: template.steps.map((step, index) => ({
        ...step,
        id: generateId(),
        status: 'pending' as StepStatus
      })),
      approvals: [],
      metadata,
      tags: template.tags
    };

    setWorkflows(prev => [workflow, ...prev]);
    logAuditEntry(workflow.id, 'workflow_created', { template_id: templateId, name: workflow.name });
    
    // Persister
    saveWorkflows([workflow, ...workflows]);
    
    toast.success('Workflow créé avec succès');
    return workflow;
  }, [user, workflows, logAuditEntry]);

  // Sauvegarder les workflows en localStorage
  const saveWorkflows = (wfs: Workflow[]) => {
    localStorage.setItem('med-mng-workflows', JSON.stringify(wfs));
  };

  // Charger les workflows
  useEffect(() => {
    const stored = localStorage.getItem('med-mng-workflows');
    if (stored) {
      try {
        setWorkflows(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load workflows:', e);
      }
    }

    const storedLogs = localStorage.getItem('med-mng-audit-logs');
    if (storedLogs) {
      try {
        setAuditLogs(JSON.parse(storedLogs));
      } catch (e) {
        console.error('Failed to load audit logs:', e);
      }
    }

    const storedTasks = localStorage.getItem('med-mng-scheduled-tasks');
    if (storedTasks) {
      try {
        setScheduledTasks(JSON.parse(storedTasks));
      } catch (e) {
        console.error('Failed to load scheduled tasks:', e);
      }
    }
  }, []);

  // Démarrer un workflow
  const startWorkflow = useCallback((workflowId: string) => {
    setWorkflows(prev => {
      const updated = prev.map(wf => {
        if (wf.id === workflowId && wf.status === 'draft') {
          const firstStep = wf.steps.find(s => s.order === 1);
          return {
            ...wf,
            status: 'in_progress' as WorkflowStatus,
            started_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            steps: wf.steps.map(s => 
              s.id === firstStep?.id 
                ? { ...s, status: 'in_progress' as StepStatus, started_at: new Date().toISOString() }
                : s
            )
          };
        }
        return wf;
      });
      saveWorkflows(updated);
      return updated;
    });

    logAuditEntry(workflowId, 'workflow_started');
    toast.success('Workflow démarré');
  }, [logAuditEntry]);

  // Compléter une étape
  const completeStep = useCallback((
    workflowId: string, 
    stepId: string, 
    proofData?: any
  ) => {
    setWorkflows(prev => {
      const updated = prev.map(wf => {
        if (wf.id !== workflowId) return wf;

        const stepIndex = wf.steps.findIndex(s => s.id === stepId);
        if (stepIndex === -1) return wf;

        const step = wf.steps[stepIndex];
        
        // Vérifier si une preuve est requise
        if (step.proof_required && !proofData) {
          toast.error('Une preuve est requise pour cette étape');
          return wf;
        }

        const updatedSteps = [...wf.steps];
        updatedSteps[stepIndex] = {
          ...step,
          status: 'completed',
          completed_at: new Date().toISOString(),
          proof_data: proofData
        };

        // Démarrer la prochaine étape si elle existe
        const nextStep = wf.steps.find(s => s.order === step.order + 1);
        if (nextStep) {
          const nextIndex = updatedSteps.findIndex(s => s.id === nextStep.id);
          
          // Si la prochaine étape nécessite une approbation
          if (nextStep.requires_approval) {
            updatedSteps[nextIndex] = {
              ...updatedSteps[nextIndex],
              status: 'pending'
            };
            
            // Créer une demande d'approbation
            const approval: WorkflowApproval = {
              id: generateId(),
              workflow_id: workflowId,
              step_id: nextStep.id,
              approver_id: '', // À définir par l'admin
              status: 'pending',
              requested_at: new Date().toISOString()
            };
            
            return {
              ...wf,
              status: 'pending_approval' as WorkflowStatus,
              updated_at: new Date().toISOString(),
              steps: updatedSteps,
              approvals: [...wf.approvals, approval]
            };
          } else {
            updatedSteps[nextIndex] = {
              ...updatedSteps[nextIndex],
              status: 'in_progress',
              started_at: new Date().toISOString()
            };
          }
        }

        // Vérifier si le workflow est terminé
        const allCompleted = updatedSteps.every(s => s.status === 'completed');
        
        return {
          ...wf,
          status: allCompleted ? 'completed' as WorkflowStatus : wf.status,
          completed_at: allCompleted ? new Date().toISOString() : undefined,
          updated_at: new Date().toISOString(),
          steps: updatedSteps
        };
      });

      saveWorkflows(updated);
      return updated;
    });

    logAuditEntry(workflowId, 'step_completed', { proof_provided: !!proofData }, stepId);
    toast.success('Étape complétée');
  }, [logAuditEntry]);

  // Approuver une étape
  const approveStep = useCallback((
    workflowId: string,
    approvalId: string,
    approved: boolean,
    comment?: string
  ) => {
    if (!user) return;

    setWorkflows(prev => {
      const updated = prev.map(wf => {
        if (wf.id !== workflowId) return wf;

        const approvalIndex = wf.approvals.findIndex(a => a.id === approvalId);
        if (approvalIndex === -1) return wf;

        const approval = wf.approvals[approvalIndex];
        const updatedApprovals = [...wf.approvals];
        updatedApprovals[approvalIndex] = {
          ...approval,
          status: approved ? 'approved' : 'rejected',
          approver_id: user.id,
          approver_email: user.email,
          comment,
          responded_at: new Date().toISOString()
        };

        // Mettre à jour l'étape correspondante
        const stepIndex = wf.steps.findIndex(s => s.id === approval.step_id);
        const updatedSteps = [...wf.steps];
        
        if (approved && stepIndex !== -1) {
          updatedSteps[stepIndex] = {
            ...updatedSteps[stepIndex],
            status: 'completed',
            completed_at: new Date().toISOString()
          };

          // Démarrer la prochaine étape
          const currentStep = updatedSteps[stepIndex];
          const nextStep = wf.steps.find(s => s.order === currentStep.order + 1);
          if (nextStep) {
            const nextIndex = updatedSteps.findIndex(s => s.id === nextStep.id);
            updatedSteps[nextIndex] = {
              ...updatedSteps[nextIndex],
              status: 'in_progress',
              started_at: new Date().toISOString()
            };
          }
        }

        const allCompleted = updatedSteps.every(s => s.status === 'completed');

        return {
          ...wf,
          status: !approved ? 'rejected' : (allCompleted ? 'completed' : 'in_progress') as WorkflowStatus,
          completed_at: allCompleted ? new Date().toISOString() : undefined,
          updated_at: new Date().toISOString(),
          steps: updatedSteps,
          approvals: updatedApprovals
        };
      });

      saveWorkflows(updated);
      return updated;
    });

    logAuditEntry(workflowId, approved ? 'step_approved' : 'step_rejected', { comment });
    toast.success(approved ? 'Étape approuvée' : 'Étape rejetée');
  }, [user, logAuditEntry]);

  // Planifier un workflow
  const scheduleWorkflow = useCallback((
    workflowId: string,
    runAt: string,
    repeat?: boolean,
    repeatInterval?: 'daily' | 'weekly' | 'monthly'
  ) => {
    const task: ScheduledTask = {
      id: generateId(),
      workflow_id: workflowId,
      run_at: runAt,
      repeat: repeat || false,
      repeat_interval: repeatInterval,
      next_run_at: runAt,
      is_active: true,
      created_at: new Date().toISOString()
    };

    setScheduledTasks(prev => {
      const updated = [...prev, task];
      localStorage.setItem('med-mng-scheduled-tasks', JSON.stringify(updated));
      return updated;
    });

    logAuditEntry(workflowId, 'workflow_scheduled', { run_at: runAt, repeat, repeatInterval });
    toast.success('Workflow planifié');
  }, [logAuditEntry]);

  // Annuler un workflow
  const cancelWorkflow = useCallback((workflowId: string, reason?: string) => {
    setWorkflows(prev => {
      const updated = prev.map(wf => {
        if (wf.id === workflowId && !['completed', 'cancelled'].includes(wf.status)) {
          return {
            ...wf,
            status: 'cancelled' as WorkflowStatus,
            updated_at: new Date().toISOString(),
            metadata: { ...wf.metadata, cancellation_reason: reason }
          };
        }
        return wf;
      });
      saveWorkflows(updated);
      return updated;
    });

    logAuditEntry(workflowId, 'workflow_cancelled', { reason });
    toast.info('Workflow annulé');
  }, [logAuditEntry]);

  // Obtenir les workflows par statut
  const getWorkflowsByStatus = useCallback((status: WorkflowStatus) => {
    return workflows.filter(wf => wf.status === status);
  }, [workflows]);

  // Obtenir les approbations en attente
  const getPendingApprovals = useCallback(() => {
    return workflows.flatMap(wf => 
      wf.approvals.filter(a => a.status === 'pending').map(a => ({
        ...a,
        workflow_name: wf.name,
        workflow_type: wf.type
      }))
    );
  }, [workflows]);

  return {
    // Data
    workflows,
    auditLogs,
    scheduledTasks,
    activeWorkflow,
    isLoading,
    templates: WORKFLOW_TEMPLATES,
    
    // Actions
    createWorkflow,
    startWorkflow,
    completeStep,
    approveStep,
    scheduleWorkflow,
    cancelWorkflow,
    setActiveWorkflow,
    
    // Queries
    getWorkflowsByStatus,
    getPendingApprovals
  };
}

export default useWorkflowEngine;
