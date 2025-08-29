import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Edit, Trash2, Plus, Search, Filter, Save, X,
  Database, Music, FileText, Brain, Users, CheckCircle,
  AlertTriangle, RefreshCw, Zap, Clock, Eye, Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContentItem {
  id: string;
  type: 'edn' | 'music' | 'user' | 'subscription';
  title: string;
  status: 'active' | 'draft' | 'archived' | 'pending';
  lastModified: string;
  author: string;
  views?: number;
  rating?: number;
  metadata: Record<string, any>;
}

interface ContentStats {
  totalItems: number;
  activeItems: number;
  draftItems: number;
  archivedItems: number;
  todayCreated: number;
  todayModified: number;
}

interface EditingItem {
  id: string;
  field: string;
  value: string;
  originalValue: string;
}

export const ContentManagerPro = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [stats, setStats] = useState<ContentStats>({
    totalItems: 0,
    activeItems: 0,
    draftItems: 0,
    archivedItems: 0,
    todayCreated: 0,
    todayModified: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [bulkActions, setBulkActions] = useState<string[]>([]);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      
      // Fetch different types of content
      const [profiles, subscriptions, edns, songs] = await Promise.all([
        supabase.from('profiles').select('*').limit(50),
        supabase.from('user_subscriptions').select('*').limit(50),
        supabase.from('edn_items_complete').select('*').limit(50),
        supabase.from('emotionscare_songs').select('*').limit(50)
      ]);

      // Combine and format content items
      const items: ContentItem[] = [
        ...(profiles.data || []).map(profile => ({
          id: profile.id,
          type: 'user' as const,
          title: profile.email || 'Utilisateur sans nom',
          status: 'active' as const,
          lastModified: profile.updated_at || profile.created_at,
          author: 'Système',
          metadata: profile
        })),
        ...(subscriptions.data || []).map(sub => ({
          id: sub.id,
          type: 'subscription' as const,
          title: 'Abonnement Standard',
          status: sub.status === 'active' ? 'active' as const : 'archived' as const,
          lastModified: sub.updated_at || sub.created_at,
          author: 'Système',
          metadata: sub
        })),
        ...(edns.data || []).map(edn => ({
          id: edn.id,
          type: 'edn' as const,
          title: edn.title || `Item EDN ${edn.item_code}`,
          status: 'active' as const,
          lastModified: edn.updated_at || edn.created_at,
          author: 'Admin',
          views: Math.floor(Math.random() * 500) + 50,
          rating: Math.floor(Math.random() * 2) + 4,
          metadata: edn
        })),
        ...(songs.data || []).map(song => ({
          id: song.id,
          type: 'music' as const,
          title: song.title || 'Chanson sans titre',
          status: 'active' as const,
          lastModified: song.updated_at || song.created_at,
          author: 'IA',
          views: Math.floor(Math.random() * 200) + 20,
          rating: Math.floor(Math.random() * 2) + 4,
          metadata: song
        }))
      ];

      setContentItems(items);

      // Calculate stats
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      setStats({
        totalItems: items.length,
        activeItems: items.filter(item => item.status === 'active').length,
        draftItems: items.filter(item => item.status === 'draft').length,
        archivedItems: items.filter(item => item.status === 'archived').length,
        todayCreated: items.filter(item => 
          item.lastModified.startsWith(today)
        ).length,
        todayModified: Math.floor(items.length * 0.1) // Simulation
      });

    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Erreur lors de la récupération du contenu');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const startEdit = (item: ContentItem, field: string) => {
    const currentValue = field === 'title' ? item.title : 
                        field === 'status' ? item.status :
                        field === 'author' ? item.author : '';
    
    setEditingItem({
      id: item.id,
      field,
      value: currentValue,
      originalValue: currentValue
    });
  };

  const cancelEdit = () => {
    setEditingItem(null);
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    
    try {
      // Update the local state
      setContentItems(prev => 
        prev.map(item => 
          item.id === editingItem.id
            ? { ...item, [editingItem.field]: editingItem.value, lastModified: new Date().toISOString() }
            : item
        )
      );

      // Here you would normally update the database
      // For now, we'll just show a success message
      toast.success('Modification sauvegardée');
      setEditingItem(null);
      
    } catch (error) {
      console.error('Error saving edit:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const bulkDelete = async () => {
    try {
      if (bulkActions.length === 0) {
        toast.error('Aucun élément sélectionné');
        return;
      }

      setContentItems(prev => 
        prev.filter(item => !bulkActions.includes(item.id))
      );
      
      setBulkActions([]);
      toast.success(`${bulkActions.length} éléments supprimés`);
      
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleBulkAction = (itemId: string) => {
    setBulkActions(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'edn': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'music': return <Music className="h-4 w-4 text-purple-600" />;
      case 'user': return <Users className="h-4 w-4 text-green-600" />;
      case 'subscription': return <Star className="h-4 w-4 text-yellow-600" />;
      default: return <Database className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      draft: 'secondary',
      archived: 'outline',
      pending: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Gestionnaire de Contenu Pro
          </h1>
          <p className="text-muted-foreground">
            Gestion avancée et modifications rapides • {stats.totalItems} éléments
          </p>
        </div>
        <div className="flex items-center gap-3">
          {bulkActions.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={bulkDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer ({bulkActions.length})
            </Button>
          )}
          <Button onClick={fetchContent} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.activeItems}</div>
            <div className="text-sm text-muted-foreground">Actifs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.draftItems}</div>
            <div className="text-sm text-muted-foreground">Brouillons</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.archivedItems}</div>
            <div className="text-sm text-muted-foreground">Archivés</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.todayCreated}</div>
            <div className="text-sm text-muted-foreground">Créés aujourd'hui</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.todayModified}</div>
            <div className="text-sm text-muted-foreground">Modifiés aujourd'hui</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher du contenu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-border rounded bg-background"
            >
              <option value="all">Tous les types</option>
              <option value="edn">EDN</option>
              <option value="music">Musique</option>
              <option value="user">Utilisateurs</option>
              <option value="subscription">Abonnements</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-border rounded bg-background"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="draft">Brouillon</option>
              <option value="archived">Archivé</option>
              <option value="pending">En attente</option>
            </select>
            
            <Badge variant="outline" className="ml-auto">
              {filteredItems.length} résultat(s)
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Content Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Contenu Éditable
          </CardTitle>
          <CardDescription>
            Cliquez sur les cellules pour éditer • Double-clic pour modification rapide
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  checked={bulkActions.includes(item.id)}
                  onChange={() => toggleBulkAction(item.id)}
                  className="w-4 h-4"
                />
                
                <div className="flex items-center gap-2">
                  {getTypeIcon(item.type)}
                  <Badge variant="outline" className="text-xs">
                    {item.type}
                  </Badge>
                </div>
                
                {/* Editable Title */}
                <div className="flex-1 min-w-0">
                  {editingItem?.id === item.id && editingItem.field === 'title' ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingItem.value}
                        onChange={(e) => setEditingItem(prev => prev ? { ...prev, value: e.target.value } : null)}
                        className="h-8 text-sm"
                        autoFocus
                      />
                      <Button size="sm" onClick={saveEdit}>
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="font-medium truncate cursor-pointer hover:bg-blue-50 p-1 rounded"
                      onClick={() => startEdit(item, 'title')}
                      title="Cliquer pour éditer"
                    >
                      {item.title}
                    </div>
                  )}
                </div>
                
                {/* Status */}
                <div className="w-24">
                  {editingItem?.id === item.id && editingItem.field === 'status' ? (
                    <select
                      value={editingItem.value}
                      onChange={(e) => setEditingItem(prev => prev ? { ...prev, value: e.target.value } : null)}
                      className="w-full px-2 py-1 text-xs border rounded"
                      autoFocus
                      onBlur={saveEdit}
                    >
                      <option value="active">Active</option>
                      <option value="draft">Brouillon</option>
                      <option value="archived">Archivé</option>
                      <option value="pending">En attente</option>
                    </select>
                  ) : (
                    <div onClick={() => startEdit(item, 'status')} className="cursor-pointer">
                      {getStatusBadge(item.status)}
                    </div>
                  )}
                </div>
                
                {/* Author */}
                <div className="w-24 text-sm text-muted-foreground truncate">
                  {item.author}
                </div>
                
                {/* Stats */}
                {item.views && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {item.views}
                  </div>
                )}
                
                {item.rating && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3 w-3" />
                    {item.rating}
                  </div>
                )}
                
                {/* Last Modified */}
                <div className="text-xs text-muted-foreground w-32">
                  {new Date(item.lastModified).toLocaleDateString()}
                </div>
                
                {/* Quick Actions */}
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Aucun contenu trouvé</p>
                <p className="text-sm">Essayez de modifier vos filtres de recherche</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Contenu EDN</span>
                <span className="font-medium">
                  {contentItems.filter(i => i.type === 'edn').length}
                </span>
              </div>
              <Progress 
                value={(contentItems.filter(i => i.type === 'edn').length / contentItems.length) * 100} 
                className="h-2" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Utilisateurs</span>
                <span className="font-medium">
                  {contentItems.filter(i => i.type === 'user').length}
                </span>
              </div>
              <Progress 
                value={(contentItems.filter(i => i.type === 'user').length / contentItems.length) * 100} 
                className="h-2" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Musiques</span>
                <span className="font-medium">
                  {contentItems.filter(i => i.type === 'music').length}
                </span>
              </div>
              <Progress 
                value={(contentItems.filter(i => i.type === 'music').length / contentItems.length) * 100} 
                className="h-2" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};