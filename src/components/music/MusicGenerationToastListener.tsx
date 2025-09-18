import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { musicOrchestrator, type OrchestratorEvent } from '@/services/musicOrchestrator';
import type { MusicJob } from '@/types/music';

const getJobLabel = (job: MusicJob) => {
  const itemCode = job.metadata?.itemCode as string | undefined;
  const rangMeta = job.metadata?.rang as string | undefined;
  const rangLabel = rangMeta ? (rangMeta === 'Mix' ? 'Mix A+B' : `Rang ${rangMeta}`) : undefined;
  if (itemCode && rangLabel) {
    return `${itemCode} · ${rangLabel}`;
  }
  if (itemCode) {
    return itemCode;
  }
  if (rangLabel) {
    return rangLabel;
  }
  return 'Génération musicale';
};

interface SeenEvents {
  started: Set<string>;
  completed: Set<string>;
  failed: Set<string>;
  canceled: Set<string>;
  segmentFailed: Set<string>;
}

export const MusicGenerationToastListener = () => {
  const { toast } = useToast();
  const seen = useRef<SeenEvents>({
    started: new Set(),
    completed: new Set(),
    failed: new Set(),
    canceled: new Set(),
    segmentFailed: new Set(),
  });

  useEffect(() => {
    const handleEvent = (event: OrchestratorEvent) => {
      const job = event.job;
      if (!job) {
        return;
      }
      const label = getJobLabel(job);
      const metadataHint = job.metadata?.requestId ? `#${job.metadata.requestId}` : job.id;

      switch (event.type) {
        case 'job-started': {
          if (seen.current.started.has(job.id)) break;
          seen.current.started.add(job.id);
          toast({
            title: '🎵 Génération lancée',
            description: `${label} – ${job.segments.length} segments en préparation (${metadataHint})`,
          });
          break;
        }
        case 'job-completed': {
          if (seen.current.completed.has(job.id)) break;
          seen.current.completed.add(job.id);
          toast({
            title: '✅ Génération terminée',
            description: `${label} prêt à être écouté (${metadataHint})`,
          });
          break;
        }
        case 'job-failed': {
          if (seen.current.failed.has(job.id)) break;
          seen.current.failed.add(job.id);
          toast({
            title: '❌ Génération échouée',
            description: event.error ?? job.error ?? `${label} a rencontré une erreur.`,
            variant: 'destructive',
          });
          break;
        }
        case 'job-canceled': {
          if (seen.current.canceled.has(job.id)) break;
          seen.current.canceled.add(job.id);
          toast({
            title: '⏹️ Génération annulée',
            description: `${label} a été interrompu`,
          });
          break;
        }
        case 'segment-failed': {
          if (!event.segment) break;
          const uniqueId = `${job.id}-${event.segment.id}`;
          if (seen.current.segmentFailed.has(uniqueId)) break;
          seen.current.segmentFailed.add(uniqueId);
          toast({
            title: '⚠️ Segment en erreur',
            description: `${label} – segment ${event.segment.index + 1} : ${event.error ?? 'erreur inconnue'}`,
            variant: 'destructive',
          });
          break;
        }
        default:
          break;
      }
    };

    musicOrchestrator.addListener(handleEvent);
    return () => {
      musicOrchestrator.removeListener(handleEvent);
    };
  }, [toast]);

  return null;
};

export default MusicGenerationToastListener;
