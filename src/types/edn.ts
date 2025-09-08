// ==========================================
// MED-MNG EDN TYPES - Types flexibles et compatibles
// ==========================================

export interface EDNItem {
  id?: string;
  item_code?: string;
  title?: string;
  content?: string;
  theme?: string;
  subtitle?: string;
  colonnes?: string[];
  lignes?: string[][];
  sections?: any[];
  competences_oic?: any[];
  rang_a?: string[];
  rang_b?: string[];
  tableau_rang_a?: any[];
  tableau_rang_b?: any[];
  paroles?: string[];
  paroles_rang_a?: string[];
  paroles_rang_b?: string[];
  paroles_rang_ab?: string[];
  metadata?: Record<string, any>;
  [key: string]: any; // Permet propriétés dynamiques
}

export interface ProcessingData {
  item_code?: string;
  rang?: 'A' | 'B' | 'AB';
  content?: any[];
  processed_content?: any[];
  theme?: string;
  title?: string;
  metadata?: Record<string, any>;
  [key: string]: any; // Permet propriétés dynamiques
}

export interface ColonneConfig {
  id?: string;
  titre?: string;
  type?: 'text' | 'number' | 'boolean' | 'array';
  nom?: string;
  key?: string;
  label?: string;
  couleur?: string;
  couleurCellule?: string;
  couleurTexte?: string;
  obligatoire?: boolean;
  description?: string;
  required?: boolean;
  validation?: (value: any) => boolean;
  [key: string]: any;
}

// Alias pour compatibilité
export type ColumnConfig = ColonneConfig;

export interface TableauResult {
  success: boolean;
  data?: any[];
  lignesEnrichies?: any[];
  colonnesUtiles?: ColonneConfig[];
  theme?: string;
  isComplete?: boolean;
  error?: string;
  metadata?: {
    total_items?: number;
    processed_items?: number;
    failed_items?: number;
  };
  [key: string]: any;
}

export interface TableauData {
  colonnes?: ColonneConfig[];
  lignes?: any[][];
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface TableauGenerationResult {
  success?: boolean;
  tableau?: TableauData;
  lignes?: any[];
  metadata?: Record<string, any>;
  error?: string;
  [key: string]: any;
}

export interface EdnItemData {
  id?: string;
  item_code?: string;
  title?: string;
  theme?: string;
  content?: any;
  tableau_rang_a?: any[];
  tableau_rang_b?: any[];
  metadata?: Record<string, any>;
  [key: string]: any;
}

// Type flexible pour processing
export interface TableauProcessingData {
  id?: string;
  item_code?: string;
  content?: any[];
  slug?: string;
  tableau_rang_a?: any[];
  tableau_rang_b?: any[];
  theme?: string;
  title?: string;
  [key: string]: any;
}

// Types pour le mode immersif
export interface EdnItemImmersive {
  id: string;
  item_code: string;
  title: string;
  description: string;
  scenes: SceneImmersive[];
  quiz_config: QuizConfig;
  visual_ambiance: VisualAmbiance;
  audio_ambiance: AudioAmbiance;
  interaction_config: InteractionConfig;
  reward_messages: RewardMessages;
}

export interface SceneImmersive {
  id: string;
  title: string;
  description: string;
  background_image?: string;
  background_video?: string;
  audio_track?: string;
  interactions: InteractionPoint[];
  duration_seconds?: number;
}

export interface InteractionPoint {
  id: string;
  x: number;
  y: number;
  type: 'click' | 'hover' | 'drag';
  trigger_content: string;
  feedback_message: string;
}

export interface QuizConfig {
  questions: QuizQuestion[];
  passing_score: number;
  time_limit_seconds?: number;
  randomize_questions: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'text_input';
  options?: string[];
  correct_answer: string | string[];
  explanation?: string;
  points: number;
  rang?: 'A' | 'B' | 'AB'; // Ajouté pour compatibilité
}

export interface VisualAmbiance {
  theme: string;
  color_scheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  animations: {
    transition_duration: number;
    easing: string;
    particle_effects: boolean;
  };
}

export interface AudioAmbiance {
  background_music?: string;
  sound_effects: {
    success: string;
    error: string;
    interaction: string;
    ambient: string[];
  };
  volume_levels: {
    master: number;
    music: number;
    effects: number;
  };
}

export interface InteractionConfig {
  enable_hints: boolean;
  hint_delay_seconds: number;
  auto_progress: boolean;
  feedback_instant: boolean;
  gesture_controls: boolean;
}

export interface RewardMessages {
  completion: string[];
  perfect_score: string[];
  improvement: string[];
  encouragement: string[];
}