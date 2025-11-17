import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  useGetApiKeys,
  useCreateApiKey,
  useRegenerateApiKey,
  useDeleteApiKey,
  useGetApiKeyStats,
} from '@/hooks/useApiKeys'
import { ROUTE_PATHS } from '@/config/routes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'

export default function DevelopersKeys() {
  const { user } = useAuth()
  const { data: apiKeys = [], isLoading } = useGetApiKeys(user?.id || '')
  const createKeyMutation = useCreateApiKey(user?.id || '')
  const regenerateKeyMutation = useRegenerateApiKey(user?.id || '')
  const deleteKeyMutation = useDeleteApiKey(user?.id || '')

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showKeyDialog, setShowKeyDialog] = useState(false)
  const [newKeyData, setNewKeyData] = useState<{ fullKey: string; name: string } | null>(null)
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
  })

  const handleCreateKey = async () => {
    if (!createForm.name.trim()) {
      toast.error('Le nom est requis')
      return
    }

    try {
      const result = await createKeyMutation.mutateAsync({
        name: createForm.name,
        description: createForm.description || undefined,
      })

      // Show the full key once
      setNewKeyData({
        fullKey: result.fullKey,
        name: result.apiKey.name,
      })
      setShowKeyDialog(true)
      setShowCreateDialog(false)
      setCreateForm({ name: '', description: '' })

      toast.success('Clé API créée avec succès')
    } catch (error) {
      console.error('Error creating API key:', error)
      toast.error('Erreur lors de la création de la clé')
    }
  }

  const handleRegenerateKey = async (keyId: string, keyName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir régénérer la clé "${keyName}" ? L'ancienne clé ne fonctionnera plus.`)) {
      return
    }

    try {
      const result = await regenerateKeyMutation.mutateAsync(keyId)

      setNewKeyData({
        fullKey: result.fullKey,
        name: result.apiKey.name,
      })
      setShowKeyDialog(true)

      toast.success('Clé régénérée avec succès')
    } catch (error) {
      console.error('Error regenerating API key:', error)
      toast.error('Erreur lors de la régénération de la clé')
    }
  }

  const handleDeleteKey = async (keyId: string, keyName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la clé "${keyName}" ? Cette action est irréversible.`)) {
      return
    }

    try {
      await deleteKeyMutation.mutateAsync(keyId)
      toast.success('Clé supprimée avec succès')
    } catch (error) {
      console.error('Error deleting API key:', error)
      toast.error('Erreur lors de la suppression de la clé')
    }
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success('Clé copiée dans le presse-papiers')
  }

  if (!user) {
    return (
      <>
        <Helmet><title>Connexion requise | Développeurs</title></Helmet>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Connexion requise</CardTitle>
              <CardDescription>Vous devez être connecté pour gérer vos clés API</CardDescription>
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
        <title>Clés API | Développeurs</title>
        <meta name="description" content="Gérez vos clés d'accès à l'API Med-Mng" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Header */}
          <Link to={ROUTE_PATHS.developers}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Clés API</h1>
              <p className="text-lg text-gray-600">Gérez vos clés d'accès à l'API</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} disabled={createKeyMutation.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Clé
            </Button>
          </div>

          {/* Security Warning */}
          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-900 font-medium">Sécurité importante</p>
                <p className="text-yellow-800 text-sm mt-1">
                  Ne partagez jamais vos clés API. Elles donnent un accès complet à votre compte.
                  Stockez-les en sécurité et ne les commitez jamais dans votre code source.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-10 w-full mb-4" />
                    <Skeleton className="h-4 w-64" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && apiKeys.length === 0 && (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Key className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune clé API
                </h3>
                <p className="text-gray-500 mb-6">
                  Créez votre première clé API pour commencer à utiliser l'API Med-Mng
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une clé
                </Button>
              </CardContent>
            </Card>
          )}

          {/* API Keys List */}
          {!isLoading && apiKeys.length > 0 && (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <ApiKeyCard
                  key={apiKey.id}
                  apiKey={apiKey}
                  showKey={showKeys[apiKey.id] || false}
                  onToggleShow={() => setShowKeys({ ...showKeys, [apiKey.id]: !showKeys[apiKey.id] })}
                  onCopy={() => handleCopyKey(apiKey.key_prefix)}
                  onRegenerate={() => handleRegenerateKey(apiKey.id, apiKey.name)}
                  onDelete={() => handleDeleteKey(apiKey.id, apiKey.name)}
                />
              ))}
            </div>
          )}

          {/* Create Key Dialog */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle clé API</DialogTitle>
                <DialogDescription>
                  Créez une clé pour accéder à l'API Med-Mng
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nom de la clé <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ex: Production API, Application Mobile..."
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Textarea
                    id="description"
                    placeholder="Description de l'utilisation de cette clé..."
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
                <Button onClick={handleCreateKey} disabled={createKeyMutation.isPending}>
                  {createKeyMutation.isPending ? 'Création...' : 'Créer la clé'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Show New Key Dialog */}
          <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Clé créée avec succès
                </DialogTitle>
                <DialogDescription>
                  Copiez cette clé maintenant. Elle ne sera plus affichée.
                </DialogDescription>
              </DialogHeader>

              {newKeyData && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
                    <code className="text-sm font-mono break-all select-all">
                      {newKeyData.fullKey}
                    </code>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCopyKey(newKeyData.fullKey)}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copier la clé
                    </Button>
                  </div>

                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-900">
                      <strong>Important :</strong> Stockez cette clé en sécurité. Vous ne pourrez
                      plus la voir après avoir fermé cette fenêtre.
                    </p>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button onClick={() => {
                  setShowKeyDialog(false)
                  setNewKeyData(null)
                }}>
                  J'ai copié la clé
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  )
}

// API Key Card Component
interface ApiKeyCardProps {
  apiKey: any
  showKey: boolean
  onToggleShow: () => void
  onCopy: () => void
  onRegenerate: () => void
  onDelete: () => void
}

function ApiKeyCard({ apiKey, showKey, onToggleShow, onCopy, onRegenerate, onDelete }: ApiKeyCardProps) {
  const { data: stats } = useGetApiKeyStats(apiKey.id)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle className="text-lg">{apiKey.name}</CardTitle>
              {apiKey.description && (
                <p className="text-sm text-gray-500 mt-1">{apiKey.description}</p>
              )}
              <div className="text-sm text-gray-500 mt-1">
                Créée le {new Date(apiKey.created_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
          <Badge variant={apiKey.is_active ? 'default' : 'secondary'}>
            {apiKey.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* API Key Display */}
        <div className="flex items-center gap-3">
          <code className="flex-1 px-4 py-2 bg-gray-100 rounded font-mono text-sm overflow-hidden">
            {showKey ? apiKey.key_prefix : '••••••••••••••••••••••••'}
          </code>
          <Button variant="outline" size="sm" onClick={onToggleShow}>
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={onCopy}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500">Requêtes totales</p>
              <p className="text-lg font-semibold">{stats.total_requests.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Aujourd'hui</p>
              <p className="text-lg font-semibold flex items-center gap-1">
                {stats.requests_today.toLocaleString()}
                <TrendingUp className="w-3 h-3 text-green-600" />
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Temps moyen</p>
              <p className="text-lg font-semibold">{stats.avg_response_time}ms</p>
            </div>
          </div>
        )}

        {/* Last Used */}
        {apiKey.last_used_at && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Dernière utilisation: {new Date(apiKey.last_used_at).toLocaleDateString('fr-FR')}
            </span>
            <span>Limite: {apiKey.rate_limit} req/min</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={onRegenerate}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Régénérer
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
