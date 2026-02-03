/**
 * MED-MNG External Platform Connectors
 * Intégrations EmotionsCare, Growth-Copilot, System-Compass
 */

export type ConnectorType = 'emotions_care' | 'growth_copilot' | 'system_compass' | 'custom';
export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'pending';
export type SyncDirection = 'import' | 'export' | 'bidirectional';
export type SyncFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';

export interface PlatformConnector {
  id: string;
  type: ConnectorType;
  name: string;
  description: string;
  icon: string;
  status: ConnectionStatus;
  api_endpoint?: string;
  api_key_configured: boolean;
  last_sync_at?: string;
  sync_frequency: SyncFrequency;
  sync_direction: SyncDirection;
  enabled_features: string[];
  created_at: string;
  updated_at: string;
  error_message?: string;
}

export interface ConnectorConfig {
  type: ConnectorType;
  name: string;
  description: string;
  icon: string;
  features: ConnectorFeature[];
  required_fields: string[];
  optional_fields: string[];
  documentation_url?: string;
}

export interface ConnectorFeature {
  id: string;
  name: string;
  description: string;
  data_type: 'mood' | 'progress' | 'competency' | 'activity' | 'goal' | 'custom';
  sync_direction: SyncDirection;
  requires_premium?: boolean;
}

export interface SyncLog {
  id: string;
  connector_id: string;
  direction: 'import' | 'export';
  status: 'success' | 'partial' | 'failed';
  records_processed: number;
  records_failed: number;
  started_at: string;
  completed_at?: string;
  error_details?: string[];
  metadata?: Record<string, any>;
}

// Configurations des connecteurs disponibles
export const AVAILABLE_CONNECTORS: ConnectorConfig[] = [
  {
    type: 'emotions_care',
    name: 'EmotionsCare',
    description: 'Plateforme de gestion du bien-être et de la santé mentale',
    icon: 'Heart',
    features: [
      {
        id: 'mood_sync',
        name: 'Synchronisation humeur',
        description: 'Importe les données de suivi d\'humeur',
        data_type: 'mood',
        sync_direction: 'import'
      },
      {
        id: 'stress_alerts',
        name: 'Alertes stress',
        description: 'Reçoit les alertes de niveau de stress élevé',
        data_type: 'mood',
        sync_direction: 'import'
      },
      {
        id: 'wellness_score',
        name: 'Score bien-être',
        description: 'Affiche le score de bien-être dans le dashboard',
        data_type: 'mood',
        sync_direction: 'import'
      },
      {
        id: 'study_breaks',
        name: 'Pauses recommandées',
        description: 'Suggestions de pauses basées sur l\'état émotionnel',
        data_type: 'activity',
        sync_direction: 'bidirectional'
      }
    ],
    required_fields: ['api_key', 'user_token'],
    optional_fields: ['webhook_url'],
    documentation_url: 'https://docs.emotionscare.io/integrations'
  },
  {
    type: 'growth_copilot',
    name: 'Growth-Copilot',
    description: 'Analyse des parcours d\'apprentissage et optimisation marketing',
    icon: 'TrendingUp',
    features: [
      {
        id: 'learning_analytics',
        name: 'Analytics apprentissage',
        description: 'Exporte les données de progression vers Growth-Copilot',
        data_type: 'progress',
        sync_direction: 'export'
      },
      {
        id: 'cohort_analysis',
        name: 'Analyse de cohortes',
        description: 'Segmentation automatique des apprenants',
        data_type: 'progress',
        sync_direction: 'bidirectional'
      },
      {
        id: 'engagement_metrics',
        name: 'Métriques engagement',
        description: 'Suivi des taux d\'engagement et rétention',
        data_type: 'activity',
        sync_direction: 'export'
      },
      {
        id: 'personalization',
        name: 'Personnalisation IA',
        description: 'Recommandations personnalisées basées sur l\'analyse',
        data_type: 'activity',
        sync_direction: 'import',
        requires_premium: true
      }
    ],
    required_fields: ['api_key', 'workspace_id'],
    optional_fields: ['webhook_secret'],
    documentation_url: 'https://growth-copilot.io/docs/integrations'
  },
  {
    type: 'system_compass',
    name: 'System-Compass',
    description: 'Visualisation des compétences acquises et cartographie des savoirs',
    icon: 'Compass',
    features: [
      {
        id: 'competency_map',
        name: 'Carte des compétences',
        description: 'Visualise les compétences EDN maîtrisées',
        data_type: 'competency',
        sync_direction: 'export'
      },
      {
        id: 'skill_graph',
        name: 'Graphe des savoirs',
        description: 'Génère un graphe interactif des connaissances',
        data_type: 'competency',
        sync_direction: 'bidirectional'
      },
      {
        id: 'gap_analysis',
        name: 'Analyse des lacunes',
        description: 'Identifie les domaines à renforcer',
        data_type: 'competency',
        sync_direction: 'import'
      },
      {
        id: 'certification_tracking',
        name: 'Suivi certifications',
        description: 'Synchronise les badges et certifications',
        data_type: 'competency',
        sync_direction: 'bidirectional'
      }
    ],
    required_fields: ['api_key'],
    optional_fields: ['org_id', 'custom_taxonomy'],
    documentation_url: 'https://system-compass.dev/api'
  }
];

// Interface unifiée pour les appels API
export interface ConnectorApiRequest {
  connector_type: ConnectorType;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
}

export interface ConnectorApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status_code: number;
  rate_limit_remaining?: number;
}

// Mappings de données
export interface DataMapping {
  source_field: string;
  target_field: string;
  transform?: 'direct' | 'date' | 'number' | 'boolean' | 'custom';
  custom_transform?: (value: any) => any;
}

export const DEFAULT_DATA_MAPPINGS: Record<ConnectorType, DataMapping[]> = {
  emotions_care: [
    { source_field: 'mood_score', target_field: 'wellbeing_score', transform: 'number' },
    { source_field: 'stress_level', target_field: 'stress_index', transform: 'number' },
    { source_field: 'recorded_at', target_field: 'timestamp', transform: 'date' }
  ],
  growth_copilot: [
    { source_field: 'items_completed', target_field: 'learning_progress', transform: 'number' },
    { source_field: 'study_hours', target_field: 'time_invested', transform: 'number' },
    { source_field: 'quiz_scores', target_field: 'assessment_results', transform: 'direct' }
  ],
  system_compass: [
    { source_field: 'mastered_items', target_field: 'competencies', transform: 'direct' },
    { source_field: 'badges', target_field: 'certifications', transform: 'direct' },
    { source_field: 'skill_levels', target_field: 'proficiency_map', transform: 'direct' }
  ],
  custom: []
};
