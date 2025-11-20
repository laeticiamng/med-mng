import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Navigate } from 'react-router-dom'
import { useFetchAdminReports, useUpdateReportStatus, useFetchAdminAppeals, useReviewAppeal } from '@/hooks/useContentReporting'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, FileText, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useUserRoles } from '@/hooks/useUserRoles'

export default function ReportsAdminPanel() {
  // ✅ SÉCURITÉ: Vérification admin requise
  const { user } = useAuth();
  const { isAdmin, loadingMyRoles } = useUserRoles();

  if (!user) {
    return <Navigate to="/med-mng-login" replace />;
  }

  if (!loadingMyRoles && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  const { data: reports = [] } = useFetchAdminReports()
  const { data: appeals = [] } = useFetchAdminAppeals()
  const updateReportMutation = useUpdateReportStatus()
  const reviewAppealMutation = useReviewAppeal()

  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [selectedAppeal, setSelectedAppeal] = useState<any>(null)
  const [reportStatus, setReportStatus] = useState<string>('')
  const [reportNotes, setReportNotes] = useState('')
  const [appealStatus, setAppealStatus] = useState<string>('')
  const [appealNotes, setAppealNotes] = useState('')

  const handleUpdateReport = async () => {
    if (!reportStatus) {
      toast.error('Please select a status')
      return
    }

    try {
      await updateReportMutation.mutateAsync({
        reportId: selectedReport.id,
        status: reportStatus,
        resolutionNotes: reportNotes || undefined,
      })
      toast.success('Report updated')
      setSelectedReport(null)
      setReportStatus('')
      setReportNotes('')
    } catch (error) {
      toast.error('Failed to update report')
      console.error(error)
    }
  }

  const handleReviewAppeal = async () => {
    if (!appealStatus) {
      toast.error('Please select a decision')
      return
    }

    try {
      await reviewAppealMutation.mutateAsync({
        appealId: selectedAppeal.id,
        status: appealStatus,
        decisionNotes: appealNotes || undefined,
      })
      toast.success('Appeal reviewed')
      setSelectedAppeal(null)
      setAppealStatus('')
      setAppealNotes('')
    } catch (error) {
      toast.error('Failed to review appeal')
      console.error(error)
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
      case 'granted':
        return 'bg-green-100 text-green-800'
      case 'denied':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const pendingReports = reports.filter((r) => r.status === 'pending')
  const pendingAppeals = appeals.filter((a) => a.status === 'pending')

  return (
    <>
      <Helmet>
        <title>Reports Admin - Med-Mng</title>
        <meta name="description" content="Manage content reports and appeals" />
      </Helmet>

      <div className="space-y-8 py-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Reports & Appeals Admin</h1>
          <p className="text-gray-500">Review and manage content reports and user appeals</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-gray-500">{pendingReports.length} pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Appeals</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAppeals.length}</div>
              <p className="text-xs text-gray-500">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.filter((r) => r.status === 'resolved').length}</div>
              <p className="text-xs text-gray-500">Completed reviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appeals</CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appeals.length}</div>
              <p className="text-xs text-gray-500">All appeals</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="reports" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reports">Content Reports</TabsTrigger>
            <TabsTrigger value="appeals">Appeals</TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            {reports.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500 py-8">No reports</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <Card key={report.id} className={report.status === 'pending' ? 'border-orange-200 bg-orange-50' : ''}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={getStatusColor(report.status)}>
                              {report.status.replace(/_/g, ' ')}
                            </Badge>
                            <Badge variant="outline">{report.reportCategory.replace(/_/g, ' ')}</Badge>
                            <Badge variant={report.severity === 'high' ? 'destructive' : 'secondary'}>
                              {report.severity}
                            </Badge>
                          </div>
                          <p className="font-medium line-clamp-2">{report.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                            <span>Reporter: {report.userId.slice(0, 8)}...</span>
                          </div>
                        </div>

                        <Button
                          onClick={() => {
                            setSelectedReport(report)
                            setReportStatus(report.status)
                            setReportNotes('')
                          }}
                        >
                          Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Appeals Tab */}
          <TabsContent value="appeals" className="space-y-4">
            {appeals.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500 py-8">No appeals</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {appeals.map((appeal) => (
                  <Card key={appeal.id} className={appeal.status === 'pending' ? 'border-orange-200 bg-orange-50' : ''}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={getStatusColor(appeal.status)}>
                              {appeal.status.replace(/_/g, ' ')}
                            </Badge>
                            <Badge variant="outline">{appeal.appealType.replace(/_/g, ' ')}</Badge>
                          </div>
                          <p className="font-medium line-clamp-2">{appeal.appealReason}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(appeal.createdAt).toLocaleDateString()}
                            </span>
                            <span>Appellant: {appeal.userId.slice(0, 8)}...</span>
                          </div>
                        </div>

                        <Button
                          onClick={() => {
                            setSelectedAppeal(appeal)
                            setAppealStatus(appeal.status)
                            setAppealNotes('')
                          }}
                        >
                          Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Report Review Dialog */}
        <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Content Report</DialogTitle>
              <DialogDescription>{selectedReport?.description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={reportStatus} onValueChange={setReportStatus}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Resolution Notes</label>
                <Textarea
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="Add resolution notes..."
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setSelectedReport(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateReport} disabled={updateReportMutation.isPending}>
                  {updateReportMutation.isPending ? 'Updating...' : 'Update Report'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Appeal Review Dialog */}
        <Dialog open={!!selectedAppeal} onOpenChange={(open) => !open && setSelectedAppeal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Appeal</DialogTitle>
              <DialogDescription>{selectedAppeal?.appealReason}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Decision</label>
                <Select value={appealStatus} onValueChange={setAppealStatus}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="granted">Granted</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Decision Notes</label>
                <Textarea
                  value={appealNotes}
                  onChange={(e) => setAppealNotes(e.target.value)}
                  placeholder="Explain your decision..."
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setSelectedAppeal(null)}>
                  Cancel
                </Button>
                <Button onClick={handleReviewAppeal} disabled={reviewAppealMutation.isPending}>
                  {reviewAppealMutation.isPending ? 'Reviewing...' : 'Submit Decision'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
