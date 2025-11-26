import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

import { getErrorMessage } from '../../_shared/error-utils.ts';
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to replace variables in template
function replaceVariables(content: string, data: Record<string, any>): string {
  let result = content;
  Object.entries(data).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
  });
  return result;
}

// Notification helper function
async function sendTestCompletionNotification(test: any, supabaseClient: any) {
  // Récupérer les paramètres webhook de l'utilisateur
  const { data: webhookSettings } = await supabaseClient
    .from('webhook_settings')
    .select('*')
    .eq('user_id', test.user_id)
    .single();

  if (!webhookSettings) {
    console.log('No webhook settings found for user');
    return;
  }

  const slackWebhook = webhookSettings.slack_enabled ? webhookSettings.slack_webhook_url : null;
  const discordWebhook = webhookSettings.discord_enabled ? webhookSettings.discord_webhook_url : null;

  // Récupérer les templates personnalisés de l'utilisateur
  const { data: templates } = await supabaseClient
    .from('notification_templates')
    .select('*')
    .eq('user_id', test.user_id)
    .order('is_default', { ascending: false })
    .limit(1);

  const template = templates && templates.length > 0 ? templates[0] : null;

  const winnerName = test.winner_template_id === test.template_a_id 
    ? test.template_a?.name || 'Template A'
    : test.template_b?.name || 'Template B';
  
  // Préparer les données pour les variables
  const templateData = {
    test_name: test.name,
    winner_name: winnerName,
    open_rate_a: test.open_rate_a?.toFixed(1) || '0',
    open_rate_b: test.open_rate_b?.toFixed(1) || '0',
    total_opened_a: test.total_opened_a || 0,
    total_opened_b: test.total_opened_b || 0,
    total_sent_a: test.total_sent_a || 0,
    total_sent_b: test.total_sent_b || 0,
    start_date: new Date(test.start_date).toLocaleDateString('fr-FR'),
    end_date: new Date(test.end_date).toLocaleDateString('fr-FR'),
  };

  // Utiliser le template personnalisé ou le message par défaut
  const message = template 
    ? replaceVariables(template.template_content, templateData)
    : `🏆 A/B Test "${test.name}" terminé!\n\n` +
      `✉️ Template gagnant: ${winnerName}\n` +
      `📊 Résultats:\n` +
      `  • Template A: ${test.open_rate_a}% d'ouverture (${test.total_opened_a}/${test.total_sent_a} envois)\n` +
      `  • Template B: ${test.open_rate_b}% d'ouverture (${test.total_opened_b}/${test.total_sent_b} envois)\n` +
      `📅 Durée: ${test.start_date} → ${test.end_date}`;

  // Déterminer les plateformes à utiliser
  const sendToSlack = slackWebhook && (!template || template.platform === 'slack' || template.platform === 'both');
  const sendToDiscord = discordWebhook && (!template || template.platform === 'discord' || template.platform === 'both');

  const promises = [];

  if (sendToSlack) {
    const slackPromise = fetch(slackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `🏆 Test A/B "${test.name}" terminé!`,
              emoji: true
            }
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Template gagnant:*\n${winnerName}`
              },
              {
                type: "mrkdwn",
                text: `*Période:*\n${new Date(test.start_date).toLocaleDateString('fr-FR')} - ${new Date(test.end_date).toLocaleDateString('fr-FR')}`
              }
            ]
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*📊 Résultats détaillés:*\n• Template A: *${test.open_rate_a}%* (${test.total_opened_a}/${test.total_sent_a})\n• Template B: *${test.open_rate_b}%* (${test.total_opened_b}/${test.total_sent_b})`
            }
          }
        ]
      })
    }).then(async (response) => {
      const status = response.ok ? 'success' : 'failed';
      const errorMessage = response.ok ? null : await response.text();
      
      // Enregistrer dans l'historique
      await supabaseClient.from('notification_history').insert({
        user_id: test.user_id,
        test_id: test.id,
        test_name: test.name,
        template_id: template?.id || null,
        platform: 'slack',
        message_content: message,
        status,
        error_message: errorMessage,
        webhook_url: slackWebhook,
      });
      
      return response;
    }).catch(async (err) => {
      console.error('Slack notification failed:', err);
      
      // Enregistrer l'échec
      await supabaseClient.from('notification_history').insert({
        user_id: test.user_id,
        test_id: test.id,
        test_name: test.name,
        template_id: template?.id || null,
        platform: 'slack',
        message_content: message,
        status: 'failed',
        error_message: err.message,
        webhook_url: slackWebhook,
      });
    });
    
    promises.push(slackPromise);
  }

  if (sendToDiscord) {
    const discordPromise = fetch(discordWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: `🏆 Test A/B "${test.name}" terminé!`,
          description: message,
          color: 0x00ff00,
          fields: [
            {
              name: 'Template gagnant',
              value: winnerName,
              inline: true
            },
            {
              name: 'Template A',
              value: `${test.open_rate_a}% (${test.total_opened_a}/${test.total_sent_a})`,
              inline: true
            },
            {
              name: 'Template B',
              value: `${test.open_rate_b}% (${test.total_opened_b}/${test.total_sent_b})`,
              inline: true
            }
          ],
          timestamp: new Date().toISOString()
        }]
      })
    }).then(async (response) => {
      const status = response.ok ? 'success' : 'failed';
      const errorMessage = response.ok ? null : await response.text();
      
      // Enregistrer dans l'historique
      await supabaseClient.from('notification_history').insert({
        user_id: test.user_id,
        test_id: test.id,
        test_name: test.name,
        template_id: template?.id || null,
        platform: 'discord',
        message_content: message,
        status,
        error_message: errorMessage,
        webhook_url: discordWebhook,
      });
      
      return response;
    }).catch(async (err) => {
      console.error('Discord notification failed:', err);
      
      // Enregistrer l'échec
      await supabaseClient.from('notification_history').insert({
        user_id: test.user_id,
        test_id: test.id,
        test_name: test.name,
        template_id: template?.id || null,
        platform: 'discord',
        message_content: message,
        status: 'failed',
        error_message: err.message,
        webhook_url: discordWebhook,
      });
    });
    
    promises.push(discordPromise);
  }

  if (promises.length > 0) {
    await Promise.all(promises);
    console.log(`📢 Notifications envoyées pour le test ${test.name}`);
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification JWT + Vérification Admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('❌ Tentative accès process-ab-tests sans authentification');
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.warn('❌ Token invalide pour process-ab-tests');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { data: userRoles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some((r) => r.role === 'admin');
    if (!isAdmin) {
      console.warn(`❌ Non-admin tentative process-ab-tests par user ${user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ process-ab-tests autorisé pour admin ${user.id}`);
    console.log("🧪 Processing A/B tests");

    // Récupérer tous les tests actifs
    const { data: activeTests, error: testsError } = await supabaseClient
      .from("email_ab_tests")
      .select("*")
      .eq("status", "active");

    if (testsError) throw testsError;

    console.log(`Found ${activeTests?.length || 0} active tests`);

    for (const test of activeTests || []) {
      // Vérifier si le test est terminé
      const now = new Date();
      const endDate = new Date(test.end_date);

      if (now >= endDate) {
        console.log(`Test ${test.name} has ended, calculating winner...`);

        // Calculer le gagnant
        const { error: calcError } = await supabaseClient.rpc(
          "calculate_ab_test_winner",
          { test_id: test.id }
        );

        if (calcError) {
          console.error(`Error calculating winner for test ${test.id}:`, calcError);
          continue;
        }

        // Récupérer les résultats mis à jour
        const { data: updatedTest } = await supabaseClient
          .from("email_ab_tests")
          .select("*, template_a:email_templates!template_a_id(name), template_b:email_templates!template_b_id(name)")
          .eq("id", test.id)
          .single();

        if (updatedTest?.winner_template_id) {
          console.log(`✅ Test ${test.name} completed`);
          console.log(`Winner: Template ${updatedTest.winner_template_id === updatedTest.template_a_id ? 'A' : 'B'}`);
          console.log(`Open rates - A: ${updatedTest.open_rate_a}%, B: ${updatedTest.open_rate_b}%`);
          
          // Envoyer les notifications
          await sendTestCompletionNotification(updatedTest, supabaseClient);
        } else {
          console.log(`Test ${test.name} ended in a tie`);
        }
      } else {
        // Mettre à jour les statistiques en temps réel
        const { error: calcError } = await supabaseClient.rpc(
          "calculate_ab_test_winner",
          { test_id: test.id }
        );

        if (calcError) {
          console.error(`Error updating stats for test ${test.id}:`, calcError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: activeTests?.length || 0 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("❌ Error processing A/B tests:", error);
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);
