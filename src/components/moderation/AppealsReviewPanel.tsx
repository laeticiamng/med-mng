import React, { useState } from 'react'
import { useFetchPendingAppeals, useReviewAppeal } from '@/hooks/useModeration'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function AppealsReviewPanel() {
  const { data: appeals = [], isLoading } = useFetchPendingAppeals()
  const reviewMutation = useReviewAppeal()

  const [selectedAppeal, setSelectedAppeal] = useState<any>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [decisionReason, setDecisionReason] = useState('')
  const [decision, setDecision] = useState<'approved' | 'rejected' | 'escalated' | null>(null)

  const handleReview = async () => {
    if (!selectedAppeal || !decision) return

    try {
      await reviewMutation.mutateAsync({
        appealId: selectedAppeal.id,
        status: decision,
        reviewNotes: reviewNotes || undefined,
        decisionReason: decisionReason || undefined,
      })

      toast.success(`Appeal ${decision}`)
      setSelectedAppeal(null)
      setReviewNotes('')
      setDecisionReason('')
      setDecision(null)
    } catch (error) {
      toast.error('Failed to review appeal')
      console.error(error)
    }
  }

  const getAppealTypeLabel = (type: string) => {
    switch (type) {
      case 'content_not_violation':
        return 'Content Not a Violation'
      case 'account_error':
        return 'Account Error'
      case 'disproportionate':
        return 'Disproportionate Action'
      default:
        return type
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading appeals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {appeals.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
              <p className="text-gray-500">No pending appeals to review</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {appeals.map((appeal) => (
            <Card key={appeal.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge>{getAppealTypeLabel(appeal.appealType)}</Badge>
                      <Badge variant="outline">{appeal.status}</Badge>
                    </div>

                    <p className="font-medium line-clamp-2">{appeal.reason}</p>

                    {appeal.additionalContext && (
                      <p className="text-sm text-gray-600 line-clamp-2">{appeal.additionalContext}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(appeal.createdAt).toLocaleDateString()}
                      </span>
                      <span>User: {appeal.userId.slice(0, 8)}...</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedAppeal(appeal)
                      setDecision(null)
                      setReviewNotes('')
                      setDecisionReason('')
                    }}
                    className="flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedAppeal} onOpenChange={(open) => !open && setSelectedAppeal(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Appeal</DialogTitle>
            <DialogDescription>{getAppealTypeLabel(selectedAppeal?.appealType)}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Appeal Reason</p>
              <p className="p-3 bg-gray-50 rounded text-sm">{selectedAppeal?.reason}</p>
            </div>

            {selectedAppeal?.additionalContext && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Additional Context</p>
                <p className="p-3 bg-gray-50 rounded text-sm">{selectedAppeal.additionalContext}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-600 mb-3">Your Decision</p>
              <div className="grid grid-cols-3 gap-2">
                {(['approved', 'rejected', 'escalated'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={decision === status ? 'default' : 'outline'}
                    className={
                      decision === status
                        ? status === 'approved'
                          ? 'bg-green-600 hover:bg-green-700'
                          : status === 'escalated'
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-red-600 hover:bg-red-700'
                        : ''
                    }
                    onClick={() => setDecision(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Review Notes</label>
              <Textarea
                placeholder="Add notes about your review..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Decision Reason</label>
              <Textarea
                placeholder="Explain why you made this decision..."
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSelectedAppeal(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleReview}
                disabled={!decision || reviewMutation.isPending}
                className={
                  decision === 'approved'
                    ? 'bg-green-600 hover:bg-green-700'
                    : decision === 'escalated'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : decision === 'rejected'
                        ? 'bg-red-600 hover:bg-red-700'
                        : ''
                }
              >
                {reviewMutation.isPending ? 'Reviewing...' : 'Submit Decision'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
