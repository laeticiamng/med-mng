import { useState } from 'react'
import { Search, HelpCircle, Book, MessageSquare, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '@/config/routes'
import { useFetchFeaturedArticles, useSearchArticles } from '@/hooks/useHelp'

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)

  const { data: featuredArticles = [], isLoading: featuredLoading } = useFetchFeaturedArticles(6)
  const { data: searchResults = [], isLoading: searchLoading } = useSearchArticles(
    searchQuery,
    showSearchResults && searchQuery.length > 2
  )

  const categories = [
    {
      title: 'Premiers pas',
      description: 'Commencez votre parcours',
      icon: Zap,
      color: 'bg-blue-50 dark:bg-blue-950',
      path: '#getting-started',
    },
    {
      title: 'Fonctionnalités',
      description: 'Explorez toutes nos fonctionnalités',
      icon: Book,
      color: 'bg-green-50 dark:bg-green-950',
      path: '#features',
    },
    {
      title: 'Questions fréquentes',
      description: 'Trouvez les réponses rapides',
      icon: HelpCircle,
      color: 'bg-purple-50 dark:bg-purple-950',
      path: ROUTE_PATHS.helpFaq,
    },
    {
      title: 'Support',
      description: 'Contactez notre équipe',
      icon: MessageSquare,
      color: 'bg-orange-50 dark:bg-orange-950',
      path: ROUTE_PATHS.helpContact,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Centre d'aide</h1>
          <p className="text-xl text-muted-foreground">
            Trouvez les réponses à vos questions et explorez notre documentation
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-12">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Cherchez des articles, tutoriels, FAQs..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (e.target.value.length > 2) {
                    setShowSearchResults(true)
                  }
                }}
                className="pl-10 h-12 text-base"
                data-testid="help-search-input"
              />
            </div>
            {searchQuery.length > 0 && searchQuery.length <= 2 && (
              <p className="text-xs text-muted-foreground mt-2">
                Tapez au moins 3 caractères pour rechercher
              </p>
            )}
          </CardContent>
        </Card>

        {/* Search Results */}
        {showSearchResults && searchQuery.length > 2 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              Résultats pour "{searchQuery}"
            </h2>
            {searchLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid gap-4">
                {searchResults.map((article) => (
                  <Card
                    key={article.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                      {article.description && (
                        <p className="text-muted-foreground mb-3">{article.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{article.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {article.views_count} vues
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Aucun résultat trouvé</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    setShowSearchResults(false)
                  }}
                >
                  Effacer la recherche
                </Button>
              </div>
            )}
          </div>
        )}

        {!showSearchResults && (
          <>
            {/* Quick Links */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Parcourir par catégorie</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <Link key={category.title} to={category.path}>
                      <Card className={`${category.color} hover:shadow-lg transition-shadow cursor-pointer h-full`}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <Icon className="h-8 w-8 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{category.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {category.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Featured Articles */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Articles populaires</h2>
                <Link to={ROUTE_PATHS.helpTutorials}>
                  <Button variant="outline">Voir tout</Button>
                </Link>
              </div>

              {featuredLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-40 w-full rounded-lg" />
                  ))}
                </div>
              ) : featuredArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featuredArticles.map((article) => (
                    <Card
                      key={article.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-base flex-1">
                            {article.title}
                          </h3>
                          {article.is_pinned && (
                            <Badge variant="secondary" className="ml-2">
                              Pin
                            </Badge>
                          )}
                        </div>
                        {article.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {article.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{article.category}</Badge>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>👍 {article.helpful_count}</span>
                            <span>👁️ {article.views_count}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucun article en ce moment</p>
                </div>
              )}
            </div>

            {/* Info Section */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-2">Besoin d'aide supplémentaire?</h3>
                <p className="text-muted-foreground mb-4">
                  Notre équipe de support est disponible pour répondre à vos questions.
                </p>
                <div className="flex gap-3">
                  <Link to={ROUTE_PATHS.helpContact}>
                    <Button>Nous contacter</Button>
                  </Link>
                  <Link to={ROUTE_PATHS.helpSearch}>
                    <Button variant="outline">Recherche avancée</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
