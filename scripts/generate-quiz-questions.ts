/**
 * Automatic Quiz Generator Script
 *
 * Addresses audit finding: EDN 86% missing quiz content (317 items without quizzes)
 * Impact: Generate 3,170 questions (10 questions × 317 items)
 *
 * This script helps generate quiz questions for EDN items using:
 * 1. Template-based generation
 * 2. AI-assisted generation (OpenAI API)
 * 3. Manual review workflow
 *
 * Usage:
 *   npm run generate-quiz -- --item IC-1 --mode template
 *   npm run generate-quiz -- --item IC-1 --mode ai
 *   npm run generate-quiz -- --all --mode template
 *
 * Requirements:
 *   - OpenAI API key (for AI mode)
 *   - EDN items data in database
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

// Types
interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

interface EdnItem {
  code_item: string;
  title: string;
  description: string;
  speciality: string;
  oic_rang_a?: any[];
  oic_rang_b?: any[];
}

/**
 * Fetch EDN item from database
 */
async function fetchEdnItem(itemCode: string): Promise<EdnItem | null> {
  const { data, error } = await supabase
    .from('edn_items')
    .select('code_item, title, description, speciality, oic_rang_a, oic_rang_b')
    .eq('code_item', itemCode)
    .single();

  if (error) {
    console.error(`Error fetching item ${itemCode}:`, error);
    return null;
  }

  return data as EdnItem;
}

/**
 * Generate questions using templates
 */
function generateTemplateQuestions(item: EdnItem, count: number = 10): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  // Template 1: Definition/Concept
  questions.push({
    question: `Quelle est la définition principale de ${item.title}?`,
    options: [
      item.description || 'Description non disponible',
      'Une alternative incorrecte',
      'Une autre alternative incorrecte',
      'Encore une alternative incorrecte'
    ],
    correct_answer_index: 0,
    explanation: `La définition correcte est tirée directement de la description de l'item EDN.`,
    difficulty: 'easy',
    tags: ['definition', item.speciality]
  });

  // Template 2: Diagnostic différentiel
  questions.push({
    question: `Dans le cadre de ${item.title}, quel est le diagnostic le plus probable?`,
    options: [
      'Diagnostic principal',
      'Diagnostic différentiel 1',
      'Diagnostic différentiel 2',
      'Diagnostic différentiel 3'
    ],
    correct_answer_index: 0,
    explanation: `Le diagnostic principal correspond à la présentation clinique type de ${item.title}.`,
    difficulty: 'medium',
    tags: ['diagnostic', item.speciality]
  });

  // Template 3: Traitement
  questions.push({
    question: `Quelle est la prise en charge initiale recommandée pour ${item.title}?`,
    options: [
      'Traitement de première ligne',
      'Traitement alternatif 1',
      'Traitement alternatif 2',
      'Traitement alternatif 3'
    ],
    correct_answer_index: 0,
    explanation: `Le traitement de première ligne est le plus approprié dans ce contexte.`,
    difficulty: 'medium',
    tags: ['traitement', item.speciality]
  });

  // Template 4: Examens complémentaires
  questions.push({
    question: `Quel examen complémentaire est le plus pertinent pour ${item.title}?`,
    options: [
      'Examen de référence',
      'Examen alternatif 1',
      'Examen alternatif 2',
      'Examen alternatif 3'
    ],
    correct_answer_index: 0,
    explanation: `L'examen de référence permet de confirmer le diagnostic.`,
    difficulty: 'medium',
    tags: ['paraclinique', item.speciality]
  });

  // Template 5: Complications
  questions.push({
    question: `Quelle est la complication la plus fréquente de ${item.title}?`,
    options: [
      'Complication principale',
      'Complication alternative 1',
      'Complication alternative 2',
      'Complication alternative 3'
    ],
    correct_answer_index: 0,
    explanation: `Cette complication est la plus fréquemment rapportée dans la littérature.`,
    difficulty: 'hard',
    tags: ['complications', item.speciality]
  });

  // Add more templates to reach count
  while (questions.length < count) {
    questions.push({
      question: `Question générique ${questions.length + 1} sur ${item.title}?`,
      options: [
        'Réponse correcte',
        'Réponse incorrecte 1',
        'Réponse incorrecte 2',
        'Réponse incorrecte 3'
      ],
      correct_answer_index: 0,
      explanation: `Explication pour cette question.`,
      difficulty: 'medium',
      tags: ['general', item.speciality]
    });
  }

  return questions;
}

/**
 * Generate questions using AI (OpenAI)
 */
