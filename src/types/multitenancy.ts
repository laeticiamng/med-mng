/**
 * MED-MNG Multi-Tenancy Types
 * Architecture multi-institutions avec isolation RLS
 */

export type InstitutionType = 'university' | 'hospital' | 'medical_school' | 'research_center' | 'other';
export type MemberRole = 'owner' | 'admin' | 'professor' | 'student' | 'guest';
export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface Institution {
  id: string;
  name: string;
  slug: string;
  type: InstitutionType;
  description?: string;
  logo_url?: string;
  website?: string;
  country: string;
  city?: string;
  settings: InstitutionSettings;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  subscription_tier?: 'free' | 'pro' | 'enterprise';
  max_members?: number;
  current_members_count?: number;
}

export interface InstitutionSettings {
  // Modules activés
  enabled_modules: string[];
  // Personnalisation
  primary_color?: string;
  secondary_color?: string;
  custom_domain?: string;
  // Fonctionnalités
  allow_music_generation: boolean;
  allow_ai_chat: boolean;
  allow_community: boolean;
  // Limites
  daily_ai_credits?: number;
  daily_music_credits?: number;
  // Notifications
  admin_notifications: boolean;
  weekly_reports: boolean;
}

export interface InstitutionMember {
  id: string;
  institution_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
  invited_by?: string;
  is_active: boolean;
  // Denormalized for convenience
  user_email?: string;
  user_name?: string;
  user_avatar?: string;
}

export interface InstitutionInvite {
  id: string;
  institution_id: string;
  email: string;
  role: MemberRole;
  invited_by: string;
  status: InviteStatus;
  token: string;
  created_at: string;
  expires_at: string;
  accepted_at?: string;
}

export interface Cohort {
  id: string;
  institution_id: string;
  name: string;
  description?: string;
  academic_year: string;
  specialty?: string;
  created_at: string;
  is_active: boolean;
  members_count?: number;
}

export interface CohortMember {
  id: string;
  cohort_id: string;
  user_id: string;
  joined_at: string;
}

export interface InstitutionStats {
  total_members: number;
  active_members_last_30_days: number;
  total_study_hours: number;
  average_score: number;
  items_completed: number;
  music_generated: number;
  cohorts_count: number;
}

export interface InstitutionReport {
  institution_id: string;
  period_start: string;
  period_end: string;
  stats: InstitutionStats;
  top_performers: { user_id: string; name: string; score: number }[];
  struggling_students: { user_id: string; name: string; alert_reason: string }[];
  module_usage: { module: string; usage_count: number; avg_time_minutes: number }[];
  recommendations: string[];
  generated_at: string;
}

// Permissions par rôle
export const ROLE_PERMISSIONS: Record<MemberRole, string[]> = {
  owner: [
    'manage_institution',
    'manage_members',
    'manage_cohorts',
    'view_all_reports',
    'manage_billing',
    'manage_settings',
    'invite_members',
    'remove_members',
    'assign_roles',
    'view_analytics',
    'export_data'
  ],
  admin: [
    'manage_members',
    'manage_cohorts',
    'view_all_reports',
    'manage_settings',
    'invite_members',
    'remove_members',
    'view_analytics',
    'export_data'
  ],
  professor: [
    'view_cohort_reports',
    'manage_cohort_students',
    'create_content',
    'view_student_progress',
    'send_notifications'
  ],
  student: [
    'view_own_progress',
    'access_content',
    'participate_community',
    'generate_music',
    'use_ai_chat'
  ],
  guest: [
    'view_public_content'
  ]
};

// Helper pour vérifier les permissions
export function hasPermission(role: MemberRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canManageMembers(role: MemberRole): boolean {
  return hasPermission(role, 'manage_members');
}

export function canViewAllReports(role: MemberRole): boolean {
  return hasPermission(role, 'view_all_reports');
}
