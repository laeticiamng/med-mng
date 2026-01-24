import { describe, it, expect, beforeEach } from 'vitest';

// Mock des parseurs critiques (à adapter selon votre structure)
interface ParsedOICContent {
  objectifId: string;
  intitule: string;
  description: string;
  rang: 'A' | 'B';
  itemParent: string;
}

interface ParsedEDNContent {
  itemCode: string;
  title: string;
  tableauRangA: any;
  tableauRangB: any;
  quizQuestions: any[];
  parolesMusicales: string[];
}

// Simuler les parseurs (remplacer par vos vrais parseurs)
const parseOICContent = (rawContent: string): ParsedOICContent[] => {
  try {
    const parsed = JSON.parse(rawContent);
    return parsed.map((item: any) => ({
      objectifId: item.objectif_id || '',
      intitule: item.intitule || '',
      description: item.description || '',
      rang: item.rang || 'A',
      itemParent: item.item_parent || ''
    }));
  } catch (error) {
    throw new Error(`Erreur parsing OIC: ${error.message}`);
  }
};

const parseEDNContent = (rawContent: any): ParsedEDNContent => {
  if (!rawContent || typeof rawContent !== 'object') {
    throw new Error('Contenu EDN invalide');
  }

  return {
    itemCode: rawContent.item_code || '',
    title: rawContent.title || '',
    tableauRangA: rawContent.tableau_rang_a || {},
    tableauRangB: rawContent.tableau_rang_b || {},
    quizQuestions: rawContent.quiz_questions || [],
    parolesMusicales: rawContent.paroles_musicales || []
  };
};

const parseQuizQuestions = (rawQuestions: any[]): any[] => {
  if (!Array.isArray(rawQuestions)) {
    throw new Error('Quiz questions doit être un tableau');
  }

  return rawQuestions.map((q, index) => {
    if (!q.question || !q.options || !Array.isArray(q.options)) {
      throw new Error(`Question ${index} malformée`);
    }
    
    return {
      ...q, // Preserve additional metadata
      id: q.id || index,
      question: q.question,
      options: q.options,
      correct: typeof q.correct === 'number' ? q.correct : 0,
      explanation: q.explanation || ''
    };
  });
};

describe('🧪 Tests Parseurs Critiques - OIC Content', () => {
  describe('parseOICContent', () => {
    it('✅ doit parser un contenu OIC valide', () => {
      const validOICContent = JSON.stringify([
        {
          objectif_id: 'OBJ_001',
          intitule: 'Objectif médical 1',
          description: 'Description détaillée',
          rang: 'A',
          item_parent: 'IC-1'
        },
        {
          objectif_id: 'OBJ_002',
          intitule: 'Objectif médical 2',
          description: 'Autre description',
          rang: 'B',
          item_parent: 'IC-1'
        }
      ]);

      const result = parseOICContent(validOICContent);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        objectifId: 'OBJ_001',
        intitule: 'Objectif médical 1',
        description: 'Description détaillée',
        rang: 'A',
        itemParent: 'IC-1'
      });
      expect(result[1].rang).toBe('B');
    });

    it('❌ doit échouer avec JSON malformé', () => {
      const invalidJSON = '{ invalid json content }';
      
      expect(() => parseOICContent(invalidJSON)).toThrow('Erreur parsing OIC');
    });

    it('✅ doit gérer les champs manquants avec valeurs par défaut', () => {
      const partialContent = JSON.stringify([
        {
          objectif_id: 'OBJ_001'
          // Autres champs manquants
        }
      ]);

      const result = parseOICContent(partialContent);

      expect(result[0]).toEqual({
        objectifId: 'OBJ_001',
        intitule: '',
        description: '',
        rang: 'A',
        itemParent: ''
      });
    });

    it('🔄 doit traiter un tableau vide', () => {
      const emptyArray = JSON.stringify([]);
      
      const result = parseOICContent(emptyArray);
      
      expect(result).toEqual([]);
    });

    it('🧪 doit gérer les caractères spéciaux et UTF-8', () => {
      const unicodeContent = JSON.stringify([
        {
          objectif_id: 'OBJ_001',
          intitule: 'Médecine générale - Thérapie α-β',
          description: 'Étude des caractères spéciaux: àéïòù & 中文',
          rang: 'A',
          item_parent: 'IC-1'
        }
      ]);

      const result = parseOICContent(unicodeContent);
      
      expect(result[0].intitule).toBe('Médecine générale - Thérapie α-β');
      expect(result[0].description).toContain('中文');
    });
  });
});

