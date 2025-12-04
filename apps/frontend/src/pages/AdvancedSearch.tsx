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
import { type ServiceSearchFilters } from '@shared/services/search.service'
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
  const [filters, setFilters] = useState<ServiceSearchFilters>({
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
          <header className="mb-8" role="banner">
            <h1 className="text-4xl font-bold mb-2" id="search-title">
              Recherche Avancée
            </h1>
            <p className="text-muted-foreground" id="search-description">
              Utilisez les filtres pour affiner vos résultats de recherche
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Panel */}
            <aside className="lg:col-span-1" role="complementary" aria-labelledby="filters-title">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg" id="filters-title">
                    Filtres
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Search Type */}
                  <div>
                    <Label htmlFor="search-type" className="text-sm font-semibold mb-2 block">
                      Type de Contenu
                    </Label>
                    <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                      <SelectTrigger id="search-type" aria-label="Sélectionner le type de contenu à rechercher">
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
                      <Label htmlFor="category-filter" className="text-sm font-semibold mb-2 block">
                        Catégorie
                      </Label>
                      <Select value={filters.category || ''} onValueChange={handleCategoryChange}>
                        <SelectTrigger id="category-filter" aria-label="Filtrer par catégorie">
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
                    <div className="space-y-3" role="group" aria-labelledby="date-range-label">
                      <Label id="date-range-label" className="text-sm font-semibold">
                        Période
                      </Label>
                      <div>
                        <label htmlFor="start-date" className="text-xs text-muted-foreground mb-1 block">
                          À partir de
                        </label>
                        <Input
                          id="start-date"
                          type="date"
                          value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
                          onChange={(e) => handleDateChange('start', e.target.value)}
                          aria-label="Date de début pour filtrer les résultats"
                        />
                      </div>
                      <div>
                        <label htmlFor="end-date" className="text-xs text-muted-foreground mb-1 block">
                          Jusqu'à
                        </label>
                        <Input
                          id="end-date"
                          type="date"
                          value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
                          onChange={(e) => handleDateChange('end', e.target.value)}
                          aria-label="Date de fin pour filtrer les résultats"
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
                    aria-label="Réinitialiser tous les filtres de recherche"
                  >
                    Réinitialiser Filtres
                  </Button>
                </CardContent>
              </Card>
            </aside>

            {/* Search Results */}
            <main className="lg:col-span-3" role="main" aria-labelledby="search-title">
              {/* Search Form */}
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <form onSubmit={handleSearch} role="search" aria-label="Formulaire de recherche avancée">
                    <div className="flex gap-2">
                      <label htmlFor="search-input" className="sr-only">
                        Requête de recherche
                      </label>
                      <Input
                        id="search-input"
                        type="text"
                        placeholder="Entrez votre requête de recherche..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1"
                        aria-label="Entrez votre requête de recherche"
                        aria-describedby="search-description"
                      />
                      <Button type="submit" className="gap-2" aria-label="Lancer la recherche">
                        <Search className="h-4 w-4" aria-hidden="true" />
                        Rechercher
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Results */}
              {!hasSearched && !query ? (
                <Card role="status" aria-live="polite">
                  <CardContent className="text-center py-12">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
                    <p className="text-muted-foreground">
                      Commencez votre recherche en utilisant la barre ci-dessus
                    </p>
                  </CardContent>
                </Card>
              ) : currentResult.isLoading ? (
                <div
                  className="space-y-4"
                  role="status"
                  aria-live="polite"
                  aria-label="Chargement des résultats de recherche"
                >
                  <span className="sr-only">Chargement des résultats en cours...</span>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 rounded-lg" aria-hidden="true" />
                  ))}
                </div>
              ) : currentResult.error ? (
                <Card
                  className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950"
                  role="alert"
                  aria-live="assertive"
                >
                  <CardContent className="py-8">
                    <p className="text-red-600 dark:text-red-400">
                      Erreur lors de la recherche. Veuillez réessayer.
                    </p>
                  </CardContent>
                </Card>
              ) : currentResult.data && currentResult.data.length > 0 ? (
                <section
                  role="region"
                  aria-labelledby="results-heading"
                  aria-live="polite"
                  aria-atomic="false"
                >
                  <p
                    id="results-heading"
                    className="text-sm text-muted-foreground mb-4"
                    role="status"
                    aria-label={`${currentResult.data.length} résultat${currentResult.data.length > 1 ? 's' : ''} trouvé${currentResult.data.length > 1 ? 's' : ''}`}
                  >
                    {currentResult.data.length} résultat{currentResult.data.length > 1 ? 's' : ''} trouvé{currentResult.data.length > 1 ? 's' : ''}
                  </p>

                  <div className="space-y-4" role="list" aria-label="Résultats de recherche">
                    {currentResult.data.map((result: any) => (
                      <Card
                        key={result.id}
                        className="hover:shadow-md transition-shadow"
                        role="listitem"
                        aria-labelledby={`result-title-${result.id}`}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className="flex-shrink-0" aria-hidden="true">
                              {searchType === 'posts' && <FileText className="h-5 w-5 text-blue-500" />}
                              {searchType === 'users' && <User className="h-5 w-5 text-purple-500" />}
                              {searchType === 'teams' && <Users className="h-5 w-5 text-orange-500" />}
                              {searchType === 'wellness' && <Leaf className="h-5 w-5 text-green-500" />}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <h3
                                id={`result-title-${result.id}`}
                                className="font-semibold text-lg mb-1"
                              >
                                {result.title || result.username || result.activity_type}
                              </h3>
                              <p className="text-muted-foreground text-sm line-clamp-2">
                                {result.content || result.bio || result.description || ''}
                              </p>

                              {/* Meta */}
                              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                {result.category && (
                                  <span
                                    className="inline-block px-2.5 py-0.5 rounded-full bg-muted"
                                    aria-label={`Catégorie: ${result.category}`}
                                  >
                                    {result.category}
                                  </span>
                                )}
                                {result.comment_count !== undefined && (
                                  <span aria-label={`${result.comment_count} commentaires`}>
                                    {result.comment_count} commentaires
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              ) : (
                <Card role="status" aria-live="polite">
                  <CardContent className="text-center py-12">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
                    <p className="text-muted-foreground">
                      Aucun résultat trouvé pour votre recherche
                    </p>
                  </CardContent>
                </Card>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  )
}
