import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { isTestEnvironment } from '@/utils/environment';

export type EdnUnifiedRow = Database['public']['Views']['edn_unified_materialized']['Row'];
export type UserProgressRow = Database['public']['Tables']['user_progress']['Row'];
export type SessionPlanRow = Database['public']['Tables']['edn_session_plans']['Row'];

export interface SessionPlanInput {
  id?: string;
  userId: string;
  title: string;
  focusItemCode?: string | null;
  focusTheme?: string | null;
  durationMinutes?: number;
  plan: {
    jeDis: string[];
    jeFais: string[];
    jeConclue: string[];
    notes?: string;
  };
}

class EdnProgressService {
  private readonly testUserId = 'test-edn-user';

  private get isTestMode() {
    return isTestEnvironment();
  }

  private getTestUnifiedItems(): EdnUnifiedRow[] {
    return [
      {
        id: 'cardio-master-class',
        item_code: 'CARDIO-001',
        title: 'Insuffisance cardiaque',
        specialite: 'Cardiologie',
        domaine_medical: 'Cardiologie',
        rang_a_competence_count: 4,
        rang_b_competence_count: 3,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        tableaux: {
          rang_a: {
            sections: [
              { title: 'Physiopathologie', concept: 'Altération de la fonction systolique' },
              { title: 'Diagnostic', concept: 'NYHA et fraction d\'éjection' },
            ],
          },
          rang_b: {
            sections: [
              { title: 'Prise en charge', technique: 'IEC, bêta-bloquants, diurétiques' },
              { title: 'Suivi', technique: 'Surveillance du poids et des œdèmes' },
            ],
          },
        },
        ecos_contexts: [
          { title: 'Consultation cardio', content: 'Prise en charge d\'un patient dyspnéique' },
        ],
        valeurs_professionnelles: [
          { title: 'Relation patient', description: 'Annonce du diagnostic et éducation thérapeutique' },
        ],
      },
      {
        id: 'neuro-recap',
        item_code: 'NEURO-014',
        title: 'Accident vasculaire cérébral',
        specialite: 'Neurologie',
        domaine_medical: 'Neurologie',
        rang_a_competence_count: 5,
        rang_b_competence_count: 4,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        tableaux: {
          rang_a: {
            sections: [
              { title: 'Reconnaissance', concept: 'Score FAST et imagerie' },
              { title: 'Etiologie', concept: 'Thrombotique versus hémorragique' },
            ],
          },
          rang_b: {
            sections: [
              { title: 'Thrombolyse', technique: 'Fenêtre thérapeutique 4h30' },
              { title: 'Unité neurovasculaire', technique: 'Prise en charge pluridisciplinaire' },
            ],
          },
        },
        ecos_contexts: [
          { title: 'Simulation USI', content: 'Gestion des complications post-AVC' },
        ],
        valeurs_professionnelles: [
          { title: 'Esprit d\'équipe', description: 'Coordination neuro / radiologie / urgence' },
        ],
      },
      {
        id: 'pneumo-update',
        item_code: 'PNEUMO-021',
        title: 'Asthme aigu grave',
        specialite: 'Pneumologie',
        domaine_medical: 'Pneumologie',
        rang_a_competence_count: 3,
        rang_b_competence_count: 2,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        tableaux: {
          rang_a: { sections: [{ title: 'Cliniques', concept: 'Sibilants, tirage, débit expiratoire' }] },
          rang_b: { sections: [{ title: 'Traitement', technique: 'Oxygénothérapie, β2 mimétiques' }] },
        },
        ecos_contexts: [
          { title: 'SAU', content: 'Gestion d\'une crise sévère' },
        ],
        valeurs_professionnelles: [
          { title: 'Communication', description: 'Explication du plan d\'action au patient' },
        ],
      },
    ] as unknown as EdnUnifiedRow[];
  }

