
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

import { corsHeaders } from '../../_shared/cors.ts';

import { getErrorMessage } from '../../_shared/error-utils.ts';
interface EmailRequest {
  type: 'welcome' | 'subscription_success';
  email: string;
  name: string;
  variables?: Record<string, any>;
}

serve(async (req) => {
  console.log('📧 Send email function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Vérifier authentification avant d'envoyer des emails
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('❌ Tentative envoi email sans authentification');
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Vérifier le token avec Supabase
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.warn('❌ Token invalide pour envoi email');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // ✅ SÉCURITÉ: Vérifier rôle admin pour certains types d'emails sensibles
    const sensitiveEmailTypes = ['weekly_alerts', 'scheduled_pdf_reports', 'accessibility_report'];
    const { type, email, name, variables = {} }: EmailRequest = await req.json();

    if (sensitiveEmailTypes.includes(type)) {
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isAdmin = userRoles?.some((r: any) => r.role === 'admin');
      if (!isAdmin) {
        console.warn(`❌ Non-admin tentative email sensible: ${type}`);
        return new Response(
          JSON.stringify({ success: false, error: 'Admin role required for this email type' }),
          { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    }

    console.log(`📧 Sending email type: ${type} to: ${email} (authorized by user: ${user.id})`);

    // Récupérer le template d'email depuis la base
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', type)
      .single();

    if (templateError || !template) {
      throw new Error(`Template ${type} non trouvé: ${templateError?.message}`);
    }

    // Remplacer les variables dans le contenu HTML
    let htmlContent = template.html_content;
    const allVariables = {
      name,
      app_url: 'https://yaincoxihiqdksxgrsrk.supabase.co',
      ...variables
    };

    // Remplacer toutes les variables {{variable}}
    for (const [key, value] of Object.entries(allVariables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(regex, String(value || ''));
    }

    // Envoyer l'email avec Resend
    const emailResponse = await resend.emails.send({
      from: 'MedMNG <onboarding@resend.dev>',
      to: [email],
      subject: template.subject,
      html: htmlContent,
    });

    console.log('✅ Email envoyé avec succès:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id,
        message: `Email ${type} envoyé à ${email}` 
      }), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('❌ Erreur envoi email:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: getErrorMessage(error) 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
