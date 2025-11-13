import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Trash2, 
  Star, 
  StarOff,
  Loader2,
  Share2,
  Users,
  Globe,
  Mail,
  Copy,
  MessageSquare
} from 'lucide-react';
import { useFilterTemplates } from '@/hooks/useFilterTemplates';
import { useTemplateFavorites } from '@/hooks/useTemplateFavorites';
import { useTemplateHistory } from '@/hooks/useTemplateHistory';
import type { NotificationFilters } from './SecurityNotificationsFilters';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateComments } from './TemplateComments';
import { TemplateHistory } from './TemplateHistory';

interface FilterTemplateManagerProps {
  currentFilters: NotificationFilters;
  onLoadTemplate: (filters: NotificationFilters) => void;
  resultsCount?: number;
}

export const FilterTemplateManager = ({
  currentFilters,
  onLoadTemplate,
  resultsCount,
}: FilterTemplateManagerProps) => {
  const {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    shareTemplate,
    duplicateTemplate,
    isCreating,
    isDeleting,
    isSharing,
    isDuplicating,
  } = useFilterTemplates();

  const {
    isFavorite,
    toggleFavorite,
    isToggling,
  } = useTemplateFavorites();

  const { recordApplication } = useTemplateHistory();

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  
  const [isSharedGlobally, setIsSharedGlobally] = useState(false);
  const [isSharedWithTeam, setIsSharedWithTeam] = useState(false);
  const [userEmails, setUserEmails] = useState('');

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;

    createTemplate({
      name: templateName,
      description: templateDescription || null,
      filters: currentFilters,
      is_default: isDefault,
      is_shared: false,
      shared_with_team: false,
      shared_with_users: [],
    });

    setTemplateName('');
    setTemplateDescription('');
    setIsDefault(false);
    setSaveDialogOpen(false);
  };

  const handleSetDefault = (templateId: string, currentDefault: boolean) => {
    updateTemplate({
      id: templateId,
      is_default: !currentDefault,
    });
  };

  const handleOpenShareDialog = (template: any) => {
    setSelectedTemplate(template.id);
    setIsSharedGlobally(template.is_shared || false);
    setIsSharedWithTeam(template.shared_with_team || false);
    setUserEmails('');
    setShareDialogOpen(true);
  };

  const handleShareTemplate = () => {
    if (!selectedTemplate) return;

    const emails = userEmails
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    shareTemplate({
      id: selectedTemplate,
      isShared: isSharedGlobally,
      sharedWithTeam: isSharedWithTeam,
      userEmails: emails.length > 0 ? emails : undefined,
    });

    setShareDialogOpen(false);
    setSelectedTemplate(null);
    setUserEmails('');
  };

  const handleLoadTemplate = (template: any) => {
    onLoadTemplate(template.filters);
    recordApplication({
      templateId: template.id,
      filters: template.filters,
      resultsCount: resultsCount,
    });
  };

  const getFilterSummary = (filters: NotificationFilters): string => {
    const parts: string[] = [];
    
    if (filters.severity !== 'all') parts.push(`Sévérité: ${filters.severity}`);
    if (filters.type !== 'all') parts.push(`Type: ${filters.type}`);
    if (filters.searchTerm) parts.push(`Recherche: "${filters.searchTerm}"`);
    if (filters.dateFrom || filters.dateTo) parts.push('Plage de dates définie');
    if (filters.userEmail) parts.push(`Email: ${filters.userEmail}`);
    
    return parts.length > 0 ? parts.join(' • ') : 'Aucun filtre actif';
  };

  const filteredTemplates = showOnlyFavorites
    ? templates.filter(t => isFavorite(t.id))
    : templates;

  return (
    <div className="space-y-4">
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder les filtres
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sauvegarder le template de filtres</DialogTitle>
            <DialogDescription>
              Créez un nouveau template pour réutiliser ces filtres facilement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du template *</Label>
              <Input
                id="name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Ex: Notifications critiques du mois"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Décrivez l'utilisation de ce template..."
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="default"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-input"
              />
              <Label htmlFor="default" className="cursor-pointer">
                Définir comme template par défaut
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveTemplate} disabled={isCreating || !templateName.trim()}>
              {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <Label>Templates sauvegardés</Label>
          <Button
            variant={showOnlyFavorites ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          >
            <Star className={`w-4 h-4 mr-1 ${showOnlyFavorites ? 'fill-current' : ''}`} />
            Favoris
          </Button>
        </div>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {showOnlyFavorites ? 'Aucun template favori' : 'Aucun template sauvegardé'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-medium">{template.name}</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 shrink-0"
                          onClick={() => toggleFavorite(template.id)}
                          disabled={isToggling}
                        >
                          {isFavorite(template.id) ? (
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <StarOff className="w-4 h-4" />
                          )}
                        </Button>
                        {template.is_default && (
                          <Badge variant="secondary" className="text-xs">Par défaut</Badge>
                        )}
                        {template.is_shared && (
                          <Badge variant="outline" className="text-xs"><Globe className="w-3 h-3 mr-1" />Global</Badge>
                        )}
                        {template.shared_with_team && (
                          <Badge variant="outline" className="text-xs"><Users className="w-3 h-3 mr-1" />Équipe</Badge>
                        )}
                        {template.shared_with_users?.length > 0 && (
                          <Badge variant="outline" className="text-xs"><Mail className="w-3 h-3 mr-1" />{template.shared_with_users.length}</Badge>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{template.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{getFilterSummary(template.filters)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => handleLoadTemplate(template)} className="h-8">Charger</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setSelectedTemplate(template.id); setDetailsDialogOpen(true); }} className="h-8"><MessageSquare className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleSetDefault(template.id, template.is_default)} className="h-8">{template.is_default ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenShareDialog(template)} className="h-8"><Share2 className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => duplicateTemplate(template.id)} disabled={isDuplicating} className="h-8"><Copy className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteTemplate(template.id)} disabled={isDeleting} className="h-8 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partager le template</DialogTitle>
            <DialogDescription>
              Choisissez comment partager ce template avec d'autres utilisateurs
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Partage global</Label>
                <p className="text-sm text-muted-foreground">Visible par tous</p>
              </div>
              <Switch checked={isSharedGlobally} onCheckedChange={setIsSharedGlobally} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Partage d'équipe</Label>
                <p className="text-sm text-muted-foreground">Visible par votre équipe</p>
              </div>
              <Switch checked={isSharedWithTeam} onCheckedChange={setIsSharedWithTeam} />
            </div>
            <div className="space-y-2">
              <Label>Utilisateurs spécifiques</Label>
              <Textarea value={userEmails} onChange={(e) => setUserEmails(e.target.value)} placeholder="email1@example.com, email2@example.com" rows={3} />
              <p className="text-xs text-muted-foreground">Séparez les emails par des virgules</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleShareTemplate} disabled={isSharing}>
              {isSharing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Partager
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Détails du template</DialogTitle>
            <DialogDescription>Commentaires, notes et historique</DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <Tabs defaultValue="comments">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="comments">Commentaires & Notes</TabsTrigger>
                <TabsTrigger value="history">Historique</TabsTrigger>
              </TabsList>
              <TabsContent value="comments">
                <ScrollArea className="h-[400px] pr-4">
                  <TemplateComments templateId={selectedTemplate} />
                </ScrollArea>
              </TabsContent>
              <TabsContent value="history">
                <ScrollArea className="h-[400px] pr-4">
                  <TemplateHistory templateId={selectedTemplate} />
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
