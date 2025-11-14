import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useGlobalSearch, useLogSearch, useLogSearchResultClick } from '@/hooks/useSearch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTE_PATHS } from '@/config/routes'
import { Search, FileText, User, Users, Leaf, Clock } from 'lucide-react'

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [localQuery, setLocalQuery] = useState(query)
  const [historyId, setHistoryId] = useState<string>('')

  const { data: results = [], isLoading, error } = useGlobalSearch(query)
  const logSearch = useLogSearch()
  const logClick = useLogSearchResultClick()

  // Log the search
  useEffect(() => {
    if (query && results.length > 0) {
      logSearch.mutate({
        query,
        searchType: 'global',
        resultsCount: results.length,
      })
    }
  }, [query, results.length])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (localQuery.trim()) {
      setSearchParams({ q: localQuery.trim() })
    }
  }

  const handleResultClick = (resultId: string, resultType: string) => {
    if (historyId) {
      logClick.mutate({ searchHistoryId: historyId, resultId, resultType })
    }
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'user':
        return <User className="h-5 w-5 text-purple-500" />
      case 'team':
        return <Users className="h-5 w-5 text-orange-500" />
      case 'wellness':
        return <Leaf className="h-5 w-5 text-green-500" />
      default:
        return <Search className="h-5 w-5 text-gray-500" />
    }
  }

  const getRouteForType = (type: string, id: string) => {
    switch (type) {
      case 'post':
        return ROUTE_PATHS.postDetail.replace(':postId', id)
      case 'user':
        return ROUTE_PATHS.userProfile.replace(':userId', id)
      case 'team':
        return ROUTE_PATHS.teamDashboard.replace(':teamId', id)
      default:
        return '#'
    }
  }

  return (
    <>
      <Helmet>
        <title>Résultats de Recherche | Med-Mng</title>
        <meta name="description" content="Recherchez des posts, utilisateurs, équipes et plus" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Recherche</h1>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Rechercher des posts, utilisateurs, équipes..."
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" className="gap-2">
                  <Search className="h-4 w-4" />
                  Rechercher
                </Button>
              </div>
            </form>
          </div>

          {/* Results Section */}
          {!query ? (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Entrez votre requête de recherche pour commencer
                </p>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
              <CardContent className="py-8">
                <p className="text-red-600 dark:text-red-400">
                  Erreur lors de la recherche. Veuillez réessayer.
                </p>
              </CardContent>
            </Card>
          ) : results.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Aucun résultat trouvé pour "{query}"
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <p className="text-muted-foreground mb-6">
                {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
              </p>

              <div className="space-y-4">
                {results.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    to={getRouteForType(result.type, result.id)}
                    onClick={() => handleResultClick(result.id, result.type)}
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-1">
                            {getIconForType(result.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-1 truncate">
                              {result.title}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {result.content}
                            </p>

                            {/* Meta */}
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-muted">
                                {result.type === 'post'
                                  ? 'Post'
                                  : result.type === 'user'
                                    ? 'Utilisateur'
                                    : result.type === 'team'
                                      ? 'Équipe'
                                      : 'Bien-être'}
                              </span>

                              {result.relevance > 0 && (
                                <span>Pertinence: {Math.round(result.relevance * 100)}%</span>
                              )}

                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(result.createdAt).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="flex-shrink-0 text-muted-foreground">
                            →
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
