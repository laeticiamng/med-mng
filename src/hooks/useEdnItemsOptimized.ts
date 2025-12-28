import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EdnItemOptimized {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  updated_at: string;
  paroles_musicales?: string[];
  competences_count_rang_a?: number;
  competences_count_rang_b?: number;
  specialite?: string;
  mots_cles?: string[];
}

const SUPABASE_URL = "https://yaincoxihiqdksxgrsrk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU";

export const useEdnItemsOptimized = () => {
  const [items, setItems] = useState<EdnItemOptimized[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const fetchItems = async () => {
      try {
        console.log('📚 Début chargement EDN items via fetch...');
        
        // Utiliser fetch direct avec timeout pour éviter blocage
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/edn_items_immersive?select=id,item_code,title,subtitle,slug,updated_at,paroles_musicales&order=item_code`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
            },
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);
        
        if (cancelled) return;

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Erreur HTTP:', response.status, errorText);
          setError(`Erreur ${response.status}: ${errorText}`);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        console.log('📚 Réponse reçue:', { count: data?.length });
        
        if (!data || data.length === 0) {
          setError('Aucun item EDN trouvé');
          setLoading(false);
          return;
        }
        
        const mappedItems: EdnItemOptimized[] = data.map((item: any) => ({
          id: item.id,
          item_code: item.item_code,
          title: item.title,
          subtitle: item.subtitle || undefined,
          slug: item.slug,
          updated_at: item.updated_at,
          paroles_musicales: item.paroles_musicales || undefined,
          competences_count_rang_a: 0,
          competences_count_rang_b: 0,
        }));
        
        setItems(mappedItems);
        setLoading(false);
        
        // Background OIC enrichment via fetch direct
        try {
          const oicResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/backup_oic_competences?select=item_parent,rang&objectif_id=not.is.null`,
            {
              headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
              }
            }
          );

          if (cancelled || !oicResponse.ok) return;

          const oicData = await oicResponse.json();
          console.log('📊 OIC data loaded:', oicData?.length, 'competences');

          if (!oicData || oicData.length === 0) return;

          const countsMap = new Map<string, { rangA: number; rangB: number }>();
          oicData.forEach((row: any) => {
            const key = row.item_parent || '';
            const existing = countsMap.get(key) || { rangA: 0, rangB: 0 };
            if (row.rang === 'A') existing.rangA++;
            else if (row.rang === 'B') existing.rangB++;
            countsMap.set(key, existing);
          });

          setItems(prev => prev.map((item) => {
            // item_code est "IC-1", item_parent est "001"
            const itemNumber = item.item_code.replace('IC-', '');
            const paddedNumber = itemNumber.padStart(3, '0');
            
            const counts = countsMap.get(paddedNumber) 
              || countsMap.get(itemNumber) 
              || { rangA: 0, rangB: 0 };
            
            return {
              ...item,
              competences_count_rang_a: counts.rangA,
              competences_count_rang_b: counts.rangB,
            };
          }));
        } catch (oicErr) {
          console.warn('OIC enrichment failed (non-critical):', oicErr);
        }
      } catch (err) {
        if (cancelled) return;
        
        if (err instanceof Error && err.name === 'AbortError') {
          setError('Timeout: le chargement a pris trop de temps. Veuillez réessayer.');
        } else {
          setError(err instanceof Error ? err.message : 'Erreur inconnue');
        }
        setLoading(false);
      }
    };

    fetchItems();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const withRangA = items.filter(i => (i.competences_count_rang_a || 0) > 0).length;
    const withRangB = items.filter(i => (i.competences_count_rang_b || 0) > 0).length;
    const complete = items.filter(i => 
      (i.competences_count_rang_a || 0) > 0 && (i.competences_count_rang_b || 0) > 0
    ).length;
    const withMusic = items.filter(i => 
      i.paroles_musicales && i.paroles_musicales.length > 0
    ).length;
    
    const avgScore = total > 0 ? Math.round(
      items.reduce((sum, item) => {
        let score = 0;
        if ((item.competences_count_rang_a || 0) > 0) score += 35;
        if ((item.competences_count_rang_b || 0) > 0) score += 35;
        if (item.paroles_musicales && item.paroles_musicales.length > 0) score += 30;
        return sum + score;
      }, 0) / total
    ) : 0;

    return { total, withRangA, withRangB, complete, withMusic, avgScore };
  }, [items]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/edn_items_immersive?select=id,item_code,title,subtitle,slug,updated_at,paroles_musicales&order=item_code`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        setError(`Erreur ${response.status}`);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        setError('Aucun item EDN trouvé');
        setLoading(false);
        return;
      }
      
      const mappedItems: EdnItemOptimized[] = data.map((item: any) => ({
        id: item.id,
        item_code: item.item_code,
        title: item.title,
        subtitle: item.subtitle || undefined,
        slug: item.slug,
        updated_at: item.updated_at,
        paroles_musicales: item.paroles_musicales || undefined,
        competences_count_rang_a: 0,
        competences_count_rang_b: 0,
      }));
      
      setItems(mappedItems);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setLoading(false);
    }
  };

  return { items, stats, loading, error, refresh };
};

export const invalidateEdnCache = () => {
  // No-op for compatibility
};
