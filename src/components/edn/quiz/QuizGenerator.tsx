import { QuizConfig } from './QuizSelector';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  rang: 'A' | 'B';
  difficulty: 'easy' | 'medium' | 'hard';
  commonErrors: string[];
  tags: string[];
}

interface TableauSection {
  concepts?: Array<{ concept?: string; definition?: string }>;
}

interface TableauRangData {
  sections?: TableauSection[];
}

interface EdnItem {
  item_code: string;
  title: string;
  tableau_rang_a?: TableauRangData;
  tableau_rang_b?: TableauRangData;
}

interface QuestionTemplate {
  id: string;
  rang: string;
  difficulty: string[];
  template: string;
  type: string;
  distractors: string[];
}

export class QuizGenerator {
  static generateQuestions(item: EdnItem, config: QuizConfig): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    const questionTemplates = this.getQuestionTemplates();
    
    // Générer des questions selon la configuration
    for (let i = 0; i < config.numberOfQuestions; i++) {
      const question = this.createQuestion(item, config, i + 1, questionTemplates);
      if (question) {
        questions.push(question);
      }
    }
    
    return questions;
  }

  private static createQuestion(
    item: EdnItem, 
    config: QuizConfig, 
    questionId: number,
    templates: QuestionTemplate[]
  ): QuizQuestion | null {
    // Déterminer le rang de la question de manière déterministe
    let rang: 'A' | 'B';
    if (config.questionType === 'rang-a') {
      rang = 'A';
    } else if (config.questionType === 'rang-b') {
      rang = 'B';
    } else {
      // Alternance déterministe basée sur l'ID de la question: 60% rang A, 40% rang B
      rang = (questionId % 5) < 3 ? 'A' : 'B';
    }

    // Sélectionner un template selon la difficulté
    const template = this.selectTemplate(templates, config.difficulty, rang);
    if (!template) return null;

    // Créer la question basée sur le contenu de l'item
    const questionData = this.buildQuestionFromTemplate(item, template, rang, config.difficulty);
    
    return {
      id: questionId,
      question: questionData.question,
      options: questionData.options,
      correctAnswer: questionData.correctAnswer,
      explanation: questionData.explanation,
      rang,
      difficulty: config.difficulty,
      commonErrors: questionData.commonErrors,
      tags: [item.item_code, rang, config.difficulty]
    };
  }

  private static getQuestionTemplates() {
    return [
      // Templates Rang A - Fondamentaux
      {
        id: 'basic-definition',
        rang: 'A',
        difficulty: ['easy', 'medium'],
        template: "Concernant {topic}, quelle est la définition la plus appropriée ?",
        type: 'definition',
        distractors: ['definition_variant', 'related_concept', 'opposite_concept']
      },
      {
        id: 'basic-symptom',
        rang: 'A',
        difficulty: ['easy', 'medium'],
        template: "Quel est le symptôme le plus caractéristique de {topic} ?",
        type: 'clinical_sign',
        distractors: ['similar_symptom', 'related_pathology', 'differential_diagnosis']
      },
      {
        id: 'first-line-treatment',
        rang: 'A',
        difficulty: ['medium'],
        template: "Quel est le traitement de première intention pour {topic} ?",
        type: 'treatment',
        distractors: ['second_line', 'contraindicated', 'specialty_specific']
      },
      
      // Templates Rang B - Approfondis
      {
        id: 'complex-case',
        rang: 'B',
        difficulty: ['medium', 'hard'],
        template: "Dans un cas complexe de {topic} avec comorbidités, quelle est la conduite à tenir prioritaire ?",
        type: 'clinical_reasoning',
        distractors: ['standard_approach', 'incomplete_workup', 'overtreament']
      },
      {
        id: 'differential-diagnosis',
        rang: 'B',
        difficulty: ['medium', 'hard'],
        template: "Face à un tableau clinique évocateur de {topic}, quel élément permet d'éliminer le principal diagnostic différentiel ?",
        type: 'diagnosis',
        distractors: ['confounding_factor', 'non_specific_sign', 'rare_variant']
      },
      {
        id: 'complication',
        rang: 'B',
        difficulty: ['hard'],
        template: "Quelle est la complication la plus redoutable de {topic} à surveiller en priorité ?",
        type: 'complication',
        distractors: ['frequent_mild', 'manageable_complication', 'late_sequela']
      }
    ];
  }

  private static selectTemplate(templates: QuestionTemplate[], difficulty: string, rang: 'A' | 'B', seed: number = 0) {
    const availableTemplates = templates.filter(t => 
      t.rang === rang && t.difficulty.includes(difficulty)
    );
    
    if (availableTemplates.length === 0) {
      // Fallback sur tous les templates du rang approprié
      return templates.find(t => t.rang === rang);
    }
    
    // Deterministic selection based on seed (e.g., item index)
    const index = seed % availableTemplates.length;
    return availableTemplates[index] || availableTemplates[0];
  }

  private static buildQuestionFromTemplate(
    item: EdnItem, 
    template: QuestionTemplate, 
    rang: 'A' | 'B',
    difficulty: string
  ) {
    const topicTitle = item.title;
    const itemCode = item.item_code;
    
    // Construire la question
    const question = template.template.replace('{topic}', topicTitle);
    
    // Générer les options selon le type de question
    const { options, correctAnswer } = this.generateOptions(item, template, rang, difficulty);
    
    // Créer l'explication
    const explanation = this.generateExplanation(item, template, rang, correctAnswer, options);
    
    // Générer les erreurs fréquentes
    const commonErrors = this.generateCommonErrors(item, template, difficulty);
    
    return {
      question,
      options,
      correctAnswer,
      explanation,
      commonErrors
    };
  }

  private static generateOptions(_item: EdnItem, template: QuestionTemplate, _rang: 'A' | 'B', difficulty: string) {
    const topic = _item.title;
    
    // Options correctes selon le type de template
    const correctAnswers = {
      'definition': `Définition exacte de ${topic} selon les référentiels`,
      'clinical_sign': `Signe pathognomonique principal de ${topic}`,
      'treatment': `Traitement de référence validé pour ${topic}`,
      'clinical_reasoning': `Approche optimale selon les recommandations`,
      'diagnosis': `Critère diagnostique différentiel majeur`,
      'complication': `Complication grave nécessitant surveillance rapprochée`
    };

    // Distracteurs selon le niveau de difficulté
    const generateDistractors = (type: string, difficulty: string) => {
      const baseDistractors = {
        'definition': [
          `Définition incomplète de ${topic}`,
          `Confusion avec pathologie similaire`,
          `Définition obsolète ou erronée`
        ],
        'clinical_sign': [
          `Signe non spécifique fréquent`,
          `Symptôme d'une pathologie différentielle`,
          `Signe tardif ou rare`
        ],
        'treatment': [
          `Traitement de deuxième intention`,
          `Approche thérapeutique non validée`,
          `Traitement symptomatique seulement`
        ],
        'clinical_reasoning': [
          `Approche standard sans adaptation`,
          `Prise en charge incomplète`,
          `Sur-traitement inadapté`
        ],
        'diagnosis': [
          `Élément confondant non discriminant`,
          `Signe aspécifique`,
          `Variante rare peu probable`
        ],
        'complication': [
          `Complication fréquente mais bénigne`,
          `Effet indésirable gérable`,
          `Séquelle tardive improbable`
        ]
      };

      let distractors = baseDistractors[type] || baseDistractors['definition'];
      
      // Rendre plus difficile selon le niveau
      if (difficulty === 'hard') {
        distractors = distractors.map(d => d.replace('incomplète', 'subtile'));
        distractors = distractors.map(d => d.replace('erronée', 'avec piège classique'));
      }
      
      return distractors;
    };

    const correctAnswer = correctAnswers[template.type] || correctAnswers['definition'];
    const distractors = generateDistractors(template.type, difficulty);
    
    // Mélanger les options
    const options = [correctAnswer, ...distractors];
    const shuffledOptions = this.shuffleArray([...options]);
    const correctIndex = shuffledOptions.indexOf(correctAnswer);
    
    return {
      options: shuffledOptions,
      correctAnswer: correctIndex
    };
  }

  private static generateExplanation(
    item: EdnItem, 
    _template: QuestionTemplate, 
    rang: 'A' | 'B',
    correctAnswer: number,
    options: string[]
  ) {
    const topic = item.title;
    const itemCode = item.item_code;
    
    const explanationTemplates = {
      'A': `Pour ${topic} (${itemCode}), la réponse correcte "${options[correctAnswer]}" correspond aux connaissances fondamentales requises. Cette approche est validée par les référentiels officiels.`,
      'B': `Dans le contexte expert de ${topic} (${itemCode}), "${options[correctAnswer]}" représente la conduite optimale. Cette approche nécessite une analyse approfondie des facteurs cliniques spécifiques.`
    };
    
    return explanationTemplates[rang];
  }

  private static generateCommonErrors(item: EdnItem, _template: QuestionTemplate, difficulty: string) {
    const topic = item.title;
    
    const baseErrors = [
      `Confusion avec les signes d'une pathologie proche`,
      `Oubli des contre-indications spécifiques`,
      `Sous-estimation de la gravité potentielle`,
      `Application de protocoles inadaptés au contexte`
    ];
    
    if (difficulty === 'hard') {
      return [
        ...baseErrors,
        `Pièges liés aux formes atypiques de ${topic}`,
        `Interactions médicamenteuses complexes à considérer`,
        `Facteurs pronostiques subtils souvent négligés`
      ];
    }
    
    return baseErrors.slice(0, 2);
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}