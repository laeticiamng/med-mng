import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X, Hash, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function PostEdit() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load post data (mock)
  useEffect(() => {
    // TODO: Fetch actual post data
    setContent('Incroyable! J\'ai réussi à maintenir ma série de 100 jours de méditation quotidienne. C\'est fou comme cette pratique a transformé ma vie. Je me sens plus calme, plus concentré et plus heureux. 🧘‍♀️✨');
    setTags(['meditation', 'wellness', '100days']);
  }, [postId]);

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

    // TODO: Implement actual post update
    await new Promise(resolve => setTimeout(resolve, 1000));

    navigate(ROUTE_PATHS.postDetail.replace(':postId', postId!));
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    // TODO: Implement actual post deletion
    await new Promise(resolve => setTimeout(resolve, 1000));

    navigate(ROUTE_PATHS.posts);
  };

  const characterCount = content.length;
  const maxCharacters = 2000;

  return (
    <>
      <Helmet>
        <title>Éditer le Post | Med-Mng</title>
        <meta name="description" content="Modifier votre post" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <Link to={ROUTE_PATHS.postDetail.replace(':postId', postId!)}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au Post
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Éditer le Post
            </h1>
            <p className="text-lg text-gray-600">
              Modifiez le contenu ou les tags de votre post
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Modifier le Post</CardTitle>
                <CardDescription>
                  Apportez vos modifications et enregistrez
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
                    placeholder="Contenu de votre post..."
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
                        placeholder="Ajouter un tag"
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

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(ROUTE_PATHS.postDetail.replace(':postId', postId!))}
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
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Enregistrer
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Delete Section */}
          <Card className="mt-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Zone Dangereuse</CardTitle>
              <CardDescription className="text-red-700">
                Cette action est irréversible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer le Post
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est définitive. Votre post sera supprimé de manière permanente
                      et ne pourra pas être récupéré.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Supprimer définitivement
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
