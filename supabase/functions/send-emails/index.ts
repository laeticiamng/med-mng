import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { corsHeaders } from '../_shared/cors.ts';
import { exigerAdministrateur } from '../_shared/mm-garde.ts';
import { envoyerEmail, expediteur, journaliserEchec } from '../_shared/mm-email.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

  // Réservé aux administrateurs (ou à la clé de service) — revue de sécurité du
  // 04.10.2026 : sans authentification (verify_jwt = false), la fonction envoyait
  // un e-mail à n'importe quelle adresse fournie, avec des variables insérées
  // telles quelles dans le HTML (relais d'e-mails ouvert). Aucune page ne l'appelle.
  const acces = await exigerAdministrateur(req, corsHeaders);
  if (acces instanceof Response) return acces;

  try {
    const { type, email, name, variables = {} }: EmailRequest = await req.json();
    
    console.log(`📧 Sending email type: ${type}`);

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
      app_url: 'https://medmng.com',
      ...variables
    };

    // Remplacer toutes les variables {{variable}}
    for (const [key, value] of Object.entries(allVariables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(regex, String(value || ''));
    }

    // Envoi par Resend : la réponse est lue, un refus n'est jamais présenté comme un succès.
    const envoi = await envoyerEmail({
      from: expediteur('Med MNG'),
      to: [email],
      subject: template.subject,
      html: htmlContent,
    });

    if (!envoi.ok) {
      journaliserEchec('send-emails', envoi);
      return new Response(
        JSON.stringify({ success: false, error: `Email ${type} non envoyé (Resend ${envoi.status || 'injoignable'} : ${envoi.erreur})` }),
        { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('✅ Email envoyé :', envoi.id ?? 'sans identifiant');

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: envoi.id,
        message: `Email ${type} envoyé` 
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
        error: error.message 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
