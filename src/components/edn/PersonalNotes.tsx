import React from 'react';
import { StickyNote, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useEdnNotes } from '@/hooks/useEdnNotes';

interface PersonalNotesProps {
  itemCode: string;
}

export const PersonalNotes: React.FC<PersonalNotesProps> = ({ itemCode }) => {
  const { currentNote, setCurrentNote, isSaving, isLoading } = useEdnNotes(itemCode);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
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
        {isSaving && (
          <Badge variant="outline" className="text-xs gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Sauvegarde...
          </Badge>
        )}
        {!isSaving && currentNote && (
          <Badge variant="secondary" className="text-xs">
            Sauvegardé
          </Badge>
        )}
      </div>
      
      <Textarea
        placeholder="Ajoutez vos notes personnelles sur cet item... (sauvegarde automatique)"
        value={currentNote}
        onChange={(e) => setCurrentNote(e.target.value)}
        className="min-h-[120px] resize-none bg-muted/50 border-muted-foreground/20 focus:border-warning/50"
      />
      
      <p className="text-xs text-muted-foreground">
        💡 Vos notes sont privées et sauvegardées automatiquement
      </p>
    </div>
  );
};
