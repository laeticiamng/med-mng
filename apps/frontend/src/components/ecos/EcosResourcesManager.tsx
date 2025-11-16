/**
 * ECOS Resources Manager Component
 * Manages learning resources for ECOS scenarios
 *
 * Features:
 * - View resources for a scenario
 * - Upload new resources
 * - Download/view resources
 * - Track resource access
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  FileText,
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
  Download,
  Eye,
  Upload,
  Plus,
  File,
  Music,
  Search,
  Heart,
  Filter,
  SortAsc,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface EcosResource {
  id: string;
  title: string;
  description?: string;
  resource_type: 'pdf' | 'video' | 'audio' | 'image' | 'link' | 'document' | 'other';
  file_url?: string;
  external_link?: string;
  file_size_bytes?: number;
  category: string;
  tags?: string[];
  download_count: number;
  view_count: number;
  is_featured: boolean;
  created_at: string;
}

interface EcosResourcesManagerProps {
  situationId?: string; // Optional - if null, shows general resources
  canUpload?: boolean; // Whether user can upload resources
}

const getResourceIcon = (type: string) => {
  switch (type) {
    case 'pdf':
    case 'document':
      return <FileText className="h-5 w-5" />;
    case 'video':
      return <Video className="h-5 w-5" />;
    case 'audio':
      return <Music className="h-5 w-5" />;
    case 'image':
      return <ImageIcon className="h-5 w-5" />;
    case 'link':
      return <LinkIcon className="h-5 w-5" />;
    default:
      return <File className="h-5 w-5" />;
  }
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'N/A';
  const kb = bytes / 1024;
  const mb = kb / 1024;
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${kb.toFixed(2)} KB`;
};

export const EcosResourcesManager: React.FC<EcosResourcesManagerProps> = ({
  situationId,
  canUpload = false,
}) => {
  const [resources, setResources] = useState<EcosResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const { toast } = useToast();

  // Enhanced filtering and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'popular' | 'title'>('date');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Form state for upload
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    resource_type: 'pdf' as const,
    category: 'supplementary' as const,
    external_link: '',
    tags: '',
  });

  // Fetch resources
  useEffect(() => {
    fetchResources();
    loadFavorites();
  }, [situationId]);

  const fetchResources = async () => {
    try {
      setLoading(true);

      // Use the database function to get resources
      const { data, error } = await supabase.rpc('get_ecos_resources', {
        p_situation_id: situationId || null,
      });

      if (error) throw error;

      setResources(data || []);
    } catch (err: any) {
      console.error('Error fetching resources:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les ressources',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load favorites from localStorage
  const loadFavorites = () => {
    const saved = localStorage.getItem('ecos_resource_favorites');
    if (saved) {
      try {
        setFavorites(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error('Error loading favorites:', e);
      }
    }
  };

  // Toggle favorite status
  const toggleFavorite = (resourceId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(resourceId)) {
      newFavorites.delete(resourceId);
      toast({ description: 'Retiré des favoris' });
    } else {
      newFavorites.add(resourceId);
      toast({ description: 'Ajouté aux favoris' });
    }
    setFavorites(newFavorites);
    localStorage.setItem('ecos_resource_favorites', JSON.stringify(Array.from(newFavorites)));
  };

  // Filter and sort resources
  const filteredResources = resources
    .filter((resource) => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesTitle = resource.title.toLowerCase().includes(search);
        const matchesDescription = resource.description?.toLowerCase().includes(search);
        const matchesTags = resource.tags?.some(tag => tag.toLowerCase().includes(search));
        if (!matchesTitle && !matchesDescription && !matchesTags) {
          return false;
        }
      }

      // Type filter
      if (filterType !== 'all' && resource.resource_type !== filterType) {
        return false;
      }

      // Category filter
      if (filterCategory !== 'all' && resource.category !== filterCategory) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.view_count + b.download_count) - (a.view_count + a.download_count);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  // Handle resource access (view/download)
  const handleResourceAccess = async (resourceId: string, accessType: 'view' | 'download', url?: string) => {
    try {
      // Log access
      await supabase.rpc('log_resource_access', {
        p_resource_id: resourceId,
        p_access_type: accessType,
      });

      // Open resource
      if (url) {
        window.open(url, '_blank');
      }
    } catch (err: any) {
      console.error('Error accessing resource:', err);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    try {
      if (!uploadForm.title || !uploadForm.external_link) {
        toast({
          title: 'Validation',
          description: 'Titre et lien sont requis',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase.from('ecos_resources').insert({
        situation_id: situationId || null,
        title: uploadForm.title,
        description: uploadForm.description,
        resource_type: uploadForm.resource_type,
        external_link: uploadForm.external_link,
        category: uploadForm.category,
        tags: uploadForm.tags ? uploadForm.tags.split(',').map(t => t.trim()) : [],
        is_public: true,
      });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Ressource ajoutée avec succès',
      });

      setIsUploadDialogOpen(false);
      setUploadForm({
        title: '',
        description: '',
        resource_type: 'pdf',
        category: 'supplementary',
        external_link: '',
        tags: '',
      });

      fetchResources();
    } catch (err: any) {
      console.error('Error uploading resource:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter la ressource',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Ressources Pédagogiques</h3>
          <p className="text-sm text-muted-foreground">
            {filteredResources.length} sur {resources.length} {resources.length === 1 ? 'ressource' : 'ressources'}
          </p>
        </div>
        {canUpload && (
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une ressource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter une Ressource</DialogTitle>
                <DialogDescription>
                  Ajoutez une nouvelle ressource pédagogique pour ce scénario
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    placeholder="Nom de la ressource"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    placeholder="Description de la ressource"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={uploadForm.resource_type}
                      onValueChange={(value: any) => setUploadForm({ ...uploadForm, resource_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="video">Vidéo</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="link">Lien</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Select
                      value={uploadForm.category}
                      onValueChange={(value: any) => setUploadForm({ ...uploadForm, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="course_material">Matériel de cours</SelectItem>
                        <SelectItem value="reference">Référence</SelectItem>
                        <SelectItem value="practice">Pratique</SelectItem>
                        <SelectItem value="supplementary">Supplémentaire</SelectItem>
                        <SelectItem value="evaluation_guide">Guide d'évaluation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="link">Lien *</Label>
                  <Input
                    id="link"
                    value={uploadForm.external_link}
                    onChange={(e) => setUploadForm({ ...uploadForm, external_link: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                  <Input
                    id="tags"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                    placeholder="ecos, cardiologie, urgence"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleUpload}>Ajouter</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filters */}
      {resources.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher des ressources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters and Sort */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    <Filter className="h-3 w-3 inline mr-1" />
                    Type
                  </Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="video">Vidéo</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="link">Lien</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    <Filter className="h-3 w-3 inline mr-1" />
                    Catégorie
                  </Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      <SelectItem value="course_material">Matériel de cours</SelectItem>
                      <SelectItem value="reference">Référence</SelectItem>
                      <SelectItem value="practice">Pratique</SelectItem>
                      <SelectItem value="supplementary">Supplémentaire</SelectItem>
                      <SelectItem value="evaluation_guide">Guide d'évaluation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    <SortAsc className="h-3 w-3 inline mr-1" />
                    Trier par
                  </Label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Plus récent</SelectItem>
                      <SelectItem value="popular">Popularité</SelectItem>
                      <SelectItem value="title">Titre (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active filters summary */}
              {(searchTerm || filterType !== 'all' || filterCategory !== 'all') && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Filtres actifs:</span>
                  {searchTerm && <Badge variant="outline">"{searchTerm}"</Badge>}
                  {filterType !== 'all' && <Badge variant="outline">{filterType}</Badge>}
                  {filterCategory !== 'all' && <Badge variant="outline">{filterCategory}</Badge>}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('all');
                      setFilterCategory('all');
                    }}
                  >
                    Réinitialiser
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources List */}
      {filteredResources.length === 0 && resources.length > 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Aucun résultat</h3>
            <p className="text-muted-foreground mb-4">
              Aucune ressource ne correspond à vos critères de recherche
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterCategory('all');
              }}
            >
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      ) : resources.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <File className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Aucune ressource disponible</h3>
            <p className="text-muted-foreground">
              {canUpload
                ? 'Commencez par ajouter des ressources pédagogiques'
                : 'Aucune ressource n\'est disponible pour ce scénario'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                      {getResourceIcon(resource.resource_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        {resource.is_featured && (
                          <Badge variant="default">Recommandé</Badge>
                        )}
                      </div>
                      {resource.description && (
                        <CardDescription>{resource.description}</CardDescription>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{resource.resource_type}</Badge>
                        {resource.file_size_bytes && (
                          <Badge variant="secondary">{formatFileSize(resource.file_size_bytes)}</Badge>
                        )}
                      </div>
                      {resource.tags && resource.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-2">
                          {resource.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    onClick={() =>
                      handleResourceAccess(
                        resource.id,
                        'view',
                        resource.file_url || resource.external_link
                      )
                    }
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir
                  </Button>
                  {resource.file_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResourceAccess(resource.id, 'download', resource.file_url)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant={favorites.has(resource.id) ? 'default' : 'outline'}
                    onClick={() => toggleFavorite(resource.id)}
                    className="ml-auto"
                  >
                    <Heart className={`h-4 w-4 mr-2 ${favorites.has(resource.id) ? 'fill-current' : ''}`} />
                    {favorites.has(resource.id) ? 'Favori' : 'Ajouter'}
                  </Button>
                  <div className="w-full mt-2">
                    <span className="text-sm text-muted-foreground">
                      {resource.view_count} vues · {resource.download_count} téléchargements
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EcosResourcesManager;
