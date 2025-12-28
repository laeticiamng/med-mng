import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { corsHeaders } from '../_shared/cors.ts';

interface UniqueContentData {
  rangA: string[];
  rangB: string[];
  title: string;
  context: string;
  specialty: string;
  clinicalScenarios: string[];
  diagnosticMethods: string[];
  therapeuticApproaches: string[];
  complications: string[];
  prevention: string[];
}

// Données spécialisées uniques pour chaque domaine médical
const SPECIALIZED_CONTENT: Record<string, UniqueContentData> = {
  // Items 1-10: Fondamentaux
  "fondamentaux": {
    specialty: "Fondamentaux médicaux",
    context: "relation thérapeutique, éthique, raisonnement clinique",
    title: "Fondements de la pratique médicale",
    rangA: [
      "Maîtriser la communication thérapeutique",
      "Appliquer les principes éthiques fondamentaux",
      "Structurer le raisonnement diagnostique",
      "Garantir la sécurité des soins",
      "Respecter la confidentialité médicale"
    ],
    rangB: [
      "Gérer les situations éthiques complexes",
      "Coordonner les équipes pluriprofessionnelles",
      "Maîtriser la décision médicale partagée",
      "Analyser les facteurs systémiques d'erreur",
      "Développer l'amélioration continue"
    ],
    clinicalScenarios: [
      "Annonce d'un diagnostic grave",
      "Conflit éthique en équipe",
      "Gestion d'un événement indésirable"
    ],
    diagnosticMethods: [
      "Entretien médical structuré",
      "Analyse critique des données",
      "Évaluation des risques"
    ],
    therapeuticApproaches: [
      "Prise en charge holistique",
      "Coordination interprofessionnelle",
      "Suivi personnalisé"
    ],
    complications: [
      "Rupture de la relation thérapeutique",
      "Non-compliance du patient",
      "Conflits d'équipe"
    ],
    prevention: [
      "Formation continue",
      "Réflexion éthique régulière",
      "Amélioration des processus"
    ]
  },

  // Items 23-42: Gynécologie-Obstétrique
  "gyneco_obstetrique": {
    specialty: "Gynécologie-Obstétrique",
    context: "santé reproductive, grossesse, accouchement",
    title: "Santé de la femme et reproduction",
    rangA: [
      "Maîtriser le suivi de grossesse normale",
      "Diagnostiquer les pathologies gynécologiques courantes",
      "Connaître la physiologie de l'accouchement",
      "Identifier les facteurs de risque obstétricaux",
      "Appliquer les protocoles de dépistage"
    ],
    rangB: [
      "Gérer les urgences obstétricales",
      "Maîtriser la chirurgie gynécologique",
      "Prendre en charge les grossesses à haut risque",
      "Coordonner les soins périnataux",
      "Traiter l'infertilité complexe"
    ],
    clinicalScenarios: [
      "Hémorragie du post-partum",
      "Pré-éclampsie sévère",
      "Dystocie de l'épaule"
    ],
    diagnosticMethods: [
      "Échographie obstétricale",
      "Monitoring fœtal",
      "Biopsie endométriale"
    ],
    therapeuticApproaches: [
      "Accouchement physiologique",
      "Chirurgie mini-invasive",
      "Hormonothérapie"
    ],
    complications: [
      "Hémorragie obstétricale",
      "Infections puerpérales",
      "Complications chirurgicales"
    ],
    prevention: [
      "Dépistage systématique",
      "Vaccination HPV",
      "Éducation contraceptive"
    ]
  },

  // Items 47-57: Pédiatrie
  "pediatrie": {
    specialty: "Pédiatrie",
    context: "croissance, développement, pathologies pédiatriques",
    title: "Santé de l'enfant et de l'adolescent",
    rangA: [
      "Évaluer la croissance et le développement",
      "Maîtriser les vaccinations pédiatriques",
      "Diagnostiquer les pathologies infectieuses",
      "Reconnaître la maltraitance infantile",
      "Adapter la communication à l'âge"
    ],
    rangB: [
      "Gérer les urgences pédiatriques",
      "Traiter les pathologies chroniques",
      "Coordonner les soins spécialisés",
      "Accompagner les familles vulnérables",
      "Maîtriser la réanimation néonatale"
    ],
    clinicalScenarios: [
      "Convulsions fébriles",
      "Déshydratation du nourrisson",
      "Suspicion de maltraitance"
    ],
    diagnosticMethods: [
      "Examen clinique pédiatrique",
      "Courbes de croissance",
      "Tests développementaux"
    ],
    therapeuticApproaches: [
      "Posologies pédiatriques",
      "Thérapies comportementales",
      "Rééducation fonctionnelle"
    ],
    complications: [
      "Retard de croissance",
      "Troubles développementaux",
      "Complications vaccinales"
    ],
    prevention: [
      "Suivi systématique",
      "Dépistage précoce",
      "Éducation parentale"
    ]
  },

  // Items 60-80: Psychiatrie
  "psychiatrie": {
    specialty: "Psychiatrie",
    context: "santé mentale, troubles psychiques, thérapeutiques",
    title: "Santé mentale et troubles psychiatriques",
    rangA: [
      "Diagnostiquer les troubles de l'humeur",
      "Évaluer le risque suicidaire",
      "Maîtriser l'entretien psychiatrique",
      "Connaître les psychotropes essentiels",
      "Identifier les urgences psychiatriques"
    ],
    rangB: [
      "Traiter les psychoses résistantes",
      "Gérer les troubles de la personnalité",
      "Coordonner les soins en psychiatrie",
      "Maîtriser les thérapies complexes",
      "Prendre en charge les addictions sévères"
    ],
    clinicalScenarios: [
      "Crise suicidaire",
      "Episode psychotique aigu",
      "Sevrage alcoolique"
    ],
    diagnosticMethods: [
      "Échelles d'évaluation psychiatrique",
      "Entretien semi-structuré",
      "Bilan neuropsychologique"
    ],
    therapeuticApproaches: [
      "Psychothérapie cognitive",
      "Pharmacothérapie ciblée",
      "Réhabilitation psychosociale"
    ],
    complications: [
      "Passage à l'acte suicidaire",
      "Effets secondaires psychotropes",
      "Rechute psychotique"
    ],
    prevention: [
      "Dépistage précoce",
      "Éducation thérapeutique",
      "Suivi communautaire"
    ]
  },

  // Items 91-110: Neurologie
  "neurologie": {
    specialty: "Neurologie",
    context: "système nerveux, troubles neurologiques, diagnostic",
    title: "Pathologies du système nerveux",
    rangA: [
      "Maîtriser l'examen neurologique",
      "Diagnostiquer les céphalées primaires",
      "Reconnaître l'AVC aigu",
      "Évaluer les troubles de la conscience",
      "Identifier l'épilepsie"
    ],
    rangB: [
      "Traiter les maladies neurodégénératives",
      "Gérer les urgences neurologiques",
      "Maîtriser l'électrophysiologie",
      "Coordonner la neuro-réhabilitation",
      "Traiter les douleurs neuropathiques"
    ],
    clinicalScenarios: [
      "AVC ischémique aigu",
      "Status epilepticus",
      "Méningite bactérienne"
    ],
    diagnosticMethods: [
      "IRM cérébrale",
      "Électroencéphalographie",
      "Ponction lombaire"
    ],
    therapeuticApproaches: [
      "Thrombolyse IV",
      "Antiépileptiques",
      "Neurostimulation"
    ],
    complications: [
      "Transformation hémorragique",
      "Hydrocéphalie",
      "Syndrome confusionnel"
    ],
    prevention: [
      "Prévention vasculaire",
      "Observance thérapeutique",
      "Éducation neurologique"
    ]
  },

  // Items 221-239: Cardiologie
  "cardiologie": {
    specialty: "Cardiologie",
    context: "pathologies cardiovasculaires, urgences cardiaques",
    title: "Maladies cardiovasculaires",
    rangA: [
      "Diagnostiquer l'infarctus du myocarde",
      "Évaluer l'insuffisance cardiaque",
      "Interpréter l'ECG de base",
      "Mesurer la pression artérielle",
      "Identifier les souffles cardiaques"
    ],
    rangB: [
      "Réaliser l'angioplastie primaire",
      "Gérer l'insuffisance cardiaque avancée",
      "Maîtriser l'échocardiographie",
      "Traiter les troubles du rythme",
      "Coordonner la réadaptation cardiaque"
    ],
    clinicalScenarios: [
      "STEMI antérieur",
      "Œdème aigu du poumon",
      "Fibrillation atriale rapide"
    ],
    diagnosticMethods: [
      "ECG 12 dérivations",
      "Échocardiographie Doppler",
      "Cathétérisme cardiaque"
    ],
    therapeuticApproaches: [
      "Revascularisation coronaire",
      "Thérapie anti-thrombotique",
      "Stimulation cardiaque"
    ],
    complications: [
      "Choc cardiogénique",
      "Rupture myocardique",
      "Troubles conductifs"
    ],
    prevention: [
      "Prévention primaire",
      "Contrôle facteurs de risque",
      "Réadaptation cardiovasculaire"
    ]
  },

  // Items 290-320: Cancérologie
  "cancerologie": {
    specialty: "Cancérologie",
    context: "tumeurs malignes, chimiothérapie, soins palliatifs",
    title: "Oncologie et traitement des cancers",
    rangA: [
      "Diagnostiquer les cancers fréquents",
      "Stadifier les tumeurs solides",
      "Connaître les marqueurs tumoraux",
      "Évaluer l'état général oncologique",
      "Identifier les urgences oncologiques"
    ],
    rangB: [
      "Prescrire les chimiothérapies ciblées",
      "Gérer les effets secondaires sévères",
      "Coordonner les soins palliatifs",
      "Maîtriser l'immunothérapie",
      "Traiter les complications métastatiques"
    ],
    clinicalScenarios: [
      "Compression médullaire",
      "Syndrome de lyse tumorale",
      "Neutropénie fébrile"
    ],
    diagnosticMethods: [
      "Biopsie tissulaire",
      "TEP-scanner",
      "Marqueurs moléculaires"
    ],
    therapeuticApproaches: [
      "Chimiothérapie combinée",
      "Radiothérapie conformationnelle",
      "Thérapies ciblées"
    ],
    complications: [
      "Toxicité hématologique",
      "Mucite sévère",
      "Cardiomyopathie induite"
    ],
    prevention: [
      "Dépistage organisé",
      "Prévention primaire",
      "Surveillance post-thérapeutique"
    ]
  },

  // Items 331-367: Médecine d'urgence
  "urgences": {
    specialty: "Médecine d'urgence",
    context: "urgences vitales, réanimation, trauma",
    title: "Médecine d'urgence et réanimation",
    rangA: [
      "Maîtriser la réanimation cardiopulmonaire",
      "Trier selon la gravité",
      "Gérer les voies aériennes",
      "Traiter le choc circulatoire",
      "Évaluer la douleur aiguë"
    ],
    rangB: [
      "Coordonner la réanimation multidisciplinaire",
      "Gérer les polytraumatisés",
      "Maîtriser l'échographie d'urgence",
      "Traiter les intoxications graves",
      "Optimiser les transferts critiques"
    ],
    clinicalScenarios: [
      "Arrêt cardiorespiratoire",
      "Traumatisme crânien sévère",
      "Sepsis sévère"
    ],
    diagnosticMethods: [
      "Scanner corps entier",
      "Échographie FAST",
      "Gazométrie artérielle"
    ],
    therapeuticApproaches: [
      "Damage control",
      "Ventilation mécanique",
      "Support hémodynamique"
    ],
    complications: [
      "Défaillance multiviscérale",
      "Syndrome compartimental",
      "Coagulopathie traumatique"
    ],
    prevention: [
      "Prévention primaire",
      "Formation aux gestes d'urgence",
      "Amélioration des protocoles"
    ]
  }
};

