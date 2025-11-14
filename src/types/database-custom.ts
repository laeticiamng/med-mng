/**
 * Custom database types for MED-MNG platform
 * These types are manually maintained and correspond to the new tables added in migration 20251114120000
 */

export type ItemType = 'edn' | 'ecos' | 'song' | 'product'
export type ViewSource = 'direct' | 'search' | 'recommendation' | 'other'
export type ActivityAction =
  | 'view' | 'create' | 'edit' | 'delete' | 'download' | 'upload'
  | 'share' | 'export' | 'import' | 'search' | 'filter' | 'like'
  | 'comment' | 'login' | 'logout' | 'settings_change'
export type ActivityStatus = 'success' | 'failed'
export type DeviceType = 'web' | 'mobile' | 'desktop'
export type SessionStatus = 'active' | 'expired' | 'revoked' | 'logged_out'
export type ExportType = 'csv' | 'excel' | 'pdf' | 'json'
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type PostStatus = 'draft' | 'published' | 'archived'

// ============================================================================
// USER FAVORITES
// ============================================================================
export interface UserFavorite {
  id: string
  user_id: string
  item_type: ItemType
  item_id: string
  item_data: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface UserFavoriteInsert {
  user_id: string
  item_type: ItemType
  item_id: string
  item_data?: Record<string, any> | null
}

export interface UserFavoriteUpdate {
  item_data?: Record<string, any> | null
}

// ============================================================================
// USER VIEWING HISTORY
// ============================================================================
export interface UserViewingHistory {
  id: string
  user_id: string
  item_type: ItemType
  item_id: string
  item_title: string | null
  duration_seconds: number
  scroll_depth: number | null
  completed: boolean
  view_source: ViewSource | null
  viewed_at: string
}

export interface UserViewingHistoryInsert {
  user_id: string
  item_type: ItemType
  item_id: string
  item_title?: string | null
  duration_seconds?: number
  scroll_depth?: number | null
  completed?: boolean
  view_source?: ViewSource | null
}

// ============================================================================
// USER ACTIVITY
// ============================================================================
export interface UserActivity {
  id: string
  user_id: string
  action: ActivityAction
  resource_type: string
  resource_id: string | null
  resource_name: string | null
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, any> | null
  status: ActivityStatus
  error_message: string | null
  created_at: string
}

export interface UserActivityInsert {
  user_id: string
  action: ActivityAction
  resource_type: string
  resource_id?: string | null
  resource_name?: string | null
  ip_address?: string | null
  user_agent?: string | null
  metadata?: Record<string, any> | null
  status?: ActivityStatus
  error_message?: string | null
}

// ============================================================================
// USER 2FA
// ============================================================================
export interface User2FA {
  id: string
  user_id: string
  secret_encrypted: string
  backup_codes: string[]
  enabled: boolean
  backup_codes_used: string[]
  verified_at: string | null
  created_at: string
  updated_at: string
}

export interface User2FAInsert {
  user_id: string
  secret_encrypted: string
  backup_codes: string[]
  enabled?: boolean
  backup_codes_used?: string[]
}

export interface User2FAUpdate {
  secret_encrypted?: string
  backup_codes?: string[]
  enabled?: boolean
  backup_codes_used?: string[]
  verified_at?: string | null
}

// ============================================================================
// USER CONNECTED DEVICES
// ============================================================================
export interface UserConnectedDevice {
  id: string
  user_id: string
  device_name: string
  device_type: DeviceType | null
  device_os: string | null
  browser_name: string | null
  browser_version: string | null
  ip_address: string | null
  user_agent: string | null
  is_current: boolean
  last_active: string
  created_at: string
}

export interface UserConnectedDeviceInsert {
  user_id: string
  device_name: string
  device_type?: DeviceType | null
  device_os?: string | null
  browser_name?: string | null
  browser_version?: string | null
  ip_address?: string | null
  user_agent?: string | null
  is_current?: boolean
}

export interface UserConnectedDeviceUpdate {
  device_name?: string
  device_type?: DeviceType | null
  device_os?: string | null
  browser_name?: string | null
  browser_version?: string | null
  ip_address?: string | null
  user_agent?: string | null
  is_current?: boolean
  last_active?: string
}

// ============================================================================
// USER SESSION LOGS
// ============================================================================
export interface UserSessionLog {
  id: string
  user_id: string
  session_id: string
  device_id: string | null
  ip_address: string | null
  login_at: string
  logout_at: string | null
  last_activity: string
  user_agent: string | null
  status: SessionStatus
}

export interface UserSessionLogInsert {
  user_id: string
  session_id: string
  device_id?: string | null
  ip_address?: string | null
  login_at?: string
  logout_at?: string | null
  user_agent?: string | null
  status?: SessionStatus
}

export interface UserSessionLogUpdate {
  logout_at?: string | null
  last_activity?: string
  status?: SessionStatus
}

// ============================================================================
// USER COLLECTIONS
// ============================================================================
export interface UserCollection {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string | null
  is_public: boolean
  item_count: number
  created_at: string
  updated_at: string
}

export interface UserCollectionInsert {
  user_id: string
  name: string
  description?: string | null
  color?: string | null
  is_public?: boolean
}

export interface UserCollectionUpdate {
  name?: string
  description?: string | null
  color?: string | null
  is_public?: boolean
}

// ============================================================================
// COLLECTION ITEMS
// ============================================================================
export interface CollectionItem {
  id: string
  collection_id: string
  item_type: ItemType
  item_id: string
  item_data: Record<string, any> | null
  position: number | null
  added_at: string
}

export interface CollectionItemInsert {
  collection_id: string
  item_type: ItemType
  item_id: string
  item_data?: Record<string, any> | null
  position?: number | null
}

export interface CollectionItemUpdate {
  item_data?: Record<string, any> | null
  position?: number | null
}

// ============================================================================
// EXPORT JOBS
// ============================================================================
export interface ExportJob {
  id: string
  user_id: string
  export_type: ExportType
  resource_type: string
  status: ExportStatus
  file_url: string | null
  file_size: number | null
  row_count: number | null
  error_message: string | null
  created_at: string
  completed_at: string | null
  expires_at: string | null
}

export interface ExportJobInsert {
  user_id: string
  export_type: ExportType
  resource_type: string
  status?: ExportStatus
  file_url?: string | null
  file_size?: number | null
  row_count?: number | null
  error_message?: string | null
  expires_at?: string | null
}

export interface ExportJobUpdate {
  status?: ExportStatus
  file_url?: string | null
  file_size?: number | null
  row_count?: number | null
  error_message?: string | null
  completed_at?: string | null
}

// ============================================================================
// POSTS
// ============================================================================
export interface Post {
  id: string
  user_id: string
  title: string
  content: string
  excerpt: string | null
  tags: string[]
  thumbnail_url: string | null
  status: PostStatus
  view_count: number
  comment_count: number
  like_count: number
  created_at: string
  updated_at: string
  published_at: string | null
}

export interface PostInsert {
  user_id: string
  title: string
  content: string
  excerpt?: string | null
  tags?: string[]
  thumbnail_url?: string | null
  status?: PostStatus
  published_at?: string | null
}

export interface PostUpdate {
  title?: string
  content?: string
  excerpt?: string | null
  tags?: string[]
  thumbnail_url?: string | null
  status?: PostStatus
  published_at?: string | null
}

export interface PostWithAuthor extends Post {
  author: {
    id: string
    email: string
    user_metadata?: {
      full_name?: string
      avatar_url?: string
    }
  }
}

// ============================================================================
// POST COMMENTS
// ============================================================================
export interface PostComment {
  id: string
  post_id: string
  user_id: string
  parent_comment_id: string | null
  content: string
  like_count: number
  created_at: string
  updated_at: string
  edited_at: string | null
}

export interface PostCommentInsert {
  post_id: string
  user_id: string
  parent_comment_id?: string | null
  content: string
}

export interface PostCommentUpdate {
  content?: string
  edited_at?: string
}

export interface PostCommentWithAuthor extends PostComment {
  author: {
    id: string
    email: string
    user_metadata?: {
      full_name?: string
      avatar_url?: string
    }
  }
  replies?: PostCommentWithAuthor[]
}

// ============================================================================
// POST LIKES
// ============================================================================
export interface PostLike {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface PostLikeInsert {
  post_id: string
  user_id: string
}

// ============================================================================
// COMMENT LIKES
// ============================================================================
export interface CommentLike {
  id: string
  comment_id: string
  user_id: string
  created_at: string
}

export interface CommentLikeInsert {
  comment_id: string
  user_id: string
}
