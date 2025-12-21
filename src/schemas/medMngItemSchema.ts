import { z } from 'zod';

export const itemTagSchema = z.object({
  tags: z.object({
    name: z.string(),
  }),
});

export const itemSummarySchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  specialties: z
    .object({
      name: z.string(),
      code: z.string(),
    })
    .nullable()
    .optional(),
  type: z.enum(['EDN', 'ECOS', 'SD']),
  rang: z.enum(['A', 'B', 'AB']).nullable().optional(),
  created_at: z.string(),
  keywords: z.array(z.string()).nullable().optional(),
  item_tags: z.array(itemTagSchema).nullable().optional(),
  audios: z.array(z.object({ id: z.string() })).nullable().optional(),
});

export const itemNoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.any(),
  type: z.enum(['text', 'table', 'list', 'mixed']).nullable().optional(),
  rang: z.enum(['A', 'B', 'AB']).nullable().optional(),
});

export const itemAudioSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  stream_url: z.string().nullable().optional(),
  duration: z.number().nullable().optional(),
  rang: z.enum(['A', 'B', 'mix']),
  bpm: z.number().nullable().optional(),
  style: z.string().nullable().optional(),
});

export const itemDetailSchema = itemSummarySchema.extend({
  fiches: z.array(itemNoteSchema).nullable().optional(),
  audios: z.array(itemAudioSchema).nullable().optional(),
});

export const itemSummariesSchema = z.array(itemSummarySchema);
