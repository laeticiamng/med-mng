// ============================================================================
// PACKAGES/TYPES - Contrats de données communs (frontend ↔ backend)
// ============================================================================

// Base types
export type UUID = string;
export type ISODateString = string;
export type EmailAddress = string;

// ============================================================================
// EDN SYSTEM TYPES
// ============================================================================

export type EDNCategory = 
  | 'cardio' 
  | 'pneumo' 
  | 'neuro' 
  | 'gastro' 
  | 'nephro' 
  | 'endocrino' 
  | 'hemato' 
  | 'infectio' 
  | 'dermato' 
  | 'rhumato' 
  | 'ophtalmo' 
  | 'orl' 
  | 'uro' 
  | 'gyneco' 
  | 'pediatrie' 
  | 'psychiatrie' 
  | 'urgences' 
  | 'geriatrie' 
  | 'medecine-generale';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type ProgressStatus = 'not-started' | 'in-progress' | 'completed' | 'mastered';

export interface EDNItemDTO {
  id: UUID;
  number: number;
  title: string;
  category: EDNCategory;
  subcategory?: string;
  description: string;
  objectives: string[];
  keyPoints: string[];
  difficulty: DifficultyLevel;
  estimatedStudyTime: number; // minutes
  prerequisites?: UUID[];
  relatedItems?: UUID[];
  lastUpdated: ISODateString;
  createdAt: ISODateString;
}

export interface UserProgressDTO {
  userId: UUID;
  itemId: UUID;
  status: ProgressStatus;
  completionRate: number; // 0-100
  timeSpent: number; // minutes
  lastAccessed: ISODateString;
  attempts: number;
  bestScore?: number;
  notes?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ============================================================================
// ECOS SIMULATION TYPES
// ============================================================================

export type ECOSScenarioType = 'consultation' | 'urgence' | 'diagnostic' | 'therapeutique' | 'communication';

export type ECOSScenarioStatus = 'available' | 'in-progress' | 'completed' | 'locked';

export interface ECOSScenarioDTO {
  id: UUID;
  title: string;
  type: ECOSScenarioType;
  category: EDNCategory;
  description: string;
  objectives: string[];
  difficulty: DifficultyLevel;
  estimatedDuration: number; // minutes
  maxScore: number;
  patientProfile?: {
    age: number;
    gender: 'M' | 'F';
    background: string;
  };
  prerequisites?: UUID[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface ECOSSessionDTO {
  id: UUID;
  userId: UUID;
  scenarioId: UUID;
  startTime: ISODateString;
  endTime?: ISODateString;
  status: 'in-progress' | 'completed' | 'abandoned';
  score?: number;
  feedback?: string;
  actions: ECOSActionDTO[];
  createdAt: ISODateString;
}

export interface ECOSActionDTO {
  id: UUID;
  sessionId: UUID;
  type: 'question' | 'examination' | 'diagnosis' | 'treatment' | 'communication';
  content: string;
  timestamp: ISODateString;
  score?: number;
  feedback?: string;
}

// ============================================================================
// MUSIC GENERATION TYPES  
// ============================================================================

export type MusicStyle = 'relaxing' | 'focus' | 'energetic' | 'ambient' | 'meditation';

export type MusicMood = 'peaceful' | 'motivated' | 'concentrated' | 'creative' | 'calming';

export type GenerationStatus = 'queued' | 'generating' | 'completed' | 'failed' | 'timeout';

export interface MusicGenerationRequestDTO {
  userId: UUID;
  topic: string;
  style: MusicStyle;
  mood: MusicMood;
  duration: number; // seconds
  tempo: number; // BPM
  instruments?: string[];
  context?: string; // study context
}

export interface MusicGenerationResponseDTO {
  id: UUID;
  userId: UUID;
  request: MusicGenerationRequestDTO;
  status: GenerationStatus;
  progress: number; // 0-100
  audioUrl?: string;
  imageUrl?: string;
  metadata?: {
    actualDuration?: number;
    fileSize?: number;
    format?: string;
  };
  error?: string;
  createdAt: ISODateString;
  completedAt?: ISODateString;
}

// ============================================================================
// AI ASSISTANT TYPES
// ============================================================================

export type ChatMessageType = 'text' | 'image' | 'file' | 'code';

export type ChatSender = 'user' | 'assistant';

export type ChatCategory = 'diagnostic' | 'treatment' | 'education' | 'reference' | 'general';

export interface ChatMessageDTO {
  id: UUID;
  sessionId: UUID;
  content: string;
  sender: ChatSender;
  type: ChatMessageType;
  category?: ChatCategory;
  metadata?: {
    confidence?: number;
    sources?: string[];
    attachments?: string[];
  };
  createdAt: ISODateString;
}

export interface ChatSessionDTO {
  id: UUID;
  userId: UUID;
  title: string;
  category: ChatCategory;
  messageCount: number;
  lastMessageAt: ISODateString;
  isActive: boolean;
  metadata?: {
    context?: string;
    specialization?: string;
  };
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ============================================================================
// USER & PROFILE TYPES
// ============================================================================

export type UserRole = 'student' | 'resident' | 'doctor' | 'admin';

export type SubscriptionPlan = 'free' | 'premium' | 'pro' | 'enterprise';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface UserProfileDTO {
  id: UUID;
  email: EmailAddress;
  name: string;
  role: UserRole;
  university?: string;
  academicYear?: number;
  specialization?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  subscriptionPlan: SubscriptionPlan;
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    studyReminders: boolean;
  };
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface UserBadgeDTO {
  id: UUID;
  userId: UUID;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  category: string;
  earnedAt: ISODateString;
  metadata?: Record<string, any>;
}

export interface UserStatsDTO {
  userId: UUID;
  level: number;
  experience: number;
  nextLevelExp: number;
  studyTime: number; // total minutes
  streakDays: number;
  itemsCompleted: number;
  musicCreated: number;
  ecosCompleted: number;
  badgesEarned: number;
  updatedAt: ISODateString;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export type AnalyticsEventType = 
  | 'page_view'
  | 'item_started'
  | 'item_completed'
  | 'quiz_attempted'
  | 'music_generated'
  | 'chat_message'
  | 'login'
  | 'logout';

export interface AnalyticsEventDTO {
  id: UUID;
  userId?: UUID;
  sessionId: string;
  eventType: AnalyticsEventType;
  properties: Record<string, any>;
  timestamp: ISODateString;
}

export interface LearningAnalyticsDTO {
  userId: UUID;
  period: 'daily' | 'weekly' | 'monthly';
  metrics: {
    studyTimeMinutes: number;
    itemsCompleted: number;
    averageScore: number;
    streakDays: number;
    focusTime: number;
    categories: {
      category: EDNCategory;
      progress: number;
      timeSpent: number;
    }[];
  };
  generatedAt: ISODateString;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    timestamp: ISODateString;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    timestamp: ISODateString;
  };
}

// ============================================================================
// FORM VALIDATION TYPES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface FormState<T = any> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationDTO {
  id: UUID;
  userId: UUID;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: ISODateString;
  expiresAt?: ISODateString;
}

// ============================================================================
// EXPORTS GROUPÉS
// ============================================================================

// EDN System
export type * from './medical';

// Core types utilisés partout
export type {
  UUID,
  ISODateString,
  EmailAddress,
  APIResponse,
  PaginatedResponse,
  PaginationParams,
  ValidationError,
  FormState
};