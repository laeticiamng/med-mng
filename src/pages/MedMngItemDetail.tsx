import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Heart, Loader2, CheckCircle, FolderPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { withAuth } from '@/components/med-mng/withAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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
    <MedMngLayout>
      <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>

        {isLoading && (
          <Card>
            <CardContent className="p-8 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Chargement...
            </CardContent>
          </Card>
        )}

        {isError && (
          <Card>
            <CardContent className="p-8 text-center space-y-2">
              <h2 className="text-lg font-medium">Impossible de charger l'item</h2>
              <p className="text-sm text-muted-foreground">
                Vérifiez votre connexion et réessayez.
              </p>
            </CardContent>
          </Card>
        )}

        {item && (
          <div className="space-y-6">
            {/* Header - Clean and Focused */}
            <div className="space-y-3">
              {/* Code + Type */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-medium text-primary bg-primary/10 px-2.5 py-1 rounded">
                  {item.code}
                </span>
                <Badge variant="secondary" className="text-xs">{item.itemType}</Badge>
                {item.rang && <Badge variant="outline" className="text-xs">Rang {item.rang}</Badge>}
                {status === 'revised' && (
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Révisé
                  </Badge>
                )}
              </div>
              
              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground leading-tight">
                {item.title}
              </h1>
              
              {/* Specialty */}
              <p className="text-sm text-muted-foreground">
                {item.specialty ?? 'Spécialité non précisée'}
              </p>

              {/* Tags */}
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Audio Player - Prominent */}
            {selectedAudio ? (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <ItemAudioPlayer
                    audios={item.audios}
                    selectedIndex={selectedAudioIndex}
                    onSelect={setSelectedAudioIndex}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground text-sm">
                  Aucun audio disponible pour cet item.
                </CardContent>
              </Card>
            )}

            {/* Actions - Secondary */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={isFavorite ? "secondary" : "outline"} 
                size="sm"
                onClick={handleToggleFavorite} 
                className="gap-1.5"
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-destructive' : ''}`} />
                {isFavorite ? 'Favori' : 'Ajouter aux favoris'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`${ROUTE_PATHS.medMngPlaylists}?item=${item.code}`)}
                className="gap-1.5"
              >
                <FolderPlus className="h-4 w-4" />
                Playlist
              </Button>
              <Button 
                size="sm"
                onClick={handleMarkReviewed} 
                className="gap-1.5 ml-auto"
              >
                <CheckCircle className="h-4 w-4" />
                {status === 'not_started' ? 'Démarrer' : status === 'in_progress' ? 'Marquer révisé' : 'Continuer'}
              </Button>
            </div>

            {/* Fiche de synthèse - Airy Table */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-base font-medium mb-4">Fiche de synthèse</h2>
                <Accordion type="multiple" className="space-y-2">
                  {(item.notes.length > 0 ? item.notes : [{
                    id: 'empty',
                    title: 'Résumé',
                    content: 'Aucune fiche disponible pour cet item.',
                    contentType: 'text',
                    rang: null,
                  }]).map(note => (
                    <AccordionItem key={note.id} value={note.id} className="border rounded-lg px-4">
                      <AccordionTrigger className="text-sm font-medium py-3">
                        {note.title}
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        {renderFicheContent(note.content)}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Progress Info - Simple */}
            <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/30 rounded-lg px-4 py-3">
              <span>{revisionCount} révision{revisionCount > 1 ? 's' : ''}</span>
              <span>
                Dernière ouverture : {lastSeenAt ? new Date(lastSeenAt).toLocaleDateString('fr-FR') : 'Jamais'}
              </span>
            </div>

            {/* Navigation */}
            {currentIndex >= 0 && (
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(ROUTE_PATHS.medMngItemDetail.replace(':itemCode', orderedCodes[currentIndex - 1]))}
                  disabled={currentIndex <= 0}
                  className="gap-1.5"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(ROUTE_PATHS.medMngItemDetail.replace(':itemCode', orderedCodes[currentIndex + 1]))}
                  disabled={currentIndex === orderedCodes.length - 1}
                  className="gap-1.5"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
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
    return <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{content}</p>;
  }

  if (content && typeof content === 'object' && 'headers' in content && 'rows' in content) {
    const tableContent = content as { headers: string[]; rows: string[][]; notes?: string };

    return (
      <div className="space-y-4">
        {/* Mobile Cards View */}
        <div className="space-y-3">
          {tableContent.rows.map((row, rowIndex) => (
            <div key={rowIndex} className="bg-muted/30 rounded-lg p-4 space-y-2.5">
              {row.map((cell, cellIndex) => (
                <div key={cellIndex} className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {tableContent.headers[cellIndex]}
                  </span>
                  <span className="text-sm text-foreground leading-relaxed">{cell}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {tableContent.notes && (
          <p className="text-xs text-muted-foreground italic">{tableContent.notes}</p>
        )}
      </div>
    );
  }

  return <pre className="text-xs text-muted-foreground overflow-auto">{JSON.stringify(content, null, 2)}</pre>;
};
