import { supabase } from '@/integrations/supabase/client';
import type { Database, Json } from '@/integrations/supabase/types';
import { isTestEnvironment } from '@/utils/environment';

export type EdnUnifiedRow = Database['public']['Views']['edn_unified_materialized']['Row'];
export type UserProgressRow = Database['public']['Tables']['user_progress']['Row'];
export type SessionPlanRow = Database['public']['Tables']['edn_session_plans']['Row'];

export interface NormalizedTableSection {
  title?: string;
  concept?: string;
  definition?: string;
  technique?: string;
  cas?: string;
}

export interface NormalizedEdnItem {
  id: string;
  item_code: string;
  item_id: string | null;
  slug: string;
  title: string;
  specialite: string | null;
  domaine_medical: string | null;
  rang_a_competence_count: number;
  rang_b_competence_count: number;
  total_competence_count: number;
  niveau_complexite: string | null;
  tableaux: {
    rang_a: { sections: NormalizedTableSection[] };
    rang_b: { sections: NormalizedTableSection[] };
  };
  ecos_contexts: { title?: string; content?: string }[];
  valeurs_professionnelles: { title?: string; description?: string }[];
  competences_oic: Record<string, unknown>[];
  mots_cles: string[];
  tags_medicaux: string[];
  created_at: string | null;
  updated_at: string | null;
  raw: EdnUnifiedRow;
}

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

export class EdnProgressService {
  private readonly testUserId = 'test-edn-user';

  private get isTestMode() {
    return isTestEnvironment();
  }

  private readonly notEmpty = <T>(value: T | null | undefined): value is T => value !== null && value !== undefined;

  private normalizeString(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private normalizeNumber(value: unknown, fallback = 0): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    return fallback;
  }

