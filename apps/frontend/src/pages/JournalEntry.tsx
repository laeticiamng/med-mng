import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { ArrowLeft, Edit, Trash2, Calendar, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import DOMPurify from 'dompurify';

export default function JournalEntry() {
  const { entryId } = useParams<{ entryId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const deleteEntryMutation = useMutation({
    mutationFn: async () => {
      if (!entryId) throw new Error('Entry ID is required');

      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      toast({
        title: "Entrée supprimée",
        description: "L'entrée a été supprimée avec succès",
      });
      navigate(ROUTE_PATHS.journal);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'entrée: " + error.message,
        variant: "destructive",
      });
    }
  });

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
        <title>{entry.title || 'Entrée'} | Journal | Med-Mng</title>
        <meta name="description" content={entry.content?.substring(0, 160)} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link to={ROUTE_PATHS.journal}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au journal
            </Button>
          </Link>
        </div>

        {/* Entry Content */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{entry.title || 'Sans titre'}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(entry.created_at).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {entry.updated_at !== entry.created_at && (
                    <span className="text-xs">
                      (Modifié le {new Date(entry.updated_at).toLocaleDateString('fr-FR')})
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`${ROUTE_PATHS.journal}/${entryId}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4 mr-2 text-destructive" />
                      Supprimer
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer cette entrée ? Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteEntryMutation.mutate()}>
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {entry.tags && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                {entry.tags.split(',').map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div
                className="text-base whitespace-pre-wrap leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(entry.content || '', {
                    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'blockquote'],
                    ALLOWED_ATTR: []
                  })
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