async function generateAIQuestions(item: EdnItem, count: number = 10): Promise<QuizQuestion[]> {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `Tu es un expert médical créant des questions QCM pour préparer les étudiants en médecine.

Item EDN: ${item.code_item} - ${item.title}
Description: ${item.description}
Spécialité: ${item.speciality}

Génère ${count} questions QCM de qualité pour cet item. Chaque question doit:
- Être précise et cliniquement pertinente
- Avoir 4 options de réponse
- Avoir UNE seule réponse correcte
- Inclure une explication détaillée
- Couvrir différents aspects (diagnostic, traitement, paraclinique, complications)
- Varier en difficulté (facile, moyen, difficile)

Format JSON attendu:
[
  {
    "question": "Texte de la question",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correct_answer_index": 0,
    "explanation": "Explication détaillée",
    "difficulty": "medium",
    "tags": ["diagnostic", "${item.speciality}"]
  }
]`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'Tu es un expert médical créant des questions QCM de haute qualité.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsed = JSON.parse(content);
    const questions = parsed.questions || parsed;

    return Array.isArray(questions) ? questions : [questions];
  } catch (error) {
    console.error('Error generating AI questions:', error);
    return [];
  }
}

/**
 * Save questions to file
 */
function saveQuestions(itemCode: string, questions: QuizQuestion[], outputDir: string) {
  const fileName = `${itemCode}-quiz.json`;
  const filePath = path.join(outputDir, fileName);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf-8');

  console.log(`✅ Saved ${questions.length} questions to ${filePath}`);
}

/**
 * Main generation function
 */
async function generateQuiz(itemCode: string, mode: 'template' | 'ai', count: number = 10) {
  console.log('🧠 Quiz Generator');
  console.log(`📝 Item: ${itemCode}`);
  console.log(`🤖 Mode: ${mode.toUpperCase()}`);
  console.log(`🔢 Questions: ${count}\n`);

  // Fetch item
  console.log('📖 Fetching EDN item...');
  const item = await fetchEdnItem(itemCode);

  if (!item) {
    console.error(`❌ Item ${itemCode} not found`);
    process.exit(1);
  }

  console.log(`✓ Found: ${item.title}\n`);

  // Generate questions
  console.log(`🚀 Generating ${count} questions...`);
  let questions: QuizQuestion[];

  if (mode === 'ai') {
    questions = await generateAIQuestions(item, count);
  } else {
    questions = generateTemplateQuestions(item, count);
  }

  console.log(`✓ Generated ${questions.length} questions\n`);

  // Save to file
  const outputDir = './generated-quizzes';
  saveQuestions(itemCode, questions, outputDir);

  // Display preview
  console.log('\n📋 Preview (first question):');
  console.log('─'.repeat(60));
  if (questions.length > 0) {
    const q = questions[0];
    console.log(`Q: ${q.question}`);
    q.options.forEach((opt, idx) => {
      const marker = idx === q.correct_answer_index ? '✓' : ' ';
      console.log(`  [${marker}] ${idx + 1}. ${opt}`);
    });
    console.log(`\nExplication: ${q.explanation}`);
    console.log(`Difficulté: ${q.difficulty}`);
    console.log(`Tags: ${q.tags.join(', ')}`);
  }
  console.log('─'.repeat(60));

  if (mode === 'template') {
    console.log('\n⚠️  Note: Template-generated questions need manual review!');
    console.log('   Review and improve questions in:', outputDir);
  }
}

/**
 * Generate for all items
 */
async function generateForAllItems(mode: 'template' | 'ai', count: number = 10) {
  console.log('🔄 Generating quizzes for ALL items...\n');

  const { data: items, error } = await supabase
    .from('edn_items')
    .select('code_item')
    .order('code_item');

  if (error || !items) {
    console.error('Error fetching items:', error);
    process.exit(1);
  }

  console.log(`Found ${items.length} items\n`);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log(`\n[${i + 1}/${items.length}] Processing ${item.code_item}...`);

    try {
      await generateQuiz(item.code_item, mode, count);
    } catch (err) {
      console.error(`❌ Failed for ${item.code_item}:`, err);
    }

    // Rate limiting for AI mode
    if (mode === 'ai') {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
    }
  }

  console.log('\n✨ Batch generation complete!');
}

// CLI interface
const args = process.argv.slice(2);
const itemCode = args.find(arg => arg.startsWith('--item'))?.split('=')[1];
const mode = (args.find(arg => arg.startsWith('--mode'))?.split('=')[1] || 'template') as 'template' | 'ai';
const count = parseInt(args.find(arg => arg.startsWith('--count'))?.split('=')[1] || '10');
const all = args.includes('--all');

if (!all && !itemCode) {
  console.error('❌ Error: Missing required arguments');
  console.log('\nUsage:');
  console.log('  npm run generate-quiz -- --item=IC-1 --mode=template --count=10');
  console.log('  npm run generate-quiz -- --item=IC-1 --mode=ai');
  console.log('  npm run generate-quiz -- --all --mode=template');
  console.log('\nModes:');
  console.log('  template - Fast, template-based generation (needs manual review)');
  console.log('  ai       - AI-assisted generation (requires OpenAI API key)');
  process.exit(1);
}

// Run generator
if (all) {
  generateForAllItems(mode, count)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Generation failed:', err);
      process.exit(1);
    });
} else if (itemCode) {
  generateQuiz(itemCode, mode, count)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Generation failed:', err);
      process.exit(1);
    });
}
