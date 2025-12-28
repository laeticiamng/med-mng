import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

interface EdnNote {
  id: string;
  item_code: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const useEdnNotes = (itemCode?: string) => {
  const [notes, setNotes] = useState<Record<string, EdnNote>>({});
  const [currentNote, setCurrentNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const debouncedNote = useDebounce(currentNote, 1000);

  // Fetch all notes or specific note
  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('user_edn_notes')
        .select('*')
        .eq('user_id', user.id);

      if (itemCode) {
        query = query.eq('item_code', itemCode);
      }

      const { data, error } = await query;
      if (error) throw error;

      const notesMap: Record<string, EdnNote> = {};
      data?.forEach(note => {
        notesMap[note.item_code] = note;
      });
      setNotes(notesMap);

      if (itemCode && notesMap[itemCode]) {
        setCurrentNote(notesMap[itemCode].content);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [itemCode]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Auto-save when note changes
  useEffect(() => {
    if (!itemCode || debouncedNote === notes[itemCode]?.content) return;
    
    const saveNote = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setIsSaving(true);

        if (debouncedNote.trim() === '') {
          // Delete note if empty
          if (notes[itemCode]) {
            await supabase
              .from('user_edn_notes')
              .delete()
              .eq('user_id', user.id)
              .eq('item_code', itemCode);

            setNotes(prev => {
              const updated = { ...prev };
              delete updated[itemCode];
              return updated;
            });
          }
        } else {
          // Upsert note
          const { data, error } = await supabase
            .from('user_edn_notes')
            .upsert({
              user_id: user.id,
              item_code: itemCode,
              content: debouncedNote,
            }, {
              onConflict: 'user_id,item_code'
            })
            .select()
            .single();

          if (error) throw error;

          setNotes(prev => ({
            ...prev,
            [itemCode]: data
          }));
        }
      } catch (error) {
        console.error('Error saving note:', error);
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder la note",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    };

    saveNote();
  }, [debouncedNote, itemCode, notes, toast]);

  const getNote = useCallback((code: string) => {
    return notes[code]?.content || '';
  }, [notes]);

  const hasNote = useCallback((code: string) => {
    return !!notes[code];
  }, [notes]);

  return {
    notes,
    currentNote,
    setCurrentNote,
    isLoading,
    isSaving,
    getNote,
    hasNote,
    refreshNotes: fetchNotes,
  };
};
