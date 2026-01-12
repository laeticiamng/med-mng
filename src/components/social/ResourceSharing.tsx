import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  File,
  Image,
  FileSpreadsheet,
  Presentation,
  Link2,
  Plus,
  ThumbsUp,
  Eye,
  Calendar,
  User,
  Tag,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'image' | 'link' | 'document' | 'spreadsheet' | 'presentation';
  url: string;
  tags: string[];
  authorId: string;
  authorName: string;
  likes: number;
  downloads: number;
  views: number;
  comments: number;
  createdAt: string;
  isBookmarked: boolean;
  isLiked: boolean;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export const ResourceSharing: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'downloads'>('recent');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const { toast } = useToast();

  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'document' as Resource['type'],
    url: '',
    tags: ''
  });

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      // Simulation de données - à remplacer par vraie requête Supabase
      const mockResources: Resource[] = [
        {
          id: '1',
          title: 'Fiches Cardiologie Complètes',
          description: 'Résumé complet des pathologies cardiaques pour l\'EDN',
          type: 'pdf',
          url: '#',
          tags: ['cardiologie', 'EDN', 'fiches'],
          authorId: 'user1',
          authorName: 'Dr. Marie Dupont',
          likes: 156,
          downloads: 89,
          views: 342,
          comments: 12,
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          isBookmarked: false,
          isLiked: true
        },
        {
          id: '2',
          title: 'Schémas Anatomie - Neurologie',
          description: 'Illustrations détaillées du système nerveux',
          type: 'image',
          url: '#',
          tags: ['neurologie', 'anatomie', 'schémas'],
          authorId: 'user2',
          authorName: 'Paul Martin',
          likes: 234,
          downloads: 167,
          views: 521,
          comments: 23,
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          isBookmarked: true,
          isLiked: false
        },
        {
          id: '3',
          title: 'Tableau des Antibiotiques',
          description: 'Récapitulatif des antibiotiques par classe et spectre',
          type: 'spreadsheet',
          url: '#',
          tags: ['infectiologie', 'antibiotiques', 'pharmacologie'],
          authorId: 'user3',
          authorName: 'Sophie Bernard',
          likes: 312,
          downloads: 245,
          views: 678,
          comments: 34,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          isBookmarked: false,
          isLiked: true
        },
        {
          id: '4',
          title: 'Cours Vidéo - ECG Débutant',
          description: 'Lien vers cours complet d\'interprétation ECG',
          type: 'link',
          url: 'https://example.com/ecg-course',
          tags: ['ECG', 'cardiologie', 'vidéo'],
          authorId: 'user4',
          authorName: 'Jean Leclerc',
          likes: 89,
          downloads: 0,
          views: 234,
          comments: 8,
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          isBookmarked: true,
          isLiked: false
        }
      ];

      setResources(mockResources);
    } catch (error) {
      console.error('Erreur chargement ressources:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: Resource['type']) => {
    switch (type) {
      case 'pdf': return <FileText className="h-5 w-5 text-destructive" />;
      case 'image': return <Image className="h-5 w-5 text-success" />;
      case 'link': return <Link2 className="h-5 w-5 text-primary" />;
      case 'spreadsheet': return <FileSpreadsheet className="h-5 w-5 text-success" />;
      case 'presentation': return <Presentation className="h-5 w-5 text-warning" />;
      default: return <File className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const handleLike = (resourceId: string) => {
    setResources(prev => prev.map(r =>
      r.id === resourceId
        ? { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 }
        : r
    ));
    toast({ title: 'Merci !', description: 'Votre avis a été enregistré.' });
  };

  const handleBookmark = (resourceId: string) => {
    setResources(prev => prev.map(r =>
      r.id === resourceId ? { ...r, isBookmarked: !r.isBookmarked } : r
    ));
    toast({ title: 'Sauvegardé', description: 'Ressource ajoutée à vos favoris.' });
  };

  const handleUpload = async () => {
    if (!newResource.title || !newResource.url) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs requis.', variant: 'destructive' });
      return;
    }

    const resource: Resource = {
      id: Date.now().toString(),
      title: newResource.title,
      description: newResource.description,
      type: newResource.type,
      url: newResource.url,
      tags: newResource.tags.split(',').map(t => t.trim()).filter(Boolean),
      authorId: 'current-user',
      authorName: 'Vous',
      likes: 0,
      downloads: 0,
      views: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
      isBookmarked: false,
      isLiked: false
    };

    setResources(prev => [resource, ...prev]);
    setShowUploadDialog(false);
    setNewResource({ title: '', description: '', type: 'document', url: '', tags: '' });
    toast({ title: 'Succès !', description: 'Votre ressource a été partagée.' });
  };

  const filteredResources = resources
    .filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'all' || r.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular': return b.likes - a.likes;
        case 'downloads': return b.downloads - a.downloads;
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Share2 className="h-6 w-6 text-primary" />
            Partage de Ressources
          </h2>
          <p className="text-muted-foreground">
            Partagez et découvrez des ressources avec la communauté
          </p>
        </div>

        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Partager une ressource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Partager une ressource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Titre *</label>
                <Input
                  placeholder="Titre de la ressource"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Décrivez votre ressource..."
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={newResource.type}
                  onValueChange={(value) => setNewResource({ ...newResource, type: value as Resource['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="spreadsheet">Tableur</SelectItem>
                    <SelectItem value="presentation">Présentation</SelectItem>
                    <SelectItem value="link">Lien externe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">URL / Lien *</label>
                <Input
                  placeholder="https://..."
                  value={newResource.url}
                  onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tags (séparés par virgule)</label>
                <Input
                  placeholder="cardiologie, fiches, EDN"
                  value={newResource.tags}
                  onChange={(e) => setNewResource({ ...newResource, tags: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleUpload}>
                <Upload className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des ressources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="spreadsheet">Tableurs</SelectItem>
            <SelectItem value="link">Liens</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Plus récents</SelectItem>
            <SelectItem value="popular">Plus populaires</SelectItem>
            <SelectItem value="downloads">Plus téléchargés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredResources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune ressource trouvée</p>
            <Button variant="outline" className="mt-4" onClick={() => setShowUploadDialog(true)}>
              Soyez le premier à partager !
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(resource.type)}
                    <CardTitle className="text-base line-clamp-1">{resource.title}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleBookmark(resource.id)}
                  >
                    <Bookmark className={`h-4 w-4 ${resource.isBookmarked ? 'fill-primary text-primary' : ''}`} />
                  </Button>
                </div>
                <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {resource.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {resource.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{resource.tags.length - 3}</Badge>
                  )}
                </div>

                {/* Author & Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">{resource.authorName[0]}</AvatarFallback>
                  </Avatar>
                  <span>{resource.authorName}</span>
                  <span>•</span>
                  <span>{formatDate(resource.createdAt)}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <button
                    className={`flex items-center gap-1 transition-colors ${resource.isLiked ? 'text-destructive' : 'hover:text-destructive'}`}
                    onClick={() => handleLike(resource.id)}
                  >
                    <Heart className={`h-4 w-4 ${resource.isLiked ? 'fill-current' : ''}`} />
                    {resource.likes}
                  </button>
                  <span className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    {resource.downloads}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {resource.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {resource.comments}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  {resource.type !== 'link' && (
                    <Button size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-1" />
                      Télécharger
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
