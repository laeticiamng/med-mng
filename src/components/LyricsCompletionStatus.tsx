import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Search, Music, CheckCircle, XCircle, Clock, 
  Eye, BarChart3
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';

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
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    fetchLyricsStatus();
    logActivity({ activity_type: 'study', metadata: { action: 'view_lyrics_status' } });
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
      case 'complete': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'partial': return <Clock className="h-4 w-4 text-warning" />;
      default: return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-success/10 text-success border-success/20';
      case 'partial': return 'bg-warning/10 text-warning-foreground border-warning/20';
      default: return 'bg-destructive/10 text-destructive border-destructive/20';
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
    <div className="space-y-4">
      {/* Statistiques compactes */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Paroles EDN</h3>
            <Button onClick={fetchLyricsStatus} variant="ghost" size="sm">
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mb-3">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{stats.complete}</div>
              <div className="text-xs text-muted-foreground">Complets</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{stats.withRangA}</div>
              <div className="text-xs text-muted-foreground">Rang A</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{stats.withRangB}</div>
              <div className="text-xs text-muted-foreground">Rang B</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{stats.withMusic}</div>
              <div className="text-xs text-muted-foreground">Musical</div>
            </div>
          </div>

          <div className="space-y-2">
            <Progress value={completionPercentage} className="h-1" />
            <div className="text-xs text-muted-foreground text-center">
              {completionPercentage}% complet ({stats.complete}/{stats.total})
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 h-8 text-xs"
              />
            </div>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-20 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="complete">Complets</SelectItem>
                <SelectItem value="partial">Partiels</SelectItem>
                <SelectItem value="missing">Manquants</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste compacte */}
      <div className="space-y-2">
        {filteredItems.map((item) => {
          const status = getLyricsStatus(item);
          const hasRangA = item.paroles_rang_a && item.paroles_rang_a.length > 0;
          const hasRangB = item.paroles_rang_b && item.paroles_rang_b.length > 0;
          const hasMusic = item.paroles_musicales && item.paroles_musicales.length > 0;

          return (
            <Card key={item.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(status)}
                      <span className="font-medium text-sm">{item.item_code}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {item.title}
                      </span>
                    </div>
                    
                    <div className="flex gap-1">
                      <Badge variant={hasRangA ? "default" : "secondary"} className="text-xs px-1 py-0">
                        A
                      </Badge>
                      <Badge variant={hasRangB ? "default" : "secondary"} className="text-xs px-1 py-0">
                        B
                      </Badge>
                      <Badge variant={hasMusic ? "default" : "secondary"} className="text-xs px-1 py-0">
                        M
                      </Badge>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    {status === 'complete' ? '✓' : status === 'partial' ? '○' : '✗'}
                  </Badge>
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