import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, FolderPlus, Heart, Trash2, Download } from 'lucide-react';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { withAuth } from '@/components/med-mng/withAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { fetchItemsWithMeta, toggleFavoriteItem, upsertItemProgress } from '@/services/medMngItemsService';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { ROUTE_PATHS } from '@/config/routes';
import { useToast } from '@/hooks/use-toast';
import type { ItemStatus } from '@/types/medMngItems';

const MedMngFavoritesComponent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<'all' | ItemStatus>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: items, isLoading, refetch } = useQuery({
    queryKey: ['med-mng-favorites', user?.id],
    queryFn: () => fetchItemsWithMeta(user?.id),
  });

  const favorites = useMemo(() => {
    const favoriteItems = (items ?? []).filter(item => item.isFavorite);
    if (statusFilter === 'all') {
      return favoriteItems;
    }
    return favoriteItems.filter(item => item.status === statusFilter);
  }, [items, statusFilter]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => favorites.some(item => item.id === id)));
  }, [favorites]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleBulkReview = async () => {
    if (!user) {
      return;
    }

    const itemsToUpdate = favorites.filter(item => selectedIds.includes(item.id));

    // If nothing is selected, do nothing to avoid misleading toasts.
    if (itemsToUpdate.length === 0) {
      return;
    }

    try {
      const results = await Promise.allSettled(
        itemsToUpdate.map(item =>
          upsertItemProgress({
            userId: user.id,
            itemId: item.id,
            status: 'revised',
            lastSeenAt: new Date().toISOString(),
            revisionCount: item.revisionCount + 1,
            score: 100,
          })
        )
      );

      const failedCount = results.filter(result => result.status === 'rejected').length;
      const successCount = results.length - failedCount;

      if (failedCount === 0) {
        toast({
          title: 'Favoris mis à jour',
          description: 'Les items sélectionnés sont marqués comme révisés.',
        });
      } else if (successCount > 0) {
        toast({
          title: 'Mise à jour partielle des favoris',
          description: `Certains items ont été marqués comme révisés, mais ${failedCount} mise(s) à jour ont échoué.`,
        });
      } else {
        toast({
          title: 'Échec de la mise à jour des favoris',
          description: 'Aucun des items sélectionnés n’a pu être marqué comme révisé.',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur lors de la mise à jour des favoris',
        description: 'Une erreur inattendue est survenue pendant la mise à jour des items sélectionnés.',
      });
    } finally {
      await refetch();
    }
  };

  const handleRemoveSelected = async () => {
    if (!user) {
      return;
    }

    try {
      await Promise.all(
        selectedIds.map(itemId =>
          toggleFavoriteItem({ userId: user.id, itemId, isFavorite: true })
        )
      );

      setSelectedIds([]);
      toast({
        title: 'Favoris mis à jour',
        description: 'Les items sélectionnés ont été retirés des favoris.',
      });
      await refetch();
    } catch (error) {
      console.error('Failed to remove selected favorites', error);
      toast({
        title: 'Erreur lors de la mise à jour des favoris',
        description: 'Une erreur est survenue lors du retrait des items sélectionnés des favoris.',
        variant: 'destructive',
      });
    }
  };

  const handleExport = () => {
    const escapeCsvField = (value: unknown): string => {
      const stringValue = value === null || value === undefined ? '' : String(value);
      const escaped = stringValue.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const rows = favorites.map(item => ({
      code: item.code,
      title: item.title,
      specialty: item.specialty ?? '',
      status: item.status,
    }));

    const header = 'code,title,specialty,status';
    const csv = [
      header,
      ...rows.map(row =>
        [
          escapeCsvField(row.code),
          escapeCsvField(row.title),
          escapeCsvField(row.specialty),
          escapeCsvField(row.status),
        ].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'med-mng-favoris.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <MedMngLayout className="bg-gradient-to-br from-primary/5 to-accent/10">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">❤️ Mes Favoris</h1>
            <p className="text-muted-foreground">
              {favorites.length} item{favorites.length > 1 ? 's' : ''} dans vos favoris.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate(`${ROUTE_PATHS.medMngPlaylists}`)} className="gap-2">
              <FolderPlus className="h-4 w-4" />
              Ajouter à playlist
            </Button>
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
            <Button onClick={handleBulkReview} disabled={selectedIds.length === 0} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Marquer révisé
            </Button>
            <Button
              variant="outline"
              onClick={handleRemoveSelected}
              disabled={selectedIds.length === 0}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Retirer
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')}>
            Tous
          </Button>
          <Button
            variant={statusFilter === 'not_started' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('not_started')}
          >
            À réviser
          </Button>
          <Button
            variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('in_progress')}
          >
            En cours
          </Button>
          <Button
            variant={statusFilter === 'revised' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('revised')}
          >
            Révisés
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Chargement des favoris...
            </CardContent>
          </Card>
        ) : favorites.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Aucun favori pour le moment.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {favorites.map(item => (
              <Card key={item.id}>
                <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                      aria-label={`Sélectionner ${item.title}`}
                    />
                    <div>
                      <p className="text-sm text-muted-foreground">{item.code}</p>
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.specialty ?? 'Spécialité non précisée'} • {item.itemType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{item.status === 'revised' ? 'Révisé' : item.status === 'in_progress' ? 'En cours' : 'À réviser'}</Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      Favori
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MedMngLayout>
  );
};

export const MedMngFavorites = withAuth(MedMngFavoritesComponent);
