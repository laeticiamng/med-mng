import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

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

  try {
    const { type, email, name, variables = {} }: EmailRequest = await req.json();
    
    console.log(`📧 Sending email type: ${type} to: ${email}`);

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

    // Envoyer l'email avec Resend via fetch API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MedMNG <onboarding@resend.dev>',
        to: [email],
        subject: template.subject,
        html: htmlContent,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log('✅ Email envoyé avec succès:', emailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResult.id,
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
        error: error.message 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
