import { useState, useCallback } from 'react';

export interface ItemWithCompleteness {
  id: string;
  code: string;
  title: string;
  completeness_score: number;
  status: 'complete' | 'incomplete' | 'critical';
  itemCode?: string;
  specialite?: string;
  alertsCount?: number;
  tableauAPresent?: boolean;
  tableauBPresent?: boolean;
  completenessScore?: number;
  badgeVariant?: 'default' | 'destructive' | 'outline' | 'secondary';
  statusLabel?: string;
}

export const useItemsWithCompleteness = () => {
  const [items, setItems] = useState<ItemWithCompleteness[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    complete: 0,
    incomplete: 0,
    critical: 0,
    partial: 0,
    missing: 0,
    averageScore: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const mockItems: ItemWithCompleteness[] = [
        {
          id: '1',
          code: 'CARDIO-001',
          itemCode: 'CARDIO-001',
          title: 'Cardiologie Avancée',
          completeness_score: 85,
          completenessScore: 85,
          status: 'complete',
          specialite: 'Cardiologie',
          alertsCount: 0,
          tableauAPresent: true,
          tableauBPresent: true,
          badgeVariant: 'default',
          statusLabel: 'Complete'
        },
        {
          id: '2', 
          code: 'NEPHRO-002',
          itemCode: 'NEPHRO-002',
          title: 'Néphrologie Clinique',
          completeness_score: 45,
          completenessScore: 45,
          status: 'incomplete',
          specialite: 'Néphrologie',
          alertsCount: 3,
          tableauAPresent: false,
          tableauBPresent: true,
          badgeVariant: 'outline',
          statusLabel: 'Incomplete'
        }
      ];

      setItems(mockItems);
      const averageScore = mockItems.reduce((sum, item) => sum + item.completeness_score, 0) / mockItems.length;
      setStats({
        total: mockItems.length,
        complete: mockItems.filter(i => i.status === 'complete').length,
        incomplete: mockItems.filter(i => i.status === 'incomplete').length,
        critical: mockItems.filter(i => i.status === 'critical').length,
        partial: Math.floor(mockItems.length * 0.3),
        missing: Math.floor(mockItems.length * 0.1),
        averageScore: Math.round(averageScore)
      });
      setLastUpdated(new Date().toISOString());
      setError(null);
    } catch (error) {
      console.error('Error loading items with completeness:', error);
      setItems([]);
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    return loadItems();
  }, [loadItems]);

  return {
    items,
    loading,
    stats,
    error,
    lastUpdated,
    loadItems,
    refetch,
  };
};