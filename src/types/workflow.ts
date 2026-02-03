/**
 * MED-MNG Run Engine Types
 * Système de workflow avec étapes, preuves et approbations
 * Inspiré de Growth-Copilot
 */

export type WorkflowStatus = 'draft' | 'pending_approval' | 'approved' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type WorkflowType = 'study_plan' | 'progression_audit' | 'notification_campaign' | 'content_generation' | 'batch_export' | 'custom';

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  order: number;
  status: StepStatus;
  requires_approval: boolean;
  proof_required: boolean;
  proof_type?: 'file' | 'screenshot' | 'text' | 'metric';
  proof_data?: any;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  metadata?: Record<string, any>;
}

export interface WorkflowApproval {
  id: string;
  workflow_id: string;
  step_id?: string;
  approver_id: string;
  approver_email?: string;
  status: ApprovalStatus;
  comment?: string;
  requested_at: string;
  responded_at?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  type: WorkflowType;
  status: WorkflowStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  steps: WorkflowStep[];
  approvals: WorkflowApproval[];
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface AuditLogEntry {
  id: string;
  workflow_id: string;
  step_id?: string;
  action: string;
  actor_id: string;
  actor_email?: string;
  timestamp: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export interface ScheduledTask {
  id: string;
  workflow_id: string;
  cron_expression?: string;
  run_at?: string;
  repeat: boolean;
  repeat_interval?: 'daily' | 'weekly' | 'monthly';
  last_run_at?: string;
  next_run_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  type: WorkflowType;
  steps: Omit<WorkflowStep, 'id' | 'status' | 'started_at' | 'completed_at'>[];
  default_approvers?: string[];
  tags?: string[];
}

// Templates prédéfinis
export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'study-plan-weekly',
    name: 'Plan d\'étude hebdomadaire',
    description: 'Génère automatiquement un planning de révision personnalisé',
    type: 'study_plan',
    steps: [
      { name: 'Analyse progression', description: 'Évaluer les items maîtrisés vs à réviser', order: 1, requires_approval: false, proof_required: true, proof_type: 'metric' },
      { name: 'Génération planning', description: 'Créer le planning personnalisé', order: 2, requires_approval: false, proof_required: true, proof_type: 'text' },
      { name: 'Validation utilisateur', description: 'L\'utilisateur valide son planning', order: 3, requires_approval: true, proof_required: false },
      { name: 'Activation rappels', description: 'Programmer les notifications', order: 4, requires_approval: false, proof_required: true, proof_type: 'text' }
    ],
    tags: ['planning', 'automatisation', 'productivité']
  },
  {
    id: 'progression-audit',
    name: 'Audit de progression',
    description: 'Analyse complète des performances et recommandations',
    type: 'progression_audit',
    steps: [
      { name: 'Collecte données', description: 'Récupérer toutes les statistiques utilisateur', order: 1, requires_approval: false, proof_required: true, proof_type: 'metric' },
      { name: 'Analyse IA', description: 'Identifier forces et faiblesses', order: 2, requires_approval: false, proof_required: true, proof_type: 'text' },
      { name: 'Génération rapport', description: 'Créer le rapport détaillé', order: 3, requires_approval: false, proof_required: true, proof_type: 'file' },
      { name: 'Approbation admin', description: 'Validation par un administrateur', order: 4, requires_approval: true, proof_required: false },
      { name: 'Envoi utilisateur', description: 'Notifier l\'utilisateur du rapport', order: 5, requires_approval: false, proof_required: true, proof_type: 'text' }
    ],
    default_approvers: ['admin'],
    tags: ['audit', 'analytics', 'rapport']
  },
  {
    id: 'notification-campaign',
    name: 'Campagne de notifications',
    description: 'Envoi de notifications ciblées à un groupe d\'utilisateurs',
    type: 'notification_campaign',
    steps: [
      { name: 'Définition cible', description: 'Sélectionner les destinataires', order: 1, requires_approval: false, proof_required: true, proof_type: 'metric' },
      { name: 'Rédaction message', description: 'Préparer le contenu', order: 2, requires_approval: false, proof_required: true, proof_type: 'text' },
      { name: 'Approbation contenu', description: 'Validation avant envoi', order: 3, requires_approval: true, proof_required: false },
      { name: 'Envoi', description: 'Diffusion des notifications', order: 4, requires_approval: false, proof_required: true, proof_type: 'metric' }
    ],
    default_approvers: ['admin'],
    tags: ['notification', 'communication', 'engagement']
  },
  {
    id: 'content-generation',
    name: 'Génération de contenu IA',
    description: 'Création automatisée de contenu pédagogique',
    type: 'content_generation',
    steps: [
      { name: 'Sélection item', description: 'Choisir l\'item EDN cible', order: 1, requires_approval: false, proof_required: true, proof_type: 'text' },
      { name: 'Génération musique', description: 'Créer la chanson médicale', order: 2, requires_approval: false, proof_required: true, proof_type: 'file' },
      { name: 'Génération quiz', description: 'Créer les QCM associés', order: 3, requires_approval: false, proof_required: true, proof_type: 'text' },
      { name: 'Review médical', description: 'Validation par un médecin', order: 4, requires_approval: true, proof_required: false },
      { name: 'Publication', description: 'Mise en production', order: 5, requires_approval: false, proof_required: true, proof_type: 'text' }
    ],
    default_approvers: ['admin', 'medical_reviewer'],
    tags: ['contenu', 'IA', 'pédagogie']
  }
];
