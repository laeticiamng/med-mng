import { useState } from 'react'
import { ROUTE_PATHS } from '@/config/routes'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CreatePostForm } from '@/components/posts/CreatePostForm'
import { PostCard } from '@/components/posts/PostCard'
import { useFetchFeedPosts, useFetchPostsByCategory } from '@/hooks/usePosts'
import { useAuth } from '@/hooks/useAuth'
import { PostCategory } from '@shared/services/posts.service'
import { Link } from 'react-router-dom'

export default function Posts() {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | 'all'>('all')
  const [page, setPage] = useState(0)
  const pageSize = 10

  const { data: feedPosts = [], isLoading: feedLoading } = useFetchFeedPosts(pageSize, page * pageSize)
  const { data: categoryPosts = [], isLoading: categoryLoading } = useFetchPostsByCategory(
    selectedCategory as PostCategory,
    pageSize,
    page * pageSize
  )

  const posts = selectedCategory === 'all' ? feedPosts : categoryPosts
  const isLoading = selectedCategory === 'all' ? feedLoading : categoryLoading

  const categories: { value: PostCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'Tous les posts' },
    { value: 'lifestyle', label: 'Mode de vie' },
    { value: 'learning', label: 'Apprentissage' },
    { value: 'wellness', label: 'Bien-être' },
    { value: 'achievement', label: 'Réussite' },
    { value: 'question', label: 'Questions' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Communauté</h1>
          <p className="text-muted-foreground mt-2">
            Découvrez et partagez du contenu inspirant avec la communauté
          </p>
        </div>

        {/* Create Post Section (only for authenticated users) */}
        {user && (
          <div className="mb-8">
            <CreatePostForm onSuccess={() => setPage(0)} />
          </div>
        )}

        {/* Category Filter */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Filtrer par catégorie:</label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value as PostCategory | 'all')
                  setPage(0)
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeletons
            <>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-96 w-full rounded-lg" />
              ))}
            </>
          ) : posts.length > 0 ? (
            <>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} showActions={true} />
              ))}

              {/* Pagination */}
              <div className="flex items-center justify-center gap-3 pt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Précédent
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page + 1}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={posts.length < pageSize}
                >
                  Suivant
                </Button>
              </div>
            </>
          ) : (
            // Empty state
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center max-w-md">
                <div className="mb-4 text-5xl">📝</div>
                <h3 className="text-lg font-semibold mb-2">Aucun post pour le moment</h3>
                <p className="text-muted-foreground mb-6">
                  Soyez le premier à partager un post dans cette catégorie!
                </p>
                {user ? (
                  <Button onClick={() => setSelectedCategory('all')}>
                    Voir tous les posts
                  </Button>
                ) : (
                  <Link to={ROUTE_PATHS.medMngLogin}>
                    <Button>Se connecter pour partager</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">💡 Conseils de partage</h3>
              <p className="text-sm text-muted-foreground">
                Partagez des expériences authentiques, posez des questions et engagez la conversation
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">🤝 Communauté respectueuse</h3>
              <p className="text-sm text-muted-foreground">
                Notre communauté valorise le respect, l'entraide et la bienveillance
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
