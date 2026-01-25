import { supabase } from '@/integrations/supabase/client';
import { calculateCVSS, CVSSMetrics, getPatchPriority } from '@/utils/cvssCalculator';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface CVSSAssessment {
  id: string;
  vulnerability_name: string;
  description?: string;
  cve_id?: string;
  
  // Base Metrics
  attack_vector: string;
  attack_complexity: string;
  privileges_required: string;
  user_interaction: string;
  scope: string;
  confidentiality_impact: string;
  integrity_impact: string;
  availability_impact: string;
  
  // Temporal Metrics
  exploit_code_maturity?: string;
  remediation_level?: string;
  report_confidence?: string;
  
  // Environmental Metrics
  confidentiality_requirement?: string;
  integrity_requirement?: string;
  availability_requirement?: string;
  
  // Scores
  base_score: number;
  temporal_score?: number;
  environmental_score?: number;
  base_severity: string;
  vector_string: string;
  
  // Metadata
  assessed_by?: string;
  assessed_at: string;
  patched: boolean;
  patch_priority?: number;
  patch_deadline?: string;
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

export function useCVSSAssessments() {
  const queryClient = useQueryClient();

  // Fetch all assessments
  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ['cvss-assessments'],
    queryFn: async () => {
      const { _data, _error } = await supabase
        .from('cvss_assessments')
        .select('*')
        .order('base_score', { ascending: false });

      if (_error) throw _error;
      return (_data || []) as CVSSAssessment[];
    },
  });

  // Create assessment
  const createAssessment = useMutation({
    mutationFn: async (data: {
      vulnerability_name: string;
      description?: string;
      cve_id?: string;
      metrics: CVSSMetrics;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Calculate scores
      const scores = calculateCVSS(data.metrics);
      const priority = getPatchPriority(scores);

      // Calculate deadline
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + priority.deadline);

      const { _error } = await supabase
        .from('cvss_assessments')
        .insert({
          vulnerability_name: data.vulnerability_name,
          description: data.description,
          cve_id: data.cve_id,
          
          attack_vector: data.metrics.attackVector,
          attack_complexity: data.metrics.attackComplexity,
          privileges_required: data.metrics.privilegesRequired,
          user_interaction: data.metrics.userInteraction,
          scope: data.metrics.scope,
          confidentiality_impact: data.metrics.confidentialityImpact,
          integrity_impact: data.metrics.integrityImpact,
          availability_impact: data.metrics.availabilityImpact,
          
          exploit_code_maturity: data.metrics.exploitCodeMaturity || 'X',
          remediation_level: data.metrics.remediationLevel || 'X',
          report_confidence: data.metrics.reportConfidence || 'X',
          
          confidentiality_requirement: data.metrics.confidentialityRequirement || 'X',
          integrity_requirement: data.metrics.integrityRequirement || 'X',
          availability_requirement: data.metrics.availabilityRequirement || 'X',
          
          base_score: scores.baseScore,
          temporal_score: scores.temporalScore,
          environmental_score: scores.environmentalScore,
          base_severity: scores.baseSeverity,
          vector_string: scores.vectorString,
          
          assessed_by: user.id,
          patch_priority: priority.priority,
          patch_deadline: deadline.toISOString().split('T')[0],
          notes: data.notes,
        } as any);

      if (_error) throw _error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvss-assessments'] });
      toast.success('Évaluation CVSS créée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création');
    },
  });

  // Update assessment
  const updateAssessment = useMutation({
    mutationFn: async (data: {
      id: string;
      patched?: boolean;
      notes?: string;
    }) => {
      const updates: any = {};
      if (data.patched !== undefined) updates.patched = data.patched;
      if (data.notes !== undefined) updates.notes = data.notes;

      const { _error } = await supabase
        .from('cvss_assessments')
        .update(updates)
        .eq('id', data.id);

      if (_error) throw _error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvss-assessments'] });
      toast.success('Évaluation mise à jour');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });

  // Delete assessment
  const deleteAssessment = useMutation({
    mutationFn: async (id: string) => {
      const { _error } = await supabase
        .from('cvss_assessments')
        .delete()
        .eq('id', id);

      if (_error) throw _error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvss-assessments'] });
      toast.success('Évaluation supprimée');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });

  // Derived data
  const criticalVulns = assessments.filter(a => a.base_severity === 'Critical' && !a.patched);
  const unpatchedVulns = assessments.filter(a => !a.patched);
  const overdueVulns = assessments.filter(a => {
    if (a.patched || !a.patch_deadline) return false;
    return new Date(a.patch_deadline) < new Date();
  });

  return {
    assessments,
    isLoading,
    criticalVulns,
    _highVulns,
    unpatchedVulns,
    overdueVulns,
    createAssessment: createAssessment.mutate,
    updateAssessment: updateAssessment.mutate,
    deleteAssessment: deleteAssessment.mutate,
    isCreating: createAssessment.isPending,
    isUpdating: updateAssessment.isPending,
    isDeleting: deleteAssessment.isPending,
  };
}
