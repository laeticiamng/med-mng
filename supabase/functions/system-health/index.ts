import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { action, ...payload } = await req.json()

    switch (action) {
      case 'check_health':
        const healthChecks = []
        
        // Database connectivity check
        const dbStart = performance.now()
        try {
          const { count } = await supabaseClient
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
          
          const dbTime = performance.now() - dbStart
          healthChecks.push({
            service: 'database',
            status: 'healthy',
            response_time_ms: Math.round(dbTime),
            details: { total_profiles: count }
          })
        } catch (error) {
          healthChecks.push({
            service: 'database',
            status: 'error',
            response_time_ms: Math.round(performance.now() - dbStart),
            error: error.message
          })
        }

        // Auth service check
        const authStart = performance.now()
        try {
          const { data, error } = await supabaseClient.auth.getSession()
          const authTime = performance.now() - authStart
          
          healthChecks.push({
            service: 'authentication',
            status: error ? 'warning' : 'healthy',
            response_time_ms: Math.round(authTime),
            details: { session_available: !!data.session }
          })
        } catch (error) {
          healthChecks.push({
            service: 'authentication',
            status: 'error',
            response_time_ms: Math.round(performance.now() - authStart),
            error: error.message
          })
        }

        // Storage check
        const storageStart = performance.now()
        try {
          const { data: buckets, error } = await supabaseClient.storage.listBuckets()
          const storageTime = performance.now() - storageStart
          
          healthChecks.push({
            service: 'storage',
            status: error ? 'error' : 'healthy',
            response_time_ms: Math.round(storageTime),
            details: { buckets_count: buckets?.length || 0 }
          })
        } catch (error) {
          healthChecks.push({
            service: 'storage',
            status: 'error',
            response_time_ms: Math.round(performance.now() - storageStart),
            error: error.message
          })
        }

        // Overall system status
        const hasErrors = healthChecks.some(check => check.status === 'error')
        const hasWarnings = healthChecks.some(check => check.status === 'warning')
        const overallStatus = hasErrors ? 'error' : hasWarnings ? 'warning' : 'healthy'

        // Log health check
        await supabaseClient
          .from('system_health_logs')
          .insert({
            service_name: 'platform_overall',
            status: overallStatus,
            response_time_ms: Math.max(...healthChecks.map(c => c.response_time_ms)),
            metrics: { checks: healthChecks }
          })

        return new Response(JSON.stringify({
          status: overallStatus,
          timestamp: new Date().toISOString(),
          checks: healthChecks,
          summary: {
            total_services: healthChecks.length,
            healthy: healthChecks.filter(c => c.status === 'healthy').length,
            warnings: healthChecks.filter(c => c.status === 'warning').length,
            errors: healthChecks.filter(c => c.status === 'error').length
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'get_health_history':
        const { data: healthHistory, error: historyError } = await supabaseClient
          .from('system_health_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)

        if (historyError) throw historyError

        // Calculate uptime and availability metrics
        const totalChecks = healthHistory.length
        const healthyChecks = healthHistory.filter(log => log.status === 'healthy').length
        const uptime = totalChecks > 0 ? (healthyChecks / totalChecks) * 100 : 100

        const last24h = healthHistory.filter(log => 
          new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        )

        return new Response(JSON.stringify({
          uptime_percentage: Math.round(uptime * 100) / 100,
          total_checks: totalChecks,
          last_24h_checks: last24h.length,
          recent_logs: healthHistory.slice(0, 20),
          service_stats: healthHistory.reduce((acc, log) => {
            if (!acc[log.service_name]) {
              acc[log.service_name] = { healthy: 0, warning: 0, error: 0, total: 0 }
            }
            acc[log.service_name][log.status]++
            acc[log.service_name].total++
            return acc
          }, {})
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'get_performance_metrics':
        const { data: performanceLogs } = await supabaseClient
          .from('system_health_logs')
          .select('service_name, response_time_ms, created_at')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })

        const serviceMetrics = performanceLogs?.reduce((acc, log) => {
          if (!acc[log.service_name]) {
            acc[log.service_name] = {
              response_times: [],
              avg_response_time: 0,
              min_response_time: Infinity,
              max_response_time: 0
            }
          }
          
          const responseTime = log.response_time_ms
          acc[log.service_name].response_times.push(responseTime)
          acc[log.service_name].min_response_time = Math.min(acc[log.service_name].min_response_time, responseTime)
          acc[log.service_name].max_response_time = Math.max(acc[log.service_name].max_response_time, responseTime)
          
          return acc
        }, {})

        // Calculate averages
        Object.keys(serviceMetrics || {}).forEach(service => {
          const times = serviceMetrics[service].response_times
          serviceMetrics[service].avg_response_time = times.reduce((sum, time) => sum + time, 0) / times.length
        })

        return new Response(JSON.stringify({
          services: serviceMetrics || {},
          data_points: performanceLogs?.length || 0,
          time_range: '7 days'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      default:
        return new Response(JSON.stringify({ error: 'Action not supported' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

  } catch (error) {
    console.error('System Health Error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})