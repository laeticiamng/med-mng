
import { useState, useEffect } from 'react';
import { validateItemEDN, ItemEDNV2 } from '@/schemas/itemEDNSchema';
import { EDNItemParser, ParsedEDNItem } from '@/parsers/ednItemParser';
import { appendEdnCacheParams, getEdnCacheBuster, pickCacheDiagnostics, subscribeEdnCacheBuster } from '@/utils/ednCache';

const SUPABASE_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

interface UseEdnItemV2Result {
  item: ParsedEDNItem | null;
  rawItem: ItemEDNV2 | Record<string, unknown> | null;
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
  const [rawItem, setRawItem] = useState<ItemEDNV2 | Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isV2Format, setIsV2Format] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [cacheBuster, setCacheBuster] = useState(getEdnCacheBuster);

  useEffect(() => {
    const fetchItem = async () => {
      if (!slug) {
        setError('Slug manquant');
        setLoading(false);
        return;
      }
      
      try {
        console.log('🔍 useEdnItemV2 - Chargement item:', slug);
        
        // 1. Récupération depuis Supabase REST avec cache busting
        const baseUrl = `${SUPABASE_URL}/rest/v1/edn_items_immersive?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`;
        const url = appendEdnCacheParams(baseUrl, cacheBuster, true);
        const response = await fetch(url, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          cache: 'no-store'
        });

        if (!response.ok) {
          console.error('❌ Erreur Supabase REST:', response.status, response.statusText);
          setError('Item non trouvé');
          return;
        }

        const payload = await response.json();
        console.log('🧾 useEdnItemV2 - Cache headers:', pickCacheDiagnostics(response.headers));

        const data = Array.isArray(payload) ? payload[0] : payload;

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
            } else if ('success' in validation && validation.success === false && 'errors' in validation) {
              console.warn('⚠️ Item v2 invalide:', validation.errors);
              valErrors = validation.errors;
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

    const unsubscribe = subscribeEdnCacheBuster((value) => {
      setCacheBuster(value);
    });

    fetchItem();

    return () => {
      unsubscribe();
    };
  }, [slug, cacheBuster]);

  return { 
    item, 
    rawItem, 
    loading, 
    error, 
    isV2Format, 
    validationErrors 
  };
};
