import React, { useState, useRef, useCallback, useEffect } from 'react';
import { StickyNote, Loader2, Bold, Italic, List, Hash, Eye, Edit2, Download, CloudOff, Check } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEdnNotes, type EtatNote } from '@/hooks/useEdnNotes';
import { ROUTE_PATHS } from '@/config/routes';
import { exportToPDF } from '@/utils/exportUtils';
import { toast } from 'sonner';

interface PersonalNotesProps {
  itemCode: string;
}

// Simple markdown renderer
const renderMarkdown = (text: string) => {
  if (!text) return null;
  
  return text.split('\n').map((line, i) => {
    // Headers
    if (line.startsWith('### ')) return <h4 key={i} className="font-bold text-sm mt-2">{line.slice(4)}</h4>;
    if (line.startsWith('## ')) return <h3 key={i} className="font-bold text-base mt-3">{line.slice(3)}</h3>;
    if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-3">{line.slice(2)}</h2>;
    
    // Lists
    if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>;
    if (line.match(/^\d+\. /)) return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\. /, ''))}</li>;
    
    // Empty lines
    if (!line.trim()) return <br key={i} />;
    
    // Regular paragraphs
    return <p key={i} className="text-sm">{formatInline(line)}</p>;
  });
};

// Format inline: **bold**, *italic*, `code`
const formatInline = (text: string) => {
  const parts = [];
  let remaining = text;
  let key = 0;
  
  while (remaining) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) parts.push(remaining.slice(0, boldMatch.index));
      parts.push(<strong key={key++} className="font-bold">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      continue;
    }
    
    // Italic
    const italicMatch = remaining.match(/\*(.+?)\*/);
    if (italicMatch && italicMatch.index !== undefined) {
      if (italicMatch.index > 0) parts.push(remaining.slice(0, italicMatch.index));
      parts.push(<em key={key++} className="italic">{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
      continue;
    }
    
    // Code
    const codeMatch = remaining.match(/`(.+?)`/);
    if (codeMatch && codeMatch.index !== undefined) {
      if (codeMatch.index > 0) parts.push(remaining.slice(0, codeMatch.index));
      parts.push(<code key={key++} className="bg-muted px-1 rounded text-xs font-mono">{codeMatch[1]}</code>);
      remaining = remaining.slice(codeMatch.index + codeMatch[0].length);
      continue;
    }
    
    parts.push(remaining);
    break;
  }
  
  return parts.length > 0 ? parts : text;
};

