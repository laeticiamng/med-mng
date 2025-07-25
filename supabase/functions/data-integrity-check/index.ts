import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IntegrityIssue {
  table: string;
  item_id: string;
  issue_type: 'missing_field' | 'invalid_json' | 'empty_value' | 'duplicate_key' | 'corrupted_data';
  severity: 'low' | 'medium' | 'high' | 'critical';
  field_name?: string;
  description: string;
  current_value?: any;
  expected_format?: string;
}

interface IntegrityReport {
  scan_id: string;
  timestamp: string;
  tables_scanned: string[];
  total_records: number;
  issues_found: IntegrityIssue[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  status: 'passed' | 'warnings' | 'critical';
  recommendations: string[];
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

function validateJSONField(value: any, fieldName: string): IntegrityIssue | null {
  if (!value) return null;
  
  try {
    if (typeof value === 'string') {
      JSON.parse(value);
    }
    return null;
  } catch (error) {
    return {
      table: 'unknown',
      item_id: 'unknown',
      issue_type: 'invalid_json',
      severity: 'high',
      field_name: fieldName,
      description: `Invalid JSON in field ${fieldName}: ${error.message}`,
      current_value: value
    };
  }
}

function checkRequiredFields(item: any, requiredFields: string[], tableName: string): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];
  
  for (const field of requiredFields) {
    if (!item[field] || item[field] === null || item[field] === undefined) {
      issues.push({
        table: tableName,
        item_id: item.id || 'unknown',
        issue_type: 'missing_field',
        severity: 'critical',
        field_name: field,
        description: `Required field '${field}' is missing or null`,
        current_value: item[field]
      });
    }
  }
  
  return issues;
}

function checkEmptyValues(item: any, tableName: string): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];
  const suspiciousFields = ['title', 'item_code', 'content', 'message'];
  
  for (const field of suspiciousFields) {
    if (item[field] !== undefined) {
      const value = item[field];
      if (typeof value === 'string' && value.trim().length === 0) {
        issues.push({
          table: tableName,
          item_id: item.id || 'unknown',
          issue_type: 'empty_value',
          severity: 'medium',
          field_name: field,
          description: `Field '${field}' contains empty string`,
          current_value: value
        });
      }
    }
  }
  
  return issues;
}

function checkDataCorruption(item: any, tableName: string): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];
  
  // Check for suspicious patterns that might indicate corruption
  const textFields = Object.keys(item).filter(key => typeof item[key] === 'string');
  
  for (const field of textFields) {
    const value = item[field] as string;
    
    // Check for control characters or weird encoding
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(value)) {
      issues.push({
        table: tableName,
        item_id: item.id || 'unknown',
        issue_type: 'corrupted_data',
        severity: 'high',
        field_name: field,
        description: `Field '${field}' contains control characters or corrupted data`,
        current_value: value.substring(0, 100) + '...'
      });
    }
    
    // Check for extremely long strings that might be corrupted
    if (value.length > 50000) {
      issues.push({
        table: tableName,
        item_id: item.id || 'unknown',
        issue_type: 'corrupted_data',
        severity: 'medium',
        field_name: field,
        description: `Field '${field}' is suspiciously long (${value.length} chars)`,
        current_value: `Length: ${value.length}`
      });
    }
  }
  
  return issues;
}

async function checkTableIntegrity(tableName: string, config: any): Promise<IntegrityIssue[]> {
  const issues: IntegrityIssue[] = [];
  
  try {
    console.log(`🔍 Scanning table: ${tableName}`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1000); // Process in batches for large tables
    
    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      issues.push({
        table: tableName,
        item_id: 'table_error',
        issue_type: 'corrupted_data',
        severity: 'critical',
        description: `Unable to fetch data from table ${tableName}: ${error.message}`
      });
      return issues;
    }
    
    if (!data || data.length === 0) {
      issues.push({
        table: tableName,
        item_id: 'table_empty',
        issue_type: 'missing_field',
        severity: 'low',
        description: `Table ${tableName} is empty`
      });
      return issues;
    }
    
    // Check for duplicate keys if specified
    if (config.uniqueFields) {
      for (const field of config.uniqueFields) {
        const values = data.map(item => item[field]).filter(v => v);
        const duplicates = values.filter((item, index) => values.indexOf(item) !== index);
        
        if (duplicates.length > 0) {
          issues.push({
            table: tableName,
            item_id: 'duplicate_check',
            issue_type: 'duplicate_key',
            severity: 'high',
            field_name: field,
            description: `Duplicate values found in field '${field}': ${duplicates.slice(0, 5).join(', ')}`,
            current_value: duplicates.length
          });
        }
      }
    }
    
    // Check each record
    for (const item of data) {
      // Required fields validation
      if (config.requiredFields) {
        issues.push(...checkRequiredFields(item, config.requiredFields, tableName));
      }
      
      // Empty values check
      issues.push(...checkEmptyValues(item, tableName));
      
      // Data corruption check
      issues.push(...checkDataCorruption(item, tableName));
      
      // JSON fields validation
      if (config.jsonFields) {
        for (const jsonField of config.jsonFields) {
          const jsonIssue = validateJSONField(item[jsonField], jsonField);
          if (jsonIssue) {
            jsonIssue.table = tableName;
            jsonIssue.item_id = item.id || 'unknown';
            issues.push(jsonIssue);
          }
        }
      }
    }
    
  } catch (error) {
    console.error(`Unexpected error scanning ${tableName}:`, error);
    issues.push({
      table: tableName,
      item_id: 'scan_error',
      issue_type: 'corrupted_data',
      severity: 'critical',
      description: `Unexpected error during scan: ${error.message}`
    });
  }
  
  return issues;
}

