import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../../_shared/cors.ts';

import { getErrorMessage } from '../../_shared/error-utils.ts';
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

  try {
    // ✅ SÉCURITÉ CRITIQUE: Vérifier authentification et rôle admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Vérifier le token et récupérer l'utilisateur
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ SÉCURITÉ CRITIQUE: Vérifier le rôle admin
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError || !userRoles || !userRoles.some(r => r.role === 'admin')) {
      console.warn(`Tentative d'export non autorisée par user ${user.id}`);
      return new Response(
        JSON.stringify({ error: 'Admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Export autorisé pour admin ${user.id}`);

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
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': content.length.toString(),
      },
    });

  } catch (error: unknown) {
    console.error('Erreur export admin:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erreur lors de l\'export', 
        details: getErrorMessage(error) 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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