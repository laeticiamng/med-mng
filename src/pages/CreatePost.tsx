import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/config/routes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Send, X, Hash, AlertCircle, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { usePosts } from '@/hooks/usePosts'
import { useAuth } from '@/contexts/AuthContext'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function CreatePost() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { useCreatePost } = usePosts()
  const createPostMutation = useCreatePost()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [saveAsDraft, setSaveAsDraft] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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

    // Validation
    if (!title.trim()) {
      setError('Le titre est requis')
      return
    }
    if (!content.trim()) {
      setError('Le contenu est requis')
      return
    }
    if (content.length < 50) {
      setError('Le contenu doit contenir au moins 50 caractères')
      return
    }

    try {
      await createPostMutation.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || content.substring(0, 160),
        tags,
        status: saveAsDraft ? 'draft' : 'published',
      })

      setSuccess(true)
      setTimeout(() => {
        navigate(ROUTE_PATHS.posts)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du post')
    }
  }

  const characterCount = content.length
  const maxCharacters = 2000
  const minCharacters = 50

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentification requise</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Vous devez être connecté pour créer un post.
            </p>
            <Link to={ROUTE_PATHS.login}>
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
        <title>Créer un Post | Med-Mng</title>
        <meta name="description" content="Partagez vos pensées avec la communauté" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <Link to={ROUTE_PATHS.posts}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux Posts
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Créer un Post
            </h1>
            <p className="text-lg text-gray-600">
              Partagez vos expériences, conseils ou réflexions avec la communauté
            </p>
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
                Post créé avec succès! Redirection en cours...
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Nouveau Post</CardTitle>
                <CardDescription>
                  Écrivez quelque chose d'inspirant ou de motivant
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
                    placeholder="Donnez un titre accrocheur à votre post"
                    disabled={createPostMutation.isPending}
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
                    placeholder="Un court résumé de votre post (sinon auto-généré)"
                    disabled={createPostMutation.isPending}
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
                    placeholder="Qu'avez-vous envie de partager aujourd'hui ? (minimum 50 caractères)"
                    rows={12}
                    maxLength={maxCharacters}
                    className="resize-none"
                    disabled={createPostMutation.isPending}
                  />
                  <div className="flex justify-between text-sm">
                    <span className={characterCount < minCharacters ? 'text-red-600 font-medium' : 'text-gray-500'}>
                      {characterCount}/{maxCharacters} caractères
                      {characterCount < minCharacters && ` (${minCharacters - characterCount} manquants)`}
                    </span>
                    {characterCount > maxCharacters * 0.9 && (
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
                        placeholder="Ajouter un tag (ex: meditation)"
                        className="pl-9"
                        disabled={tags.length >= 5 || createPostMutation.isPending}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!tagInput || tags.length >= 5 || createPostMutation.isPending}
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
                            disabled={createPostMutation.isPending}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save Options */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="saveDraft"
                      checked={saveAsDraft}
                      onChange={(e) => setSaveAsDraft(e.target.checked)}
                      disabled={createPostMutation.isPending}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="saveDraft" className="font-normal cursor-pointer">
                      Sauvegarder comme brouillon (au lieu de publier)
                    </Label>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(ROUTE_PATHS.posts)}
                    disabled={createPostMutation.isPending}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={
                      !title.trim() ||
                      !content.trim() ||
                      characterCount < minCharacters ||
                      createPostMutation.isPending
                    }
                  >
                    {createPostMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {saveAsDraft ? 'Sauvegarde...' : 'Publication...'}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {saveAsDraft ? 'Sauvegarder' : 'Publier'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Tips Card */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Conseils pour un bon post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              <p>• Soyez authentique et partagez votre expérience personnelle</p>
              <p>• Utilisez des tags pertinents pour toucher la bonne audience</p>
              <p>• Restez positif et encourageant</p>
              <p>• Structurez votre contenu pour une lecture facile</p>
              <p>• Respectez la communauté et les règles de conduite</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