// Fonction pour déterminer le domaine médical selon le numéro d'item
function getDomainForItem(itemNumber: number): string {
  if (itemNumber >= 1 && itemNumber <= 10) return "fondamentaux";
  if (itemNumber >= 23 && itemNumber <= 42) return "gyneco_obstetrique";
  if (itemNumber >= 47 && itemNumber <= 57) return "pediatrie";
  if (itemNumber >= 60 && itemNumber <= 80) return "psychiatrie";
  if (itemNumber >= 91 && itemNumber <= 110) return "neurologie";
  if (itemNumber >= 221 && itemNumber <= 239) return "cardiologie";
  if (itemNumber >= 290 && itemNumber <= 320) return "cancerologie";
  if (itemNumber >= 331 && itemNumber <= 367) return "urgences";
  
  // Autres domaines spécialisés
  if (itemNumber >= 11 && itemNumber <= 22) return "fondamentaux";
  if (itemNumber >= 43 && itemNumber <= 46) return "genetique";
  if (itemNumber >= 58 && itemNumber <= 59) return "pediatrie";
  if (itemNumber >= 81 && itemNumber <= 90) return "ophtalmologie";
  if (itemNumber >= 111 && itemNumber <= 120) return "dermatologie";
  if (itemNumber >= 121 && itemNumber <= 140) return "geriatrie";
  if (itemNumber >= 141 && itemNumber <= 180) return "infectiologie";
  if (itemNumber >= 181 && itemNumber <= 220) return "immunologie";
  if (itemNumber >= 240 && itemNumber <= 289) return "endocrinologie";
  
  return "fondamentaux"; // par défaut
}

