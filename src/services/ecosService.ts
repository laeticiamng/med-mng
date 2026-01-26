import { supabase } from "@/integrations/supabase/client";

export interface EcosSituation {
  id: string;
  sd_id: number;
  intitule_sd: string;
  contenu_complet_html: string;
  competences_associees: string[];
  url_source?: string;
  created_at: string;
  updated_at: string;
}

export interface EcosPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EcosSearchResult {
  situations: EcosSituation[];
  pagination: EcosPagination;
}

export interface EcosAnalytics {
  total_situations: number;
  total_competences: number;
  avg_competences_per_situation: number;
  top_competences: Array<{
    competence: string;
    count: number;
  }>;
  distribution_by_competences: {
    with_competences: number;
    without_competences: number;
  };
  recent_additions: Array<{
    sd_id: number;
    intitule_sd: string;
    created_at: string;
  }>;
}

export interface EcosSearchCriteria {
  keywords?: string[];
  competences?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  contentType?: string;
}

class EcosService {
  async getSituations(
    _page: number = 1,
    _limit: number = 20,
    _search: string = '',
    _competences: string = ''
  ): Promise<EcosSearchResult> {
    const { data, error } = await supabase.functions.invoke('ecos-api', {
      body: null,
      method: 'GET',
    });

    if (error) {
      console.error('Error fetching ECOS situations:', error);
      throw new Error('Erreur lors de la récupération des situations ECOS');
    }

    return data;
  }

  async getSituation(_id: number): Promise<EcosSituation> {
    const { data, error } = await supabase.functions.invoke('ecos-api', {
      body: null,
      method: 'GET',
    });

    if (error) {
      console.error('Error fetching ECOS situation:', error);
      throw new Error('Erreur lors de la récupération de la situation ECOS');
    }

    return data;
  }

  async getCompetences(): Promise<string[]> {
    const { data, error } = await supabase.functions.invoke('ecos-api', {
      body: null,
      method: 'GET',
    });

    if (error) {
      console.error('Error fetching ECOS competences:', error);
      throw new Error('Erreur lors de la récupération des compétences');
    }

    return data.competences || [];
  }

  async getAnalytics(): Promise<EcosAnalytics> {
    const { data, error } = await supabase.functions.invoke('ecos-api', {
      body: null,
      method: 'GET',
    });

    if (error) {
      console.error('Error fetching ECOS analytics:', error);
      throw new Error('Erreur lors de la récupération des analytics ECOS');
    }

    return data;
  }

  async advancedSearch(
    criteria: EcosSearchCriteria,
    page: number = 1,
    limit: number = 20
  ): Promise<EcosSearchResult & { search_criteria: EcosSearchCriteria }> {
    const { data, error } = await supabase.functions.invoke('ecos-api', {
      body: {
        ...criteria,
        page,
        limit
      },
      method: 'POST',
    });

    if (error) {
      console.error('Error in advanced ECOS search:', error);
      throw new Error('Erreur lors de la recherche avancée ECOS');
    }

    return data;
  }

  // Utilitaires
  parseHtmlContent(htmlContent: string): string {
    // Supprimer les balises HTML et nettoyer le contenu
    return htmlContent
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }

  extractKeywords(content: string, maxKeywords: number = 10): string[] {
    const words = this.parseHtmlContent(content)
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['avec', 'dans', 'pour', 'sont', 'cette', 'peut', 'plus', 'tout', 'leur', 'entre'].includes(word));

    const wordCount = new Map();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    return Array.from(wordCount.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }

  formatCompetences(competences: string[]): string {
    if (!competences || competences.length === 0) return 'Aucune compétence associée';
    
    if (competences.length <= 3) {
      return competences.join(', ');
    }
    
    return competences.slice(0, 3).join(', ') + ` et ${competences.length - 3} autre(s)`;
  }

