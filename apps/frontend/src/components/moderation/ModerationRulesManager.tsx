import logger from '@/lib/logger';
import React, { useState } from 'react'
import {
  useFetchModerationRules,
  useCreateModerationRule,
  useUpdateModerationRule,
  useDeleteModerationRule,
} from '@/hooks/useModeration'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'

export default function ModerationRulesManager() {
  const { data: rules = [], isLoading } = useFetchModerationRules()
  const createMutation = useCreateModerationRule()
  const updateMutation = useUpdateModerationRule()
  const deleteMutation = useDeleteModerationRule()

  const [showDialog, setShowDialog] = useState(false)
  const [editingRule, setEditingRule] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ruleType: 'keyword' as const,
    action: 'flag' as const,
    severity: 'medium' as const,
  })

  const handleOpenDialog = (rule?: any) => {
    if (rule) {
      setEditingRule(rule)
      setFormData({
        name: rule.name,
        description: rule.description || '',
        ruleType: rule.ruleType,
        action: rule.action,
        severity: rule.severity,
      })
    } else {
      setEditingRule(null)
      setFormData({
        name: '',
        description: '',
        ruleType: 'keyword',
        action: 'flag',
        severity: 'medium',
      })
    }
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Rule name is required')
      return
    }

    try {
      if (editingRule) {
        await updateMutation.mutateAsync({
          ruleId: editingRule.id,
          updates: formData,
        })
        toast.success('Rule updated')
      } else {
        await createMutation.mutateAsync({
          ...formData,
          condition: {},
        })
        toast.success('Rule created')
      }
      setShowDialog(false)
    } catch (error) {
      toast.error('Failed to save rule')
      logger.error(error)
    }
  }

  const handleDelete = async (ruleId: string) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return

    try {
      await deleteMutation.mutateAsync(ruleId)
      toast.success('Rule deleted')
    } catch (error) {
      toast.error('Failed to delete rule')
      logger.error(error)
    }
  }

  const handleToggle = async (rule: any) => {
    try {
      await updateMutation.mutateAsync({
        ruleId: rule.id,
        updates: { isActive: !rule.isActive },
      })
      toast.success(`Rule ${!rule.isActive ? 'enabled' : 'disabled'}`)
    } catch (error) {
      toast.error('Failed to toggle rule')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading rules...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Moderation Rules</h3>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Rule
        </Button>
      </div>

      {rules.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500">No moderation rules configured yet</p>
              <Button onClick={() => handleOpenDialog()} variant="outline" className="mt-4">
                Create First Rule
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.id} className={rule.isActive ? '' : 'opacity-50'}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{rule.name}</h4>
                      <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge
                        className={
                          rule.severity === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : rule.severity === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : rule.severity === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                        }
                      >
                        {rule.severity}
                      </Badge>
                    </div>

                    {rule.description && (
                      <p className="text-sm text-gray-600">{rule.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
                      <span>Type: {rule.ruleType}</span>
                      <span>Action: {rule.action}</span>
                      <span>Priority: {rule.priority}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggle(rule)}
                      className="flex items-center gap-1"
                    >
                      {rule.isActive ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDialog(rule)}
                      className="flex items-center gap-1"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleDelete(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Rule' : 'Create New Rule'}</DialogTitle>
            <DialogDescription>Configure a moderation rule to filter or flag content</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rule Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Spam Pattern Detection"
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this rule detects..."
                className="mt-2"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Rule Type</label>
                <Select value={formData.ruleType} onValueChange={(value: any) => setFormData({ ...formData, ruleType: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keyword">Keyword</SelectItem>
                    <SelectItem value="pattern">Pattern</SelectItem>
                    <SelectItem value="user_behavior">User Behavior</SelectItem>
                    <SelectItem value="content_type">Content Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Action</label>
                <Select value={formData.action} onValueChange={(value: any) => setFormData({ ...formData, action: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flag">Flag</SelectItem>
                    <SelectItem value="hide">Hide</SelectItem>
                    <SelectItem value="remove">Remove</SelectItem>
                    <SelectItem value="escalate">Escalate</SelectItem>
                    <SelectItem value="ban">Ban</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Severity</label>
                <Select value={formData.severity} onValueChange={(value: any) => setFormData({ ...formData, severity: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Rule'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
