import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompetenceData {
  rangA: string[];
  rangB: string[];
  title: string;
  context: string;
}

const ITEM_SPECIFIC_DATA: Record<number, CompetenceData> = {
  1: {
    title: "La relation médecin-malade dans le cadre du colloque singulier ou au sein d'une équipe, le cas échéant pluriprofessionnelle. La communication avec le patient et son entourage. L'annonce d'une maladie grave ou létale ou d'un dommage associé aux soins. La formation du patient. La personnalisation de la prise en charge médicale.",
    context: "relation thérapeutique, communication médicale, annonce diagnostique",
    rangA: [
      "Établir une relation de confiance avec le patient",
      "Maîtriser les techniques de communication verbale et non verbale",
      "Comprendre les enjeux du colloque singulier",
      "Connaître les principes de l'écoute active",
      "Respecter la confidentialité et le secret médical"
    ],
    rangB: [
      "Gérer les situations de communication difficile",
      "Adapter la communication selon les patients (âge, culture, handicap)",
      "Maîtriser l'annonce d'un diagnostic grave",
      "Coordonner la communication en équipe pluriprofessionnelle",
      "Accompagner la formation thérapeutique du patient"
    ]
  },
  2: {
    title: "Les valeurs professionnelles du médecin et des autres professions de santé",
    context: "éthique médicale, déontologie, valeurs professionnelles",
    rangA: [
      "Connaître les principes fondamentaux de l'éthique médicale",
      "Maîtriser les règles déontologiques de base",
      "Comprendre la notion de responsabilité professionnelle",
      "Respecter l'autonomie du patient",
      "Appliquer le principe de bienfaisance"
    ],
    rangB: [
      "Gérer les conflits éthiques complexes",
      "Articuler éthique individuelle et collective",
      "Maîtriser les aspects légaux de la pratique médicale",
      "Collaborer dans le respect des valeurs interprofessionnelles",
      "Développer une réflexion éthique personnelle"
    ]
  },
  3: {
    title: "Le raisonnement et la décision en médecine. La médecine fondée sur les preuves (Evidence Based Medicine, EBM). La décision médicale partagée. La controverse.",
    context: "raisonnement clinique, evidence-based medicine, décision partagée",
    rangA: [
      "Maîtriser la démarche hypothético-déductive",
      "Comprendre les principes de l'EBM",
      "Évaluer la qualité des preuves scientifiques",
      "Structurer un raisonnement clinique",
      "Identifier les biais cognitifs"
    ],
    rangB: [
      "Intégrer données probantes et contexte clinique",
      "Gérer l'incertitude diagnostique",
      "Maîtriser la décision médicale partagée",
      "Analyser les controverses scientifiques",
      "Adapter le raisonnement aux situations complexes"
    ]
  },
  4: {
    title: "Qualité et sécurité des soins. La sécurité du patient. La gestion des risques. Les événements indésirables associés aux soins (EIAS). Démarche qualité et évaluation des pratiques professionnelles",
    context: "sécurité patient, gestion des risques, qualité des soins",
    rangA: [
      "Connaître les principes de la sécurité du patient",
      "Identifier les facteurs de risque iatrogène",
      "Maîtriser la déclaration des événements indésirables",
      "Comprendre les outils de gestion des risques",
      "Appliquer les règles d'hygiène et de prévention"
    ],
    rangB: [
      "Analyser les causes systémiques des erreurs",
      "Mettre en place une démarche d'amélioration continue",
      "Gérer les conséquences d'un événement indésirable",
      "Développer une culture sécurité en équipe",
      "Évaluer et améliorer ses pratiques professionnelles"
    ]
  },
  5: {
    title: "La gestion des erreurs et des plaintes ; l'aléa thérapeutique",
    context: "gestion d'erreur, plaintes, aléa thérapeutique",
    rangA: [
      "Distinguer erreur, faute et aléa thérapeutique",
      "Connaître les procédures de gestion des plaintes",
      "Maîtriser les aspects réglementaires de base",
      "Comprendre les enjeux de la responsabilité médicale",
      "Identifier les situations à risque"
    ],
    rangB: [
      "Gérer une situation de plainte ou de contentieux",
      "Analyser les facteurs contributifs d'une erreur",
      "Communiquer efficacement lors d'un incident",
      "Mettre en place des mesures préventives",
      "Accompagner les patients victimes d'aléa"
    ]
  },
  6: {
    title: "L'organisation de l'exercice clinique et les méthodes qui permettent de sécuriser le parcours du patient",
    context: "organisation des soins, parcours patient, coordination",
    rangA: [
      "Connaître l'organisation du système de santé",
      "Maîtriser les outils de coordination des soins",
      "Comprendre les enjeux du parcours patient",
      "Identifier les acteurs de la prise en charge",
      "Utiliser les outils de transmission d'information"
    ],
    rangB: [
      "Optimiser l'organisation de l'exercice clinique",
      "Coordonner efficacement les soins complexes",
      "Gérer les transitions de soins",
      "Améliorer la continuité des soins",
      "Développer des réseaux de soins"
    ]
  },
  7: {
    title: "Les droits individuels et collectifs du patient",
    context: "droits du patient, autonomie, consentement",
    rangA: [
      "Connaître les droits fondamentaux du patient",
      "Maîtriser les règles du consentement éclairé",
      "Respecter l'autonomie du patient",
      "Comprendre les enjeux de l'information médicale",
      "Appliquer les règles de confidentialité"
    ],
    rangB: [
      "Gérer les conflits entre droits individuels et collectifs",
      "Adapter l'information selon les situations",
      "Respecter les choix du patient en situation complexe",
      "Gérer les situations de refus de soins",
      "Accompagner les décisions de fin de vie"
    ]
  },
  8: {
    title: "Les discriminations",
    context: "non-discrimination, égalité des soins, diversité",
    rangA: [
      "Identifier les différentes formes de discrimination",
      "Connaître le cadre légal anti-discriminatoire",
      "Comprendre les biais discriminatoires",
      "Respecter l'égalité d'accès aux soins",
      "Reconnaître ses propres préjugés"
    ],
    rangB: [
      "Lutter activement contre les discriminations",
      "Adapter les soins aux populations vulnérables",
      "Gérer les situations de discrimination",
      "Promouvoir l'inclusion en santé",
      "Former et sensibiliser les équipes"
    ]
  },
  9: {
    title: "Introduction à l'éthique médicale",
    context: "éthique médicale, principes éthiques, déontologie",
    rangA: [
      "Connaître les grands principes éthiques",
      "Maîtriser les bases de la déontologie médicale",
      "Comprendre la notion de responsabilité morale",
      "Identifier les dilemmes éthiques courants",
      "Respecter la dignité humaine"
    ],
    rangB: [
      "Résoudre les conflits éthiques complexes",
      "Articuler éthique et droit médical",
      "Développer une réflexion éthique personnelle",
      "Participer aux instances éthiques",
      "Transmettre les valeurs éthiques"
    ]
  },
  10: {
    title: "Approches transversales du corps",
    context: "corps humain, approche holistique, interdisciplinarité",
    rangA: [
      "Comprendre les dimensions multiples du corps",
      "Maîtriser l'approche bio-psycho-sociale",
      "Connaître les représentations culturelles du corps",
      "Identifier les facteurs psychosomatiques",
      "Respecter l'intégrité corporelle"
    ],
    rangB: [
      "Intégrer les approches multidisciplinaires",
      "Gérer les troubles psychosomatiques complexes",
      "Adapter l'approche selon les cultures",
      "Développer une vision holistique du patient",
      "Coordonner les soins transversaux"
    ]
  }
};

