import React, { useState } from 'react'
import { useCreateUserAction } from '@/hooks/useAdmin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, Shield, Ban } from 'lucide-react'
import { toast } from 'sonner'

type ActionType = 'warn' | 'suspend' | 'ban'

export default function UserActionsPanel() {
  const createActionMutation = useCreateUserAction()

  const [showDialog, setShowDialog] = useState(false)
  const [actionType, setActionType] = useState<ActionType>('warn')
  const [userId, setUserId] = useState('')
  const [reason, setReason] = useState('')
  const [durationDays, setDurationDays] = useState<number | ''>('')

  const handleCreateAction = async () => {
    if (!userId.trim()) {
      toast.error('User ID is required')
      return
    }

    try {
      await createActionMutation.mutateAsync({
        userId: userId.trim(),
        actionType,
        reason: reason || undefined,
        durationDays: durationDays ? parseInt(durationDays.toString()) : undefined,
      })

      toast.success(`${actionType} action created for user`)
      setUserId('')
      setReason('')
      setDurationDays('')
      setActionType('warn')
      setShowDialog(false)
    } catch (error) {
      toast.error('Failed to create user action')
      console.error(error)
    }
  }

  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case 'warn':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'suspend':
        return <Shield className="h-5 w-5 text-orange-600" />
      case 'ban':
        return <Ban className="h-5 w-5 text-red-600" />
      default:
        return null
    }
  }

  const getActionColor = (type: ActionType) => {
    switch (type) {
      case 'warn':
        return 'bg-yellow-50 border-yellow-200'
      case 'suspend':
        return 'bg-orange-50 border-orange-200'
      case 'ban':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Actions</CardTitle>
          <CardDescription>Issue warnings, suspensions, or bans to users</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowDialog(true)} className="w-full">
            Create User Action
          </Button>
        </CardContent>
      </Card>

      {/* Action Types Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`border ${getActionColor('warn')}`}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              {getActionIcon('warn')}
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">Warning</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  Notify user of policy violation. No account restrictions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border ${getActionColor('suspend')}`}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              {getActionIcon('suspend')}
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900">Suspension</h3>
                <p className="text-sm text-orange-800 mt-1">
                  Temporarily restrict account access for a specified period.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border ${getActionColor('ban')}`}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              {getActionIcon('ban')}
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Ban</h3>
                <p className="text-sm text-red-800 mt-1">Permanently revoke account access.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User Action</DialogTitle>
            <DialogDescription>Issue a warning, suspension, or ban to a user</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* User ID */}
            <div>
              <label className="text-sm font-medium">User ID</label>
              <Input
                placeholder="Enter user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Action Type */}
            <div>
              <label className="text-sm font-medium mb-3 block">Action Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['warn', 'suspend', 'ban'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={actionType === type ? 'default' : 'outline'}
                    className={actionType === type ? (type === 'warn' ? 'bg-yellow-600' : type === 'suspend' ? 'bg-orange-600' : 'bg-red-600') : ''}
                    onClick={() => setActionType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Duration (for suspend) */}
            {actionType === 'suspend' && (
              <div>
                <label className="text-sm font-medium">Duration (days)</label>
                <Input
                  type="number"
                  placeholder="e.g., 30"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value ? parseInt(e.target.value) : '')}
                  className="mt-2"
                  min="1"
                />
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="text-sm font-medium">Reason</label>
              <Textarea
                placeholder="Explain the reason for this action..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateAction}
                disabled={createActionMutation.isPending || !userId.trim()}
                className={
                  actionType === 'warn'
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : actionType === 'suspend'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-red-600 hover:bg-red-700'
                }
              >
                {createActionMutation.isPending ? 'Processing...' : `Create ${actionType}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
