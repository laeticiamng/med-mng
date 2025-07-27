import { jsonResponse, errorResponse, paginatedResponse } from '../response.ts';
import { log } from '../logger.ts';

export async function handleAudit(req: Request, supabase: any, path: string, url: URL): Promise<Response | null> {
  // GET /audit/logs - Export audit logs
  if (path === '/audit/logs' && req.method === 'GET') {
    try {
      const format = url.searchParams.get('format') || 'json';
      const startDate = url.searchParams.get('start_date');
      const endDate = url.searchParams.get('end_date');
      const type = url.searchParams.get('type');

      let query = supabase
        .from('operation_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      if (type) {
        query = query.eq('type', type);
      }

      const { data: logs, error } = await query.limit(10000);

      if (error) {
        log('error', 'Audit logs export error', error);
        return errorResponse(500, 'EXPORT_ERROR', 'Failed to export audit logs');
      }

      if (format === 'csv') {
        const csv = convertToCSV(logs);
        return new Response(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="audit_logs_${new Date().toISOString().split('T')[0]}.csv"`
          }
        });
      }

      return jsonResponse({
        total: logs.length,
        exported_at: new Date().toISOString(),
        filters: { startDate, endDate, type },
        logs
      });
    } catch (error) {
      log('error', 'Audit export error', error);
      return errorResponse(500, 'AUDIT_ERROR', 'Failed to export audit data');
    }
  }

  // GET /audit/activity - User activity export
  if (path === '/audit/activity' && req.method === 'GET') {
    try {
      const format = url.searchParams.get('format') || 'json';
      const userId = url.searchParams.get('user_id');
      const startDate = url.searchParams.get('start_date');
      const endDate = url.searchParams.get('end_date');

      let query = supabase
        .from('user_activity_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }
      if (startDate) {
        query = query.gte('timestamp', startDate);
      }
      if (endDate) {
        query = query.lte('timestamp', endDate);
      }

      const { data: activities, error } = await query.limit(10000);

      if (error) {
        log('error', 'Activity export error', error);
        return errorResponse(500, 'EXPORT_ERROR', 'Failed to export activity data');
      }

      if (format === 'csv') {
        const csv = convertToCSV(activities);
        return new Response(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="user_activity_${new Date().toISOString().split('T')[0]}.csv"`
          }
        });
      }

      return jsonResponse({
        total: activities.length,
        exported_at: new Date().toISOString(),
        filters: { userId, startDate, endDate },
        activities
      });
    } catch (error) {
      log('error', 'Activity export error', error);
      return errorResponse(500, 'ACTIVITY_ERROR', 'Failed to export activity data');
    }
  }

  // GET /audit/report - Generate comprehensive audit report
  if (path === '/audit/report' && req.method === 'GET') {
    try {
      const report = await generateAuditReport(supabase);
      return jsonResponse(report);
    } catch (error) {
      log('error', 'Audit report error', error);
      return errorResponse(500, 'REPORT_ERROR', 'Failed to generate audit report');
    }
  }

  return null;
}

function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

async function generateAuditReport(supabase: any) {
  try {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get error logs
    const { data: errorLogs } = await supabase
      .from('error_logs')
      .select('*')
      .gte('created_at', last30Days.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    // Get user activities
    const { data: userActivities } = await supabase
      .from('user_activity_logs')
      .select('activity_type, user_id, timestamp')
      .gte('timestamp', last30Days.toISOString());

    // Get operation logs
    const { data: operationLogs } = await supabase
      .from('operation_logs')
      .select('type, message, created_at')
      .gte('created_at', last30Days.toISOString());

    // Analyze data
    const errorStats = analyzeErrors(errorLogs || []);
    const activityStats = analyzeUserActivity(userActivities || []);
    const operationStats = analyzeOperations(operationLogs || []);

    return {
      generated_at: now.toISOString(),
      period: {
        start: last30Days.toISOString(),
        end: now.toISOString(),
        days: 30
      },
      summary: {
        total_errors: errorLogs?.length || 0,
        total_activities: userActivities?.length || 0,
        total_operations: operationLogs?.length || 0,
        active_users: [...new Set(userActivities?.map(a => a.user_id) || [])].length
      },
      error_analysis: errorStats,
      activity_analysis: activityStats,
      operation_analysis: operationStats,
      recommendations: generateRecommendations(errorStats, activityStats, operationStats)
    };
  } catch (error) {
    throw error;
  }
}

function analyzeErrors(errors: any[]) {
  const errorsByType = errors.reduce((acc, error) => {
    acc[error.error_type || 'unknown'] = (acc[error.error_type || 'unknown'] || 0) + 1;
    return acc;
  }, {});

  const criticalErrors = errors.filter(e => e.severity === 'critical');

  return {
    total: errors.length,
    by_type: errorsByType,
    critical_count: criticalErrors.length,
    most_frequent: Object.entries(errorsByType)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
  };
}

function analyzeUserActivity(activities: any[]) {
  const activitiesByType = activities.reduce((acc, activity) => {
    acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
    return acc;
  }, {});

  const dailyActivity = activities.reduce((acc, activity) => {
    const date = activity.timestamp.split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  return {
    total: activities.length,
    by_type: activitiesByType,
    daily_average: Object.values(dailyActivity).reduce((a: number, b: number) => a + b, 0) / Object.keys(dailyActivity).length || 0,
    peak_day: Object.entries(dailyActivity)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]
  };
}

function analyzeOperations(operations: any[]) {
  const operationsByType = operations.reduce((acc, op) => {
    acc[op.type] = (acc[op.type] || 0) + 1;
    return acc;
  }, {});

  return {
    total: operations.length,
    by_type: operationsByType,
    most_frequent: Object.entries(operationsByType)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
  };
}

function generateRecommendations(errorStats: any, activityStats: any, operationStats: any): string[] {
  const recommendations: string[] = [];

  if (errorStats.critical_count > 10) {
    recommendations.push('High number of critical errors detected. Review error handling and monitoring.');
  }

  if (errorStats.total > 100) {
    recommendations.push('Consider implementing better error prevention measures.');
  }

  if (activityStats.total < 50) {
    recommendations.push('Low user activity detected. Consider user engagement improvements.');
  }

  return recommendations;
}