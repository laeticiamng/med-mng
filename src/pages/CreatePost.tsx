import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Image, Send, X, Hash } from 'lucide-react';
import { useState } from 'react';

export default function CreatePost() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput) && tags.length < 5) {
      setTags([...tags, tagInput.toLowerCase().replace(/\s+/g, '')]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement actual post creation
    await new Promise(resolve => setTimeout(resolve, 1000));

    navigate(ROUTE_PATHS.posts);
  };

  const characterCount = content.length;
  const maxCharacters = 2000;

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
                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Contenu *</Label>
                  <Textarea
                    id="content"
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Qu'avez-vous envie de partager aujourd'hui ?"
                    rows={10}
                    maxLength={maxCharacters}
                    className="resize-none"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      {characterCount}/{maxCharacters} caractères
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
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        placeholder="Ajouter un tag (ex: meditation)"
                        className="pl-9"
                        disabled={tags.length >= 5}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!tagInput || tags.length >= 5}
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
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Additional Options */}
                <div className="space-y-3">
                  <Label>Options supplémentaires</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" disabled>
                      <Image className="w-4 h-4 mr-2" />
                      Ajouter une image
                      <Badge variant="secondary" className="ml-2 text-xs">Bientôt</Badge>
                    </Button>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(ROUTE_PATHS.posts)}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={!content.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Publication...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Publier
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
  );
}