// Générer du contenu unique pour chaque item
function generateUniqueContent(itemNumber: number, existingTitle: string) {
  const domain = getDomainForItem(itemNumber);
  const baseContent = SPECIALIZED_CONTENT[domain] || SPECIALIZED_CONTENT["fondamentaux"];
  
  // Personnaliser selon le numéro d'item
  const uniqueTitle = existingTitle || `IC-${itemNumber} - ${baseContent.title}`;
  
  const uniqueRangA = baseContent.rangA.map((competence, index) => 
    `Item ${itemNumber}: ${competence.replace('Maîtriser', `Maîtriser spécifiquement pour l'IC-${itemNumber}`)}`
  );
  
  const uniqueRangB = baseContent.rangB.map((competence, index) => 
    `IC-${itemNumber} avancé: ${competence.replace('Gérer', `Gérer de manière experte pour l'item ${itemNumber}`)}`
  );
  
  // Scénarios cliniques uniques
  const uniqueScenarios = baseContent.clinicalScenarios.map(scenario => 
    `Cas clinique IC-${itemNumber}: ${scenario} - Approche spécifique item ${itemNumber}`
  );
  
  // Paroles musicales uniques
  const uniqueLyrics = [
    `[Item ${itemNumber} - ${baseContent.specialty}]
    Voici l'item ${itemNumber}, ${baseContent.context}
    ${uniqueRangA[0]}, c'est la base
    ${uniqueRangA[1]}, c'est la phrase
    Item ${itemNumber}, spécialisé en ${baseContent.specialty}`,
    
    `[Rang B - Item ${itemNumber}]
    Maintenant plus complexe, l'item ${itemNumber}
    ${uniqueRangB[0]}, expertise
    ${uniqueRangB[1]}, maîtrise
    IC-${itemNumber}, ${baseContent.specialty} avancée`
  ];
  
  // Quiz unique
  const uniqueQuiz = [
    {
      id: 1,
      question: `Quelle est la spécificité principale de l'item IC-${itemNumber} en ${baseContent.specialty} ?`,
      options: [
        uniqueRangA[0],
        `Approche générale standard`,
        `Protocole non spécialisé`,
        `Méthode universelle`
      ],
      correct: 0,
      explanation: `L'item IC-${itemNumber} se caractérise par: ${uniqueRangA[0]}`
    },
    {
      id: 2,
      question: `En expertise avancée (Rang B), que distingue l'item IC-${itemNumber} ?`,
      options: [
        `Gestion basique seulement`,
        uniqueRangB[0],
        `Application théorique simple`,
        `Protocole standard`
      ],
      correct: 1,
      explanation: `Au niveau expert, l'IC-${itemNumber} exige: ${uniqueRangB[0]}`
    },
    {
      id: 3,
      question: `Quel scénario clinique est typique de l'item IC-${itemNumber} ?`,
      options: [
        uniqueScenarios[0],
        `Situation clinique générale`,
        `Cas théorique standard`,
        `Exemple non spécialisé`
      ],
      correct: 0,
      explanation: `L'item IC-${itemNumber} se manifeste typiquement par: ${uniqueScenarios[0]}`
    }
  ];
  
  return {
    uniqueTitle,
    uniqueRangA,
    uniqueRangB,
    uniqueScenarios,
    uniqueLyrics,
    uniqueQuiz,
    specialty: baseContent.specialty,
    context: `${baseContent.context}, item ${itemNumber}`
  };
}