  private normalizeStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value
      .map((entry) => this.normalizeString(entry))
      .filter(this.notEmpty);
  }

  private normalizeRecordArray(value: unknown): Record<string, unknown>[] {
    if (!Array.isArray(value)) return [];
    return value.filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object' && !Array.isArray(entry));
  }

  private normalizeTableSections(value: unknown): NormalizedTableSection[] {
    const sectionsSource = Array.isArray(value)
      ? value
      : typeof value === 'object' && value !== null && Array.isArray((value as Record<string, unknown>).sections)
      ? (value as Record<string, unknown>).sections
      : [];

    return this.normalizeRecordArray(sectionsSource).map((section) => {
      const title = this.normalizeString(section.title);
      const concept = this.normalizeString(section.concept);
      const definition = this.normalizeString((section as Record<string, unknown>).definition);
      const technique = this.normalizeString(section.technique);
      const cas = this.normalizeString((section as Record<string, unknown>).cas);

      const normalized: NormalizedTableSection = {};
      if (title) normalized.title = title;
      if (concept) normalized.concept = concept;
      if (definition) normalized.definition = definition;
      if (technique) normalized.technique = technique;
      if (cas) normalized.cas = cas;

      return normalized;
    }).filter((section) => Object.keys(section).length > 0);
  }

  private normalizeUnifiedRow(row: EdnUnifiedRow): NormalizedEdnItem | null {
    const itemCode = this.normalizeString(row.item_code);
    if (!itemCode) {
      return null;
    }

    const slug = this.normalizeString(row.slug) ?? itemCode.toLowerCase();
    const itemId = this.normalizeString(row.item_id);
    const title = this.normalizeString(row.title) ?? itemCode;
    const specialite = this.normalizeString(row.specialite);
    const domaine = this.normalizeString(row.domaine_medical);

    const tableaux = typeof row.tableaux === 'object' && row.tableaux !== null
      ? (row.tableaux as Record<string, unknown>)
      : ({} as Record<string, unknown>);

    const normalizedTableaux = {
      rang_a: {
        sections: this.normalizeTableSections(tableaux.rang_a),
      },
      rang_b: {
        sections: this.normalizeTableSections(tableaux.rang_b),
      },
    };

    const ecos = this.normalizeRecordArray(row.ecos_contexts).map((entry) => {
      const titleEntry = this.normalizeString(entry.title) ?? this.normalizeString((entry as Record<string, unknown>).label);
      const contentEntry =
        this.normalizeString(entry.content) ??
        this.normalizeString((entry as Record<string, unknown>).description) ??
        this.normalizeString((entry as Record<string, unknown>).scenario);

      const normalized: { title?: string; content?: string } = {};
      if (titleEntry) normalized.title = titleEntry;
      if (contentEntry) normalized.content = contentEntry;
      return normalized;
    }).filter((entry) => Object.keys(entry).length > 0);

    const valeurs = this.normalizeRecordArray(row.valeurs_professionnelles).map((entry) => {
      const titleEntry = this.normalizeString(entry.title) ?? this.normalizeString((entry as Record<string, unknown>).label);
      const descriptionEntry =
        this.normalizeString(entry.description) ?? this.normalizeString((entry as Record<string, unknown>).detail);

      const normalized: { title?: string; description?: string } = {};
      if (titleEntry) normalized.title = titleEntry;
      if (descriptionEntry) normalized.description = descriptionEntry;
      return normalized;
    }).filter((entry) => Object.keys(entry).length > 0);

    const competences = this.normalizeRecordArray(row.competences_oic);

    const tags = this.normalizeStringArray(row.tags_medicaux);
    const keywords = this.normalizeStringArray(row.mots_cles);

    const createdAt = this.normalizeString(row.created_at);
    const updatedAt = this.normalizeString(row.updated_at);

    const normalized: NormalizedEdnItem = {
      id: itemId ?? slug ?? itemCode,
      item_code: itemCode,
      item_id: itemId,
      slug,
      title,
      specialite,
      domaine_medical: domaine,
      rang_a_competence_count: this.normalizeNumber(row.rang_a_competence_count),
      rang_b_competence_count: this.normalizeNumber(row.rang_b_competence_count),
      total_competence_count: this.normalizeNumber(row.total_competence_count),
      niveau_complexite: this.normalizeString(row.niveau_complexite),
      tableaux: normalizedTableaux,
      ecos_contexts: ecos,
      valeurs_professionnelles: valeurs,
      competences_oic: competences,
      mots_cles: keywords,
      tags_medicaux: tags,
      created_at: createdAt,
      updated_at: updatedAt,
      raw: row,
    };

    return normalized;
  }

  private getTestUnifiedItems(): NormalizedEdnItem[] {
    const now = new Date().toISOString();

    const rows: EdnUnifiedRow[] = [
      {
        item_code: 'CARDIO-001',
        item_id: 'cardio-master-class',
        slug: 'cardio-master-class',
        title: 'Insuffisance cardiaque',
        specialite: 'Cardiologie',
        domaine_medical: 'Cardiologie',
        rang_a_competence_count: 4,
        rang_b_competence_count: 3,
        total_competence_count: 7,
        niveau_complexite: 'intermediaire',
        updated_at: now,
        created_at: now,
        tableaux: {
          rang_a: {
            sections: [
              { title: 'Physiopathologie', concept: "Altération de la fonction systolique" },
              { title: 'Diagnostic', concept: "NYHA et fraction d'éjection" },
            ],
          },
          rang_b: {
            sections: [
              { title: 'Prise en charge', technique: "IEC, bêta-bloquants, diurétiques" },
              { title: 'Suivi', technique: 'Surveillance du poids et des œdèmes' },
            ],
          },
        } as unknown as Json,
        ecos_contexts: [
          { title: 'Consultation cardio', content: "Prise en charge d'un patient dyspnéique" },
        ] as unknown as Json,
        valeurs_professionnelles: [
          { title: 'Relation patient', description: "Annonce du diagnostic et éducation thérapeutique" },
        ] as unknown as Json,
        competences_oic: [] as unknown as Json,
        mots_cles: ['cardiologie', 'insuffisance'] as unknown as Json,
        tags_medicaux: ['cardio'] as unknown as Json,
      },
      {
        item_code: 'NEURO-014',
        item_id: 'neuro-recap',
        slug: 'neuro-recap',
        title: 'Accident vasculaire cérébral',
        specialite: 'Neurologie',
        domaine_medical: 'Neurologie',
        rang_a_competence_count: 5,
        rang_b_competence_count: 4,
        total_competence_count: 9,
        niveau_complexite: 'avance',
        updated_at: now,
        created_at: now,
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
        } as unknown as Json,
        ecos_contexts: [
          { title: 'Simulation USI', content: 'Gestion des complications post-AVC' },
        ] as unknown as Json,
        valeurs_professionnelles: [
          { title: "Esprit d'équipe", description: 'Coordination neuro / radiologie / urgence' },
        ] as unknown as Json,
        competences_oic: [] as unknown as Json,
        mots_cles: ['neurologie', 'urgence'] as unknown as Json,
        tags_medicaux: ['neuro'] as unknown as Json,
      },
      {
        item_code: 'PNEUMO-021',
        item_id: 'pneumo-update',
        slug: 'pneumo-update',
        title: 'Asthme aigu grave',
        specialite: 'Pneumologie',
        domaine_medical: 'Pneumologie',
        rang_a_competence_count: 3,
        rang_b_competence_count: 2,
        total_competence_count: 5,
        niveau_complexite: 'base',
        updated_at: now,
        created_at: now,
        tableaux: {
          rang_a: { sections: [{ title: 'Cliniques', concept: 'Sibilants, tirage, débit expiratoire' }] },
          rang_b: { sections: [{ title: 'Traitement', technique: "Oxygénothérapie, β2 mimétiques" }] },
        } as unknown as Json,
        ecos_contexts: [
          { title: 'SAU', content: "Gestion d'une crise sévère" },
        ] as unknown as Json,
        valeurs_professionnelles: [
          { title: 'Communication', description: "Explication du plan d'action au patient" },
        ] as unknown as Json,
        competences_oic: [] as unknown as Json,
        mots_cles: ['pneumologie'] as unknown as Json,
        tags_medicaux: ['respiratoire'] as unknown as Json,
      },
    ] as unknown as EdnUnifiedRow[];

    return rows
      .map((row) => this.normalizeUnifiedRow(row))
      .filter(this.notEmpty);
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

  async fetchUnifiedItems(): Promise<NormalizedEdnItem[]> {
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

    return (data ?? [])
      .map((row) => this.normalizeUnifiedRow(row))
      .filter(this.notEmpty);
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
