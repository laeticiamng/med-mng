// Temporary types for tables not yet in generated Supabase types
// These should be replaced when types are regenerated

import type { NotificationFilters } from '@/components/security/SecurityNotificationsFilters';
import type { Database } from '@/integrations/supabase/types';

// Extend generated types with proper JSON types
export type NotificationFilterTemplateRow = Database['public']['Tables']['notification_filter_templates']['Row'];

export interface NotificationFilterTemplate extends Omit<NotificationFilterTemplateRow, 'filters'> {
  filters: NotificationFilters;
}

export type TemplateTagRow = Database['public']['Tables']['template_tags']['Row'];
export type TemplateTag = TemplateTagRow;

export type TemplateCommentRow = Database['public']['Tables']['template_comments']['Row'];
export type TemplateComment = TemplateCommentRow;

export type TemplateFavoriteRow = Database['public']['Tables']['template_favorites']['Row'];
export type TemplateFavorite = TemplateFavoriteRow;

export type TemplateApplicationHistoryRow = Database['public']['Tables']['template_application_history']['Row'];

export interface TemplateApplicationHistory extends Omit<TemplateApplicationHistoryRow, 'filters_applied'> {
  filters_applied: NotificationFilters;
}

// Helper type for Supabase table operations
export type SupabaseTable = 
  | 'notification_filter_templates'
  | 'template_tags'
  | 'template_comments'
  | 'template_favorites'
  | 'template_application_history';
