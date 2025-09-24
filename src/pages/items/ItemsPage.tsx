import React, { useMemo, useState } from 'react';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useItemsWithCompleteness } from '@/hooks/useItemsWithCompleteness';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ListChecks,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';

const formatDateTime = (value: string | null) => {
  if (!value) {
    return 'Synchronisation en attente';
  }

  try {
    const date = new Date(value);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('❌ Unable to format date', error);
    return value;
  }
};

const statusDescription: Record<'complete' | 'incomplete' | 'critical', string> = {
  complete: 'Score ≥ 80% – Données complètes',
  incomplete: 'Score 40-79% – Données partielles',
  critical: 'Score < 40% – Données manquantes',
};

const ItemsPage: React.FC = () => {
  const { items, stats, loading, error, lastUpdated, refetch } = useItemsWithCompleteness();
  const [searchTerm, setSearchTerm] = useState('');
  const [specialiteFilter, setSpecialiteFilter] = useState('all');

  const specialities = useMemo(() => {
    const unique = new Set<string>();
    items.forEach((item) => {
      unique.add(item.specialite);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [items]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        term.length === 0 ||
        item.itemCode.toLowerCase().includes(term) ||
        item.title.toLowerCase().includes(term);
      const matchesSpecialite = specialiteFilter === 'all' || item.specialite === specialiteFilter;
      return matchesSearch && matchesSpecialite;
    });
  }, [items, searchTerm, specialiteFilter]);

  const summaryCards = [
    {
      label: 'Items totaux',
      value: stats.total,
      description: 'IC-1 à IC-367',
      icon: ListChecks,
      tone: 'text-blue-400',
    },
    {
      label: 'Items complets',
      value: stats.complete,
      description: 'Score ≥ 80%',
      icon: CheckCircle2,
      tone: 'text-emerald-400',
    },
    {
      label: 'Items partiels',
      value: stats.partial,
      description: 'Score 40-79%',
      icon: BarChart3,
      tone: 'text-amber-300',
    },
    {
      label: 'Items manquants',
      value: stats.missing,
      description: 'Score < 40%',
      icon: XCircle,
      tone: 'text-rose-400',
    },
  ];

  return (
    <ConsistentBackground variant="secondary">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <PageHeader
          title="Suivi de complétude des items EDN"
          subtitle="Chaque item IC (1 à 367) avec son niveau de complétude OIC"
          icon={ListChecks}
          badge={{ text: `${stats.total} items analysés`, variant: 'secondary' }}
          showBackButton={false}
        />

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Tableau de complétude</h2>
            <p className="text-sm text-muted-foreground">
              Dernier audit : {formatDateTime(lastUpdated)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              Actualiser
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <Card key={card.label} className="border border-white/10 bg-card/60 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <card.icon className={cn('h-5 w-5', card.tone)} aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-foreground">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border border-white/10 bg-card/60 backdrop-blur">
          <CardHeader className="space-y-4 border-b border-white/5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="text-lg font-semibold text-foreground">
                Liste des items (1 – 367)
              </CardTitle>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Rechercher par code ou titre"
                    className="pl-9"
                  />
                </div>
                <Select value={specialiteFilter} onValueChange={setSpecialiteFilter}>
                  <SelectTrigger className="w-full md:w-[220px]">
                    <SelectValue placeholder="Filtrer par spécialité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les spécialités</SelectItem>
                    {specialities.map((specialite) => (
                      <SelectItem key={specialite} value={specialite}>
                        {specialite}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
              <p>
                <span className="font-medium text-foreground">Complétude moyenne :</span> {stats.averageScore}%
              </p>
              <p>
                <span className="font-medium text-foreground">Statut « Partiel » :</span> {statusDescription.incomplete}
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center gap-3 py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
                <span className="text-sm text-muted-foreground">Chargement des items...</span>
              </div>
            ) : error ? (
              <div className="p-6">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  <AlertDescription>
                    Aucun item ne correspond aux critères sélectionnés.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[90px]">ID</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Spécialité</TableHead>
                    <TableHead className="text-center">A présent ?</TableHead>
                    <TableHead className="text-center">B présent ?</TableHead>
                    <TableHead>% OIC</TableHead>
                    <TableHead className="text-right">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-white/5">
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {item.itemCode}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-foreground">{item.title}</p>
                        {item.alertsCount > 0 && (
                          <p className="text-xs text-amber-400">
                            {item.alertsCount} alerte{item.alertsCount > 1 ? 's' : ''} de complétude
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.specialite}</TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center gap-1 text-sm">
                          {item.tableauAPresent ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                              <span>Oui</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-rose-400" aria-hidden="true" />
                              <span>Non</span>
                            </>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center gap-1 text-sm">
                          {item.tableauBPresent ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-sky-400" aria-hidden="true" />
                              <span>Oui</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-rose-400" aria-hidden="true" />
                              <span>Non</span>
                            </>
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{item.completenessScore}%</span>
                            <span>{statusDescription[item.status]}</span>
                          </div>
                          <Progress value={item.completenessScore} aria-label={`Score OIC ${item.itemCode}`} />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={item.badgeVariant}>{item.statusLabel}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ConsistentBackground>
  );
};

export default ItemsPage;

