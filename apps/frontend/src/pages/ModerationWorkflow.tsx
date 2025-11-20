import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Navigate } from 'react-router-dom'
import { useFetchModerationRules, useFetchPendingAppeals, useFetchModerationTeams } from '@/hooks/useModeration'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Shield, Users, FileText } from 'lucide-react'
import ModerationRulesManager from '@/components/moderation/ModerationRulesManager'
import ModerationTeamsManager from '@/components/moderation/ModerationTeamsManager'
import AppealsReviewPanel from '@/components/moderation/AppealsReviewPanel'
import { useAuth } from '@/hooks/useAuth'
import { useUserRoles } from '@/hooks/useUserRoles'

export default function ModerationWorkflow() {
  // ✅ SÉCURITÉ: Vérification admin/moderator requise
  const { user } = useAuth();
  const { isAdmin, loadingMyRoles } = useUserRoles();

  if (!user) {
    return <Navigate to="/med-mng-login" replace />;
  }

  if (!loadingMyRoles && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const [activeTab, setActiveTab] = useState('overview')

  // Fetch data
  const { data: rules = [] } = useFetchModerationRules(true)
  const { data: pendingAppeals = [] } = useFetchPendingAppeals()
  const { data: teams = [] } = useFetchModerationTeams()

  const activeRulesCount = rules.filter((r) => r.isActive).length
  const pendingAppealCount = pendingAppeals.length

  return (
    <>
      <Helmet>
        <title>Moderation Workflow - Admin</title>
        <meta name="description" content="Content moderation workflows, rules, and appeals" />
      </Helmet>

      <div className="space-y-8 py-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Moderation Workflow</h1>
          <p className="text-gray-500">Manage moderation rules, teams, and content appeals</p>
        </div>

        {/* Alert if pending appeals */}
        {pendingAppealCount > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">
                {pendingAppealCount} Appeal{pendingAppealCount !== 1 ? 's' : ''} Pending Review
              </h3>
              <p className="text-sm text-blue-800">Users have submitted appeals that require attention</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeRulesCount}</div>
              <p className="text-xs text-gray-500">Rules enforcing content policy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Moderation Teams</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams.length}</div>
              <p className="text-xs text-gray-500">Teams managing content</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Appeals</CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAppealCount}</div>
              <p className="text-xs text-gray-500">Awaiting review</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="appeals" className="flex items-center gap-2">
              Appeals
              {pendingAppealCount > 0 && <Badge variant="destructive">{pendingAppealCount}</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Moderation System Overview</CardTitle>
                <CardDescription>Key metrics and system status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600 font-medium">Active Moderation Rules</p>
                    <p className="text-2xl font-bold mt-1">{activeRulesCount}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600 font-medium">Moderation Teams</p>
                    <p className="text-2xl font-bold mt-1">{teams.length}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded">
                    <p className="text-sm text-blue-600 font-medium">Total Team Members</p>
                    <p className="text-2xl font-bold mt-1">
                      {teams.reduce((sum, team) => sum + (team.expertise?.length || 0), 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded">
                    <p className="text-sm text-orange-600 font-medium">Pending Appeals</p>
                    <p className="text-2xl font-bold mt-1">{pendingAppealCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules">
            <ModerationRulesManager />
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams">
            <ModerationTeamsManager />
          </TabsContent>

          {/* Appeals Tab */}
          <TabsContent value="appeals">
            <AppealsReviewPanel />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
