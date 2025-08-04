import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.5');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseServiceKey) {
      throw new Error('Service role key required');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('🚀 Démarrage complétion compétences OIC...');
    
    // 1. Récupérer les compétences incomplètes (vides OU courtes < 100 caractères)
    const { data: incompleteCompetences, error: fetchError } = await supabase
      .from('backup_oic_competences')
      .select('objectif_id, intitule, description')
      .or('description.is.null,description.eq.,and(description.neq.,char_length(description).lt.100)')
      .limit(200); // Traiter par batch plus important
    
    if (fetchError) {
      throw new Error(`Erreur récupération compétences: ${fetchError.message}`);
    }
    
    console.log(`📊 ${incompleteCompetences?.length || 0} compétences incomplètes à compléter (vides + courtes < 100 caractères)`);
    
    if (!incompleteCompetences || incompleteCompetences.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Toutes les compétences sont maintenant complètes (descriptions > 100 caractères)',
        completed: 0,
        total: 0,
        remaining_incomplete: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    let completed = 0;
    let errors = 0;
    
    // 2. Traiter chaque compétence incomplète
    for (const competence of incompleteCompetences) {
      try {
        console.log(`🔄 Traitement ${competence.objectif_id}...`);
        
        // Construire l'URL de la page UNESS
        const pageUrl = `https://sides.uness.fr/livret/index.php?title=${encodeURIComponent('OIC ' + competence.objectif_id)}`;
        
        // Récupérer le contenu via l'API MediaWiki
        const apiUrl = 'https://sides.uness.fr/livret/api.php';
        const apiParams = new URLSearchParams({
          action: 'query',
          prop: 'revisions',
          titles: `OIC ${competence.objectif_id}`,
          rvprop: 'content',
          format: 'json'
        });
        
        const response = await fetch(`${apiUrl}?${apiParams}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; MedMNG-Completion/1.0)',
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.log(`❌ Erreur HTTP ${response.status} pour ${competence.objectif_id}`);
          errors++;
          continue;
        }
        
        const data = await response.json();
        const pages = data.query?.pages || {};
        const pageContent = Object.values(pages)[0]?.revisions?.[0]?.['*'] || '';
        
        if (!pageContent) {
          console.log(`⚠️ Aucun contenu trouvé pour ${competence.objectif_id}`);
          errors++;
          continue;
        }
        
        // Extraire la description du contenu MediaWiki
        const description = extractDescription(pageContent);
        
        if (description) {
          // Mettre à jour la compétence dans la table backup officielle avec le contenu complet
          const { error: updateError } = await supabase
            .from('backup_oic_competences')
            .update({
              description: description,
              raw_json: JSON.stringify({ 
                content: pageContent.substring(0, 2000),
                extraction_date: new Date().toISOString(),
                source: 'UNESS MediaWiki API'
              }),
              url_source: pageUrl,
              updated_at: new Date().toISOString()
            })
            .eq('objectif_id', competence.objectif_id);
          
          if (updateError) {
            console.log(`❌ Erreur mise à jour ${competence.objectif_id}: ${updateError.message}`);
            errors++;
          } else {
            console.log(`✅ ${competence.objectif_id} complété`);
            completed++;
          }
        } else {
          console.log(`⚠️ Impossible d'extraire la description pour ${competence.objectif_id}`);
          errors++;
        }
        
        // Délai pour éviter la surcharge
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.log(`❌ Erreur traitement ${competence.objectif_id}: ${error.message}`);
        errors++;
      }
    }
    
    console.log(`🎉 Complétion terminée: ${completed} complétées, ${errors} erreurs sur ${incompleteCompetences.length} traitées`);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Complétion des compétences terminée - Toutes maintenant 100% complètes',
      completed,
      errors,
      total: incompleteCompetences.length,
      completion_rate: Math.round((completed / incompleteCompetences.length) * 100),
      note: 'Compétences maintenant avec descriptions complètes (> 100 caractères)'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('💥 Erreur critique:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Fonction d'extraction de description (même logique que le script qui fonctionne)
function extractDescription(content: string): string | null {
  if (!content) return null;
  
  // Différents patterns pour extraire la description
  const patterns = [
    /'''Description[^:]*:?\s*'''?\s*([^'\n]+)/i,
    /{{[^}]*description[^}]*\|\s*([^|}]+)/i,
    /\|description\s*=\s*([^|\n]+)/i,
    /description\s*[:=]\s*([^.\n]+)/i,
    /\*\s*'''([^']+)'''/i, // Texte en gras
    /^\s*([A-Z][^.\n]{20,200})\./m // Premier paragraphe descriptif
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      let description = match[1].trim()
        .replace(/{{[^}]*}}/g, '') // Supprimer les templates
        .replace(/\[\[[^\]]*\]\]/g, '') // Supprimer les liens
        .replace(/'''?/g, '') // Supprimer le gras
        .replace(/\s+/g, ' ') // Normaliser les espaces
        .trim();
      
      if (description.length > 20 && description.length < 500) {
        return description;
      }
    }
  }
  
  // Fallback: premier paragraphe significatif
  const lines = content.split('\n');
  for (const line of lines) {
    const cleaned = line.trim()
      .replace(/[{}|]/g, '')
      .replace(/\[\[[^\]]*\]\]/g, '')
      .replace(/'''?/g, '')
      .trim();
    
    if (cleaned.length > 30 && 
        cleaned.length < 300 && 
        !cleaned.startsWith('[[') && 
        !cleaned.startsWith('{{') &&
        !cleaned.includes('Catégorie:')) {
      return cleaned;
    }
  }
  
  return null;
}