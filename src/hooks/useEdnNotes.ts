import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import {
  ecrireBrouillonNote,
  effacerBrouillonNote,
  lireBrouillonNote,
  noteAAfficher,
} from '@/lib/brouillonNote';

interface EdnNote {
  id: string;
  item_code: string;
  content: string;
  created_at: string;
  updated_at: string;
}

/**
 * État de la note de l'item, affiché tel quel (critique finale, 05.10.2026 : l'ancien
 * badge « Sauvegardé » s'affichait dès qu'il y avait du texte, même hors connexion ou
 * pour un visiteur dont rien n'était jamais enregistré).
 * - `chargement`    : lecture de la note en cours ;
 * - `non_connecte`  : visiteur, aucune note possible ;
 * - `modifiee`      : frappe en cours, envoi dans un instant ;
 * - `enregistrement`: envoi au serveur en cours ;
 * - `enregistree`   : le serveur a confirmé (ou rien à enregistrer) ;
 * - `en_attente`    : envoi impossible (réseau) : la note est gardée sur cet appareil
 *                     et renvoyée automatiquement au retour du réseau ;
 * - `lecture_impossible` : la note n'a pas pu être lue (réseau). Pas d'édition : écrire
 *                     sur une note non chargée remplacerait la note du compte au retour du
 *                     réseau. Nouvelle lecture automatique au retour du réseau.
 */
export type EtatNote =
  | 'chargement'
  | 'non_connecte'
  | 'modifiee'
  | 'enregistrement'
  | 'enregistree'
  | 'en_attente'
  | 'lecture_impossible';

export const useEdnNotes = (itemCode?: string) => {
  const [notes, setNotes] = useState<Record<string, EdnNote>>({});
  const [currentNote, setCurrentNoteBrut] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [etat, setEtat] = useState<EtatNote>('chargement');
  const [userId, setUserId] = useState<string | null>(null);
  // Incrémenté au retour du réseau : relance la lecture ou l'envoi en attente.
  const [relance, setRelance] = useState(0);
  const charge = useRef(false);
  // Dernier texte saisi (la valeur « debounced » a jusqu'à 1 s de retard sur la frappe).
  const derniereSaisie = useRef('');
  const { toast } = useToast();

  const debouncedNote = useDebounce(currentNote, 1000);

  // Fetch all notes or specific note
  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      // getSession() lit la session locale (aucun appel réseau) : getUser() échouait hors
      // connexion et la note était alors silencieusement ignorée.
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        setEtat('non_connecte');
        return;
      }

      let query = supabase
        .from('user_edn_notes')
        .select('*')
        .eq('user_id', uid);

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

      if (itemCode) {
        const { texte, enAttente } = noteAAfficher(notesMap[itemCode]?.content ?? '', lireBrouillonNote(uid, itemCode));
        derniereSaisie.current = texte;
        setCurrentNoteBrut(texte);
        if (!enAttente) effacerBrouillonNote(uid, itemCode);
        setEtat(enAttente ? 'modifiee' : 'enregistree');
      }
      charge.current = true;
    } catch {
      // Lecture impossible (réseau) : le brouillon éventuel reste sur l'appareil ; il sera
      // affiché et envoyé après la nouvelle lecture, au retour du réseau.
      setEtat('lecture_impossible');
    } finally {
      setIsLoading(false);
    }
  }, [itemCode]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Retour du réseau : relire si la lecture avait échoué, renvoyer la note en attente.
  useEffect(() => {
    const auRetourDuReseau = () => {
      if (!charge.current) fetchNotes();
      setRelance((n) => n + 1);
    };
    window.addEventListener('online', auRetourDuReseau);
    return () => window.removeEventListener('online', auRetourDuReseau);
  }, [fetchNotes]);

  // Chaque frappe est gardée sur l'appareil jusqu'à confirmation du serveur.
  const setCurrentNote = useCallback((texte: string) => {
    derniereSaisie.current = texte;
    setCurrentNoteBrut(texte);
    if (itemCode && userId) {
      if (texte === (notes[itemCode]?.content ?? '')) {
        // Revenu au texte déjà enregistré : rien à envoyer.
        effacerBrouillonNote(userId, itemCode);
        setEtat('enregistree');
      } else {
        ecrireBrouillonNote(userId, itemCode, texte);
        setEtat('modifiee');
      }
    }
  }, [itemCode, userId, notes]);

  // Auto-save when note changes
  useEffect(() => {
    if (!itemCode || !userId || !charge.current) return;
    // La valeur retardée n'a pas encore rattrapé la saisie (frappe en cours, ou ouverture de
    // l'item : elle vaut '' pendant 1 s). Ne rien envoyer. Avant ce garde-fou, l'ouverture d'un
    // item supprimait la note enregistrée (DELETE) puis la recréait 1 s plus tard : quitter la
    // page dans l'intervalle la perdait définitivement (constaté en production le 05.10.2026).
    if (derniereSaisie.current !== debouncedNote) return;
    const enregistree = notes[itemCode]?.content ?? '';
    // Confirmé par le serveur : on n'efface le brouillon (et on n'annonce « enregistrée »)
    // que si rien n'a été tapé depuis.
    const confirmer = () => {
      if (derniereSaisie.current !== debouncedNote) return;
      if (lireBrouillonNote(userId, itemCode) === debouncedNote) effacerBrouillonNote(userId, itemCode);
      setEtat('enregistree');
    };
    if (debouncedNote === enregistree) {
      effacerBrouillonNote(userId, itemCode);
      setEtat((e) => (e === 'modifiee' || e === 'en_attente' ? 'enregistree' : e));
      return;
    }

    let annule = false;
    const saveNote = async () => {
      try {
        setIsSaving(true);
        setEtat('enregistrement');

        if (debouncedNote.trim() === '') {
          // Delete note if empty
          if (notes[itemCode]) {
            const { error } = await supabase
              .from('user_edn_notes')
              .delete()
              .eq('user_id', userId)
              .eq('item_code', itemCode);
            if (error) throw error;
            if (!annule) confirmer();

            setNotes(prev => {
              const updated = { ...prev };
              delete updated[itemCode];
              return updated;
            });
          } else if (!annule) {
            confirmer();
          }
        } else {
          // Upsert note
          const { data, error } = await supabase
            .from('user_edn_notes')
            .upsert({
              user_id: userId,
              item_code: itemCode,
              content: debouncedNote,
            }, {
              onConflict: 'user_id,item_code'
            })
            .select()
            .single();

          if (error) throw error;
          if (!annule) confirmer();

          setNotes(prev => ({
            ...prev,
            [itemCode]: data
          }));
        }
      } catch (error) {
        if (annule) return;
        // La note reste à l'écran ET sur l'appareil (brouillon) ; renvoi au retour du réseau.
        setEtat('en_attente');
        if (typeof navigator === 'undefined' || navigator.onLine) {
          console.error('Error saving note:', error);
          toast({
            title: "Note non enregistrée",
            description: "Elle reste gardée sur cet appareil et sera renvoyée automatiquement.",
            variant: "destructive",
          });
        }
      } finally {
        setIsSaving(false);
      }
    };

    saveNote();
    return () => {
      annule = true;
    };
  }, [debouncedNote, itemCode, notes, toast, userId, relance]);

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
    etat,
    getNote,
    hasNote,
    refreshNotes: fetchNotes,
  };
};
