/**
 * 📚 Generate BD & Roman Content
 * 
 * Génère le contenu BD et Roman pour les items EDN
 * basé sur les compétences OIC réelles
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BdPanel {
  id: string;
  title: string;
  description: string;
  image: string;
  type: 'intro' | 'rang-a' | 'rang-b' | 'conclusion';
  competences: Array<{
    objectif_id: string;
    intitule: string;
    rubrique?: string;
  }>;
}

interface RomanChapter {
  id: string;
  title: string;
  content: string;
  type: 'intro' | 'rang-a' | 'rang-b' | 'conclusion';
  competences: Array<{
    objectif_id: string;
    intitule: string;
    description?: string;
    rubrique?: string;
  }>;
}

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

// Scénarios narratifs
const scenarios = [
  { lieu: 'aux urgences', action: 'un patient arrive en détresse' },
  { lieu: 'en consultation', action: 'un diagnostic complexe se présente' },
  { lieu: 'au bloc opératoire', action: 'une intervention délicate commence' },
  { lieu: 'en réunion de service', action: 'un cas difficile est discuté' }
];

function generateBdPanels(
  itemCode: string,
  title: string,
  competencesA: any[],
  competencesB: any[]
): BdPanel[] {
  const panels: BdPanel[] = [];

  // Panel d'introduction
  panels.push({
    id: 'intro',
    title: `${itemCode} - Introduction`,
    description: `Découvrez l'univers médical de ${title}`,
    image: getMedicalImage('intro', 0),
    type: 'intro',
    competences: []
  });

  // Panels pour rang A
  for (let i = 0; i < competencesA.length; i += 3) {
    const batch = competencesA.slice(i, i + 3);
    panels.push({
      id: `rang-a-${i}`,
      title: `Rang A - Compétences ${i + 1}-${Math.min(i + 3, competencesA.length)}`,
      description: batch.map(c => c.intitule).join(' • '),
      image: getMedicalImage('rang-a', Math.floor(i / 3)),
      type: 'rang-a',
      competences: batch.map(c => ({
        objectif_id: c.objectif_id,
        intitule: c.intitule,
        rubrique: c.rubrique
      }))
    });
  }

  // Panels pour rang B
  for (let i = 0; i < competencesB.length; i += 3) {
    const batch = competencesB.slice(i, i + 3);
    panels.push({
      id: `rang-b-${i}`,
      title: `Rang B - Compétences ${i + 1}-${Math.min(i + 3, competencesB.length)}`,
      description: batch.map(c => c.intitule).join(' • '),
      image: getMedicalImage('rang-b', Math.floor(i / 3)),
      type: 'rang-b',
      competences: batch.map(c => ({
        objectif_id: c.objectif_id,
        intitule: c.intitule,
        rubrique: c.rubrique
      }))
    });
  }

  // Panel de conclusion
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

function generateRomanChapters(
  itemCode: string,
  title: string,
  competencesA: any[],
  competencesB: any[]
): RomanChapter[] {
  const chapters: RomanChapter[] = [];

  // Chapitre d'introduction
  chapters.push({
    id: 'intro',
    title: 'Prologue : L\'Art Médical',
    content: `Dans l'univers complexe de la médecine moderne, ${title} représente un défi majeur pour tout praticien. Cette histoire vous plongera au cœur des ${competencesA.length + competencesB.length} compétences essentielles de l'${itemCode}, où chaque décision peut changer une vie.

Notre protagoniste, Dr. Sarah Martin, jeune interne passionnée, découvre l'importance cruciale de maîtriser parfaitement ces concepts médicaux. Son parcours vous guidera à travers les nuances de cette spécialité.

"La médecine, c'est avant tout comprendre l'humain dans sa complexité", se répète-t-elle en consultant le dossier du prochain patient.

Ce roman narratif couvre ${competencesA.length} compétences de Rang A (fondamentales) et ${competencesB.length} compétences de Rang B (expertes).`,
    type: 'intro',
    competences: []
  });

  // Chapitres pour rang A
  for (let i = 0; i < competencesA.length; i += 2) {
    const batch = competencesA.slice(i, i + 2);
    const scenario = scenarios[Math.floor(i / 2) % scenarios.length];

    const chapterContent = batch.map(comp => {
      const rubrique = comp.rubrique ? `[${comp.rubrique}]` : '';
      const description = comp.description?.substring(0, 350) || 'Cette compétence fondamentale est essentielle pour la prise en charge des patients.';
      return `${rubrique}

"${comp.intitule}", explique le chef de service en pointant le dossier médical.

${description}

Le Dr. Martin note scrupuleusement dans son carnet: « ${comp.objectif_id} - À maîtriser absolument. »`;
    }).join('\n\n---\n\n');

    chapters.push({
      id: `rang-a-${i}`,
      title: `Chapitre ${chapters.length} : Les Fondements`,
      content: `Ce matin-là, ${scenario.lieu}, ${scenario.action}. Dr. Martin fait face à un cas complexe nécessitant la maîtrise des compétences de Rang A.

${chapterContent}

L'apprentissage se poursuit, chaque détail compte dans cette spécialité exigeante. Les compétences de Rang A forment le socle sur lequel repose toute expertise médicale.`,
      type: 'rang-a',
      competences: batch.map(c => ({
        objectif_id: c.objectif_id,
        intitule: c.intitule,
        description: c.description,
        rubrique: c.rubrique
      }))
    });
  }

  // Chapitres pour rang B
  for (let i = 0; i < competencesB.length; i += 2) {
    const batch = competencesB.slice(i, i + 2);
    const scenario = scenarios[(Math.floor(i / 2) + 2) % scenarios.length];

    const chapterContent = batch.map(comp => {
      const rubrique = comp.rubrique ? `[${comp.rubrique}]` : '';
      const description = comp.description?.substring(0, 350) || 'L\'analyse experte révèle des nuances importantes pour la pratique clinique avancée.';
      return `${rubrique}

Face à "${comp.intitule}", elle mobilise toute son expertise acquise.

${description}

Référence clinique: ${comp.objectif_id} - Niveau expert requis.`;
    }).join('\n\n---\n\n');

    chapters.push({
      id: `rang-b-${i}`,
      title: `Chapitre ${chapters.length} : L'Expertise`,
      content: `${scenario.lieu.charAt(0).toUpperCase() + scenario.lieu.slice(1)}, l'expertise de Dr. Martin est maintenant mise à l'épreuve avec les compétences de Rang B.

${chapterContent}

Chaque décision experte façonne l'issue de ce cas délicat. Le Rang B représente le niveau d'excellence attendu des praticiens confirmés.`,
      type: 'rang-b',
      competences: batch.map(c => ({
        objectif_id: c.objectif_id,
        intitule: c.intitule,
        description: c.description,
        rubrique: c.rubrique
      }))
    });
  }

  // Chapitre de conclusion
  chapters.push({
    id: 'epilogue',
    title: 'Épilogue : La Maîtrise Accomplie',
    content: `Plusieurs mois plus tard, Dr. Martin reflète sur son parcours d'apprentissage de l'${itemCode}.

Bilan de formation:
• ${competencesA.length} compétences de Rang A maîtrisées (fondamentaux)
• ${competencesB.length} compétences de Rang B acquises (expertise)
• ${competencesA.length + competencesB.length} objectifs pédagogiques atteints au total

"De la compréhension des fondements jusqu'à l'expertise avancée, chaque étape était nécessaire", se dit-elle en observant ses collègues internes débuter leur propre apprentissage.

Le cycle de transmission des connaissances continue, perpétuant l'excellence médicale dans cette spécialité exigeante.

${title} n'a plus de secrets pour elle. Elle est prête à affronter les défis les plus complexes de sa spécialité, armée de ses ${competencesA.length + competencesB.length} compétences OIC.`,
    type: 'conclusion',
    competences: []
  });

  return chapters;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { itemCode, regenerateAll = false } = body;

    console.log('📚 Génération BD/Roman:', { itemCode, regenerateAll });

    // Si regenerateAll, traiter tous les items
    if (regenerateAll) {
      // Récupérer tous les items
      const { data: items, error: itemsError } = await supabase
        .from('edn_items_immersive')
        .select('item_code, title')
        .order('item_code');

      if (itemsError) throw itemsError;

      let processed = 0;
      let errors = 0;

      for (const item of items || []) {
        try {
          // Récupérer les compétences OIC
          const { data: competencesA } = await supabase
            .from('oic_competences')
            .select('objectif_id, intitule, description, rubrique')
            .eq('item_parent', item.item_code)
            .eq('rang', 'A')
            .not('intitule', 'is', null)
            .limit(50);

          const { data: competencesB } = await supabase
            .from('oic_competences')
            .select('objectif_id, intitule, description, rubrique')
            .eq('item_parent', item.item_code)
            .eq('rang', 'B')
            .not('intitule', 'is', null)
            .limit(50);

          // Générer le contenu
          const bdPanels = generateBdPanels(
            item.item_code,
            item.title,
            competencesA || [],
            competencesB || []
          );

          const romanChapters = generateRomanChapters(
            item.item_code,
            item.title,
            competencesA || [],
            competencesB || []
          );

          // Mettre à jour l'item
          const { error: updateError } = await supabase
            .from('edn_items_immersive')
            .update({
              bd_panels: bdPanels,
              roman_story: romanChapters
            })
            .eq('item_code', item.item_code);

          if (updateError) {
            console.error(`❌ Erreur ${item.item_code}:`, updateError);
            errors++;
          } else {
            processed++;
          }
        } catch (err) {
          console.error(`❌ Erreur traitement ${item.item_code}:`, err);
          errors++;
        }
      }

      return new Response(JSON.stringify({
        success: true,
        message: `Génération terminée: ${processed} items traités, ${errors} erreurs`,
        processed,
        errors,
        total: items?.length || 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Sinon, traiter un seul item
    if (!itemCode) {
      throw new Error('itemCode requis ou regenerateAll=true');
    }

    // Récupérer l'item
    const { data: item, error: itemError } = await supabase
      .from('edn_items_immersive')
      .select('item_code, title')
      .eq('item_code', itemCode)
      .single();

    if (itemError || !item) {
      throw new Error(`Item ${itemCode} non trouvé`);
    }

    // Récupérer les compétences OIC
    const { data: competencesA } = await supabase
      .from('oic_competences')
      .select('objectif_id, intitule, description, rubrique')
      .eq('item_parent', itemCode)
      .eq('rang', 'A')
      .not('intitule', 'is', null)
      .limit(50);

    const { data: competencesB } = await supabase
      .from('oic_competences')
      .select('objectif_id, intitule, description, rubrique')
      .eq('item_parent', itemCode)
      .eq('rang', 'B')
      .not('intitule', 'is', null)
      .limit(50);

    console.log(`📊 Compétences trouvées - A: ${competencesA?.length || 0}, B: ${competencesB?.length || 0}`);

    // Générer le contenu
    const bdPanels = generateBdPanels(
      item.item_code,
      item.title,
      competencesA || [],
      competencesB || []
    );

    const romanChapters = generateRomanChapters(
      item.item_code,
      item.title,
      competencesA || [],
      competencesB || []
    );

    // Mettre à jour l'item
    const { error: updateError } = await supabase
      .from('edn_items_immersive')
      .update({
        bd_panels: bdPanels,
        roman_story: romanChapters
      })
      .eq('item_code', itemCode);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({
      success: true,
      itemCode,
      bdPanelsCount: bdPanels.length,
      romanChaptersCount: romanChapters.length,
      competencesA: competencesA?.length || 0,
      competencesB: competencesB?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
