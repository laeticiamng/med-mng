import { useState, useEffect } from 'react';

export interface EdnItemLight {
  id: string;
  slug: string;
  titre: string;
  title?: string; // Alias pour compatibilité
  matiere: string;
  specialite?: string;
  rang: string;
  validated?: boolean;
  is_validated?: boolean;
  item_code?: string;
  completeness_score?: number;
  has_music?: boolean;
  has_scene?: boolean;
  has_quiz?: boolean;
  competences_count_total?: number;
}

export interface EdnStats {
  total: number;
  complete: number;
  withMusic: number;
  validated: number;
  avgScore: number;
}

export const useEdnItemsPaginated = (page: number, itemsPerPage: number) => {
  const [items, setItems] = useState<EdnItemLight[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      
      // Simulation de données pour éviter les erreurs
      const mockItems: EdnItemLight[] = Array.from({ length: itemsPerPage }, (_, i) => ({
        id: `item-${page}-${i}`,
        slug: `item-${page}-${i}`,
        titre: `Item EDN ${page * itemsPerPage + i + 1}`,
        matiere: ['Cardiologie', 'Pneumologie', 'Neurologie', 'Gastro-entérologie'][i % 4],
        rang: ['A', 'B'][i % 2],
        validated: Math.random() > 0.5,
      }));
      
      setItems(mockItems);
      setTotalCount(100); // Mock total
      setLoading(false);
    };

    loadItems();
  }, [page, itemsPerPage]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return {
    items,
    totalCount,
    loading,
    totalPages,
    refetch: () => {},
  };
};

export const useEdnStats = () => {
  const [stats, setStats] = useState<EdnStats>({
    total: 100,
    complete: 75,
    withMusic: 50,
    validated: 60,
    avgScore: 85,
  });
  
  const [loading, setLoading] = useState(false);

  return { stats, loading };
};