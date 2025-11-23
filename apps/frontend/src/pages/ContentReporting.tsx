import logger from '@/lib/logger';
import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '@/hooks/useAuth'
import { useFetchUserReports, useCreateComplaintReport, useFetchUserAppeals, useCreateAppealRequest } from '@/hooks/useContentReporting'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, FileText, Plus, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function ContentReporting() {
  const { user } = useAuth()
  const { data: userReports = [] } = useFetchUserReports(user?.id || '')
  const { data: userAppeals = [] } = useFetchUserAppeals(user?.id || '')
  const createReportMutation = useCreateComplaintReport()
  const createAppealMutation = useCreateAppealRequest()

  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showAppealDialog, setShowAppealDialog] = useState(false)
  const [reportForm, setReportForm] = useState({
    contentType: 'post',
    contentId: '',
    reportCategory: 'inappropriate_content',
    severity: 'medium',
    description: '',
  })
  const [appealForm, setAppealForm] = useState({
    appealReason: '',
    appealType: 'report_incorrect',
    supportingEvidence: '',
  })

  const handleCreateReport = async () => {
    if (!reportForm.contentId.trim() || !reportForm.description.trim()) {
      toast.error('All fields are required')
      return
    }

    try {
      await createReportMutation.mutateAsync({
        contentType: reportForm.contentType,
        contentId: reportForm.contentId,
        reportCategory: reportForm.reportCategory,
        severity: reportForm.severity as any,
        description: reportForm.description,
      })

      toast.success('Report submitted successfully')
      setReportForm({ contentType: 'post', contentId: '', reportCategory: 'inappropriate_content', severity: 'medium', description: '' })
      setShowReportDialog(false)
    } catch (error) {
      toast.error('Failed to submit report')
      logger.error(error)
    }
  }

  const handleCreateAppeal = async () => {
    if (!appealForm.appealReason.trim()) {
      toast.error('Appeal reason is required')
      return
    }

    try {
      await createAppealMutation.mutateAsync({
        appealReason: appealForm.appealReason,
        appealType: appealForm.appealType,
        supportingEvidence: appealForm.supportingEvidence || undefined,
      })

      toast.success('Appeal submitted successfully')
      setAppealForm({ appealReason: '', appealType: 'report_incorrect', supportingEvidence: '' })
      setShowAppealDialog(false)
    } catch (error) {
      toast.error('Failed to submit appeal')
      logger.error(error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'under_review':
        return 'bg-blue-100 text-blue-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'dismissed':
        return 'bg-gray-100 text-gray-800'
      case 'escalated':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <Helmet>
        <title>Content Reporting - Med-Mng</title>
        <meta name="description" content="Report inappropriate content and manage appeals" />
      </Helmet>

      <div className="space-y-8 py-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Content Reporting & Appeals</h1>
          <p className="text-gray-500">Report inappropriate content and manage your appeals</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="reports" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reports">My Reports</TabsTrigger>
            <TabsTrigger value="appeals">My Appeals</TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Your Reports</h3>
              <Button onClick={() => setShowReportDialog(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Report Content
              </Button>
            </div>

            {userReports.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No reports yet</p>
                    <Button onClick={() => setShowReportDialog(true)} variant="outline">
                      Submit Your First Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {userReports.map((report) => (
                  <Card key={report.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getStatusColor(report.status)}>
                                {report.status.replace(/_/g, ' ')}
                              </Badge>
                              <Badge variant="outline">{report.reportCategory.replace(/_/g, ' ')}</Badge>
                            </div>
                            <p className="font-medium line-clamp-2">{report.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {report.resolutionNotes && (
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-sm font-medium text-gray-700 mb-1">Resolution Notes:</p>
                            <p className="text-sm text-gray-600">{report.resolutionNotes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Appeals Tab */}
          <TabsContent value="appeals" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Your Appeals</h3>
              <Button onClick={() => setShowAppealDialog(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Submit Appeal
              </Button>
            </div>

            {userAppeals.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No appeals yet</p>
                    <p className="text-sm text-gray-400 mb-4">
                      If you believe a report was made in error, you can submit an appeal
                    </p>
                    <Button onClick={() => setShowAppealDialog(true)} variant="outline">
                      Submit an Appeal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {userAppeals.map((appeal) => (
                  <Card key={appeal.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getStatusColor(appeal.status)}>
                                {appeal.status.replace(/_/g, ' ')}
                              </Badge>
                              <Badge variant="outline">{appeal.appealType.replace(/_/g, ' ')}</Badge>
                            </div>
                            <p className="font-medium line-clamp-2">{appeal.appealReason}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(appeal.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {appeal.decisionNotes && (
                          <div className="p-3 bg-blue-50 rounded">
                            <p className="text-sm font-medium text-blue-700 mb-1">Decision:</p>
                            <p className="text-sm text-blue-600">{appeal.decisionNotes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Report Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Report Content</DialogTitle>
              <DialogDescription>Help us keep the platform safe by reporting inappropriate content</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Content Type</label>
                  <Select value={reportForm.contentType} onValueChange={(value) => setReportForm({ ...reportForm, contentType: value })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="post">Post</SelectItem>
                      <SelectItem value="comment">Comment</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="message">Message</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={reportForm.reportCategory} onValueChange={(value) => setReportForm({ ...reportForm, reportCategory: value })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                      <SelectItem value="harassment">Harassment</SelectItem>
                      <SelectItem value="spam">Spam</SelectItem>
                      <SelectItem value="misinformation">Misinformation</SelectItem>
                      <SelectItem value="copyright">Copyright Violation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Content ID</label>
                <Input
                  value={reportForm.contentId}
                  onChange={(e) => setReportForm({ ...reportForm, contentId: e.target.value })}
                  placeholder="e.g., post-123 or user-456"
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Severity</label>
                <Select value={reportForm.severity} onValueChange={(value) => setReportForm({ ...reportForm, severity: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  placeholder="Explain why you're reporting this content..."
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateReport} disabled={createReportMutation.isPending}>
                  {createReportMutation.isPending ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Appeal Dialog */}
        <Dialog open={showAppealDialog} onOpenChange={setShowAppealDialog}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit an Appeal</DialogTitle>
              <DialogDescription>If you believe an action was taken in error, you can appeal</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Appeal Type</label>
                <Select value={appealForm.appealType} onValueChange={(value) => setAppealForm({ ...appealForm, appealType: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="report_incorrect">Report Was Incorrect</SelectItem>
                    <SelectItem value="context_missing">Important Context Missing</SelectItem>
                    <SelectItem value="mistaken_identity">Mistaken Identity</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Appeal Reason</label>
                <Textarea
                  value={appealForm.appealReason}
                  onChange={(e) => setAppealForm({ ...appealForm, appealReason: e.target.value })}
                  placeholder="Explain why you're appealing..."
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Supporting Evidence (Optional)</label>
                <Textarea
                  value={appealForm.supportingEvidence}
                  onChange={(e) => setAppealForm({ ...appealForm, supportingEvidence: e.target.value })}
                  placeholder="Provide any evidence that supports your appeal..."
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowAppealDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAppeal} disabled={createAppealMutation.isPending}>
                  {createAppealMutation.isPending ? 'Submitting...' : 'Submit Appeal'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
