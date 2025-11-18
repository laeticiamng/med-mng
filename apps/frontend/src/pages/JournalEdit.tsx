import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';

export default function JournalEdit() {
  const { entryId } = useParams<{ entryId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const { data: entry, isLoading } = useQuery({
    queryKey: ['journal-entry', entryId],
    queryFn: async () => {
      if (!entryId) throw new Error('Entry ID is required');

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', entryId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!entryId
  });

  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '');
      setContent(entry.content || '');
      setTags(entry.tags || '');
    }
  }, [entry]);

  const updateEntryMutation = useMutation({
    mutationFn: async () => {
      if (!entryId) throw new Error('Entry ID is required');

      // Sanitize content before saving to database
      const sanitizedContent = DOMPurify.sanitize(content.trim(), {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'blockquote'],
        ALLOWED_ATTR: []
      });

      const sanitizedTitle = DOMPurify.sanitize(title.trim() || 'Sans titre', {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
      });

      const { data, error } = await supabase
        .from('journal_entries')
        .update({
          title: sanitizedTitle,
          content: sanitizedContent,
          tags: tags.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', entryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['journal-entry', entryId] });
      toast({
        title: "Entrée mise à jour",
        description: "Vos modifications ont été enregistrées",
      });
      navigate(`${ROUTE_PATHS.journal}/${entryId}`);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'entrée: " + error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({
        title: "Contenu requis",
        description: "Veuillez saisir du contenu pour votre entrée",
        variant: "destructive",
      });
      return;
    }
    updateEntryMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Entrée introuvable</p>
            <Link to={ROUTE_PATHS.journal}>
              <Button variant="outline" className="mt-4">
                Retour au journal
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Modifier {entry.title || 'Entrée'} | Journal | Med-Mng</title>
        <meta name="description" content="Modifier une entrée de journal" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link to={`${ROUTE_PATHS.journal}/${entryId}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'entrée
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Modifier l'Entrée</h1>
          <p className="text-muted-foreground">
            Modifiez votre entrée de journal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Détails de l'Entrée</CardTitle>
              <CardDescription>
                Modifiez les informations de votre entrée
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  placeholder="Ex: Révision Anatomie Cardio"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="Ex: anatomie, révision, cardiologie"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Contenu *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={15}
                  className="resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-4">
                <Link to={`${ROUTE_PATHS.journal}/${entryId}`}>
                  <Button variant="outline" type="button">
                    Annuler
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={updateEntryMutation.isPending || !content.trim()}
                >
                  {updateEntryMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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
      </div>
    </>
  );
}
