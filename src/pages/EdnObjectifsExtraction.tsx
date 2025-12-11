import React, { useEffect, useState } from 'react';
import { EdnObjectifsExtraction as EdnObjectifsExtractionComponent } from '@/components/edn/EdnObjectifsExtraction';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Target,
  BookOpen,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  TrendingUp,
  Loader2,
  RefreshCw,
  FileText,
  Lightbulb,
  GraduationCap,
  ChevronRight
} from 'lucide-react';

interface ObjectifStats {
  totalObjectifs: number;
  extractedObjectifs: number;
  pendingObjectifs: number;
  byCompetence: Record<string, number>;
  extractionRate: number;
}

interface ObjectifItem {
  id: string;
  itemCode: string;
  title: string;
  objectifs: string[];
  competences: string[];
  status: 'extracted' | 'pending' | 'error';
  lastExtracted?: string;
}

const EdnObjectifsExtractionPage: React.FC = () => {
  const { logActivity } = useActivityTracking();
  const { addXP, incrementProgress } = useGamification();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<ObjectifStats | null>(null);
  const [objectifs, setObjectifs] = useState<ObjectifItem[]>([]);
  const [selectedCompetence, setSelectedCompetence] = useState<string | null>(null);

  // Charger les statistiques d'objectifs
  const loadObjectifsStats = async () => {
    try {
      const { data: items, error } = await supabase
        .from('edn_items')
        .select('item_code, title, content_v2, rang');

      if (error) throw error;

      let totalObjectifs = 0;
      let extractedCount = 0;
      const competenceCount: Record<string, number> = {};
      const objectifItems: ObjectifItem[] = [];

      items?.forEach(item => {
        const contentV2 = item.content_v2 as any;
        const itemObjectifs = contentV2?.objectifs || contentV2?.learning_objectives || [];
        const itemCompetences = contentV2?.competences || [];

        totalObjectifs += itemObjectifs.length || 0;

        // Compter par compétence
        itemCompetences.forEach((comp: string) => {
          competenceCount[comp] = (competenceCount[comp] || 0) + 1;
        });

        const hasObjectifs = itemObjectifs.length > 0;
        if (hasObjectifs) extractedCount++;

        objectifItems.push({
          id: item.item_code,
          itemCode: item.item_code,
          title: item.title || 'Sans titre',
          objectifs: itemObjectifs,
          competences: itemCompetences,
          status: hasObjectifs ? 'extracted' : 'pending',
          lastExtracted: contentV2?.extracted_at
        });
      });

      setStats({
        totalObjectifs,
        extractedObjectifs: extractedCount,
        pendingObjectifs: (items?.length || 0) - extractedCount,
        byCompetence: competenceCount,
        extractionRate: items?.length ? Math.round((extractedCount / items.length) * 100) : 0
      });

      setObjectifs(objectifItems);
    } catch (err) {
      console.error('Error loading objectifs stats:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les statistiques des objectifs',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Rafraîchir les données
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadObjectifsStats();
    setIsRefreshing(false);
    toast({
      title: 'Données rafraîchies',
      description: 'Les objectifs ont été mis à jour'
    });
  };

  // Exporter les objectifs
  const handleExport = async () => {
    try {
      const exportData = {
        generatedAt: new Date().toISOString(),
        stats,
        objectifs: objectifs.map(o => ({
          itemCode: o.itemCode,
          title: o.title,
          objectifs: o.objectifs,
          competences: o.competences,
          status: o.status
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `objectifs-edn-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      addXP(15, 'Export des objectifs EDN');
      incrementProgress('exports_completed');

      toast({
        title: 'Export réussi',
        description: 'Les objectifs ont été exportés'
      });
    } catch (err) {
      toast({
        title: 'Erreur d\'export',
        description: 'Impossible d\'exporter les objectifs',
        variant: 'destructive'
      });
    }
  };

  // Filtrer les objectifs
  const filteredObjectifs = objectifs.filter(item => {
    const matchesSearch = !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCompetence = !selectedCompetence ||
      item.competences.includes(selectedCompetence);
    return matchesSearch && matchesCompetence;
  });

  useEffect(() => {
    logActivity({
      activity_type: 'study',
      metadata: { action: 'view_objectifs_extraction', timestamp: new Date().toISOString() }
    });
    loadObjectifsStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des objectifs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Extraction des Objectifs EDN
              </h1>
            </div>
            <p className="text-muted-foreground">
              Gérez et visualisez les objectifs pédagogiques extraits des items EDN
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Rafraîchir
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Objectifs</p>
                    <p className="text-3xl font-bold text-primary">{stats.totalObjectifs}</p>
                  </div>
                  <Lightbulb className="h-8 w-8 text-primary/20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Items Extraits</p>
                    <p className="text-3xl font-bold text-green-500">{stats.extractedObjectifs}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500/20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">En Attente</p>
                    <p className="text-3xl font-bold text-yellow-500">{stats.pendingObjectifs}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500/20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taux d'extraction</p>
                    <p className="text-3xl font-bold text-blue-500">{stats.extractionRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500/20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Bar */}
        {stats && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Progression de l'Extraction
              </CardTitle>
              <CardDescription>
                {stats.extractedObjectifs} items sur {stats.extractedObjectifs + stats.pendingObjectifs} ont des objectifs extraits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={stats.extractionRate} className="h-3" />
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">
              <BookOpen className="h-4 w-4 mr-2" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="extraction">
              <Target className="h-4 w-4 mr-2" />
              Outil d'extraction
            </TabsTrigger>
            <TabsTrigger value="list">
              <FileText className="h-4 w-4 mr-2" />
              Liste des items
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Compétences Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition par Compétence</CardTitle>
                <CardDescription>
                  Distribution des objectifs selon les compétences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {stats && Object.entries(stats.byCompetence)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 12)
                    .map(([competence, count]) => (
                      <Button
                        key={competence}
                        variant={selectedCompetence === competence ? 'default' : 'outline'}
                        className="justify-between h-auto py-3"
                        onClick={() => setSelectedCompetence(
                          selectedCompetence === competence ? null : competence
                        )}
                      >
                        <span className="truncate">{competence}</span>
                        <Badge variant="secondary" className="ml-2">{count}</Badge>
                      </Button>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="extraction">
            <EdnObjectifsExtractionComponent />
          </TabsContent>

          <TabsContent value="list">
            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              {filteredObjectifs.slice(0, 20).map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{item.itemCode}</Badge>
                          <Badge variant={item.status === 'extracted' ? 'default' : 'secondary'}>
                            {item.status === 'extracted' ? 'Extrait' : 'En attente'}
                          </Badge>
                        </div>
                        <h3 className="font-medium">{item.title}</h3>
                        {item.objectifs.length > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.objectifs.length} objectif{item.objectifs.length > 1 ? 's' : ''} extrait{item.objectifs.length > 1 ? 's' : ''}
                          </p>
                        )}
                        {item.competences.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.competences.slice(0, 3).map((comp, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {comp}
                              </Badge>
                            ))}
                            {item.competences.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{item.competences.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredObjectifs.length > 20 && (
              <p className="text-center text-muted-foreground mt-4">
                Affichage de 20 sur {filteredObjectifs.length} items
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EdnObjectifsExtractionPage;
