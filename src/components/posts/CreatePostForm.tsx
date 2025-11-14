import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Image, Loader, X } from 'lucide-react'
import { useCreatePost } from '@/hooks/usePosts'
import { PostCategory } from '@/services/posts.service'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface CreatePostFormProps {
  onSuccess?: () => void
}

export function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const { user } = useAuth()
  const createPost = useCreatePost()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    category: 'lifestyle' as PostCategory,
    tags: [] as string[],
    tagInput: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddTag = () => {
    const tag = formData.tagInput.trim().toLowerCase()
    if (tag && formData.tags.length < 5 && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
        tagInput: '',
      }))
    }
  }

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Le titre est requis')
      return
    }

    if (!formData.content.trim()) {
      toast.error('Le contenu est requis')
      return
    }

    createPost.mutate(
      {
        title: formData.title,
        content: formData.content,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,
      },
      {
        onSuccess: () => {
          toast.success('Post créé avec succès!')
          setFormData({
            title: '',
            content: '',
            description: '',
            category: 'lifestyle',
            tags: [],
            tagInput: '',
          })
          onSuccess?.()
        },
        onError: () => {
          toast.error('Erreur lors de la création du post')
        },
      }
    )
  }

  if (!user) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer un post</CardTitle>
        <CardDescription>Partagez vos pensées et expériences avec la communauté</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header with user avatar */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">Créer un post public</p>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Titre *
            </label>
            <Input
              id="title"
              name="title"
              placeholder="Donnez un titre à votre post..."
              value={formData.title}
              onChange={handleInputChange}
              maxLength={200}
              data-testid="post-title-input"
            />
            <p className="text-xs text-muted-foreground">
              {formData.title.length}/200 caractères
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Résumé (optionnel)
            </label>
            <Input
              id="description"
              name="description"
              placeholder="Ajoutez un court résumé..."
              value={formData.description}
              onChange={handleInputChange}
              maxLength={500}
              data-testid="post-description-input"
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/500 caractères
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Contenu *
            </label>
            <Textarea
              id="content"
              name="content"
              placeholder="Écrivez votre contenu ici..."
              value={formData.content}
              onChange={handleInputChange}
              maxLength={5000}
              rows={6}
              data-testid="post-content-input"
            />
            <p className="text-xs text-muted-foreground">
              {formData.content.length}/5000 caractères
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Catégorie</label>
            <Select value={formData.category} onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                category: value as PostCategory,
              }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lifestyle">Mode de vie</SelectItem>
                <SelectItem value="learning">Apprentissage</SelectItem>
                <SelectItem value="wellness">Bien-être</SelectItem>
                <SelectItem value="achievement">Réussite</SelectItem>
                <SelectItem value="question">Question</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium">
              Tags (max 5)
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Ajoutez un tag..."
                value={formData.tagInput}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tagInput: e.target.value,
                  }))
                }
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                maxLength={20}
                data-testid="post-tag-input"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!formData.tagInput.trim()}
              >
                Ajouter
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="ml-1 hover:opacity-70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Image Upload (Placeholder) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Image (Bientôt disponible)</label>
            <Button variant="outline" type="button" disabled className="w-full">
              <Image className="h-4 w-4 mr-2" />
              Ajouter une image
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={createPost.isPending}
              data-testid="create-post-button"
            >
              {createPost.isPending ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                'Publier le post'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFormData({
                  title: '',
                  content: '',
                  description: '',
                  category: 'lifestyle',
                  tags: [],
                  tagInput: '',
                })
              }
            >
              Réinitialiser
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
