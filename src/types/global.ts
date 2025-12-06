/**
 * 🎯 GLOBAL TYPE DEFINITIONS
 * Remplacement des 'any' par des types stricts et sécurisés
 */

// 🔒 STRICT UTILITY TYPES
export type StrictRecord<K extends string | number | symbol, V> = Record<K, V>;
export type SafeAny = unknown;
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];

// 🎵 MUSIC & AUDIO TYPES
export interface MusicMetadata {
  title: string;
  duration: number;
  format: 'mp3' | 'wav' | 'ogg';
  bitrate: number;
  sampleRate: number;
  size: number;
  createdAt: string;
  tags?: StrictRecord<string, string>;
}

export interface AudioTrack {
  id: string;
  url: string;
  metadata: MusicMetadata;
  isLoaded: boolean;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  error?: string;
}

export interface GeneratedSong {
  id: string;
  title: string;
  status: 'generating' | 'completed' | 'failed';
  audioUrl?: string;
  metadata?: MusicMetadata;
  lyrics?: string[];
  style: string;
  duration: number;
  createdAt: string;
  error?: string;
}

// 👤 USER & AUTHENTICATION
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  preferences: UserPreferences;
  subscription?: SubscriptionInfo;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en' | 'es' | 'de';
  notifications: NotificationSettings;
  accessibility: AccessibilitySettings;
  audio: AudioSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  progress: boolean;
  achievements: boolean;
  reminders: boolean;
  social: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  screenReader: boolean;
  keyboardNavigation: boolean;
}

export interface AudioSettings {
  masterVolume: number;
  autoplay: boolean;
  quality: 'low' | 'medium' | 'high';
  downloadFormat: 'mp3' | 'wav';
}

// 💳 SUBSCRIPTION & BILLING
export interface SubscriptionInfo {
  id: string;
  plan: 'free' | 'standard' | 'premium' | 'professional';
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  quota: QuotaLimits;
  usage: QuotaUsage;
}

export interface QuotaLimits {
  monthlyMusic: number;
  monthlyQCM: number;
  monthlyChat: number;
  storageGB: number;
  concurrentGenerations: number;
}

export interface QuotaUsage {
  monthlyMusicUsed: number;
  monthlyQCMUsed: number;
  monthlyChatUsed: number;
  storageUsedGB: number;
}

// 📚 EDUCATION & CONTENT
export interface EDNItem {
  id: string;
  itemCode: string;
  title: string;
  description?: string;
  rang: 'A' | 'B';
  content: EDNContent;
  competences: Competence[];
  analytics?: LearningAnalytics;
  lastUpdated: string;
}

export interface EDNContent {
  tableau?: StrictRecord<string, JSONValue>;
  paroles?: string[];
  quiz?: QuizQuestion[];
  scene?: ImmersiveScene;
  bandeDessinee?: ComicPanelData[];
  interactions?: InteractionConfig[];
}

export interface ComicPanelData {
  id: string;
  image: string;
  text: string;
  order: number;
}

export interface Competence {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export interface ImmersiveScene {
  id: string;
  title: string;
  setting: string;
  characters: Character[];
  scenarios: Scenario[];
  learningObjectives: string[];
}

export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar?: string;
}

export interface Scenario {
  id: string;
  description: string;
  interactions: Interaction[];
  outcomes: Outcome[];
}

export interface Interaction {
  id: string;
  type: 'choice' | 'input' | 'diagnostic' | 'treatment';
  prompt: string;
  options?: string[];
  validation?: ValidationRule;
}

export interface Outcome {
  id: string;
  interactionId: string;
  result: 'success' | 'partial' | 'failure';
  feedback: string;
  nextScenario?: string;
}

export interface ValidationRule {
  type: 'exact' | 'contains' | 'regex' | 'range';
  value: string | number;
  caseSensitive?: boolean;
}

// 🎨 UI & FORM TYPES
export interface FormField<T = string> {
  value: T;
  error?: string;
  touched: boolean;
  valid: boolean;
}

export interface FormState<T extends StrictRecord<string, unknown>> {
  fields: { [K in keyof T]: FormField<T[K]> };
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string;
}

export interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// 📊 ANALYTICS & MONITORING
export interface LearningAnalytics {
  userId: string;
  itemId: string;
  timeSpent: number;
  completionRate: number;
  interactionCount: number;
  lastAccessed: string;
  performance: PerformanceMetrics;
}

export interface PerformanceMetrics {
  averageScore: number;
  improvement: number;
  streakDays: number;
  badges: Badge[];
  weakAreas: string[];
  strongAreas: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: string;
}

