import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Heart, Loader2, CheckCircle, FolderPlus, ChevronLeft, ChevronRight, Headphones } from 'lucide-react';
import { ContextualAITutor } from '@/components/ai/ContextualAITutor';
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
    <MedMngLayout className="bg-background">
      <div className="container mx-auto px-4 py-6 space-y-5 max-w-4xl">
        {/* Navigation retour */}
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>

        {/* Loading */}
        {isLoading && (
          <Card className="border-border/30">
            <CardContent className="p-8 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Un instant…</span>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {isError && (
          <Card className="border-border/30">
            <CardContent className="p-8 text-center space-y-2">
              <h2 className="text-lg font-medium">Quelque chose n'a pas fonctionné</h2>
              <p className="text-sm text-muted-foreground">
                Tu peux réessayer tranquillement.
              </p>
            </CardContent>
          </Card>
        )}

        {item && (
          <div className="space-y-5">
            {/* Header de l'item - Simplifié */}
            <div className="space-y-3">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-medium">{item.code}</Badge>
                <Badge variant="secondary">{item.itemType}</Badge>
                {item.rang && <Badge variant="outline">Rang {item.rang}</Badge>}
                {status === 'revised' && (
                  <Badge variant="default" className="bg-success/20 text-success border-success/30">
                    Révisé
                  </Badge>
                )}
              </div>

              {/* Titre */}
              <h1 className="text-2xl font-bold text-foreground leading-tight">
                {item.title}
              </h1>

              {/* Spécialité + sous-texte */}
              <p className="text-muted-foreground">
                {item.specialty ?? 'Spécialité non précisée'}
              </p>

              {/* Sous-texte encourageant */}
              <p className="text-sm text-muted-foreground/70 italic">
                Prends le temps de comprendre chaque point clé.
              </p>
            </div>

            {/* Actions secondaires - Discrètes */}
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={handleToggleFavorite} className="gap-2 text-muted-foreground hover:text-foreground">
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-destructive' : ''}`} />
                {isFavorite ? 'Favori' : 'Ajouter'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`${ROUTE_PATHS.medMngPlaylists}?item=${item.code}`)}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <FolderPlus className="h-4 w-4" />
                Playlist
              </Button>
              <Button variant="outline" size="sm" onClick={handleMarkReviewed} className="gap-2 ml-auto">
                <CheckCircle className="h-4 w-4" />
                {status === 'not_started'
                  ? 'Démarrer'
                  : status === 'in_progress'
                  ? 'Marquer révisé'
                  : 'Revenir en cours'}
              </Button>
            </div>

            {/* Contenu principal - Points essentiels */}
            <Card className="border-border/30">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-foreground">Points essentiels à retenir</h2>
                  <p className="text-xs text-muted-foreground">
                    Prends le temps de comprendre chaque point clé.
                  </p>
                </div>
                <Accordion type="multiple" className="space-y-3">
                  {(item.notes.length > 0 ? item.notes : [{
                    id: 'empty',
                    title: 'Résumé',
                    content: 'Aucune fiche disponible pour cet item.',
                    contentType: 'text',
                    rang: null,
                  }]).map(note => (
                    <AccordionItem key={note.id} value={note.id} className="border border-border/30 rounded-xl overflow-hidden bg-muted/20">
                      <AccordionTrigger className="px-4 py-3.5 hover:bg-muted/40 text-sm font-medium">
                        {note.title}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-5 pt-3 bg-card/50">
                        {renderFicheContent(note.content)}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Audio Player - Plus visible avec fond coloré */}
            {selectedAudio ? (
              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Headphones className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Écoute audio</p>
                      <p className="text-xs text-muted-foreground">
                        Tu peux écouter pendant une autre activité.
                      </p>
                    </div>
                  </div>
                  <ItemAudioPlayer
                    audios={item.audios}
                    selectedIndex={selectedAudioIndex}
                    onSelect={setSelectedAudioIndex}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/30">
                <CardContent className="p-4 text-center text-sm text-muted-foreground">
                  Aucun audio disponible pour cet item.
                </CardContent>
              </Card>
            )}

            {/* Progression - Discret */}
            <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
              <span>
                {revisionCount} révision{revisionCount > 1 ? 's' : ''} • Dernière ouverture : {lastSeenAt ? new Date(lastSeenAt).toLocaleDateString('fr-FR') : 'Jamais'}
              </span>
              <span className="text-foreground font-medium">{score}%</span>
            </div>

            {/* Navigation entre items */}
            {currentIndex >= 0 && (
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    navigate(
                      ROUTE_PATHS.medMngItemDetail.replace(
                        ':itemCode',
                        orderedCodes[currentIndex - 1]
                      )
                    )
                  }
                  disabled={currentIndex <= 0}
                  className="gap-2 text-muted-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    navigate(
                      ROUTE_PATHS.medMngItemDetail.replace(
                        ':itemCode',
                        orderedCodes[currentIndex + 1]
                      )
                    )
                  }
                  disabled={currentIndex === orderedCodes.length - 1}
                  className="gap-2 text-muted-foreground"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Contextual AI Tutor */}
            {user && (
              <ContextualAITutor
                item={item}
                userId={user.id}
                score={score}
                revisionCount={revisionCount}
                status={status}
              />
            )}
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
