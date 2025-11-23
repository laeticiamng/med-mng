import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Save,
  Plus,
  Trash2,
  Star,
  FileText,
  AlertCircle,
  Wand2,
  Copy
} from 'lucide-react';
import logger from '@/lib/logger';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmailPreview } from './EmailPreview';

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject_template: string;
  html_template: string;
  variables: string[];
  is_default: boolean;
  preview_data: Record<string, any>;
}

interface TemplateEditorProps {
  onTemplateSelect?: (template: EmailTemplate) => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ onTemplateSelect }) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject_template: '',
    html_template: '',
    preview_data: {} as Record<string, any>
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      setFormData({
        name: selectedTemplate.name,
        description: selectedTemplate.description || '',
        subject_template: selectedTemplate.subject_template,
        html_template: selectedTemplate.html_template,
        preview_data: selectedTemplate.preview_data || {}
      });
    }
  }, [selectedTemplate]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('email_templates')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedData = (data || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        description: d.description || '',
        subject_template: d.subject_template || '',
        html_template: d.html_template || '',
        variables: Array.isArray(d.variables) ? d.variables : [],
        is_default: d.is_default || false,
        preview_data: typeof d.preview_data === 'object' && d.preview_data ? d.preview_data : {}
      }));

      setTemplates(typedData as EmailTemplate[]);
      if (typedData && typedData.length > 0) {
        setSelectedTemplate(typedData[0] as EmailTemplate);
      }
    } catch (error) {
      logger.error('Error loading templates:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les templates',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    if (!formData.name || !formData.subject_template || !formData.html_template) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      // Extraire les variables du template
      const variables = extractVariables(formData.subject_template + formData.html_template);

      if (selectedTemplate && editMode) {
        // Mise à jour
        const { error } = await (supabase as any)
          .from('email_templates')
          .update({
            name: formData.name,
            description: formData.description || '',
            subject_template: formData.subject_template,
            html_template: formData.html_template,
            variables: variables as any,
            preview_data: formData.preview_data as any
          })
          .eq('id', selectedTemplate.id);

        if (error) throw error;

        toast({
          title: 'Template mis à jour',
          description: 'Le template a été enregistré avec succès',
        });
      } else {
        // Création
        const { error } = await (supabase as any)
          .from('email_templates')
          .insert({
            name: formData.name,
            description: formData.description || '',
            subject_template: formData.subject_template,
            html_template: formData.html_template,
            variables: variables as any,
            preview_data: formData.preview_data as any,
            is_default: false
          });

        if (error) throw error;

        toast({
          title: 'Template créé',
          description: 'Le nouveau template a été créé avec succès',
        });
      }

      setEditMode(false);
      await loadTemplates();
    } catch (error) {
      logger.error('Error saving template:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le template',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return;

    try {
      const { error } = await (supabase as any)
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Template supprimé',
        description: 'Le template a été supprimé avec succès',
      });

      await loadTemplates();
    } catch (error) {
      logger.error('Error deleting template:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le template',
        variant: 'destructive'
      });
    }
  };

  const extractVariables = (text: string): string[] => {
    const regex = /{{(\w+)}}/g;
    const matches = text.matchAll(regex);
    return Array.from(new Set(Array.from(matches, m => m[1])));
  };

  const createNewTemplate = () => {
    setSelectedTemplate(null);
    setEditMode(true);
    setFormData({
      name: 'Nouveau Template',
      description: '',
      subject_template: '📊 Rapport Accessibilité - {{conformityRate}}% de conformité',
      html_template: generateDefaultTemplate(),
      preview_data: {
        conformityRate: 85.5,
        totalPRs: 50,
        passedPRs: 42,
        blockedPRsCount: 3
      }
    });
  };

  const generateDefaultTemplate = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: white; border-radius: 8px; padding: 30px;">
    <h1 style="color: #1e293b; margin-bottom: 20px;">📊 Rapport d'Accessibilité</h1>
    
    <div style="background: linear-gradient(135deg, #22c55e15, #22c55e05); border-left: 4px solid #22c55e; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h2 style="margin: 0 0 10px 0;">Taux de Conformité</h2>
      <div style="font-size: 48px; font-weight: bold; color: #22c55e;">{{conformityRate}}%</div>
    </div>

    <div style="margin: 20px 0;">
      <p><strong>PRs Totales:</strong> {{totalPRs}}</p>
      <p><strong>PRs Conformes:</strong> {{passedPRs}}</p>
      <p><strong>PRs Bloquées:</strong> {{blockedPRsCount}}</p>
    </div>
  </div>
</body>
</html>`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Éditeur de Templates
              </CardTitle>
              <CardDescription>
                Créez et personnalisez vos templates d'emails
              </CardDescription>
            </div>
            <Button onClick={createNewTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Template
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sélecteur de template */}
          <div className="space-y-2">
            <Label>Template actuel</Label>
            <div className="flex gap-2">
              <Select
                value={selectedTemplate?.id}
                onValueChange={(value) => {
                  const template = templates.find(t => t.id === value);
                  setSelectedTemplate(template || null);
                  setEditMode(false);
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sélectionner un template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        {template.is_default && <Star className="h-3 w-3 text-yellow-500" />}
                        <span>{template.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplate && !editMode && (
                <>
                  <Button variant="outline" onClick={() => setEditMode(true)}>
                    Modifier
                  </Button>
                  {!selectedTemplate.is_default && (
                    <Button
                      variant="outline"
                      onClick={() => deleteTemplate(selectedTemplate.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Formulaire d'édition */}
          {editMode && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du template *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Rapport Mensuel Premium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du template"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Sujet de l'email *</Label>
                <Input
                  id="subject"
                  value={formData.subject_template}
                  onChange={(e) => setFormData({ ...formData, subject_template: e.target.value })}
                  placeholder="Ex: 📊 Rapport - {{conformityRate}}%"
                />
                <p className="text-xs text-muted-foreground">
                  Utilisez {`{{variable}}`} pour insérer des variables dynamiques
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="html">Contenu HTML *</Label>
                <Textarea
                  id="html"
                  value={formData.html_template}
                  onChange={(e) => setFormData({ ...formData, html_template: e.target.value })}
                  rows={15}
                  className="font-mono text-sm"
                  placeholder="<html>...</html>"
                />
              </div>

              <Alert>
                <Wand2 className="h-4 w-4" />
                <AlertDescription>
                  Variables disponibles: conformityRate, totalPRs, passedPRs, failedPRs, blockedPRsCount, avgFixTime
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button onClick={saveTemplate} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prévisualisation */}
      {selectedTemplate && !editMode && (
        <EmailPreview
          htmlContent={selectedTemplate.html_template}
          subject={selectedTemplate.subject_template}
          variables={selectedTemplate.preview_data}
        />
      )}

      {editMode && (
        <EmailPreview
          htmlContent={formData.html_template}
          subject={formData.subject_template}
          variables={formData.preview_data}
        />
      )}
    </div>
  );
};
