import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: WelcomeEmailRequest = await req.json();

    console.log(`📧 Envoi email de bienvenue à: ${email} (${name})`);

    const emailResponse = await resend.emails.send({
      from: "MED-MNG <onboarding@resend.dev>",
      to: [email],
      subject: "Bienvenue sur MED-MNG ! 🎵",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Bienvenue sur MED-MNG</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              background: linear-gradient(135deg, #3B82F6, #8B5CF6); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 12px 12px 0 0; 
            }
            .content { 
              background: white; 
              padding: 30px; 
              border: 1px solid #e5e7eb; 
              border-radius: 0 0 12px 12px; 
            }
            .button { 
              display: inline-block; 
              background: #3B82F6; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 20px 0; 
            }
            .features { 
              background: #f8fafc; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
            }
            .feature { 
              margin: 10px 0; 
              padding-left: 20px; 
              position: relative; 
            }
            .feature:before { 
              content: "🎵"; 
              position: absolute; 
              left: 0; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎵 Bienvenue sur MED-MNG !</h1>
            <p>Votre plateforme d'apprentissage médical par la musique</p>
          </div>
          
          <div class="content">
            <p>Bonjour <strong>${name}</strong>,</p>
            
            <p>Félicitations ! Votre compte MED-MNG a été créé avec succès. Vous rejoignez maintenant une communauté d'étudiants en médecine qui révolutionnent leur apprentissage grâce à l'IA musicale.</p>
            
            <div class="features">
              <h3>🚀 Ce qui vous attend :</h3>
              <div class="feature">Génération de musique pédagogique avec l'IA</div>
              <div class="feature">367 items EDN avec contenus uniques</div>
              <div class="feature">Tableaux Rang A et B interactifs</div>
              <div class="feature">Quiz adaptatifs personnalisés</div>
              <div class="feature">Bibliothèque musicale personnelle</div>
              <div class="feature">2 chansons gratuites pour commencer</div>
            </div>
            
            <p>Pour commencer votre expérience, connectez-vous dès maintenant :</p>
            
            <div style="text-align: center;">
              <a href="${Deno.env.get('SUPABASE_URL') || 'https://med-mng.lovable.app'}/med-mng/login" class="button">
                Se connecter à MED-MNG
              </a>
            </div>
            
            <p>Si vous avez des questions, notre équipe est là pour vous aider. Répondez simplement à cet email.</p>
            
            <p>Bonne révision musicale ! 🎼</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <p style="font-size: 14px; color: #6b7280;">
              <strong>MED-MNG</strong><br>
              La révolution de l'apprentissage médical par l'IA musicale<br>
              <a href="https://med-mng.lovable.app" style="color: #3B82F6;">med-mng.lovable.app</a>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("✅ Email de bienvenue envoyé avec succès:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Erreur envoi email de bienvenue:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);