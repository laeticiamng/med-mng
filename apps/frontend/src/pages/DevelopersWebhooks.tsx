import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  useGetWebhooks,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
  useTestWebhook,
  useGetWebhookStats,
  useGetWebhookEvents,
} from '@/hooks/useWebhooks'
import { AVAILABLE_EVENTS } from '@/services/webhooks.service'
import { ROUTE_PATHS } from '@/config/routes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ArrowLeft,
  Webhook,
  Plus,
  CheckCircle2,
  XCircle,
  Play,
  Trash2,
  Edit,
  Activity,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'

export default function DevelopersWebhooks() {
  const { user } = useAuth()
  const { data: webhooks = [], isLoading } = useGetWebhooks(user?.id || '')
  const createWebhookMutation = useCreateWebhook(user?.id || '')
  const updateWebhookMutation = useUpdateWebhook(user?.id || '')
  const deleteWebhookMutation = useDeleteWebhook(user?.id || '')
  const testWebhookMutation = useTestWebhook(user?.id || '')

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEventsDialog, setShowEventsDialog] = useState(false)
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState({
    name: '',
    url: '',
    events: [] as string[],
    description: '',
  })

  const handleCreateWebhook = async () => {
    if (!createForm.name.trim() || !createForm.url.trim()) {
      toast.error('Le nom et l\'URL sont requis')
      return
    }

    if (createForm.events.length === 0) {
      toast.error('Sélectionnez au moins un événement')
      return
    }

    // Validate URL
    try {
      new URL(createForm.url)
    } catch {
      toast.error('URL invalide')
      return
    }

    try {
      await createWebhookMutation.mutateAsync({
        name: createForm.name,
        url: createForm.url,
        events: createForm.events,
        description: createForm.description || undefined,
      })

      toast.success('Webhook créé avec succès')
      setShowCreateDialog(false)
      setCreateForm({ name: '', url: '', events: [], description: '' })
    } catch (error) {
      console.error('Error creating webhook:', error)
      toast.error('Erreur lors de la création du webhook')
    }
  }

  const handleToggleEvent = (eventValue: string) => {
    setCreateForm(prev => ({
      ...prev,
      events: prev.events.includes(eventValue)
        ? prev.events.filter(e => e !== eventValue)
        : [...prev.events, eventValue],
    }))
  }

  const handleTestWebhook = async (webhookId: string, webhookName: string) => {
    toast.loading('Envoi du test...')

    try {
      const result = await testWebhookMutation.mutateAsync(webhookId)

      if (result.success) {
        toast.success(`Test réussi pour "${webhookName}"`, {
          description: result.message,
        })
      } else {
        toast.error(`Test échoué pour "${webhookName}"`, {
          description: result.message,
        })
      }
    } catch (error) {
      console.error('Test webhook error:', error)
      toast.error('Erreur lors du test')
    }
  }

  const handleDeleteWebhook = async (webhookId: string, webhookName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le webhook "${webhookName}" ?`)) {
      return
    }

    try {
      await deleteWebhookMutation.mutateAsync(webhookId)
      toast.success('Webhook supprimé')
    } catch (error) {
      console.error('Delete webhook error:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleToggleActive = async (webhookId: string, currentStatus: boolean) => {
    try {
      await updateWebhookMutation.mutateAsync({
        webhookId,
        updates: { is_active: !currentStatus },
      })

      toast.success(currentStatus ? 'Webhook désactivé' : 'Webhook activé')
    } catch (error) {
      console.error('Toggle webhook error:', error)
      toast.error('Erreur lors de la modification')
    }
  }

  const showWebhookEvents = (webhookId: string) => {
    setSelectedWebhookId(webhookId)
    setShowEventsDialog(true)
  }

  if (!user) {
    return (
      <>
        <Helmet><title>Connexion requise | Webhooks</title></Helmet>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Connexion requise</CardTitle>
              <CardDescription>Vous devez être connecté pour gérer les webhooks</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = ROUTE_PATHS.login} className="w-full">
                Se connecter
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>Webhooks | Développeurs</title>
        <meta name="description" content="Recevez des événements en temps réel via webhooks" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <Link to={ROUTE_PATHS.developers}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Webhooks</h1>
              <p className="text-lg text-gray-600">Recevez des événements en temps réel</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} disabled={createWebhookMutation.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Webhook
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Webhooks List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Loading State */}
              {isLoading && (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-full" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && webhooks.length === 0 && (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <Webhook className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Aucun webhook
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Créez votre premier webhook pour recevoir des événements en temps réel
                    </p>
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Créer un webhook
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Webhooks */}
              {!isLoading && webhooks.length > 0 && webhooks.map((webhook) => (
                <WebhookCard
                  key={webhook.id}
                  webhook={webhook}
                  onTest={() => handleTestWebhook(webhook.id, webhook.name)}
                  onToggleActive={() => handleToggleActive(webhook.id, webhook.is_active)}
                  onDelete={() => handleDeleteWebhook(webhook.id, webhook.name)}
                  onViewEvents={() => showWebhookEvents(webhook.id)}
                />
              ))}
            </div>

            {/* Sidebar - Available Events */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Événements Disponibles
                  </CardTitle>
                  <CardDescription>
                    Types d'événements que vous pouvez recevoir
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                      {AVAILABLE_EVENTS.map((event) => (
                        <div key={event.value} className="pb-3 border-b last:border-0">
                          <div className="font-medium text-sm text-gray-900 mb-1">
                            {event.label}
                          </div>
                          <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {event.value}
                          </code>
                          <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Create Webhook Dialog */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouveau webhook</DialogTitle>
                <DialogDescription>
                  Configurez un endpoint pour recevoir des événements
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nom <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ex: Production Webhook, Slack Notifications..."
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">
                    URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://your-app.com/webhooks/medmng"
                    value={createForm.url}
                    onChange={(e) => setCreateForm({ ...createForm, url: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">
                    Les événements seront envoyés en POST à cette URL
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>
                    Événements <span className="text-destructive">*</span>
                  </Label>
                  <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                    <div className="space-y-3">
                      {AVAILABLE_EVENTS.map((event) => (
                        <div key={event.value} className="flex items-start gap-3">
                          <Checkbox
                            id={event.value}
                            checked={createForm.events.includes(event.value)}
                            onCheckedChange={() => handleToggleEvent(event.value)}
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={event.value}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {event.label}
                            </Label>
                            <p className="text-xs text-gray-500">{event.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {createForm.events.length} événement(s) sélectionné(s)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Textarea
                    id="description"
                    placeholder="Description de l'utilisation de ce webhook..."
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateWebhook} disabled={createWebhookMutation.isPending}>
                  {createWebhookMutation.isPending ? 'Création...' : 'Créer le webhook'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Webhook Events Dialog */}
          {selectedWebhookId && (
            <WebhookEventsDialog
              webhookId={selectedWebhookId}
              open={showEventsDialog}
              onClose={() => {
                setShowEventsDialog(false)
                setSelectedWebhookId(null)
              }}
            />
          )}
        </div>
      </div>
    </>
  )
}

// Webhook Card Component
interface WebhookCardProps {
  webhook: any
  onTest: () => void
  onToggleActive: () => void
  onDelete: () => void
  onViewEvents: () => void
}

function WebhookCard({ webhook, onTest, onToggleActive, onDelete, onViewEvents }: WebhookCardProps) {
  const { data: stats } = useGetWebhookStats(webhook.id)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Webhook className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{webhook.name}</CardTitle>
              {webhook.description && (
                <p className="text-sm text-gray-500 mt-1">{webhook.description}</p>
              )}
              <code className="text-xs text-gray-600 truncate block mt-1">{webhook.url}</code>
            </div>
          </div>
          <Badge variant={webhook.is_active ? 'default' : 'secondary'}>
            {webhook.is_active ? 'Actif' : 'Inactif'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Events */}
        <div>
          <div className="text-sm text-gray-600 mb-2">Événements ({webhook.events.length}):</div>
          <div className="flex flex-wrap gap-2">
            {webhook.events.slice(0, 3).map((event: string) => (
              <Badge key={event} variant="outline" className="text-xs">
                {event}
              </Badge>
            ))}
            {webhook.events.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{webhook.events.length - 3} autres
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-semibold">{stats.total_events}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                Réussis
              </p>
              <p className="text-lg font-semibold text-green-600">{stats.successful_events}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <XCircle className="w-3 h-3 text-red-600" />
                Échoués
              </p>
              <p className="text-lg font-semibold text-red-600">{stats.failed_events}</p>
            </div>
          </div>
        )}

        {/* Last triggered */}
        {webhook.last_triggered_at && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            Dernière utilisation: {new Date(webhook.last_triggered_at).toLocaleDateString('fr-FR')}
          </div>
        )}

        {/* Warning if failing */}
        {webhook.failure_count > 5 && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            <AlertCircle className="w-4 h-4" />
            {webhook.failure_count} échecs consécutifs
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={onTest}>
            <Play className="w-4 h-4 mr-2" />
            Tester
          </Button>
          <Button variant="outline" size="sm" onClick={onViewEvents}>
            <Activity className="w-4 h-4 mr-2" />
            Logs
          </Button>
          <Button variant="outline" size="sm" onClick={onToggleActive}>
            {webhook.is_active ? 'Désactiver' : 'Activer'}
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Webhook Events Dialog Component
interface WebhookEventsDialogProps {
  webhookId: string
  open: boolean
  onClose: () => void
}

function WebhookEventsDialog({ webhookId, open, onClose }: WebhookEventsDialogProps) {
  const { data: events = [], isLoading } = useGetWebhookEvents(webhookId)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Historique des événements</DialogTitle>
          <DialogDescription>
            Derniers événements envoyés à ce webhook
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px]">
          {isLoading && <div className="text-center py-8">Chargement...</div>}

          {!isLoading && events.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun événement encore</p>
            </div>
          )}

          {!isLoading && events.length > 0 && (
            <div className="space-y-3">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge variant="outline" className="mb-1">
                          {event.event_type}
                        </Badge>
                        <p className="text-xs text-gray-500">
                          {new Date(event.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      <Badge
                        variant={event.status === 'success' ? 'default' : 'destructive'}
                      >
                        {event.status}
                      </Badge>
                    </div>

                    {event.response_status_code && (
                      <p className="text-sm text-gray-600 mb-2">
                        Code HTTP: {event.response_status_code}
                      </p>
                    )}

                    {event.error_message && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                        {event.error_message}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
