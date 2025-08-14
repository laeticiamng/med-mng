import { jsonResponse, errorResponse } from '../response.ts';
import { log } from '../logger.ts';
import { MonitoringService } from '../middleware/monitoring.ts';
import { SecurityService } from '../middleware/security.ts';
import { getCSRFMetrics } from '../middleware/csrf.ts';

export async function handleStatus(req: Request, supabase: any, path: string, url: URL): Promise<Response | null> {
  // GET /status - System status and feature flags
  if (path === '/status' && req.method === 'GET') {
    try {
      const features = {
        csrf_protection: true,
        rate_limiting: true,
        monitoring: true,
        security_scanning: true,
        quota_management: true,
        audit_logging: true,
        streaming_security: true,
        rgpd_compliance: true
      };

      const systemStatus = {
        status: 'operational',
        version: '2.1.0',
        timestamp: new Date().toISOString(),
        features,
        compatibility: {
          frontendMinVersion: '1.0.0',
          frontendShouldUpgrade: false,
          breaking_changes: []
        },
        metrics: {
          monitoring: MonitoringService.getHealthMetrics(),
          security: SecurityService.getSecurityMetrics(),
          csrf: getCSRFMetrics()
        }
      };

      // Check system health
      const healthCheck = await performHealthCheck(supabase);
      systemStatus.status = healthCheck.healthy ? 'operational' : 'degraded';

      return jsonResponse(systemStatus);
    } catch (error) {
      log('error', 'Status endpoint error', error);
      return errorResponse(500, 'STATUS_ERROR', 'Failed to get system status');
    }
  }

  // GET /status/data-completeness - Data completeness report
  if (path === '/status/data-completeness' && req.method === 'GET') {
    try {
      const completeness = await getDataCompleteness(supabase);
      return jsonResponse(completeness);
    } catch (error) {
      log('error', 'Data completeness check error', error);
      return errorResponse(500, 'COMPLETENESS_ERROR', 'Failed to check data completeness');
    }
  }

  return null;
}

async function performHealthCheck(supabase: any) {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('edn_items_immersive')
      .select('id')
      .limit(1);

    if (error) {
      log('error', 'Health check database error', error);
      return { healthy: false, reason: 'Database connection failed' };
    }

    return { healthy: true };
  } catch (error) {
    log('error', 'Health check error', error);
    return { healthy: false, reason: 'System error' };
  }
}

async function getDataCompleteness(supabase: any) {
  try {
    // Check EDN items completeness
    const { data: ednItems, error: ednError } = await supabase
      .from('edn_items_immersive')
      .select('id, item_code, tableau_rang_a, tableau_rang_b, quiz_questions, scene_immersive');

    if (ednError) throw ednError;

    const ednStats = {
      total: ednItems.length,
      with_rang_a: ednItems.filter(item => item.tableau_rang_a).length,
      with_rang_b: ednItems.filter(item => item.tableau_rang_b).length,
      with_quiz: ednItems.filter(item => item.quiz_questions).length,
      with_scene: ednItems.filter(item => item.scene_immersive).length
    };

    // Check OIC competences
    const { data: oicData, error: oicError } = await supabase
      .from('backup_oic_competences')
      .select('item_parent, rang')
      .neq('item_parent', null);

    if (oicError) throw oicError;

    const oicStats = {
      total: oicData.length,
      rang_a: oicData.filter(comp => comp.rang === 'A').length,
      rang_b: oicData.filter(comp => comp.rang === 'B').length,
      unique_items: [...new Set(oicData.map(comp => comp.item_parent))].length
    };

    return {
      timestamp: new Date().toISOString(),
      edn_items: ednStats,
      oic_competences: oicStats,
      completeness_score: calculateCompletenessScore(ednStats, oicStats),
      gaps: identifyDataGaps(ednItems, oicData)
    };
  } catch (error) {
    throw error;
  }
}

function calculateCompletenessScore(ednStats: any, oicStats: any): number {
  const maxScore = 100;
  let score = 0;

  // EDN items score (50% weight)
  if (ednStats.total > 0) {
    const ednComplete = (
      (ednStats.with_rang_a / ednStats.total) * 0.3 +
      (ednStats.with_rang_b / ednStats.total) * 0.3 +
      (ednStats.with_quiz / ednStats.total) * 0.2 +
      (ednStats.with_scene / ednStats.total) * 0.2
    ) * 50;
    score += ednComplete;
  }

  // OIC competences score (50% weight)
  if (oicStats.total > 0) {
    const oicBalance = oicStats.rang_a > 0 && oicStats.rang_b > 0 ? 1 : 0.5;
    score += oicBalance * 50;
  }

  return Math.round(score);
}

function identifyDataGaps(ednItems: any[], oicData: any[]): string[] {
  const gaps: string[] = [];
  
  const itemsWithoutRangA = ednItems.filter(item => !item.tableau_rang_a);
  const itemsWithoutRangB = ednItems.filter(item => !item.tableau_rang_b);
  const itemsWithoutQuiz = ednItems.filter(item => !item.quiz_questions);
  
  if (itemsWithoutRangA.length > 0) {
    gaps.push(`${itemsWithoutRangA.length} items missing Rang A content`);
  }
  
  if (itemsWithoutRangB.length > 0) {
    gaps.push(`${itemsWithoutRangB.length} items missing Rang B content`);
  }
  
  if (itemsWithoutQuiz.length > 0) {
    gaps.push(`${itemsWithoutQuiz.length} items missing quiz content`);
  }

  return gaps;
}