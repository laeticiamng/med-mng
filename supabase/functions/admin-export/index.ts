import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { enforceRateLimit } from "../_shared/rateLimit.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ExportRequest {
  format: 'csv' | 'json' | 'xlsx';
  tables: string[];
  filters?: Record<string, any>;
  dateRange?: {
    start: string;
    end: string;
  };
  includeMetadata?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let rateLimitHeaders: Record<string, string> = {};

  try {
    const rateLimit = await enforceRateLimit(req, {
      action: 'admin.export',
      maxRequests: Number(Deno.env.get('RATE_LIMIT_EXPORT_MAX_REQUESTS') ?? '4'),
      windowSeconds: Number(Deno.env.get('RATE_LIMIT_EXPORT_WINDOW_SECONDS') ?? String(15 * 60)),
      context: { function: 'admin-export' }
    });

    if (!rateLimit.allowed && rateLimit.response) {
      const body = await rateLimit.response.text();
      return new Response(body, {
        status: rateLimit.response.status,
        headers: {
          ...corsHeaders,
          ...rateLimit.headers,
          'Retry-After': rateLimit.response.headers.get('Retry-After') ?? '900',
          'Content-Type': 'application/json'
        }
      });
    }

    rateLimitHeaders = rateLimit.headers;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { format, tables, filters, dateRange, includeMetadata } = await req.json() as ExportRequest;

    console.log(`Export demandé: ${format} pour tables: ${tables.join(', ')}`);

    const exportData: Record<string, any[]> = {};
    const metadata = {
      exportDate: new Date().toISOString(),
      format,
      tables: tables.length,
      totalRecords: 0,
      filters: filters || {},
      dateRange: dateRange || null
    };

    // Exporter chaque table demandée
    for (const tableName of tables) {
      try {
        let query = supabase.from(tableName).select('*');

        // Appliquer les filtres de date si spécifiés
        if (dateRange) {
          query = query
            .gte('created_at', dateRange.start)
            .lte('created_at', dateRange.end);
        }

        // Appliquer les filtres personnalisés
        if (filters && filters[tableName]) {
          const tableFilters = filters[tableName];
          Object.entries(tableFilters).forEach(([column, value]) => {
            if (value !== null && value !== undefined) {
              query = query.eq(column, value);
            }
          });
        }

        const { data, error } = await query.limit(10000); // Limite sécurisée

        if (error) {
          console.error(`Erreur export table ${tableName}:`, error);
          continue;
        }

        exportData[tableName] = data || [];
        metadata.totalRecords += (data || []).length;

        console.log(`Table ${tableName}: ${(data || []).length} enregistrements exportés`);
      } catch (tableError) {
        console.error(`Erreur table ${tableName}:`, tableError);
        exportData[tableName] = [];
      }
    }

    // Générer le contenu selon le format
    let content: string;
    let contentType: string;
    let filename: string;

    const timestamp = new Date().toISOString().split('T')[0];

    switch (format) {
      case 'csv':
        content = generateCSV(exportData, includeMetadata ? metadata : undefined);
        contentType = 'text/csv';
        filename = `admin-export-${timestamp}.csv`;
        break;
      
      case 'json':
        const jsonData = includeMetadata 
          ? { metadata, data: exportData }
          : exportData;
        content = JSON.stringify(jsonData, null, 2);
        contentType = 'application/json';
        filename = `admin-export-${timestamp}.json`;
        break;
      
      default:
        throw new Error(`Format non supporté: ${format}`);
    }

    // Log de l'export
    await supabase.from('operation_logs').insert({
      type: 'admin_export',
      message: `Export ${format} généré: ${tables.join(', ')}`,
      meta: {
        format,
        tables,
        totalRecords: metadata.totalRecords,
        fileSize: content.length,
        filters: filters || {},
        dateRange: dateRange || null
      }
    });

    return new Response(content, {
      headers: {
        ...corsHeaders,
        ...rateLimitHeaders,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': content.length.toString(),
      },
    });

  } catch (error) {
    console.error('Erreur export admin:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erreur lors de l\'export', 
        details: error.message 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', ...rateLimitHeaders }
      }
    );
  }
});

function generateCSV(exportData: Record<string, any[]>, metadata?: any): string {
  let csv = '';
  
  // Ajouter metadata en commentaire si demandé
  if (metadata) {
    csv += `# Export Metadata\n`;
    csv += `# Date: ${metadata.exportDate}\n`;
    csv += `# Tables: ${metadata.tables}\n`;
    csv += `# Total Records: ${metadata.totalRecords}\n`;
    csv += `# Format: ${metadata.format}\n\n`;
  }

  // Générer CSV pour chaque table
  Object.entries(exportData).forEach(([tableName, rows], tableIndex) => {
    if (tableIndex > 0) csv += '\n\n';
    
    csv += `# Table: ${tableName}\n`;
    
    if (rows.length === 0) {
      csv += '# Aucune donnée\n';
      return;
    }

    // Headers
    const headers = Object.keys(rows[0]);
    csv += headers.join(',') + '\n';

    // Data rows
    rows.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        
        // Escape CSV values
        let stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          stringValue = `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csv += values.join(',') + '\n';
    });
  });

  return csv;
}