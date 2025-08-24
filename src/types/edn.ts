/**
 * Types pour les items EDN et leurs composants
 */

export interface VisualAmbiance {
  theme: string;
  colors: string[];
  atmosphere: string;
  elements?: string[];
}

export interface AudioAmbiance {
  backgroundMusic?: string;
  soundEffects?: string[];
  narration?: string;
  volume?: number;
}

export interface TableauConcept {
  concept: string;
  definition: string;
  exemple: string;
  piege: string;
  mnemo: string;
  subtilite: string;
  application: string;
  vigilance: string;
}

export interface TableauSection {
  title: string;
  concepts: TableauConcept[];
  columns: string[];
}

export interface TableauData {
  sections?: TableauSection[];
  lignes?: string[][];
  colonnes?: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  rang: 'A' | 'B';
  difficulty?: 'facile' | 'moyen' | 'difficile';
}

export interface QuizConfig {
  questions: QuizQuestion[];
  timeLimit?: number;
  shuffleQuestions?: boolean;
  showExplanations?: boolean;
}

export interface InteractionConfig {
  type: 'quiz' | 'drag-drop' | 'matching' | 'text-input';
  config: Record<string, unknown>;
  scoring?: {
    maxPoints: number;
    passingScore: number;
  };
}

export interface SceneImmersive {
  title: string;
  description: string;
  scenes: Array<{
    id: string;
    type: 'text' | 'image' | 'video' | 'interaction';
    content: string;
    duration?: number;
    transition?: string;
  }>;
}

export interface RewardMessages {
  success: string[];
  encouragement: string[];
  completion: string;
}

export interface EdnItemImmersive {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  item_code: string;
  pitch_intro: string;
  visual_ambiance: VisualAmbiance | null;
  audio_ambiance: AudioAmbiance | null;
  tableau_rang_a: TableauData | null;
  tableau_rang_b: TableauData | null;
  scene_immersive: SceneImmersive | null;
  paroles_musicales: string[];
  interaction_config: InteractionConfig | null;
  quiz_questions: QuizConfig | null;
  reward_messages: RewardMessages | null;
}

export interface ColumnConfig {
  key: string;
  label: string;
  width?: string;
  obligatoire: boolean;
  description?: string;
}

export interface ConceptData {
  concept: string;
  definition: string;
  exemple?: string;
  piege?: string;
  mnemo?: string;
  subtilite?: string;
  application?: string;
  vigilance?: string;
}

export interface EdnItemData extends Record<string, unknown> {
  item_code?: string;
  title?: string;
  subtitle?: string;
  theme?: string;
  tableau_rang_a?: TableauData | null;
  tableau_rang_b?: TableauData | null;
  sections?: TableauSection[];
  lignes?: string[][];
  colonnes?: string[];
}

export interface TableauGenerationResult {
  lignes: string[][];
  colonnes: ColumnConfig[];
  metadata?: {
    totalConcepts: number;
    rangACount: number;
    rangBCount: number;
    theme?: string;
    objectifs?: string[];
    competences?: string[];
  };
}