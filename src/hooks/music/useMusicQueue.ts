import { useMemo } from 'react';
import { useMusicQueueStore } from '@/stores/musicQueueStore';
import type { MusicJob } from '@/types/music';

interface QueueSummary {
  jobs: MusicJob[];
  activeJob?: MusicJob;
  lastCompletedJob?: MusicJob;
  hasPendingJobs: boolean;
  totalQueued: number;
}

export const useMusicQueue = (): QueueSummary => {
  const jobs = useMusicQueueStore((state) => state.jobs);
  const queue = useMusicQueueStore((state) => state.queue);
  const activeJobId = useMusicQueueStore((state) => state.activeJobId);
  const lastCompletedJobId = useMusicQueueStore((state) => state.lastCompletedJobId);

  return useMemo(() => {
    const activeJob = activeJobId ? jobs[activeJobId] : undefined;
    const lastCompletedJob = lastCompletedJobId ? jobs[lastCompletedJobId] : undefined;
    const orderedJobs = queue
      .map((id) => jobs[id])
      .filter((job): job is MusicJob => Boolean(job));

    const hasPendingJobs = Boolean(
      orderedJobs.length > 0 ||
        Object.values(jobs).some((job) => job.status === 'running' || job.status === 'queued'),
    );

    return {
      jobs: orderedJobs,
      activeJob,
      lastCompletedJob,
      hasPendingJobs,
      totalQueued: orderedJobs.length,
    };
  }, [jobs, queue, activeJobId, lastCompletedJobId]);
};
