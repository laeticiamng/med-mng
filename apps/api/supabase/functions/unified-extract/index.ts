import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface Payload {
  mode?: "batch" | "single" | "report";
  version?: "v1.0" | "v2.0";
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode = "single", version = "v1.0" } = (await req.json().catch(() => ({}))) as Payload;
    
    console.log(`🚀 OIC Competences Extraction ${version} - Mode: ${mode}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (mode) {
      case "batch":
        console.log('🔄 Launching batch OIC extraction...');
        const { data: batchResult, error: batchError } = await supabase.functions.invoke('fix-oic-truncated-content');
        
        if (batchError) {
          console.error('❌ Batch extraction error:', batchError);
          return new Response(JSON.stringify({ 
            success: false, 
            error: batchError.message,
            version,
            mode 
          }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        
        console.log('✅ Batch extraction completed:', batchResult);
        return new Response(JSON.stringify({ 
          success: true, 
          mode, 
          version,
          result: batchResult 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
        
      case "report":
        console.log('📊 Generating extraction report...');
        const { data: reportData, error: reportError } = await supabase
          .from('backup_oic_competences')
          .select('objectif_id, intitule, extraction_status, char_length(description) as desc_length')
          .order('objectif_id');
          
        if (reportError) {
          console.error('❌ Report generation error:', reportError);
          return new Response(JSON.stringify({ 
            success: false, 
            error: reportError.message,
            version,
            mode 
          }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        
        const truncatedCount = reportData?.filter(item => 
          item.desc_length <= 1000 || 
          item.description?.includes('...') ||
          item.extraction_status !== 'completed'
        ).length || 0;
        
        const report = {
          totalCompetences: reportData?.length || 0,
          truncatedCompetences: truncatedCount,
          completedCompetences: (reportData?.length || 0) - truncatedCount,
          completionRate: ((((reportData?.length || 0) - truncatedCount) / (reportData?.length || 1)) * 100).toFixed(1)
        };
        
        console.log('📈 Extraction report:', report);
        return new Response(JSON.stringify({ 
          success: true, 
          mode, 
          version,
          report 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
        
      default:
        console.log('🔍 Single competence extraction - checking sample...');
        const { data: sampleData, error: sampleError } = await supabase
          .from('backup_oic_competences')
          .select('objectif_id, intitule, description, extraction_status')
          .limit(5)
          .order('objectif_id');
          
        if (sampleError) {
          console.error('❌ Sample check error:', sampleError);
          return new Response(JSON.stringify({ 
            success: false, 
            error: sampleError.message,
            version,
            mode 
          }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        
        console.log('✅ Sample check completed');
        return new Response(JSON.stringify({ 
          success: true, 
          mode, 
          version,
          sample: sampleData 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
    
  } catch (error) {
    console.error('💥 Unified extraction error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      version: "v1.0",
      mode: "error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
