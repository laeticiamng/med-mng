import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ErrorLog {
  error: {
    message: string;
    stack?: string;
    context?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
  userId?: string;
  userAgent?: string;
  url?: string;
  timestamp: string;
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

    const { error, userId, userAgent, url, timestamp }: ErrorLog = await req.json();

    console.log('🚨 Error logged:', error.message, 'severity:', error.severity);

    // Enrichir l'erreur avec des métadonnées
    const errorMetadata = {
      browser: userAgent || 'unknown',
      page: url || 'unknown',
      timestamp,
      user_id: userId,
      error_hash: await hashError(error.message + error.stack)
    };

    // Enregistrer dans error_logs
    const { data: errorLogData, error: logError } = await supabase
      .from('error_logs')
      .insert({
        user_id: userId,
        error_message: error.message,
        error_stack: error.stack,
        context: error.context,
        severity: error.severity,
        metadata: errorMetadata
      })
      .select()
      .single();

    if (logError) {
      console.error('❌ Failed to log error:', logError);
      throw logError;
    }

    // Créer notification pour erreurs critiques
    if (error.severity === 'critical' || error.severity === 'high') {
      const { error: notifError } = await supabase
        .from('user_notifications')
        .insert({
          user_id: userId,
          type: 'error',
          title: `Erreur ${error.severity}`,
          message: `Une erreur ${error.severity} s'est produite: ${error.message.substring(0, 100)}...`,
          category: 'system',
          priority: error.severity === 'critical' ? 'urgent' : 'high',
          actionable: true,
          action_url: '/support',
          action_label: 'Contacter le support'
        });

      if (notifError) {
        console.warn('⚠️ Failed to create error notification:', notifError);
      }
    }

    // Analyser les patterns d'erreur pour détecter des problèmes récurrents
    const { data: recentErrors } = await supabase
      .from('error_logs')
      .select('error_message')
      .eq('error_message', error.message)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Dernière heure
      .limit(10);

    const errorCount = recentErrors?.length || 0;
    
    if (errorCount >= 5) {
      console.log('🔥 Error pattern detected, creating alert');
      
      // Créer une notification pour les admins
      const { error: adminNotifError } = await supabase
        .from('user_notifications')
        .insert({
          user_id: null, // Notification système
          type: 'critical',
          title: 'Pattern d\'erreur détecté',
          message: `L'erreur "${error.message}" s'est reproduite ${errorCount} fois dans la dernière heure`,
          category: 'system',
          priority: 'urgent',
          actionable: true,
          action_url: '/admin/errors',
          action_label: 'Investiguer'
        });

      if (adminNotifError) {
        console.warn('⚠️ Failed to create admin alert:', adminNotifError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        errorId: errorLogData.id,
        patternDetected: errorCount >= 5,
        errorCount
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Error logger failure:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to log error',
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

// Fonction utilitaire pour hasher les erreurs
async function hashError(errorString: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(errorString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}