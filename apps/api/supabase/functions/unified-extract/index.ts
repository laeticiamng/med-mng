import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Payload {
  mode?: "batch" | "single" | "report";
  itemCodes?: string[];
  itemCode?: string;
  startDate?: string;
  endDate?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { mode = "single", itemCodes, itemCode, startDate, endDate } = (await req.json().catch(() => ({}))) as Payload;

    let result: any = { success: true, mode };

    switch (mode) {
      case "batch":
        // Logique d'extraction par lot
        const batchId = `BATCH-${Date.now()}`;
        const { data: batchLog } = await supabase
          .from('extraction_logs')
          .insert({
            batch_id: batchId,
            batch_type: 'batch_extraction',
            status: 'pending',
            started_at: new Date().toISOString(),
            metadata: { itemCodes, total: itemCodes?.length || 0 }
          })
          .select()
          .single();

        result = {
          success: true,
          mode: 'batch',
          batch_id: batchId,
          items_queued: itemCodes?.length || 0,
          log_id: batchLog?.id
        };
        break;

      case "report":
        // Génération du rapport d'extraction
        const { data: recentLogs } = await supabase
          .from('extraction_logs')
          .select('*')
          .gte('started_at', startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .lte('started_at', endDate || new Date().toISOString())
          .order('started_at', { ascending: false })
          .limit(100);

        const stats = {
          total: recentLogs?.length || 0,
          completed: recentLogs?.filter(l => l.status === 'completed').length || 0,
          failed: recentLogs?.filter(l => l.status === 'failed').length || 0,
          pending: recentLogs?.filter(l => l.status === 'pending').length || 0,
          period: { start: startDate, end: endDate }
        };

        result = {
          success: true,
          mode: 'report',
          stats,
          logs: recentLogs?.slice(0, 20)
        };
        break;

      default:
        // Extraction d'un seul item
        if (!itemCode) {
          throw new Error('itemCode is required for single extraction');
        }

        const singleBatchId = `SINGLE-${itemCode}-${Date.now()}`;
        const { data: singleLog } = await supabase
          .from('extraction_logs')
          .insert({
            batch_id: singleBatchId,
            batch_type: 'single_extraction',
            status: 'pending',
            started_at: new Date().toISOString(),
            metadata: { itemCode }
          })
          .select()
          .single();

        result = {
          success: true,
          mode: 'single',
          item_code: itemCode,
          batch_id: singleBatchId,
          log_id: singleLog?.id
        };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error('Error in unified-extract:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
