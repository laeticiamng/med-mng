import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

interface CompetenceOIC {
  item_parent: string;
  objectif_id: string;
  rang: string;
  intitule: string;
  description: string;
  ordre: number;
}

interface FixReport {
  totalProcessed: number;
  htmlEntitiesFixed: number;
  fragmentsReconstructed: number;
  emptyDescriptionsHandled: number;
  wikitablesCleaned: number;
  intitulesFixed: number;
  entriesReextracted: number;
  errors: string[];
  samples: any[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action = 'analyze' } = await req.json().catch(() => ({}));

    console.log(`🚀 Starting OIC data quality ${action}...`);

    if (action === 'analyze') {
      return await analyzeDataQuality(supabaseClient);
    } else if (action === 'fix') {
      return await fixDataQuality(supabaseClient);
    } else {
      return new Response(JSON.stringify({ error: 'Invalid action. Use "analyze" or "fix"' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('❌ Error in fix-oic-data-quality:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeDataQuality(supabaseClient: any) {
  console.log('🔍 Analyzing OIC data quality...');
  
  // Récupérer toutes les compétences
  const { data: competences, error } = await supabaseClient
    .from('oic_competences')
    .select('*')
    .order('item_parent', { ascending: true })
    .order('ordre', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch competences: ${error.message}`);
  }

  console.log(`📊 Analyzing ${competences.length} competences...`);

  const analysis = {
    totalCompetences: competences.length,
    emptyDescriptions: 0,
    tooShortDescriptions: 0,
    htmlEntitiesCorrupted: 0,
    fragmentsIncomplete: 0,
    intitulesCorrupted: 0,
    wikitablesDetected: 0,
    samples: {
      emptyDescriptions: [],
      htmlCorrupted: [],
      fragments: [],
      intitulesCorrupted: [],
      wikitables: []
    }
  };

  for (const comp of competences) {
    const desc = comp.description || '';
    const intitule = comp.intitule || '';

    // Descriptions vides
    if (!desc.trim() || desc.trim() === '<br />') {
      analysis.emptyDescriptions++;
      if (analysis.samples.emptyDescriptions.length < 5) {
        analysis.samples.emptyDescriptions.push({
          item: comp.item_parent,
          objectif: comp.objectif_id,
          intitule: comp.intitule
        });
      }
    }

    // Descriptions trop courtes
    if (desc.trim().length < 30 && desc.trim().length > 0) {
      analysis.tooShortDescriptions++;
    }

    // Entités HTML corrompues
    if (desc.includes('&lt;') || desc.includes('&gt;') || desc.includes('&nbsp;')) {
      analysis.htmlEntitiesCorrupted++;
      if (analysis.samples.htmlCorrupted.length < 5) {
        analysis.samples.htmlCorrupted.push({
          item: comp.item_parent,
          objectif: comp.objectif_id,
          description: desc.substring(0, 100) + '...'
        });
      }
    }

    // Fragments incomplets (commencent par - ou *)
    if (/^[-*•]\s/.test(desc.trim())) {
      analysis.fragmentsIncomplete++;
      if (analysis.samples.fragments.length < 5) {
        analysis.samples.fragments.push({
          item: comp.item_parent,
          objectif: comp.objectif_id,
          description: desc.substring(0, 100) + '...'
        });
      }
    }

    // Intitulés corrompus (contiennent [[...]])
    if (intitule.includes('[[') && intitule.includes(']]')) {
      analysis.intitulesCorrupted++;
      if (analysis.samples.intitulesCorrupted.length < 5) {
        analysis.samples.intitulesCorrupted.push({
          item: comp.item_parent,
          objectif: comp.objectif_id,
          intitule: comp.intitule
        });
      }
    }

    // Tables MediaWiki
    if (desc.includes('{|') && desc.includes('|}')) {
      analysis.wikitablesDetected++;
      if (analysis.samples.wikitables.length < 3) {
        analysis.samples.wikitables.push({
          item: comp.item_parent,
          objectif: comp.objectif_id,
          description: desc.substring(0, 200) + '...'
        });
      }
    }
  }

  // Calcul des pourcentages
  const percentages = {
    emptyDescriptions: ((analysis.emptyDescriptions / analysis.totalCompetences) * 100).toFixed(1),
    tooShortDescriptions: ((analysis.tooShortDescriptions / analysis.totalCompetences) * 100).toFixed(1),
    htmlEntitiesCorrupted: ((analysis.htmlEntitiesCorrupted / analysis.totalCompetences) * 100).toFixed(1),
    fragmentsIncomplete: ((analysis.fragmentsIncomplete / analysis.totalCompetences) * 100).toFixed(1),
    intitulesCorrupted: ((analysis.intitulesCorrupted / analysis.totalCompetences) * 100).toFixed(1),
    wikitablesDetected: ((analysis.wikitablesDetected / analysis.totalCompetences) * 100).toFixed(1)
  };

  const totalProblems = analysis.emptyDescriptions + analysis.tooShortDescriptions + 
                       analysis.htmlEntitiesCorrupted + analysis.fragmentsIncomplete + 
                       analysis.intitulesCorrupted + analysis.wikitablesDetected;

  const result = {
    analysis,
    percentages,
    totalProblems,
    healthScore: Math.max(0, 100 - ((totalProblems / analysis.totalCompetences) * 100)).toFixed(1)
  };

  console.log(`✅ Analysis complete: ${totalProblems} problems found (${(totalProblems/analysis.totalCompetences*100).toFixed(1)}%)`);

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function fixDataQuality(supabaseClient: any) {
  console.log('🔧 Starting AGGRESSIVE OIC data quality fixes...');
  
  const report: FixReport = {
    totalProcessed: 0,
    htmlEntitiesFixed: 0,
    fragmentsReconstructed: 0,
    emptyDescriptionsHandled: 0,
    wikitablesCleaned: 0,
    intitulesFixed: 0,
    entriesReextracted: 0,
    errors: [],
    samples: []
  };

  // Récupérer SEULEMENT les compétences problématiques pour optimiser
  const { data: competences, error } = await supabaseClient
    .from('oic_competences')
    .select('*')
    .or('description.like.%&lt;%,description.like.%&gt;%,description.like.%&nbsp;%,description.like.-%,description.like.*%,intitule.like.%[[%]]%,description.is.null,description.eq.')
    .limit(1000)

  if (error) {
    throw new Error(`Failed to fetch competences: ${error.message}`);
  }

  console.log(`🛠️ Processing ${competences.length} competences for fixes...`);

  for (const comp of competences) {
    try {
      let needsUpdate = false;
      let fixedIntitule = comp.intitule || '';
      let fixedDescription = comp.description || '';
      const fixes = [];

      // 0. Ré-extraction si raw_json disponible pour les entrées problématiques
      if (comp.raw_json) {
        const rawContent = extractContentFromRawJson(comp.raw_json);
        if (rawContent) {
          const extracted = extractFromRawContent(rawContent, fixedIntitule, fixedDescription);
          if (extracted) {
            fixedIntitule = extracted.intitule;
            fixedDescription = extracted.description;
            needsUpdate = true;
            fixes.push('reextracted_from_raw');
            report.entriesReextracted++;
          }
        }
      }

      // 1. Nettoyer les intitulés corrompus
      if (fixedIntitule.includes('[[') && fixedIntitule.includes(']]')) {
        // Extraire le texte des liens MediaWiki [[text|display]] ou [[text]]
        fixedIntitule = fixedIntitule.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, link, display) => {
          return display || link;
        });
        // Nettoyer les numéros d'items en début
        fixedIntitule = fixedIntitule.replace(/^\d+\.\s*/, '');
        needsUpdate = true;
        fixes.push('intitule_cleaned');
        report.intitulesFixed++;
      }

      // 2. Corriger les entités HTML
      if (fixedDescription.includes('&lt;') || fixedDescription.includes('&gt;') || fixedDescription.includes('&nbsp;')) {
        fixedDescription = fixedDescription
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(Number(code)));
        needsUpdate = true;
        fixes.push('html_entities_fixed');
        report.htmlEntitiesFixed++;
      }

      // 3. Nettoyer les tables MediaWiki
      if (fixedDescription.includes('{|') && fixedDescription.includes('|}')) {
        // Convertir les tables MediaWiki en HTML standard
        fixedDescription = fixedDescription.replace(/\{\|[\s\S]*?\|\}/g, (table) => convertMediaWikiTableToHtml(table));
        needsUpdate = true;
        fixes.push('wikitable_cleaned');
        report.wikitablesCleaned++;
      }

      // 4. Corriger les liens MediaWiki dans les descriptions
      if (fixedDescription.includes('[[') && fixedDescription.includes(']]')) {
        fixedDescription = fixedDescription.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, link, display) => {
          return display || link;
        });
        needsUpdate = true;
        fixes.push('wiki_links_cleaned');
      }

      // 5. Améliorer les fragments incomplets
      if (/^[-*•]\s/.test(fixedDescription.trim()) && fixedDescription.trim().length < 100) {
        // Ajouter un contexte minimal pour les fragments trop courts
        if (fixedDescription.trim().length < 30) {
          fixedDescription = `Compétence relative à : ${fixedDescription.replace(/^[-*•]\s*/, '')}`;
          needsUpdate = true;
          fixes.push('fragment_contextualized');
          report.fragmentsReconstructed++;
        } else {
          // Simplement nettoyer le préfixe pour les fragments plus longs
          fixedDescription = fixedDescription.replace(/^[-*•]\s*/, '').trim();
          needsUpdate = true;
          fixes.push('fragment_prefix_cleaned');
        }
      }

      // 6. Gérer les descriptions vides
      if (!fixedDescription.trim() || fixedDescription.trim() === '<br />') {
        fixedDescription = `Compétence OIC ${comp.objectif_id} - ${fixedIntitule}`;
        needsUpdate = true;
        fixes.push('empty_description_generated');
        report.emptyDescriptionsHandled++;
      }

      // 7. Nettoyer les balises HTML simples
      fixedDescription = fixedDescription
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/^\s*\n+|\n+\s*$/g, '') // Supprimer les retours à la ligne en début/fin
        .replace(/\n{3,}/g, '\n\n') // Limiter les retours à la ligne multiples
        .trim();

      // Mettre à jour si nécessaire
      if (needsUpdate) {
        const { error: updateError } = await supabaseClient
          .from('oic_competences')
          .update({
            intitule: fixedIntitule,
            description: fixedDescription,
            updated_at: new Date().toISOString()
          })
          .eq('objectif_id', comp.objectif_id);

        if (updateError) {
          report.errors.push(`Failed to update ${comp.objectif_id}: ${updateError.message}`);
        } else {
          if (report.samples.length < 10) {
            report.samples.push({
              objectif_id: comp.objectif_id,
              item_parent: comp.item_parent,
              fixes,
              before: {
                intitule: comp.intitule,
                description: comp.description?.substring(0, 100) + '...'
              },
              after: {
                intitule: fixedIntitule,
                description: fixedDescription.substring(0, 100) + '...'
              }
            });
          }
        }
      }

      report.totalProcessed++;

      // Progression tous les 500 items
      if (report.totalProcessed % 500 === 0) {
        console.log(`📈 Progress: ${report.totalProcessed}/${competences.length} processed`);
      }

    } catch (error) {
      report.errors.push(`Error processing ${comp.objectif_id}: ${error.message}`);
    }
  }

  // Statistiques finales
  const summary = {
    report,
    totalFixed: report.htmlEntitiesFixed + report.fragmentsReconstructed + 
               report.emptyDescriptionsHandled + report.wikitablesCleaned + report.intitulesFixed,
    successRate: ((report.totalProcessed - report.errors.length) / report.totalProcessed * 100).toFixed(1)
  };

  console.log(`✅ Fix complete: ${summary.totalFixed} total fixes applied`);

  return new Response(JSON.stringify(summary), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function extractContentFromRawJson(rawJson: any): string | null {
  if (!rawJson) return null;
  return (
    rawJson?.revisions?.[0]?.slots?.main?.content ||
    rawJson?.revisions?.[0]?.['*'] ||
    rawJson?.revisions?.[0]?.content ||
    rawJson?.content ||
    null
  );
}

function extractFromRawContent(
  content: string,
  fallbackIntitule: string,
  fallbackDescription: string
): { intitule: string; description: string } | null {
  const intitulePatterns = [
    /\|\s*[Ii]ntitulé\s*=\s*([^\n\|]+)/,
    /\|\s*[Tt]itre\s*=\s*([^\n\|]+)/,
    /'''(.+?)'''/,
    /<th[^>]*>[Ii]ntitulé<\/th>\s*<td[^>]*>([^<]+)/,
    /==\s*(.+?)\s*==/,
    /^\s*(.*?)$/m
  ];

  let intitule = fallbackIntitule;
  for (const pattern of intitulePatterns) {
    const match = pattern.exec(content);
    if (match && match[1] && match[1].trim()) {
      intitule = match[1].trim();
      break;
    }
  }

  const descPatterns = [
    /\|\s*[Dd]escription\s*=\s*([^\n\|]+)/,
    /\|\s*[Dd]éfinition\s*=\s*([^\n\|]+)/,
    /<th[^>]*>[Dd]escription<\/th>\s*<td[^>]*>([^<]+)/,
    /\n\n(.+?)(?=\n\n|\[\[|==|$)/s
  ];

  let description = fallbackDescription || '';
  for (const pattern of descPatterns) {
    const match = pattern.exec(content);
    if (match && match[1] && match[1].trim()) {
      description = match[1].trim();
      break;
    }
  }

  if (!description && !intitule) {
    return null;
  }

  const cleanedDescription = description
    .replace(/\[\[(.+?)\|(.+?)\]\]/g, '$2')
    .replace(/\[\[(.+?)\]\]/g, '$1')
    .replace(/'''(.+?)'''/g, '$1')
    .replace(/''(.+?)''/g, '$1')
    .replace(/{{.+?}}/g, '')
    .replace(/<ref.*?\/>/g, '')
    .replace(/<.*?>/g, '')
    .trim();

  return {
    intitule: intitule.substring(0, 500),
    description: cleanedDescription.substring(0, 2000)
  };
}

function convertMediaWikiTableToHtml(tableText: string): string {
  const lines = tableText.split('\n');
  const rows: Array<{ cells: string[]; isHeader: boolean }> = [];
  let currentRow: { cells: string[]; isHeader: boolean } = { cells: [], isHeader: false };

  const pushRow = () => {
    if (currentRow.cells.length > 0) {
      rows.push(currentRow);
      currentRow = { cells: [], isHeader: false };
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('{|')) {
      continue;
    }
    if (trimmed.startsWith('|}')) {
      pushRow();
      break;
    }
    if (trimmed.startsWith('|-')) {
      pushRow();
      continue;
    }

    const isHeader = trimmed.startsWith('!');
    if (trimmed.startsWith('|') || trimmed.startsWith('!')) {
      const cellContent = trimmed.slice(1).trim();
      const parts = cellContent.split(/!!|\|\|/g);
      const cleanedParts = parts
        .map((cell) => cell.replace(/^[^|]*\|\s*/, '').trim())
        .filter(Boolean);

      if (cleanedParts.length > 0) {
        currentRow.isHeader = currentRow.isHeader || isHeader;
        currentRow.cells.push(...cleanedParts);
      }
    }
  }

  if (rows.length === 0) {
    return tableText;
  }

  const headerRows = rows.filter((row) => row.isHeader);
  const bodyRows = rows.filter((row) => !row.isHeader);

  const thead = headerRows.length
    ? `<thead>${headerRows
        .map(
          (row) =>
            `<tr>${row.cells.map((cell) => `<th>${cell}</th>`).join('')}</tr>`
        )
        .join('')}</thead>`
    : '';

  const tbodyRows = (bodyRows.length ? bodyRows : rows).map(
    (row) => `<tr>${row.cells.map((cell) => `<td>${cell}</td>`).join('')}</tr>`
  );

  return `<table class="wikitable">${thead}<tbody>${tbodyRows.join('')}</tbody></table>`;
}
