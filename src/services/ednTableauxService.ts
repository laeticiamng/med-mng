import { supabase } from "@/integrations/supabase/client"

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
      console.error('❌ Error fetching tableau Rang A:', error)
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
      console.error('❌ Error fetching tableau Rang B:', error)
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
      console.error('❌ Error fetching both tableaux:', error)
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
      console.log('📊 Completeness audit results:', result.summary)
      
      return result
    } catch (error) {
      console.error('❌ Error running completeness audit:', error)
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

  // Obtenir tous les items avec leurs scores de complétion
  async getAllItemsCompleteness(): Promise<ItemCompleteness[]> {
    try {
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select('id, item_code, title, tableau_rang_a, tableau_rang_b, completeness_score')
        .order('item_code')

      if (error) throw error

      return (data || []).map(item => {
        const hasRangA = Boolean(item.tableau_rang_a && Object.keys(item.tableau_rang_a).length > 0)
        const hasRangB = Boolean(item.tableau_rang_b && Object.keys(item.tableau_rang_b).length > 0)

        const missingFields: string[] = []
        if (!hasRangA) missingFields.push('tableau_rang_a')
        if (!hasRangB) missingFields.push('tableau_rang_b')

        return {
          item_id: item.id,
          item_code: item.item_code,
          title: item.title,
          completeness_score: item.completeness_score || (hasRangA && hasRangB ? 100 : hasRangA || hasRangB ? 50 : 0),
          missing_fields: missingFields,
          rang_a_complete: hasRangA,
          rang_b_complete: hasRangB,
          issues: missingFields.map(f => `${f} manquant`)
        }
      })
    } catch (error) {
      console.error('Error fetching all items completeness:', error)
      return []
    }
  }

  // Obtenir les statistiques globales de complétion
  async getCompletenessStats(): Promise<{
    totalItems: number
    completeItems: number
    partialItems: number
    incompleteItems: number
    averageScore: number
  }> {
    try {
      const items = await this.getAllItemsCompleteness()

      const completeItems = items.filter(i => i.completeness_score >= 80).length
      const partialItems = items.filter(i => i.completeness_score >= 40 && i.completeness_score < 80).length
      const incompleteItems = items.filter(i => i.completeness_score < 40).length
      const averageScore = items.length > 0
        ? Math.round(items.reduce((sum, i) => sum + i.completeness_score, 0) / items.length)
        : 0

      return {
        totalItems: items.length,
        completeItems,
        partialItems,
        incompleteItems,
        averageScore
      }
    } catch (error) {
      console.error('Error getting completeness stats:', error)
      return {
        totalItems: 0,
        completeItems: 0,
        partialItems: 0,
        incompleteItems: 0,
        averageScore: 0
      }
    }
  }

  // Rechercher dans les tableaux
  async searchInTableaux(query: string, rang: 'a' | 'b' | 'both' = 'both'): Promise<Array<{
    itemCode: string
    title: string
    matches: string[]
  }>> {
    try {
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select('item_code, title, tableau_rang_a, tableau_rang_b')

      if (error) throw error
      if (!data) return []

      const queryLower = query.toLowerCase()
      const results: Array<{ itemCode: string; title: string; matches: string[] }> = []

      data.forEach(item => {
        const matches: string[] = []

        const searchInObject = (obj: any, prefix: string) => {
          if (!obj) return
          if (typeof obj === 'string' && obj.toLowerCase().includes(queryLower)) {
            matches.push(`${prefix}: ${obj.slice(0, 100)}...`)
          } else if (Array.isArray(obj)) {
            obj.forEach((el, idx) => searchInObject(el, `${prefix}[${idx}]`))
          } else if (typeof obj === 'object') {
            Object.entries(obj).forEach(([key, val]) => searchInObject(val, `${prefix}.${key}`))
          }
        }

        if (rang === 'a' || rang === 'both') {
          searchInObject(item.tableau_rang_a, 'Rang A')
        }
        if (rang === 'b' || rang === 'both') {
          searchInObject(item.tableau_rang_b, 'Rang B')
        }

        if (matches.length > 0) {
          results.push({
            itemCode: item.item_code,
            title: item.title,
            matches: matches.slice(0, 5) // Limiter à 5 correspondances par item
          })
        }
      })

      return results
    } catch (error) {
      console.error('Error searching in tableaux:', error)
      return []
    }
  }

  // Exporter les données d'un item
  async exportItemData(itemCode: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .eq('item_code', itemCode)
        .single()

      if (error) throw error
      if (!data) throw new Error('Item non trouvé')

      if (format === 'json') {
        return JSON.stringify(data, null, 2)
      }

      // Format CSV simplifié
      const headers = Object.keys(data)
      const values = Object.values(data).map(v =>
        typeof v === 'object' ? JSON.stringify(v) : String(v)
      )
      return `${headers.join(',')}\n${values.join(',')}`
    } catch (error) {
      console.error('Error exporting item data:', error)
      throw error
    }
  }

  // Comparer deux items
  compareItems(item1: ItemCompleteness, item2: ItemCompleteness): {
    betterItem: string
    differences: string[]
    recommendation: string
  } {
    const differences: string[] = []

    if (item1.rang_a_complete !== item2.rang_a_complete) {
      differences.push(`Rang A: ${item1.rang_a_complete ? item1.item_code : item2.item_code} complet`)
    }
    if (item1.rang_b_complete !== item2.rang_b_complete) {
      differences.push(`Rang B: ${item1.rang_b_complete ? item1.item_code : item2.item_code} complet`)
    }
    if (Math.abs(item1.completeness_score - item2.completeness_score) > 10) {
      differences.push(`Score: ${item1.item_code} (${item1.completeness_score}%) vs ${item2.item_code} (${item2.completeness_score}%)`)
    }

    const betterItem = item1.completeness_score >= item2.completeness_score ? item1.item_code : item2.item_code
    const recommendation = differences.length === 0
      ? 'Les deux items sont similaires en termes de complétion'
      : `Concentrez-vous sur ${item1.completeness_score < item2.completeness_score ? item1.item_code : item2.item_code}`

    return { betterItem, differences, recommendation }
  }

  // Obtenir le badge de criticité avec couleur
  getCriticalityBadge(score: number): { level: string; color: string; bgColor: string } {
    if (score >= 80) {
      return { level: 'Complet', color: 'text-success', bgColor: 'bg-success/10' }
    }
    if (score >= 50) {
      return { level: 'Partiel', color: 'text-warning', bgColor: 'bg-warning/10' }
    }
    return { level: 'Critique', color: 'text-destructive', bgColor: 'bg-destructive/10' }
  }

  // Calculer la progression quotidienne
  calculateDailyProgress(items: ItemCompleteness[], targetPerDay: number = 5): {
    completedToday: number
    targetReached: boolean
    progress: number
    recommendation: string
  } {
    // Pour l'instant, retourne des valeurs par défaut
    // À améliorer avec un vrai tracking des modifications quotidiennes
    return {
      completedToday: 0,
      targetReached: false,
      progress: 0,
      recommendation: `Complétez ${targetPerDay} items aujourd'hui pour atteindre votre objectif`
    }
  }
}

export const ednTableauxService = new EdnTableauxService()