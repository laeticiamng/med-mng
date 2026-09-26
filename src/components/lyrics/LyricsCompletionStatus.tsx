import { MusicPlaylist } from '@/components/edn/music/MusicPlaylist';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { chargerEtatContenuImmersif, type EtatContenuItem } from '@/hooks/useEtatContenuImmersif';
import {
    BarChart3,
    CheckCircle,
    Clock,
    ListMusic,
    Music,
    Search,
    XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

/**
 * Statut des paroles des 367 items.
 *
 * Cet écran lisait les quatre colonnes de paroles de tous les items — un
 * contenu réservé à Med MNG Premium, exposé à tout visiteur. Il ne reçoit plus
 * que des booléens « paroles rédigées » par variante, calculés côté serveur
 * par la RPC `mm_etat_contenu_immersif` (même règle que parolesSontRedigees),
 * et affiche « statut indisponible » tant que cette RPC n'est pas déployée.
 */
type EdnItemLyrics = EtatContenuItem;

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
  const [indisponible, setIndisponible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'partial' | 'missing'>('all');
  const [_viewMode, _setViewMode] = useState<'grid' | 'list'>('list');
  const { toast } = useToast();
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    fetchLyricsStatus();
    logActivity({ activity_type: 'study', metadata: { action: 'view_lyrics_status' } });
  }, []);

  const fetchLyricsStatus = async () => {
    try {
      setLoading(true);
      
      const data = await chargerEtatContenuImmersif();
      if (data === null) {
        setItems([]);
        setIndisponible(true);
        return;
      }
      setIndisponible(false);
      setItems(data);
      
      toast({
        title: "📊 Statut chargé",
        description: `${data.length} items analysés`
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

  // Une colonne non vide ne veut pas dire « paroles prêtes » : le serveur
  // applique la règle « paroles rédigées » (structure ou ponctuation, sans
  // résidu HTML) et ne renvoie que le booléen.
  const getLyricsStatus = (item: EdnItemLyrics) => {
    const a = item.paroles_rang_a;
    const b = item.paroles_rang_b;
    const ab = item.paroles_rang_ab;
    if (a && b && ab) return 'complete';   // les trois variantes annoncées
    if (a || b || ab) return 'partial';
    return 'missing';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'partial': return <Clock className="h-4 w-4 text-warning" />;
      default: return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };
  const calculateStats = (): LyricsStats => {
    return items.reduce((stats, item) => {
      stats.total++;
      const a = item.paroles_rang_a;
      const b = item.paroles_rang_b;
      const ab = item.paroles_rang_ab;
      if (a) stats.withRangA++;
      if (b) stats.withRangB++;
      if (ab) stats.withRangAB++;
      if (item.paroles_musicales) stats.withMusic++;
      if (a && b && ab) stats.complete++;
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
    <Tabs defaultValue="playlist" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="playlist" className="flex items-center gap-2">
          <ListMusic className="h-4 w-4" />
          Playlist
        </TabsTrigger>
        <TabsTrigger value="status" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Statut des paroles
        </TabsTrigger>
      </TabsList>

      <TabsContent value="playlist">
        <MusicPlaylist />
      </TabsContent>

      <TabsContent value="status" className="space-y-4">
      {indisponible && (
        <Card>
          <CardContent className="text-center py-8">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Statut des paroles indisponible</h3>
            <p className="text-sm text-muted-foreground">
              Le serveur ne fournit pas encore l'état des paroles par item (fonction mm_etat_contenu_immersif).
            </p>
          </CardContent>
        </Card>
      )}
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
          const hasRangA = item.paroles_rang_a;
          const hasRangB = item.paroles_rang_b;
          const hasMusic = item.paroles_musicales;

          return (
            <Card key={item.item_code} className="hover:shadow-sm transition-shadow">
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

      {filteredItems.length === 0 && !indisponible && (
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
      </TabsContent>
    </Tabs>
  );
};