// 🔔 NOTIFICATIONS & MESSAGING
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  category: 'system' | 'progress' | 'achievement' | 'social';
  read: boolean;
  actions?: NotificationAction[];
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationAction {
  id: string;
  label: string;
  type: 'button' | 'link';
  url?: string;
  action?: string;
  style: 'primary' | 'secondary' | 'danger';
}

// 🚨 ERROR HANDLING
export interface AppError {
  code: string;
  message: string;
  details?: StrictRecord<string, JSONValue>;
  timestamp: string;
  userId?: string;
  stack?: string;
  context?: string;
}

export interface APIResponse<T = JSONValue> {
  success: boolean;
  data?: T;
  error?: AppError;
  metadata?: StrictRecord<string, JSONValue>;
}

// 🎭 COMPONENT PROPS UTILITIES
export type PropsWithChildrenAndClassName<P = {}> = P & {
  children?: React.ReactNode;
  className?: string;
};

export type ComponentVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// 🌐 INTERNATIONALIZATION
export interface TranslationKey extends StrictRecord<string, string | StrictRecord<string, string>> {}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
  flag: string;
}

// 🔍 SEARCH & FILTERING
export interface SearchFilters {
  query?: string;
  category?: string;
  rang?: 'A' | 'B';
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  dateRange?: DateRange;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  facets: SearchFacets;
  pagination: PaginationData;
}

export interface SearchFacets {
  categories: FacetCount[];
  tags: FacetCount[];
  ranges: FacetCount[];
}

export interface FacetCount {
  value: string;
  count: number;
  selected: boolean;
}

// 🎥 MEDIA & FILES
export interface FileUpload {
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  url?: string;
}

export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'video' | 'document';
  url: string;
  size: number;
  mimeType: string;
  metadata: StrictRecord<string, JSONValue>;
  uploadedAt: string;
}

// 🎮 INTERACTIONS & EVENTS
export interface InteractionEvent {
  type: string;
  target: string;
  data: StrictRecord<string, JSONValue>;
  timestamp: string;
  userId?: string;
}

export interface InteractionConfig {
  id: string;
  type: 'click' | 'hover' | 'scroll' | 'focus' | 'input';
  trigger: string;
  action: string;
  data?: StrictRecord<string, JSONValue>;
  enabled: boolean;
}

// 📱 RESPONSIVE & DEVICE
export type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  breakpoint: BreakpointKey;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  touchSupported: boolean;
}

// ⚡ PERFORMANCE & OPTIMIZATION
export interface PerformanceEntry {
  name: string;
  type: 'navigation' | 'resource' | 'measure' | 'mark';
  startTime: number;
  duration: number;
  details?: StrictRecord<string, JSONValue>;
}

export interface BundleAnalysis {
  chunks: ChunkInfo[];
  totalSize: number;
  gzippedSize: number;
  duplicates: string[];
  unusedModules: string[];
}

export interface ChunkInfo {
  name: string;
  size: number;
  gzippedSize: number;
  modules: string[];
  isEntry: boolean;
}

// 🔄 STATE MANAGEMENT
export type ActionType<T extends string = string> = {
  type: T;
  payload?: JSONValue;
  meta?: StrictRecord<string, JSONValue>;
};

export interface StoreState {
  user: UserProfile | null;
  audio: AudioState;
  ui: UIState;
  learning: LearningState;
  notifications: NotificationState;
}

export interface AudioState {
  currentTrack: AudioTrack | null;
  playlist: AudioTrack[];
  volume: number;
  muted: boolean;
  repeat: 'off' | 'one' | 'all';
  shuffle: boolean;
}

export interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  loading: boolean;
  modal: ModalState | null;
  toast: ToastState[];
}

export interface ModalState {
  id: string;
  type: string;
  props: StrictRecord<string, JSONValue>;
  closable: boolean;
}

export interface ToastState {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration: number;
  actions?: NotificationAction[];
}

export interface LearningState {
  currentItem: EDNItem | null;
  progress: StrictRecord<string, number>;
  history: string[];
  bookmarks: string[];
  achievements: Badge[];
}

export interface NotificationState {
  items: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
}

// 🔐 SECURITY & PERMISSIONS
export interface Permission {
  resource: string;
  action: 'read' | 'write' | 'delete' | 'admin';
  granted: boolean;
  condition?: string;
}

export interface SecurityContext {
  user: UserProfile;
  permissions: Permission[];
  roles: string[];
  session: SessionInfo;
}

export interface SessionInfo {
  id: string;
  userId: string;
  expiresAt: string;
  lastActivity: string;
  ipAddress: string;
  userAgent: string;
}