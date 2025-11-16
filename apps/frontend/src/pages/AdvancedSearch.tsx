import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  useSearchPosts,
  useSearchUsers,
  useSearchTeams,
  useSearchWellness,
} from '@/hooks/useSearch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchFilters } from '@/services/search.service'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, FileText, User, Users, Leaf } from 'lucide-react'

export default function AdvancedSearch() {
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState<'global' | 'posts' | 'users' | 'teams' | 'wellness'>('posts')
  const [filters, setFilters] = useState<SearchFilters>({
    limit: 50,
    offset: 0,
  })
  const [hasSearched, setHasSearched] = useState(false)

  // Search hooks
  const postsResult = useSearchPosts(query && searchType === 'posts' ? query : '', filters)
  const usersResult = useSearchUsers(query && searchType === 'users' ? query : '', filters.limit)
  const teamsResult = useSearchTeams(query && searchType === 'teams' ? query : '', filters.limit)
  const wellnessResult = useSearchWellness(
    query && searchType === 'wellness' ? query : '',
    filters.limit
  )

  const getResults = () => {
    switch (searchType) {
      case 'posts':
        return postsResult
      case 'users':
        return usersResult
      case 'teams':
        return teamsResult
      case 'wellness':
        return wellnessResult
      default:
        return postsResult
    }
  }

  const currentResult = getResults()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setHasSearched(true)
    }
  }

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setFilters({
        ...filters,
        startDate: value ? new Date(value) : undefined,
      })
    } else {
      setFilters({
        ...filters,
        endDate: value ? new Date(value) : undefined,
      })
    }
  }

  const handleCategoryChange = (value: string) => {
    setFilters({
      ...filters,
      category: value || undefined,
    })
  }

  const clearFilters = () => {
    setFilters({ limit: 50, offset: 0 })
    setQuery('')
    setHasSearched(false)
  }

  return (
    <>
      <Helmet>
        <title>Recherche Avancée | Med-Mng</title>
        <meta name="description" content="Recherche avancée avec filtres par catégorie, date et type de contenu" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Recherche Avancée</h1>
            <p className="text-muted-foreground">
              Utilisez les filtres pour affiner vos résultats de recherche
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Panel */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg">Filtres</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Search Type */}
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Type de Contenu</Label>
                    <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="posts">Posts</SelectItem>
                        <SelectItem value="users">Utilisateurs</SelectItem>
                        <SelectItem value="teams">Équipes</SelectItem>
                        <SelectItem value="wellness">Bien-être</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category Filter (for posts) */}
                  {searchType === 'posts' && (
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Catégorie</Label>
                      <Select value={filters.category || ''} onValueChange={handleCategoryChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes les catégories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Toutes les catégories</SelectItem>
                          <SelectItem value="wellness">Bien-être</SelectItem>
                          <SelectItem value="learning">Apprentissage</SelectItem>
                          <SelectItem value="productivity">Productivité</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                          <SelectItem value="news">Actualités</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Date Range (for posts) */}
                  {searchType === 'posts' && (
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Période</Label>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">À partir de</label>
                        <Input
                          type="date"
                          value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
                          onChange={(e) => handleDateChange('start', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Jusqu'à</label>
                        <Input
                          type="date"
                          value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
                          onChange={(e) => handleDateChange('end', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Clear Filters */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={clearFilters}
                  >
                    Réinitialiser Filtres
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Search Results */}
            <div className="lg:col-span-3">
              {/* Search Form */}
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <form onSubmit={handleSearch}>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Entrez votre requête de recherche..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" className="gap-2">
                        <Search className="h-4 w-4" />
                        Rechercher
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Results */}
              {!hasSearched && !query ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Commencez votre recherche en utilisant la barre ci-dessus
                    </p>
                  </CardContent>
                </Card>
              ) : currentResult.isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 rounded-lg" />
                  ))}
                </div>
              ) : currentResult.error ? (
                <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
                  <CardContent className="py-8">
                    <p className="text-red-600 dark:text-red-400">
                      Erreur lors de la recherche. Veuillez réessayer.
                    </p>
                  </CardContent>
                </Card>
              ) : currentResult.data && currentResult.data.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    {currentResult.data.length} résultat{currentResult.data.length > 1 ? 's' : ''} trouvé{currentResult.data.length > 1 ? 's' : ''}
                  </p>

                  {currentResult.data.map((result: any) => (
                    <Card key={result.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className="flex-shrink-0">
                            {searchType === 'posts' && <FileText className="h-5 w-5 text-blue-500" />}
                            {searchType === 'users' && <User className="h-5 w-5 text-purple-500" />}
                            {searchType === 'teams' && <Users className="h-5 w-5 text-orange-500" />}
                            {searchType === 'wellness' && <Leaf className="h-5 w-5 text-green-500" />}
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">
                              {result.title || result.username || result.activity_type}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {result.content || result.bio || result.description || ''}
                            </p>

                            {/* Meta */}
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              {result.category && (
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-muted">
                                  {result.category}
                                </span>
                              )}
                              {result.comment_count !== undefined && (
                                <span>{result.comment_count} commentaires</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Aucun résultat trouvé pour votre recherche
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
