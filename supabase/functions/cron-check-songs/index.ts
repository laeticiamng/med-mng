import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// À exécuter toutes les 5 minutes
serve(async (req) => {
  // Appeler la fonction de vérification
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/check-pending-songs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
    }
  });

  const result = await response.json();
  console.log('🔄 CRON check résultat:', result);

  return new Response(JSON.stringify(result));
});