// Fonction pour nettoyer le texte pour les paroles
function cleanTextForLyrics(text: string, maxLength: number = 60): string {
  let clean = text
    .replace(/[.,!?;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (clean.length > maxLength) {
    const words = clean.split(' ');
    clean = '';
    for (const word of words) {
      if ((clean + ' ' + word).length <= maxLength) {
        clean = clean ? clean + ' ' + word : word;
      } else {
        break;
      }
    }
  }
  
  return clean;
}

// Fonction pour extraire les points clés
function extractKeyPoints(description: string): string[] {
  const points: string[] = [];
  const cleanDesc = description.replace(/\s+/g, ' ').trim();
  const sentences = cleanDesc.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  const maxPoints = Math.min(2, sentences.length);
  for (let i = 0; i < maxPoints; i++) {
    const verse = cleanTextForLyrics(sentences[i].trim(), 55);
    if (verse.length > 10) points.push(verse);
  }
  
  return points;
}

// Génère les paroles DEPUIS les compétences OIC réelles
function generateLyricsFromOicCompetences(
  itemCode: string, 
  title: string,
  competences: Array<{ objectif_id: string; intitule: string; description: string | null; rang: string }>,
  rang: 'A' | 'B'
): string[] {
  const verses: string[] = [];
  const rangText = rang === 'A' ? 'fondamental' : 'expert';
  const filtered = competences.filter(c => c.rang === rang);
  
  if (filtered.length === 0) {
    return [
      `[Intro]`,
      `${itemCode} ${title.substring(0, 40)}`,
      `Niveau ${rangText} à maîtriser`,
      ``,
      `[Couplet]`,
      `Compétences essentielles`,
      `Savoir médical approfondi`,
      ``,
      `[Outro]`,
      `${itemCode} ${rangText} validé`
    ];
  }
  
  // Intro avec le titre de l'item
  verses.push(`[Intro]`);
  verses.push(`${itemCode} ${cleanTextForLyrics(title, 40)}`);
  verses.push(`Niveau ${rangText} à maîtriser`);
  verses.push(``);
  
  // Traiter chaque compétence
  filtered.forEach((comp, index) => {
    const intitule = comp.intitule || `Objectif ${comp.objectif_id}`;
    const description = comp.description || '';
    
    verses.push(`[Couplet ${index + 1}]`);
    verses.push(cleanTextForLyrics(intitule, 55));
    
    if (description && description.length > 20) {
      const keyPoints = extractKeyPoints(description);
      keyPoints.forEach(point => verses.push(point));
    }
    
    // Refrain tous les 2 couplets
    if (index < filtered.length - 1 && index % 2 === 1) {
      verses.push(``);
      verses.push(`[Refrain]`);
      verses.push(`${itemCode} bien compris`);
      verses.push(`Compétences acquises`);
      verses.push(``);
    }
  });
  
  // Outro
  verses.push(``);
  verses.push(`[Outro]`);
  verses.push(`${itemCode} ${cleanTextForLyrics(title, 30)}`);
  verses.push(`Compétences ${rangText}es validées`);
  verses.push(`Formation réussie avec succès`);
  
  return verses;
}

// Génère les paroles mixtes A+B
function generateMixedLyrics(
  itemCode: string,
  title: string,
  competences: Array<{ objectif_id: string; intitule: string; description: string | null; rang: string }>
): string[] {
  const verses: string[] = [];
  const compA = competences.filter(c => c.rang === 'A');
  const compB = competences.filter(c => c.rang === 'B');
  
  verses.push(`[Intro]`);
  verses.push(`${itemCode} ${cleanTextForLyrics(title, 35)}`);
  verses.push(`Rang A et B complets`);
  verses.push(``);
  
  // Partie A
  verses.push(`[Partie Rang A - Fondamentaux]`);
  compA.slice(0, 3).forEach(comp => {
    verses.push(cleanTextForLyrics(comp.intitule, 50));
  });
  verses.push(``);
  
  // Partie B
  verses.push(`[Partie Rang B - Expert]`);
  compB.slice(0, 3).forEach(comp => {
    verses.push(cleanTextForLyrics(comp.intitule, 50));
  });
  verses.push(``);
  
  // Outro
  verses.push(`[Outro]`);
  verses.push(`${itemCode} maîtrise totale`);
  verses.push(`Rang A et B validés`);
  verses.push(`Excellence médicale certifiée`);
  
  return verses;
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

    console.log('🚀 Génération paroles depuis compétences OIC réelles...');

    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    // Obtenir tous les items existants
    const { data: existingItems, error: fetchError } = await supabase
      .from('edn_items_immersive')
      .select('id, item_code, title')
      .order('item_code');

    if (fetchError) {
      throw new Error(`Erreur récupération items: ${fetchError.message}`);
    }

    console.log(`📋 ${existingItems?.length || 0} items à traiter`);

    // Récupérer TOUTES les compétences OIC en une seule requête
    const { data: allCompetences, error: compError } = await supabase
      .from('oic_competences')
      .select('objectif_id, intitule, description, rang, item_parent')
      .order('objectif_id');

    if (compError) {
      throw new Error(`Erreur récupération compétences: ${compError.message}`);
    }

    console.log(`📋 ${allCompetences?.length || 0} compétences OIC chargées`);

    // Indexer les compétences par item_parent
    const competencesByItem: Record<string, typeof allCompetences> = {};
    (allCompetences || []).forEach(comp => {
      const key = comp.item_parent;
      if (!competencesByItem[key]) competencesByItem[key] = [];
      competencesByItem[key].push(comp);
    });

    // Traiter chaque item
    for (const item of existingItems || []) {
      try {
        processedCount++;
        const itemNumber = item.item_code.replace('IC-', '').padStart(3, '0');
        const itemCompetences = competencesByItem[itemNumber] || [];
        
        console.log(`🔄 ${item.item_code}: ${itemCompetences.length} compétences OIC`);
        
        // Générer les paroles depuis les compétences OIC RÉELLES
        const parolesRangA = generateLyricsFromOicCompetences(item.item_code, item.title, itemCompetences, 'A');
        const parolesRangB = generateLyricsFromOicCompetences(item.item_code, item.title, itemCompetences, 'B');
        const parolesRangAB = generateMixedLyrics(item.item_code, item.title, itemCompetences);
        
        // Générer aussi le contenu structuré pour tableau_rang_a/b
        const compA = itemCompetences.filter(c => c.rang === 'A');
        const compB = itemCompetences.filter(c => c.rang === 'B');
        
        const tableauRangA = {
          title: `${item.title} - Rang A`,
          sections: compA.map((comp, idx) => ({
            title: `Objectif ${comp.objectif_id}`,
            content: comp.intitule,
            description: comp.description,
            index: idx + 1
          }))
        };
        
        const tableauRangB = {
          title: `${item.title} - Rang B`,
          sections: compB.map((comp, idx) => ({
            title: `Objectif ${comp.objectif_id}`,
            content: comp.intitule,
            description: comp.description,
            index: idx + 1
          }))
        };
        
        // Quiz basé sur les compétences réelles
        const quizQuestions = itemCompetences.slice(0, 5).map((comp, idx) => ({
          id: idx + 1,
          question: `Que signifie "${cleanTextForLyrics(comp.intitule, 40)}" pour l'item ${item.item_code} ?`,
          options: [
            comp.description?.substring(0, 60) || 'Maîtrise de cette compétence',
            'Application théorique simple',
            'Protocole non spécialisé',
            'Méthode universelle'
          ],
          correct: 0,
          rang: comp.rang,
          objectif_id: comp.objectif_id,
          explanation: `Compétence ${comp.rang}: ${comp.intitule}`
        }));

        // Mettre à jour l'item
        const { error: updateError } = await supabase
          .from('edn_items_immersive')
          .update({
            tableau_rang_a: tableauRangA,
            tableau_rang_b: tableauRangB,
            paroles_musicales: parolesRangA,
            paroles_rang_a: parolesRangA,
            paroles_rang_b: parolesRangB,
            paroles_rang_ab: parolesRangAB,
            quiz_questions: quizQuestions.length > 0 ? quizQuestions : null,
            oic_count_a: compA.length,
            oic_count_b: compB.length,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);

        if (updateError) {
          throw new Error(`Erreur mise à jour ${item.item_code}: ${updateError.message}`);
        }

        successCount++;
        console.log(`✅ ${item.item_code}: paroles A(${parolesRangA.length} lignes), B(${parolesRangB.length}), AB(${parolesRangAB.length})`);

      } catch (error) {
        errorCount++;
        errors.push({
          item_code: item.item_code,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
        console.error(`❌ ${item.item_code}:`, error);
      }
    }

    console.log(`🎉 Terminé: ${successCount}/${processedCount} items avec paroles OIC`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Génération paroles depuis OIC terminée',
      stats: {
        processed: processedCount,
        success: successCount,
        errors: errorCount,
        totalOicCompetences: allCompetences?.length || 0
      },
      errors: errors.slice(0, 10)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});