// Générer des données pour tous les 367 items
function generateAllItemsData(): Record<number, CompetenceData> {
  const allData: Record<number, CompetenceData> = { ...ITEM_SPECIFIC_DATA };
  
  // Mapping des catégories d'items
  const categories: Record<string, { start: number; end: number; context: string; domain: string }> = {
    "grossesse": { start: 23, end: 42, context: "grossesse, obstétrique, périnatalité", domain: "Gynécologie-Obstétrique" },
    "genetique": { start: 45, end: 46, context: "génétique, hérédité, conseil génétique", domain: "Génétique Médicale" },
    "pediatrie": { start: 47, end: 57, context: "pédiatrie, développement enfant, croissance", domain: "Pédiatrie" },
    "psychiatrie": { start: 60, end: 80, context: "psychiatrie, santé mentale, troubles psychiques", domain: "Psychiatrie" },
    "ophtalmologie": { start: 81, end: 86, context: "ophtalmologie, vision, pathologies oculaires", domain: "Ophtalmologie" },
    "orl": { start: 87, end: 90, context: "ORL, audition, phonation, équilibre", domain: "ORL" },
    "neurologie": { start: 91, end: 110, context: "neurologie, système nerveux, troubles neurologiques", domain: "Neurologie" },
    "dermatologie": { start: 111, end: 117, context: "dermatologie, pathologies cutanées, dermatoses", domain: "Dermatologie" },
    "geriatrie": { start: 123, end: 133, context: "gériatrie, vieillissement, personne âgée", domain: "Gériatrie" },
    "douleur": { start: 134, end: 144, context: "douleur, analgésie, soins palliatifs", domain: "Médecine de la Douleur" },
    "infectiologie": { start: 145, end: 180, context: "infectiologie, maladies infectieuses, antibiothérapie", domain: "Infectiologie" },
    "immunologie": { start: 185, end: 202, context: "immunologie, allergies, auto-immunité", domain: "Immunologie" },
    "pneumologie": { start: 203, end: 211, context: "pneumologie, pathologies respiratoires, thorax", domain: "Pneumologie" },
    "hematologie": { start: 212, end: 220, context: "hématologie, pathologies sanguines, hémostase", domain: "Hématologie" },
    "cardiologie": { start: 221, end: 239, context: "cardiologie, pathologies cardiovasculaires, circulation", domain: "Cardiologie" },
    "endocrinologie": { start: 240, end: 256, context: "endocrinologie, métabolisme, hormones, diabète", domain: "Endocrinologie" },
    "nephrologie": { start: 257, end: 268, context: "néphrologie, pathologies rénales, équilibre hydrique", domain: "Néphrologie" },
    "gastroenterologie": { start: 269, end: 289, context: "gastro-entérologie, pathologies digestives, hépatologie", domain: "Gastro-entérologie" },
    "cancerologie": { start: 290, end: 320, context: "cancérologie, oncologie, tumeurs malignes", domain: "Cancérologie" },
    "pharmacologie": { start: 321, end: 330, context: "pharmacologie, thérapeutique, médicaments", domain: "Pharmacologie" },
    "urgences": { start: 331, end: 367, context: "urgences, médecine d'urgence, réanimation", domain: "Médecine d'Urgence" }
  };
  
  for (let i = 11; i <= 367; i++) {
    let category = "generale";
    let context = "médecine générale, soins de base";
    let domain = "Médecine Générale";
    
    for (const [catName, catData] of Object.entries(categories)) {
      if (i >= catData.start && i <= catData.end) {
        category = catName;
        context = catData.context;
        domain = catData.domain;
        break;
      }
    }
    
    allData[i] = {
      title: `Item ${i} - Compétences spécialisées en ${domain}`,
      context: context,
      rangA: [
        `Connaître les bases fondamentales de l'item ${i}`,
        `Maîtriser les concepts essentiels en ${domain}`,
        `Identifier les signes cliniques principaux`,
        `Comprendre la physiopathologie de base`,
        `Appliquer les principes diagnostiques élémentaires`
      ],
      rangB: [
        `Gérer les situations complexes de l'item ${i}`,
        `Maîtriser les aspects avancés en ${domain}`,
        `Coordonner les soins spécialisés`,
        `Adapter la prise en charge aux cas difficiles`,
        `Développer une expertise clinique approfondie`
      ]
    };
  }
  
  return allData;
}

