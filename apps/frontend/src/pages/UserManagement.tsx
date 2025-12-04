import logger from '@/lib/logger';
import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useUserRoles } from '@/hooks/useUserRoles'
import { useFetchGroups, useCreateGroup } from '@/hooks/useUserManagement'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Users, Shield, Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function UserManagement() {
  // ✅ SÉCURITÉ: Vérification admin requise
  const { user } = useAuth()
  const { isAdmin, loadingMyRoles } = useUserRoles()

  if (!user) {
    return <Navigate to="/med-mng/login" replace />
  }

  if (!loadingMyRoles && !isAdmin) {
    return <Navigate to="/" replace />
  }

  const { data: groups = [] } = useFetchGroups()
  const createGroupMutation = useCreateGroup()
  const [showGroupDialog, setShowGroupDialog] = useState(false)
  const [groupFormData, setGroupFormData] = useState({ name: '', description: '', color: '#6366f1' })

  const handleCreateGroup = async () => {
    if (!groupFormData.name.trim()) {
      toast.error('Group name is required')
      return
    }

    try {
      await createGroupMutation.mutateAsync(groupFormData)
      toast.success('Group created successfully')
      setGroupFormData({ name: '', description: '', color: '#6366f1' })
      setShowGroupDialog(false)
    } catch (error) {
      toast.error('Failed to create group')
      logger.error(error)
    }
  }

  return (
    <>
      <Helmet>
        <title>User Management - Admin</title>
        <meta name="description" content="Manage users, roles, and permissions" />
      </Helmet>

      <div className="space-y-8 py-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-gray-500">Manage user roles, permissions, groups, and status</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{groups.length}</div>
              <p className="text-xs text-gray-500">User groups configured</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Roles</CardTitle>
              <Shield className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-gray-500">Standard roles: admin, moderator, etc.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Permissions</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">11</div>
              <p className="text-xs text-gray-500">Granular permissions available</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="groups" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">User Groups</h3>
              <Button onClick={() => setShowGroupDialog(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Group
              </Button>
            </div>

            {groups.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500 py-8">No groups created yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {groups.map((group) => (
                  <Card key={group.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: group.color || '#6366f1' }}
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{group.name}</h4>
                          {group.description && (
                            <p className="text-sm text-gray-600">{group.description}</p>
                          )}
                        </div>
                        <Badge variant="secondary">{group.memberCount} members</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle>Standard Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['admin', 'moderator', 'reviewer', 'viewer', 'user'].map((role) => (
                    <div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="font-medium capitalize">{role}</span>
                      <Badge>{role === 'admin' ? 'Full Access' : 'Limited Access'}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Available Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['manage_users', 'manage_roles', 'manage_permissions', 'view_analytics', 'manage_moderation', 'manage_content', 'edit_content', 'delete_content', 'view_reports', 'manage_groups', 'manage_system'].map((perm) => (
                    <div key={perm} className="p-3 bg-gray-50 rounded">
                      <span className="font-medium text-sm">{perm.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Status Tab */}
          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle>User Status Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { status: 'active', color: 'bg-green-100 text-green-800', desc: 'User can access all features' },
                    { status: 'inactive', color: 'bg-gray-100 text-gray-800', desc: 'User account is inactive' },
                    { status: 'suspended', color: 'bg-orange-100 text-orange-800', desc: 'Temporary access restriction' },
                    { status: 'banned', color: 'bg-red-100 text-red-800', desc: 'Permanent access denial' },
                    { status: 'pending', color: 'bg-blue-100 text-blue-800', desc: 'Awaiting verification' },
                  ].map((item) => (
                    <div key={item.status} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <Badge className={item.color}>{item.status}</Badge>
                      <span className="text-sm text-gray-600">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog for creating group */}
        <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create User Group</DialogTitle>
              <DialogDescription>Set up a new user group for organization</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Group Name</label>
                <Input
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                  placeholder="e.g., Content Moderators"
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={groupFormData.description}
                  onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                  placeholder="Group description..."
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Color</label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="color"
                    value={groupFormData.color}
                    onChange={(e) => setGroupFormData({ ...groupFormData, color: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{groupFormData.color}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowGroupDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateGroup} disabled={createGroupMutation.isPending}>
                  {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
