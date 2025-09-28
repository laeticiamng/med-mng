import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Search, Filter, MoreHorizontal, Edit, Trash2, 
  CheckCircle, AlertTriangle, Music, Brain, Image, Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
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
      // Simplement mettre à jour les données locales pour la démo
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, is_validated: true } : item
      );
      setItems(updatedItems);

      toast.success('Item validé avec succès');
    } catch (error) {
      console.error('Erreur validation:', error);
      toast.error('Erreur lors de la validation');
    }
  };

  const getCompletenessColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (item: EdnItem) => {
    if (item.is_validated) {
      return <Badge className="bg-green-100 text-green-800">Validé</Badge>;
    }
    if (item.completeness_score >= 100) {
      return <Badge className="bg-blue-100 text-blue-800">Complet</Badge>;
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
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Prévisualiser
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {!item.is_validated && (
                            <DropdownMenuItem 
                              onClick={() => handleValidateItem(item.id, item.item_code)}
                              className="text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Valider
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600">
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
            <div className="text-2xl font-bold text-green-600">
              {items.filter(i => i.is_validated).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Items complets</div>
            <div className="text-2xl font-bold text-blue-600">
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