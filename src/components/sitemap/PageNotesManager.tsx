import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  StickyNote,
  Plus,
  Pin,
  Edit,
  Trash2,
  MoreVertical,
  LogIn,
} from 'lucide-react';
import { usePageNotes, PageNote } from '@/hooks/usePageNotes';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PageNotesManagerProps {
  pagePath?: string;
  pageLabel?: string;
}

export function PageNotesManager({ pagePath, pageLabel }: PageNotesManagerProps) {
  const { notes, loading, isAuthenticated, createNote, updateNote, deleteNote, togglePin } = usePageNotes(pagePath);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<PageNote | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    color: '#3b82f6',
  });

  const colors = [
    { value: '#3b82f6', label: 'Bleu' },
    { value: '#10b981', label: 'Vert' },
    { value: '#f59e0b', label: 'Orange' },
    { value: '#ef4444', label: 'Rouge' },
    { value: '#8b5cf6', label: 'Violet' },
    { value: '#ec4899', label: 'Rose' },
  ];

  const handleSubmit = async () => {
    if (!formData.content.trim()) return;

    if (editingNote) {
      await updateNote(editingNote.id, {
        title: formData.title || undefined,
        content: formData.content,
        color: formData.color,
      });
    } else if (pagePath) {
      await createNote({
        page_path: pagePath,
        title: formData.title || undefined,
        content: formData.content,
        color: formData.color,
      });
    }

    setIsDialogOpen(false);
    setEditingNote(null);
    setFormData({ title: '', content: '', color: '#3b82f6' });
  };

  const handleEdit = (note: PageNote) => {
    setEditingNote(note);
    setFormData({
      title: note.title || '',
      content: note.content,
      color: note.color,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      await deleteNote(id);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <StickyNote className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Notes & Commentaires</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Documentez vos insights sur les pages
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <LogIn className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-2">Authentification requise</p>
              <p className="text-sm">
                Connectez-vous pour créer et gérer des notes sur vos pages favorites.
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <StickyNote className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">
                Notes & Commentaires
                {pageLabel && ` - ${pageLabel}`}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
              </p>
            </div>
          </div>

          {pagePath && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nouvelle note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingNote ? 'Modifier la note' : 'Nouvelle note'}
                  </DialogTitle>
                  <DialogDescription>
                    Documentez vos insights et raisons d'importance
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre (optionnel)</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Point clé, Insight important..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Contenu *</Label>
                    <Textarea
                      id="content"
                      placeholder="Décrivez votre insight, raison d'importance, ou toute information utile..."
                      rows={5}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Couleur</Label>
                    <div className="flex gap-2">
                      {colors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            formData.color === color.value
                              ? 'border-foreground scale-110'
                              : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleSubmit} disabled={!formData.content.trim()}>
                      {editingNote ? 'Mettre à jour' : 'Créer'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Chargement...</p>
        ) : notes.length === 0 ? (
          <div className="text-center py-8">
            <StickyNote className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">Aucune note</p>
            {pagePath && (
              <p className="text-xs text-muted-foreground mt-1">
                Créez votre première note pour documenter cette page
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-lg border-2 transition-all hover:shadow-md"
                style={{ borderColor: note.color + '40', backgroundColor: note.color + '08' }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    {note.title && (
                      <h4 className="font-semibold text-sm mb-1">{note.title}</h4>
                    )}
                    {note.is_pinned && (
                      <Badge className="mb-2 gap-1" variant="secondary">
                        <Pin className="h-3 w-3" />
                        Épinglé
                      </Badge>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => togglePin(note.id, note.is_pinned)}>
                        <Pin className="h-4 w-4 mr-2" />
                        {note.is_pinned ? 'Désépingler' : 'Épingler'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(note)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(note.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-sm whitespace-pre-wrap">{note.content}</p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: note.color }}
                  />
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(note.updated_at), 'PPp', { locale: fr })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
