const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
};

const supabaseUrl = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjgxMTgyNywiZXhwIjoyMDU4Mzg3ODI3fQ.JNT0dLPKWd7oQ2_56I0u1h5QWmMwQnLaVL1xVYkOI_c';

interface SupabaseClient {
  from(table: string): any;
}

function createSupabaseClient(): SupabaseClient {
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            const url = `${supabaseUrl}/rest/v1/${table}?select=${columns || '*'}&${column}=eq.${value}`;
            const response = await fetch(url, {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              }
            });
            const data = await response.json();
            return { data: Array.isArray(data) ? data[0] : data, error: !response.ok ? data : null };
          }
        }),
        order: (column: string, options?: any) => ({
          range: async (start: number, end: number) => {
            const url = `${supabaseUrl}/rest/v1/${table}?select=${columns || '*'}&order=${column}.${options?.ascending ? 'asc' : 'desc'}&offset=${start}&limit=${end - start + 1}`;
            const response = await fetch(url, {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              }
            });
            const data = await response.json();
            return { data: Array.isArray(data) ? data : [], error: !response.ok ? data : null };
          }
        })
      }),
      update: (updateData: any) => ({
        eq: (column: string, value: any) => ({
          select: async () => {
            const url = `${supabaseUrl}/rest/v1/${table}?${column}=eq.${value}`;
            const response = await fetch(url, {
              method: 'PATCH',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
              },
              body: JSON.stringify(updateData)
            });
            const data = await response.json();
            return { data: Array.isArray(data) ? data : [data], error: !response.ok ? data : null };
          }
        })
      })
    })
  };
}

function generateParolesFromCompetences(competences: any[], rang: 'A' | 'B', itemCode: string): string[] {
  if (!competences || competences.length === 0) {
    return [
      `[Couplet ${rang} - Item ${itemCode}]`,
      `Item ${itemCode} Rang ${rang} - Connaissances à maîtriser`,
      `Compétences essentielles en médecine moderne`,
      `Excellence clinique et formation continue`,
      `Patient au centre de nos préoccupations`,
      ``,
      `[Refrain ${rang}]`,
      `${itemCode} Rang ${rang} - Expertise médicale`,
      `Science et conscience réunies`,
      `Pour soigner avec excellence`,
      `Et servir l'humanité`
    ];
  }

  const paroles = [
    `[Introduction - Item ${itemCode} Rang ${rang}]`,
    `${itemCode} Rang ${rang} - Excellence médicale en action`
  ];

  // Ajouter les compétences principales
  competences.slice(0, 3).forEach((comp, index) => {
    paroles.push('');
    paroles.push(`[Couplet ${index + 1} - ${comp.objectif_id || `Compétence ${index + 1}`}]`);
    
    const intitule = comp.intitule || `Compétence ${comp.objectif_id}`;
    const description = comp.description || 'Description à compléter';
    
    // Créer des vers chantables à partir du contenu
    const vers1 = intitule.length > 50 ? intitule.substring(0, 50) + '...' : intitule;
    const vers2 = description.length > 50 ? description.substring(0, 50) + '...' : description;
    
    paroles.push(vers1);
    paroles.push(vers2);
    paroles.push(`Maîtrise clinique pour ${itemCode}`);
    paroles.push(`Excellence dans la pratique médicale`);
  });

  // Refrain principal
  paroles.push('');
  paroles.push(`[Refrain Principal - ${itemCode}]`);
  paroles.push(`${itemCode} Rang ${rang} - Compétences maîtrisées`);
  paroles.push(`Science médicale et humanisme réunis`);
  paroles.push(`Pour le bien-être de nos patients`);
  paroles.push(`Excellence et déontologie médicale`);

  // Bridge avec compétences supplémentaires
  if (competences.length > 3) {
    paroles.push('');
    paroles.push(`[Bridge - Compétences avancées]`);
    competences.slice(3, 6).forEach(comp => {
      const intitule = comp.intitule || `Compétence ${comp.objectif_id}`;
      const shortTitle = intitule.split(' ').slice(0, 8).join(' ');
      paroles.push(shortTitle);
    });
  }

  // Outro
  paroles.push('');
  paroles.push(`[Outro - ${itemCode}]`);
  paroles.push(`Item ${itemCode} Rang ${rang} - Mission accomplie`);
  paroles.push(`Compétences intégrées et validées`);
  paroles.push(`Au service de la médecine d'excellence`);

  return paroles;
}

