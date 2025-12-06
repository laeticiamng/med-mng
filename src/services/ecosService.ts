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
    page: number = 1,
    limit: number = 20,
    search: string = '',
    competences: string = ''
  ): Promise<EcosSearchResult> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(competences && { competences })
    });

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

  async getSituation(id: number): Promise<EcosSituation> {
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
}

export const ecosService = new EcosService();