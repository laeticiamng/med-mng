import React from 'react'
import { Helmet } from 'react-helmet-async'
import {
  useFetchHealthMetricsHistory,
  useFetchUserActivityTrend,
  useFetchContentAnalyticsTrend,
  useFetchActiveAlerts,
  useAcknowledgeAlert,
  useResolveAlert,
} from '@/hooks/usePlatformAnalytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { AlertTriangle, Activity, TrendingUp, Server, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function PlatformAnalytics() {
  // ✅ SÉCURITÉ: Vérification admin requise
  const { user } = useAuth();
  const { isAdmin, loadingMyRoles } = useUserRoles();

  if (!user) {
    return <Navigate to="/med-mng-login" replace />;
  }

  if (!loadingMyRoles && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const { data: healthMetrics = [] } = useFetchHealthMetricsHistory(7)
  const { data: userActivityTrend = [] } = useFetchUserActivityTrend(30)
  const { data: contentAnalytics = [] } = useFetchContentAnalyticsTrend(30)
  const { data: activeAlerts = [] } = useFetchActiveAlerts()
  const acknowledgeMutation = useAcknowledgeAlert()
  const resolveMutation = useResolveAlert()

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeMutation.mutateAsync(alertId)
      toast.success('Alert acknowledged')
    } catch (error) {
      toast.error('Failed to acknowledge alert')
    }
  }

  const handleResolveAlert = async (alertId: string) => {
    try {
      await resolveMutation.mutateAsync(alertId)
      toast.success('Alert resolved')
    } catch (error) {
      toast.error('Failed to resolve alert')
    }
  }

  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical')
  const warningAlerts = activeAlerts.filter((a) => a.severity === 'warning')

  return (
    <>
      <Helmet>
        <title>Platform Analytics - Med-Mng</title>
        <meta name="description" content="Platform performance, user activity, and content analytics" />
      </Helmet>

      <div className="space-y-8 py-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
          <p className="text-gray-500">Monitor platform health, performance, and user activity</p>
        </div>

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <div className="space-y-3">
            {criticalAlerts.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900">{criticalAlerts.length} Critical Alert(s)</h3>
                      <p className="text-sm text-red-800 mt-1">
                        {criticalAlerts.map((a) => a.title).join(', ')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {warningAlerts.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-orange-900">{warningAlerts.length} Warning(s)</h3>
                      <p className="text-sm text-orange-800 mt-1">
                        {warningAlerts.map((a) => a.title).join(', ')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Health</CardTitle>
              <Server className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {healthMetrics.length > 0
                  ? (
                      (healthMetrics[healthMetrics.length - 1].successfulRequests /
                        healthMetrics[healthMetrics.length - 1].totalRequests) *
                      100
                    ).toFixed(1)
                  : '0'}
                %
              </div>
              <p className="text-xs text-gray-500">Success rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userActivityTrend.length > 0 ? userActivityTrend[userActivityTrend.length - 1].activeUsers : '0'}
              </div>
              <p className="text-xs text-gray-500">Current active users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {healthMetrics.length > 0 ? healthMetrics[healthMetrics.length - 1].avgResponseTimeMs?.toFixed(0) : '0'}ms
              </div>
              <p className="text-xs text-gray-500">Average API response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAlerts.length}</div>
              <p className="text-xs text-gray-500">System alerts</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="health" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="users">User Activity</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Response Time (7 days)</CardTitle>
                <CardDescription>Average response time in milliseconds</CardDescription>
              </CardHeader>
              <CardContent>
                {healthMetrics.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={healthMetrics.map((m) => ({ date: m.metricDate, responseTime: m.avgResponseTimeMs || 0 }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="responseTime" stroke="#8b5cf6" strokeWidth={2} name="Response Time (ms)" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-8">No health data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request Success Rate (7 days)</CardTitle>
                <CardDescription>Percentage of successful requests</CardDescription>
              </CardHeader>
              <CardContent>
                {healthMetrics.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={healthMetrics.map((m) => ({
                        date: m.metricDate,
                        successRate: ((m.successfulRequests / m.totalRequests) * 100).toFixed(1),
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="successRate" fill="#10b981" stroke="#059669" name="Success Rate (%)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-8">No health data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Activity Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Users Trend (30 days)</CardTitle>
                <CardDescription>Daily active user count</CardDescription>
              </CardHeader>
              <CardContent>
                {userActivityTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={userActivityTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="activityDate" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="activeUsers" fill="#3b82f6" name="Active Users" />
                      <Bar dataKey="newUsers" fill="#10b981" name="New Users" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-8">No user activity data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                {userActivityTrend.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded">
                      <p className="text-sm text-blue-600 font-medium">Total Sessions</p>
                      <p className="text-2xl font-bold mt-1">
                        {userActivityTrend.reduce((sum, u) => sum + u.totalSessions, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded">
                      <p className="text-sm text-purple-600 font-medium">Avg Session Duration</p>
                      <p className="text-2xl font-bold mt-1">
                        {(userActivityTrend[userActivityTrend.length - 1].avgSessionDurationMinutes || 0).toFixed(1)} min
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No session data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Creation Trend (30 days)</CardTitle>
                <CardDescription>Daily posts and comments</CardDescription>
              </CardHeader>
              <CardContent>
                {contentAnalytics.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={contentAnalytics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="analyticsDate" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="newPosts" stroke="#8b5cf6" strokeWidth={2} name="New Posts" />
                      <Line type="monotone" dataKey="newComments" stroke="#ec4899" strokeWidth={2} name="New Comments" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-8">No content data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                {contentAnalytics.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-pink-50 rounded">
                      <p className="text-sm text-pink-600 font-medium">Total Likes</p>
                      <p className="text-2xl font-bold mt-1">
                        {contentAnalytics[contentAnalytics.length - 1].totalLikes.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded">
                      <p className="text-sm text-blue-600 font-medium">Total Shares</p>
                      <p className="text-2xl font-bold mt-1">
                        {contentAnalytics[contentAnalytics.length - 1].totalShares.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded">
                      <p className="text-sm text-green-600 font-medium">Total Posts</p>
                      <p className="text-2xl font-bold mt-1">
                        {contentAnalytics[contentAnalytics.length - 1].totalPosts.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded">
                      <p className="text-sm text-orange-600 font-medium">Engagement Rate</p>
                      <p className="text-2xl font-bold mt-1">
                        {(contentAnalytics[contentAnalytics.length - 1].engagementRate || 0).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No content data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            {activeAlerts.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500 py-8">No active alerts</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {activeAlerts.map((alert) => (
                  <Card key={alert.id} className={alert.severity === 'critical' ? 'border-red-200 bg-red-50' : alert.severity === 'warning' ? 'border-orange-200 bg-orange-50' : ''}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                alert.severity === 'critical'
                                  ? 'bg-red-600 text-white'
                                  : alert.severity === 'warning'
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-blue-600 text-white'
                              }
                            >
                              {alert.severity}
                            </Badge>
                            <Badge variant="outline">{alert.alertType.replace(/_/g, ' ')}</Badge>
                          </div>
                          <p className="font-semibold">{alert.title}</p>
                          {alert.description && (
                            <p className="text-sm text-gray-600">{alert.description}</p>
                          )}
                          <div className="text-xs text-gray-500 pt-2">
                            {alert.affectedMetric && <span>Metric: {alert.affectedMetric}</span>}
                            {alert.actualValue && (
                              <span className="ml-3">
                                Value: {alert.actualValue.toFixed(2)} / Threshold: {alert.thresholdExceeded?.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            disabled={acknowledgeMutation.isPending}
                          >
                            Acknowledge
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveAlert(alert.id)}
                            disabled={resolveMutation.isPending}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
