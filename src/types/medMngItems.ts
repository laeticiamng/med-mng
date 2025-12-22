export type ItemStatus = 'not_started' | 'in_progress' | 'revised';

export type ItemRang = 'A' | 'B' | 'AB';

export interface ItemSummary {
  id: string;
  code: string;
  title: string;
  specialty: string | null;
  specialtyCode: string | null;
  itemType: 'EDN' | 'ECOS' | 'SD';
  rang: ItemRang | null;
  createdAt: string;
  keywords: string[];
  tags: string[];
  status: ItemStatus;
  lastSeenAt: string | null;
  isFavorite: boolean;
  revisionCount: number;
  score: number;
  hasAudio: boolean;
  popularityScore: number;
}

export interface ItemNote {
  id: string;
  title: string;
  content: string;
  contentType: 'text' | 'table' | 'list' | 'mixed';
  rang: ItemRang | null;
}

export interface ItemAudio {
  id: string;
  title: string;
  audioUrl: string;
  streamUrl: string | null;
  durationSeconds: number | null;
  rang: 'A' | 'B' | 'mix';
  bpm: number | null;
  style: string | null;
}

export interface ItemDetail extends ItemSummary {
  notes: ItemNote[];
  audios: ItemAudio[];
}

export interface ProgressItem {
  id: string;
  code: string;
  title: string;
  specialty: string | null;
  specialtyCode: string | null;
  itemType: 'EDN' | 'ECOS' | 'SD';
  status: ItemStatus;
  lastSeenAt: string | null;
  revisionCount: number;
}

export interface ProgressOverview {
  totalItems: number;
  revisedCount: number;
  inProgressCount: number;
  notStartedCount: number;
  streakCurrent: number;
  streakBest: number;
  weeklyGoal: number;
  weeklyRevisedCount: number;
  specialtyStats: Array<{
    specialty: string;
    total: number;
    revised: number;
  }>;
  recentActivity: Array<{
    date: string;
    revisedCount: number;
  }>;
  itemsToReview: ProgressItem[];
}