async function generateIntegrityReport(): Promise<IntegrityReport> {
  const scanId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  
  // Configuration for each table to check
  const tableConfigs = {
    'edn_items_immersive': {
      requiredFields: ['id', 'item_code', 'title'],
      uniqueFields: ['item_code', 'slug'],
      jsonFields: ['tableau_rang_a', 'tableau_rang_b', 'quiz_questions', 'scene_immersive']
    },
    'edn_items_complete': {
      requiredFields: ['id', 'item_code', 'title'],
      uniqueFields: ['item_code', 'slug'],
      jsonFields: ['competences_oic_rang_a', 'competences_oic_rang_b', 'tableau_rang_a', 'tableau_rang_b']
    },
    'extraction_logs': {
      requiredFields: ['id', 'batch_id', 'batch_type', 'status'],
      uniqueFields: ['batch_id'],
      jsonFields: ['performance_metrics', 'error_details', 'session_data']
    },
    'security_incidents': {
      requiredFields: ['id', 'type', 'severity', 'file_path', 'pattern_matched'],
      uniqueFields: [],
      jsonFields: []
    },
    'monitoring_incidents': {
      requiredFields: ['id', 'incident_type', 'service_name', 'message', 'severity'],
      uniqueFields: [],
      jsonFields: ['details']
    }
  };
  
  const allIssues: IntegrityIssue[] = [];
  const tablesScanned: string[] = [];
  let totalRecords = 0;
  
  for (const [tableName, config] of Object.entries(tableConfigs)) {
    try {
      const tableIssues = await checkTableIntegrity(tableName, config);
      allIssues.push(...tableIssues);
      tablesScanned.push(tableName);
      
      // Count records for summary
      const { count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      totalRecords += count || 0;
      
    } catch (error) {
      console.error(`Failed to check table ${tableName}:`, error);
      allIssues.push({
        table: tableName,
        item_id: 'table_error',
        issue_type: 'corrupted_data',
        severity: 'critical',
        description: `Failed to scan table: ${error.message}`
      });
    }
  }
  
  // Generate summary
  const summary = {
    critical: allIssues.filter(i => i.severity === 'critical').length,
    high: allIssues.filter(i => i.severity === 'high').length,
    medium: allIssues.filter(i => i.severity === 'medium').length,
    low: allIssues.filter(i => i.severity === 'low').length
  };
  
  const status = summary.critical > 0 ? 'critical' : 
                 summary.high > 0 ? 'warnings' : 'passed';
  
  // Generate recommendations
  const recommendations: string[] = [];
  if (summary.critical > 0) {
    recommendations.push('🚨 Action immédiate requise: anomalies critiques détectées');
    recommendations.push('Bloquer les mises en production jusqu\'à résolution');
  }
  if (summary.high > 0) {
    recommendations.push('⚠️ Corriger les anomalies de haute priorité avant le prochain déploiement');
  }
  if (summary.medium > 0) {
    recommendations.push('📋 Planifier la correction des anomalies moyennes');
  }
  if (allIssues.length === 0) {
    recommendations.push('✅ Toutes les données sont intègres et exploitables');
  }
  
  return {
    scan_id: scanId,
    timestamp,
    tables_scanned: tablesScanned,
    total_records: totalRecords,
    issues_found: allIssues,
    summary,
    status,
    recommendations
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'run_check': {
        console.log('🔍 Starting data integrity check...');
        
        const report = await generateIntegrityReport();
        
        // Store the report in database
        const { error: insertError } = await supabase
          .from('data_integrity_reports')
          .insert({
            scan_id: report.scan_id,
            status: report.status,
            summary: report.summary,
            tables_scanned: report.tables_scanned,
            total_records: report.total_records,
            issues_count: report.issues_found.length,
            recommendations: report.recommendations,
            full_report: report,
            created_at: report.timestamp
          });

        if (insertError) {
          console.error('Failed to store report:', insertError);
        }

        // Send alert if critical issues found
        if (report.status === 'critical') {
          await supabase.functions.invoke('monitoring-alerts', {
            body: {
              action: 'send_alert',
              type: 'critical',
              service: 'Data Integrity',
              message: `Critical data integrity issues detected: ${report.summary.critical} critical, ${report.summary.high} high priority`,
              severity: 'critical',
              details: { scan_id: report.scan_id, summary: report.summary }
            }
          });
        }

        return new Response(JSON.stringify({
          status: 'completed',
          report: report,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_reports': {
        const { data, error } = await supabase
          .from('data_integrity_reports')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          throw error;
        }

        return new Response(JSON.stringify({
          reports: data || [],
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_report': {
        const reportId = url.searchParams.get('report_id');
        if (!reportId) {
          return new Response(JSON.stringify({ error: 'Missing report_id parameter' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { data, error } = await supabase
          .from('data_integrity_reports')
          .select('*')
          .eq('scan_id', reportId)
          .single();

        if (error) {
          throw error;
        }

        return new Response(JSON.stringify({
          report: data,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({
          error: 'Invalid action',
          available_actions: ['run_check', 'get_reports', 'get_report']
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('❌ Data integrity check error:', error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});