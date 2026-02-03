/**
 * useContentValidation - Hook pour gérer la validation du contenu médical
 * Intégré avec la table content_validation_queue
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ValidationStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'needs_revision';
type ContentType = 'flashcard' | 'quiz' | 'clinical_case' | 'ai_response' | 'song_lyrics';
type Priority = 'low' | 'normal' | 'high' | 'urgent';

interface ContentValidation {
  id: string;
  content_id: string;
  content_type: ContentType;
  content_text: string;
  submitted_by: string | null;
  assigned_validator: string | null;
  priority: Priority;
  status: ValidationStatus;
  validation_notes: string | null;
  medical_accuracy_score: number | null;
  source_references: string[] | null;
  created_at: string;
  updated_at: string;
  validated_at: string | null;
}

interface SubmitValidationParams {
  contentId: string;
  contentType: ContentType;
  contentText: string;
  priority?: Priority;
}

interface UpdateValidationParams {
  validationId: string;
  status: ValidationStatus;
  notes?: string;
  accuracyScore?: number;
  sourceReferences?: string[];
}

export const useContentValidation = () => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Récupérer les validations en attente
  const { data: pendingValidations, isLoading: loadingPending } = useQuery({
    queryKey: ['content-validations', 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_validation_queue')
        .select('*')
        .in('status', ['pending', 'in_review'])
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ContentValidation[];
    }
  });

  // Récupérer l'historique des validations
  const { data: validationHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ['content-validations', 'history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_validation_queue')
        .select('*')
        .in('status', ['approved', 'rejected', 'needs_revision'])
        .order('validated_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as ContentValidation[];
    }
  });

  // Soumettre un contenu pour validation
  const submitForValidation = useMutation({
    mutationFn: async (params: SubmitValidationParams) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('content_validation_queue')
        .insert({
          content_id: params.contentId,
          content_type: params.contentType,
          content_text: params.contentText,
          priority: params.priority || 'normal',
          submitted_by: user.user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-validations'] });
      toast.success('Contenu soumis pour validation');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  // Mettre à jour le statut de validation
  const updateValidation = useMutation({
    mutationFn: async (params: UpdateValidationParams) => {
      const updateData: Partial<ContentValidation> = {
        status: params.status,
        validation_notes: params.notes,
        medical_accuracy_score: params.accuracyScore,
        source_references: params.sourceReferences,
        validated_at: ['approved', 'rejected'].includes(params.status) 
          ? new Date().toISOString() 
          : null
      };

      const { data, error } = await supabase
        .from('content_validation_queue')
        .update(updateData)
        .eq('id', params.validationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['content-validations'] });
      const statusMessages: Record<ValidationStatus, string> = {
        pending: 'Remis en attente',
        in_review: 'Pris en charge pour révision',
        approved: 'Contenu approuvé ✅',
        rejected: 'Contenu rejeté',
        needs_revision: 'Révision demandée'
      };
      toast.success(statusMessages[data.status]);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  // Prendre en charge une validation
  const claimValidation = useCallback(async (validationId: string) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      toast.error('Non authentifié');
      return;
    }

    const { error } = await supabase
      .from('content_validation_queue')
      .update({
        assigned_validator: user.user.id,
        status: 'in_review'
      })
      .eq('id', validationId);

    if (error) {
      toast.error(`Erreur: ${error.message}`);
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['content-validations'] });
    toast.success('Validation prise en charge');
  }, [queryClient]);

  // Statistiques de validation
  const { data: validationStats } = useQuery({
    queryKey: ['content-validations', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_validation_queue')
        .select('status, priority');

      if (error) throw error;

      const stats = {
        total: data.length,
        pending: data.filter(v => v.status === 'pending').length,
        inReview: data.filter(v => v.status === 'in_review').length,
        approved: data.filter(v => v.status === 'approved').length,
        rejected: data.filter(v => v.status === 'rejected').length,
        needsRevision: data.filter(v => v.status === 'needs_revision').length,
        urgent: data.filter(v => v.priority === 'urgent' && v.status === 'pending').length
      };

      return stats;
    }
  });

  return {
    // Data
    pendingValidations,
    validationHistory,
    validationStats,
    
    // Loading states
    isLoading: loadingPending || loadingHistory,
    isSubmitting: submitForValidation.isPending || updateValidation.isPending,
    
    // Actions
    submitForValidation: submitForValidation.mutate,
    updateValidation: updateValidation.mutate,
    claimValidation
  };
};

export default useContentValidation;
