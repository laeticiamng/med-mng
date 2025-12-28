import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

// Images médicales thématiques
const getMedicalImage = (type: string, index: number = 0): string => {
  const medicalImages: Record<string, string[]> = {
    intro: [
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=600&fit=crop'
    ],
    'rang-a': [
      'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800&h=600&fit=crop'
    ],
    'rang-b': [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&h=600&fit=crop'
    ],
    conclusion: [
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=600&fit=crop'
    ]
  };
  const images = medicalImages[type] || medicalImages.intro;
  return images[index % images.length];
};

const scenarios = [
  { lieu: 'aux urgences', action: 'un patient arrive en détresse' },
  { lieu: 'en consultation', action: 'un diagnostic complexe se présente' },
  { lieu: 'au bloc opératoire', action: 'une intervention délicate commence' },
  { lieu: 'en réunion de service', action: 'un cas difficile est discuté' }
];

function generateBdPanels(itemCode: string, title: string, competencesA: any[], competencesB: any[]) {
  const panels: any[] = [];

  panels.push({
    id: 'intro',
    title: `${itemCode} - Introduction`,
    description: `Découvrez l'univers médical de ${title}`,
    image: getMedicalImage('intro', 0),
    type: 'intro',
    competences: []
  });

  for (let i = 0; i < competencesA.length; i += 3) {
    const batch = competencesA.slice(i, i + 3);
    panels.push({
      id: `rang-a-${i}`,
      title: `Rang A - Compétences ${i + 1}-${Math.min(i + 3, competencesA.length)}`,
      description: batch.map((c: any) => c.intitule).join(' • '),
      image: getMedicalImage('rang-a', Math.floor(i / 3)),
      type: 'rang-a',
      competences: batch.map((c: any) => ({
        objectif_id: c.objectif_id,
        intitule: c.intitule,
        rubrique: c.rubrique
      }))
    });
  }

  for (let i = 0; i < competencesB.length; i += 3) {
    const batch = competencesB.slice(i, i + 3);
    panels.push({
      id: `rang-b-${i}`,
      title: `Rang B - Compétences ${i + 1}-${Math.min(i + 3, competencesB.length)}`,
      description: batch.map((c: any) => c.intitule).join(' • '),
      image: getMedicalImage('rang-b', Math.floor(i / 3)),
      type: 'rang-b',
      competences: batch.map((c: any) => ({
        objectif_id: c.objectif_id,
        intitule: c.intitule,
        rubrique: c.rubrique
      }))
    });
  }

  panels.push({
    id: 'conclusion',
    title: `${itemCode} - Synthèse`,
    description: `${competencesA.length + competencesB.length} compétences OIC maîtrisées`,
    image: getMedicalImage('conclusion', 0),
    type: 'conclusion',
    competences: []
  });

  return panels;
}

