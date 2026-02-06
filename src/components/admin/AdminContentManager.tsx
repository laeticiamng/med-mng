import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import {
    AlertTriangle,
    BookOpen,
    Brain,
    CheckCircle,
    Edit,
    Eye,
    MoreHorizontal,
    Music,
    Search,
    Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface EdnItem {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  completeness_score: number;
  is_validated: boolean;
  has_music: boolean;
  has_quiz: boolean;
  has_scene: boolean;
  has_tableau_a: boolean;
  has_tableau_b: boolean;
  updated_at: string;
  created_at: string;
}

export const AdminContentManager = () => {
  const [items, setItems] = useState<EdnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [completenessFilter, setCompletenessFilter] = useState('all');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      
      const { data: immersiveItems, error: immersiveError } = await supabase
        .from('edn_items_immersive')
        .select(`
          id, item_code, title, subtitle, 
          tableau_rang_a, tableau_rang_b,
          paroles_musicales, quiz_questions, scene_immersive,
          created_at, updated_at
        `)
        .order('item_code');

      if (immersiveError) {
        throw immersiveError;
      }

      const { data: completeItems } = await supabase
        .from('edn_items_complete')
        .select('item_code, completeness_score, is_validated');

      // Merger les données et calculer les métriques
      const mergedItems: EdnItem[] = immersiveItems?.map(item => {
        const completeData = completeItems?.find(c => c.item_code === item.item_code);
        
        const hasMusic = !!(item.paroles_musicales && item.paroles_musicales.length > 0);
        const hasQuiz = !!item.quiz_questions;
        const hasScene = !!item.scene_immersive;
        const hasTableauA = !!item.tableau_rang_a;
        const hasTableauB = !!item.tableau_rang_b;
        
        // Calcul du score de complétude
        const features = [hasTableauA, hasTableauB, hasMusic, hasQuiz, hasScene];
        const completenessScore = Math.round((features.filter(Boolean).length / features.length) * 100);

        return {
          id: item.id,
          item_code: item.item_code,
          title: item.title || '',
          subtitle: item.subtitle,
          completeness_score: completeData?.completeness_score || completenessScore,
          is_validated: completeData?.is_validated || false,
          has_music: hasMusic,
          has_quiz: hasQuiz,
          has_scene: hasScene,
          has_tableau_a: hasTableauA,
          has_tableau_b: hasTableauB,
          updated_at: item.updated_at,
          created_at: item.created_at
        };
      }) || [];

      setItems(mergedItems);
    } catch (error) {
      console.error('Erreur chargement contenu:', error);
      toast.error('Erreur lors du chargement du contenu');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.item_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = (() => {
      switch (statusFilter) {
        case 'validated': return item.is_validated;
        case 'pending': return !item.is_validated;
        case 'complete': return item.completeness_score >= 100;
        case 'incomplete': return item.completeness_score < 100;
        default: return true;
      }
    })();
    
    const matchesCompleteness = (() => {
      switch (completenessFilter) {
        case 'high': return item.completeness_score >= 80;
        case 'medium': return item.completeness_score >= 50 && item.completeness_score < 80;
        case 'low': return item.completeness_score < 50;
        default: return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesCompleteness;
  });

  const handleValidateItem = async (itemId: string, itemCode: string) => {
    try {
      // Persister la validation dans la base de données
      const { error } = await supabase
        .from('edn_items_complete')
        .update({
          is_validated: true,
          validated_at: new Date().toISOString()
        })
        .eq('item_code', itemCode);

      if (error) throw error;

      // Mettre à jour l'état local après succès
      const updatedItems = items.map(item =>
        item.id === itemId ? { ...item, is_validated: true } : item
      );
      setItems(updatedItems);

      toast.success(`Item ${itemCode} validé avec succès`);
    } catch (error) {
      console.error('Erreur validation:', error);
      toast.error('Erreur lors de la validation de l\'item');
    }
  };

  const handlePreviewItem = (item: EdnItem) => {
    const slug = item.item_code.toLowerCase();
    window.open(`/edn-complete/${slug}`, '_blank');
  };

  const handleEditItem = async (item: EdnItem) => {
    toast.info(`Éditeur bientôt disponible pour ${item.item_code}`);
  };

  const handleDeleteItem = async (itemId: string, itemCode: string) => {
    const confirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer l'item ${itemCode} ? Cette action est irréversible.`);
    if (!confirmed) return;

    try {
      // Supprimer de la table edn_items_immersive
      const { error: immersiveError } = await supabase
        .from('edn_items_immersive')
        .delete()
        .eq('id', itemId);

      if (immersiveError) throw immersiveError;

      // Supprimer aussi de edn_items_complete si existe
      await supabase
        .from('edn_items_complete')
        .delete()
        .eq('item_code', itemCode);

      // Mettre à jour l'état local
      setItems(items.filter(item => item.id !== itemId));

      toast.success(`Item ${itemCode} supprimé avec succès`);
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression de l\'item');
    }
  };

  const handleInvalidateItem = async (itemId: string, itemCode: string) => {
    try {
      const { error } = await supabase
        .from('edn_items_complete')
        .update({ is_validated: false })
        .eq('item_code', itemCode);

      if (error) throw error;

      const updatedItems = items.map(item =>
        item.id === itemId ? { ...item, is_validated: false } : item
      );
      setItems(updatedItems);

      toast.success(`Validation retirée pour ${itemCode}`);
    } catch (error) {
      console.error('Erreur invalidation:', error);
      toast.error('Erreur lors de l\'invalidation');
    }
  };

  const getCompletenessColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getStatusBadge = (item: EdnItem) => {
    if (item.is_validated) {
      return <Badge variant="success">Validé</Badge>;
    }
    if (item.completeness_score >= 100) {
      return <Badge variant="default">Complet</Badge>;
    }
    return <Badge variant="outline">En cours</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Gestion du contenu EDN
          </CardTitle>
          <CardDescription>
            Gérez, validez et modérez le contenu éducatif de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par titre ou code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="validated">Validés</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="complete">Complets</SelectItem>
                <SelectItem value="incomplete">Incomplets</SelectItem>
              </SelectContent>
            </Select>

            <Select value={completenessFilter} onValueChange={setCompletenessFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Complétude" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous niveaux</SelectItem>
                <SelectItem value="high">Élevée (80%+)</SelectItem>
                <SelectItem value="medium">Moyenne (50-80%)</SelectItem>
                <SelectItem value="low">Faible (&lt;50%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tableau du contenu */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Complétude</TableHead>
                  <TableHead>Fonctionnalités</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière mise à jour</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.item_code}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {item.title}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={item.completeness_score} className="w-16 h-2" />
                        <span className={`text-sm font-medium ${getCompletenessColor(item.completeness_score)}`}>
                          {item.completeness_score}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {item.has_tableau_a && (
                          <Badge variant="outline" className="text-xs">A</Badge>
                        )}
                        {item.has_tableau_b && (
                          <Badge variant="outline" className="text-xs">B</Badge>
                        )}
                        {item.has_music && (
                          <Badge variant="outline" className="text-xs">
                            <Music className="h-3 w-3" />
                          </Badge>
                        )}
                        {item.has_quiz && (
                          <Badge variant="outline" className="text-xs">
                            <Brain className="h-3 w-3" />
                          </Badge>
                        )}
                        {item.has_scene && (
                          <Badge variant="outline" className="text-xs">3D</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(item.updated_at).toLocaleDateString('fr-FR')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePreviewItem(item)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Prévisualiser
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditItem(item)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {!item.is_validated ? (
                            <DropdownMenuItem
                              onClick={() => handleValidateItem(item.id, item.item_code)}
                              className="text-success"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Valider
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleInvalidateItem(item.id, item.item_code)}
                              className="text-warning"
                            >
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Retirer validation
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteItem(item.id, item.item_code)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun contenu trouvé avec ces critères
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiques de contenu */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Total items</div>
            <div className="text-2xl font-bold">{items.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Items validés</div>
            <div className="text-2xl font-bold text-success">
              {items.filter(i => i.is_validated).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Items complets</div>
            <div className="text-2xl font-bold text-primary">
              {items.filter(i => i.completeness_score >= 100).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Score moyen</div>
            <div className="text-2xl font-bold">
              {Math.round(items.reduce((sum, item) => sum + item.completeness_score, 0) / items.length)}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};