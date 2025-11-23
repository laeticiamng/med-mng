import logger from '@/lib/logger';
import React, { useState } from 'react'
import { useFetchModerationTeams, useCreateModerationTeam } from '@/hooks/useModeration'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Users } from 'lucide-react'
import { toast } from 'sonner'

export default function ModerationTeamsManager() {
  const { data: teams = [], isLoading } = useFetchModerationTeams()
  const createMutation = useCreateModerationTeam()

  const [showDialog, setShowDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    expertise: [] as string[],
  })

  const handleCreateTeam = async () => {
    if (!formData.name.trim()) {
      toast.error('Team name is required')
      return
    }

    try {
      await createMutation.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        expertise: formData.expertise,
      })
      toast.success('Team created')
      setFormData({ name: '', description: '', expertise: [] })
      setShowDialog(false)
    } catch (error) {
      toast.error('Failed to create team')
      logger.error(error)
    }
  }

  const toggleExpertise = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise.includes(area)
        ? prev.expertise.filter((e) => e !== area)
        : [...prev.expertise, area],
    }))
  }

  const expertiseAreas = ['violence', 'harassment', 'spam', 'misinformation', 'sexual_content', 'other']

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading teams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Moderation Teams</h3>
        <Button onClick={() => setShowDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Team
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No moderation teams created yet</p>
              <Button onClick={() => setShowDialog(true)} variant="outline">
                Create First Team
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">{team.name}</h4>
                    {team.description && <p className="text-sm text-gray-600 mt-1">{team.description}</p>}
                  </div>

                  {team.expertise && team.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {team.expertise.map((area) => (
                        <Badge key={area} variant="secondary">
                          {area.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
                    <span>Max Queue: {team.maxQueueSize}</span>
                    <span>Auto-escalate: {team.autoEscalateAfterHours}h</span>
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
            <DialogTitle>Create Moderation Team</DialogTitle>
            <DialogDescription>Set up a new team to manage content moderation</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Team Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Community Moderation Team"
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the team's responsibilities..."
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Expertise Areas</label>
              <div className="space-y-2">
                {expertiseAreas.map((area) => (
                  <label key={area} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.expertise.includes(area)}
                      onChange={() => toggleExpertise(area)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm">{area.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTeam} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Team'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
