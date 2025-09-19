import { nanoid } from 'nanoid';
import { generateMusic, type GenerateMusicPayload, type GenerateMusicResponse } from '@/music/generate';
import { extendMusic, type ExtendMusicPayload } from '@/music/extend';
import { getMusicStatus, type MusicStatus } from '@/music/status';
import { useMusicQueueStore } from '@/stores/musicQueueStore';
import type { MusicJob, MusicJobSegment } from '@/types/music';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import {
  buildStyleBrief,
  createSunoPrompt,
  generateStructuredLyrics,
  loadItemContext,
  summariseCompetences,
  type MusicMode,
  type StyleBrief,
} from '@/services/music/itemPromptService';
import { buildFinalMix } from './music/audioPostProcessor';
import { logger } from '@/utils/structuredLogger';
import { trackCanonicalEvent } from '@/services/CanonicalAnalyticsTracker';

export const POLL_INTERVAL = 5000;
export const MAX_POLL_ATTEMPTS = 48; // 4 minutes de suivi par segment
export const DEFAULT_TARGET_DURATION = 180; // 3 minutes
export const DEFAULT_SEGMENT_DURATION = 60; // 1 minute par segment
export const MAX_RETRIES = 3;
export const MIN_SEGMENTS = 3;
export const MAX_SEGMENTS = 5;
export const MIN_SEGMENT_DURATION = 30;
export const RETRY_BASE_DELAY_MS = 5000;
export const RETRY_MAX_DELAY_MS = 60000;

type GeneratedMusicTrackInsert = Database['public']['Tables']['generated_music_tracks']['Insert'];
type GeneratedMusicTrackUpdate = Database['public']['Tables']['generated_music_tracks']['Update'];

const MODE_LABEL: Record<MusicMode, string> = {
  A: 'Rang A',
  B: 'Rang B',
  AB: 'Mix A+B',
};

const SENSITIVE_LOG_KEYS = ['prompt', 'lyrics', 'token', 'secret', 'key', 'authorization', 'payload'];

function sanitizeLogValue(value: unknown, depth = 0): unknown {
  if (depth > 3) {
    return '[redacted]';
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [];
    }

    return value.slice(0, 5).map((entry) => sanitizeLogValue(entry, depth + 1));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => {
        const lowerKey = key.toLowerCase();
        if (SENSITIVE_LOG_KEYS.some((candidate) => lowerKey.includes(candidate))) {
          return [key, '[redacted]'];
        }
        return [key, sanitizeLogValue(entry, depth + 1)];
      }),
    );
  }

  if (typeof value === 'string') {
    if (value.length > 160) {
      return `${value.slice(0, 120)}…[truncated]`;
    }
    return value;
  }

  return value;
}

export interface CreateMusicJobOptions {
  payload: GenerateMusicPayload;
  targetDuration?: number;
  segmentDuration?: number;
  metadata?: Record<string, unknown>;
  maxRetries?: number;
  resume?: boolean;
}

export interface OrchestratorEvent {
  type:
    | 'job-started'
    | 'job-updated'
    | 'job-completed'
    | 'job-failed'
    | 'job-canceled'
    | 'segment-started'
    | 'segment-updated'
    | 'segment-completed'
    | 'segment-failed';
  job: MusicJob;
  segment?: MusicJobSegment;
  error?: string;
}

type EventListener = (event: OrchestratorEvent) => void;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function computeSha256(value: string): Promise<string> {
  try {
    const cryptoObject = (globalThis as unknown as { crypto?: Crypto }).crypto;
    if (!cryptoObject?.subtle) {
      return value;
    }
    const encoder = new TextEncoder();
    const encoded = encoder.encode(value);
    const hashBuffer = await cryptoObject.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.warn('[musicOrchestrator] Unable to compute SHA-256 hash', error);
    return value;
  }
}

interface EnqueueItemGenerationOptions {
  itemCode: string;
  itemId?: string;
  mode: MusicMode;
  style?: string;
  duration?: number;
  segmentDuration?: number;
  metadata?: Record<string, unknown>;
}

export function isFailureStatus(status: MusicStatus['status']): boolean {
  return (
    status === 'CREATE_TASK_FAILED' ||
    status === 'GENERATE_AUDIO_FAILED' ||
    status === 'CALLBACK_EXCEPTION' ||
    status === 'SENSITIVE_WORD_ERROR'
  );
}

