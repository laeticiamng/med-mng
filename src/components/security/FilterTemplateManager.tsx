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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Copy
} from 'lucide-react';
import { useFilterTemplates } from '@/hooks/useFilterTemplates';
import type { NotificationFilters } from './SecurityNotificationsFilters';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FilterTemplateManagerProps {
  currentFilters: NotificationFilters;
  onLoadTemplate: (filters: NotificationFilters) => void;
}

export const FilterTemplateManager = ({
  currentFilters,
  onLoadTemplate,
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

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  
  // Share dialog state
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

    // Reset form
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

    // Reset and close
    setShareDialogOpen(false);
    setSelectedTemplate(null);
    setUserEmails('');
  };

  const getFilterSummary = (filters: NotificationFilters): string => {
    const parts: string[] = [];
    
    if (filters.severity !== 'all') parts.push(`Sévérité: ${filters.severity}`);
    if (filters.type !== 'all') parts.push(`Type: ${filters.type}`);
    if (filters.searchTerm) parts.push(`Recherche: "${filters.searchTerm}"`);
    if (filters.userEmail) parts.push(`Utilisateur: ${filters.userEmail}`);
    if (filters.dateFrom) parts.push(`Du: ${filters.dateFrom.toLocaleDateString()}`);
    if (filters.dateTo) parts.push(`Au: ${filters.dateTo.toLocaleDateString()}`);
    
    return parts.length > 0 ? parts.join(', ') : 'Aucun filtre';
  };

  return (
    <div className="flex gap-2">
      {/* Save current filters */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder les filtres
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sauvegarder comme template</DialogTitle>
            <DialogDescription>
              Créez un template pour réutiliser rapidement cette combinaison de filtres
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du template *</Label>
              <Input
                id="name"
                placeholder="Ex: Alertes critiques du mois"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                placeholder="Décrivez l'utilité de ce template..."
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="default">Template par défaut</Label>
                <p className="text-sm text-muted-foreground">
                  Charger automatiquement ce template au démarrage
                </p>
              </div>
              <Switch
                id="default"
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
            </div>
            <div className="rounded-lg border p-3 bg-muted/50">
              <p className="text-sm font-medium mb-2">Filtres actuels :</p>
              <p className="text-xs text-muted-foreground">
                {getFilterSummary(currentFilters)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={!templateName.trim() || isCreating}
            >
              {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load templates dropdown */}
      {templates.length > 0 && (
        <Select onValueChange={(value) => {
          const template = templates.find(t => t.id === value);
          if (template) {
            onLoadTemplate(template.filters);
          }
        }}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Charger un template" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="max-h-[300px]">
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2 w-full">
                    {template.is_default && (
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    )}
                    <span className="flex-1">{template.name}</span>
                  </div>
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      )}

      {/* Manage templates dialog */}
      {templates.length > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              Gérer ({templates.length})
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Mes templates de filtres</DialogTitle>
              <DialogDescription>
                Gérez vos templates sauvegardés
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-medium">{template.name}</h4>
                        {template.is_default && (
                          <Badge variant="secondary" className="text-xs">
                            Par défaut
                          </Badge>
                        )}
                      </div>
                      
                      {/* Share Status Badges */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {template.is_shared && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Globe className="h-3 w-3" />
                            Global
                          </Badge>
                        )}
                        {template.shared_with_team && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Users className="h-3 w-3" />
                            Équipe
                          </Badge>
                        )}
                        {template.shared_with_users && template.shared_with_users.length > 0 && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Mail className="h-3 w-3" />
                            {template.shared_with_users.length} utilisateur{template.shared_with_users.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      
                      {template.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {template.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {getFilterSummary(template.filters)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Créé le {new Date(template.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSetDefault(template.id, template.is_default)}
                        title={template.is_default ? "Retirer comme défaut" : "Définir comme défaut"}
                      >
                        {template.is_default ? (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => duplicateTemplate(template.id)}
                        disabled={isDuplicating}
                        title="Dupliquer ce template"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenShareDialog(template)}
                        title="Partager ce template"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTemplate(template.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}

      {/* Share template dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partager le template</DialogTitle>
            <DialogDescription>
              Définissez qui peut accéder à ce template de filtres
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Global sharing toggle */}
            <div className="flex items-start justify-between space-x-4">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label htmlFor="global-share" className="text-base">
                    Partage global
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Rendre ce template accessible à tous les utilisateurs
                  </p>
                </div>
              </div>
              <Switch
                id="global-share"
                checked={isSharedGlobally}
                onCheckedChange={setIsSharedGlobally}
              />
            </div>

            {/* Team sharing toggle */}
            <div className="flex items-start justify-between space-x-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label htmlFor="team-share" className="text-base">
                    Partage d'équipe
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Partager avec tous les membres de votre équipe
                  </p>
                </div>
              </div>
              <Switch
                id="team-share"
                checked={isSharedWithTeam}
                onCheckedChange={setIsSharedWithTeam}
              />
            </div>

            {/* Specific users */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="user-emails" className="text-base">
                  Utilisateurs spécifiques
                </Label>
              </div>
              <Textarea
                id="user-emails"
                placeholder="email1@example.com, email2@example.com"
                value={userEmails}
                onChange={(e) => setUserEmails(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Entrez les emails séparés par des virgules pour partager avec des utilisateurs spécifiques
              </p>
            </div>

            {/* Info box */}
            <div className="rounded-lg border p-3 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Astuce:</strong> Vous pouvez combiner plusieurs options de partage. 
                Les utilisateurs spécifiés auront accès même si le partage global n'est pas activé.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShareDialogOpen(false)}
              disabled={isSharing}
            >
              Annuler
            </Button>
            <Button
              onClick={handleShareTemplate}
              disabled={isSharing}
            >
              {isSharing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Partager
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
