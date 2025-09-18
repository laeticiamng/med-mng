import { useEffect, useRef } from 'react';
import { useAnalyticsConsent } from '@/hooks/analytics/useAnalyticsConsent';
import { musicOrchestrator, type OrchestratorEvent } from '@/services/musicOrchestrator';
import { trackCanonicalEvent } from '@/services/CanonicalAnalyticsTracker';

export const AnalyticsConsentManager = () => {
  const { optIn } = useAnalyticsConsent();
  const trackedStarts = useRef(new Set<string>());
  const trackedOutcomes = useRef(new Set<string>());

  useEffect(() => {
    if (!optIn) {
      trackedStarts.current.clear();
      trackedOutcomes.current.clear();
      return;
    }

    const handleEvent = (event: OrchestratorEvent) => {
      if (!optIn) {
        return;
      }

      const job = event.job;
      if (!job) {
        return;
      }

      if (event.type === 'job-started' && !trackedStarts.current.has(job.id)) {
        trackedStarts.current.add(job.id);
        trackCanonicalEvent({
          type: 'generate_start',
          contentId: typeof job.metadata?.trackId === 'string' ? (job.metadata.trackId as string) : undefined,
          metadata: {
            jobId: job.id,
            requestId: job.requestId,
            segmentCount: job.segments.length,
            targetDuration: job.targetDuration,
          },
        });
        return;
      }

      if ((event.type === 'job-completed' || event.type === 'job-failed') && !trackedOutcomes.current.has(job.id)) {
        trackedOutcomes.current.add(job.id);
        const errorValue = event.error ?? job.error;
        let errorMessage: string | null = null;
        if (typeof errorValue === 'object' && errorValue && 'message' in errorValue) {
          errorMessage = (errorValue as Error).message;
        } else if (typeof errorValue === 'string') {
          errorMessage = errorValue;
        }
        const baseMetadata = {
          jobId: job.id,
          requestId: job.requestId,
          retryCount: job.retryCount,
          segmentCount: job.segments.length,
          duration: job.targetDuration,
          error: errorMessage,
        };

        if (event.type === 'job-completed') {
          trackCanonicalEvent({
            type: 'generate_success',
            contentId: typeof job.metadata?.trackId === 'string' ? (job.metadata.trackId as string) : undefined,
            metadata: {
              ...baseMetadata,
              completedAt: job.completedAt,
              finalMixUrl: job.finalMixUrl,
            },
          });
        } else {
          trackCanonicalEvent({
            type: 'generate_fail',
            contentId: typeof job.metadata?.trackId === 'string' ? (job.metadata.trackId as string) : undefined,
            metadata: baseMetadata,
          });
        }
      }
    };

    musicOrchestrator.addListener(handleEvent);
    return () => {
      musicOrchestrator.removeListener(handleEvent);
    };
  }, [optIn]);

  return null;
};