  private getTestProgressRecords(): UserProgressRow[] {
    const now = new Date();
    return [
      {
        id: 'progress-cardio',
        user_id: this.testUserId,
        content_id: 'CARDIO-001',
        content_type: 'edn-item',
        progress_percentage: 85,
        mastery_level: 'completed',
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        last_accessed: now.toISOString(),
        notes: null,
        metadata: null,
      },
      {
        id: 'progress-neuro',
        user_id: this.testUserId,
        content_id: 'NEURO-014',
        content_type: 'edn-item',
        progress_percentage: 45,
        mastery_level: 'in_progress',
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        last_accessed: now.toISOString(),
        notes: null,
        metadata: null,
      },
    ] as unknown as UserProgressRow[];
  }

  private readTestPlans(): SessionPlanRow[] {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const raw = window.localStorage.getItem('medmng-test-session-plans');
      if (!raw) {
        return [];
      }
      return JSON.parse(raw) as SessionPlanRow[];
    } catch (error) {
      console.warn('Impossible de lire les plans de session de test', error);
      return [];
    }
  }

  private writeTestPlans(plans: SessionPlanRow[]): void {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem('medmng-test-session-plans', JSON.stringify(plans));
  }

  async fetchUnifiedItems(): Promise<EdnUnifiedRow[]> {
    if (this.isTestMode) {
      return this.getTestUnifiedItems();
    }
    const { data, error } = await supabase
      .from('edn_unified_materialized')
      .select('*')
      .order('item_code');

    if (error) {
      console.error('Erreur chargement edn_unified_materialized:', error);
      return [];
    }

    return data ?? [];
  }

  async fetchUserProgress(userId: string): Promise<UserProgressRow[]> {
    if (this.isTestMode) {
      return this.getTestProgressRecords().filter((record) => record.user_id === this.testUserId);
    }
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .or('content_type.eq.edn,content_type.eq.edn-item,content_type.is.null')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Erreur chargement user_progress:', error);
      return [];
    }

    return data ?? [];
  }

  async listSessionPlans(userId: string): Promise<SessionPlanRow[]> {
    if (this.isTestMode) {
      return this.readTestPlans().filter((plan) => plan.user_id === userId);
    }
    const { data, error } = await supabase
      .from('edn_session_plans')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Erreur chargement edn_session_plans:', error);
      return [];
    }

    return data ?? [];
  }

  async saveSessionPlan(input: SessionPlanInput): Promise<SessionPlanRow | null> {
    const payload = {
      id: input.id,
      user_id: input.userId,
      title: input.title,
      focus_item_code: input.focusItemCode ?? null,
      focus_theme: input.focusTheme ?? null,
      duration_minutes: input.durationMinutes ?? 8,
      plan: input.plan,
    };

    if (this.isTestMode) {
      const plans = this.readTestPlans();
      const existingIndex = plans.findIndex((plan) => plan.id === input.id);
      const now = new Date().toISOString();
      const record: SessionPlanRow = {
        id: input.id ?? `test-plan-${Date.now()}`,
        user_id: input.userId,
        title: input.title,
        focus_item_code: input.focusItemCode ?? null,
        focus_theme: input.focusTheme ?? null,
        duration_minutes: input.durationMinutes ?? 8,
        plan: input.plan as unknown as Record<string, unknown>,
        created_at: existingIndex >= 0 ? plans[existingIndex].created_at : now,
        updated_at: now,
      } as SessionPlanRow;

      if (existingIndex >= 0) {
        plans[existingIndex] = record;
      } else {
        plans.unshift(record);
      }

      this.writeTestPlans(plans);
      return record;
    }

    if (input.id) {
      const { data, error } = await supabase
        .from('edn_session_plans')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', input.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Erreur mise à jour session plan:', error);
        return null;
      }

      return data;
    }

    const { data, error } = await supabase
      .from('edn_session_plans')
      .insert({ ...payload, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Erreur création session plan:', error);
      return null;
    }

    return data;
  }

  async deleteSessionPlan(planId: string): Promise<boolean> {
    if (this.isTestMode) {
      const plans = this.readTestPlans();
      const nextPlans = plans.filter((plan) => plan.id !== planId);
      this.writeTestPlans(nextPlans);
      return plans.length !== nextPlans.length;
    }
    const { error } = await supabase
      .from('edn_session_plans')
      .delete()
      .eq('id', planId);

    if (error) {
      console.error('Erreur suppression session plan:', error);
      return false;
    }

    return true;
  }
}

export const ednProgressService = new EdnProgressService();