export function statusToProgress(status: MusicStatus['status']): number {
  switch (status) {
    case 'PENDING':
      return 5;
    case 'TEXT_SUCCESS':
      return 25;
    case 'FIRST_SUCCESS':
      return 70;
    case 'SUCCESS':
      return 100;
    default:
      return 0;
  }
}

export function createJobFromOptions(options: CreateMusicJobOptions): MusicJob {
  const targetDuration = Math.max(options.targetDuration ?? DEFAULT_TARGET_DURATION, MIN_SEGMENT_DURATION);
  const requestedSegmentDuration = Math.min(
    Math.max(options.segmentDuration ?? DEFAULT_SEGMENT_DURATION, MIN_SEGMENT_DURATION),
    targetDuration,
  );
  const desiredSegmentCount = Math.ceil(targetDuration / requestedSegmentDuration);
  const segmentCount = Math.max(MIN_SEGMENTS, Math.min(MAX_SEGMENTS, desiredSegmentCount));
  const normalizedSegmentDuration = Math.max(
    MIN_SEGMENT_DURATION,
    Math.round(targetDuration / segmentCount),
  );
  const now = Date.now();

  const jobId = nanoid();
  const requestId = (options.metadata?.requestId as string | undefined) ?? nanoid();
  const segments: MusicJobSegment[] = Array.from({ length: segmentCount }, (_, index) => ({
    id: `${jobId}-segment-${index + 1}`,
    index,
    status: 'pending',
    progress: 0,
  }));

  return {
    id: jobId,
    requestId,
    createdAt: now,
    updatedAt: now,
    status: 'queued',
    progress: 0,
    targetDuration,
    segmentDuration: normalizedSegmentDuration,
    retryCount: 0,
    maxRetries: options.maxRetries ?? MAX_RETRIES,
    payload: options.payload,
    segments,
    error: null,
    backoffUntil: undefined,
    metadata: { ...options.metadata, requestId, createdAt: now },
  };
}

class MusicOrchestrator {
  private processingJobId?: string;
  private listeners = new Set<EventListener>();
  private bootstrapDone = false;
  private backoffTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    if (typeof window === 'undefined') {
      this.bootstrapDone = true;
      return;
    }

    const maybePersist = (useMusicQueueStore as unknown as {
      persist?: {
        onFinish?: (cb: () => void) => void;
        hasHydrated?: () => boolean;
      };
    }).persist;

    const hydrate = () => {
      this.resumePendingJobs();
      this.bootstrapDone = true;
    };

    if (maybePersist?.hasHydrated?.()) {
      hydrate();
    } else if (maybePersist?.onFinish) {
      maybePersist.onFinish(hydrate);
    } else {
      setTimeout(hydrate, 100);
    }

