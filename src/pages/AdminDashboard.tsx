import React, { useState, Suspense } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  useFetchModerationQueue,
  useFetchContentReports,
  useFetchAuditLogs,
  useFetchPlatformMetrics,
  useFetchMetricsHistory,
} from '@/hooks/useAdmin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertTriangle,
  Clock,
  Users,
  FileText,
  BarChart3,
  Activity,
  Loader,
} from 'lucide-react'

// Lazy load admin components
const ModerationQueue = React.lazy(() => import('@/components/admin/ModerationQueue'))
const ContentReportsPanel = React.lazy(() => import('@/components/admin/ContentReportsPanel'))
const AuditLogsViewer = React.lazy(() => import('@/components/admin/AuditLogsViewer'))
const PlatformMetrics = React.lazy(() => import('@/components/admin/PlatformMetrics'))
const UserActionsPanel = React.lazy(() => import('@/components/admin/UserActionsPanel'))

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center space-y-2">
        <Loader className="h-8 w-8 animate-spin mx-auto text-blue-500" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch data
  const { data: pendingModerations = [] } = useFetchModerationQueue('pending')
  const { data: allReports = [] } = useFetchContentReports()
  const { data: auditLogs = [], isLoading: auditLogsLoading } = useFetchAuditLogs(100)
  const { data: platformMetrics } = useFetchPlatformMetrics()
  const { data: metricsHistory = [] } = useFetchMetricsHistory(7)

  // Calculate stats
  const pendingModerationsCount = pendingModerations?.length || 0
  const unresolvedReportsCount = allReports?.filter((r) => r.status === 'pending')?.length || 0
  const totalUsers = platformMetrics?.total_users || 0
  const activeUsers = platformMetrics?.active_users_today || 0

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Med-Mng</title>
        <meta name="description" content="Platform administration and moderation dashboard" />
      </Helmet>

      <div className="space-y-8 py-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500">Manage platform content, users, and system health</p>
        </div>

        {/* Alert if critical items pending */}
        {pendingModerationsCount > 0 && (
          <Alert className="border-orange-500 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              {pendingModerationsCount} item{pendingModerationsCount !== 1 ? 's' : ''} awaiting
              moderation review
            </AlertDescription>
          </Alert>
        )}

        {unresolvedReportsCount > 0 && (
          <Alert className="border-red-500 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {unresolvedReportsCount} unresolved content report{unresolvedReportsCount !== 1 ? 's' : ''}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Moderation</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingModerationsCount}</div>
              <p className="text-xs text-gray-500">Items awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content Reports</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unresolvedReportsCount}</div>
              <p className="text-xs text-gray-500">Unresolved reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
              <p className="text-xs text-gray-500">{activeUsers} active today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Audits</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditLogs?.length || 0}</div>
              <p className="text-xs text-gray-500">Logged actions (last 100)</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Moderation</span>
              {pendingModerationsCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingModerationsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
              {unresolvedReportsCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unresolvedReportsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Actions</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Audit</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Suspense fallback={<LoadingFallback />}>
              <PlatformMetrics metricsHistory={metricsHistory} currentMetrics={platformMetrics} />
            </Suspense>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation">
            <Suspense fallback={<LoadingFallback />}>
              <ModerationQueue />
            </Suspense>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Suspense fallback={<LoadingFallback />}>
              <ContentReportsPanel />
            </Suspense>
          </TabsContent>

          {/* User Actions Tab */}
          <TabsContent value="actions">
            <Suspense fallback={<LoadingFallback />}>
              <UserActionsPanel />
            </Suspense>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit">
            <Suspense fallback={<LoadingFallback />}>
              <AuditLogsViewer logs={auditLogs} isLoading={auditLogsLoading} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}