  getCompetenceColor(competence: string): string {
    const colors = [
      'bg-primary/10 text-primary',
      'bg-success/10 text-success', 
      'bg-accent/10 text-accent-foreground',
      'bg-warning/10 text-warning',
      'bg-destructive/10 text-destructive',
      'bg-secondary text-secondary-foreground'
    ];
    
    let hash = 0;
    for (let i = 0; i < competence.length; i++) {
      hash = competence.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }

  calculateReadingTime(content: string): number {
    const plainText = this.parseHtmlContent(content);
    const wordsPerMinute = 200;
    const words = plainText.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  // Marquer une situation comme étudiée
  async markAsStudied(userId: string, sdId: number): Promise<boolean> {
    try {
      await supabase.from('user_activity_log').insert({
        user_id: userId,
        activity_type: 'ecos',
        activity_date: new Date().toISOString().split('T')[0],
        count: 1,
        metadata: { sd_id: sdId, action: 'studied' }
      });
      return true;
    } catch (error) {
      console.error('Error marking situation as studied:', error);
      return false;
    }
  }

  // Obtenir les situations étudiées par l'utilisateur
  async getStudiedSituations(userId: string): Promise<number[]> {
    try {
      const { data } = await supabase
        .from('user_activity_log')
        .select('metadata')
        .eq('user_id', userId)
        .eq('activity_type', 'ecos');

      if (!data) return [];

      return data
        .filter(d => d.metadata && (d.metadata as any).sd_id)
        .map(d => (d.metadata as any).sd_id);
    } catch (error) {
      console.error('Error getting studied situations:', error);
      return [];
    }
  }

  // Calculer le score de difficulté d'une situation
  calculateDifficultyScore(situation: EcosSituation): number {
    const contentLength = this.parseHtmlContent(situation.contenu_complet_html).length;
    const competenceCount = situation.competences_associees?.length || 0;

    let score = 0;

    // Longueur du contenu (0-40 points)
    if (contentLength > 5000) score += 40;
    else if (contentLength > 2000) score += 25;
    else if (contentLength > 1000) score += 15;
    else score += 5;

    // Nombre de compétences (0-30 points)
    score += Math.min(competenceCount * 6, 30);

    // Complexité estimée basée sur les mots-clés médicaux
    const medicalTerms = ['diagnostic', 'traitement', 'examen', 'clinique', 'symptôme', 'étiologie', 'physiopathologie'];
    const content = this.parseHtmlContent(situation.contenu_complet_html).toLowerCase();
    const termCount = medicalTerms.filter(term => content.includes(term)).length;
    score += termCount * 5;

    return Math.min(score, 100);
  }

  // Obtenir des situations recommandées (using ecos_situations table that exists)
  async getRecommendedSituations(userId: string, count: number = 5): Promise<EcosSituation[]> {
    try {
      const studiedIds = await this.getStudiedSituations(userId);

      // Use any cast to bypass type checking for table that may not exist in types
      const { data } = await (supabase as any)
        .from('ecos_situations')
        .select('*')
        .limit(count + studiedIds.length);

      if (!data) return [];

      // Map and filter the data
      return (data as unknown as EcosSituation[])
        .filter(s => !studiedIds.includes(s.sd_id))
        .slice(0, count);
    } catch (error) {
      console.error('Error getting recommended situations:', error);
      return [];
    }
  }

  // Statistiques utilisateur ECOS
  async getUserEcosStats(userId: string): Promise<{
    totalStudied: number;
    lastStudied: string | null;
    favoriteCompetences: string[];
    studyStreak: number;
  }> {
    try {
      const { data } = await supabase
        .from('user_activity_log')
        .select('activity_date, metadata')
        .eq('user_id', userId)
        .eq('activity_type', 'ecos')
        .order('activity_date', { ascending: false });

      if (!data || data.length === 0) {
        return {
          totalStudied: 0,
          lastStudied: null,
          favoriteCompetences: [],
          studyStreak: 0
        };
      }

      // Calculer le streak
      let streak = 0;
      const today = new Date().toISOString().split('T')[0];
      const dates = [...new Set(data.map(d => d.activity_date))];

      for (let i = 0; i < dates.length; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        const checkStr = checkDate.toISOString().split('T')[0];

        if (dates.includes(checkStr) || (i === 0 && dates[0] === today)) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      // Extraire les compétences favorites à partir des métadonnées
      const competenceCounts = new Map<string, number>();
      data.forEach(d => {
        const meta = d.metadata as any;
        if (meta?.competences && Array.isArray(meta.competences)) {
          meta.competences.forEach((c: string) => {
            competenceCounts.set(c, (competenceCounts.get(c) || 0) + 1);
          });
        }
      });

      const favoriteCompetences = Array.from(competenceCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([c]) => c);

      return {
        totalStudied: data.length,
        lastStudied: data[0]?.activity_date || null,
        favoriteCompetences,
        studyStreak: streak
      };
    } catch (error) {
      console.error('Error getting user ECOS stats:', error);
      return {
        totalStudied: 0,
        lastStudied: null,
        favoriteCompetences: [],
        studyStreak: 0
      };
    }
  }

  // Générer un résumé de situation
  generateSummary(content: string, maxLength: number = 200): string {
    const plainText = this.parseHtmlContent(content);
    if (plainText.length <= maxLength) return plainText;

    const truncated = plainText.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return truncated.slice(0, lastSpace) + '...';
  }

  // Grouper les situations par compétence
  groupByCompetence(situations: EcosSituation[]): Map<string, EcosSituation[]> {
    const grouped = new Map<string, EcosSituation[]>();

    situations.forEach(situation => {
      (situation.competences_associees || []).forEach(competence => {
        if (!grouped.has(competence)) {
          grouped.set(competence, []);
        }
        grouped.get(competence)!.push(situation);
      });
    });

    return grouped;
  }
}

export const ecosService = new EcosService();