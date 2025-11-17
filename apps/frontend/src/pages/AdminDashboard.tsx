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
    <div
      className="flex items-center justify-center py-8"
      role="status"
      aria-live="polite"
      aria-label="Chargement du contenu"
    >
      <div className="text-center space-y-2">
        <Loader className="h-8 w-8 animate-spin mx-auto text-blue-500" aria-hidden="true" />
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
        <header className="space-y-2" role="banner">
          <h1 className="text-3xl font-bold tracking-tight" id="dashboard-title">
            Admin Dashboard
          </h1>
          <p className="text-gray-500" id="dashboard-description">
            Manage platform content, users, and system health
          </p>
        </header>

        {/* Alert if critical items pending */}
        <div role="region" aria-live="polite" aria-atomic="true" aria-label="Alertes administrateur">
          {pendingModerationsCount > 0 && (
            <Alert className="border-orange-500 bg-orange-50" role="alert">
              <AlertTriangle className="h-4 w-4 text-orange-600" aria-hidden="true" />
              <AlertDescription className="text-orange-800">
                <span className="sr-only">Attention: </span>
                {pendingModerationsCount} item{pendingModerationsCount !== 1 ? 's' : ''} awaiting
                moderation review
              </AlertDescription>
            </Alert>
          )}

          {unresolvedReportsCount > 0 && (
            <Alert className="border-red-500 bg-red-50 mt-4" role="alert">
              <AlertTriangle className="h-4 w-4 text-red-600" aria-hidden="true" />
              <AlertDescription className="text-red-800">
                <span className="sr-only">Alerte: </span>
                {unresolvedReportsCount} unresolved content report{unresolvedReportsCount !== 1 ? 's' : ''}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Stats Grid */}
        <section
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
          role="region"
          aria-labelledby="stats-heading"
        >
          <h2 id="stats-heading" className="sr-only">
            Statistiques du tableau de bord
          </h2>

          <Card role="article" aria-labelledby="stat-moderation">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" id="stat-moderation">
                Pending Moderation
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-label={`${pendingModerationsCount} éléments en attente`}>
                {pendingModerationsCount}
              </div>
              <p className="text-xs text-gray-500">Items awaiting review</p>
            </CardContent>
          </Card>

          <Card role="article" aria-labelledby="stat-reports">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" id="stat-reports">
                Content Reports
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-label={`${unresolvedReportsCount} signalements non résolus`}>
                {unresolvedReportsCount}
              </div>
              <p className="text-xs text-gray-500">Unresolved reports</p>
            </CardContent>
          </Card>

          <Card role="article" aria-labelledby="stat-users">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" id="stat-users">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-label={`${totalUsers} utilisateurs au total`}>
                {totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500" aria-label={`${activeUsers} actifs aujourd'hui`}>
                {activeUsers} active today
              </p>
            </CardContent>
          </Card>

          <Card role="article" aria-labelledby="stat-audits">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" id="stat-audits">
                Recent Audits
              </CardTitle>
              <Activity className="h-4 w-4 text-green-600" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-label={`${auditLogs?.length || 0} actions enregistrées`}>
                {auditLogs?.length || 0}
              </div>
              <p className="text-xs text-gray-500">Logged actions (last 100)</p>
            </CardContent>
          </Card>
        </section>

        {/* Tabs */}
        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
          aria-labelledby="admin-tabs-label"
        >
          <h2 id="admin-tabs-label" className="sr-only">
            Sections d'administration
          </h2>
          <TabsList className="grid w-full grid-cols-5" role="tablist" aria-label="Onglets d'administration">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2"
              aria-label="Vue d'ensemble des métriques"
            >
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="moderation"
              className="flex items-center gap-2"
              aria-label={`Modération ${pendingModerationsCount > 0 ? `- ${pendingModerationsCount} éléments en attente` : ''}`}
            >
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Moderation</span>
              {pendingModerationsCount > 0 && (
                <Badge variant="destructive" className="ml-2" aria-label={`${pendingModerationsCount} en attente`}>
                  {pendingModerationsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="flex items-center gap-2"
              aria-label={`Signalements ${unresolvedReportsCount > 0 ? `- ${unresolvedReportsCount} non résolus` : ''}`}
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Reports</span>
              {unresolvedReportsCount > 0 && (
                <Badge variant="destructive" className="ml-2" aria-label={`${unresolvedReportsCount} non résolus`}>
                  {unresolvedReportsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="actions"
              className="flex items-center gap-2"
              aria-label="Actions utilisateur"
            >
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Actions</span>
            </TabsTrigger>
            <TabsTrigger
              value="audit"
              className="flex items-center gap-2"
              aria-label="Journal d'audit"
            >
              <Activity className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Audit</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent
            value="overview"
            className="space-y-4"
            role="tabpanel"
            aria-labelledby="tab-overview"
            tabIndex={0}
          >
            <Suspense fallback={<LoadingFallback />}>
              <PlatformMetrics metricsHistory={metricsHistory} currentMetrics={platformMetrics} />
            </Suspense>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent
            value="moderation"
            role="tabpanel"
            aria-labelledby="tab-moderation"
            tabIndex={0}
          >
            <Suspense fallback={<LoadingFallback />}>
              <ModerationQueue />
            </Suspense>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent
            value="reports"
            role="tabpanel"
            aria-labelledby="tab-reports"
            tabIndex={0}
          >
            <Suspense fallback={<LoadingFallback />}>
              <ContentReportsPanel />
            </Suspense>
          </TabsContent>

          {/* User Actions Tab */}
          <TabsContent
            value="actions"
            role="tabpanel"
            aria-labelledby="tab-actions"
            tabIndex={0}
          >
            <Suspense fallback={<LoadingFallback />}>
              <UserActionsPanel />
            </Suspense>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent
            value="audit"
            role="tabpanel"
            aria-labelledby="tab-audit"
            tabIndex={0}
          >
            <Suspense fallback={<LoadingFallback />}>
              <AuditLogsViewer logs={auditLogs} isLoading={auditLogsLoading} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}