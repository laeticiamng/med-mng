/**
 * Composant d'affichage des révisions du jour
 * S'adapte automatiquement à la méthode active de l'utilisateur
 */

import { Calendar, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useTodayRevisions, useMarkRevisionDone } from '@/hooks/useRevisionMethods'
import { REVISION_METHODS, type RevisionSchedule, type RevisionMethodType } from '@/types/revision-methods'
import { useState } from 'react'

interface TodayRevisionsViewProps {
  method: RevisionMethodType
}

export function TodayRevisionsView({ method }: TodayRevisionsViewProps) {
  const { data: todayRevisions, isLoading } = useTodayRevisions()
  const markDone = useMarkRevisionDone()
  const [selectedRevision, setSelectedRevision] = useState<string | null>(null)

  const methodInfo = REVISION_METHODS[method]

  if (isLoading) {
    return <TodayRevisionsViewSkeleton />
  }

  const revisions = todayRevisions
    ? [...todayRevisions.pending, ...todayRevisions.missed].filter(
        (r) => r.revision_method === method
      )
    : []

  const completionRate =
    todayRevisions && todayRevisions.total > 0
      ? (todayRevisions.done.filter((r) => r.revision_method === method).length /
          (todayRevisions.done.filter((r) => r.revision_method === method).length +
            revisions.length)) *
        100
      : 0

  const handleMarkDone = async (revisionId: string) => {
    setSelectedRevision(revisionId)
    await markDone.mutateAsync({
      revision_id: revisionId,
      success: true,
    })
    setSelectedRevision(null)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Révisions du jour
            </CardTitle>
            <CardDescription>
              {methodInfo.shortName} - {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-lg">
            {revisions.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress bar */}
        {revisions.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progression</span>
              <span className="font-medium">{Math.round(completionRate)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        )}

        {/* Empty state */}
        {revisions.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-3" />
            <h3 className="text-lg font-medium mb-1">Tout est à jour !</h3>
            <p className="text-sm text-muted-foreground">
              Tu n'as pas de révisions prévues pour aujourd'hui.
            </p>
          </div>
        )}

        {/* Revisions list */}
        <div className="space-y-3">
          {revisions.map((revision) => (
            <RevisionCard
              key={revision.id}
              revision={revision}
              method={method}
              onMarkDone={handleMarkDone}
              isMarking={selectedRevision === revision.id && markDone.isPending}
            />
          ))}
        </div>

        {/* Method-specific info */}
        {revisions.length > 0 && (
          <MethodSpecificInfo method={method} />
        )}
      </CardContent>
    </Card>
  )
}

interface RevisionCardProps {
  revision: RevisionSchedule
  method: RevisionMethodType
  onMarkDone: (id: string) => void
  isMarking: boolean
}

function RevisionCard({ revision, method, onMarkDone, isMarking }: RevisionCardProps) {
  const isMissed = revision.status === 'MISSED'
  const metadata = revision.method_metadata as any

  return (
    <Card className={cn('transition-all hover:shadow-md', isMissed && 'border-orange-200 bg-orange-50/50 dark:bg-orange-900/10')}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium truncate">{revision.item_title || revision.item_id}</h4>
              {isMissed && (
                <Badge variant="outline" className="text-orange-600 border-orange-600 flex-shrink-0">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  En retard
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {revision.scheduled_for}
              </span>

              {/* Method-specific metadata display */}
              {method === 'J_METHOD' && metadata?.repetition_number && (
                <Badge variant="secondary" className="text-xs">
                  Répétition {metadata.repetition_number}/4
                </Badge>
              )}

              {method === 'BLOCK_METHOD' && metadata?.block_position && (
                <Badge variant="secondary" className="text-xs">
                  Item {metadata.block_position}/{metadata.total_items_in_block}
                </Badge>
              )}

              {method === 'QCM_FIRST' && metadata?.error_count && (
                <Badge variant="secondary" className="text-xs">
                  {metadata.error_count} erreur{metadata.error_count > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => onMarkDone(revision.id)}
            disabled={isMarking}
            className="flex-shrink-0"
          >
            {isMarking ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Validation...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Terminé
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function MethodSpecificInfo({ method }: { method: RevisionMethodType }) {
  const tips = {
    J_METHOD: "💡 Astuce : Ne saute pas les révisions ! La régularité est la clé de la Méthode des J.",
    BLOCK_METHOD: "💡 Astuce : Concentre-toi à fond sur chaque item. Qualité > Quantité.",
    QCM_FIRST: "💡 Astuce : Fais d'abord les QCM, puis reviens sur les fiches pour combler tes lacunes.",
  }

  return (
    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <p className="text-sm text-blue-900 dark:text-blue-100">{tips[method]}</p>
    </div>
  )
}

function TodayRevisionsViewSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-6 w-12" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-2 w-full" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </CardContent>
    </Card>
  )
}
