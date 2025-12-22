import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Heart, Loader2, CheckCircle, FolderPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { withAuth } from '@/components/med-mng/withAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { ItemAudioPlayer } from '@/components/med-mng/items/ItemAudioPlayer';
import { ROUTE_PATHS } from '@/config/routes';
import {
  fetchItemDetail,
  fetchItemsWithMeta,
  toggleFavoriteItem,
  upsertItemProgress,
} from '@/services/medMngItemsService';
import type { ItemStatus } from '@/types/medMngItems';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const MedMngItemDetailComponent = () => {
  const { itemCode } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [status, setStatus] = useState<ItemStatus>('not_started');
  const [revisionCount, setRevisionCount] = useState(0);
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [selectedAudioIndex, setSelectedAudioIndex] = useState(0);
  const trackingRef = useRef<string | null>(null);

  const { data: item, isLoading, isError } = useQuery({
    queryKey: ['med-mng-item-detail', itemCode, user?.id],
    queryFn: () => fetchItemDetail(itemCode ?? '', user?.id),
    enabled: Boolean(itemCode),
  });

  const { data: libraryItems } = useQuery({
    queryKey: ['med-mng-item-codes', user?.id],
    queryFn: () => fetchItemsWithMeta(user?.id),
    enabled: Boolean(user?.id),
  });

  useEffect(() => {
    if (!item) {
      return;
    }
    setIsFavorite(item.isFavorite);
    setStatus(item.status);
    setRevisionCount(item.revisionCount);
    setLastSeenAt(item.lastSeenAt);
    setScore(item.score);
    const requestedRang = searchParams.get('rang');
    const requestedIndex = item.audios.findIndex(audio => audio.rang === requestedRang);
    setSelectedAudioIndex(requestedIndex >= 0 ? requestedIndex : 0);
    // Reset tracking ref when item changes to allow progress updates on revisited items
    trackingRef.current = null;
  }, [item, searchParams]);

  useEffect(() => {
    if (!item || !user) {
      return;
    }

    if (trackingRef.current === item.id) {
      return;
    }

    trackingRef.current = item.id;

    const nextStatus = item.status === 'not_started' ? 'in_progress' : item.status;

    upsertItemProgress({
      userId: user.id,
      itemId: item.id,
      status: nextStatus,
      lastSeenAt: new Date().toISOString(),
      revisionCount: item.revisionCount,
      score: item.score,
    }).catch(error => {
      console.error('Failed to update progress', error);
    });
  }, [item, user]);

  const selectedAudio = useMemo(
    () => (item?.audios.length ? item.audios[selectedAudioIndex] : null),
    [item, selectedAudioIndex]
  );

  const orderedCodes = useMemo(() => {
    return (libraryItems ?? []).map(entry => entry.code);
  }, [libraryItems]);

  const currentIndex = useMemo(() => {
    if (!item) {
      return -1;
    }
    return orderedCodes.indexOf(item.code);
  }, [orderedCodes, item]);

  const handleToggleFavorite = async () => {
    if (!user || !item) {
      return;
    }

    try {
      const nextFavorite = await toggleFavoriteItem({
        userId: user.id,
        itemId: item.id,
        isFavorite,
      });
      setIsFavorite(nextFavorite);
      toast({
        title: nextFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris',
        description: nextFavorite
          ? 'Cet item est enregistré dans vos favoris.'
          : 'Cet item a été retiré de vos favoris.',
      });
    } catch (error) {
      console.error('Failed to toggle favorite', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour les favoris.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkReviewed = async () => {
    if (!user || !item) {
      return;
    }

    const now = new Date();
    const nextStatus: ItemStatus =
      status === 'not_started' ? 'in_progress' : status === 'in_progress' ? 'revised' : 'in_progress';
    const nextRevisionCount = nextStatus === 'revised' ? revisionCount + 1 : revisionCount;
    const nextScore = nextStatus === 'revised' ? 100 : score;

    try {
      await upsertItemProgress({
        userId: user.id,
        itemId: item.id,
        status: nextStatus,
        lastSeenAt: now.toISOString(),
        revisionCount: nextRevisionCount,
        score: nextScore,
      });
      setStatus(nextStatus);
      setLastSeenAt(now.toISOString());
      setRevisionCount(nextRevisionCount);
      setScore(nextScore);
      toast({
        title: 'Statut mis à jour',
        description:
          nextStatus === 'revised'
            ? 'Item marqué comme révisé.'
            : nextStatus === 'in_progress'
            ? 'Item en cours de révision.'
            : 'Item remis à réviser.',
      });
    } catch (error) {
      console.error('Failed to mark reviewed', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la progression.',
        variant: 'destructive',
      });
    }
  };

  return (
    <MedMngLayout className="bg-gradient-to-br from-primary/5 to-accent/10">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour à la bibliothèque
        </Button>

        {isLoading && (
          <Card>
            <CardContent className="p-8 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Chargement de la fiche...
            </CardContent>
          </Card>
        )}

        {isError && (
          <Card>
            <CardContent className="p-8 text-center space-y-2">
              <h2 className="text-lg font-semibold">Impossible de charger la fiche</h2>
              <p className="text-muted-foreground">
                Vérifiez votre connexion ou réessayez plus tard.
              </p>
            </CardContent>
          </Card>
        )}

        {item && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="outline">{item.code}</Badge>
                      <Badge variant="secondary">{item.itemType}</Badge>
                      {item.rang && <Badge variant="outline">Rang {item.rang}</Badge>}
                      {status === 'revised' && (
                        <Badge variant="outline">Révisé</Badge>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">{item.title}</h1>
                    <p className="text-muted-foreground">
                      {item.specialty ?? 'Spécialité non précisée'}
                    </p>
                  </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={handleToggleFavorite} className="gap-2">
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-destructive' : ''}`} />
                    {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`${ROUTE_PATHS.medMngPlaylists}?item=${item.code}`)}
                    className="gap-2"
                  >
                    <FolderPlus className="h-4 w-4" />
                    Ajouter à playlist
                  </Button>
                  <Button onClick={handleMarkReviewed} className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {status === 'not_started'
                      ? 'Démarrer'
                      : status === 'in_progress'
                      ? 'Marquer révisé'
                      : 'Revenir en cours'}
                  </Button>
                </div>
              </div>

                <div className="flex flex-wrap gap-2">
                  {item.tags.length === 0 ? (
                    <Badge variant="secondary">Sans tag</Badge>
                  ) : (
                    item.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-lg font-semibold">Fiche de synthèse</h2>
                  <Accordion type="multiple" className="space-y-2">
                    {(item.notes.length > 0 ? item.notes : [{
                      id: 'empty',
                      title: 'Résumé',
                      content: 'Aucune fiche disponible pour cet item.',
                      contentType: 'text',
                      rang: null,
                    }]).map(note => (
                      <AccordionItem key={note.id} value={note.id} className="border rounded-lg">
                        <AccordionTrigger className="px-4">
                          {note.title}
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          {renderFicheContent(note.content)}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {selectedAudio ? (
                  <div className="sticky bottom-4">
                    <ItemAudioPlayer
                      audios={item.audios}
                      selectedIndex={selectedAudioIndex}
                      onSelect={setSelectedAudioIndex}
                    />
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      Aucun audio disponible pour cet item.
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Progression</p>
                    <p className="text-2xl font-bold text-primary">{revisionCount} révision(s)</p>
                    <p className="text-xs text-muted-foreground">
                      Dernière ouverture :{' '}
                      {lastSeenAt
                        ? new Date(lastSeenAt).toLocaleDateString('fr-FR')
                        : 'Jamais'}
                    </p>
                  </CardContent>
                </Card>

                {currentIndex >= 0 && (
                  <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                      <Button
                        variant="outline"
                        onClick={() =>
                          navigate(
                            ROUTE_PATHS.medMngItemDetail.replace(
                              ':itemCode',
                              orderedCodes[currentIndex - 1]
                            )
                          )
                        }
                        disabled={currentIndex <= 0}
                        className="gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Précédent
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          navigate(
                            ROUTE_PATHS.medMngItemDetail.replace(
                              ':itemCode',
                              orderedCodes[currentIndex + 1]
                            )
                          )
                        }
                        disabled={currentIndex === orderedCodes.length - 1}
                        className="gap-2"
                      >
                        Suivant
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MedMngLayout>
  );
};

export const MedMngItemDetail = withAuth(MedMngItemDetailComponent);

const renderFicheContent = (content: unknown) => {
  if (typeof content === 'string') {
    return <p className="text-sm text-foreground whitespace-pre-line">{content}</p>;
  }

  if (content && typeof content === 'object' && 'headers' in content && 'rows' in content) {
    const tableContent = content as { headers: string[]; rows: string[][]; notes?: string };

    return (
      <div className="space-y-3">
        <Table>
          <TableHeader className="hidden sm:table-header-group sticky top-0 bg-background">
            <TableRow>
              {tableContent.headers.map(header => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableContent.rows.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hidden sm:table-row">
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex} className="text-sm">
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="space-y-3 sm:hidden">
          {tableContent.rows.map((row, rowIndex) => (
            <div key={rowIndex} className="rounded-lg border p-3 space-y-2">
              {row.map((cell, cellIndex) => (
                <div key={cellIndex} className="flex items-start justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {tableContent.headers[cellIndex]}
                  </span>
                  <span className="text-sm text-foreground text-right">{cell}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {tableContent.notes && (
          <p className="text-xs text-muted-foreground">{tableContent.notes}</p>
        )}
      </div>
    );
  }

  return <pre className="text-xs text-muted-foreground">{JSON.stringify(content, null, 2)}</pre>;
};
