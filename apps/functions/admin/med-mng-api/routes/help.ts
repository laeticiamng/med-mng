// ✅ AXE 5 : ENDPOINT ONBOARDING & AIDE CONTEXTUELLE - Version améliorée

import { jsonResponse, errorResponse } from "../response.ts";
import { corsHeaders, securityHeaders, ApiErrorCode } from '../types.ts';
import { log } from '../logger.ts';

export async function handleHelp(
  req: Request,
  supabase: any | null,
  path: string,
  url: URL
) {
  // GET /help/onboarding - Étapes d'onboarding (fallback static si table vide)
  if ((path === '/help/onboarding' || path === '/onboarding-steps') && req.method === 'GET') {
    try {
      const lang = url.searchParams.get('lang') || 'fr';
      const version = url.searchParams.get('version') || '1';

      if (!supabase) {
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
        supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        );
      }

      // Tentative de récupération depuis la base
      const { data, error } = await supabase
        .from('onboarding_steps')
        .select('id,key,title,body,type,version,is_active')
        .eq('is_active', true)
        .order('id');

      let steps;

      if (!error && data && data.length > 0) {
        // Utiliser les données de la base
        steps = data.map((row: any) => ({
          id: row.id,
          key: row.key,
          title: row.title?.[lang] ?? row.title?.en ?? '',
          body: row.body?.[lang] ?? row.body?.en ?? '',
          type: row.type,
          version: row.version,
          is_active: row.is_active,
        }));
      } else {
        // ✅ Fallback statique si table vide/inexistante
        const staticOnboarding = {
          fr: [
            {
              id: 1,
              key: "welcome",
              title: "Bienvenue sur MED-MNG ! 🎵",
              body: "Découvrez comment générer de la musique médicale personnalisée avec l'IA. Votre apprentissage n'aura jamais été aussi mélodieux !",
              type: "onboarding",
              version: parseInt(version),
              is_active: true,
              icon: "🎵"
            },
            {
              id: 2,
              key: "create_music",
              title: "Créer votre première chanson 🎼",
              body: "Utilisez nos modèles EDN pour générer des chansons médicales. Chaque item devient une mélodie mémorable !",
              type: "onboarding",
              version: parseInt(version),
              is_active: true,
              icon: "🎼"
            },
            {
              id: 3,
              key: "library",
              title: "Organisez votre bibliothèque 📚",
              body: "Sauvegardez vos créations, créez des playlists thématiques et accédez à votre contenu depuis n'importe où.",
              type: "onboarding",
              version: parseInt(version),
              is_active: true,
              icon: "📚"
            }
          ],
          en: [
            {
              id: 1,
              key: "welcome",
              title: "Welcome to MED-MNG! 🎵",
              body: "Discover how to generate personalized medical music with AI. Your learning has never been so melodious!",
              type: "onboarding",
              version: parseInt(version),
              is_active: true,
              icon: "🎵"
            }
          ]
        };

        steps = staticOnboarding[lang as keyof typeof staticOnboarding] || staticOnboarding.fr;
      }

      log('info', `Onboarding served`, { source: data ? 'database' : 'static', lang, steps: steps.length });

      return jsonResponse({
        success: true,
        steps,
        meta: {
          source: data ? 'database' : 'static_fallback',
          lang,
          version,
          total_steps: steps.length
        }
      });
    } catch (error) {
      log('error', 'Error serving onboarding', error);
      return errorResponse(500, ApiErrorCode.SERVER_ERROR, 'Erreur lors du chargement de l\'onboarding');
    }
  }

  // GET /help/tooltips - Aide contextuelle
  if (path === '/help/tooltips' && req.method === 'GET') {
    try {
      const component = url.searchParams.get('component');
      const lang = url.searchParams.get('lang') || 'fr';

      const tooltips = {
        fr: {
          "create-button": {
            title: "Générer une chanson",
            content: "Cliquez ici pour transformer un item EDN en chanson mémorable",
            position: "bottom"
          },
          "library-button": {
            title: "Ma bibliothèque",
            content: "Accédez à toutes vos créations musicales et playlists",
            position: "bottom"
          },
          "quota-indicator": {
            title: "Quota restant",
            content: "Nombre de générations restantes ce mois-ci",
            position: "left"
          }
        },
        en: {
          "create-button": {
            title: "Generate a song",
            content: "Click here to transform an EDN item into a memorable song",
            position: "bottom"
          }
        }
      };

      const langTooltips = tooltips[lang as keyof typeof tooltips] || tooltips.fr;
      
      if (component && langTooltips[component as keyof typeof langTooltips]) {
        return jsonResponse({
          success: true,
          data: langTooltips[component as keyof typeof langTooltips]
        });
      }

      return jsonResponse({
        success: true,
        data: langTooltips
      });
    } catch (error) {
      log('error', 'Error serving tooltips', error);
      return errorResponse(500, ApiErrorCode.SERVER_ERROR, 'Erreur lors du chargement des tooltips');
    }
  }

  return null;
}
