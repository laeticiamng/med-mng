import { useMemo } from 'react';
import { useMusicQueueStore } from '@/stores/musicQueueStore';
import type { MusicJob, MusicJobSegment } from '@/types/music';

interface UseMusicJobResult {
  job?: MusicJob;
  status: MusicJob['status'];
  progress: number;
  isActive: boolean;
  queuePosition: number;
  totalSegments: number;
  completedSegments: number;
  currentSegment?: MusicJobSegment;
  etaSeconds: number | null;
  error?: string | null;
  canRetry: boolean;
  isCancelable: boolean;
}

const computeEtaSeconds = (job?: MusicJob, currentSegment?: MusicJobSegment): number | null => {
  if (!job) return null;
  const totalSegments = job.segments.length;
  if (totalSegments === 0) return null;

  const completedSegments = job.segments.filter((segment) => segment.status === 'success').length;
  const remainingSegments = Math.max(0, totalSegments - completedSegments - (currentSegment ? 1 : 0));
  const baseSegmentDuration = job.segmentDuration || 60;

  if (!currentSegment) {
    const seconds = remainingSegments * baseSegmentDuration;
    return seconds > 0 ? seconds : null;
  }

  const segmentProgress = currentSegment.progress || 0;
  const currentSegmentRemaining = Math.max(0, Math.round(((100 - segmentProgress) / 100) * baseSegmentDuration));
  const seconds = currentSegmentRemaining + remainingSegments * baseSegmentDuration;
  return seconds > 0 ? seconds : null;
};

export const useMusicJob = (jobId?: string | null): UseMusicJobResult => {
  const job = useMusicQueueStore((state) => (jobId ? state.jobs[jobId] : undefined));
  const activeJobId = useMusicQueueStore((state) => state.activeJobId);
  const queueSnapshot = useMusicQueueStore((state) => state.queue);

  return useMemo(() => {
    const status = job?.status ?? 'queued';
    const progress = job?.progress ?? 0;
    const totalSegments = job?.segments.length ?? 0;
    const completedSegments = job ? job.segments.filter((segment) => segment.status === 'success').length : 0;
    const currentSegment = job?.segments.find((segment) => segment.status === 'generating') ??
      job?.segments.find((segment) => segment.status === 'pending');
    const etaSeconds = computeEtaSeconds(job, currentSegment);

    const queueIndex = jobId ? queueSnapshot.findIndex((id) => id === jobId) : -1;
    const queuePosition = queueIndex >= 0 ? queueIndex + 1 : -1;

    const error = job?.error ?? null;
    const canRetry = Boolean(job && job.status === 'failed' && job.retryCount < job.maxRetries);
    const isCancelable = Boolean(job && (job.status === 'queued' || job.status === 'running'));

    return {
      job,
      status,
      progress,
      isActive: Boolean(jobId && activeJobId === jobId),
      queuePosition,
      totalSegments,
      completedSegments,
      currentSegment,
      etaSeconds,
      error,
      canRetry,
      isCancelable,
    };
  }, [job, jobId, queueSnapshot, activeJobId]);
};
