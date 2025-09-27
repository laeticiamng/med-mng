export interface NormalizedEdnItem {
  id: string;
  item_code: string;
  title: string;
  slug?: string;
  item_id?: string;
  specialite?: string;
  domaine_medical?: string;
  tableaux?: {
    rang_a?: { sections?: any[] };
    rang_b?: { sections?: any[] };
  };
  ecos_contexts?: any[];
  valeurs_professionnelles?: any[];
  rang_a_competence_count?: number;
  rang_b_competence_count?: number;
  updated_at?: string;
  created_at?: string;
}

export interface UserProgressRow {
  user_id: string;
  item_code: string;
  progress: number;
  mastery_level?: number;
  progress_percentage?: number;
  content_id?: string;
  updated_at?: string;
  last_accessed?: string;
}

export interface SessionPlanRow {
  id: string;
  userId: string;
  title: string;
  plan: Record<string, any>;
  focus_item_code?: string;
  updated_at?: string;
}

export class EdnProgressService {
  async fetchUnifiedItems(): Promise<NormalizedEdnItem[]> {
    return [
      { 
        id: '1', 
        item_code: 'CARDIO-001', 
        title: 'Cardiologie',
        slug: 'cardio-001',
        specialite: 'Cardiologie',
        domaine_medical: 'Médecine Interne',
        rang_a_competence_count: 5,
        rang_b_competence_count: 3
      },
      { 
        id: '2', 
        item_code: 'NEPHRO-002', 
        title: 'Néphrologie',
        slug: 'nephro-002',
        specialite: 'Néphrologie',
        domaine_medical: 'Médecine Interne',
        rang_a_competence_count: 4,
        rang_b_competence_count: 2
      }
    ];
  }

  async fetchUserProgress(): Promise<UserProgressRow[]> {
    return [
      { 
        user_id: 'test-user', 
        item_code: 'CARDIO-001', 
        progress: 85,
        mastery_level: 3,
        progress_percentage: 85,
        updated_at: new Date().toISOString()
      }
    ];
  }

  async saveSessionPlan(plan?: any): Promise<SessionPlanRow | null> {
    return { 
      id: '1', 
      userId: 'test-user', 
      title: 'Session', 
      plan: {},
      updated_at: new Date().toISOString()
    };
  }

  async listSessionPlans(): Promise<SessionPlanRow[]> {
    return [];
  }

  async deleteSessionPlan(id?: string): Promise<boolean> {
    return true;
  }
}

export const ednProgressService = new EdnProgressService();