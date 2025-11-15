import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ROUTE_PATHS } from '@/config/routes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Send, X, Hash, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useFetchPost, useUpdatePost } from '@/hooks/usePosts'
import { useAuth } from '@/hooks/useAuth'

export default function PostEdit() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { data: post, isLoading } = useFetchPost(postId || '')
  const updateMutation = useUpdatePost(postId || '')

  // Populate form with post data
  useEffect(() => {
    if (post) {
      if (post.user_id !== user?.id) {
        setError('Vous n\'avez pas la permission de modifier ce post')
        return
      }
      setTitle(post.title)
      setContent(post.content)
      setExcerpt(post.excerpt || '')
      setTags(post.tags)
    }
  }, [post, user])

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput) && tags.length < 5) {
      setTags([...tags, tagInput.toLowerCase().replace(/\s+/g, '')])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!title.trim()) {
      setError('Le titre est requis')
      return
    }
    if (!content.trim()) {
      setError('Le contenu est requis')
      return
    }

    try {
      await updateMutation.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || content.substring(0, 160),
        tags,
      })

      setSuccess(true)
      setTimeout(() => {
        navigate(`${ROUTE_PATHS.posts}/${postId}`)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
    }
  }

  const characterCount = content.length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error && !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Link to={ROUTE_PATHS.posts}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Éditer Post | Med-Mng</title>
        <meta name="description" content="Modifiez votre post" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <Link to={ROUTE_PATHS.posts}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Éditer le Post
            </h1>
          </div>

          {/* Alerts */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Post mis à jour avec succès! Redirection...
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Modifier le Post</CardTitle>
                <CardDescription>
                  Mettez à jour votre contenu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={updateMutation.isPending}
                    maxLength={200}
                  />
                  <div className="text-sm text-gray-500">
                    {title.length}/200 caractères
                  </div>
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Résumé (optionnel)</Label>
                  <Input
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    disabled={updateMutation.isPending}
                    maxLength={160}
                  />
                  <div className="text-sm text-gray-500">
                    {excerpt.length}/160 caractères
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Contenu *</Label>
                  <Textarea
                    id="content"
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    maxLength={2000}
                    className="resize-none"
                    disabled={updateMutation.isPending}
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      {characterCount}/2000 caractères
                    </span>
                    {characterCount > 2000 * 0.9 && (
                      <span className="text-orange-600 font-medium">
                        Limite bientôt atteinte
                      </span>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (max 5)</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddTag()
                          }
                        }}
                        placeholder="Ajouter un tag"
                        className="pl-9"
                        disabled={tags.length >= 5 || updateMutation.isPending}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!tagInput || tags.length >= 5 || updateMutation.isPending}
                      variant="outline"
                    >
                      Ajouter
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="pl-3 pr-1 py-1">
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 hover:bg-gray-300 rounded-full p-0.5"
                            disabled={updateMutation.isPending}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`${ROUTE_PATHS.posts}/${postId}`)}
                    disabled={updateMutation.isPending}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={!title.trim() || !content.trim() || updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Mettre à jour
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </>
  )
}