describe('🧪 Tests Parseurs Critiques - EDN Content', () => {
  describe('parseEDNContent', () => {
    const validEDNItem = {
      item_code: 'IC-1',
      title: 'Relation médecin-malade',
      tableau_rang_a: {
        title: 'Rang A',
        sections: [
          { title: 'Section 1', content: 'Contenu rang A' }
        ]
      },
      tableau_rang_b: {
        title: 'Rang B',
        sections: [
          { title: 'Section 1', content: 'Contenu rang B' }
        ]
      },
      quiz_questions: [
        {
          id: 1,
          question: 'Question test?',
          options: ['A', 'B', 'C', 'D'],
          correct: 0,
          explanation: 'Explication'
        }
      ],
      paroles_musicales: [
        'Première ligne de chanson',
        'Deuxième ligne de chanson'
      ]
    };

    it('✅ doit parser un item EDN complet', () => {
      const result = parseEDNContent(validEDNItem);

      expect(result.itemCode).toBe('IC-1');
      expect(result.title).toBe('Relation médecin-malade');
      expect(result.tableauRangA).toHaveProperty('title', 'Rang A');
      expect(result.tableauRangB).toHaveProperty('title', 'Rang B');
      expect(result.quizQuestions).toHaveLength(1);
      expect(result.parolesMusicales).toHaveLength(2);
    });

    it('❌ doit échouer avec contenu null/undefined', () => {
      expect(() => parseEDNContent(null)).toThrow('Contenu EDN invalide');
      expect(() => parseEDNContent(undefined)).toThrow('Contenu EDN invalide');
    });

    it('✅ doit gérer un item avec champs manquants', () => {
      const minimalItem = {
        item_code: 'IC-2'
        // Autres champs manquants
      };

      const result = parseEDNContent(minimalItem);

      expect(result.itemCode).toBe('IC-2');
      expect(result.title).toBe('');
      expect(result.tableauRangA).toEqual({});
      expect(result.quizQuestions).toEqual([]);
      expect(result.parolesMusicales).toEqual([]);
    });

    it('🔄 doit préserver la structure des tableaux rang A/B', () => {
      const complexItem = {
        ...validEDNItem,
        tableau_rang_a: {
          title: 'Rang A Complexe',
          sections: [
            { title: 'Concepts', content: 'Contenu concepts', keywords: ['mot1', 'mot2'] },
            { title: 'Applications', content: 'Contenu applications', examples: ['ex1', 'ex2'] }
          ]
        }
      };

      const result = parseEDNContent(complexItem);

      expect(result.tableauRangA.sections).toHaveLength(2);
      expect(result.tableauRangA.sections[0]).toHaveProperty('keywords');
      expect(result.tableauRangA.sections[1]).toHaveProperty('examples');
    });
  });
});

