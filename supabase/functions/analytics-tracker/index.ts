import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TrackingEvent {
  event: string;
  properties: Record<string, any>;
  userId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { event, properties, userId }: TrackingEvent = await req.json();

    console.log('📊 Tracking event:', event, 'for user:', userId);

    // Enrichir les données avec des infos contextuelles
    const enrichedProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      server_timestamp: Date.now(),
      event_id: crypto.randomUUID()
    };

    // Enregistrer dans user_activity_logs
    const { error: logError } = await supabase
      .from('user_activity_logs')
      .insert({
        user_id: userId,
        session_id: properties.sessionId || crypto.randomUUID(),
        activity_type: event,
        activity_details: enrichedProperties,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
        url: properties.url || 'unknown',
        performance_metrics: properties.performance || {}
      });

    if (logError) {
      console.error('❌ Error logging activity:', logError);
      throw logError;
    }

    // Mise à jour des métriques en temps réel si événement critique
    const criticalEvents = ['music_generation', 'error', 'payment', 'subscription'];
    if (criticalEvents.includes(event)) {
      console.log('🚨 Critical event detected, updating metrics');
      
      // Ici on pourrait déclencher des webhooks ou notifications
      const { error: notifError } = await supabase
        .from('user_notifications')
        .insert({
          user_id: userId,
          type: event === 'error' ? 'error' : 'info',
          title: `Événement ${event}`,
          message: `Événement ${event} tracké avec succès`,
          category: 'system',
          priority: event === 'error' ? 'high' : 'medium'
        });

      if (notifError) {
        console.warn('⚠️ Failed to create notification:', notifError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        eventId: enrichedProperties.event_id,
        timestamp: enrichedProperties.timestamp
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Analytics tracking error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to track event',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
})