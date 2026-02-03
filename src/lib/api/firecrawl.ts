/**
 * 🔥 Firecrawl API Client
 * 
 * Utilisations:
 * - Scraper des pages web (extraire markdown, HTML, screenshots)
 * - Rechercher sur le web avec filtres
 * - Mapper un site (découvrir toutes les URLs)
 * - Crawler un site entier
 */

import { supabase } from '@/integrations/supabase/client';

type FirecrawlResponse<T = any> = {
  success: boolean;
  error?: string;
  data?: T;
};

type ScrapeFormat = 
  | 'markdown' 
  | 'html' 
  | 'rawHtml' 
  | 'links' 
  | 'screenshot' 
  | 'branding' 
  | 'summary'
  | { type: 'json'; schema?: object; prompt?: string };

type ScrapeOptions = {
  formats?: ScrapeFormat[];
  onlyMainContent?: boolean;
  waitFor?: number;
  location?: { country?: string; languages?: string[] };
};

type SearchOptions = {
  limit?: number;
  lang?: string;
  country?: string;
  tbs?: string; // Time filter: 'qdr:h' (hour), 'qdr:d' (day), 'qdr:w' (week), 'qdr:m' (month), 'qdr:y' (year)
  scrapeOptions?: { formats?: ('markdown' | 'html')[] };
};

export const firecrawlApi = {
  /**
   * Scrape une URL unique
   * @example firecrawlApi.scrape('https://uness.fr/guidelines', { formats: ['markdown', 'summary'] })
   */
  async scrape(url: string, options?: ScrapeOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
      body: { url, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  /**
   * Recherche sur le web et optionnellement scrape les résultats
   * @example firecrawlApi.search('guidelines insuffisance cardiaque HAS 2024', { limit: 5 })
   */
  async search(query: string, options?: SearchOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-search', {
      body: { query, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },
};

export type { ScrapeOptions, SearchOptions, FirecrawlResponse };
