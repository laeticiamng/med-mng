import React, { useState } from 'react'
import { useFetchModerationQueue, useReviewModerationItem } from '@/hooks/useAdmin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, XCircle, Trash2, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function ModerationQueue() {
  const { data: items = [], isLoading } = useFetchModerationQueue('pending')
  const reviewMutation = useReviewModerationItem()

  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [notes, setNotes] = useState('')
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | 'deleted' | null>(null)

  const handleReview = async () => {
    if (!selectedItem || !reviewAction) return

    try {
      await reviewMutation.mutateAsync({
        itemId: selectedItem.id,
        status: reviewAction,
        notes: notes || undefined,
      })

      toast.success(`Item ${reviewAction}`)
      setSelectedItem(null)
      setNotes('')
      setReviewAction(null)
    } catch (error) {
      toast.error('Failed to review item')
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading moderation queue...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
              <p className="text-gray-500">No pending items for moderation</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.content_type}</Badge>
                      <Badge variant="secondary">{item.status}</Badge>
                      {item.priority === 'high' && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          High Priority
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="font-medium line-clamp-2">{item.title || item.content_id}</p>
                      {item.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <span>Reported by: {item.reported_by_user_id?.slice(0, 8)}...</span>
                    </div>

                    {item.report_reason && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                        <p className="font-medium text-gray-700 mb-1">Report Reason:</p>
                        <p className="text-gray-600">{item.report_reason}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => {
                        setSelectedItem(item)
                        setReviewAction('approved')
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        setSelectedItem(item)
                        setReviewAction('rejected')
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-orange-600 border-orange-200 hover:bg-orange-50"
                      onClick={() => {
                        setSelectedItem(item)
                        setReviewAction('deleted')
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Moderation Item</DialogTitle>
            <DialogDescription>
              {selectedItem?.title || selectedItem?.content_id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">{selectedItem?.description}</p>
            </div>

            <div>
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Textarea
                placeholder="Add notes about your decision..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedItem(null)
                  setNotes('')
                  setReviewAction(null)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReview}
                disabled={reviewMutation.isPending}
                className={
                  reviewAction === 'approved'
                    ? 'bg-green-600 hover:bg-green-700'
                    : reviewAction === 'rejected'
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-red-600 hover:bg-red-700'
                }
              >
                {reviewMutation.isPending ? 'Processing...' : `${reviewAction?.charAt(0).toUpperCase()}${reviewAction?.slice(1)}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
