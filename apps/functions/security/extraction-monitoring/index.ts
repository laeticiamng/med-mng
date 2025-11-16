import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface ExtractionStatusResponse {
  id: string
  batch_id: string
  batch_type: string
  status: string
  progress_percentage: number
  total_items: number
  processed_items: number
  failed_items: number
  error_message?: string
  started_at: string
  completed_at?: string
  duration_minutes: number
  recent_events: any[]
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'get_status'
    const batch_id = url.searchParams.get('batch_id')

    console.log(`[Extraction Monitoring] Action: ${action}, Batch ID: ${batch_id}`)

    switch (action) {
      case 'get_status': {
        const { data, error } = await supabase.rpc('get_extraction_status', {
          p_batch_id: batch_id
        })

        if (error) {
          console.error('[Extraction Monitoring] Error fetching status:', error)
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_recent': {
        const limit = parseInt(url.searchParams.get('limit') || '10')
        
        const { data, error } = await supabase
          .from('extraction_logs')
          .select(`
            id,
            batch_id,
            batch_type,
            status,
            progress_percentage,
            total_items,
            processed_items,
            failed_items,
            error_message,
            started_at,
            completed_at,
            updated_at
          `)
          .order('started_at', { ascending: false })
          .limit(limit)

        if (error) {
          console.error('[Extraction Monitoring] Error fetching recent extractions:', error)
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_running': {
        const { data, error } = await supabase
          .from('extraction_logs')
          .select(`
            id,
            batch_id,
            batch_type,
            status,
            progress_percentage,
            total_items,
            processed_items,
            failed_items,
            started_at,
            updated_at
          `)
          .eq('status', 'running')
          .order('started_at', { ascending: false })

        if (error) {
          console.error('[Extraction Monitoring] Error fetching running extractions:', error)
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_events': {
        if (!batch_id) {
          return new Response(
            JSON.stringify({ success: false, error: 'batch_id required for events' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get extraction log ID first
        const { data: logData, error: logError } = await supabase
          .from('extraction_logs')
          .select('id')
          .eq('batch_id', batch_id)
          .single()

        if (logError) {
          return new Response(
            JSON.stringify({ success: false, error: 'Batch not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data, error } = await supabase
          .from('extraction_events')
          .select('*')
          .eq('extraction_log_id', logData.id)
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) {
          console.error('[Extraction Monitoring] Error fetching events:', error)
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_stats': {
        // Get overall statistics
        const { data: totalExtractions, error: totalError } = await supabase
          .from('extraction_logs')
          .select('status', { count: 'exact' })

        const { data: recentExtractions, error: recentError } = await supabase
          .from('extraction_logs')
          .select('status', { count: 'exact' })
          .gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

        const { data: runningExtractions, error: runningError } = await supabase
          .from('extraction_logs')
          .select('*', { count: 'exact' })
          .eq('status', 'running')

        if (totalError || recentError || runningError) {
          console.error('[Extraction Monitoring] Error fetching stats:', { totalError, recentError, runningError })
          return new Response(
            JSON.stringify({ success: false, error: 'Error fetching statistics' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Calculate success rate for last 7 days
        const { data: successfulRecent } = await supabase
          .from('extraction_logs')
          .select('id', { count: 'exact' })
          .eq('status', 'completed')
          .gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

        const { data: failedRecent } = await supabase
          .from('extraction_logs')
          .select('id', { count: 'exact' })
          .eq('status', 'failed')
          .gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

        const stats = {
          total_extractions: totalExtractions?.length || 0,
          recent_extractions_7d: recentExtractions?.length || 0,
          running_extractions: runningExtractions?.length || 0,
          success_rate_7d: ((successfulRecent?.length || 0) / (recentExtractions?.length || 1)) * 100,
          failed_extractions_7d: failedRecent?.length || 0
        }

        return new Response(
          JSON.stringify({ success: true, data: stats }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('[Extraction Monitoring] Unexpected error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})