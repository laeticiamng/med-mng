import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Users, TrendingUp, Activity, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PlatformMetricsData {
  total_users?: number
  active_users_today?: number
  active_users_week?: number
  new_users_today?: number
  posts_created_today?: number
  comments_created_today?: number
  reports_created_today?: number
  moderation_queue_count?: number
  system_health?: 'good' | 'warning' | 'critical'
  api_uptime_percent?: number
  avg_response_time_ms?: number
}

interface Props {
  currentMetrics?: PlatformMetricsData
  metricsHistory?: any[]
}

export default function PlatformMetrics({ currentMetrics, metricsHistory = [] }: Props) {
  const healthColor =
    currentMetrics?.system_health === 'good'
      ? 'text-green-600'
      : currentMetrics?.system_health === 'warning'
        ? 'text-yellow-600'
        : 'text-red-600'

  const healthBg =
    currentMetrics?.system_health === 'good'
      ? 'bg-green-50'
      : currentMetrics?.system_health === 'warning'
        ? 'bg-yellow-50'
        : 'bg-red-50'

  // Prepare chart data
  const chartData = metricsHistory.map((metric) => ({
    date: new Date(metric.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    activeUsers: metric.active_users_today || 0,
    newUsers: metric.new_users_today || 0,
    posts: metric.posts_created_today || 0,
    comments: metric.comments_created_today || 0,
  }))

  return (
    <div className="space-y-6">
      {/* System Health Summary */}
      <Card className={healthBg}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">System Health</h3>
              <p className="text-sm text-gray-600">
                API Uptime: {currentMetrics?.api_uptime_percent?.toFixed(2)}% • Avg Response:
                {currentMetrics?.avg_response_time_ms}ms
              </p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${healthColor}`}>
                {currentMetrics?.system_health === 'good'
                  ? '✓'
                  : currentMetrics?.system_health === 'warning'
                    ? '⚠'
                    : '✕'}
              </div>
              <Badge
                className={
                  currentMetrics?.system_health === 'good'
                    ? 'bg-green-100 text-green-800'
                    : currentMetrics?.system_health === 'warning'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }
              >
                {currentMetrics?.system_health}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics?.total_users?.toLocaleString() || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {currentMetrics?.new_users_today || 0} new today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics?.active_users_today?.toLocaleString() || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {currentMetrics?.active_users_week || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics?.posts_created_today || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {currentMetrics?.comments_created_today || 0} comments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue Size</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics?.moderation_queue_count || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Items pending review</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Charts */}
      {chartData.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>User Activity Trend</CardTitle>
              <CardDescription>Active users and new registrations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="activeUsers" stroke="#3b82f6" strokeWidth={2} name="Active Users" />
                  <Line type="monotone" dataKey="newUsers" stroke="#10b981" strokeWidth={2} name="New Users" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Creation</CardTitle>
              <CardDescription>Posts and comments created daily</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="posts" fill="#8b5cf6" name="Posts" />
                  <Bar dataKey="comments" fill="#ec4899" name="Comments" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
