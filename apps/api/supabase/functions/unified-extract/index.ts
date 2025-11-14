import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface Payload {
  mode?: "batch" | "single" | "report";
  itemIds?: string[];
  itemId?: string;
  reportType?: "summary" | "detailed" | "errors";
}

interface ExtractionResult {
  id: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

serve(async (req) => {
  try {
    const payload = (await req.json().catch(() => ({}))) as Payload;
    const { mode = "single", itemIds = [], itemId, reportType = "summary" } = payload;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing Supabase configuration'
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (mode) {
      case "batch": {
        // ✅ Batch extraction logic
        console.log(`🔄 Starting batch extraction for ${itemIds.length} items`);

        const results: ExtractionResult[] = [];
        const batchSize = 10; // Process 10 items at a time

        for (let i = 0; i < itemIds.length; i += batchSize) {
          const batch = itemIds.slice(i, i + batchSize);
          console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(itemIds.length/batchSize)}`);

          const batchResults = await Promise.all(
            batch.map(async (id) => {
              try {
                // Fetch item data from database
                const { data, error } = await supabase
                  .from('edn_items')
                  .select('*')
                  .eq('item_code', id)
                  .single();

                if (error) throw error;

                return {
                  id,
                  success: true,
                  data,
                  timestamp: new Date().toISOString()
                };
              } catch (error) {
                return {
                  id,
                  success: false,
                  error: error.message,
                  timestamp: new Date().toISOString()
                };
              }
            })
          );

          results.push(...batchResults);
        }

        const stats = {
          total: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          successRate: ((results.filter(r => r.success).length / results.length) * 100).toFixed(2) + '%'
        };

        console.log(`✅ Batch extraction complete: ${stats.successful}/${stats.total} successful`);

        return new Response(
          JSON.stringify({
            success: true,
            mode: "batch",
            stats,
            results
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      case "report": {
        // ✅ Generate extraction report
        console.log(`📊 Generating ${reportType} extraction report`);

        const { data: items, error: itemsError } = await supabase
          .from('edn_items')
          .select('item_code, titre, completeness_score, created_at, updated_at');

        if (itemsError) throw itemsError;

        const report = {
          type: reportType,
          generated: new Date().toISOString(),
          summary: {
            totalItems: items?.length || 0,
            completeItems: items?.filter(i => i.completeness_score >= 80).length || 0,
            incompleteItems: items?.filter(i => i.completeness_score < 80).length || 0,
            averageCompleteness: items?.length
              ? (items.reduce((sum, i) => sum + (i.completeness_score || 0), 0) / items.length).toFixed(2)
              : 0
          }
        };

        if (reportType === "detailed" || reportType === "errors") {
          const { data: extractions, error: extractionsError } = await supabase
            .from('extraction_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

          if (!extractionsError && extractions) {
            report['recentExtractions'] = extractions.map(e => ({
              id: e.id,
              itemCode: e.item_code,
              status: e.status,
              error: e.error_message,
              timestamp: e.created_at
            }));

            if (reportType === "errors") {
              report['recentExtractions'] = report['recentExtractions'].filter(e => e.status === 'error');
            }
          }
        }

        console.log(`✅ Report generated: ${report.summary.totalItems} items analyzed`);

        return new Response(
          JSON.stringify({
            success: true,
            mode: "report",
            report
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      default: {
        // ✅ Single extraction logic
        const targetId = itemId || itemIds[0];

        if (!targetId) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'No item ID provided for single extraction'
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" }
            }
          );
        }

        console.log(`🔍 Starting single extraction for item: ${targetId}`);

        const { data, error } = await supabase
          .from('edn_items')
          .select('*')
          .eq('item_code', targetId)
          .single();

        if (error) {
          console.error(`❌ Extraction failed: ${error.message}`);
          return new Response(
            JSON.stringify({
              success: false,
              error: error.message,
              itemId: targetId
            }),
            {
              status: 404,
              headers: { "Content-Type": "application/json" }
            }
          );
        }

        console.log(`✅ Single extraction complete for ${targetId}`);

        return new Response(
          JSON.stringify({
            success: true,
            mode: "single",
            itemId: targetId,
            data
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }
    }
  } catch (error) {
    console.error(`💥 Fatal error in unified-extract:`, error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
