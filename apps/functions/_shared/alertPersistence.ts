/**
 * Service de persistance pour les alertes unifiées
 * Gère l'insertion, la mise à jour et la déduplication
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { AlertScoring, ScoringResult } from "./alertScoring.ts";

export interface UnifiedAlert {
  id?: string;
  external_id: string;
  source: 'pagerduty' | 'nvd';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  created_at: string;
  url?: string;
  cvss_score?: number;
  status?: string;
  unified_score?: number;
  occurrence_count?: number;
}

export class AlertPersistence {
  private supabase: any;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Sauvegarde ou met à jour une alerte avec scoring
   */
  async upsertAlert(alert: UnifiedAlert): Promise<UnifiedAlert> {
    try {
      // 1. Vérifier si l'alerte existe déjà
      const { data: existing } = await this.supabase
        .from("unified_alerts")
        .select("*")
        .eq("external_id", alert.external_id)
        .single();

      let occurrenceCount = 1;
      let alertId: string;

      if (existing) {
        // Alerte existante - incrémenter occurrence
        occurrenceCount = (existing.occurrence_count || 1) + 1;
        alertId = existing.id;

        console.log(`[AlertPersistence] Existing alert found: ${alert.external_id}, occurrence: ${occurrenceCount}`);
      }

      // 2. Calculer le score unifié
      const scoring: ScoringResult = AlertScoring.calculateScore(
        alert.source,
        alert.severity,
        alert.cvss_score || null,
        alert.status || null,
        alert.created_at,
        occurrenceCount
      );

      console.log(`[AlertPersistence] Calculated score: ${scoring.unified_score} (${scoring.priority_level})`);

      // 3. Préparer les données
      const alertData = {
        external_id: alert.external_id,
        source: alert.source,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        cvss_score: alert.cvss_score,
        unified_score: scoring.unified_score,
        status: alert.status || 'active',
        url: alert.url,
        created_at: alert.created_at,
        occurrence_count: occurrenceCount,
        metadata: {
          scoring_factors: scoring.factors,
          priority_level: scoring.priority_level,
        },
      };

      // 4. Upsert dans la base
      const { data: upserted, error } = await this.supabase
        .from("unified_alerts")
        .upsert(alertData, {
          onConflict: "external_id",
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) {
        console.error("[AlertPersistence] Upsert error:", error);
        throw error;
      }

      alertId = upserted.id;

      // 5. Enregistrer l'historique du score
      await this.saveScoreHistory(alertId, scoring);

      return upserted;
    } catch (error) {
      console.error("[AlertPersistence] Error upserting alert:", error);
      throw error;
    }
  }

  /**
   * Sauvegarde multiple d'alertes en batch
   */
  async upsertAlerts(alerts: UnifiedAlert[]): Promise<UnifiedAlert[]> {
    const results: UnifiedAlert[] = [];

    for (const alert of alerts) {
      try {
        const saved = await this.upsertAlert(alert);
        results.push(saved);
      } catch (error) {
        console.error(`[AlertPersistence] Failed to upsert alert ${alert.external_id}:`, error);
        // Continue avec les autres
      }
    }

    console.log(`[AlertPersistence] Batch upsert complete: ${results.length}/${alerts.length} alerts`);
    return results;
  }

  /**
   * Récupère toutes les alertes actives
   */
  async getActiveAlerts(limit = 100): Promise<UnifiedAlert[]> {
    try {
      const { data, error } = await this.supabase
        .from("unified_alerts")
        .select("*")
        .eq("status", "active")
        .order("unified_score", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("[AlertPersistence] Error fetching active alerts:", error);
      return [];
    }
  }

  /**
   * Enregistre l'historique du score
   */
  private async saveScoreHistory(alertId: string, scoring: ScoringResult): Promise<void> {
    try {
      await this.supabase.from("alert_score_history").insert({
        alert_id: alertId,
        unified_score: scoring.unified_score,
        pagerduty_score: scoring.factors.pagerduty_score,
        cvss_normalized_score: scoring.factors.cvss_normalized_score,
        age_score: scoring.factors.age_score,
        frequency_score: scoring.factors.frequency_score,
        factors: scoring.factors,
      });
    } catch (error) {
      console.error("[AlertPersistence] Failed to save score history:", error);
    }
  }

  /**
   * Résout une alerte
   */
  async resolveAlert(externalId: string): Promise<void> {
    try {
      await this.supabase
        .from("unified_alerts")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
        })
        .eq("external_id", externalId);

      console.log(`[AlertPersistence] Alert resolved: ${externalId}`);
    } catch (error) {
      console.error("[AlertPersistence] Error resolving alert:", error);
    }
  }
}
