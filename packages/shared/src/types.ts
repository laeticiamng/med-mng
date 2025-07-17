import { z } from 'zod';

// Enums
export const SubscriptionStatus = z.enum([
  'active',
  'cancelled',
  'past_due',
  'trialing',
]);
export const DifficultyLevel = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]);
export const ContentType = z.enum(['song', 'quiz', 'flashcard', 'article']);

// User schemas
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  specialization: z.string().nullable(),
  study_level: DifficultyLevel,
  daily_goal: z.number().int().positive(),
  streak_days: z.number().int().min(0),
  total_study_time: z.number().int().min(0),
  points: z.number().int().min(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Medical content schemas
export const MedicalTopicSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  category: z.string(),
  parent_id: z.string().uuid().nullable(),
  difficulty_level: DifficultyLevel,
  description: z.string().nullable(),
  icon_url: z.string().url().nullable(),
  order_index: z.number().int(),
});

export const SongSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  topic_id: z.string().uuid().nullable(),
  title: z.string(),
  artist: z.string().nullable(),
  suno_id: z.string().nullable(),
  audio_url: z.string().url().nullable(),
  image_url: z.string().url().nullable(),
  lyrics: z.string().nullable(),
  medical_content: z.record(z.any()).nullable(),
  duration: z.number().int().nullable(),
  play_count: z.number().int().default(0),
  is_public: z.boolean().default(false),
  status: z.enum(['pending', 'generating', 'completed', 'failed']).optional(),
  created_at: z.string().datetime(),
});

// Learning schemas
export const LearningSessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  content_id: z.string().uuid(),
  content_type: ContentType,
  topic_id: z.string().uuid().nullable(),
  started_at: z.string().datetime(),
  completed_at: z.string().datetime().nullable(),
  duration_seconds: z.number().int().nullable(),
  score: z.number().min(0).max(100).nullable(),
  notes: z.string().nullable(),
  feedback: z.record(z.any()).nullable(),
});

export const QuizQuestionSchema = z.object({
  id: z.string().uuid(),
  topic_id: z.string().uuid(),
  question: z.string(),
  options: z.array(
    z.object({
      text: z.string(),
      is_correct: z.boolean(),
      explanation: z.string().optional(),
    })
  ),
  difficulty_level: DifficultyLevel,
  explanation: z.string().nullable(),
  references: z.array(z.string()),
});

// API Request/Response schemas
export const CreateSongRequestSchema = z.object({
  topic_id: z.string().uuid(),
  prompt: z.string().min(10).max(500),
  medical_content: z
    .object({
      terms: z.array(z.string()).optional(),
      concepts: z.array(z.string()).optional(),
      mnemonics: z.string().optional(),
    })
    .optional(),
});

export const CompleteSessionRequestSchema = z.object({
  score: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  feedback: z
    .object({
      difficulty: z.enum(['too_easy', 'just_right', 'too_hard']).optional(),
      helpful: z.boolean().optional(),
      comments: z.string().optional(),
    })
    .optional(),
});

export const QuizAnswerRequestSchema = z.object({
  question_id: z.string().uuid(),
  topic_id: z.string().uuid(),
  selected_option: z.number().int().min(0),
  is_correct: z.boolean(),
});

// Type exports
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type MedicalTopic = z.infer<typeof MedicalTopicSchema>;
export type Song = z.infer<typeof SongSchema>;
export type LearningSession = z.infer<typeof LearningSessionSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type CreateSongRequest = z.infer<typeof CreateSongRequestSchema>;
export type CompleteSessionRequest = z.infer<
  typeof CompleteSessionRequestSchema
>;
export type QuizAnswerRequest = z.infer<typeof QuizAnswerRequestSchema>;