function generateParolesAB(parolesA: string[], parolesB: string[], itemCode: string): string[] {
  const parolesAB = [
    `[Introduction Complète - Item ${itemCode}]`,
    `${itemCode} - Maîtrise complète A et B`,
    `Excellence médicale globale`,
    '',
    `[Fusion Rang A et B]`
  ];

  // Mélanger intelligemment les paroles A et B
  const sectionsA = parolesA.filter(line => line.includes('[') && line.includes(']'));
  const sectionsB = parolesB.filter(line => line.includes('[') && line.includes(']'));

  // Ajouter des extraits des deux rangs
  if (parolesA.length > 5) {
    parolesAB.push(...parolesA.slice(2, 5));
  }
  
  parolesAB.push('');
  parolesAB.push(`[Transition A vers B]`);
  
  if (parolesB.length > 5) {
    parolesAB.push(...parolesB.slice(2, 5));
  }

  parolesAB.push('');
  parolesAB.push(`[Refrain Unifié - ${itemCode}]`);
  parolesAB.push(`${itemCode} - Excellence A et B combinées`);
  parolesAB.push(`Compétences fondamentales et avancées`);
  parolesAB.push(`Médecine holistique et spécialisée`);
  parolesAB.push(`Formation médicale d'excellence globale`);

  parolesAB.push('');
  parolesAB.push(`[Final - Maîtrise Complète]`);
  parolesAB.push(`Item ${itemCode} - Rang A et B maîtrisés`);
  parolesAB.push(`Excellence médicale accomplie`);
  parolesAB.push(`Au service de nos patients`);

  return parolesAB;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎵 Démarrage génération paroles pour tous les items...');
    
    const supabase = createSupabaseClient();
    
    // 1. Récupérer tous les items EDN
    console.log('📋 Récupération des items EDN...');
    const { data: items, error: itemsError } = await supabase
      .from('edn_items_complete')
      .select('id, item_code, title')
      .order('item_code', { ascending: true })
      .range(0, 100); // Traiter par batch de 100

    if (itemsError) {
      throw new Error(`Erreur récupération items: ${itemsError.message}`);
    }

    console.log(`📊 ${items?.length || 0} items trouvés`);

    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    for (const item of items || []) {
      try {
        console.log(`🎵 Traitement item ${item.item_code}...`);
        processedCount++;

        // 2. Récupérer les compétences OIC pour cet item
        const itemNumber = item.item_code.replace('IC-', '');
        
        const { data: competencesA, error: compAError } = await supabase
          .from('oic_competences')
          .select('*')
          .eq('item_parent', item.item_code)
          .eq('rang', 'A')
          .order('ordre', { ascending: true })
          .range(0, 20);

        const { data: competencesB, error: compBError } = await supabase
          .from('oic_competences')
          .select('*')
          .eq('item_parent', item.item_code)
          .eq('rang', 'B')
          .order('ordre', { ascending: true })
          .range(0, 20);

        // 3. Générer les paroles pour chaque rang
        const parolesRangA = generateParolesFromCompetences(
          competencesA || [], 
          'A', 
          item.item_code
        );

        const parolesRangB = generateParolesFromCompetences(
          competencesB || [], 
          'B', 
          item.item_code
        );

        const parolesRangAB = generateParolesAB(
          parolesRangA, 
          parolesRangB, 
          item.item_code
        );

        // 4. Mettre à jour l'item avec les nouvelles paroles
        const updateData = {
          paroles_musicales: parolesRangA, // Paroles principales (Rang A)
          // Note: Il semble que la structure actuelle ne supporte que paroles_musicales
          // Si on veut ajouter les autres, il faudrait modifier le schéma
          updated_at: new Date().toISOString()
        };

        const { data: updateResult, error: updateError } = await supabase
          .from('edn_items_complete')
          .update(updateData)
          .eq('id', item.id)
          .select();

        if (updateError) {
          throw new Error(`Erreur mise à jour: ${updateError.message}`);
        }

        successCount++;
        console.log(`✅ Item ${item.item_code} mis à jour avec succès`);

        // Petite pause pour éviter de surcharger la base
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        errorCount++;
        const errorMsg = `Erreur item ${item.item_code}: ${error.message}`;
        console.error(`❌ ${errorMsg}`);
        errors.push({
          item_code: item.item_code,
          error: error.message
        });
      }
    }

    console.log(`🎵 Génération terminée:
    - Traités: ${processedCount}
    - Succès: ${successCount}  
    - Erreurs: ${errorCount}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Génération des paroles terminée',
      stats: {
        processed: processedCount,
        success: successCount,
        errors: errorCount
      },
      errors: errors.slice(0, 10) // Limiter les erreurs retournées
    }), {
      headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
    });
  }
});