/** État réel de la note : « Enregistrée » seulement après confirmation du serveur. */
function BadgeEtatNote({ etat, visible }: { etat: EtatNote; visible: boolean }) {
  if (!visible || etat === 'chargement' || etat === 'non_connecte' || etat === 'lecture_impossible') return null;
  if (etat === 'modifiee' || etat === 'enregistrement') {
    return (
      <Badge variant="outline" className="text-xs gap-1" role="status">
        <Loader2 className="h-3 w-3 animate-spin" />
        Enregistrement…
      </Badge>
    );
  }
  if (etat === 'en_attente') {
    return (
      <Badge
        variant="outline"
        className="text-xs gap-1 border-warning/50 text-warning"
        role="status"
        title="Connexion impossible : la note est gardée sur cet appareil et sera envoyée automatiquement au retour du réseau."
      >
        <CloudOff className="h-3 w-3" />
        Non enregistrée — gardée sur cet appareil
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-xs gap-1" role="status">
      <Check className="h-3 w-3" />
      Enregistrée
    </Badge>
  );
}

export const PersonalNotes: React.FC<PersonalNotesProps> = ({ itemCode }) => {
  const { currentNote, setCurrentNote, isLoading, etat } = useEdnNotes(itemCode);
  const location = useLocation();
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isExporting, setIsExporting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Insert markdown at cursor position
  const insertMarkdownAtCursor = useCallback((prefix: string, suffix: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setCurrentNote(currentNote + prefix + placeholder + suffix);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentNote.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newText = 
      currentNote.substring(0, start) + 
      prefix + textToInsert + suffix + 
      currentNote.substring(end);
    
    setCurrentNote(newText);
    
    // Set cursor position after insert
    setTimeout(() => {
      const newPosition = start + prefix.length + textToInsert.length + suffix.length;
      textarea.focus();
      textarea.setSelectionRange(
        selectedText ? newPosition : start + prefix.length,
        selectedText ? newPosition : start + prefix.length + placeholder.length
      );
    }, 0);
  }, [currentNote, setCurrentNote]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!textareaRef.current || document.activeElement !== textareaRef.current) return;
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            insertMarkdownAtCursor('**', '**', 'texte gras');
            break;
          case 'i':
            e.preventDefault();
            insertMarkdownAtCursor('*', '*', 'texte italique');
            break;
          case 'l':
            e.preventDefault();
            insertMarkdownAtCursor('\n- ', '', 'élément');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [insertMarkdownAtCursor]);

  // Export to PDF
  const handleExportPDF = async () => {
    if (!currentNote.trim()) {
      toast.error('Aucune note à exporter');
      return;
    }

    setIsExporting(true);
    try {
      await exportToPDF({
        title: `Notes personnelles - ${itemCode}`,
        content: currentNote,
        itemCode,
        _type: 'competences'
      });
      toast.success('Notes exportées en PDF');
    } catch {
      toast.error('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (etat === 'lecture_impossible') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-warning" />
          <span className="text-sm font-medium">Mes notes personnelles</span>
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-2" role="status">
          <CloudOff className="h-4 w-4" />
          Connexion impossible : vos notes s'afficheront automatiquement au retour du réseau.
        </p>
      </div>
    );
  }

  // Visiteur : rien ne peut être enregistré. Avant, l'éditeur s'affichait quand même, avec
  // « Sauvegardé », et la note disparaissait au rechargement.
  if (etat === 'non_connecte') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-warning" />
          <span className="text-sm font-medium">Mes notes personnelles</span>
        </div>
        <p className="text-sm text-muted-foreground">
          <Link
            to={`${ROUTE_PATHS.medMngLogin}?next=${encodeURIComponent(location.pathname)}`}
            className="text-primary underline underline-offset-2 hover:decoration-2"
          >
            Connectez-vous
          </Link>{' '}
          pour écrire vos notes sur cet item : elles sont enregistrées dans votre compte.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-warning" />
          <span className="text-sm font-medium">Mes notes personnelles</span>
        </div>
        <div className="flex items-center gap-2">
          {currentNote && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="h-7 px-2"
              aria-label="Exporter mes notes en PDF"
            >
              {isExporting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Download className="h-3 w-3" />
              )}
            </Button>
          )}
          <BadgeEtatNote etat={etat} visible={Boolean(currentNote) || etat !== 'enregistree'} />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => insertMarkdownAtCursor('**', '**', 'texte')}
          title="Gras (Ctrl+B)"
        >
          <Bold className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => insertMarkdownAtCursor('*', '*', 'texte')}
          title="Italique (Ctrl+I)"
        >
          <Italic className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => insertMarkdownAtCursor('\n- ', '', 'élément')}
          title="Liste (Ctrl+L)"
        >
          <List className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => insertMarkdownAtCursor('\n## ', '', 'Titre')}
          title="Titre"
        >
          <Hash className="h-3 w-3" />
        </Button>
        
        {/* Templates de notes */}
        <div className="border-l border-border ml-1 pl-1 flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setCurrentNote(currentNote + '\n\n## Points clés\n- \n- \n- \n\n## À retenir\n\n## Questions')}
            title="Template Structure"
          >
            📋 Structure
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setCurrentNote(currentNote + '\n\n## Mécanisme\n\n## Indications\n\n## Effets indésirables\n\n## Contre-indications')}
            title="Template Médicament"
          >
            💊 Médicament
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setCurrentNote(currentNote + '\n\n## Définition\n\n## Physiopathologie\n\n## Diagnostic\n\n## Traitement')}
            title="Template Pathologie"
          >
            🏥 Pathologie
          </Button>
        </div>
        
        <div className="flex-1" />
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'edit' | 'preview')} className="h-7">
          <TabsList className="h-7">
            <TabsTrigger value="edit" className="h-6 px-2 text-xs gap-1">
              <Edit2 className="h-3 w-3" />
              Éditer
            </TabsTrigger>
            <TabsTrigger value="preview" className="h-6 px-2 text-xs gap-1">
              <Eye className="h-3 w-3" />
              Aperçu
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewMode === 'edit' ? (
        <Textarea
          ref={textareaRef}
          placeholder="Ajoutez vos notes personnelles sur cet item... (Markdown supporté)"
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          className="min-h-[120px] resize-none bg-muted/50 border-muted-foreground/20 focus:border-warning/50 font-mono text-sm"
        />
      ) : (
        <div className="min-h-[120px] p-3 rounded-md bg-muted/50 border border-muted-foreground/20 overflow-auto">
          {currentNote ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {renderMarkdown(currentNote)}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm italic">Aucune note à afficher</p>
          )}
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        💡 Raccourcis: <kbd className="px-1 bg-muted rounded">Ctrl+B</kbd> gras, <kbd className="px-1 bg-muted rounded">Ctrl+I</kbd> italique, <kbd className="px-1 bg-muted rounded">Ctrl+L</kbd> liste
      </p>
    </div>
  );
};
