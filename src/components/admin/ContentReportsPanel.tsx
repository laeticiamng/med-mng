import React, { useState } from 'react'
import { useFetchContentReports, useResolveContentReport } from '@/hooks/useAdmin'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function ContentReportsPanel() {
  const { data: reports = [], isLoading } = useFetchContentReports()
  const resolveMutation = useResolveContentReport()

  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [resolution, setResolution] = useState('')
  const [reviewStatus, setReviewStatus] = useState<'resolved' | 'dismissed' | null>(null)

  const handleResolve = async () => {
    if (!selectedReport || !reviewStatus) return

    try {
      await resolveMutation.mutateAsync({
        reportId: selectedReport.id,
        resolution: resolution || 'No resolution provided',
        status: reviewStatus,
      })

      toast.success(`Report ${reviewStatus}`)
      setSelectedReport(null)
      setResolution('')
      setReviewStatus(null)
    } catch (error) {
      toast.error('Failed to resolve report')
      console.error(error)
    }
  }

  const pendingReports = reports.filter((r) => r.status === 'pending')
  const resolvedReports = reports.filter((r) => r.status === 'resolved')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pending Reports */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          Pending Reports ({pendingReports.length})
        </h3>

        {pendingReports.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-500">No pending reports</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge>{report.content_type}</Badge>
                        <Badge variant="destructive">{report.reason}</Badge>
                      </div>

                      <p className="font-medium">{report.description}</p>

                      <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                        <span>Reported by: {report.reporter_user_id?.slice(0, 8)}...</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => {
                          setSelectedReport(report)
                          setReviewStatus('resolved')
                        }}
                      >
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-gray-600"
                        onClick={() => {
                          setSelectedReport(report)
                          setReviewStatus('dismissed')
                        }}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Reports */}
      {resolvedReports.length > 0 && (
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Resolved Reports ({resolvedReports.length})
          </h3>

          <div className="space-y-3">
            {resolvedReports.slice(0, 5).map((report) => (
              <Card key={report.id} className="opacity-75">
                <CardContent className="pt-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{report.content_type}</Badge>
                      <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Resolve Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Content Report</DialogTitle>
            <DialogDescription>{selectedReport?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm">
                <strong>Type:</strong> {selectedReport?.content_type}
              </p>
              <p className="text-sm">
                <strong>Reason:</strong> {selectedReport?.reason}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Resolution</label>
              <Textarea
                placeholder="Describe the action taken..."
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSelectedReport(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleResolve}
                disabled={resolveMutation.isPending}
                className={reviewStatus === 'resolved' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {resolveMutation.isPending ? 'Processing...' : reviewStatus === 'resolved' ? 'Resolve' : 'Dismiss'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
