import { supabase } from "@/integrations/supabase/client"
import { errorService } from '@/services/core/ErrorService';

export interface TableauRang {
  title?: string
  sections?: Array<{
    title: string
    content: string
    keywords?: string[]
  }>
}

export interface ItemCompleteness {
  item_id: string
  item_code: string
  title: string
  completeness_score: number
  missing_fields: string[]
  rang_a_complete: boolean
  rang_b_complete: boolean
  issues: string[]
}

export interface CompletenessAuditResult {
  summary: {
    total_items: number
    complete_items: number
    incomplete_items: number
    completion_rate: number
    audit_timestamp: string
  }
  results: ItemCompleteness[]
  incomplete_items: ItemCompleteness[]
  critical_issues: ItemCompleteness[]
}

class EdnTableauxService {
  private baseUrl = `https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/edn-tableaux-api`

  async getTableauRangA(itemId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('edn-tableaux-api', {
        body: null,
        method: 'GET'
      })

      if (error) throw error
      return data
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : new Error('Error fetching tableau Rang A'), 'api_call');
      throw error
    }
  }

  async getTableauRangB(itemId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/items/${itemId}/tableau-rang-b`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : new Error('Error fetching tableau Rang B'), 'api_call');
      throw error
    }
  }

  async getBothTableaux(itemId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/items/${itemId}/tableaux`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : new Error('Error fetching both tableaux'), 'api_call');
      throw error
    }
  }

  async runCompletenessAudit(): Promise<CompletenessAuditResult> {
    try {
      const response = await fetch(`${this.baseUrl}/items/completeness-audit`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      errorService.handleInfo('Completeness audit results', 'system', result.summary);
      
      return result
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : new Error('Error running completeness audit'), 'api_call');
      throw error
    }
  }

  // Méthode helper pour vérifier si un item est complet
  isItemComplete(item: ItemCompleteness): boolean {
    return item.completeness_score >= 80
  }

  // Méthode helper pour obtenir le niveau de criticité
  getCriticalityLevel(completenessScore: number): 'complete' | 'warning' | 'critical' {
    if (completenessScore >= 80) return 'complete'
    if (completenessScore >= 50) return 'warning'
    return 'critical'
  }

  // Méthode helper pour formater les issues
  formatIssues(issues: string[]): string {
    if (issues.length === 0) return 'Aucun problème détecté'
    if (issues.length === 1) return issues[0]
    return `${issues.length} problèmes: ${issues.join(', ')}`
  }
}

export const ednTableauxService = new EdnTableauxService()