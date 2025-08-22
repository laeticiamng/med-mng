export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  subscription: UserSubscription;
  quotas: UserQuotas;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSubscription {
  type: 'free' | 'standard' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  features: SubscriptionFeatures;
}

export interface SubscriptionFeatures {
  maxMusicGenerations: number;
  maxLibraryItems: number;
  accessToAdvancedFeatures: boolean;
  prioritySupport: boolean;
  customStyles: boolean;
  offlineMode: boolean;
}

export interface UserQuotas {
  music: QuotaDetails;
  qcm: QuotaDetails;
  chat: QuotaDetails;
  resetDate: Date;
}

export interface QuotaDetails {
  used: number;
  limit: number;
  remaining: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en';
  notifications: NotificationSettings;
  audio: AudioSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  generationComplete: boolean;
  weeklyDigest: boolean;
}

export interface AudioSettings {
  defaultVolume: number;
  autoPlay: boolean;
  crossfade: boolean;
  equalizer: EqualizerSettings;
}

export interface EqualizerSettings {
  enabled: boolean;
  preset: string;
  customBands: number[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  confirmPassword: string;
}

export interface ResetPasswordData {
  email: string;
}