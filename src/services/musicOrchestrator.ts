import { nanoid } from 'nanoid';
import { generateMusic, type GenerateMusicPayload, type GenerateMusicResponse } from '@/music/generate';
import { extendMusic, type ExtendMusicPayload } from '@/music/extend';
import { getMusicStatus, type MusicStatus } from '@/music/status';
import { useMusicQueueStore } from '@/stores/musicQueueStore';
import type { MusicJob, MusicJobSegment } from '@/types/music';
import { buildFinalMix } from './music/audioPostProcessor';

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

    try {
      await this.runJob(nextJob.id);
      const completedJob = useMusicQueueStore.getState().jobs[nextJob.id];
      if (completedJob) {
        this.emit({ type: 'job-completed', job: completedJob });
        this.log(nextJob.id, 'info', 'Job completed successfully', {
          totalSegments: completedJob.segments.length,
          duration: completedJob.targetDuration,
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
        }
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
    const requestId = job?.requestId ?? (job?.metadata?.requestId as string | undefined);
    const prefix = requestId ? `[musicOrchestrator][${requestId}]` : '[musicOrchestrator]';
    const payload = context ? { jobId, ...context } : { jobId };
    const consoleFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info;
    consoleFn.call(console, `${prefix} ${message}`, payload);
  }
}

export const musicOrchestrator = new MusicOrchestrator();

export const musicOrchestratorTestUtils = {
  createJobFromOptions,
  statusToProgress,
  isFailureStatus,
};
