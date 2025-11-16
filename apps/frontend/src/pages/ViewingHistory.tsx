import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/config/routes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Heart,
  Clock,
  Eye,
  Trash2,
  Search,
  Loader,
  AlertCircle,
  TrendingUp,
  Calendar,
  Filter,
  BarChart3,
  BookOpen,
} from 'lucide-react'
import { useState, useMemo, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useViewingHistory } from '@/hooks/useViewingHistory'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ViewType = 'all' | 'fiche' | 'post' | 'collection'

export default function ViewingHistory() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<ViewType>('all')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const { useFetchHistory, useFetchViewingStats, useClearHistory } = useViewingHistory()

  // Fetch viewing history and stats
  const { data: history = [], isLoading, error } = useFetchHistory(user?.id)
  const { data: stats } = useFetchViewingStats(user?.id)
  const clearHistoryMutation = useClearHistory()

  // Filter history
  const filteredHistory = useMemo(() => {
    let filtered = history

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((item) => item.item_type === filterType)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.item_name?.toLowerCase().includes(query) ||
          item.metadata?.description?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [history, filterType, searchQuery])

  const confirmClearHistory = useCallback(async () => {
    if (!user?.id) return

    try {
      await clearHistoryMutation.mutateAsync(user.id)

      toast({
        title: 'Historique supprimé',
        description: 'Votre historique de visionnage a été complètement effacé',
      })
      setShowClearConfirm(false)
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression',
        variant: 'destructive',
      })
      setShowClearConfirm(false)
    }
  }, [user, clearHistoryMutation, toast])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fiche':
        return <BookOpen className="w-4 h-4" />
      case 'post':
        return <Eye className="w-4 h-4" />
      case 'collection':
        return <Heart className="w-4 h-4" />
      default:
        return <Eye className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fiche':
        return 'bg-blue-100 text-blue-700'
      case 'post':
        return 'bg-purple-100 text-purple-700'
      case 'collection':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
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
              Vous devez être connecté pour accéder à votre historique de visionnage.
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
        <title>Historique de Visionnage | Med-Mng</title>
        <meta name="description" content="Consultez votre historique de visionnage et vos statistiques" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Historique de Visionnage</h1>
              <p className="text-lg text-gray-600">
                Consultez tous les contenus que vous avez visionnés
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Search and Filter */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Rechercher dans l'historique..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                      aria-label="Rechercher dans l'historique"
                    />
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={filterType === 'all' ? 'default' : 'outline'}
                      onClick={() => setFilterType('all')}
                      size="sm"
                      className="gap-2"
                    >
                      <Filter className="w-4 h-4" />
                      Tous ({history.length})
                    </Button>
                    <Button
                      variant={filterType === 'fiche' ? 'default' : 'outline'}
                      onClick={() => setFilterType('fiche')}
                      size="sm"
                    >
                      <BookOpen className="w-4 h-4 mr-1" />
                      Fiches ({history.filter((h) => h.item_type === 'fiche').length})
                    </Button>
                    <Button
                      variant={filterType === 'post' ? 'default' : 'outline'}
                      onClick={() => setFilterType('post')}
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Posts ({history.filter((h) => h.item_type === 'post').length})
                    </Button>
                    <Button
                      variant={filterType === 'collection' ? 'default' : 'outline'}
                      onClick={() => setFilterType('collection')}
                      size="sm"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      Collections ({history.filter((h) => h.item_type === 'collection').length})
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Error */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Erreur lors du chargement de l'historique</AlertDescription>
                </Alert>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0 space-y-3">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-6 w-20 rounded-full" />
                              <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-1/3" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && filteredHistory.length === 0 && !error && (
                <Card>
                  <CardContent className="pt-12 text-center pb-12">
                    <Clock className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 mb-4">
                      {history.length === 0
                        ? 'Vous n\'avez pas encore visité de contenus'
                        : 'Aucun contenu ne correspond à votre recherche'}
                    </p>
                    {history.length === 0 && (
                      <Link to={ROUTE_PATHS.posts}>
                        <Button>Explorer les posts</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* History List */}
              {!isLoading && filteredHistory.length > 0 && (
                <div className="space-y-4">
                  {filteredHistory.map((item) => (
                    <Card
                      key={`${item.item_type}-${item.item_id}`}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className={`gap-1 ${getTypeColor(item.item_type)}`}>
                                {getTypeIcon(item.item_type)}
                                {item.item_type}
                              </Badge>
                              {item.view_source && (
                                <Badge variant="outline" className="text-xs">
                                  {item.view_source}
                                </Badge>
                              )}
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                              {item.item_name}
                            </h3>

                            {item.metadata?.description && (
                              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                {item.metadata.description}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  {new Date(item.created_at).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Statistics Card */}
              {stats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Statistiques
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total visionnages</span>
                        <span className="font-semibold">{stats.total_views || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Éléments uniques</span>
                        <span className="font-semibold">{stats.unique_items || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Visionnages aujourd'hui</span>
                        <span className="font-semibold">{stats.today_views || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Cette semaine</span>
                        <span className="font-semibold">{stats.week_views || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setShowClearConfirm(true)}
                    disabled={clearHistoryMutation.isPending || history.length === 0}
                    aria-label="Effacer tout l'historique"
                  >
                    <Trash2 className="w-4 h-4" />
                    Effacer l'historique
                  </Button>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">À propos</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-700 space-y-2">
                  <p>Votre historique de visionnage vous aide à garder trace de ce que vous avez consulté.</p>
                  <p>Vous pouvez effacer votre historique à tout moment depuis cette page.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Clear History Confirmation Dialog */}
          <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Effacer l'historique</DialogTitle>
                <DialogDescription>
                  Êtes-vous sûr de vouloir effacer tout votre historique de visionnage ? Cette action est irréversible.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmClearHistory}
                  disabled={clearHistoryMutation.isPending}
                >
                  {clearHistoryMutation.isPending ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Effacer
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  )
}
