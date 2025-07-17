export const QUOTAS = {
  FREE: {
    DAILY_SONGS: 5,
    MONTHLY_SONGS: 50,
    MAX_PLAYLIST_COUNT: 3,
    MAX_PLAYLIST_SONGS: 20,
  },
  PRO: {
    DAILY_SONGS: 20,
    MONTHLY_SONGS: 500,
    MAX_PLAYLIST_COUNT: -1, // unlimited
    MAX_PLAYLIST_SONGS: -1,
  },
} as const;

export const POINTS = {
  COMPLETE_SESSION: 10,
  PERFECT_QUIZ: 50,
  DAILY_STREAK: 5,
  WEEKLY_STREAK_BONUS: 50,
  MONTHLY_STREAK_BONUS: 200,
  FIRST_SONG: 20,
  SHARE_PLAYLIST: 15,
} as const;

export const ACHIEVEMENTS = {
  FIRST_STEPS: {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first learning session',
    points: 50,
    criteria: { sessions_completed: 1 },
  },
  STREAK_WEEK: {
    id: 'streak_week',
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    points: 100,
    criteria: { streak_days: 7 },
  },
  QUIZ_MASTER: {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Get 10 perfect quiz scores',
    points: 200,
    criteria: { perfect_quizzes: 10 },
  },
  SONG_CREATOR: {
    id: 'song_creator',
    name: 'Song Creator',
    description: 'Generate 25 medical songs',
    points: 150,
    criteria: { songs_created: 25 },
  },
} as const;
