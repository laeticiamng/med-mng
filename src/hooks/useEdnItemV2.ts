
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { validateItemEDN, ItemEDNV2 } from '@/schemas/itemEDNSchema';
import { EDNItemParser, ParsedEDNItem } from '@/parsers/ednItemParser';

interface UseEdnItemV2Result {
  item: ParsedEDNItem | null;
  rawItem: ItemEDNV2 | any | null;
  loading: boolean;
  error: string | null;
  isV2Format: boolean;
  validationErrors: string[];
}

/**
 * Hook unifié pour charger les items EDN v1 et v2
 * Remplace progressivement useEdnItem.ts
 */
export const useEdnItemV2 = (slug: string | undefined): UseEdnItemV2Result => {
  const [item, setItem] = useState<ParsedEDNItem | null>(null);
  const [rawItem, setRawItem] = useState<ItemEDNV2 | any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isV2Format, setIsV2Format] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    const fetchItem = async () => {
      if (!slug) {
        setError('Slug manquant');
        setLoading(false);
        return;
      }
      
      try {
        console.log('🔍 useEdnItemV2 - Chargement item:', slug);
        
        // 1. Récupération depuis Supabase
        const { data, error: supabaseError } = await supabase
          .from('edn_items_immersive')
          .select('*')
          .eq('slug', slug)
          .single();

        if (supabaseError) {
          console.error('❌ Erreur Supabase:', supabaseError);
          setError('Item non trouvé');
          return;
        }

        if (!data) {
          setError('Aucune donnée trouvée');
          return;
        }

        console.log('📦 Données brutes récupérées:', data);
        setRawItem(data);

        // 2. Détection du format et validation si v2
        const isV2 = EDNItemParser.isItemV2(data);
        setIsV2Format(isV2);
        
        let parsedItem: ParsedEDNItem | null = null;
        let valErrors: string[] = [];

        if (isV2) {
          console.log('✅ Item v2 détecté, validation en cours...');
          
          try {
            // Approche alternative : on parse directement et on catch les erreurs de validation
            const validation = validateItemEDN(data);
            
            if ('success' in validation && validation.success === true && 'data' in validation) {
              console.log('✅ Item v2 valide');
              // On utilise directement les données validées
              const validatedData = validation.data;
              parsedItem = EDNItemParser.parseItemV2(validatedData, data.id);
              valErrors = [];
            } else if ('error' in validation && validation.error) {
              console.warn('⚠️ Item v2 invalide:', validation.error);
              valErrors = validation.error.issues.map(
                (issue: any) => `${issue.path.join('.')} – ${issue.message}`
              );
              // On continue quand même le parsing pour éviter la régression
              parsedItem = EDNItemParser.parseAnyItem(data, data.id);
            }
          } catch (err) {
            console.error('❌ Erreur de validation:', err);
            // En cas d'erreur, on parse comme v1
            parsedItem = EDNItemParser.parseAnyItem(data, data.id);
          }
        } else {
          // Item format v1
          parsedItem = EDNItemParser.parseAnyItem(data, data.id);
        }

        // 3. Set state commun
        setValidationErrors(valErrors);
        setItem(parsedItem);
        setError(null);
        
      } catch (catchError) {
        console.error('❌ Erreur générale:', catchError);
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [slug]);

  return { 
    item, 
    rawItem, 
    loading, 
    error, 
    isV2Format, 
    validationErrors 
  };
};
