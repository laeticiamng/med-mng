import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Loader2, RefreshCw, Search, XCircle } from 'lucide-react';

interface ItemCompletenessRow {
  item_id: string;
  has_a: boolean;
  has_b: boolean;
  oic_count: number;
  oic_expected: number;
  status: 'complete' | 'partial' | 'missing' | string;
}

interface ItemsCompletenessSummary {
  total_items: number;
  complete_items: number;
  partial_items: number;
  missing_items: number;
  completion_rate: number;
  average_oic_ratio: number;
}

type StatusFilter = 'all' | 'complete' | 'partial' | 'missing';

const STATUS_LABELS: Record<Exclude<StatusFilter, 'all'>, string> = {
  complete: 'Complets',
  partial: 'Partiels',
  missing: 'Manquants',
};

const ItemsCompleteness = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<ItemCompletenessRow[]>([]);
  const [summary, setSummary] = useState<ItemsCompletenessSummary | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const computeRatio = useCallback((row: ItemCompletenessRow) => {
    if (row.oic_expected <= 0) {
      return row.oic_count > 0 || row.status === 'complete' ? 100 : 0;
    }

    const ratio = Math.round((row.oic_count / row.oic_expected) * 100);
    return Math.min(100, Math.max(0, ratio));
  }, []);

  const fetchCompleteness = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: viewRows, error: viewError } = await supabase.rpc('get_items_completeness', {
        p_status: statusFilter === 'all' ? null : statusFilter,
        p_limit: 500,
        p_offset: 0,
      });

      if (viewError) {
        throw viewError;
      }

      setItems(viewRows ?? []);

      const { data: summaryRows, error: summaryError } = await supabase.rpc(
        'get_items_completeness_summary',
      );

      if (summaryError) {
        throw summaryError;
      }

      const summaryRow = Array.isArray(summaryRows) ? summaryRows[0] ?? null : summaryRows;
      setSummary(summaryRow as ItemsCompletenessSummary | null);

      if (!viewRows || viewRows.length === 0) {
        toast({
          title: 'Aucun item trouvé',
          description: 'Aucun item ne correspond au filtre sélectionné.',
        });
      }
    } catch (fetchError) {
      console.error('❌ Failed to load items completeness:', fetchError);
      setError("Impossible de charger les données de complétude");
      toast({
        title: 'Erreur de chargement',
        description: "Impossible de charger la complétude des items.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    fetchCompleteness();
  }, [fetchCompleteness]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return (items ?? [])
      .filter((item) => {
        if (!normalizedSearch) return true;
        return item.item_id.toLowerCase().includes(normalizedSearch);
      })
      .sort((a, b) => a.item_id.localeCompare(b.item_id));
  }, [items, searchTerm]);

  const displayedSummary = useMemo(() => {
    if (filteredItems.length === 0) {
      return {
        withA: 0,
        withB: 0,
        averageRatio: 0,
      };
    }

    const withA = filteredItems.filter((item) => item.has_a).length;
    const withB = filteredItems.filter((item) => item.has_b).length;
    const averageRatio = Math.round(
      filteredItems.reduce((total, item) => total + computeRatio(item), 0) /
        filteredItems.length,
    );

    return { withA, withB, averageRatio };
  }, [filteredItems, computeRatio]);

  const renderStatusBadge = (status: string) => {
    const label = status in STATUS_LABELS ? STATUS_LABELS[status as keyof typeof STATUS_LABELS] : status;

    switch (status) {
      case 'complete':
        return (
          <Badge className="capitalize border-green-200 bg-green-100 text-green-700 hover:bg-green-100">
            {label}
          </Badge>
        );
      case 'missing':
        return (
          <Badge variant="destructive" className="capitalize">
            {label}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="capitalize">
            {label}
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Complétude des items EDN</h1>
          <p className="text-muted-foreground">
            Visualisez la présence des tableaux Rang A/B et la progression des compétences OIC intégrées.
          </p>
        </div>
        <Button onClick={fetchCompleteness} disabled={isLoading} className="self-start gap-2">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.total_items}</div>
              <p className="text-xs text-muted-foreground">Items suivis dans la plateforme</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Items complets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-green-600">{summary.complete_items}</div>
              <p className="text-xs text-muted-foreground">
                {summary.completion_rate}% de complétude globale
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Items à suivre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-amber-600">{summary.partial_items}</div>
              <p className="text-xs text-muted-foreground">Tableaux ou OIC partiels</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ratio OIC moyen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold">{summary.average_oic_ratio}%</span>
              </div>
              <Progress value={summary.average_oic_ratio} className="mt-2" />
              <p className="text-xs text-muted-foreground">Compétences intégrées vs attendues</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                <TabsList>
                  <TabsTrigger value="all">Tous</TabsTrigger>
                  <TabsTrigger value="complete">Complets</TabsTrigger>
                  <TabsTrigger value="partial">Partiels</TabsTrigger>
                  <TabsTrigger value="missing">Manquants</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="text-sm text-muted-foreground">
                {filteredItems.length} items affichés · {displayedSummary.withA} avec Rang A ·{' '}
                {displayedSummary.withB} avec Rang B
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un item (IC-001)"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-56"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Ratio OIC moyen (filtre): <span className="font-medium">{displayedSummary.averageRatio}%</span>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement des données…
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">Item</TableHead>
                  <TableHead>Rang A</TableHead>
                  <TableHead>Rang B</TableHead>
                  <TableHead>OIC intégrées</TableHead>
                  <TableHead>OIC attendues</TableHead>
                  <TableHead>Ratio</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const ratio = computeRatio(item);
                  return (
                    <TableRow key={item.item_id}>
                      <TableCell className="font-mono font-medium">{item.item_id}</TableCell>
                      <TableCell>
                        {item.has_a ? (
                          <span className="inline-flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Présent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                            <XCircle className="h-4 w-4" />
                            Manquant
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.has_b ? (
                          <span className="inline-flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Présent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                            <XCircle className="h-4 w-4" />
                            Manquant
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{item.oic_count}</TableCell>
                      <TableCell>{item.oic_expected}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>{ratio}%</span>
                            <span className="text-muted-foreground">
                              {item.oic_expected > 0
                                ? `${item.oic_count}/${item.oic_expected}`
                                : `${item.oic_count}`}
                            </span>
                          </div>
                          <Progress value={ratio} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>{renderStatusBadge(item.status)}</TableCell>
                    </TableRow>
                  );
                })}

                {filteredItems.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                      Aucun item ne correspond aux filtres actuels.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ItemsCompleteness;
