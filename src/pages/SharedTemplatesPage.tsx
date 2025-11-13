import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Globe, 
  Users, 
  Mail, 
  Download,
  Filter,
  Clock
} from 'lucide-react';
import { useState } from 'react';
import { useFilterTemplates } from '@/hooks/useFilterTemplates';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const SharedTemplatesPage = () => {
  const { templates, isLoading } = useFilterTemplates();
  const [searchTerm, setSearchTerm] = useState('');
  const [shareTypeFilter, setShareTypeFilter] = useState<'all' | 'global' | 'team' | 'personal'>('all');

  // Filter templates to show only shared ones
  const sharedTemplates = templates.filter(
    (template) =>
      template.is_shared ||
      template.shared_with_team ||
      (template.shared_with_users && template.shared_with_users.length > 0)
  );

  // Apply search and filters
  const filteredTemplates = sharedTemplates.filter((template) => {
    const matchesSearch =
      searchTerm === '' ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      shareTypeFilter === 'all' ||
      (shareTypeFilter === 'global' && template.is_shared) ||
      (shareTypeFilter === 'team' && template.shared_with_team) ||
      (shareTypeFilter === 'personal' &&
        template.shared_with_users &&
        template.shared_with_users.length > 0);

    return matchesSearch && matchesType;
  });

  const getShareBadges = (template: any) => {
    const badges = [];
    
    if (template.is_shared) {
      badges.push(
        <Badge key="global" variant="secondary" className="gap-1">
          <Globe className="h-3 w-3" />
          Global
        </Badge>
      );
    }
    
    if (template.shared_with_team) {
      badges.push(
        <Badge key="team" variant="secondary" className="gap-1">
          <Users className="h-3 w-3" />
          Équipe
        </Badge>
      );
    }
    
    if (template.shared_with_users && template.shared_with_users.length > 0) {
      badges.push(
        <Badge key="users" variant="secondary" className="gap-1">
          <Mail className="h-3 w-3" />
          {template.shared_with_users.length} utilisateur{template.shared_with_users.length > 1 ? 's' : ''}
        </Badge>
      );
    }
    
    return badges;
  };

  const getFilterSummary = (filters: any): string => {
    const parts: string[] = [];
    
    if (filters.severity !== 'all') parts.push(`Sévérité: ${filters.severity}`);
    if (filters.type !== 'all') parts.push(`Type: ${filters.type}`);
    if (filters.searchTerm) parts.push(`Recherche: "${filters.searchTerm}"`);
    if (filters.userEmail) parts.push(`Utilisateur: ${filters.userEmail}`);
    if (filters.dateFrom) parts.push(`Du: ${format(new Date(filters.dateFrom), 'P', { locale: fr })}`);
    if (filters.dateTo) parts.push(`Au: ${format(new Date(filters.dateTo), 'P', { locale: fr })}`);
    
    return parts.length > 0 ? parts.join(', ') : 'Aucun filtre';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates partagés</h1>
          <p className="text-muted-foreground mt-2">
            Découvrez les templates de filtres partagés par votre équipe et d'autres utilisateurs
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres de recherche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un template..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Share Type Filter */}
            <Select value={shareTypeFilter} onValueChange={(value: any) => setShareTypeFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Type de partage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="global">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Partage global
                  </div>
                </SelectItem>
                <SelectItem value="team">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Partage d'équipe
                  </div>
                </SelectItem>
                <SelectItem value="personal">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Partagé avec moi
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} trouvé{filteredTemplates.length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      <ScrollArea className="h-[600px]">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Chargement des templates...</p>
              </CardContent>
            </Card>
          ) : filteredTemplates.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Aucun template partagé trouvé{searchTerm && ' pour votre recherche'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Button variant="ghost" size="icon" title="Charger ce template">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  {template.description && (
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Share Type Badges */}
                  <div className="flex flex-wrap gap-2">
                    {getShareBadges(template)}
                  </div>

                  {/* Filter Summary */}
                  <div className="rounded-lg border p-3 bg-muted/50">
                    <p className="text-xs font-medium mb-1">Filtres configurés:</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {getFilterSummary(template.filters)}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      Créé le {format(new Date(template.created_at), 'P', { locale: fr })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
