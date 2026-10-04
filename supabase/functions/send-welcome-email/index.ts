import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { getCorsHeaders } from '../_shared/cors.ts';
import { jetonAppelant } from '../_shared/mm-garde.ts';

/**
 * E-mail de bienvenue, envoyé par le front juste après l'inscription.
 *
 * CONSTAT (revue de sécurité du 04.10.2026) : la fonction (verify_jwt = false)
 * envoyait un e-mail à N'IMPORTE QUELLE adresse fournie dans le corps de la
 * requête, sans aucune authentification, avec le nom fourni inséré tel quel
 * dans le HTML (relais d'e-mails ouvert, injection HTML) ; l'adresse était
 * écrite dans les journaux. Le contenu promettait « 2 chansons gratuites pour
 * commencer » (faux : la génération audio est Premium) et le bouton menait à
 * l'adresse de Supabase au lieu du site.
 *
 * Désormais :
 * - seul l'utilisateur connecté déclenche l'envoi, à SA propre adresse (lue
 *   dans sa session, jamais dans le corps), et seulement dans les 15 minutes
 *   qui suivent la création du compte ;
 * - le prénom est échappé ; aucune adresse n'est journalisée ;
 * - le texte décrit l'offre réelle.
 */

const FENETRE_MS = 15 * 60 * 1000;
const SITE = 'https://medmng.com';

const echapper = (texte: string) =>
  texte.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  const repondre = (corps: unknown, status = 200) =>
    new Response(JSON.stringify(corps), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const jeton = jetonAppelant(req);
    if (!jeton) return repondre({ success: false, code: 'AUTH_REQUISE', error: 'Veuillez vous connecter.' }, 401);

    const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const { data, error } = await admin.auth.getUser(jeton);
    const utilisateur = data?.user;
    if (error || !utilisateur?.email) {
      return repondre({ success: false, code: 'AUTH_REQUISE', error: 'Veuillez vous connecter.' }, 401);
    }

    const creeLe = Date.parse(utilisateur.created_at ?? '');
    if (!Number.isFinite(creeLe) || Date.now() - creeLe > FENETRE_MS) {
      // Compte ancien : pas de nouvel e-mail de bienvenue (évite les envois répétés).
      return repondre({ success: true, envoye: false });
    }

    const corps = await req.json().catch(() => ({}));
    const prenomBrut = String((corps as { name?: unknown })?.name ?? '').trim().slice(0, 80);
    const prenom = prenomBrut ? echapper(prenomBrut) : '';

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const emailResponse = await resend.emails.send({
      from: "MED-MNG <onboarding@resend.dev>",
      to: [utilisateur.email],
      subject: "Bienvenue sur Med MNG",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Bienvenue sur Med MNG</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="font-size: 22px;">Bienvenue sur Med MNG</h1>
          <p>Bonjour${prenom ? ` <strong>${prenom}</strong>` : ''},</p>
          <p>Votre compte Med MNG est créé.</p>
          <p><strong>Gratuit :</strong> les fiches officielles des 367 items EDN (compétences de rang A et de rang B du référentiel LiSA 2026), le contenu immersif complet (paroles, récit, planches, quiz) de 10 items d'essai (IC-1 à IC-10) et 12 situations ECOS guidées.</p>
          <p><strong>Premium (69 € par an ou 9,90 € par mois) :</strong> le contenu immersif des 367 items et 30 générations audio de chansons par mois.</p>
          <p style="text-align: center; margin: 28px 0;">
            <a href="${SITE}/edn-complete" style="display: inline-block; background: #3B82F6; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Commencer à réviser</a>
          </p>
          <p style="font-size: 13px; color: #6b7280;">Med MNG — EmotionsCare SASU — <a href="${SITE}" style="color: #3B82F6;">medmng.com</a></p>
        </body>
        </html>
      `,
    });

    if (emailResponse.error) {
      // Nom de l'erreur seulement : le message de Resend peut contenir une adresse e-mail.
      console.error("❌ E-mail de bienvenue refusé par Resend :", emailResponse.error.name ?? 'erreur inconnue');
      return repondre({ success: false, error: "L'e-mail de bienvenue n'a pas pu être envoyé." }, 502);
    }

    return repondre({ success: true, envoye: true, messageId: emailResponse.data?.id });
  } catch (error: unknown) {
    console.error("❌ Erreur envoi e-mail de bienvenue :", error instanceof Error ? error.message : 'inconnue');
    return repondre({ success: false, error: "L'e-mail de bienvenue n'a pas pu être envoyé." }, 500);
  }
};

serve(handler);
