import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  Deno.env.get("ALLOWED_ORIGIN") || "https://med-mng.com",
  "https://staging.med-mng.com",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  itemCode?: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { examType, questionCount, topics, difficulty, userId } = await req.json();

    console.log("Generating exam:", { examType, questionCount, topics, difficulty });

    // Fetch items from database to base questions on
    const { data: items } = await supabase
      .from('edn_items')
      .select('code, intitule, rang, categorie')
      .limit(100);

    // Generate questions based on real items
    const questions: Question[] = [];
    const questionBank = getQuestionBank(items || []);
    
    const filteredQuestions = questionBank.filter(q => {
      if (topics && topics.length > 0 && !topics.includes(q.topic)) return false;
      if (difficulty && q.difficulty !== difficulty) return false;
      return true;
    });

    // Deterministic shuffle based on timestamp
    const seed = Date.now();
    const shuffled = filteredQuestions.sort((a, b) => {
      const hashA = (a.id || '').charCodeAt(0) + seed;
      const hashB = (b.id || '').charCodeAt(0) + seed;
      return hashA - hashB;
    });
    const selected = shuffled.slice(0, Math.min(questionCount || 20, shuffled.length));

    // If not enough questions, generate more
    if (selected.length < (questionCount || 20)) {
      const additionalNeeded = (questionCount || 20) - selected.length;
      for (let i = 0; i < additionalNeeded; i++) {
        selected.push(generateRandomQuestion(i, topics?.[0] || 'Médecine générale'));
      }
    }

    // Store exam in database
    const { data: exam, error: examError } = await supabase
      .from('ai_exam_history')
      .insert({
        user_id: userId,
        exam_type: examType || 'practice',
        questions: selected,
        total_questions: selected.length,
        ai_generated: true,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (examError) {
      console.error("Error storing exam:", examError);
    }

    return new Response(
      JSON.stringify({
        examId: exam?.id,
        questions: selected,
        totalQuestions: selected.length,
        timeLimit: examType === 'timed' ? selected.length * 90 : null // 90 seconds per question
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating exam:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate exam" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getQuestionBank(items: any[]): Question[] {
  const baseQuestions: Question[] = [
    {
      id: 'q1',
      question: "Quel est le traitement de première intention de l'insuffisance cardiaque à fraction d'éjection réduite ?",
      options: ["Diurétiques seuls", "IEC + Bêtabloquants", "Digitaliques", "Anti-arythmiques"],
      correctAnswer: 1,
      explanation: "Les IEC et bêtabloquants sont les piliers du traitement de l'IC à FE réduite, réduisant morbi-mortalité.",
      difficulty: 'medium',
      topic: 'Cardiologie',
      itemCode: '232'
    },
    {
      id: 'q2',
      question: "Quelle est la triade de Virchow ?",
      options: [
        "Stase, hypercoagulabilité, lésion endothéliale",
        "Fièvre, tachycardie, hypotension",
        "Douleur, rougeur, chaleur",
        "Dyspnée, douleur thoracique, toux"
      ],
      correctAnswer: 0,
      explanation: "La triade de Virchow décrit les 3 facteurs favorisant la thrombose veineuse.",
      difficulty: 'easy',
      topic: 'Cardiologie',
      itemCode: '226'
    },
    {
      id: 'q3',
      question: "Quel examen est indispensable devant une suspicion de BPCO ?",
      options: ["Radiographie thoracique", "Scanner thoracique", "Spirométrie", "Gazométrie artérielle"],
      correctAnswer: 2,
      explanation: "La spirométrie avec test de réversibilité est indispensable pour confirmer le diagnostic de BPCO.",
      difficulty: 'easy',
      topic: 'Pneumologie',
      itemCode: '205'
    },
    {
      id: 'q4',
      question: "Quel est le score utilisé pour évaluer la sévérité d'un AVC ischémique ?",
      options: ["Score de Glasgow", "Score NIHSS", "Score APACHE II", "Score de Rankin"],
      correctAnswer: 1,
      explanation: "Le NIHSS (National Institutes of Health Stroke Scale) évalue la sévérité neurologique initiale.",
      difficulty: 'medium',
      topic: 'Neurologie',
      itemCode: '340'
    },
    {
      id: 'q5',
      question: "Quelle est l'indication principale d'une thrombolyse dans l'AVC ischémique ?",
      options: [
        "AVC de plus de 6 heures",
        "AVC de moins de 4h30 sans contre-indication",
        "Tout AVC hémorragique",
        "AVC avec score NIHSS < 4"
      ],
      correctAnswer: 1,
      explanation: "La thrombolyse IV par altéplase est indiquée dans les 4h30 suivant l'AVC ischémique.",
      difficulty: 'hard',
      topic: 'Neurologie',
      itemCode: '340'
    }
  ];

  // Add questions based on actual items
  items.slice(0, 10).forEach((item, i) => {
    baseQuestions.push({
      id: `item-${item.code}`,
      question: `Concernant l'item ${item.code} "${item.intitule}", quelle affirmation est vraie ?`,
      options: [
        `C'est un item de rang ${item.rang}`,
        "C'est un item obligatoire pour tous les étudiants",
        "Il nécessite une maîtrise parfaite des prérequis",
        "Toutes les réponses sont correctes"
      ],
      correctAnswer: 0,
      explanation: `L'item ${item.code} est classé rang ${item.rang} dans la catégorie ${item.categorie || 'Non spécifiée'}.`,
      difficulty: 'easy',
      topic: item.categorie || 'Médecine générale',
      itemCode: item.code
    });
  });

  return baseQuestions;
}

function generateRandomQuestion(index: number, topic: string): Question {
  // Deterministic correct answer based on index
  const correctAnswer = index % 4;
  return {
    id: `gen-${index}-${Date.now()}`,
    question: `Question ${index + 1} sur ${topic} - Quelle est la bonne réponse ?`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: correctAnswer,
    explanation: "Explication détaillée de la réponse correcte.",
    difficulty: 'medium',
    topic
  };
}
