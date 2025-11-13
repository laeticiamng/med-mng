import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface SuspiciousActivity {
  type: 'mass_deletion' | 'unauthorized_access' | 'unusual_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId: string;
  userEmail: string;
  details: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Check for suspicious activities in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentLogs, error } = await supabase
      .from('share_audit_logs')
      .select('*')
      .gte('created_at', oneHourAgo)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const suspiciousActivities: SuspiciousActivity[] = [];

    // Detect mass deletions (more than 5 deletions in an hour by same user)
    const deletionsByUser = new Map<string, any[]>();
    recentLogs?.forEach(log => {
      if (log.action === 'delete') {
        const userId = log.user_id || 'unknown';
        if (!deletionsByUser.has(userId)) {
          deletionsByUser.set(userId, []);
        }
        deletionsByUser.get(userId)!.push(log);
      }
    });

    for (const [userId, deletions] of deletionsByUser.entries()) {
      if (deletions.length >= 5) {
        suspiciousActivities.push({
          type: 'mass_deletion',
          severity: deletions.length >= 10 ? 'critical' : 'high',
          description: `Suppression massive détectée: ${deletions.length} suppressions`,
          userId,
          userEmail: deletions[0].user_email || 'unknown',
          details: {
            count: deletions.length,
            resources: deletions.map(d => ({ type: d.resource_type, id: d.resource_id }))
          }
        });
      }
    }

    // Detect unusual access patterns (same user accessing >20 different resources in an hour)
    const accessesByUser = new Map<string, Set<string>>();
    recentLogs?.forEach(log => {
      if (log.action === 'access' || log.action === 'view') {
        const userId = log.user_id || 'unknown';
        if (!accessesByUser.has(userId)) {
          accessesByUser.set(userId, new Set());
        }
        accessesByUser.get(userId)!.add(log.resource_id);
      }
    });

    for (const [userId, resources] of accessesByUser.entries()) {
      if (resources.size > 20) {
        const userLogs = recentLogs?.filter(l => l.user_id === userId) || [];
        suspiciousActivities.push({
          type: 'unusual_pattern',
          severity: 'medium',
          description: `Pattern d'accès inhabituel: ${resources.size} ressources différentes`,
          userId,
          userEmail: userLogs[0]?.user_email || 'unknown',
          details: {
            resourceCount: resources.size,
            timeWindow: '1 hour'
          }
        });
      }
    }

    // Send email alerts for each suspicious activity
    for (const activity of suspiciousActivities) {
      await sendAlertEmail(activity);
      
      // Create real-time notification for critical and high severity alerts
      if (activity.severity === 'critical' || activity.severity === 'high') {
        await createRealtimeNotification(supabase, activity);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        alertsSent: suspiciousActivities.length,
        activities: suspiciousActivities 
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );

  } catch (error) {
    console.error('Error checking security alerts:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
});

async function sendAlertEmail(activity: SuspiciousActivity) {
  const severityEmojis = {
    low: '⚠️',
    medium: '⚠️',
    high: '🚨',
    critical: '🔥'
  };

  const emailHtml = `
    <h1>${severityEmojis[activity.severity]} Alerte Sécurité - ${activity.severity.toUpperCase()}</h1>
    <h2>${activity.description}</h2>
    
    <h3>Détails de l'activité suspecte:</h3>
    <ul>
      <li><strong>Type:</strong> ${activity.type}</li>
      <li><strong>Utilisateur:</strong> ${activity.userEmail} (${activity.userId})</li>
      <li><strong>Détection:</strong> ${new Date().toLocaleString('fr-FR')}</li>
    </ul>
    
    <h3>Informations détaillées:</h3>
    <pre>${JSON.stringify(activity.details, null, 2)}</pre>
    
    <p>
      <a href="${SUPABASE_URL.replace('supabase.co', 'supabase.co')}/project/_/logs/audit" 
         style="display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">
        Voir les logs d'audit
      </a>
    </p>
    
    <hr/>
    <p style="color: #666; font-size: 12px;">
      Cet email a été envoyé automatiquement par le système de surveillance de sécurité.
    </p>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Security Alerts <security@medmng.app>',
      to: [ADMIN_EMAIL],
      subject: `${severityEmojis[activity.severity]} Alerte Sécurité: ${activity.description}`,
      html: emailHtml,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to send email: ${await res.text()}`);
  }

  return res.json();
}

async function createRealtimeNotification(supabase: any, activity: SuspiciousActivity) {
  const typeMapping: Record<string, string> = {
    'mass_deletion': 'mass_deletion',
    'unauthorized_access': 'unauthorized_access',
    'unusual_pattern': 'suspicious_activity'
  };

  const notificationData = {
    title: activity.severity === 'critical' 
      ? '🚨 Alerte Critique de Sécurité' 
      : '⚠️ Alerte de Sécurité',
    message: activity.description,
    severity: activity.severity === 'critical' ? 'critical' : 'warning',
    type: typeMapping[activity.type] || 'system_alert',
    details: activity.details,
    related_user_id: activity.userId !== 'unknown' ? activity.userId : null,
  };

  const { error } = await supabase
    .from('security_notifications')
    .insert(notificationData);

  if (error) {
    console.error('Error creating real-time notification:', error);
  } else {
    console.log('✅ Real-time notification created for', activity.type);
  }
}

