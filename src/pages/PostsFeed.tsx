import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/config/routes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  MessageCircle,
  Eye,
  Plus,
  Search,
  Loader,
  AlertCircle,
  TrendingUp,
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { usePosts } from '@/hooks/usePosts'
import { useAuth } from '@/contexts/AuthContext'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function PostsFeed() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { useFetchPublishedPosts, useFetchTrendingPosts } = usePosts()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'mostliked'>('recent')

  // Fetch posts
  const {
    data: posts = [],
    isLoading,
    error,
  } = useFetchPublishedPosts({
    tags: selectedTag ? [selectedTag] : undefined,
    sortBy,
    limit: 20,
  })

  const { data: trendingPosts = [] } = useFetchTrendingPosts(5)

  // Filter by search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts
    const query = searchQuery.toLowerCase()
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query)
    )
  }, [posts, searchQuery])

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    posts.forEach((post) => {
      post.tags.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags).slice(0, 10)
  }, [posts])

  return (
    <>
      <Helmet>
        <title>Feed Posts | Med-Mng</title>
        <meta name="description" content="Découvrez les posts de la communauté" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header with Create Button */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Posts Communauté
              </h1>
              <p className="text-lg text-gray-600">
                Découvrez et partagez avec la communauté
              </p>
            </div>
            {user && (
              <Link to={ROUTE_PATHS.createPost}>
                <Button size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un Post
                </Button>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search and Sort */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Rechercher des posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Sort */}
                  <div className="flex gap-2">
                    <Button
                      variant={sortBy === 'recent' ? 'default' : 'outline'}
                      onClick={() => setSortBy('recent')}
                      size="sm"
                    >
                      Récents
                    </Button>
                    <Button
                      variant={sortBy === 'popular' ? 'default' : 'outline'}
                      onClick={() => setSortBy('popular')}
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Populaires
                    </Button>
                    <Button
                      variant={sortBy === 'mostliked' ? 'default' : 'outline'}
                      onClick={() => setSortBy('mostliked')}
                      size="sm"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      Plus aimés
                    </Button>
                  </div>

                  {/* Tags */}
                  {selectedTag && (
                    <div className="flex items-center gap-2 text-sm">
                      <span>Filtré par:</span>
                      <Badge>
                        #{selectedTag}
                        <button
                          onClick={() => setSelectedTag(null)}
                          className="ml-2"
                        >
                          ×
                        </button>
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Error */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Erreur lors du chargement des posts
                  </AlertDescription>
                </Alert>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="flex justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              )}

              {/* Posts List */}
              {!isLoading && filteredPosts.length === 0 && (
                <Card>
                  <CardContent className="pt-12 text-center pb-12">
                    <p className="text-gray-600 mb-4">Aucun post trouvé</p>
                    {user && (
                      <Link to={ROUTE_PATHS.createPost}>
                        <Button>Créer le premier post</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )}

              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`${ROUTE_PATHS.posts}/${post.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">
                          {post.title}
                        </CardTitle>
                        <p className="text-gray-600 line-clamp-2">
                          {post.excerpt || post.content.substring(0, 160)}...
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer hover:bg-gray-400"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedTag(tag)
                            }}
                          >
                            #{tag}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge variant="outline">
                            +{post.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent>
                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.view_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comment_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.like_count}</span>
                      </div>
                      <div className="ml-auto text-xs">
                        {new Date(post.published_at || post.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trending Posts */}
              {trendingPosts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Tendances
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {trendingPosts.map((post) => (
                      <div
                        key={post.id}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => navigate(`${ROUTE_PATHS.posts}/${post.id}`)}
                      >
                        <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Heart className="w-3 h-3" />
                          <span>{post.like_count} likes</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Top Tags */}
              {allTags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tags populaires</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={selectedTag === tag ? 'default' : 'secondary'}
                          className="cursor-pointer"
                          onClick={() =>
                            setSelectedTag(selectedTag === tag ? null : tag)
                          }
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Info Card */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">À propos</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-700 space-y-2">
                  <p>
                    Bienvenue dans la communauté MED-MNG! Partagez vos
                    expériences et apprenez des autres.
                  </p>
                  <p>
                    Respectez la communauté et les règles de conduite.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