    useMusicQueueStore.subscribe(
      (state) => ({ queue: state.queue, activeJobId: state.activeJobId }),
      () => this.processQueue(),
      { fireImmediately: true },
    );
  }

  addListener(listener: EventListener) {
    this.listeners.add(listener);
  }

  removeListener(listener: EventListener) {
    this.listeners.delete(listener);
  }

  async enqueueItemGeneration(options: EnqueueItemGenerationOptions): Promise<MusicJob> {
    let userId: string | null = null;
    try {
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id ?? null;
    } catch (error) {
      console.warn('[musicOrchestrator] Unable to resolve user for Supabase persistence', error);
    }

    const runId = nanoid();
    const context = await loadItemContext({ itemId: options.itemId, itemCode: options.itemCode });
    const summary = summariseCompetences(context, options.mode);
    const lyricsResult = await generateStructuredLyrics(context.itemCode, options.mode, summary);
    const brief = buildStyleBrief(options.style, options.mode);
    const sunoPrompt = createSunoPrompt(context, options.mode, summary, brief, lyricsResult.lines);
    const promptHash = await computeSha256(`${sunoPrompt}\n${lyricsResult.lines.join('\n')}`);
    const callbackUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/api/music/status`
        : 'https://example.com/api/music/status';

    const baseMetadata: Record<string, unknown> = {
      ...options.metadata,
      itemId: context.itemId,
      itemCode: context.itemCode,
      itemTitle: context.title,
      slug: context.slug ?? undefined,
      mode: options.mode,
      styleInput: options.style ?? 'éducatif moderne',
      styleResolved: brief.styleTag,
      styleBrief: brief,
      competenceSummary: summary,
      lyrics: lyricsResult.lines,
      lyricsSource: lyricsResult.source,
      openaiPrompt: sunoPrompt,
      openaiPromptHash: promptHash,
      userId,
      runId,
    };

    const job = await this.enqueueJob({
      payload: {
        prompt: sunoPrompt,
        style: brief.styleTag,
        title: `${context.itemCode} • ${MODE_LABEL[options.mode]}`,
        customMode: true,
        instrumental: false,
        model: 'V4_5',
        callBackUrl: callbackUrl,
      },
      targetDuration: options.duration ?? DEFAULT_TARGET_DURATION,
      segmentDuration: options.segmentDuration,
      metadata: baseMetadata,
    });

    const trackId = (job.metadata?.trackId as string | undefined) ?? job.id;
    useMusicQueueStore.getState().updateJob(job.id, (draft) => {
      draft.metadata = {
        ...(draft.metadata ?? {}),
        trackId,
        supabaseTrackId: trackId,
        userId,
      } satisfies Record<string, unknown>;
    });

    void trackCanonicalEvent({
      type: 'generate_start',
      contentId: trackId,
      metadata: {
        item_code: context.itemCode,
        item_id: context.itemId,
        item_title: context.title,
        mode: options.mode,
        style_requested: options.style ?? null,
        style_resolved: brief.styleTag,
        target_duration_seconds: job.targetDuration,
        segment_count: job.segments.length,
        run_id: runId,
      },
    });

    await this.persistTrackRecord(job.id);
    this.log(job.id, 'info', 'Item generation enqueued', {
      itemId: context.itemId,
      itemCode: context.itemCode,
      mode: options.mode,
      style: brief.styleTag,
      summaryCount: summary.length,
      lyricsSource: lyricsResult.source,
    });

    return useMusicQueueStore.getState().jobs[job.id] ?? job;
  }

  async enqueueJob(options: CreateMusicJobOptions): Promise<MusicJob> {
    const job = createJobFromOptions(options);
    useMusicQueueStore.getState().enqueueJob(job);
    this.log(job.id, 'info', 'Job enqueued', {
      targetDuration: job.targetDuration,
      segmentDuration: job.segmentDuration,
      segmentCount: job.segments.length,
    });
    this.emit({ type: 'job-updated', job });
    await this.waitForBootstrap();
    this.processQueue();
    return job;
  }

  cancelJob(jobId: string, reason?: string) {
    useMusicQueueStore.getState().cancelJob(jobId, reason);
    const job = useMusicQueueStore.getState().jobs[jobId];
    if (job) {
      this.emit({ type: 'job-canceled', job, error: reason ?? 'Job canceled' });
      this.log(jobId, 'warn', 'Job canceled', { reason });
    }

    void this.updateTrackRecord(jobId, { status: 'canceled', generation_status: 'canceled' });

    if (this.processingJobId === jobId) {
      this.processingJobId = undefined;
      this.processQueue();
    }
  }

  async retryJob(jobId: string) {
    const store = useMusicQueueStore.getState();
    const job = store.jobs[jobId];
    if (!job) return;

    store.updateJob(jobId, (draft) => {
      draft.status = 'queued';
      draft.error = null;
      draft.retryCount = 0;
      draft.backoffUntil = undefined;
      draft.segments.forEach((segment) => {
        segment.status = 'pending';
        segment.progress = 0;
        segment.error = null;
        segment.taskId = undefined;
      });
    });
    store.requeueJob(jobId);
    this.emit({ type: 'job-updated', job: store.jobs[jobId] });
    this.log(jobId, 'info', 'Manual retry requested');
    await this.updateTrackRecord(jobId, {
      status: 'queued',
      generation_status: 'pending',
      task_id: null,
      suno_job_id: null,
      audio_url: null,
      image_url: null,
      stream_url: null,
      suno_track_id: null,
    });
    await this.waitForBootstrap();
    this.processQueue();
  }

  resumePendingJobs() {
    const store = useMusicQueueStore.getState();
    const pendingJobs = Object.values(store.jobs).filter((job) =>
      job.status === 'running' || job.status === 'queued' || job.status === 'paused',
    );

    pendingJobs
      .sort((a, b) => a.createdAt - b.createdAt)
      .forEach((job) => {
        store.requeueJob(job.id);
        this.log(job.id, 'info', 'Resuming pending job after bootstrap');
      });

    this.processQueue();
  }

  private async waitForBootstrap() {
    if (this.bootstrapDone) return;
    while (!this.bootstrapDone) {
      await sleep(50);
    }
  }

  private emit(event: OrchestratorEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('[musicOrchestrator] Listener error', error);
      }
    });
  }

  private getTrackId(job: MusicJob): string {
    if (job.metadata && typeof job.metadata === 'object' && job.metadata) {
      const metadata = job.metadata as { supabaseTrackId?: string };
      if (metadata.supabaseTrackId) {
        return metadata.supabaseTrackId;
      }
    }
    return job.id;
  }

  private buildTrackMetadata(job: MusicJob): Record<string, unknown> {
    const base = job.metadata && typeof job.metadata === 'object' ? { ...(job.metadata as Record<string, unknown>) } : {};
    base.jobStatus = job.status;
    base.progress = job.progress;
    base.retryCount = job.retryCount;
    base.maxRetries = job.maxRetries;
    base.segments = job.segments.map((segment) => ({
      id: segment.id,
      index: segment.index,
      status: segment.status,
      progress: segment.progress,
      taskId: segment.taskId ?? null,
      audioId: segment.audioId ?? null,
      audioUrl: segment.audioUrl ?? null,
      imageUrl: segment.imageUrl ?? null,
      duration: segment.duration ?? null,
      error: segment.error ?? null,
      startedAt: segment.startedAt ?? null,
      completedAt: segment.completedAt ?? null,
    }));
    if (job.finalMixUrl) {
      base.finalMixUrl = job.finalMixUrl;
    }
    if (job.loudnessNormalization) {
      base.loudnessNormalization = job.loudnessNormalization;
    }
    if (job.completedAt) {
      base.completedAt = job.completedAt;
    }
    base.updatedAt = new Date().toISOString();
    base.supabaseTrackId = this.getTrackId(job);
    return base;
  }

  private async persistTrackRecord(jobId: string) {
    const job = useMusicQueueStore.getState().jobs[jobId];
    if (!job) {
      return;
    }
    if (job.metadata && typeof job.metadata === 'object') {
      const metadataObject = job.metadata as Record<string, unknown>;
      if (metadataObject.supabaseTrackPersisted === true) {
        return;
      }
      if (!metadataObject.itemId || !metadataObject.itemCode) {
        this.log(jobId, 'warn', 'Missing item metadata, skipping Supabase persistence');
        return;
      }

      const trackId = this.getTrackId(job);
      const insert: GeneratedMusicTrackInsert = {
        id: trackId,
        item_id: metadataObject.itemId as string,
        title:
          typeof metadataObject.itemTitle === 'string' && metadataObject.itemTitle
            ? (metadataObject.itemTitle as string)
            : `${metadataObject.itemCode as string} • ${MODE_LABEL[(metadataObject.mode as MusicMode) ?? 'A']}`,
        mode: (metadataObject.mode as MusicMode) ?? 'A',
        style:
          (metadataObject.styleResolved as string | undefined) ??
          (metadataObject.styleInput as string | undefined) ??
          'éducatif moderne',
        duration: job.targetDuration,
        status: 'queued',
        generation_status: 'pending',
        openai_prompt_hash: (metadataObject.openaiPromptHash as string | undefined) ?? null,
        metadata: this.buildTrackMetadata(job),
        user_id: (metadataObject.userId as string | undefined) ?? null,
      } satisfies GeneratedMusicTrackInsert;

      try {
        const { error } = await supabase.from('generated_music_tracks').insert(insert);
        if (error) {
          this.log(jobId, 'warn', 'Failed to persist Supabase track', { error: error.message });
          return;
        }

        useMusicQueueStore.getState().updateJob(jobId, (draft) => {
          draft.metadata = {
            ...(draft.metadata ?? {}),
            supabaseTrackPersisted: true,
            supabaseTrackId: trackId,
          } satisfies Record<string, unknown>;
        });
      } catch (error) {
        this.log(jobId, 'warn', 'Unexpected Supabase persistence failure', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  private async updateTrackRecord(jobId: string, patch: GeneratedMusicTrackUpdate) {
    const job = useMusicQueueStore.getState().jobs[jobId];
    if (!job) {
      return;
    }
    if (!job.metadata || typeof job.metadata !== 'object') {
      return;
    }
    const metadataObject = job.metadata as Record<string, unknown>;
    if (metadataObject.supabaseTrackPersisted !== true) {
      return;
    }

    const updatePayload: GeneratedMusicTrackUpdate = {
      ...patch,
      metadata: this.buildTrackMetadata(job),
      updated_at: new Date().toISOString(),
    } satisfies GeneratedMusicTrackUpdate;

    try {
      const { error } = await supabase
        .from('generated_music_tracks')
        .update(updatePayload)
        .eq('id', this.getTrackId(job));
      if (error) {
        this.log(jobId, 'warn', 'Supabase track update failed', { error: error.message });
      }
    } catch (error) {
      this.log(jobId, 'warn', 'Unexpected Supabase track update failure', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async processQueue() {
    if (this.processingJobId) {
      return;
    }

    const nextJob = useMusicQueueStore.getState().startNextJob();
    if (!nextJob) {
      this.scheduleNextWakeup();
      return;
    }

    this.processingJobId = nextJob.id;
    this.clearBackoffTimer();
    this.log(nextJob.id, 'info', 'Job started');
    this.emit({ type: 'job-started', job: { ...nextJob } });

    await this.updateTrackRecord(nextJob.id, {
      status: 'running',
      generation_status: 'generating',
    });

    try {
      await this.runJob(nextJob.id);
      const completedJob = useMusicQueueStore.getState().jobs[nextJob.id];
      if (completedJob) {
        this.emit({ type: 'job-completed', job: completedJob });
        this.log(nextJob.id, 'info', 'Job completed successfully', {
          totalSegments: completedJob.segments.length,
          duration: completedJob.targetDuration,
        });

        const successfulSegments = completedJob.segments.filter((segment) => segment.status === 'success');
        const representativeSegment = [...successfulSegments].reverse().find((segment) => segment.audioUrl);
        const finalMixDuration =
          typeof completedJob.metadata?.finalMixDuration === 'number'
            ? Math.round(completedJob.metadata.finalMixDuration)
            : undefined;
        const derivedDuration = Math.max(
          0,
          successfulSegments.reduce(
            (max, segment) => (segment.duration ? Math.max(max, Math.round(segment.duration)) : max),
            0,
          ),
        );
        const resolvedDuration = finalMixDuration ?? (derivedDuration > 0 ? derivedDuration : null);

        await this.updateTrackRecord(nextJob.id, {
          status: 'completed',
          generation_status: 'completed',
          duration: resolvedDuration ?? undefined,
          audio_url: representativeSegment?.audioUrl ?? null,
          image_url: representativeSegment?.imageUrl ?? null,
          suno_track_id: representativeSegment?.audioId ?? null,
          stream_url: representativeSegment?.audioUrl ?? null,
        });

        const completedMetadata = (completedJob.metadata ?? {}) as Record<string, unknown>;
        const successfulSunoJobId =
          typeof completedMetadata.suno_job_id === 'string'
            ? (completedMetadata.suno_job_id as string)
            : representativeSegment?.taskId ?? undefined;
        const resolvedDurationSeconds = typeof resolvedDuration === 'number' ? resolvedDuration : undefined;

        void trackCanonicalEvent({
          type: 'generate_success',
          contentId: this.getTrackId(completedJob),
          metadata: {
            item_code: typeof completedMetadata.itemCode === 'string' ? completedMetadata.itemCode : undefined,
            item_id: typeof completedMetadata.itemId === 'string' ? completedMetadata.itemId : undefined,
            item_title: typeof completedMetadata.itemTitle === 'string' ? completedMetadata.itemTitle : undefined,
            mode: completedMetadata.mode ?? undefined,
            style_resolved: completedMetadata.styleResolved ?? completedMetadata.styleInput ?? undefined,
            run_id: completedMetadata.runId ?? completedJob.id,
            suno_job_id: successfulSunoJobId,
            segment_count: completedJob.segments.length,
            duration_ms: resolvedDurationSeconds ? Math.max(0, Math.round(resolvedDurationSeconds * 1000)) : undefined,
          },
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur orchestrateur';
      const store = useMusicQueueStore.getState();
      const job = store.jobs[nextJob.id];
      if (!job) {
        console.error('[musicOrchestrator] Job introuvable lors de l\'échec', nextJob.id);
      } else if (job.retryCount < job.maxRetries) {
        const now = Date.now();
        store.updateJob(nextJob.id, (draft) => {
          draft.retryCount += 1;
          draft.status = 'queued';
          draft.error = message;
          const delay = this.computeBackoffMs(draft.retryCount);
          draft.backoffUntil = now + delay;
          draft.segments.forEach((segment) => {
            if (segment.status === 'failed') {
              segment.status = 'pending';
              segment.error = null;
              segment.progress = 0;
              segment.taskId = undefined;
            }
          });
        });
        store.requeueJob(nextJob.id);
        const updatedJob = store.jobs[nextJob.id];
        this.emit({ type: 'job-updated', job: updatedJob, error: message });
        this.log(nextJob.id, 'warn', 'Job scheduled for retry', {
          retryCount: updatedJob?.retryCount,
          maxRetries: updatedJob?.maxRetries,
          backoffUntil: updatedJob?.backoffUntil,
          error: message,
        });
        await this.updateTrackRecord(nextJob.id, {
          status: 'queued',
          generation_status: 'pending',
          task_id: null,
          suno_job_id: null,
          audio_url: null,
          image_url: null,
          stream_url: null,
          suno_track_id: null,
        });
        this.scheduleNextWakeup();
      } else {
        useMusicQueueStore.getState().setJobStatus(nextJob.id, 'failed', message);
        const failedJob = useMusicQueueStore.getState().jobs[nextJob.id];
        if (failedJob) {
          this.emit({ type: 'job-failed', job: failedJob, error: message });
          this.log(nextJob.id, 'error', 'Job failed permanently', {
            retryCount: failedJob.retryCount,
            maxRetries: failedJob.maxRetries,
            error: message,
          });

          const failedMetadata = (failedJob.metadata ?? {}) as Record<string, unknown>;
          const failedSunoJobId =
            typeof failedMetadata.suno_job_id === 'string'
              ? (failedMetadata.suno_job_id as string)
              : failedJob.segments.find((segment) => typeof segment.taskId === 'string')?.taskId;

          void trackCanonicalEvent({
            type: 'generate_fail',
            contentId: this.getTrackId(failedJob),
            metadata: {
              item_code: typeof failedMetadata.itemCode === 'string' ? failedMetadata.itemCode : undefined,
              item_id: typeof failedMetadata.itemId === 'string' ? failedMetadata.itemId : undefined,
              item_title: typeof failedMetadata.itemTitle === 'string' ? failedMetadata.itemTitle : undefined,
              mode: failedMetadata.mode ?? undefined,
              style_resolved: failedMetadata.styleResolved ?? failedMetadata.styleInput ?? undefined,
              run_id: failedMetadata.runId ?? failedJob.id,
              suno_job_id: failedSunoJobId,
              retry_count: failedJob.retryCount,
              max_retries: failedJob.maxRetries,
              error: message,
            },
          });
        }
        await this.updateTrackRecord(nextJob.id, {
          status: 'failed',
          generation_status: 'failed',
          audio_url: null,
          image_url: null,
          stream_url: null,
          suno_track_id: null,
        });
      }
    } finally {
      this.processingJobId = undefined;
      setTimeout(() => this.processQueue(), 0);
    }
  }

  private async runJob(jobId: string) {
    const store = useMusicQueueStore.getState();
    const job = store.jobs[jobId];
    if (!job) throw new Error('Job introuvable');

    this.log(jobId, 'info', 'Processing job segments', { segmentCount: job.segments.length });
    for (const segment of job.segments) {
      if (this.shouldAbort(jobId)) {
        throw new Error('Job annulé');
      }

      if (segment.status === 'success') {
        continue; // reprise après crash
      }

      await this.processSegment(jobId, segment.index);
    }

    await this.finalizeJob(jobId);
    store.setJobStatus(jobId, 'success');
    store.updateJob(jobId, (draft) => {
      draft.completedAt = Date.now();
      draft.error = null;
    });
  }

  private shouldAbort(jobId: string) {
    const job = useMusicQueueStore.getState().jobs[jobId];
    return !job || job.status === 'canceled';
  }

  private async processSegment(jobId: string, segmentIndex: number) {
    const store = useMusicQueueStore.getState();
    const job = store.jobs[jobId];
    if (!job) throw new Error('Job introuvable');
    const segment = job.segments[segmentIndex];
    if (!segment) throw new Error('Segment introuvable');

    if (segment.status === 'success') {
      return;
    }

    store.setSegmentStatus(jobId, segment.id, 'generating');
    this.log(jobId, 'info', 'Segment started', { segmentId: segment.id, index: segment.index });
    this.emit({ type: 'segment-started', job: store.jobs[jobId], segment: { ...segment } });

    const payload = { ...job.payload };
    let response: GenerateMusicResponse | undefined;

    try {
      if (segmentIndex === 0 || !job.segments[segmentIndex - 1]?.audioId) {
        response = await generateMusic(payload);
      } else {
        const previous = job.segments[segmentIndex - 1];
        if (!previous.audioId) {
          throw new Error('Segment précédent sans audioId');
        }
        const extendPayload: ExtendMusicPayload = {
          defaultParamFlag: false,
          audioId: previous.audioId,
          callBackUrl: payload.callBackUrl,
          model: payload.model,
        };
        response = await extendMusic(extendPayload);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur génération segment';
      const storeAfterError = useMusicQueueStore.getState();
      storeAfterError.setSegmentStatus(jobId, segment.id, 'failed', message);
      const failedJob = storeAfterError.jobs[jobId];
      if (failedJob) {
        this.emit({
          type: 'segment-failed',
          job: failedJob,
          segment: failedJob.segments.find((s) => s.id === segment.id),
          error: message,
        });
      }
      this.log(jobId, 'warn', 'Segment failed', { segmentId: segment.id, error: message });
      throw error instanceof Error ? error : new Error(message);
    }

    if (!response?.taskId) {
      throw new Error('Aucun taskId reçu pour le segment');
    }

    store.updateSegment(jobId, segment.id, { taskId: response.taskId });
    await this.updateTrackRecord(jobId, {
      status: 'running',
      task_id: response.taskId,
      suno_job_id: response.taskId,
      generation_status: 'generating',
    });
    await this.pollSegment(jobId, segment.id, response.taskId);
  }

  private async pollSegment(jobId: string, segmentId: string, taskId: string) {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
      if (this.shouldAbort(jobId)) {
        useMusicQueueStore.getState().setSegmentStatus(jobId, segmentId, 'canceled', 'Job annulé');
        return;
      }

      try {
        const status = await getMusicStatus(taskId);
        this.handleStatusUpdate(jobId, segmentId, status);

        if (status.status === 'SUCCESS') {
          return;
        }

        if (isFailureStatus(status.status)) {
          throw new Error(`Échec segment (${status.status})`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur polling segment';
        const store = useMusicQueueStore.getState();
        store.setSegmentStatus(jobId, segmentId, 'failed', message);
        this.emit({
          type: 'segment-failed',
          job: store.jobs[jobId],
          segment: store.jobs[jobId]?.segments.find((s) => s.id === segmentId),
          error: message,
        });
        this.log(jobId, 'warn', 'Polling failed for segment', { segmentId, error: message });
        await this.updateTrackRecord(jobId, {
          status: 'failed',
          generation_status: 'failed',
          audio_url: null,
          image_url: null,
          stream_url: null,
          suno_track_id: null,
        });
        throw error;
      }

      await sleep(POLL_INTERVAL);
    }

    throw new Error('Timeout polling segment');
  }

  private handleStatusUpdate(jobId: string, segmentId: string, status: MusicStatus) {
    const progress = statusToProgress(status.status);
    const store = useMusicQueueStore.getState();
    store.updateSegment(jobId, segmentId, (segment) => {
      segment.progress = progress;
    });

    if (status.status === 'SUCCESS') {
      const audio = status.data?.audio?.[0];
      store.updateSegment(jobId, segmentId, {
        status: 'success',
        audioId: audio?.id,
        audioUrl: audio?.audio_url,
        imageUrl: audio?.image_url,
        duration: audio?.duration,
        completedAt: Date.now(),
      });
      void this.updateTrackRecord(jobId, {
        generation_status: 'generating',
        audio_url: audio?.audio_url ?? null,
        image_url: audio?.image_url ?? null,
        suno_track_id: audio?.id ?? null,
        duration: audio?.duration ? Math.round(audio.duration) : undefined,
        stream_url: audio?.audio_url ?? null,
      });
      const job = store.jobs[jobId];
      if (job) {
        this.emit({ type: 'segment-completed', job, segment: { ...job.segments.find((s) => s.id === segmentId)! } });
        this.log(jobId, 'info', 'Segment completed', { segmentId, duration: audio?.duration });
      }
      return;
    }

    const job = store.jobs[jobId];
    if (job) {
      const currentSegment = job.segments.find((s) => s.id === segmentId);
      if (currentSegment) {
        this.emit({ type: 'segment-updated', job, segment: { ...currentSegment } });
      }
    }
  }

  private async finalizeJob(jobId: string) {
    const store = useMusicQueueStore.getState();
    const job = store.jobs[jobId];
    if (!job) {
      throw new Error('Job introuvable');
    }

    const successfulSegments = job.segments.filter((segment) => segment.status === 'success');
    if (successfulSegments.length === 0) {
      throw new Error('Aucun segment terminé pour finalisation');
    }

    const previousUrl = job.finalMixUrl;
    const mix = await buildFinalMix(successfulSegments);

    if (this.shouldAbort(jobId)) {
      if (mix && typeof window !== 'undefined' && mix.url.startsWith('blob:')) {
        URL.revokeObjectURL(mix.url);
      }
      throw new Error('Job annulé pendant la finalisation');
    }

    if (!mix) {
      this.log(jobId, 'warn', 'Final mix skipped (WebAudio unsupported)');
      return;
    }

    if (typeof window !== 'undefined' && previousUrl && previousUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previousUrl);
    }

    store.updateJob(jobId, (draft) => {
      draft.finalMixUrl = mix.url;
      draft.metadata = {
        ...draft.metadata,
        finalMixDuration: mix.duration,
      };
      draft.loudnessNormalization = mix.normalization;
    });

    this.log(jobId, 'info', 'Final mix generated', {
      duration: mix.duration,
      appliedGainDb: mix.normalization.appliedGainDb,
      measuredLUFS: mix.normalization.measuredLUFS,
    });
  }

  private computeBackoffMs(attempt: number) {
    const delay = RETRY_BASE_DELAY_MS * 2 ** Math.max(0, attempt - 1);
    return Math.min(RETRY_MAX_DELAY_MS, delay);
  }

  private scheduleBackoffWakeup(timestamp: number) {
    const delay = Math.max(50, timestamp - Date.now());
    this.clearBackoffTimer();
    this.backoffTimer = setTimeout(() => {
      this.backoffTimer = undefined;
      this.processQueue();
    }, delay);
  }

  private clearBackoffTimer() {
    if (this.backoffTimer) {
      clearTimeout(this.backoffTimer);
      this.backoffTimer = undefined;
    }
  }

  private scheduleNextWakeup() {
    const store = useMusicQueueStore.getState();
    const now = Date.now();
    let nextTimestamp: number | null = null;
    for (const jobId of store.queue) {
      const job = store.jobs[jobId];
      if (!job) continue;
      if (job.status !== 'queued' && job.status !== 'paused' && job.status !== 'failed') continue;
      if (job.backoffUntil && job.backoffUntil > now) {
        nextTimestamp = nextTimestamp ? Math.min(nextTimestamp, job.backoffUntil) : job.backoffUntil;
      }
    }

    if (nextTimestamp) {
      this.scheduleBackoffWakeup(nextTimestamp);
    } else {
      this.clearBackoffTimer();
    }
  }

  private log(jobId: string, level: 'info' | 'warn' | 'error', message: string, context?: Record<string, unknown>) {
    const job = useMusicQueueStore.getState().jobs[jobId];
    const metadata = (job?.metadata as Record<string, unknown> | undefined) ?? {};
    const requestId =
      typeof job?.requestId === 'string'
        ? job.requestId
        : typeof metadata.requestId === 'string'
          ? (metadata.requestId as string)
          : undefined;
    const runId = typeof metadata.runId === 'string' ? (metadata.runId as string) : jobId;
    const sunoJobId =
      typeof metadata.suno_job_id === 'string'
        ? (metadata.suno_job_id as string)
        : typeof metadata.sunoJobId === 'string'
          ? (metadata.sunoJobId as string)
          : job?.segments.find((segment) => typeof segment.taskId === 'string')?.taskId;

    const sanitizedContext = context ? (sanitizeLogValue(context) as Record<string, unknown>) : undefined;
    const baseMetadata: Record<string, unknown> = {
      jobId,
      requestId,
      runId,
      sunoJobId,
      supabaseTrackId: metadata.supabaseTrackId,
    };

    if (sanitizedContext) {
      Object.assign(baseMetadata, sanitizedContext);
    }

    const filteredMetadata = Object.fromEntries(
      Object.entries(baseMetadata).filter(([, value]) => value !== undefined && value !== null),
    );

    const logContext = {
      component: 'MusicOrchestrator',
      action: message,
      itemCode: typeof metadata.itemCode === 'string' ? (metadata.itemCode as string) : undefined,
      metadata: filteredMetadata,
    };

    if (level === 'error') {
      logger.error(message, logContext);
    } else if (level === 'warn') {
      logger.warn(message, logContext);
    } else {
      logger.info(message, logContext);
    }
  }
}

export const musicOrchestrator = new MusicOrchestrator();

export const musicOrchestratorTestUtils = {
  createJobFromOptions,
  statusToProgress,
  isFailureStatus,
};
