import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BKTKnowledgeState {
  p_know: number;
  p_guess: number;
  p_slip: number;
  p_learn: number;
  total_attempts: number;
  correct_attempts: number;
  mastery_reached: boolean;
}

interface ConceptMastery {
  item_code: string;
  concept_id: string;
  p_know: number;
  mastery_reached: boolean;
  total_attempts: number;
}

export const useBKTKnowledge = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Update knowledge state after an attempt
  const recordAttempt = useCallback(async (
    itemCode: string,
    conceptId: string,
    isCorrect: boolean
  ): Promise<{ p_know_prior: number; p_know_posterior: number; mastery_reached: boolean } | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase.rpc('update_bkt_knowledge', {
        p_user_id: user.id,
        p_item_code: itemCode,
        p_concept_id: conceptId,
        p_is_correct: isCorrect
      });

      if (error) throw error;
      
      const result = data as { p_know_prior: number; p_know_posterior: number; mastery_reached: boolean };
      
      if (result.mastery_reached && result.p_know_prior < 0.95) {
        toast({
          title: "🎓 Concept maîtrisé !",
          description: `Vous avez atteint la maîtrise de "${conceptId}"`,
        });
      }

      return result;
    } catch (error) {
      console.error('Error recording BKT attempt:', error);
      return null;
    }
  }, [toast]);

  // Get all knowledge states for a user
  const getUserKnowledge = useCallback(async (): Promise<ConceptMastery[]> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('bkt_student_knowledge')
        .select('item_code, concept_id, p_know, mastery_reached, total_attempts')
        .eq('user_id', user.id)
        .order('p_know', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user knowledge:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get weak concepts that need work
  const getWeakConcepts = useCallback(async (limit = 10): Promise<ConceptMastery[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('bkt_student_knowledge')
        .select('item_code, concept_id, p_know, mastery_reached, total_attempts')
        .eq('user_id', user.id)
        .eq('mastery_reached', false)
        .order('p_know', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching weak concepts:', error);
      return [];
    }
  }, []);

  // Get mastered concepts
  const getMasteredConcepts = useCallback(async (): Promise<ConceptMastery[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('bkt_student_knowledge')
        .select('item_code, concept_id, p_know, mastery_reached, total_attempts')
        .eq('user_id', user.id)
        .eq('mastery_reached', true)
        .order('p_know', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching mastered concepts:', error);
      return [];
    }
  }, []);

  // Get overall mastery stats
  const getMasteryStats = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('bkt_student_knowledge')
        .select('p_know, mastery_reached, item_code')
        .eq('user_id', user.id);

      if (error) throw error;

      const concepts = data || [];
      const totalConcepts = concepts.length;
      const masteredCount = concepts.filter(c => c.mastery_reached).length;
      const avgPKnow = concepts.reduce((sum, c) => sum + c.p_know, 0) / Math.max(totalConcepts, 1);
      
      // Group by item
      const itemGroups = concepts.reduce((acc, c) => {
        if (!acc[c.item_code]) acc[c.item_code] = [];
        acc[c.item_code].push(c);
        return acc;
      }, {} as Record<string, typeof concepts>);

      const itemMastery = Object.entries(itemGroups).map(([itemCode, itemConcepts]) => ({
        itemCode,
        conceptsCount: itemConcepts.length,
        masteredCount: itemConcepts.filter(c => c.mastery_reached).length,
        avgPKnow: itemConcepts.reduce((sum, c) => sum + c.p_know, 0) / itemConcepts.length
      }));

      return {
        totalConcepts,
        masteredCount,
        masteryRate: totalConcepts > 0 ? (masteredCount / totalConcepts) * 100 : 0,
        avgPKnow: Math.round(avgPKnow * 100) / 100,
        itemMastery: itemMastery.sort((a, b) => a.avgPKnow - b.avgPKnow)
      };
    } catch (error) {
      console.error('Error fetching mastery stats:', error);
      return null;
    }
  }, []);

  // Get personalized study recommendations (70% weak, 20% review, 10% new)
  const getStudyRecommendations = useCallback(async (count = 10) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { weak: [], review: [], new: [] };

      // Get weak concepts (p_know < 0.5)
      const { data: weakData } = await supabase
        .from('bkt_student_knowledge')
        .select('item_code, concept_id, p_know')
        .eq('user_id', user.id)
        .lt('p_know', 0.5)
        .order('p_know', { ascending: true })
        .limit(Math.ceil(count * 0.7));

      // Get review concepts (0.5 <= p_know < 0.95)
      const { data: reviewData } = await supabase
        .from('bkt_student_knowledge')
        .select('item_code, concept_id, p_know')
        .eq('user_id', user.id)
        .gte('p_know', 0.5)
        .lt('p_know', 0.95)
        .order('last_attempt_at', { ascending: true })
        .limit(Math.ceil(count * 0.2));

      // Get known items to suggest new ones
      const { data: knownItems } = await supabase
        .from('bkt_student_knowledge')
        .select('item_code')
        .eq('user_id', user.id);

      const knownItemCodes = new Set((knownItems || []).map(k => k.item_code));

      // Get new items from EDN
      const { data: newItems } = await supabase
        .from('edn_items_complete')
        .select('item_code')
        .eq('validation_status', 'validated')
        .limit(50);

      const newItemCandidates = (newItems || [])
        .filter(i => !knownItemCodes.has(i.item_code))
        .slice(0, Math.ceil(count * 0.1));

      return {
        weak: weakData || [],
        review: reviewData || [],
        new: newItemCandidates.map(i => ({ item_code: i.item_code, concept_id: 'general', p_know: 0 }))
      };
    } catch (error) {
      console.error('Error getting study recommendations:', error);
      return { weak: [], review: [], new: [] };
    }
  }, []);

  return {
    loading,
    recordAttempt,
    getUserKnowledge,
    getWeakConcepts,
    getMasteredConcepts,
    getMasteryStats,
    getStudyRecommendations
  };
};
