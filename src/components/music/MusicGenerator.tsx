import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Play,
  Music,
  Loader2,
  CheckCircle2,
  Volume2,
  AlertTriangle,
  Clock,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { usePlayer } from '@/hooks/usePlayer';
import { useToast } from '@/hooks/use-toast';
import { useMusicQueue } from '@/hooks/music/useMusicQueue';
import { useMusicJob } from '@/hooks/music/useMusicJob';
import { useMusicQueueStore } from '@/stores/musicQueueStore';
import { musicOrchestrator } from '@/services/musicOrchestrator';
import type { MusicJobSegment } from '@/types/music';

export type RangType = 'A' | 'B' | 'Mix';

interface MusicGeneratorProps {
  itemCode: string;
  tableauRangA?: any;
  tableauRangB?: any;
  className?: string;
}

export const MusicGenerator: React.FC<MusicGeneratorProps> = ({
  itemCode,
  tableauRangA,
  tableauRangB,
  className,
}) => {
  const { playTrack } = usePlayer();
  const { toast } = useToast();
  const { jobs: queuedJobs } = useMusicQueue();
  const itemJobs = useMusicQueueStore((state) =>
    Object.values(state.jobs).filter((job) => job.metadata?.itemCode === itemCode),
  );
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const {
    job,
    status,
    progress,
    queuePosition,
    totalSegments,
    completedSegments,
    etaSeconds,
    error,
    canRetry,
    isCancelable,
  } = useMusicJob(activeJobId);
  const [lastGenerated, setLastGenerated] = useState<{
    jobId: string;
    rang: RangType;
    trackId: string;
    streamUrl?: string;
    completedAt?: number;
    duration?: number;
  } | null>(null);

  const handleGenerate = async (rang: RangType) => {
    const tableauData = rang === 'A' ? tableauRangA :
                       rang === 'B' ? tableauRangB :
                       { // Mix A+B
                         sections: [
                           ...(tableauRangA?.sections || []),
                           ...(tableauRangB?.sections || [])
                         ]
                       };

    const metadata = {
      itemCode,
      rang,
      trackId: `${itemCode}-${rang}-${Date.now()}`,
      source: 'MusicGenerator',
    } satisfies Record<string, unknown>;

    try {
      const callbackUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/api/music/status`
          : 'https://example.com/api/music/status';

      const jobCreated = await musicOrchestrator.enqueueJob({
        payload: {
          prompt: buildMedicalPrompt(itemCode, rang, tableauData),
          style: 'educatif-medical',
          title: `${itemCode} Rang ${rang} - Génération orchestrée`,
          customMode: true,
          instrumental: false,
          model: 'V4_5',
          callBackUrl: callbackUrl,
        },
        targetDuration: 180,
        segmentDuration: 60,
        metadata,
      });

      setActiveJobId(jobCreated.id);
      setLastGenerated(null);

      toast({
        title: '🎵 Génération ajoutée à la file',
        description: `Rang ${rang} en préparation – ${jobCreated.segments.length} segments seront assemblés.`,
      });
    } catch (generationError) {
      const message =
        generationError instanceof Error ? generationError.message : 'Erreur inconnue lors de la génération.';
      toast({
        title: 'Erreur de génération',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const getCompetencesCount = (rang: RangType) => {
    if (rang === 'A') return tableauRangA?.sections?.length || 0;
    if (rang === 'B') return tableauRangB?.sections?.length || 0;
    return (tableauRangA?.sections?.length || 0) + (tableauRangB?.sections?.length || 0);
  };

  const hasData = (rang: RangType) => getCompetencesCount(rang) > 0;

  const queuedForItem = useMemo(
    () => queuedJobs.filter((queuedJob) => queuedJob.metadata?.itemCode === itemCode),
    [queuedJobs, itemCode],
  );

  const isRangProcessing = (rang: RangType) =>
    itemJobs.some((queuedJob) => {
      const jobRang = queuedJob.metadata?.rang as RangType | undefined;
      return (
        jobRang === rang &&
        (queuedJob.status === 'queued' || queuedJob.status === 'running' || queuedJob.status === 'paused')
      );
    });

  useEffect(() => {
    if (!job) return;
    if (job.status === 'success' && job.finalMixUrl) {
      setLastGenerated((previous) => {
        if (previous?.jobId === job.id) {
          return previous;
        }

        const metadata = job.metadata ?? {};
        const rang = (metadata.rang as RangType | undefined) ?? 'Mix';
        const trackId = (metadata.trackId as string | undefined) ?? job.id;
        const duration = typeof metadata.finalMixDuration === 'number' ? metadata.finalMixDuration : undefined;

        return {
          jobId: job.id,
          rang,
          trackId,
          streamUrl: job.finalMixUrl,
          completedAt: job.completedAt,
          duration,
        };
      });
    }
  }, [job]);

  const formatEta = (value: number | null) => {
    if (!value || value <= 0) return 'Calcul en cours…';
    if (value < 60) return `${value}s restantes`;
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    return `${minutes}min ${seconds.toString().padStart(2, '0')}s restantes`;
  };

  const statusBadgeVariant = (segment: MusicJobSegment) => {
    switch (segment.status) {
      case 'success':
        return 'default' as const;
      case 'failed':
        return 'destructive' as const;
      case 'generating':
        return 'secondary' as const;
      case 'canceled':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  const statusLabel = (segment: MusicJobSegment) => {
    switch (segment.status) {
      case 'success':
        return 'Terminé';
      case 'failed':
        return segment.error ? `Échec: ${segment.error}` : 'Échec';
      case 'generating':
        return 'En cours';
      case 'canceled':
        return 'Annulé';
      default:
        return 'En attente';
    }
  };

  return (
    <Card className={`border-2 border-blue-200 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Génération Musicale IA - {itemCode}
        </CardTitle>
        <p className="text-blue-100 text-sm">
          Transformez les compétences médicales en chansons mémorisables
        </p>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {job && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-blue-800 font-medium">
                  {status === 'running' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : status === 'failed' ? (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  ) : status === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                  <span>
                    {status === 'running'
                      ? 'Génération orchestrée en cours'
                      : status === 'queued'
                        ? 'En attente dans la file'
                        : status === 'success'
                          ? 'Mix final prêt à être écouté'
                          : status === 'failed'
                            ? 'Génération interrompue'
                            : status === 'canceled'
                              ? 'Génération annulée'
                              : 'Statut job inconnu'}
                  </span>
                </div>
                <div className="text-xs text-blue-700">
                  {queuePosition > 0 && <span>Position dans la file : {queuePosition} · </span>}
                  <span>
                    {completedSegments}/{totalSegments} segments prêts – {formatEta(etaSeconds)}
                  </span>
                </div>
              </div>

              <div>
                <Progress value={progress} className="h-2" />
                <div className="mt-2 text-xs text-blue-700">
                  {progress}% de complétion globale
                </div>
              </div>

              <div className="space-y-3">
                {job.segments.map((segment) => (
                  <div key={segment.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={statusBadgeVariant(segment)}>
                        Segment {segment.index + 1}
                      </Badge>
                      <span className="text-xs text-blue-700">{statusLabel(segment)}</span>
                    </div>
                    {segment.status === 'generating' ? (
                      <div className="flex items-center gap-2">
                        <Progress value={segment.progress} className="w-24" />
                        <span className="text-xs text-blue-700">{segment.progress}%</span>
                      </div>
                    ) : segment.status === 'pending' ? (
                      <Skeleton className="h-2 w-24" />
                    ) : segment.status === 'success' ? (
                      <span className="text-xs text-emerald-600">
                        Terminé{segment.duration ? ` · ${Math.round(segment.duration)}s` : ''}
                      </span>
                    ) : segment.status === 'failed' ? (
                      <span className="text-xs text-red-600">{segment.error || 'Erreur'}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">{segment.status}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isCancelable && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => activeJobId && musicOrchestrator.cancelJob(activeJobId, 'Annulé par utilisateur')}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Annuler
                  </Button>
                )}
                {canRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => activeJobId && musicOrchestrator.retryJob(activeJobId)}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Relancer
                  </Button>
                )}
                {error && (
                  <span className="text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {error}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {queuedForItem.length > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-dashed border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{queuedForItem.length} génération(s) en attente pour cet item</span>
            </div>
            <span className="text-xs text-blue-600">File globale : {queuedJobs.length}</span>
          </div>
        )}

        {/* Options de génération */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rang A */}
          <Card className="border-orange-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Badge className="bg-orange-500">Rang A</Badge>
                  <span className="text-sm text-muted-foreground">
                    {getCompetencesCount('A')} compétences
                  </span>
                </div>
                <h3 className="font-semibold">Fondamentaux</h3>
                <p className="text-sm text-muted-foreground">
                  Concepts de base et définitions essentielles
                </p>
                <Button
                  onClick={() => handleGenerate('A')}
                  disabled={!hasData('A') || isRangProcessing('A')}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Générer Rang A
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Rang B */}
          <Card className="border-purple-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Badge className="bg-purple-500">Rang B</Badge>
                  <span className="text-sm text-muted-foreground">
                    {getCompetencesCount('B')} compétences
                  </span>
                </div>
                <h3 className="font-semibold">Expertise</h3>
                <p className="text-sm text-muted-foreground">
                  Cas complexes et maîtrise approfondie
                </p>
                <Button
                  onClick={() => handleGenerate('B')}
                  disabled={!hasData('B') || isRangProcessing('B')}
                  className="w-full bg-purple-500 hover:bg-purple-600"
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Générer Rang B
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mix A+B */}
          <Card className="border-blue-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Badge className="bg-blue-500">Mix A+B</Badge>
                  <span className="text-sm text-muted-foreground">
                    {getCompetencesCount('Mix')} compétences
                  </span>
                </div>
                <h3 className="font-semibold">Complet</h3>
                <p className="text-sm text-muted-foreground">
                  Fusion fondamentaux + expertise
                </p>
                <Button
                  onClick={() => handleGenerate('Mix')}
                  disabled={(!hasData('A') && !hasData('B')) || isRangProcessing('Mix')}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Générer Mix A+B
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Informations sur la structure */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Structure musicale garantie
            </h4>
            <div className="text-sm space-y-1 text-gray-600">
              <div>🎵 <strong>Couplet 1</strong> - Introduction des concepts</div>
              <div>🎤 <strong>Refrain</strong> - Points clés à retenir</div>
              <div>🎵 <strong>Couplet 2</strong> - Développement pratique</div>
              <div>🎤 <strong>Refrain</strong> - Points clés à retenir</div>
              <div>🎵 <strong>Couplet 3</strong> - Application clinique</div>
              <div>🎤 <strong>Refrain</strong> - Points clés à retenir</div>
            </div>
          </CardContent>
        </Card>

        {/* Dernière génération */}
        {lastGenerated && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    Dernière génération : Rang {lastGenerated.rang}
                  </span>
                </div>
                <Button
                  onClick={() =>
                    playTrack({
                      id: lastGenerated.trackId,
                      title: `${itemCode} Rang ${lastGenerated.rang}`,
                      item_code: itemCode,
                      type: lastGenerated.rang === 'A' ? 'rang_a' : lastGenerated.rang === 'B' ? 'rang_b' : 'mix',
                      created_at: new Date().toISOString(),
                      stream_url: lastGenerated.streamUrl,
                      duration: lastGenerated.duration,
                    })
                  }
                  size="sm"
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Écouter
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};