function generateRomanChapters(itemCode: string, title: string, competencesA: any[], competencesB: any[]) {
  const chapters: any[] = [];

  chapters.push({
    id: 'intro',
    title: 'Prologue : L\'Art Médical',
    content: `Dans l'univers complexe de la médecine moderne, ${title} représente un défi majeur pour tout praticien. Cette histoire vous plongera au cœur des ${competencesA.length + competencesB.length} compétences essentielles de l'${itemCode}.

Notre protagoniste, Dr. Sarah Martin, jeune interne passionnée, découvre l'importance cruciale de maîtriser parfaitement ces concepts médicaux.

Ce roman narratif couvre ${competencesA.length} compétences de Rang A et ${competencesB.length} compétences de Rang B.`,
    type: 'intro',
    competences: []
  });

  for (let i = 0; i < competencesA.length; i += 2) {
    const batch = competencesA.slice(i, i + 2);
    const scenario = scenarios[Math.floor(i / 2) % scenarios.length];

    const chapterContent = batch.map((comp: any) => {
      const rubrique = comp.rubrique ? `[${comp.rubrique}]` : '';
      const description = comp.description?.substring(0, 350) || 'Compétence fondamentale pour la prise en charge.';
      return `${rubrique}\n\n"${comp.intitule}", explique le chef de service.\n\n${description}\n\nRéférence: ${comp.objectif_id}`;
    }).join('\n\n---\n\n');

    chapters.push({
      id: `rang-a-${i}`,
      title: `Chapitre ${chapters.length} : Les Fondements`,
      content: `Ce matin-là, ${scenario.lieu}, ${scenario.action}.\n\n${chapterContent}`,
      type: 'rang-a',
      competences: batch.map((c: any) => ({
        objectif_id: c.objectif_id,
        intitule: c.intitule,
        description: c.description,
        rubrique: c.rubrique
      }))
    });
  }

  for (let i = 0; i < competencesB.length; i += 2) {
    const batch = competencesB.slice(i, i + 2);
    const scenario = scenarios[(Math.floor(i / 2) + 2) % scenarios.length];

    const chapterContent = batch.map((comp: any) => {
      const rubrique = comp.rubrique ? `[${comp.rubrique}]` : '';
      const description = comp.description?.substring(0, 350) || 'Analyse experte avancée.';
      return `${rubrique}\n\nFace à "${comp.intitule}", elle mobilise son expertise.\n\n${description}\n\nRéférence: ${comp.objectif_id}`;
    }).join('\n\n---\n\n');

    chapters.push({
      id: `rang-b-${i}`,
      title: `Chapitre ${chapters.length} : L'Expertise`,
      content: `${scenario.lieu.charAt(0).toUpperCase() + scenario.lieu.slice(1)}, l'expertise est mise à l'épreuve.\n\n${chapterContent}`,
      type: 'rang-b',
      competences: batch.map((c: any) => ({
        objectif_id: c.objectif_id,
        intitule: c.intitule,
        description: c.description,
        rubrique: c.rubrique
      }))
    });
  }

  chapters.push({
    id: 'epilogue',
    title: 'Épilogue : La Maîtrise Accomplie',
    content: `Bilan de formation:\n• ${competencesA.length} compétences Rang A maîtrisées\n• ${competencesB.length} compétences Rang B acquises\n• ${competencesA.length + competencesB.length} objectifs atteints\n\n${title} n'a plus de secrets.`,
    type: 'conclusion',
    competences: []
  });

  return chapters;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🚀 VERSION 5.0 - CHARGEMENT COMPLET OIC + BD/ROMAN');

    // Récupérer tous les items
    const { data: items, error: itemsError } = await supabase
      .from('edn_items_immersive')
      .select('id, item_code, title, subtitle');

    if (itemsError) throw itemsError;
    console.log(`📦 ${items?.length || 0} items EDN chargés`);

    // Charger TOUTES les compétences OIC
    console.log('🔄 Chargement des compétences OIC...');
    
    const { count: totalCount } = await supabase
      .from('oic_competences')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Total compétences en base: ${totalCount}`);
    
    let allOicCompetences: any[] = [];
    let offset = 0;
    const pageSize = 1000;
    
    while (offset < (totalCount || 0)) {
      const { data: batch, error: batchError } = await supabase
        .from('oic_competences')
        .select('item_parent, rang, objectif_id, intitule, description, rubrique')
        .range(offset, offset + pageSize - 1);
      
      if (batchError) throw batchError;
      
      allOicCompetences = allOicCompetences.concat(batch || []);
      offset += pageSize;
      console.log(`📥 Chargé ${allOicCompetences.length}/${totalCount} compétences`);
    }

    console.log(`✅ TOTAL CHARGÉ: ${allOicCompetences.length} compétences`);

    // Indexer par item_parent + rang
    const oicByItem = new Map<string, any[]>();
    let acceptedCount = 0;
    
    for (const comp of allOicCompetences) {
      if (!comp.intitule) continue;
      
      acceptedCount++;
      const key = `${comp.item_parent}_${comp.rang}`;
      if (!oicByItem.has(key)) {
        oicByItem.set(key, []);
      }
      oicByItem.get(key)!.push(comp);
    }
    
    console.log(`✅ ACCEPTÉES: ${acceptedCount}`);
    console.log(`📋 Clés uniques: ${oicByItem.size}`);

    let updatedCount = 0;
    let itemsWithBd = 0;
    let itemsWithRoman = 0;
    const errors: any[] = [];

    for (const item of items || []) {
      try {
        const itemNumber = item.item_code.replace('IC-', '').padStart(3, '0');
        
        const oicRangA = oicByItem.get(`${itemNumber}_A`) || [];
        const oicRangB = oicByItem.get(`${itemNumber}_B`) || [];

        // Générer Tableaux Rang A/B
        const tableauRangA = {
          title: `${item.item_code} Rang A - ${item.title}`,
          subtitle: item.subtitle || "Compétences fondamentales",
          objectifs: oicRangA.length > 0 
            ? oicRangA.slice(0, 5).map((c: any) => c.intitule)
            : [`Comprendre les bases de ${item.title}`],
          competences_cles: oicRangA.length > 0 
            ? oicRangA.map((comp: any) => ({
                niveau: "Fondamental",
                competence: comp.intitule,
                description: comp.description || `Compétence pour ${item.title}`,
                rubrique: comp.rubrique || "Compétence Fondamentale",
                objectif_id: comp.objectif_id
              }))
            : [{
                niveau: "Fondamental",
                competence: `Connaissances de base - ${item.title}`,
                description: `Maîtriser les connaissances fondamentales concernant ${item.title}`,
                rubrique: "Compétence Fondamentale"
              }],
          situations_cliniques: [`Cas clinique standard de ${item.title}`]
        };

        const tableauRangB = {
          title: `${item.item_code} Rang B - ${item.title}`,
          subtitle: item.subtitle || "Compétences avancées",
          objectifs: oicRangB.length > 0
            ? oicRangB.slice(0, 5).map((c: any) => c.intitule)
            : [`Maîtriser la prise en charge complexe de ${item.title}`],
          competences_cles: oicRangB.length > 0
            ? oicRangB.map((comp: any) => ({
                niveau: "Avancé",
                competence: comp.intitule,
                description: comp.description || `Compétence avancée pour ${item.title}`,
                rubrique: comp.rubrique || "Compétence Avancée",
                objectif_id: comp.objectif_id
              }))
            : [{
                niveau: "Avancé",
                competence: `Expertise avancée - ${item.title}`,
                description: `Expertise approfondie dans la gestion de ${item.title}`,
                rubrique: "Compétence Avancée"
              }],
          situations_cliniques: [`Cas complexe de ${item.title}`]
        };

        // Générer BD Panels
        const bdPanels = generateBdPanels(item.item_code, item.title, oicRangA, oicRangB);
        if (bdPanels.length > 2) itemsWithBd++;

        // Générer Roman Chapters
        const romanChapters = generateRomanChapters(item.item_code, item.title, oicRangA, oicRangB);
        if (romanChapters.length > 2) itemsWithRoman++;

        const { error: updateError } = await supabase
          .from('edn_items_immersive')
          .update({
            tableau_rang_a: tableauRangA,
            tableau_rang_b: tableauRangB,
            bd_panels: bdPanels,
            roman_story: romanChapters
          })
          .eq('id', item.id);

        if (updateError) {
          errors.push({ item_code: item.item_code, error: updateError.message });
        } else {
          updatedCount++;
        }
      } catch (itemError: any) {
        errors.push({ item_code: item.item_code, error: itemError.message });
      }
    }

    console.log(`🎉 TERMINÉ: ${updatedCount} items mis à jour`);
    console.log(`📚 Items avec BD: ${itemsWithBd}`);
    console.log(`📖 Items avec Roman: ${itemsWithRoman}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${updatedCount} items régénérés avec BD/Roman`,
        total_processed: items?.length || 0,
        updated: updatedCount,
        items_with_bd: itemsWithBd,
        items_with_roman: itemsWithRoman,
        total_oic_loaded: allOicCompetences.length,
        errors: errors.slice(0, 10)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('💥 Erreur:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});