function generateSpecificLyrics(itemNumber: number, itemData: CompetenceData): string[] {
  const rangALyrics = `
[Couplet 1 - Rang A]
Pour l'item ${itemNumber}, écoutez bien cette leçon
${itemData.rangA[0]}, c'est la première notion
${itemData.rangA[1]}, gardez ça en mémoire
${itemData.context} nous aide à mieux comprendre l'histoire

[Refrain]
Item ${itemNumber}, on va tout retenir
Ces compétences-là vont nous servir
Du rang A jusqu'au rang B
Notre savoir va progresser

[Couplet 2 - Suite Rang A]
${itemData.rangA[2]}, c'est essentiel
${itemData.rangA[3]}, rendez-vous à l'appel
Avec ces bases solides en main
L'examen n'aura plus rien d'incertain
`;

  const rangBLyrics = `
[Couplet 1 - Rang B]
Maintenant que vous maîtrisez les bases
Passons aux compétences plus audaces
${itemData.rangB[0]}, voilà le défi
${itemData.rangB[1]}, c'est parti !

[Refrain]
Item ${itemNumber}, niveau supérieur
Ces savoirs avancés nous rendent meilleurs
Du rang A jusqu'au rang B
Notre expertise va briller

[Couplet 2 - Maîtrise Rang B]
${itemData.rangB[2]}, l'excellence en vue
${itemData.rangB[3]}, la compétence continue
Avec l'item ${itemNumber} bien maîtrisé
Vous êtes prêts pour l'EDN réussi
`;

  return [rangALyrics.trim(), rangBLyrics.trim()];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Authorization header manquant' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🚀 Début de la ré-importation complète EDN...');

    const allItemsData = generateAllItemsData();
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    // Obtenir tous les items existants
    const { data: existingItems, error: fetchError } = await supabase
      .from('edn_items_immersive')
      .select('id, item_code')
      .order('item_code');

    if (fetchError) {
      throw new Error(`Erreur lors de la récupération des items: ${fetchError.message}`);
    }

    console.log(`📋 ${existingItems?.length || 0} items trouvés à mettre à jour`);

    // Traiter chaque item existant
    for (const existingItem of existingItems || []) {
      try {
        processedCount++;
        const itemNumber = parseInt(existingItem.item_code.replace('IC-', '')) || 0;
        const itemData = allItemsData[itemNumber];

        if (!itemData) {
          console.warn(`⚠️ Pas de données pour l'item ${itemNumber}`);
          continue;
        }

        // Créer le contenu structuré Rang A
        const tableauRangA = {
          title: `IC-${itemNumber} Rang A - ${itemData.title}`,
          sections: itemData.rangA.map((competence, index) => ({
            title: `Compétence Rang A ${index + 1}`,
            content: competence,
            keywords: competence.toLowerCase().split(' ').filter(word => word.length > 3)
          }))
        };

        // Créer le contenu structuré Rang B
        const tableauRangB = {
          title: `IC-${itemNumber} Rang B - Compétences approfondies`,
          sections: itemData.rangB.map((competence, index) => ({
            title: `Compétence Rang B ${index + 1}`,
            content: competence,
            keywords: competence.toLowerCase().split(' ').filter(word => word.length > 3)
          }))
        };

        // Générer les paroles musicales spécifiques
        const parolesMusicales = generateSpecificLyrics(itemNumber, itemData);

        // Créer une scène immersive personnalisée
        const sceneImmersive = {
          theme: 'medical',
          ambiance: 'clinical',
          context: itemData.context,
          interactions: [
            {
              type: 'dialogue',
              content: `Explorez les compétences de l'item ${itemNumber} : ${itemData.context}`,
              responses: [
                'Découvrir les compétences Rang A',
                'Explorer les compétences Rang B',
                'Commencer le quiz interactif'
              ]
            },
            {
              type: 'scenario',
              content: `Cas clinique basé sur ${itemData.context}`,
              responses: [
                'Analyser la situation',
                'Proposer une prise en charge',
                'Évaluer les résultats'
              ]
            }
          ]
        };

        // Créer des questions de quiz personnalisées
        const quizQuestions = [
          {
            id: 1,
            question: `Quelle est la compétence fondamentale principale de l'item ${itemNumber} ?`,
            options: [
              itemData.rangA[0],
              `Compétence générique item ${itemNumber}`,
              `Notion de base standard`,
              `Principe théorique classique`
            ],
            correct: 0,
            explanation: `La compétence principale de l'item ${itemNumber} est : ${itemData.rangA[0]}`
          },
          {
            id: 2,
            question: `En niveau avancé (Rang B), que devez-vous maîtriser pour l'item ${itemNumber} ?`,
            options: [
              `Gestion basique uniquement`,
              itemData.rangB[0],
              `Application théorique simple`,
              `Mémorisation des cours`
            ],
            correct: 1,
            explanation: `Au niveau Rang B, vous devez : ${itemData.rangB[0]}`
          }
        ];

        // Mettre à jour l'item dans la base de données
        const { error: updateError } = await supabase
          .from('edn_items_immersive')
          .update({
            tableau_rang_a: tableauRangA,
            tableau_rang_b: tableauRangB,
            paroles_musicales: parolesMusicales,
            scene_immersive: sceneImmersive,
            quiz_questions: quizQuestions,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id);

        if (updateError) {
          throw new Error(`Erreur mise à jour item ${itemNumber}: ${updateError.message}`);
        }

        successCount++;
        console.log(`✅ Item IC-${itemNumber} mis à jour avec succès`);

      } catch (error) {
        errorCount++;
        errors.push({
          item_code: existingItem.item_code,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
        console.error(`❌ Erreur item ${existingItem.item_code}:`, error);
      }
    }

    console.log(`🎉 Ré-importation terminée: ${successCount}/${processedCount} items mis à jour`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Ré-importation complète terminée avec succès',
      stats: {
        processed: processedCount,
        success: successCount,
        errors: errorCount
      },
      errors: errors.slice(0, 10) // Limiter les erreurs affichées
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue lors de la ré-importation'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});