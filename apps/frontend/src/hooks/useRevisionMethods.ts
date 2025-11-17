// ============================================================================
// useRevisionMethods Hook
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  RevisionMethodType,
  RevisionMethodStats,
  TodayRevisionItem,
  OverdueRevisionItem,
  QCMFirstSession,
  BlockMethodConfigDB,
  RevisionItemType,
  JMethodConfig,
  BlockMethodConfig,
  QCMFirstConfig,
  ChangeRevisionMethodRequest,
  CreateBlockConfigRequest,
  CreateQCMSessionRequest,
  CompleteRevisionRequest
} from '@shared/types/revision-methods';
import * as revisionService from '@shared/services/revision-methods.service';

export const useRevisionMethods = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State
  const [currentMethod, setCurrentMethod] = useState<RevisionMethodType>('J_METHOD');
  const [methodConfig, setMethodConfig] = useState<JMethodConfig | BlockMethodConfig | QCMFirstConfig | null>(null);
  const [todayItems, setTodayItems] = useState<TodayRevisionItem[]>([]);
  const [overdueItems, setOverdueItems] = useState<OverdueRevisionItem[]>([]);
  const [stats, setStats] = useState<RevisionMethodStats | null>(null);
  const [blockConfig, setBlockConfig] = useState<BlockMethodConfigDB | null>(null);
  const [todayQCMSession, setTodayQCMSession] = useState<QCMFirstSession | null>(null);

  // ============================================================================
  // Fetch Methods
  // ============================================================================

  const fetchCurrentMethod = useCallback(async () => {
    if (!user) return;

    const method = await revisionService.getUserRevisionMethod(user.id);
    if (method) {
      setCurrentMethod(method);
    }
  }, [user]);

  const fetchMethodConfig = useCallback(async () => {
    if (!user) return;

    const config = await revisionService.getRevisionMethodConfig(user.id);
    setMethodConfig(config);
  }, [user]);

  const fetchTodayItems = useCallback(async () => {
    if (!user) return;

    const items = await revisionService.getTodayRevisionItems(user.id);
    setTodayItems(items);
  }, [user]);

  const fetchOverdueItems = useCallback(async () => {
    if (!user) return;

    const items = await revisionService.getOverdueRevisionItems(user.id);
    setOverdueItems(items);
  }, [user]);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    const statsData = await revisionService.getRevisionMethodStats(user.id);
    setStats(statsData);
  }, [user]);

  const fetchBlockConfig = useCallback(async () => {
    if (!user) return;

    const config = await revisionService.getActiveBlockMethodConfig(user.id);
    setBlockConfig(config);
  }, [user]);

  const fetchTodayQCMSession = useCallback(async () => {
    if (!user) return;

    const session = await revisionService.getTodayQCMFirstSession(user.id);
    setTodayQCMSession(session);
  }, [user]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchCurrentMethod(),
        fetchMethodConfig(),
        fetchTodayItems(),
        fetchOverdueItems(),
        fetchStats()
      ]);

      // Fetch method-specific data
      if (currentMethod === 'BLOCK_METHOD') {
        await fetchBlockConfig();
      } else if (currentMethod === 'QCM_FIRST') {
        await fetchTodayQCMSession();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
      console.error('Error fetching revision data:', err);
    } finally {
      setLoading(false);
    }
  }, [
    fetchCurrentMethod,
    fetchMethodConfig,
    fetchTodayItems,
    fetchOverdueItems,
    fetchStats,
    fetchBlockConfig,
    fetchTodayQCMSession,
    currentMethod
  ]);

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  // Initial load
  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, fetchAllData]);

  // ============================================================================
  // Method Management
  // ============================================================================

  const changeMethod = useCallback(
    async (request: ChangeRevisionMethodRequest) => {
      if (!user) return { success: false, error: 'User not authenticated' };

      setLoading(true);
      setError(null);

      try {
        const result = await revisionService.changeRevisionMethod(user.id, request);

        if (result.success) {
          await fetchAllData();
        } else {
          setError(result.error || 'Erreur lors du changement de méthode');
        }

        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [user, fetchAllData]
  );

  // ============================================================================
  // Revision Actions
  // ============================================================================

  const completeRevision = useCallback(
    async (request: CompleteRevisionRequest) => {
      if (!user) return { success: false, error: 'User not authenticated' };

      const result = await revisionService.completeRevision(request);

      if (result.success) {
        // Refresh data
        await Promise.all([fetchTodayItems(), fetchStats()]);
      }

      return result;
    },
    [user, fetchTodayItems, fetchStats]
  );

  const skipRevision = useCallback(
    async (revisionId: string) => {
      if (!user) return { success: false, error: 'User not authenticated' };

      const result = await revisionService.skipRevision(revisionId);

      if (result.success) {
        await fetchTodayItems();
      }

      return result;
    },
    [user, fetchTodayItems]
  );

  const rescheduleRevision = useCallback(
    async (revisionId: string, newDate: Date) => {
      if (!user) return { success: false, error: 'User not authenticated' };

      const result = await revisionService.rescheduleRevision(revisionId, newDate);

      if (result.success) {
        await Promise.all([fetchTodayItems(), fetchOverdueItems()]);
      }

      return result;
    },
    [user, fetchTodayItems, fetchOverdueItems]
  );

  // ============================================================================
  // J Method Actions
  // ============================================================================

  const markItemSeenAndSchedule = useCallback(
    async (itemId: string, itemType: RevisionItemType, itemCode: string) => {
      if (!user) return { success: false, error: 'User not authenticated' };

      const result = await revisionService.markItemSeenAndSchedule(
        user.id,
        itemId,
        itemType,
        itemCode
      );

      if (result.success) {
        await fetchTodayItems();
      }

      return result;
    },
    [user, fetchTodayItems]
  );

  // ============================================================================
  // Block Method Actions
  // ============================================================================

  const createBlockConfig = useCallback(
    async (request: CreateBlockConfigRequest) => {
      if (!user) return { success: false, error: 'User not authenticated' };

      setLoading(true);
      const result = await revisionService.createBlockMethodConfig(user.id, request);

      if (result.success) {
        await fetchAllData();
      }

      setLoading(false);
      return result;
    },
    [user, fetchAllData]
  );

  // ============================================================================
  // QCM First Actions
  // ============================================================================

  const createQCMSession = useCallback(
    async (request: CreateQCMSessionRequest) => {
      if (!user) return { success: false, error: 'User not authenticated' };

      const result = await revisionService.createQCMFirstSession(user.id, request);

      if (result.success) {
        await Promise.all([fetchTodayQCMSession(), fetchTodayItems()]);
      }

      return result;
    },
    [user, fetchTodayQCMSession, fetchTodayItems]
  );

  const markFicheReviewed = useCallback(
    async (sessionId: string, ficheId: string) => {
      if (!user) return { success: false, error: 'User not authenticated' };

      const result = await revisionService.markFicheReviewedInQCMSession(sessionId, ficheId);

      if (result.success) {
        await fetchTodayQCMSession();
      }

      return result;
    },
    [user, fetchTodayQCMSession]
  );

  const completeQCMSession = useCallback(
    async (sessionId: string) => {
      if (!user) return { success: false, error: 'User not authenticated' };

      const result = await revisionService.completeQCMFirstSession(sessionId);

      if (result.success) {
        await fetchTodayQCMSession();
      }

      return result;
    },
    [user, fetchTodayQCMSession]
  );

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // State
    loading,
    error,
    currentMethod,
    methodConfig,
    todayItems,
    overdueItems,
    stats,
    blockConfig,
    todayQCMSession,

    // Method management
    changeMethod,
    fetchAllData,

    // Revision actions
    completeRevision,
    skipRevision,
    rescheduleRevision,

    // J Method
    markItemSeenAndSchedule,

    // Block Method
    createBlockConfig,

    // QCM First
    createQCMSession,
    markFicheReviewed,
    completeQCMSession
  };
};
