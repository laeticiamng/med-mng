import React, { useMemo } from 'react';
import { Loader2, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useMusicQueue } from '@/hooks/music/useMusicQueue';
import { useMusicJob } from '@/hooks/music/useMusicJob';
import { musicOrchestrator } from '@/services/musicOrchestrator';
import { cn } from '@/lib/utils';
import type { MusicJob, MusicJobSegment } from '@/types/music';

const statusLabel: Record<string, string> = {
  queued: 'En attente',
  running: 'En cours',
  success: 'Terminé',
  failed: 'Échec',
  canceled: 'Annulé',
  paused: 'En pause',
};

const getJobLabel = (job?: MusicJob) => {
  if (!job) return 'Génération musicale orchestrée';
  const itemCode = job.metadata?.itemCode as string | undefined;
  const rangMeta = job.metadata?.rang as string | undefined;
  const rangLabel = rangMeta ? (rangMeta === 'Mix' ? 'Mix A+B' : `Rang ${rangMeta}`) : undefined;
  if (itemCode && rangLabel) {
    return `${itemCode} · ${rangLabel}`;
  }
  if (itemCode) {
    return `Item ${itemCode}`;
  }
  if (rangLabel) {
    return rangLabel;
  }
  return 'Génération musicale orchestrée';
};

const segmentDotClass = (segment: MusicJobSegment) =>
  cn('h-2.5 w-2.5 rounded-full transition-colors', {
    'bg-emerald-500': segment.status === 'success',
    'bg-blue-500 animate-pulse': segment.status === 'generating',
    'bg-yellow-400': segment.status === 'pending',
    'bg-red-500': segment.status === 'failed',
    'bg-muted-foreground': segment.status === 'canceled',
  });

const formatEta = (value: number | null) => {
  if (value === null || value === undefined) return 'Estimation indisponible';
  if (value <= 0) return 'Finalisation imminente';
  if (value < 60) {
    return `${value}s restantes`;
  }
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}min ${seconds.toString().padStart(2, '0')}s restantes`;
};

export const MusicGenerationStatusBar = () => {
  const { activeJob, jobs, hasPendingJobs } = useMusicQueue();
  const displayJobId = activeJob?.id ?? jobs[0]?.id ?? null;
  const {
    job,
    status,
    progress,
    etaSeconds,
    currentSegment,
    totalSegments,
    completedSegments,
    canRetry,
    isCancelable,
  } = useMusicJob(displayJobId);

  const waitingBehind = useMemo(() => {
    if (activeJob) {
      return jobs.length;
    }
    const remaining = jobs.length - (displayJobId ? 1 : 0);
    return remaining > 0 ? remaining : 0;
  }, [activeJob, jobs, displayJobId]);

  if (!hasPendingJobs || !displayJobId) {
    return null;
  }

  if (!job) {
    return (
      <div className="pointer-events-none fixed inset-x-4 bottom-[96px] z-50 md:bottom-6 md:left-auto md:right-6 md:w-[420px]">
        <div className="pointer-events-auto rounded-2xl border border-blue-200 bg-white/95 p-4 shadow-xl backdrop-blur">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Initialisation de la génération musicale…</span>
          </div>
        </div>
      </div>
    );
  }

  const label = getJobLabel(job);
  const statusText = statusLabel[status] ?? status;
  const etaText = formatEta(etaSeconds);

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-[96px] z-50 md:bottom-6 md:left-auto md:right-6 md:w-[420px]">
      <div className="pointer-events-auto rounded-2xl border border-blue-200 bg-white/95 p-4 shadow-xl backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-blue-900">Génération orchestrée</p>
            <p className="text-xs text-blue-700">{label}</p>
          </div>
          <div className="flex gap-2">
            {isCancelable && (
              <Button
                size="sm"
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-100"
                onClick={() => job && musicOrchestrator.cancelJob(job.id, 'Annulé depuis la barre de statut')}
              >
                Annuler
              </Button>
            )}
            {canRetry && (
              <Button
                size="sm"
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-100"
                onClick={() => job && musicOrchestrator.retryJob(job.id)}
              >
                Relancer
              </Button>
            )}
          </div>
        </div>

        <div className="mt-3">
          <Progress value={progress} className="h-2" />
          <div className="mt-2 flex items-center justify-between text-xs text-blue-700">
            <span>
              {statusText} · {completedSegments}/{totalSegments} segments
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {etaText}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-blue-700">
            <span>Segment courant :</span>
            <Badge variant="secondary" className="text-[11px] text-blue-700">
              {currentSegment ? `#${currentSegment.index + 1}` : 'En attente'}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {job.segments.map((segment) => (
              <span
                key={segment.id}
                className={segmentDotClass(segment)}
                aria-label={`Segment ${segment.index + 1} ${segment.status}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-blue-600">
          {status === 'failed' && (
            <span className="flex items-center gap-1 text-red-600">
              <AlertTriangle className="h-3 w-3" />
              {job.error ?? 'Échec de la génération'}
            </span>
          )}
          {waitingBehind > 0 && (
            <span>File restante : {waitingBehind}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicGenerationStatusBar;