describe('🧪 Tests Parseurs Critiques - Quiz Questions', () => {
  describe('parseQuizQuestions', () => {
    const validQuestions = [
      {
        id: 1,
        question: 'Quelle est la réponse?',
        options: ['Option A', 'Option B', 'Option C'],
        correct: 1,
        explanation: 'Explication détaillée'
      },
      {
        question: 'Question sans ID?',
        options: ['Oui', 'Non'],
        correct: 0
      }
    ];

    it('✅ doit parser des questions valides', () => {
      const result = parseQuizQuestions(validQuestions);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(1); // Index utilisé comme ID
      expect(result[0].explanation).toBe('Explication détaillée');
      expect(result[1].explanation).toBe(''); // Valeur par défaut
    });

    it('❌ doit échouer si ce n\'est pas un tableau', () => {
      expect(() => parseQuizQuestions('not an array' as any)).toThrow('Quiz questions doit être un tableau');
      expect(() => parseQuizQuestions({} as any)).toThrow('Quiz questions doit être un tableau');
    });

    it('❌ doit échouer avec question malformée', () => {
      const malformedQuestions = [
        {
          // question manquante
          options: ['A', 'B'],
          correct: 0
        }
      ];

      expect(() => parseQuizQuestions(malformedQuestions)).toThrow('Question 0 malformée');
    });

    it('❌ doit échouer sans options', () => {
      const questionsWithoutOptions = [
        {
          question: 'Question sans options?',
          correct: 0
        }
      ];

      expect(() => parseQuizQuestions(questionsWithoutOptions)).toThrow('Question 0 malformée');
    });

    it('✅ doit gérer un tableau vide', () => {
      const result = parseQuizQuestions([]);
      expect(result).toEqual([]);
    });

    it('🔄 doit normaliser les réponses correctes', () => {
      const questionsWithBadCorrect = [
        {
          question: 'Test?',
          options: ['A', 'B'],
          correct: 'invalid' // Type incorrect
        },
        {
          question: 'Test 2?',
          options: ['A', 'B']
          // correct manquant
        }
      ];

      const result = parseQuizQuestions(questionsWithBadCorrect);

      expect(result[0].correct).toBe(0); // Normalisé
      expect(result[1].correct).toBe(0); // Valeur par défaut
    });

    it('🧪 doit préserver les métadonnées additionnelles', () => {
      const questionsWithMeta = [
        {
          question: 'Question avec métadonnées?',
          options: ['A', 'B'],
          correct: 1,
          explanation: 'Explication',
          difficulty: 'hard',
          category: 'medical',
          tags: ['cardio', 'urgence']
        }
      ];

      const result = parseQuizQuestions(questionsWithMeta);

      // Using spread operator, metadata should be preserved
      expect(result[0].difficulty).toBe('hard');
      expect(result[0].category).toBe('medical');
      expect(result[0].tags).toBeDefined();
    });
  });
});

describe('🧪 Tests d\'intégration - Parsing combiné', () => {
  it('🔄 doit traiter un workflow complet EDN + OIC', () => {
    const rawOIC = JSON.stringify([
      {
        objectif_id: 'OBJ_001',
        intitule: 'Communication thérapeutique',
        rang: 'A',
        item_parent: 'IC-1'
      }
    ]);

    const rawEDN = {
      item_code: 'IC-1',
      title: 'Relation médecin-malade',
      quiz_questions: [
        {
          question: 'Objectif principal?',
          options: ['Communication', 'Diagnostic'],
          correct: 0
        }
      ]
    };

    // Parsing combiné
    const oicData = parseOICContent(rawOIC);
    const ednData = parseEDNContent(rawEDN);
    const quizData = parseQuizQuestions(ednData.quizQuestions);

    // Vérifications croisées
    expect(oicData[0].itemParent).toBe(ednData.itemCode);
    expect(quizData[0].options).toContain('Communication');
    expect(oicData[0].intitule).toContain('Communication');
  });

  it('🚨 doit gérer les erreurs en cascade', () => {
    const invalidWorkflow = () => {
      const badOIC = '{ invalid json }';
      const badEDN = null;
      
      parseOICContent(badOIC); // Doit échouer ici
      parseEDNContent(badEDN); // Ne devrait pas être atteint
    };

    expect(invalidWorkflow).toThrow();
  });
});