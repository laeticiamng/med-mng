import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  MusicJob,
  MusicJobSegment,
  MusicJobSegmentStatus,
  MusicJobStatus,
} from '@/types/music';

interface MusicQueueState {
  jobs: Record<string, MusicJob>;
  queue: string[];
  activeJobId?: string;
  lastCompletedJobId?: string;
  enqueueJob: (job: MusicJob) => void;
  requeueJob: (jobId: string) => void;
  startNextJob: () => MusicJob | undefined;
  updateJob: (jobId: string, updates: Partial<MusicJob> | ((job: MusicJob) => void)) => void;
  updateSegment: (
    jobId: string,
    segmentId: string,
    updates: Partial<MusicJobSegment> | ((segment: MusicJobSegment) => void),
  ) => void;
  setJobStatus: (jobId: string, status: MusicJobStatus, error?: string | null) => void;
  setSegmentStatus: (
    jobId: string,
    segmentId: string,
    status: MusicJobSegmentStatus,
    error?: string | null,
  ) => void;
  removeJob: (jobId: string) => void;
  clearCompletedJobs: () => void;
  cancelJob: (jobId: string, reason?: string) => void;
  reset: () => void;
}

const persistConfig = {
  name: 'med-mng-music-queue',
  partialize: (state: MusicQueueState) => ({
    jobs: state.jobs,
    queue: state.queue,
    activeJobId: state.activeJobId,
    lastCompletedJobId: state.lastCompletedJobId,
  }),
};

function recalculateJobProgress(job: MusicJob) {
  const totalSegments = job.segments.length || 1;
  const totalProgress = job.segments.reduce((acc, segment) => acc + segment.progress, 0);
  job.progress = Math.min(100, Math.round(totalProgress / totalSegments));
  job.updatedAt = Date.now();
}

export const useMusicQueueStore = create<MusicQueueState>()(
  persist(
    subscribeWithSelector(
      immer<MusicQueueState>((set, get) => ({
        jobs: {},
        queue: [],
        activeJobId: undefined,
        lastCompletedJobId: undefined,

        enqueueJob: (job) =>
          set((state) => {
            state.jobs[job.id] = job;
            state.queue.push(job.id);
            state.lastCompletedJobId = undefined;
          }),

        requeueJob: (jobId) =>
          set((state) => {
            if (!state.jobs[jobId]) return;
            if (!state.queue.includes(jobId)) {
              state.queue.push(jobId);
            }
            if (state.jobs[jobId].status !== 'queued') {
              state.jobs[jobId].status = 'queued';
              state.jobs[jobId].updatedAt = Date.now();
            }
          }),

        startNextJob: () => {
          const state = get();
          if (state.activeJobId) {
            return state.jobs[state.activeJobId];
          }

          const now = Date.now();
          let nextJobId: string | undefined;
          for (const jobId of state.queue) {
            const job = state.jobs[jobId];
            if (!job) continue;
            if (job.status !== 'queued' && job.status !== 'paused' && job.status !== 'failed') continue;
            if (job.backoffUntil && job.backoffUntil > now) continue;
            nextJobId = jobId;
            break;
          }

          if (!nextJobId) {
            return undefined;
          }

          let nextJob: MusicJob | undefined;
          set((draft) => {
            draft.activeJobId = nextJobId;
            draft.queue = draft.queue.filter((id) => id !== nextJobId);
            const job = draft.jobs[nextJobId!];
            if (job) {
              job.status = 'running';
              job.error = null;
              job.startedAt = job.startedAt ?? Date.now();
              job.updatedAt = Date.now();
              job.backoffUntil = undefined;
              nextJob = job;
            }
          });

          return nextJob;
        },

        updateJob: (jobId, updates) =>
          set((state) => {
            const job = state.jobs[jobId];
            if (!job) return;

            if (typeof updates === 'function') {
              updates(job);
            } else {
              Object.assign(job, updates);
            }

            job.updatedAt = Date.now();
            recalculateJobProgress(job);
          }),

        updateSegment: (jobId, segmentId, updates) =>
          set((state) => {
            const job = state.jobs[jobId];
            if (!job) return;
            const segment = job.segments.find((s) => s.id === segmentId);
            if (!segment) return;

            if (typeof updates === 'function') {
              updates(segment);
            } else {
              Object.assign(segment, updates);
            }

            if (segment.status === 'success') {
              segment.progress = 100;
              segment.completedAt = segment.completedAt ?? Date.now();
            }

            recalculateJobProgress(job);
          }),

        setJobStatus: (jobId, status, error) =>
          set((state) => {
            const job = state.jobs[jobId];
            if (!job) return;
            job.status = status;
            job.error = error ?? null;
            job.updatedAt = Date.now();
            if (status === 'success') {
              job.progress = 100;
              state.activeJobId = undefined;
              state.lastCompletedJobId = jobId;
            }
            if (status === 'failed' || status === 'canceled') {
              state.activeJobId = undefined;
            }
          }),

        setSegmentStatus: (jobId, segmentId, status, error) =>
          set((state) => {
            const job = state.jobs[jobId];
            if (!job) return;
            const segment = job.segments.find((s) => s.id === segmentId);
            if (!segment) return;

            segment.status = status;
            segment.error = error ?? null;
            if (status === 'generating') {
              segment.startedAt = segment.startedAt ?? Date.now();
            }
            if (status === 'success') {
              segment.progress = 100;
              segment.completedAt = Date.now();
            }
            if (status === 'failed' || status === 'canceled') {
              segment.progress = 0;
            }
            recalculateJobProgress(job);
          }),

        removeJob: (jobId) =>
          set((state) => {
            delete state.jobs[jobId];
            state.queue = state.queue.filter((id) => id !== jobId);
            if (state.activeJobId === jobId) {
              state.activeJobId = undefined;
            }
          }),

        clearCompletedJobs: () =>
          set((state) => {
            Object.keys(state.jobs).forEach((jobId) => {
              const job = state.jobs[jobId];
              if (job && (job.status === 'success' || job.status === 'canceled')) {
                delete state.jobs[jobId];
              }
            });
            state.queue = state.queue.filter((id) => {
              const job = state.jobs[id];
              return job && job.status !== 'success' && job.status !== 'canceled';
            });
          }),

        cancelJob: (jobId, reason) =>
          set((state) => {
            const job = state.jobs[jobId];
            if (!job) return;
            job.status = 'canceled';
            job.error = reason ?? 'Job canceled';
            job.updatedAt = Date.now();
            job.segments.forEach((segment) => {
              if (segment.status === 'pending' || segment.status === 'generating') {
                segment.status = 'canceled';
                segment.error = reason ?? 'Job canceled';
              }
            });
            state.queue = state.queue.filter((id) => id !== jobId);
            if (state.activeJobId === jobId) {
              state.activeJobId = undefined;
            }
          }),

        reset: () =>
          set((state) => {
            state.jobs = {};
            state.queue = [];
            state.activeJobId = undefined;
            state.lastCompletedJobId = undefined;
          }),
      })),
    persistConfig,
  ),
);

export type MusicQueueStore = typeof useMusicQueueStore;
