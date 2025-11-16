import { Helmet } from 'react-helmet-async'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ROUTE_PATHS } from '@/config/routes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  FolderPlus,
  Trash2,
  Search,
  Loader,
  AlertCircle,
  Edit2,
  Plus,
  X,
  ChevronRight,
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useCollections } from '@/hooks/useCollections'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-red-100 text-red-700',
  'bg-green-100 text-green-700',
  'bg-yellow-100 text-yellow-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
]

export default function Collections() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [collectionToDelete, setCollectionToDelete] = useState<{id: string; name: string} | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: COLORS[0],
  })

  const { useFetchCollections, useCreateCollection, useUpdateCollection, useDeleteCollection } =
    useCollections()

  // Fetch collections
  const { data: collections = [], isLoading, error } = useFetchCollections(user?.id)
  const createMutation = useCreateCollection()
  const updateMutation = useUpdateCollection()
  const deleteMutation = useDeleteCollection()

  // Filter collections
  const filteredCollections = useMemo(() => {
    if (!searchQuery) return collections
    const query = searchQuery.toLowerCase()
    return collections.filter(
      (coll) =>
        coll.name?.toLowerCase().includes(query) ||
        coll.description?.toLowerCase().includes(query)
    )
  }, [collections, searchQuery])

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom de la collection est requis',
        variant: 'destructive',
      })
      return
    }

    if (!user?.id) return

    try {
      await createMutation.mutateAsync({
        userId: user.id,
        name: formData.name,
        description: formData.description,
        color: formData.color,
      })

      toast({
        title: 'Collection créée',
        description: 'Votre nouvelle collection a été créée avec succès',
      })

      setFormData({ name: '', description: '', color: COLORS[0] })
      setIsCreating(false)
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la création de la collection',
        variant: 'destructive',
      })
    }
  }

  const confirmDeleteCollection = async () => {
    if (!collectionToDelete || !user?.id) return

    try {
      await deleteMutation.mutateAsync({
        collectionId: collectionToDelete.id,
        userId: user.id,
      })

      toast({
        title: 'Collection supprimée',
        description: `"${collectionToDelete.name}" a été supprimée avec succès`,
      })
      setCollectionToDelete(null)
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression de la collection',
        variant: 'destructive',
      })
      setCollectionToDelete(null)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentification requise</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Vous devez être connecté pour accéder à vos collections.
            </p>
            <Link to={ROUTE_PATHS.medMngLogin}>
              <Button className="w-full">Se connecter</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Mes Collections | Med-Mng</title>
        <meta name="description" content="Organisez vos contenus favoris en collections personnalisées" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Mes Collections</h1>
              <p className="text-lg text-gray-600">
                Organisez vos contenus favoris en collections personnalisées
              </p>
            </div>

            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nouvelle Collection
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle collection</DialogTitle>
                  <DialogDescription>
                    Donnez un nom et une description à votre collection
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateCollection} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Nom de la collection *
                    </label>
                    <Input
                      id="name"
                      placeholder="ex: Cardiologie"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={createMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Description
                    </label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez le contenu de cette collection..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      disabled={createMutation.isPending}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Couleur</label>
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Sélection de couleur">
                      {COLORS.map((color, index) => {
                        const colorNames = ['Bleu', 'Rouge', 'Vert', 'Jaune', 'Violet', 'Rose'];
                        return (
                          <button
                            key={color}
                            type="button"
                            className={`px-3 py-2 rounded-lg border-2 transition-all ${
                              formData.color === color ? 'border-gray-900' : 'border-transparent'
                            } ${color}`}
                            onClick={() => setFormData({ ...formData, color })}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setFormData({ ...formData, color });
                              }
                            }}
                            role="radio"
                            aria-checked={formData.color === color}
                            aria-label={`Couleur ${colorNames[index]}`}
                            tabIndex={0}
                          >
                            ●
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreating(false)}
                      disabled={createMutation.isPending}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || !formData.name.trim()}
                      className="flex-1"
                    >
                      {createMutation.isPending ? (
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Créer
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher une collection..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  aria-label="Rechercher une collection"
                />
              </div>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <Alert variant="destructive" className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Erreur lors du chargement des collections</AlertDescription>
            </Alert>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && collections.length === 0 && (
            <Card>
              <CardContent className="pt-12 text-center pb-12">
                <FolderPlus className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-4">Vous n'avez pas encore créé de collections</p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une collection
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Collections Grid */}
          {!isLoading && filteredCollections.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCollections.map((collection) => (
                <Card key={collection.id} className="hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div className={`p-3 rounded-lg ${collection.metadata?.color || COLORS[0]}`}>
                        <FolderPlus className="w-6 h-6" />
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-blue-600"
                          onClick={() => navigate(`${ROUTE_PATHS.collections}/${collection.id}`)}
                          aria-label="Éditer la collection"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-red-600"
                          onClick={() => setCollectionToDelete({ id: collection.id, name: collection.name })}
                          disabled={deleteMutation.isPending}
                          aria-label="Supprimer la collection"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 text-lg">{collection.name}</h3>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4">
                    {collection.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{collection.description}</p>
                    )}

                    <div className="text-sm text-gray-500">
                      {collection.metadata?.itemCount || 0} éléments
                    </div>
                  </CardContent>

                  <div className="px-6 pb-6">
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => navigate(`${ROUTE_PATHS.collections}/${collection.id}`)}
                    >
                      Ouvrir
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && searchQuery && filteredCollections.length === 0 && (
            <Card>
              <CardContent className="pt-12 text-center pb-12">
                <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">Aucune collection ne correspond à votre recherche</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!collectionToDelete} onOpenChange={() => setCollectionToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer la collection</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer "{collectionToDelete?.name}" ? Cette action est irréversible et tous les items de la collection seront perdus.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCollectionToDelete(null)}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteCollection}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
