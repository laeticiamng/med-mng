import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Search, Music, CheckCircle, XCircle, Clock, 
  Eye, BarChart3, Filter, Grid, List 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EdnItemLyrics {
  id: string;
  item_code: string;
  title: string;
  paroles_rang_a?: string[];
  paroles_rang_b?: string[];
  paroles_rang_ab?: string[];
  paroles_musicales?: string[];
  updated_at: string;
}

interface LyricsStats {
  total: number;
  withRangA: number;
  withRangB: number;
  withRangAB: number;
  complete: number; // Tous les rangs
  withMusic: number;
}

export const LyricsCompletionStatus: React.FC = () => {
  const [items, setItems] = useState<EdnItemLyrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'partial' | 'missing'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { toast } = useToast();

  useEffect(() => {
    fetchLyricsStatus();
  }, []);

  const fetchLyricsStatus = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select(`
          id, item_code, title,
          paroles_rang_a, paroles_rang_b, paroles_rang_ab,
          paroles_musicales, updated_at
        `)
        .order('item_code');

      if (error) throw error;

      setItems(data || []);
      
      toast({
        title: "📊 Statut chargé",
        description: `${data?.length || 0} items analysés`
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger le statut",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getLyricsStatus = (item: EdnItemLyrics) => {
    const hasRangA = item.paroles_rang_a && item.paroles_rang_a.length > 0;
    const hasRangB = item.paroles_rang_b && item.paroles_rang_b.length > 0;
    const hasRangAB = item.paroles_rang_ab && item.paroles_rang_ab.length > 0;
    const hasMusic = item.paroles_musicales && item.paroles_musicales.length > 0;

    const completedRangs = [hasRangA, hasRangB, hasRangAB].filter(Boolean).length;
    
    if (completedRangs === 3 && hasMusic) return 'complete';
    if (completedRangs > 0 || hasMusic) return 'partial';
    return 'missing';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800 border-green-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const calculateStats = (): LyricsStats => {
    return items.reduce((stats, item) => {
      stats.total++;
      if (item.paroles_rang_a?.length) stats.withRangA++;
      if (item.paroles_rang_b?.length) stats.withRangB++;
      if (item.paroles_rang_ab?.length) stats.withRangAB++;
      if (item.paroles_musicales?.length) stats.withMusic++;
      if (getLyricsStatus(item) === 'complete') stats.complete++;
      return stats;
    }, { total: 0, withRangA: 0, withRangB: 0, withRangAB: 0, complete: 0, withMusic: 0 });
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.item_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    const status = getLyricsStatus(item);
    return matchesSearch && status === filterStatus;
  });

  const stats = calculateStats();
  const completionPercentage = stats.total > 0 ? Math.round((stats.complete / stats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Analyse des paroles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Statut des Paroles EDN
              </CardTitle>
              <CardDescription>
                Suivi de la génération des paroles style Nekfeu pour tous les items
              </CardDescription>
            </div>
            <Button onClick={fetchLyricsStatus} variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Statistiques globales */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.complete}</div>
              <div className="text-sm text-muted-foreground">Complets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.withRangA}</div>
              <div className="text-sm text-muted-foreground">Rang A</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.withRangB}</div>
              <div className="text-sm text-muted-foreground">Rang B</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.withRangAB}</div>
              <div className="text-sm text-muted-foreground">Rang A+B</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.withMusic}</div>
              <div className="text-sm text-muted-foreground">Musicales</div>
            </div>
          </div>

          {/* Barre de progression globale */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression globale</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground text-center">
              {stats.complete} items complets sur {stats.total} • Style Nekfeu avec contenu médical dense
            </div>
          </div>

          {/* Contrôles de recherche et filtrage */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher un item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                Tous ({items.length})
              </Button>
              <Button
                variant={filterStatus === 'complete' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('complete')}
              >
                Complets ({stats.complete})
              </Button>
              <Button
                variant={filterStatus === 'partial' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('partial')}
              >
                Partiels
              </Button>
              <Button
                variant={filterStatus === 'missing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('missing')}
              >
                Manquants
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des items */}
      <div className="grid gap-4">
        {filteredItems.map((item) => {
          const status = getLyricsStatus(item);
          const hasRangA = item.paroles_rang_a && item.paroles_rang_a.length > 0;
          const hasRangB = item.paroles_rang_b && item.paroles_rang_b.length > 0;
          const hasRangAB = item.paroles_rang_ab && item.paroles_rang_ab.length > 0;
          const hasMusic = item.paroles_musicales && item.paroles_musicales.length > 0;

          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(status)}
                      <div>
                        <h3 className="font-semibold text-sm">{item.item_code}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {item.title}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant={hasRangA ? "default" : "outline"} className="text-xs">
                        Rang A {hasRangA && `(${item.paroles_rang_a?.length} lignes)`}
                      </Badge>
                      <Badge variant={hasRangB ? "default" : "outline"} className="text-xs">
                        Rang B {hasRangB && `(${item.paroles_rang_b?.length} lignes)`}
                      </Badge>
                      <Badge variant={hasRangAB ? "default" : "outline"} className="text-xs">
                        A+B {hasRangAB && `(${item.paroles_rang_ab?.length} lignes)`}
                      </Badge>
                      <Badge variant={hasMusic ? "default" : "outline"} className="text-xs">
                        Musicales {hasMusic && `(${item.paroles_musicales?.length} lignes)`}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(status)}>
                      {status === 'complete' ? 'Complet' : 
                       status === 'partial' ? 'Partiel' : 'Manquant'}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Aucun résultat</h3>
            <p className="text-sm text-muted-foreground">
              Aucun item ne correspond à vos critères de recherche.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};