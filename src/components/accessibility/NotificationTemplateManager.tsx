import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Eye, Code, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface NotificationTemplate {
  id: string;
  name: string;
  platform: 'slack' | 'discord' | 'both';
  template_content: string;
  is_default: boolean;
  variables: string[];
  created_at: string;
  updated_at: string;
}

const AVAILABLE_VARIABLES = [
  { key: 'test_name', description: 'Nom du test A/B' },
  { key: 'winner_name', description: 'Nom du template gagnant' },
  { key: 'open_rate_a', description: 'Taux d\'ouverture template A' },
  { key: 'open_rate_b', description: 'Taux d\'ouverture template B' },
  { key: 'total_opened_a', description: 'Nombre d\'ouvertures template A' },
  { key: 'total_opened_b', description: 'Nombre d\'ouvertures template B' },
  { key: 'total_sent_a', description: 'Nombre d\'envois template A' },
  { key: 'total_sent_b', description: 'Nombre d\'envois template B' },
  { key: 'start_date', description: 'Date de début du test' },
  { key: 'end_date', description: 'Date de fin du test' },
];

const EXAMPLE_DATA = {
  test_name: 'Test Email Bienvenue',
  winner_name: 'Template A - Version moderne',
  open_rate_a: '45.2',
  open_rate_b: '38.7',
  total_opened_a: '452',
  total_opened_b: '387',
  total_sent_a: '1000',
  total_sent_b: '1000',
  start_date: '2025-11-01',
  end_date: '2025-11-07',
};

export function NotificationTemplateManager() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    platform: 'both' as 'slack' | 'discord' | 'both',
    template_content: '',
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { _data, _error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (_error) throw _error;
      
      // Cast the data to match our interface
      const typedData = (_data || []).map(item => ({
        ...item,
        platform: item.platform as 'slack' | 'discord' | 'both',
        variables: Array.isArray(item.variables) ? item.variables as string[] : []
      }));
      
      setTemplates(typedData);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Erreur lors du chargement des templates');
    } finally {
      setLoading(false);
    }
  };

  const extractVariables = (content: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = content.matchAll(regex);
    return [...new Set(Array.from(matches, m => m[1]))];
  };

  const replaceVariables = (content: string, data: Record<string, string>): string => {
    let result = content;
    Object.entries(data).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });
    return result;
  };

  const handleSaveTemplate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const variables = extractVariables(formData.template_content);

      const payload = {
        user_id: user.id,
        name: formData.name,
        platform: formData.platform,
        template_content: formData.template_content,
        variables,
        is_default: templates.length === 0,
      };

      if (selectedTemplate) {
        const { _error } = await supabase
          .from('notification_templates')
          .update(payload)
          .eq('id', selectedTemplate.id);

        if (_error) throw _error;
        toast.success('Template mis à jour avec succès');
      } else {
        const { _error } = await supabase
          .from('notification_templates')
          .insert(payload);

        if (_error) throw _error;
        toast.success('Template créé avec succès');
      }

      setDialogOpen(false);
      resetForm();
      loadTemplates();
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      const { _error } = await supabase
        .from('notification_templates')
        .delete()
        .eq('id', templateToDelete);

      if (_error) throw _error;

      toast.success('Template supprimé avec succès');
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      platform: 'both',
      template_content: '',
    });
    setSelectedTemplate(null);
  };

  const openEditDialog = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      platform: template.platform,
      template_content: template.template_content,
    });
    setDialogOpen(true);
  };

  const openPreview = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Templates de Notifications
            </CardTitle>
            <CardDescription>
              Créez des templates personnalisés avec variables dynamiques pour vos notifications
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedTemplate ? 'Modifier le template' : 'Créer un nouveau template'}
                </DialogTitle>
                <DialogDescription>
                  Utilisez des variables entre doubles accolades: {'{'}{'{'} variable {'}'}{'}'} 
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du template</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Notification test A/B terminé"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform">Plateforme</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value: 'slack' | 'discord' | 'both') =>
                      setFormData({ ...formData, platform: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Slack & Discord</SelectItem>
                      <SelectItem value="slack">Slack uniquement</SelectItem>
                      <SelectItem value="discord">Discord uniquement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Contenu du template</Label>
                  <Textarea
                    id="content"
                    placeholder="Entrez votre message avec des variables..."
                    value={formData.template_content}
                    onChange={(e) => setFormData({ ...formData, template_content: e.target.value })}
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    Variables détectées: {extractVariables(formData.template_content).length > 0 
                      ? extractVariables(formData.template_content).join(', ')
                      : 'Aucune'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Variables disponibles</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_VARIABLES.map((variable) => (
                      <div key={variable.key} className="flex items-start gap-2 text-sm">
                        <Code className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {'{'}{'{'}{variable.key}{'}'}{'}'} 
                          </code>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {variable.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}>
                  Annuler
                </Button>
                <Button onClick={handleSaveTemplate} disabled={!formData.name || !formData.template_content}>
                  {selectedTemplate ? 'Mettre à jour' : 'Créer'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun template créé</p>
            <p className="text-sm">Créez votre premier template personnalisé</p>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        {template.is_default && (
                          <Badge variant="secondary">Par défaut</Badge>
                        )}
                        <Badge variant="outline">
                          {template.platform === 'both' ? 'Slack & Discord' 
                            : template.platform === 'slack' ? 'Slack'
                            : 'Discord'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.template_content}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((variable) => (
                          <Badge key={variable} variant="outline" className="text-xs">
                            {'{'}{'{'}{variable}{'}'}{'}'} 
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openPreview(template)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(template)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setTemplateToDelete(template.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aperçu du template</DialogTitle>
            <DialogDescription>
              Aperçu avec des données d'exemple
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Message formaté:</h4>
                <pre className="whitespace-pre-wrap text-sm">
                  {replaceVariables(selectedTemplate.template_content, EXAMPLE_DATA)}
                </pre>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Template brut:</h4>
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {selectedTemplate.template_content}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce template ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTemplateToDelete(null)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
